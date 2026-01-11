import * as signalR from '@microsoft/signalr';

/**
 * Create a SignalR hub connection with automatic reconnection
 * @param hubUrl - The URL of the SignalR hub (e.g., '/hubs/race')
 * @returns Configured HubConnection instance
 */
export const createHubConnection = (hubUrl: string): signalR.HubConnection => {
  return new signalR.HubConnectionBuilder()
    .withUrl(hubUrl)
    .withAutomaticReconnect()
    .build();
};

/**
 * Usage example:
 * 
 * const connection = createHubConnection('/hubs/race');
 * 
 * // Start connection
 * await connection.start();
 * 
 * // Join a group
 * await connection.invoke('JoinRace', raceId);
 * 
 * // Listen to events
 * connection.on('EventName', (data) => {
 *   console.log('Received:', data);
 * });
 * 
 * // Stop on unmount
 * connection.stop();
 */
