import type { GradientBackground, GradientColorStop, SolidBackground, BackgroundConfig } from "../interfaces";

const parseGradientAngleFromCss = (css: string): number | undefined => {
    const angleMatch = css.match(/linear-gradient\(\s*(-?\d+(?:\.\d+)?)deg/i);
    if (!angleMatch) {
        return undefined;
    }

    const parsedAngle = Number.parseFloat(angleMatch[1]);
    return Number.isNaN(parsedAngle) ? undefined : parsedAngle;
};

const parseGradientStopsFromCss = (css: string): GradientColorStop[] => {
    const stopRegex = /(rgba?\([^)]*\)|hsla?\([^)]*\)|#[0-9a-fA-F]{3,8})\s+(-?\d+(?:\.\d+)?)%/g;
    const parsedStops: GradientColorStop[] = [];
    let match: RegExpExecArray | null = stopRegex.exec(css);

    while (match) {
        parsedStops.push({
            color: match[1],
            position: Number.parseFloat(match[2]),
        });
        match = stopRegex.exec(css);
    }

    return parsedStops;
};

export const resolveGradientBackground = (
    background: GradientBackground
): { angle: number; colorStops: GradientColorStop[] } | null => {
    const cssAngle = background.css ? parseGradientAngleFromCss(background.css) : undefined;
    const cssStops = background.css ? parseGradientStopsFromCss(background.css) : [];

    const colorStops =
        background.colorStops && background.colorStops.length > 0
            ? background.colorStops
            : cssStops;

    if (!colorStops.length) {
        return null;
    }

    return {
        angle: background.angle ?? cssAngle ?? 90,
        colorStops,
    };
};

// Cache für generierte Gradient-URLs
const gradientCache = new Map<string, string>();

/**
 * Erstellt einen Gradient als Canvas-basiertes PNG-Bild (Data-URL)
 * Funktioniert nur im Browser-Kontext
 */
export const createGradientDataUrl = (gradient: {
    angle: number;
    colorStops: GradientColorStop[];
}): string => {
    // Erstelle einen Cache-Key
    const cacheKey = `${gradient.angle}-${gradient.colorStops.map(s => `${s.color}@${s.position}`).join("-")}`;
    
    // Prüfe Cache
    if (gradientCache.has(cacheKey)) {
        return gradientCache.get(cacheKey)!;
    }

    // Fallback für nicht-Browser-Umgebungen
    if (typeof document === "undefined") {
        return "";
    }

    try {
        const canvas = document.createElement("canvas");
        canvas.width = 400;
        canvas.height = 400;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
            return "";
        }

        // Berechne Gradient-Richtung basierend auf dem Winkel
        const angleInRadians = (gradient.angle * Math.PI) / 180;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const length = Math.sqrt(canvas.width ** 2 + canvas.height ** 2) / 2;

        const x0 = centerX - Math.sin(angleInRadians) * length;
        const y0 = centerY + Math.cos(angleInRadians) * length;
        const x1 = centerX + Math.sin(angleInRadians) * length;
        const y1 = centerY - Math.cos(angleInRadians) * length;

        const gradientObj = ctx.createLinearGradient(x0, y0, x1, y1);

        // Füge alle Color-Stops hinzu
        gradient.colorStops.forEach(stop => {
            gradientObj.addColorStop(stop.position / 100, stop.color);
        });

        ctx.fillStyle = gradientObj;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Konvertiere zu PNG Data-URL
        const dataUrl = canvas.toDataURL("image/png");
        
        // Speichere im Cache
        gradientCache.set(cacheKey, dataUrl);
        
        return dataUrl;
    } catch (error) {
        console.error("Fehler beim Erstellen des Gradient-Images:", error);
        return "";
    }
};

/**
 * Erstellt ein Style-Objekt basierend auf der Background-Konfiguration
 */
export const createBackgroundStyle = (config?: BackgroundConfig) => {
    if (!config || config.type === "image") {
        return { backgroundColor: "#fdfdfd" };
    }

    if (config.type === "gradient") {
        const resolved = resolveGradientBackground(config);
        return { backgroundColor: resolved?.colorStops[0]?.color ?? "#fdfdfd" };
    }

    return { backgroundColor: config.color };
};

/**
 * Standard-Hintergründe als Presets
 */
export const BackgroundPresets = {
    white: { type: "solid", color: "#ffffff" } as SolidBackground,
    lightGray: { type: "solid", color: "#fdfdfd" } as SolidBackground,
    blue: { type: "solid", color: "#e3f2fd" } as SolidBackground,
    purple: { type: "solid", color: "#f3e5f5" } as SolidBackground,
    green: { type: "solid", color: "#e8f5e9" } as SolidBackground,
    oceanGradient: {
        type: "gradient",
        css: "linear-gradient(90deg, rgba(42, 123, 155, 1) 0%, rgba(87, 199, 133, 1) 50%, rgba(237, 221, 83, 1) 100%)",
    } as GradientBackground,
};
