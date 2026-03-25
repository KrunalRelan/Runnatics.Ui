import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { BibMappingService } from '../../../services/BibMappingService';
import { useBibMappingHub } from '../../../hooks/useBibMappingHub';
import type { BibMappingResponse, DeleteBibMappingParams } from '../../../models/bibMapping';
import type { ConnectionStatus } from './BibMapping.types';

export const bibMappingKeys = {
  all: ['bibMappings'] as const,
  byRace: (raceId: string) => [...bibMappingKeys.all, 'byRace', raceId] as const,
};

interface UseBibMappingReturn {
  mappings: BibMappingResponse[];
  isLoadingMappings: boolean;
  mappingsError: string | null;
  bibInput: string;
  setBibInput: (value: string) => void;
  pendingEpc: string | null;
  lastRssi: number | null;
  connectionStatus: ConnectionStatus;
  handleSave: () => void;
  handleClear: () => void;
  handleDelete: (params: DeleteBibMappingParams) => void;
  isSaving: boolean;
  isDeleting: boolean;
}

export function useBibMapping(raceId: string): UseBibMappingReturn {
  const queryClient = useQueryClient();
  const { lastEpc, lastRssi, connectionStatus } = useBibMappingHub();

  const [bibInput, setBibInput] = useState('');
  const [pendingEpc, setPendingEpc] = useState<string | null>(null);

  // When a new EPC is detected, set it as pending
  useEffect(() => {
    if (lastEpc) {
      setPendingEpc(lastEpc);
    }
  }, [lastEpc]);

  // Fetch existing mappings for this race
  const mappingsQuery = useQuery({
    queryKey: bibMappingKeys.byRace(raceId),
    queryFn: () => BibMappingService.getByRace(raceId),
    enabled: !!raceId,
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: (data: { raceId: string; bibNumber: string; epc: string }) =>
      BibMappingService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bibMappingKeys.byRace(raceId) });
      setBibInput('');
      setPendingEpc(null);
      toast.success('BIB mapping saved');
    },
    onError: () => {
      toast.error('Failed to save mapping');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (params: DeleteBibMappingParams) => BibMappingService.delete(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bibMappingKeys.byRace(raceId) });
      toast.success('Mapping deleted');
    },
    onError: () => {
      toast.error('Failed to delete mapping');
    },
  });

  const handleSave = useCallback(() => {
    if (!pendingEpc || !bibInput.trim()) return;
    saveMutation.mutate({
      raceId,
      bibNumber: bibInput.trim(),
      epc: pendingEpc,
    });
  }, [pendingEpc, bibInput, raceId, saveMutation]);

  const handleClear = useCallback(() => {
    setPendingEpc(null);
    setBibInput('');
  }, []);

  const handleDelete = useCallback(
    (params: DeleteBibMappingParams) => {
      deleteMutation.mutate(params);
    },
    [deleteMutation]
  );

  return {
    mappings: mappingsQuery.data ?? [],
    isLoadingMappings: mappingsQuery.isLoading,
    mappingsError: mappingsQuery.error?.message ?? null,
    bibInput,
    setBibInput,
    pendingEpc,
    lastRssi,
    connectionStatus,
    handleSave,
    handleClear,
    handleDelete,
    isSaving: saveMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
