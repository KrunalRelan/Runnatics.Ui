import { Device, CreateDeviceRequest, UpdateDeviceRequest } from "../models/Device";
import { ResponseBase } from "../models/ResponseBase";
import { ServiceUrl } from "../models/ServiceUrls";
import apiClient from "../utils/axios.config";

export class DevicesService {
    static async getDevices(): Promise<Device[]> {
        const response = await apiClient.get<ResponseBase<Device[]>>(ServiceUrl.getAllDevices());
        const items = Array.isArray(response.data.message) ? response.data.message : [response.data.message];
        return items;
    }

    static async getDeviceById(id: number): Promise<Device> {
        const response = await apiClient.get<Device>(ServiceUrl.getDeviceById(id));
        return response.data;
    }

    static async createDevice(data: CreateDeviceRequest): Promise<void> {
        await apiClient.post(ServiceUrl.createDevice(), data);
    }

    static async updateDevice(id: number, data: UpdateDeviceRequest): Promise<void> {
        await apiClient.put(ServiceUrl.updateDevice(id), data);
    }

    static async deleteDevice(id: number): Promise<void> {
        await apiClient.delete(ServiceUrl.deleteDevice(id));
    }
}