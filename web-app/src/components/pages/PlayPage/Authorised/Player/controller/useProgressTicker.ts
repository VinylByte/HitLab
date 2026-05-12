import { useEffect } from "react";

export function useProgressTicker(params: {
    isPlaying: boolean;
    durationMs: number;
    isMountedRef: React.RefObject<boolean>;
    setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
    setProgressMs: React.Dispatch<React.SetStateAction<number>>;
    clearAutoPauseTimeout: () => void;
}) {
    const {
        isPlaying,
        durationMs,
        isMountedRef,
        setIsPlaying,
        setProgressMs,
        clearAutoPauseTimeout,
    } = params;

    useEffect(() => {
        if (!isPlaying || durationMs <= 0) return;

        const intervalId = window.setInterval(() => {
            setProgressMs(prev => {
                const next = prev + 1000;
                if (next >= durationMs) {
                    if (isMountedRef.current) setIsPlaying(false);
                    clearAutoPauseTimeout();
                    return durationMs;
                }
                return next;
            });
        }, 1000);

        return () => window.clearInterval(intervalId);
    }, [clearAutoPauseTimeout, durationMs, isMountedRef, isPlaying, setIsPlaying, setProgressMs]);
}
