import type { Device, CreateDeviceRequest, UpdateDeviceRequest } from '../../../models/Device';

export interface DeviceFormData {
  name: string;
  deviceMacAddress: string;
  hostname: string;
  ipAddress: string;
  firmwareVersion: string;
  readerModel: string;
}

export const emptyFormData: DeviceFormData = {
  name: '',
  deviceMacAddress: '',
  hostname: '',
  ipAddress: '',
  firmwareVersion: '',
  readerModel: '',
};

export function toCreateRequest(form: DeviceFormData): CreateDeviceRequest {
  return {
    name: form.name.trim(),
    deviceMacAddress: form.deviceMacAddress.trim() || undefined,
    hostname: form.hostname.trim() || undefined,
    ipAddress: form.ipAddress.trim() || undefined,
    firmwareVersion: form.firmwareVersion.trim() || undefined,
    readerModel: form.readerModel.trim() || undefined,
  };
}

export function toUpdateRequest(form: DeviceFormData): UpdateDeviceRequest {
  return toCreateRequest(form);
}

export function toFormData(device: Device): DeviceFormData {
  return {
    name: device.name,
    deviceMacAddress: device.deviceMacAddress ?? '',
    hostname: device.hostname ?? '',
    ipAddress: device.ipAddress ?? '',
    firmwareVersion: device.firmwareVersion ?? '',
    readerModel: device.readerModel ?? '',
  };
}
