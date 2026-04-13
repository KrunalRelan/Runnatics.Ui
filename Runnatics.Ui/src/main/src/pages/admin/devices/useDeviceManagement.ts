import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { DevicesService } from '../../../services/DevicesService';
import type { Device } from '../../../models/Device';
import type { DeviceFormData } from './DeviceManagement.types';
import { toCreateRequest, toUpdateRequest } from './DeviceManagement.types';

export const deviceKeys = {
  all: ['devices'] as const,
};

export interface UseDeviceManagementReturn {
  devices: Device[];
  isLoading: boolean;
  error: string | null;
  // Dialog state
  isFormOpen: boolean;
  editingDevice: Device | null;
  deleteConfirmId: number | null;
  // Actions
  openCreate: () => void;
  openEdit: (device: Device) => void;
  closeForm: () => void;
  openDeleteConfirm: (id: number) => void;
  closeDeleteConfirm: () => void;
  handleSubmit: (data: DeviceFormData) => void;
  handleDelete: () => void;
  isSaving: boolean;
  isDeleting: boolean;
}

export function useDeviceManagement(): UseDeviceManagementReturn {
  const queryClient = useQueryClient();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const devicesQuery = useQuery({
    queryKey: deviceKeys.all,
    queryFn: () => DevicesService.getDevices(),
  });

  const extractErrorMessage = (err: unknown, fallback: string): string => {
    const e = err as any;
    return (
      e?.response?.data?.message ||
      e?.response?.data?.title ||
      (typeof e?.response?.data === 'string' ? e.response.data : null) ||
      e?.message ||
      fallback
    );
  };

  const createMutation = useMutation({
    mutationFn: (data: DeviceFormData) => DevicesService.createDevice(toCreateRequest(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deviceKeys.all });
      toast.success('Device created successfully');
      setIsFormOpen(false);
    },
    onError: (err) => {
      toast.error(extractErrorMessage(err, 'Failed to create device'));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: DeviceFormData }) =>
      DevicesService.updateDevice(id, toUpdateRequest(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deviceKeys.all });
      toast.success('Device updated successfully');
      setIsFormOpen(false);
      setEditingDevice(null);
    },
    onError: (err) => {
      toast.error(extractErrorMessage(err, 'Failed to update device'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => DevicesService.deleteDevice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deviceKeys.all });
      toast.success('Device deleted successfully');
      setDeleteConfirmId(null);
    },
    onError: (err) => {
      toast.error(extractErrorMessage(err, 'Failed to delete device'));
    },
  });

  const openCreate = useCallback(() => {
    setEditingDevice(null);
    setIsFormOpen(true);
  }, []);

  const openEdit = useCallback((device: Device) => {
    setEditingDevice(device);
    setIsFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingDevice(null);
  }, []);

  const openDeleteConfirm = useCallback((id: number) => {
    setDeleteConfirmId(id);
  }, []);

  const closeDeleteConfirm = useCallback(() => {
    setDeleteConfirmId(null);
  }, []);

  const handleSubmit = useCallback((data: DeviceFormData) => {
    if (editingDevice) {
      updateMutation.mutate({ id: editingDevice.id, data });
    } else {
      createMutation.mutate(data);
    }
  }, [editingDevice, createMutation, updateMutation]);

  const handleDelete = useCallback(() => {
    if (deleteConfirmId !== null) {
      deleteMutation.mutate(deleteConfirmId);
    }
  }, [deleteConfirmId, deleteMutation]);

  return {
    devices: devicesQuery.data ?? [],
    isLoading: devicesQuery.isLoading,
    error: devicesQuery.error ? 'Failed to load devices' : null,
    isFormOpen,
    editingDevice,
    deleteConfirmId,
    openCreate,
    openEdit,
    closeForm,
    openDeleteConfirm,
    closeDeleteConfirm,
    handleSubmit,
    handleDelete,
    isSaving: createMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
