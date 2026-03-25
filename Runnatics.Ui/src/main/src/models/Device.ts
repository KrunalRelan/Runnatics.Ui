export interface Device {
    id: number;
    deviceMacAddress?: string;
    name: string;
    tenantId: number;
    hostname?: string;
    ipAddress?: string;
    firmwareVersion?: string;
    readerModel?: string;
    isOnline: boolean;
    lastSeenAt?: string;
}

export interface CreateDeviceRequest {
    deviceMacAddress?: string;
    name: string;
    hostname?: string;
    ipAddress?: string;
    firmwareVersion?: string;
    readerModel?: string;
}

export interface UpdateDeviceRequest {
    deviceMacAddress?: string;
    name: string;
    hostname?: string;
    ipAddress?: string;
    firmwareVersion?: string;
    readerModel?: string;
}
