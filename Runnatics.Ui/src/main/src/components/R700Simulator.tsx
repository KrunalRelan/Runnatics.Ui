import { useState, useCallback, useRef, useEffect, ChangeEvent } from "react";

// ── TYPES ──

interface SimulatedDevice {
  hostname: string;
  mac: string;
  name: string;
  checkpointName: string;
}

interface SimulatedRunner {
  bib: string;
  name: string;
  epc: string;
  paceMin: number;
  paceMax: number;
}

interface SimCheckpoint {
  index: number;
  distance: number;
  name: string;
}

interface TagEvent {
  epc: string;
  timestamp: string;
  antenna: number;
  rssiCdbm: number;
}

interface CrossingEvent extends TagEvent {
  deviceIdx: number;
  checkpoint: string;
  bib: string;
  runnerName: string;
}

interface LogEntry {
  id: number;
  realTime: string;
  type: "webhook" | "system";
  simTime: string;
  // webhook fields
  device?: string;
  hostname?: string;
  eventCount?: number;
  epcs?: string[];
  runners?: string[];
  status?: "success" | "error";
  httpStatus?: number;
  error?: string;
  // system fields
  message?: string;
}

interface SimStats {
  sent: number;
  failed: number;
  lastError: string | null;
}

interface RunnerProgress {
  distance: string;
  checkpoint: number;
  finished: boolean;
  pace?: string;
}

interface RunnerState extends SimulatedRunner {
  pace: number;
  distance: number;
  nextCheckpoint: number;
  finished: boolean;
  crossings: number[];
}

type SimMode = "auto" | "manual" | "burst";

// ── SIMULATED RACE DATA ──

const SIMULATED_DEVICES: SimulatedDevice[] = [
  { hostname: "impinj-12-db-b0", mac: "00:16:25:12:db:b0", name: "Start/Finish Line", checkpointName: "Start/Finish" },
  { hostname: "impinj-13-5f-24", mac: "00:16:25:13:5f:24", name: "5km Checkpoint", checkpointName: "5km" },
  { hostname: "impinj-13-5f-25", mac: "00:16:25:13:5f:25", name: "10km Turnaround", checkpointName: "10km" },
];

const SIMULATED_RUNNERS: SimulatedRunner[] = [
  { bib: "001", name: "Arun Sharma",     epc: "418000A95101", paceMin: 4.5, paceMax: 5.2 },
  { bib: "002", name: "Priya Kaur",      epc: "418000A95102", paceMin: 5.0, paceMax: 5.8 },
  { bib: "003", name: "Vikram Singh",    epc: "418000A95103", paceMin: 4.8, paceMax: 5.5 },
  { bib: "004", name: "Meera Patel",     epc: "418000A95104", paceMin: 5.5, paceMax: 6.3 },
  { bib: "005", name: "Rajesh Kumar",    epc: "418000A95105", paceMin: 5.2, paceMax: 6.0 },
  { bib: "006", name: "Anita Devi",      epc: "418000A95106", paceMin: 6.0, paceMax: 7.0 },
  { bib: "007", name: "Sunil Verma",     epc: "418000A95107", paceMin: 4.2, paceMax: 4.8 },
  { bib: "008", name: "Neha Gupta",      epc: "418000A95108", paceMin: 5.8, paceMax: 6.5 },
  { bib: "042", name: "Harpreet Dhillon",epc: "418000A95119", paceMin: 5.0, paceMax: 5.6 },
  { bib: "099", name: "Deepak Malhotra", epc: "418000A95199", paceMin: 4.0, paceMax: 4.5 },
];

const CHECKPOINTS: SimCheckpoint[] = [
  { index: 0, distance: 0,    name: "Start" },
  { index: 1, distance: 5,    name: "5km" },
  { index: 2, distance: 10,   name: "10km Turnaround" },
  { index: 3, distance: 15,   name: "15km (5km return)" },
  { index: 4, distance: 21.1, name: "Finish" },
];

