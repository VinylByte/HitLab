type SpotifyApiErrorCode =
    | "UNAUTHORIZED"
    | "FORBIDDEN"
    | "NO_ACTIVE_DEVICE"
    | "RATE_LIMIT"
    | "UNKNOWN";

export class SpotifyApiError extends Error {
    code: SpotifyApiErrorCode;
    retryAfterSec?: number;

    constructor(code: SpotifyApiErrorCode, message: string, retryAfterSec?: number) {
        super(message);
        this.code = code;
        this.retryAfterSec = retryAfterSec;
    }
}

export function mapSpotifyError(error: unknown): SpotifyApiError {
    if (error instanceof SpotifyApiError) {
        return error;
    }

    const status =
        typeof error === "object" && error !== null && "status" in error
            ? Number((error as { status: unknown }).status)
            : undefined;

    if (status === 401) {
        return new SpotifyApiError("UNAUTHORIZED", "Spotify Token ungültig oder abgelaufen.");
    }
    if (status === 403) {
        return new SpotifyApiError("FORBIDDEN", "Premium oder Scope fehlt.");
    }
    if (status === 404) {
        return new SpotifyApiError("NO_ACTIVE_DEVICE", "Kein aktives Spotify Gerät.");
    }
    if (status === 429) {
        return new SpotifyApiError("RATE_LIMIT", "Spotify Rate Limit erreicht.");
    }

    const message = error instanceof Error ? error.message : "Unbekannter Spotify Fehler";
    return new SpotifyApiError("UNKNOWN", message);
}
