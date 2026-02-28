// Background-Konfiguration für PDF-Karten

export type BackgroundType = "solid" | "gradient" | "image";

export interface SolidBackground {
    type: "solid";
    color: string;
}

export interface GradientBackground {
    type: "gradient";
    colors: string[];
    angle?: number; // in Grad, Standard 0 (von links nach rechts)
}

export interface ImageBackground {
    type: "image";
    url: string;
    opacity?: number;
}

export type BackgroundConfig = SolidBackground | GradientBackground | ImageBackground;

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

        case "gradient":
            // @react-pdf/renderer unterstützt keine nativen Gradienten
            // Wir können ein lineares Gradient mit SVG oder mehreren Overlays simulieren
            // Für jetzt verwenden wir die erste Farbe als Fallback
            return {
                backgroundColor: config.colors[0],
                // Hinweis: Für echte Gradienten müsste man SVG verwenden
            };

        case "image":
            // @react-pdf/renderer kann Bilder als Hintergrund verwenden
            return {
                backgroundImage: `url(${config.url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                opacity: config.opacity ?? 1,
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
    
    blueGradient: {
        type: "gradient",
        colors: ["#667eea", "#764ba2"],
        angle: 135
    } as GradientBackground,
    
    sunsetGradient: {
        type: "gradient",
        colors: ["#f093fb", "#e98b98"],
        angle: 45
    } as GradientBackground,
};
