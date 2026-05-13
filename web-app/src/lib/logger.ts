/**
 * Lightweight structured logger.
 *
 * Levels (low → high): debug < info < warn < error.
 * In dev (`import.meta.env.DEV`) all levels are emitted.
 * In production only `warn` and `error` are emitted by default.
 *
 * Override via Vite env var `VITE_LOG_LEVEL` (e.g. "debug" to enable
 * verbose logging in a production build).
 *
 * Usage:
 *   const log = createLogger("spotify");
 *   log.debug("searching tracks", { query });
 *   log.error("searchTracks failed", error);
 */

export type LogLevel = "debug" | "info" | "warn" | "error" | "silent";

const LEVEL_ORDER: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    silent: 4,
};

function resolveMinLevel(): LogLevel {
    const override = import.meta.env.VITE_LOG_LEVEL as LogLevel | undefined;
    if (override && override in LEVEL_ORDER) return override;
    return import.meta.env.DEV ? "debug" : "warn";
}

const MIN_LEVEL = resolveMinLevel();

function isEnabled(level: LogLevel): boolean {
    return LEVEL_ORDER[level] >= LEVEL_ORDER[MIN_LEVEL];
}

export interface Logger {
    debug: (...args: unknown[]) => void;
    info: (...args: unknown[]) => void;
    warn: (...args: unknown[]) => void;
    error: (...args: unknown[]) => void;
}

export function createLogger(scope: string): Logger {
    const tag = `[${scope}]`;
    return {
        debug: (...args) => {
            if (isEnabled("debug")) console.debug(tag, ...args);
        },
        info: (...args) => {
            if (isEnabled("info")) console.info(tag, ...args);
        },
        warn: (...args) => {
            if (isEnabled("warn")) console.warn(tag, ...args);
        },
        error: (...args) => {
            if (isEnabled("error")) console.error(tag, ...args);
        },
    };
}

export const logger = createLogger("app");
