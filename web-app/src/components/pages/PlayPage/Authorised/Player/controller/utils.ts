import type { PlayerElementControllerOptions } from "./types";

export function toMs(seconds: number): number {
    return Math.floor(seconds * 1000);
}

export function buildPlaybackSignature(
    options: Required<
        Pick<
            PlayerElementControllerOptions,
            | "currentTrackId"
            | "startAtSeconds"
            | "stopAtSeconds"
            | "startAtMiddle"
            | "startAtRandom"
            | "minDistanceFromEndSeconds"
            | "maxPlayDurationSeconds"
        >
    >
): string {
    return [
        options.currentTrackId ?? "",
        options.startAtSeconds,
        options.stopAtSeconds ?? "none",
        options.startAtMiddle ? "middle" : "no-middle",
        options.startAtRandom ? "random" : "no-random",
        options.minDistanceFromEndSeconds,
        options.maxPlayDurationSeconds ?? "none",
    ].join(":");
}

export function resolveAutoStopAtMs(params: {
    effectiveStartMs: number;
    currentDurationMs: number;
    stopAtSeconds: number | null;
    maxPlayDurationSeconds: number | null;
}): number | null {
    const { effectiveStartMs, currentDurationMs, stopAtSeconds, maxPlayDurationSeconds } = params;

    const candidates: number[] = [];

    if (typeof stopAtSeconds === "number" && stopAtSeconds >= 0) {
        candidates.push(toMs(stopAtSeconds));
    }

    if (typeof maxPlayDurationSeconds === "number" && maxPlayDurationSeconds > 0) {
        candidates.push(effectiveStartMs + toMs(maxPlayDurationSeconds));
    }

    if (candidates.length === 0) return null;

    const rawStopAtMs = Math.min(...candidates);
    if (currentDurationMs > 0) {
        return Math.min(rawStopAtMs, currentDurationMs);
    }

    return rawStopAtMs;
}

export function computeDesiredStartMs(params: {
    startAtSeconds: number;
    startAtMiddle: boolean;
    startAtRandom: boolean;
    minDistanceFromEndSeconds: number;
    durationMs: number;
}): number {
    const { startAtSeconds, startAtMiddle, startAtRandom, minDistanceFromEndSeconds, durationMs } =
        params;

    if (durationMs <= 0) {
        return Math.max(0, toMs(startAtSeconds));
    }

    if (startAtMiddle) {
        return Math.floor(durationMs / 2);
    }

    if (startAtRandom) {
        const minDistanceMs = Math.max(0, toMs(minDistanceFromEndSeconds));
        const maxRandomStartMs = Math.max(0, durationMs - minDistanceMs);
        return Math.floor(Math.random() * (maxRandomStartMs + 1));
    }

    return Math.max(0, toMs(startAtSeconds));
}
