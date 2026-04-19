import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { BibMappingService } from '../../../services/BibMappingService';
import { ParticipantService } from '../../../services/ParticipantService';
import type { BibMappingResponse } from '../../../models/bibMapping';
import type {
  DuplicateInfo,
  MappingRow,
  RowStatus,
  SessionStats,
  SubmitResult,
} from './BibMapping.types';

const PARTICIPANT_PAGE_SIZE = 10000;
const JUST_MAPPED_MS = 3000;

// Min/max EPC hex length we accept. EPC-96 is 24 hex chars; we accept 12-32 to be safe.
export const EPC_MIN_LEN = 12;
export const EPC_MAX_LEN = 32;

export const bibMappingKeys = {
  all: ['bibMappings'] as const,
  byRace: (raceId: string) => [...bibMappingKeys.all, 'byRace', raceId] as const,
  participantsByRace: (eventId: string, raceId: string) =>
    ['participants', 'byRace', eventId, raceId] as const,
};

export function sanitizeEpc(raw: string): string {
  return raw.replace(/[^0-9A-Fa-f]/g, '').toUpperCase();
}

export function isValidEpc(epc: string): boolean {
  return epc.length >= EPC_MIN_LEN && epc.length <= EPC_MAX_LEN;
}

interface UseBibMappingRowsReturn {
  rows: MappingRow[];
  visibleRows: MappingRow[];
  justMappedIds: Set<string>;
  errorFlashIds: Set<string>;
  isLoading: boolean;
  loadError: string | null;
  search: string;
  setSearch: (v: string) => void;
  setPendingEpc: (participantId: string, value: string) => void;
  submitEpc: (participantId: string) => Promise<SubmitResult>;
  skipRow: (participantId: string) => void;
  unskipRow: (participantId: string) => void;
  clearPendingEpc: (participantId: string) => void;
  clearMapping: (participantId: string) => Promise<boolean>;
  overrideMapping: (info: DuplicateInfo) => Promise<{ ok: boolean; nextId?: string }>;
  nextUnmappedId: (afterParticipantId?: string | null) => string | null;
  progress: { mapped: number; total: number; percent: number };
  stats: SessionStats;
  incrementDuplicateAttempts: () => void;
  refetch: () => void;
}

