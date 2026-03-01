// Background-Konfiguration für PDF-Karten

export type BackgroundType = "solid" | "image";

export interface SolidBackground {
    type: "solid";
    color: string;
}

export interface ImageBackground {
    type: "image";
    url: string;
    opacity?: number;
}

export type BackgroundConfig = SolidBackground | ImageBackground;

/**
 * Erstellt ein Style-Objekt basierend auf der Background-Konfiguration
 */
export const createBackgroundStyle = (config?: BackgroundConfig): any => {
    if (!config) {
        return { backgroundColor: "#fdfdfd" }; // Standard
    }

    switch (config.type) {
        case "solid":
            return {
                backgroundColor: config.color,
            };

        case "image":
            // Bild-Hintergründe werden als separates <Image>-Layer gerendert
            return {
                backgroundColor: "#fdfdfd",
            };

        default:
            return { backgroundColor: "#fdfdfd" };
    }
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
};
