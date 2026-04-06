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
  submitError: string | null;
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
  const [submitError, setSubmitError] = useState<string | null>(null);

  const devicesQuery = useQuery({
    queryKey: deviceKeys.all,
    queryFn: () => DevicesService.getDevices(),
  });

  const createMutation = useMutation({
    mutationFn: (data: DeviceFormData) => DevicesService.createDevice(toCreateRequest(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deviceKeys.all });
      toast.success('Device created successfully');
      setIsFormOpen(false);
    },
    onError: (error: any) => {
      let message = 'Failed to create device';
      if (error?.response?.data) {
        if (typeof error.response.data === 'string') {
          message = error.response.data;
        } else if (error.response.data.message) {
          message = error.response.data.message;
        } else if (error.response.data.error) {
          message = error.response.data.error;
        } else {
          message = error?.message || 'Failed to create device';
        }
      } else {
        message = error?.message || 'Failed to create device';
      }
      setSubmitError(message);
      toast.error(message);
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
    onError: (error: any) => {
      let message = 'Failed to update device';
      if (error?.response?.data) {
        if (typeof error.response.data === 'string') {
          message = error.response.data;
        } else if (error.response.data.message) {
          message = error.response.data.message;
        } else if (error.response.data.error) {
          message = error.response.data.error;
        } else {
          message = error?.message || 'Failed to update device';
        }
      } else {
        message = error?.message || 'Failed to update device';
      }
      setSubmitError(message);
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => DevicesService.deleteDevice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deviceKeys.all });
      toast.success('Device deleted successfully');
      setDeleteConfirmId(null);
    },
    onError: () => {
      toast.error('Failed to delete device');
    },
  });

  const openCreate = useCallback(() => {
    setEditingDevice(null);
    setSubmitError(null);
    setIsFormOpen(true);
  }, []);

  const openEdit = useCallback((device: Device) => {
    setEditingDevice(device);
    setSubmitError(null);
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
    submitError,
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
