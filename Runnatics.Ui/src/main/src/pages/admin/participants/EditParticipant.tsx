import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Stack,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  Snackbar,
} from "@mui/material";
import { Participant } from "@/main/src/models/races/Participant";
import { ParticipantService } from "@/main/src/services/ParticipantService";
import { Race } from "@/main/src/models/races/Race";
import { RaceService } from "@/main/src/services/RaceService";
import EpcMappingField from "./EpcMappingField";

interface EditParticipantProps {
  open: boolean;
  onClose: () => void;
  onUpdate: (participant: Participant) => void;
  participant: Participant | null;
  eventId?: string;
  raceId?: string;
}

// Normalize an incoming gender value to the Select's option domain ("M"/"F"/"Other").
// The participants grid passes lowercase values ("male"/"female"/"other"), while the
// API/EF layer canonicalizes to "M"/"F" — so match case-insensitively. Anything else
// (e.g. legacy/blank) is passed through unchanged so it is never silently lost.
const toGenderValue = (gender?: string): string => {
  const v = (gender || "").trim().toLowerCase();
  if (v === "m" || v === "male") return "M";
  if (v === "f" || v === "female") return "F";
  if (v === "o" || v === "other") return "Other";
  return gender || "";
};

const EditParticipant: React.FC<EditParticipantProps> = ({
  open,
  onClose,
  onUpdate,
  participant,
  eventId,
  raceId,
}) => {
  const [formData, setFormData] = useState<Participant>({
    bib: "",
    firstName: "",
    lastName: "",
    fullName: "",
    email: "",
    phone: "",
    gender: "",
    category: "",
    status: "Registered",
    checkIn: false,
    chipId: "",
    dateOfBirth: "",
    ageCategory: "",
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasRfidReadings, setHasRfidReadings] = useState<boolean>(false);
  // #5: mandatory when disqualifying
  const [dsqReason, setDsqReason] = useState<string>("");
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({
    open: false,
    message: "",
    severity: "success",
  });
  const [races, setRaces] = useState<Race[]>([]);
  const [selectedRaceId, setSelectedRaceId] = useState<string>("");
  const [epcRaceId, setEpcRaceId] = useState<string>("");
  const [racesLoading, setRacesLoading] = useState<boolean>(false);

  // Originals captured when the form loads — used to decide which follow-up (if any)
  // fires after Save: race change → full process; else AgeCategory change → cheap re-rank.
  const originalRaceIdRef = useRef<string>("");
  const originalAgeCategoryRef = useRef<string>("");

  // Which step is in flight (drives the dynamic button label / combined progress).
  type Phase = null | "saving" | "processing" | "reranking";
  const [phase, setPhase] = useState<Phase>(null);

  // Recoverable half-state: Save committed but the follow-up (process/re-rank) failed.
  // The participant IS saved; only the recompute failed → offer a Retry, not a red error.
  const [followUpRetry, setFollowUpRetry] = useState<
    null | { kind: "process" | "rerank"; message: string }
  >(null);

  // Fetch races when dialog opens and pre-select the race
  useEffect(() => {
    const fetchRaces = async () => {
      // Use eventId prop first, fallback to participant.eventId
      const currentEventId = eventId || participant?.eventId;
      if (!open || !currentEventId) return;

      setRacesLoading(true);
      try {
        const response = await RaceService.getAllRaces({
          eventId: currentEventId,
          searchCriteria: {
            pageNumber: 1,
            pageSize: 100,
            sortFieldName: "startTime",
            sortDirection: 1,
          },
        });

        const fetchedRaces = response.message || [];
        setRaces(fetchedRaces);

        // Pre-select the race: prioritize raceId prop (current tab), then participant's raceId
        const raceToSelect = raceId || participant?.raceId;
        if (raceToSelect) {
          setSelectedRaceId(raceToSelect);
        } else if (fetchedRaces.length > 0) {
          // Fallback to first race if no race is specified
          setSelectedRaceId(fetchedRaces[0]?.id || "");
        }
      } catch (err) {
        console.error("Error fetching races:", err);
      } finally {
        setRacesLoading(false);
      }
    };

    if (open) {
      fetchRaces();
    }
  }, [open, eventId, raceId, participant?.eventId, participant?.raceId]);

  // Populate form when participant prop changes
  useEffect(() => {
    if (participant && open) {
      setFormData({
        id: participant.id,
        bib: participant.bib || "",
        firstName: participant.firstName || "",
        lastName: participant.lastName || "",
        fullName: participant.fullName || "",
        email: participant.email || "",
        phone: participant.phone || "",
        gender: toGenderValue(participant.gender),
        category: participant.category || "",
        status: participant.status || "Registered",
        checkIn: participant.checkIn || false,
        chipId: participant.chipId || "",
        raceId: participant.raceId || "",
        eventId: participant.eventId || "",
        dateOfBirth: (participant as any).dateOfBirth || "",
        ageCategory: (participant as any).ageCategory || "",
      });
      // Set initial race selection: prioritize raceId prop (current tab), then participant's raceId
      const raceToSelect = raceId || participant.raceId || "";
      setSelectedRaceId(raceToSelect);
      // Lock EpcMappingField to the participant's actual current race so that
      // changing the race dropdown does not affect the chip/EPC display.
      setEpcRaceId(raceToSelect);

      // Capture originals for follow-up detection. The ORIGINAL race is the
      // participant's own race (NOT the raceId tab prop — selecting a different tab
      // must not look like a move), and the original AgeCategory drives case 2.
      originalRaceIdRef.current = participant.raceId || "";
      originalAgeCategoryRef.current = (participant as any).ageCategory || "";
      setFollowUpRetry(null);
    }
  }, [participant, open, raceId]);

  // Fetch rfid readings status to lock EPC editing if readings exist
  useEffect(() => {
    if (!open || !participant?.id) {
      if (!open) setHasRfidReadings(false);
      return;
    }
    const currentEventId = eventId || participant.eventId;
    const currentRaceId = raceId || participant.raceId;
    if (!currentEventId || !currentRaceId) return;

    ParticipantService.getParticipantDetails(currentEventId, currentRaceId, participant.id)
      .then((response) => {
        const readings = response.data.message?.rfidReadings ?? [];
        setHasRfidReadings(readings.length > 0);
      })
      .catch(() => setHasRfidReadings(false));
  }, [open, participant?.id, eventId, raceId, participant?.eventId, participant?.raceId]);

  const handleFormChange = (
    field: keyof Participant,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    setFormData({
      bib: "",
      firstName: "",
      lastName: "",
      fullName: "",
      email: "",
      phone: "",
      gender: "",
      category: "",
      status: "Registered",
      checkIn: false,
      chipId: "",
    });
    setError(null);
  };

  const handleClose = () => {
    handleReset();
    setLoading(false);
    onClose();
  };

  // Extract a human error message from an axios error in the codebase's response shapes.
  const extractErrorMessage = (err: any, fallback: string): string => {
    if (err?.response?.data) {
      const data = err.response.data;
      if (data.errors && typeof data.errors === "object") {
        return Object.entries(data.errors)
          .map(([field, messages]: [string, any]) => {
            const msgs = Array.isArray(messages) ? messages.join(", ") : messages;
            return `${field}: ${msgs}`;
          })
          .join("; ");
      }
      if (data.title || data.detail) return data.detail || data.title;
      if (typeof data === "string") return data;
      if (data.message) return data.message;
    }
    return fallback;
  };

  type EditCase = "move" | "recat" | "scalar";

  // Decide what happens on Save from the current form vs the loaded originals.
  // Race change takes precedence — a full process covers a category change too.
  const computeEditCase = (): EditCase => {
    if (selectedRaceId && selectedRaceId !== originalRaceIdRef.current) return "move";
    if (
      (formData.ageCategory?.trim() || "") !==
      (originalAgeCategoryRef.current?.trim() || "")
    )
      return "recat";
    return "scalar";
  };

  const resolvedEventId = formData.eventId || eventId || "";

  // Fire the post-save recompute. Sequential — only ever called AFTER Save commits.
  // move  → full ProcessCompleteWorkflowAsync rebuild on the TARGET race.
  // recat → cheap whole-race re-rank (no re-normalize), same race.
  const runFollowUp = async (kind: "process" | "rerank") => {
    const pid = formData.id as string;
    if (kind === "process") {
      setPhase("processing");
      await ParticipantService.processParticipantResult(resolvedEventId, selectedRaceId, pid);
    } else {
      setPhase("reranking");
      await ParticipantService.changeRaceCategory(
        resolvedEventId,
        selectedRaceId,
        pid,
        formData.ageCategory?.trim() || ""
      );
    }
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.bib || formData.bib.trim() === "") {
      setError("Please enter a Bib Number");
      return;
    }
    if (!formData.id) {
      setError("Participant ID is missing");
      return;
    }
    if (!selectedRaceId) {
      setError("Race ID is missing");
      return;
    }

    const editCase = computeEditCase();
    setLoading(true);
    setPhase("saving");
    setError(null);
    setFollowUpRetry(null);

    // #4/#5 (2026-07-03): run status is COMPUTED-ONLY — the plain edit never sends it; the only
    // manual change is DSQ via the dedicated status endpoint, with a MANDATORY reason.
    const wantsDsq = formData.status === "DSQ" && participant?.status !== "DSQ";
    if (wantsDsq && !dsqReason.trim()) {
      setError("A disqualification reason is required to set DSQ.");
      setLoading(false);
      setPhase(null);
      return;
    }

    // 1. SAVE (always). If this fails, do NOT fire any follow-up — show the save error.
    try {
      await ParticipantService.editParticipant(formData.id, {
        bibNumber: formData.bib,
        firstName: formData.firstName?.trim() || undefined,
        lastName: formData.lastName?.trim() || undefined,
        email: formData.email?.trim() || undefined,
        phone: formData.phone?.trim() || undefined,
        gender: formData.gender?.trim() || undefined,
        category: formData.category?.trim() || undefined,
        checkIn: formData.checkIn || false,
        dateOfBirth: formData.dateOfBirth?.trim() || undefined,
        ageCategory: formData.ageCategory?.trim() || undefined,
        raceId: selectedRaceId,
      } as any);
    } catch (err: any) {
      console.error("Error editing participant:", err);
      setError(extractErrorMessage(err, "Failed to update participant. Please try again."));
      setLoading(false);
      setPhase(null);
      return;
    }

    // 1b. DSQ (when requested) — its own endpoint; the server normalizes to the stored "DQ",
    //     nulls the runner's ranks and re-ranks the whole race.
    if (wantsDsq) {
      try {
        await ParticipantService.disqualifyParticipant(selectedRaceId, formData.id, dsqReason.trim());
      } catch (err: any) {
        console.error("Error disqualifying participant:", err);
        setError(extractErrorMessage(err, "Saved the details, but the disqualification failed. Please retry."));
        setLoading(false);
        setPhase(null);
        return;
      }
    }

    // Save committed — refresh the parent list with the new race.
    const fullName = `${formData.firstName || ""} ${formData.lastName || ""}`.trim();
    onUpdate({
      ...formData,
      fullName: fullName || undefined,
      name: fullName || undefined,
      raceId: selectedRaceId,
    } as Participant);

    // 3. Scalar-only edit → done, no recompute.
    if (editCase === "scalar") {
      setSnackbar({ open: true, message: "Participant updated successfully!", severity: "success" });
      setLoading(false);
      setPhase(null);
      setTimeout(() => handleClose(), 1200);
      return;
    }

    // 2. Sequential follow-up (move → process, recat → re-rank).
    const kind = editCase === "move" ? "process" : "rerank";
    try {
      await runFollowUp(kind);
      setSnackbar({
        open: true,
        message:
          editCase === "move"
            ? "Participant moved and result processed!"
            : "Participant updated and re-ranked!",
        severity: "success",
      });
      setLoading(false);
      setPhase(null);
      setTimeout(() => handleClose(), 1200);
    } catch (err: any) {
      // Save SUCCEEDED; only the recompute failed → recoverable. The runner is saved
      // (moved-but-unprocessed / saved-but-unranked) and re-processable. Offer Retry.
      console.error("Post-save follow-up failed:", err);
      setLoading(false);
      setPhase(null);
      setFollowUpRetry({
        kind,
        message:
          editCase === "move"
            ? "Saved — moved to the new race, but processing failed. Retry to rebuild the result."
            : "Saved — but re-ranking failed. Retry to update the category ranks.",
      });
    }
  };

  // Retry just the failed follow-up (the Save already committed; don't re-save).
  const handleRetryFollowUp = async () => {
    if (!followUpRetry) return;
    const kind = followUpRetry.kind;
    setLoading(true);
    setError(null);
    try {
      await runFollowUp(kind);
      setFollowUpRetry(null);
      setSnackbar({
        open: true,
        message: kind === "process" ? "Result processed!" : "Re-ranked!",
        severity: "success",
      });
      setLoading(false);
      setPhase(null);
      setTimeout(() => handleClose(), 1200);
    } catch (err: any) {
      console.error("Retry of follow-up failed:", err);
      setLoading(false);
      setPhase(null);
      // Keep followUpRetry so the admin can retry again.
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={(_event, reason) => {
          if (reason === "backdropClick" || reason === "escapeKeyDown") {
            return;
          }
          handleClose();
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Participant</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2, mt: 2 }} onClose={() => setError(null)}>
              <strong>Error:</strong> {error}
            </Alert>
          )}
          {followUpRetry && (
            <Alert
              severity="warning"
              sx={{ mb: 2, mt: 2 }}
              action={
                <Button color="inherit" size="small" onClick={handleRetryFollowUp} disabled={loading}>
                  Retry
                </Button>
              }
            >
              {followUpRetry.message}
            </Alert>
          )}
          <Stack spacing={2} sx={{ mt: error || followUpRetry ? 1 : 2 }}>
            {/* Bib Number - REQUIRED */}
            <TextField
              label="Bib Number"
              value={formData.bib}
              onChange={(e) => handleFormChange("bib", e.target.value)}
              fullWidth
              required
              size="small"
              helperText="Required field"
            />

            {/* Name Fields - Optional */}
            <Stack direction="row" spacing={2}>
              <TextField
                label="First Name"
                value={formData.firstName}
                onChange={(e) => handleFormChange("firstName", e.target.value)}
                fullWidth
                size="small"
              />
              <TextField
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => handleFormChange("lastName", e.target.value)}
                fullWidth
                size="small"
              />
            </Stack>

            {/* Contact Information - Optional */}
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleFormChange("email", e.target.value)}
              fullWidth
              size="small"
            />
            <TextField
              label="Phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleFormChange("phone", e.target.value)}
              fullWidth
              size="small"
            />

            {/* Gender and Category - Optional */}
            <Stack direction="row" spacing={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Gender</InputLabel>
                <Select
                  value={formData.gender}
                  label="Gender"
                  onChange={(e: SelectChangeEvent) =>
                    handleFormChange("gender", e.target.value)
                  }
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  <MenuItem value="M">Male</MenuItem>
                  <MenuItem value="F">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Category"
                value={formData.category}
                onChange={(e) => handleFormChange("category", e.target.value)}
                fullWidth
                size="small"
                placeholder="e.g., Open, Veteran, Junior"
              />
            </Stack>

            {/* Run Status — #4 (2026-07-03): COMPUTED from timing data (OK/DNF/DNS); the ONLY
                manual change is DSQ, with a mandatory reason. */}
            <FormControl fullWidth size="small">
              <InputLabel>Run Status</InputLabel>
              <Select
                value={formData.status}
                label="Run Status"
                onChange={(e: SelectChangeEvent) =>
                  handleFormChange("status", e.target.value as any)
                }
              >
                <MenuItem value={participant?.status || "Registered"}>
                  {(participant?.status || "Registered") +
                    (participant?.status === "DSQ" ? "" : " (computed)")}
                </MenuItem>
                {participant?.status !== "DSQ" && (
                  <MenuItem value="DSQ">DSQ (Disqualify)</MenuItem>
                )}
              </Select>
            </FormControl>
            {formData.status === "DSQ" && participant?.status !== "DSQ" && (
              <TextField
                fullWidth
                size="small"
                label="Disqualification Reason (required)"
                value={dsqReason}
                onChange={(e) => setDsqReason(e.target.value)}
                required
                error={!dsqReason.trim()}
                helperText={!dsqReason.trim() ? "A reason is mandatory for a disqualification" : undefined}
                placeholder="Enter reason for disqualification"
              />
            )}

            {/* EPC / Chip Mapping */}
            {formData.id && (
              <EpcMappingField
                participantId={formData.id}
                bibNumber={formData.bib}
                participantName={
                  formData.fullName ||
                  `${formData.firstName || ""} ${formData.lastName || ""}`.trim() ||
                  formData.bib
                }
                raceId={epcRaceId}
                eventId={formData.eventId || eventId || ""}
                hasRfidReadings={hasRfidReadings}
              />
            )}

            {/* Date of Birth and Age Category */}
            <Stack direction="row" spacing={2}>
              <TextField
                label="Date of Birth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleFormChange("dateOfBirth", e.target.value)}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Age Category"
                value={formData.ageCategory}
                onChange={(e) => handleFormChange("ageCategory", e.target.value)}
                fullWidth
                size="small"
                placeholder="e.g., Senior, Junior, Veteran"
              />
            </Stack>
            {/* Race Selection - Required */}
            <FormControl fullWidth size="small" required>
              <InputLabel>Race</InputLabel>
              <Select
                value={selectedRaceId}
                label="Race"
                onChange={(e: SelectChangeEvent) => setSelectedRaceId(e.target.value)}

              >
                {racesLoading ? (
                  <MenuItem disabled>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Loading races...
                  </MenuItem>
                ) : races.length === 0 ? (
                  <MenuItem disabled>No races available</MenuItem>
                ) : (
                  races.map((race) => (
                    <MenuItem key={race.id} value={race.id}>
                      {race.distance ? `${race.distance} KM` : ""} - {race.title}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
            {/* Check In - Optional */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.checkIn}
                  onChange={(e) =>
                    handleFormChange("checkIn", e.target.checked)
                  }
                />
              }
              label="Check In"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} variant="outlined" disabled={loading}>
            Cancel
          </Button>
          {(() => {
            const editCase = computeEditCase();
            const idleLabel =
              editCase === "move"
                ? "Save & Process Result"
                : editCase === "recat"
                ? "Save & Re-rank"
                : "Update Participant";
            const busyLabel =
              phase === "saving"
                ? "Saving…"
                : phase === "processing"
                ? "Processing…"
                : phase === "reranking"
                ? "Re-ranking…"
                : "Working…";
            return (
              <Button
                onClick={handleSubmit}
                variant="contained"
                disabled={loading || !formData.bib}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? busyLabel : idleLabel}
              </Button>
            );
          })()}
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default EditParticipant;
