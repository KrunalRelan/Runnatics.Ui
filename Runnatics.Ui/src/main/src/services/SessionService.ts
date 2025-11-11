import axios from 'axios';
import { Environments } from '../utility';
import { AppContext } from '../models/AppContext';
import {  ServiceUrl } from '../models/ServiceUrls';

export class SessionService {
    static getAppContext(): Promise<AppContext> {
        return axios.get<AppContext>(ServiceUrl.getAppContext()).then(response => response.data);
    }

    static resetSession(): void {
        const env = Environments.getCurrent();
        axios.get(`${window.location.protocol}//${env.prefix}/session/reset`, { withCredentials: true })
            .then(() => {
                window.location.reload();
            })
            .catch(error => {
                console.error('Error resetting session:', error);
            });
    }
}