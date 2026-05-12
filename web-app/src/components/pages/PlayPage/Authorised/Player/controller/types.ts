export type PlayerElementControllerOptions = {
    currentTrackId: string | null;
    onError?: (message: string) => void;
    startAtSeconds?: number;
    stopAtSeconds?: number | null;
    startAtMiddle?: boolean;
    startAtRandom?: boolean;
    minDistanceFromEndSeconds?: number;
    maxPlayDurationSeconds?: number | null;
};

export type PlayerElementControllerState = {
    isPlaying: boolean;
    loading: boolean;
    autoPausedLocked: boolean;
    progressPct: number;
    togglePlay: () => Promise<void>;
};