// Which device covers which checkpoint(s) — simulates loop course
const DEVICE_CHECKPOINT_MAP: Record<number, number[]> = {
  0: [0, 4], // Start/Finish device covers Start AND Finish (loop!)
  1: [1, 3], // 5km device covers 5km outbound AND 15km return
  2: [2],    // 10km turnaround is unique
};

const generateRSSI = (): number => -(Math.floor(Math.random() * 20) + 55);
const generateAntenna = (): number => Math.floor(Math.random() * 3) + 1;

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ── COMPONENT ──

export default function R700Simulator() {
  const [webhookUrl, setWebhookUrl] = useState<string>(
    `${window.location.origin}/api/rfid/webhook`
  );
  const [raceStarted, setRaceStarted] = useState<boolean>(false);
  const [, setRaceStartTime] = useState<Date | null>(null);
  const [eventLog, setEventLog] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<SimStats>({ sent: 0, failed: 0, lastError: null });
  const [simulationSpeed, setSimulationSpeed] = useState<number>(10);
  const [mode, setMode] = useState<SimMode>("auto");
  const [selectedDevice, setSelectedDevice] = useState<number>(0);
  const [selectedRunner, setSelectedRunner] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [runnerProgress, setRunnerProgress] = useState<Record<string, RunnerProgress>>({});
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const raceTimeRef = useRef<number>(0);
  const logEndRef = useRef<HTMLDivElement | null>(null);

  const addLog = useCallback((entry: Omit<LogEntry, "id" | "realTime">) => {
    setEventLog(prev => [
      ...prev.slice(-200),
      { ...entry, id: Date.now() + Math.random(), realTime: new Date().toLocaleTimeString() } as LogEntry,
    ]);
  }, []);

  // ── SEND WEBHOOK ──
  const sendWebhook = useCallback(async (device: SimulatedDevice, tagEvents: TagEvent[]) => {
    const payload = {
      hostname: device.hostname,
      macAddress: device.mac,
      tag_inventory_events: tagEvents.map(evt => ({
        epc: evt.epc,
        firstSeenTimestamp: evt.timestamp,
        lastSeenTimestamp: evt.timestamp,
        antennaPort: evt.antenna,
        peakRssiCdbm: evt.rssiCdbm,
        channel: Math.floor(Math.random() * 50) + 1,
        tagSeenCount: 1,
      })),
    };

    const logEntry: Partial<LogEntry> = {
      type: "webhook",
      device: device.checkpointName,
      hostname: device.hostname,
      eventCount: tagEvents.length,
      epcs: tagEvents.map(e => e.epc),
      runners: tagEvents.map(e => {
        const r = SIMULATED_RUNNERS.find(r => r.epc === e.epc);
        return r ? `#${r.bib} ${r.name}` : e.epc;
      }),
      simTime: formatTime(raceTimeRef.current),
    };

    try {
      const token = localStorage.getItem('authToken');
      const resp = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (resp.ok) {
        logEntry.status = "success";
        logEntry.httpStatus = resp.status;
        setStats(prev => ({ ...prev, sent: prev.sent + tagEvents.length }));
      } else {
        logEntry.status = "error";
        logEntry.httpStatus = resp.status;
        logEntry.error = await resp.text().catch(() => "No body");
        setStats(prev => ({ ...prev, failed: prev.failed + tagEvents.length, lastError: `HTTP ${resp.status}` }));
      }
    } catch (err: unknown) {
      logEntry.status = "error";
      logEntry.error = err instanceof Error ? err.message : String(err);
      setStats(prev => ({
        ...prev,
        failed: prev.failed + tagEvents.length,
        lastError: logEntry.error ?? "Unknown error",
      }));
    }

    addLog(logEntry as Omit<LogEntry, "id" | "realTime">);
  }, [webhookUrl, addLog]);

  // ── AUTOMATIC SIMULATION ──
  const simulateRace = useCallback(() => {
    const TICK_INTERVAL_MS = 1000;
    const SECONDS_PER_TICK = simulationSpeed;

    if (intervalRef.current) clearInterval(intervalRef.current);

    const startTime = new Date();
    raceTimeRef.current = 0;

    const runners: RunnerState[] = SIMULATED_RUNNERS.map(r => ({
      ...r,
      pace: r.paceMin + Math.random() * (r.paceMax - r.paceMin),
      distance: -0.001, // small negative so the Start crossing (distance=0) triggers on tick 1
      nextCheckpoint: 0,
      finished: false,
      crossings: [],
    }));

    setRunnerProgress(
      Object.fromEntries(runners.map(r => [r.epc, { distance: "0", checkpoint: 0, finished: false }]))
    );

    intervalRef.current = setInterval(() => {
      if (isPaused) return;

      raceTimeRef.current += SECONDS_PER_TICK;
      const elapsedMin = raceTimeRef.current / 60;

      const crossingsThisTick: CrossingEvent[] = [];

      runners.forEach(runner => {
        if (runner.finished) return;

        const newDistance = elapsedMin / runner.pace;
        const prevDistance = runner.distance;
        runner.distance = newDistance;

        while (runner.nextCheckpoint < CHECKPOINTS.length) {
          const cp = CHECKPOINTS[runner.nextCheckpoint];
          if (newDistance >= cp.distance && prevDistance < cp.distance) {
            const crossingTime = new Date(startTime.getTime() + raceTimeRef.current * 1000);

            for (const [deviceIdx, cpIndices] of Object.entries(DEVICE_CHECKPOINT_MAP)) {
              if (cpIndices.includes(runner.nextCheckpoint)) {
                const numReads = Math.floor(Math.random() * 3) + 2;
                for (let i = 0; i < numReads; i++) {
                  const offsetMs = i * (Math.floor(Math.random() * 500) + 100);
                  const readTime = new Date(crossingTime.getTime() + offsetMs);

                  crossingsThisTick.push({
                    deviceIdx: parseInt(deviceIdx),
                    epc: runner.epc,
                    timestamp: readTime.toISOString(),
                    antenna: generateAntenna(),
                    rssiCdbm: generateRSSI() * 100,
                    checkpoint: cp.name,
                    bib: runner.bib,
                    runnerName: runner.name,
                  });
                }
                break;
              }
            }

            runner.crossings.push(runner.nextCheckpoint);
            runner.nextCheckpoint++;

            if (runner.nextCheckpoint >= CHECKPOINTS.length) {
              runner.finished = true;
            }
          } else {
            break;
          }
        }
      });

      setRunnerProgress(
        Object.fromEntries(
          runners.map(r => [
            r.epc,
            {
              distance: Math.min(r.distance, 21.1).toFixed(1),
              checkpoint: r.nextCheckpoint,
              finished: r.finished,
              pace: r.pace.toFixed(1),
            },
          ])
        )
      );

      if (crossingsThisTick.length > 0) {
        const byDevice: Record<number, CrossingEvent[]> = {};
        crossingsThisTick.forEach(c => {
          if (!byDevice[c.deviceIdx]) byDevice[c.deviceIdx] = [];
          byDevice[c.deviceIdx].push(c);
        });

        Object.entries(byDevice).forEach(([deviceIdx, events]) => {
          void sendWebhook(SIMULATED_DEVICES[parseInt(deviceIdx)], events);
        });
      }

      if (runners.every(r => r.finished)) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        addLog({ type: "system", message: "All runners finished!", simTime: formatTime(raceTimeRef.current) });
      }
    }, TICK_INTERVAL_MS);
  }, [simulationSpeed, sendWebhook, addLog, isPaused]);

  // ── MANUAL SINGLE EVENT ──
  const sendManualEvent = useCallback(() => {
    const device = SIMULATED_DEVICES[selectedDevice];
    const runner = SIMULATED_RUNNERS[selectedRunner];
    const now = new Date();

    void sendWebhook(device, [{
      epc: runner.epc,
      timestamp: now.toISOString(),
      antenna: generateAntenna(),
      rssiCdbm: generateRSSI() * 100,
    }]);
  }, [selectedDevice, selectedRunner, sendWebhook]);

  // ── BURST MODE ──
  const sendBurst = useCallback((count: number) => {
    const device = SIMULATED_DEVICES[selectedDevice];
    const now = new Date();

    const events: TagEvent[] = [];
    for (let i = 0; i < count; i++) {
      const runner = SIMULATED_RUNNERS[i % SIMULATED_RUNNERS.length];
      const offsetMs = i * (Math.floor(Math.random() * 200) + 50);
      events.push({
        epc: runner.epc,
        timestamp: new Date(now.getTime() + offsetMs).toISOString(),
        antenna: generateAntenna(),
        rssiCdbm: generateRSSI() * 100,
      });
    }

    void sendWebhook(device, events);
  }, [selectedDevice, sendWebhook]);

  // ── START / STOP ──
  const handleStart = (): void => {
    setRaceStarted(true);
    setRaceStartTime(new Date());
    setEventLog([]);
    setStats({ sent: 0, failed: 0, lastError: null });
    addLog({ type: "system", message: `Race simulation started at ${simulationSpeed}x speed`, simTime: "00:00" });

    if (mode === "auto") {
      simulateRace();
    }
  };

  const handleStop = (): void => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRaceStarted(false);
    addLog({ type: "system", message: "Simulation stopped", simTime: formatTime(raceTimeRef.current) });
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [eventLog]);

  // ── RENDER ──
  return (
    <div style={{ background: "#0a0e17", minHeight: "100vh", color: "#e0e6ed", fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0f1724 0%, #162033 100%)", borderBottom: "1px solid #1e2d44", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: raceStarted ? "#22c55e" : "#64748b", boxShadow: raceStarted ? "0 0 8px #22c55e" : "none", animation: raceStarted ? "pulse 2s infinite" : "none" }} />
          <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: 1.5, color: "#60a5fa" }}>R700 WEBHOOK SIMULATOR</span>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center", fontSize: 12 }}>
          <span style={{ color: "#64748b" }}>Sim Time:</span>
          <span style={{ color: "#f59e0b", fontWeight: 700, fontSize: 16 }}>{formatTime(raceTimeRef.current)}</span>
          <span style={{ color: "#22c55e" }}>TX: {stats.sent}</span>
          {stats.failed > 0 && <span style={{ color: "#ef4444" }}>ERR: {stats.failed}</span>}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 0, height: "calc(100vh - 56px)" }}>
        {/* Left Panel: Controls */}
        <div style={{ background: "#0d1220", borderRight: "1px solid #1e2d44", padding: "20px", overflowY: "auto" }}>
          {/* Webhook URL */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: 2, marginBottom: 6 }}>Webhook Endpoint</label>
            <input
              value={webhookUrl}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setWebhookUrl(e.target.value)}
              disabled={raceStarted}
              style={{ width: "100%", padding: "8px 10px", background: "#111827", border: "1px solid #1e2d44", borderRadius: 4, color: "#e0e6ed", fontFamily: "inherit", fontSize: 11, outline: "none", boxSizing: "border-box" }}
            />
          </div>

          {/* Mode Selector */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: 2, marginBottom: 6 }}>Simulation Mode</label>
            <div style={{ display: "flex", gap: 4 }}>
              {([["auto", "Auto Race"], ["manual", "Manual"], ["burst", "Burst"]] as const).map(([val, label]) => (
                <button key={val} onClick={() => setMode(val)} disabled={raceStarted}
                  style={{ flex: 1, padding: "6px 0", borderRadius: 4, border: "1px solid " + (mode === val ? "#3b82f6" : "#1e2d44"), background: mode === val ? "#1e3a5f" : "#111827", color: mode === val ? "#60a5fa" : "#64748b", cursor: raceStarted ? "not-allowed" : "pointer", fontSize: 11, fontFamily: "inherit" }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Speed (auto mode) */}
          {mode === "auto" && (
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: 2, marginBottom: 6 }}>Speed: {simulationSpeed}x realtime</label>
              <input type="range" min={1} max={60} value={simulationSpeed}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSimulationSpeed(parseInt(e.target.value))}
                disabled={raceStarted}
                style={{ width: "100%", accentColor: "#3b82f6" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#475569" }}>
                <span>1x (realtime)</span><span>60x (1 min/sec)</span>
              </div>
            </div>
          )}

          {/* Manual/Burst Controls */}
          {(mode === "manual" || mode === "burst") && (
            <>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: 2, marginBottom: 6 }}>Device</label>
                <select value={selectedDevice}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedDevice(parseInt(e.target.value))}
                  style={{ width: "100%", padding: "6px 8px", background: "#111827", border: "1px solid #1e2d44", borderRadius: 4, color: "#e0e6ed", fontFamily: "inherit", fontSize: 11 }}>
                  {SIMULATED_DEVICES.map((d, i) => (
                    <option key={i} value={i}>{d.checkpointName} ({d.hostname})</option>
                  ))}
                </select>
              </div>
              {mode === "manual" && (
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: "block", fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: 2, marginBottom: 6 }}>Runner</label>
                  <select value={selectedRunner}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedRunner(parseInt(e.target.value))}
                    style={{ width: "100%", padding: "6px 8px", background: "#111827", border: "1px solid #1e2d44", borderRadius: 4, color: "#e0e6ed", fontFamily: "inherit", fontSize: 11 }}>
                    {SIMULATED_RUNNERS.map((r, i) => (
                      <option key={i} value={i}>#{r.bib} {r.name} ({r.epc})</option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}

          {/* Action Buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            {!raceStarted ? (
              <button onClick={handleStart}
                style={{ padding: "10px 0", borderRadius: 6, border: "none", background: "linear-gradient(135deg, #16a34a, #15803d)", color: "#fff", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700, letterSpacing: 1 }}>
                ▶ START SIMULATION
              </button>
            ) : (
              <>
                {mode === "auto" && (
                  <button onClick={() => setIsPaused(prev => !prev)}
                    style={{ padding: "8px 0", borderRadius: 6, border: "1px solid #f59e0b", background: "transparent", color: "#f59e0b", cursor: "pointer", fontFamily: "inherit", fontSize: 12 }}>
                    {isPaused ? "▶ RESUME" : "⏸ PAUSE"}
                  </button>
                )}
                {mode === "manual" && (
                  <button onClick={sendManualEvent}
                    style={{ padding: "8px 0", borderRadius: 6, border: "none", background: "#2563eb", color: "#fff", cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 600 }}>
                    SEND TAG EVENT
                  </button>
                )}
                {mode === "burst" && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    {[5, 10, 25, 50].map(n => (
                      <button key={n} onClick={() => sendBurst(n)}
                        style={{ padding: "8px 0", borderRadius: 4, border: "1px solid #3b82f6", background: "#111827", color: "#60a5fa", cursor: "pointer", fontFamily: "inherit", fontSize: 11 }}>
                        {n} events
                      </button>
                    ))}
                  </div>
                )}
                <button onClick={handleStop}
                  style={{ padding: "8px 0", borderRadius: 6, border: "none", background: "#dc2626", color: "#fff", cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 600 }}>
                  ■ STOP
                </button>
              </>
            )}
          </div>

          {/* Runner Progress (auto mode) */}
          {mode === "auto" && raceStarted && Object.keys(runnerProgress).length > 0 && (
            <div>
              <label style={{ display: "block", fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>Runner Progress</label>
              {SIMULATED_RUNNERS.map(r => {
                const prog = runnerProgress[r.epc];
                if (!prog) return null;
                const pct = Math.min((parseFloat(prog.distance) / 21.1) * 100, 100);
                return (
                  <div key={r.epc} style={{ marginBottom: 6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 2 }}>
                      <span style={{ color: prog.finished ? "#22c55e" : "#94a3b8" }}>#{r.bib} {r.name.split(" ")[0]}</span>
                      <span style={{ color: "#64748b" }}>{prog.distance}km {prog.finished ? "✓" : ""}</span>
                    </div>
                    <div style={{ height: 3, background: "#1e2d44", borderRadius: 2 }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: prog.finished ? "#22c55e" : "#3b82f6", borderRadius: 2, transition: "width 0.5s" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Devices */}
          <div style={{ marginTop: 20 }}>
            <label style={{ display: "block", fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>Simulated Devices</label>
            {SIMULATED_DEVICES.map((d, i) => (
              <div key={i} style={{ padding: "8px 10px", background: "#111827", borderRadius: 4, marginBottom: 4, border: "1px solid #1e2d44", fontSize: 11 }}>
                <div style={{ color: "#94a3b8", fontWeight: 600 }}>{d.checkpointName}</div>
                <div style={{ color: "#475569", fontSize: 10 }}>{d.hostname}</div>
                <div style={{ color: "#374151", fontSize: 9 }}>MAC: {d.mac}</div>
              </div>
            ))}
          </div>

          {/* Error display */}
          {stats.lastError && (
            <div style={{ marginTop: 16, padding: "8px 10px", background: "#1c1017", border: "1px solid #7f1d1d", borderRadius: 4, fontSize: 10, color: "#fca5a5" }}>
              <div style={{ fontWeight: 700, marginBottom: 2 }}>LAST ERROR</div>
              {stats.lastError}
            </div>
          )}
        </div>

        {/* Right Panel: Event Log */}
        <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "12px 20px", borderBottom: "1px solid #1e2d44", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: 2 }}>
              Event Log ({eventLog.length})
            </span>
            <button onClick={() => setEventLog([])}
              style={{ padding: "4px 12px", borderRadius: 4, border: "1px solid #1e2d44", background: "transparent", color: "#64748b", cursor: "pointer", fontFamily: "inherit", fontSize: 10 }}>
              Clear
            </button>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "8px 16px" }}>
            {eventLog.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 20px", color: "#374151" }}>
                <div style={{ fontSize: 14, marginBottom: 8 }}>No events yet</div>
                <div style={{ fontSize: 11 }}>Start the simulation to see webhook events</div>
              </div>
            )}
            {eventLog.map(entry => (
              <div key={entry.id} style={{
                padding: "6px 10px", marginBottom: 2, borderRadius: 4,
                background: entry.type === "system" ? "#0f172a" : entry.status === "error" ? "#1a0a0a" : "#0a1628",
                borderLeft: `3px solid ${entry.type === "system" ? "#6366f1" : entry.status === "error" ? "#ef4444" : "#22c55e"}`,
                fontSize: 11,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ color: "#475569", fontSize: 9, minWidth: 55 }}>{entry.realTime}</span>
                    <span style={{ color: "#f59e0b", fontSize: 9 }}>[{entry.simTime}]</span>
                    {entry.type === "system" ? (
                      <span style={{ color: "#a78bfa" }}>{entry.message}</span>
                    ) : (
                      <>
                        <span style={{ color: entry.status === "error" ? "#ef4444" : "#22c55e", fontWeight: 700 }}>
                          {entry.status === "error" ? "✗" : "✓"}
                        </span>
                        <span style={{ color: "#60a5fa" }}>{entry.device}</span>
                        <span style={{ color: "#94a3b8" }}>
                          {entry.runners?.join(", ")}
                        </span>
                      </>
                    )}
                  </div>
                  {entry.httpStatus && (
                    <span style={{ fontSize: 9, color: entry.status === "error" ? "#ef4444" : "#22c55e" }}>
                      HTTP {entry.httpStatus}
                    </span>
                  )}
                </div>
                {entry.error && (
                  <div style={{ marginTop: 2, fontSize: 9, color: "#f87171", paddingLeft: 63 }}>{entry.error}</div>
                )}
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0d1220; }
        ::-webkit-scrollbar-thumb { background: #1e2d44; border-radius: 3px; }
      `}</style>
    </div>
  );
}