export function useBibMappingRows(eventId: string, raceId: string): UseBibMappingRowsReturn {
  const queryClient = useQueryClient();

  const participantsQuery = useQuery({
    queryKey: bibMappingKeys.participantsByRace(eventId, raceId),
    queryFn: () =>
      ParticipantService.searchParticipants(eventId, raceId, {
        pageNumber: 1,
        pageSize: PARTICIPANT_PAGE_SIZE,
        sortFieldName: 'bib',
        sortDirection: 0,
        searchString: '',
      }),
    enabled: !!eventId && !!raceId,
  });

  const mappingsQuery = useQuery({
    queryKey: bibMappingKeys.byRace(raceId),
    queryFn: () => BibMappingService.getByRace(raceId),
    enabled: !!raceId,
  });

  const [rowOverrides, setRowOverrides] = useState<Record<string, Partial<MappingRow>>>({});
  const [search, setSearch] = useState('');
  const [justMappedIds, setJustMappedIds] = useState<Set<string>>(new Set());
  const [errorFlashIds, setErrorFlashIds] = useState<Set<string>>(new Set());
  const [mappedThisSession, setMappedThisSession] = useState(0);
  const [duplicateAttempts, setDuplicateAttempts] = useState(0);
  const [lastScanned, setLastScanned] = useState<{ bib: string; time: string } | null>(null);

  const justMappedTimers = useRef<Map<string, number>>(new Map());
  const errorFlashTimers = useRef<Map<string, number>>(new Map());

  // Build rows by merging participants + mappings + local overrides
  const rows = useMemo<MappingRow[]>(() => {
    const participants = participantsQuery.data?.message ?? [];
    const mappings = mappingsQuery.data ?? [];
    const mappingByParticipantId = new Map<string, BibMappingResponse>();
    mappings.forEach((m) => mappingByParticipantId.set(m.participantId, m));

    return participants.map((p) => {
      const existing = mappingByParticipantId.get(p.id);
      const override = rowOverrides[p.id] ?? {};
      const mappedEpc = existing?.epc ?? '';
      const status: RowStatus =
        override.status ??
        (mappedEpc ? 'mapped' : 'unmapped');

      return {
        participantId: p.id,
        bibNumber: p.bib,
        name: p.fullName || `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim(),
        epc: mappedEpc,
        pendingEpc: override.pendingEpc ?? '',
        status,
        errorMessage: override.errorMessage,
        chipId: existing?.chipId,
        eventId: existing?.eventId,
        createdAt: existing?.createdAt,
      };
    });
  }, [participantsQuery.data, mappingsQuery.data, rowOverrides]);

  const visibleRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.bibNumber.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q),
    );
  }, [rows, search]);

  const progress = useMemo(() => {
    const total = rows.length;
    const mapped = rows.filter((r) => r.status === 'mapped').length;
    const percent = total === 0 ? 0 : Math.round((mapped / total) * 100);
    return { mapped, total, percent };
  }, [rows]);

  // Prune stale overrides once the server refetch catches up.
  useEffect(() => {
    setRowOverrides((prev) => {
      const next: Record<string, Partial<MappingRow>> = {};
      for (const [id, v] of Object.entries(prev)) {
        if (v.status === 'saving' || v.status === 'error' || v.status === 'skipped') {
          next[id] = v;
        } else if (v.pendingEpc) {
          next[id] = v;
        }
      }
      return next;
    });
  }, [mappingsQuery.data]);

  // Cleanup pending timers on unmount so late setStates don't fire.
  useEffect(() => {
    return () => {
      justMappedTimers.current.forEach((t) => window.clearTimeout(t));
      errorFlashTimers.current.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  const markJustMapped = useCallback((participantId: string) => {
    setJustMappedIds((prev) => {
      const next = new Set(prev);
      next.add(participantId);
      return next;
    });
    const existing = justMappedTimers.current.get(participantId);
    if (existing) window.clearTimeout(existing);
    const t = window.setTimeout(() => {
      setJustMappedIds((prev) => {
        const next = new Set(prev);
        next.delete(participantId);
        return next;
      });
      justMappedTimers.current.delete(participantId);
    }, JUST_MAPPED_MS);
    justMappedTimers.current.set(participantId, t);
  }, []);

  const flashError = useCallback((participantId: string) => {
    setErrorFlashIds((prev) => {
      const next = new Set(prev);
      next.add(participantId);
      return next;
    });
    const existing = errorFlashTimers.current.get(participantId);
    if (existing) window.clearTimeout(existing);
    const t = window.setTimeout(() => {
      setErrorFlashIds((prev) => {
        const next = new Set(prev);
        next.delete(participantId);
        return next;
      });
      errorFlashTimers.current.delete(participantId);
    }, 650);
    errorFlashTimers.current.set(participantId, t);
  }, []);

  const setPendingEpc = useCallback((participantId: string, value: string) => {
    const sanitized = sanitizeEpc(value);
    setRowOverrides((prev) => {
      const curr = prev[participantId] ?? {};
      return {
        ...prev,
        [participantId]: {
          ...curr,
          pendingEpc: sanitized,
          status: curr.status === 'error' ? 'unmapped' : curr.status,
          errorMessage: undefined,
        },
      };
    });
  }, []);

  const clearPendingEpc = useCallback((participantId: string) => {
    setRowOverrides((prev) => {
      const curr = prev[participantId];
      if (!curr) return prev;
      return {
        ...prev,
        [participantId]: {
          ...curr,
          pendingEpc: '',
          status: curr.status === 'error' ? 'unmapped' : curr.status,
          errorMessage: undefined,
        },
      };
    });
  }, []);

  const nextUnmappedId = useCallback(
    (afterParticipantId?: string | null): string | null => {
      const startIdx = afterParticipantId
        ? rows.findIndex((r) => r.participantId === afterParticipantId)
        : -1;
      for (let i = startIdx + 1; i < rows.length; i++) {
        if (rows[i].status === 'unmapped' || rows[i].status === 'error') return rows[i].participantId;
      }
      for (let i = 0; i <= startIdx && i < rows.length; i++) {
        if (rows[i].status === 'unmapped' || rows[i].status === 'error') return rows[i].participantId;
      }
      return null;
    },
    [rows],
  );

  const recordSuccess = useCallback((bib: string, participantId: string) => {
    setMappedThisSession((n) => n + 1);
    setLastScanned({ bib, time: new Date().toISOString() });
    markJustMapped(participantId);
  }, [markJustMapped]);

  const submitEpc = useCallback(
    async (participantId: string): Promise<SubmitResult> => {
      const row = rows.find((r) => r.participantId === participantId);
      if (!row) return { status: 'error' };
      const epc = sanitizeEpc(row.pendingEpc);

      if (!isValidEpc(epc)) {
        setRowOverrides((prev) => ({
          ...prev,
          [participantId]: {
            ...(prev[participantId] ?? {}),
            pendingEpc: epc,
            status: 'error',
            errorMessage: `EPC must be ${EPC_MIN_LEN}–${EPC_MAX_LEN} hex characters`,
          },
        }));
        flashError(participantId);
        return { status: 'invalid' };
      }

      // Session dupe: same EPC typed (but not yet saved) on another row.
      const sessionDupe = rows.find(
        (r) =>
          r.participantId !== participantId &&
          r.pendingEpc &&
          sanitizeEpc(r.pendingEpc) === epc,
      );
      if (sessionDupe) {
        setRowOverrides((prev) => ({
          ...prev,
          [participantId]: {
            ...(prev[participantId] ?? {}),
            pendingEpc: epc,
            status: 'error',
            errorMessage: `EPC already entered for BIB ${sessionDupe.bibNumber} this session`,
          },
        }));
        flashError(participantId);
        return { status: 'session-duplicate' };
      }

      // Server dupe: EPC already mapped to another participant.
      const existingMappings = mappingsQuery.data ?? [];
      const dupe = existingMappings.find(
        (m) => m.epc.toUpperCase() === epc && m.participantId !== participantId,
      );
      if (dupe) {
        const existingRow = rows.find((r) => r.participantId === dupe.participantId);
        return {
          status: 'duplicate',
          duplicate: {
            epc,
            newParticipantId: participantId,
            newBib: row.bibNumber,
            newName: row.name,
            existingParticipantId: dupe.participantId,
            existingBib: dupe.bibNumber,
            existingName: existingRow?.name ?? '',
            existingChipId: dupe.chipId,
            existingEventId: dupe.eventId,
          },
        };
      }

      setRowOverrides((prev) => ({
        ...prev,
        [participantId]: {
          ...(prev[participantId] ?? {}),
          pendingEpc: epc,
          status: 'saving',
          errorMessage: undefined,
        },
      }));

      try {
        await BibMappingService.create({ raceId, bibNumber: row.bibNumber, epc });
        await queryClient.invalidateQueries({ queryKey: bibMappingKeys.byRace(raceId) });
        setRowOverrides((prev) => {
          const next = { ...prev };
          delete next[participantId];
          return next;
        });
        recordSuccess(row.bibNumber, participantId);
        const nextId = nextUnmappedId(participantId);
        return { status: 'ok', nextId: nextId ?? undefined };
      } catch (err: any) {
        // Server may report a 409 conflict if client data was stale.
        const statusCode = err?.response?.status;
        const serverMessage: string | undefined =
          err?.response?.data?.message ?? err?.response?.data?.error ?? err?.message;

        if (statusCode === 409) {
          // Refetch mappings so we can surface the existing binding.
          await queryClient.invalidateQueries({ queryKey: bibMappingKeys.byRace(raceId) });
          const fresh = queryClient.getQueryData<BibMappingResponse[]>(
            bibMappingKeys.byRace(raceId),
          ) ?? [];
          const conflict = fresh.find(
            (m) => m.epc.toUpperCase() === epc && m.participantId !== participantId,
          );
          setRowOverrides((prev) => ({
            ...prev,
            [participantId]: {
              ...(prev[participantId] ?? {}),
              pendingEpc: epc,
              status: 'unmapped',
              errorMessage: undefined,
            },
          }));
          if (conflict) {
            const existingRow = rows.find((r) => r.participantId === conflict.participantId);
            return {
              status: 'duplicate',
              duplicate: {
                epc,
                newParticipantId: participantId,
                newBib: row.bibNumber,
                newName: row.name,
                existingParticipantId: conflict.participantId,
                existingBib: conflict.bibNumber,
                existingName: existingRow?.name ?? '',
                existingChipId: conflict.chipId,
                existingEventId: conflict.eventId,
              },
            };
          }
        }

        const message = serverMessage || 'Failed to save mapping';
        toast.error(message);
        setRowOverrides((prev) => ({
          ...prev,
          [participantId]: {
            ...(prev[participantId] ?? {}),
            pendingEpc: epc,
            status: 'error',
            errorMessage: message,
          },
        }));
        flashError(participantId);
        return { status: 'error' };
      }
    },
    [rows, raceId, queryClient, mappingsQuery.data, nextUnmappedId, recordSuccess, flashError],
  );

  /**
   * Force-override a duplicate mapping.
   *
   * TODO(api): backend should accept `{ override: true }` (or `?force=true`) on
   *   POST /bib-mappings so this is atomic. The server-side controller should
   *   then detach the EPC from the old participant and assign it to the new
   *   one inside a single transaction. Once available, replace the
   *   delete-then-create fallback below.
   *
   * Current fallback: DELETE old → POST new. If the POST fails, we surface
   *   the error but the old mapping will already be gone; the caller should
   *   prompt the user to retry the scan.
   */
  const overrideMapping = useCallback(
    async (info: DuplicateInfo): Promise<{ ok: boolean; nextId?: string }> => {
      setRowOverrides((prev) => ({
        ...prev,
        [info.newParticipantId]: {
          ...(prev[info.newParticipantId] ?? {}),
          pendingEpc: info.epc,
          status: 'saving',
          errorMessage: undefined,
        },
      }));

      try {
        if (info.existingChipId && info.existingEventId) {
          await BibMappingService.delete({
            chipId: info.existingChipId,
            participantId: info.existingParticipantId,
            eventId: info.existingEventId,
          });
        }
        await BibMappingService.create({
          raceId,
          bibNumber: info.newBib,
          epc: info.epc,
        });
        await queryClient.invalidateQueries({ queryKey: bibMappingKeys.byRace(raceId) });
        setRowOverrides((prev) => {
          const next = { ...prev };
          delete next[info.newParticipantId];
          return next;
        });
        toast.success(`EPC moved from BIB #${info.existingBib} to BIB #${info.newBib}`);
        recordSuccess(info.newBib, info.newParticipantId);
        const nextId = nextUnmappedId(info.newParticipantId);
        return { ok: true, nextId: nextId ?? undefined };
      } catch (err: any) {
        const message: string = err?.response?.data?.message ?? err?.message ?? 'Override failed';
        toast.error(message);
        await queryClient.invalidateQueries({ queryKey: bibMappingKeys.byRace(raceId) });
        setRowOverrides((prev) => ({
          ...prev,
          [info.newParticipantId]: {
            ...(prev[info.newParticipantId] ?? {}),
            pendingEpc: info.epc,
            status: 'error',
            errorMessage: message,
          },
        }));
        flashError(info.newParticipantId);
        return { ok: false };
      }
    },
    [raceId, queryClient, nextUnmappedId, recordSuccess, flashError],
  );

  const clearMapping = useCallback(
    async (participantId: string): Promise<boolean> => {
      const row = rows.find((r) => r.participantId === participantId);
      if (!row || row.status !== 'mapped' || !row.chipId || !row.eventId) return false;
      try {
        await BibMappingService.delete({
          chipId: row.chipId,
          participantId,
          eventId: row.eventId,
        });
        await queryClient.invalidateQueries({ queryKey: bibMappingKeys.byRace(raceId) });
        toast.success(`Cleared mapping for BIB #${row.bibNumber}`);
        return true;
      } catch (err: any) {
        const message: string = err?.response?.data?.message ?? err?.message ?? 'Failed to clear mapping';
        toast.error(message);
        return false;
      }
    },
    [rows, raceId, queryClient],
  );

  const skipRow = useCallback((participantId: string) => {
    setRowOverrides((prev) => ({
      ...prev,
      [participantId]: {
        ...(prev[participantId] ?? {}),
        pendingEpc: '',
        status: 'skipped',
        errorMessage: undefined,
      },
    }));
  }, []);

  const unskipRow = useCallback((participantId: string) => {
    setRowOverrides((prev) => {
      const curr = prev[participantId];
      if (!curr || curr.status !== 'skipped') return prev;
      const next = { ...prev };
      delete next[participantId];
      return next;
    });
  }, []);

  const incrementDuplicateAttempts = useCallback(() => {
    setDuplicateAttempts((n) => n + 1);
  }, []);

  const refetch = useCallback(() => {
    participantsQuery.refetch();
    mappingsQuery.refetch();
  }, [participantsQuery, mappingsQuery]);

  const stats: SessionStats = useMemo(
    () => ({ mappedThisSession, duplicateAttempts, lastScanned }),
    [mappedThisSession, duplicateAttempts, lastScanned],
  );

  return {
    rows,
    visibleRows,
    justMappedIds,
    errorFlashIds,
    isLoading: participantsQuery.isLoading || mappingsQuery.isLoading,
    loadError:
      participantsQuery.error?.message ?? mappingsQuery.error?.message ?? null,
    search,
    setSearch,
    setPendingEpc,
    submitEpc,
    skipRow,
    unskipRow,
    clearPendingEpc,
    clearMapping,
    overrideMapping,
    nextUnmappedId,
    progress,
    stats,
    incrementDuplicateAttempts,
    refetch,
  };
}
