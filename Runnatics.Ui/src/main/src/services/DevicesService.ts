import { Device } from "../models/Device";
import { ResponseBase } from "../models/ResponseBase";
import { ServiceUrl } from "../models/ServiceUrls";
import apiClient from "../utils/axios.config";

export class DevicesService {
    /**
  * Get all devices
  */
    static async getDevices(): Promise<Device[]> {
        const response = await apiClient.get<ResponseBase<Device[]>>(ServiceUrl.getAllDevices());
        const items = Array.isArray(response.data.message) ? response.data.message : [response.data.message];
        return items;
    }
}