export interface RaceSettings {
    id?: number;
    raceId?: number;
    published: boolean;  
    sendSms: boolean;
    checkValidation: boolean;
    showLeaderboard: boolean;
    showResultTable: boolean;
    isTimed: boolean;
    publishDnf: boolean;
    dedUpSeconds?: number;
    earlyStartCutOff?: number;
    lateStartCutOff?: number;
    hasLoops: boolean;
    loopLength?: number;
    dataHeaders?: string;
    createdAt?: string;
}