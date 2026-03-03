export type BackgroundType = "solid" | "image" | "gradient";

export interface SolidBackground {
    type: "solid";
    color: string;
}

export interface ImageBackground {
    type: "image";
    url: string;
    opacity?: number;
}

export interface GradientColorStop {
    color: string;
    position: number; // Prozentwert 0-100
}

export interface GradientBackground {
    type: "gradient";
    gradientType?: "linear" | "radial";
    angle?: number; // CSS-Grad (z. B. 90 für links -> rechts)
    centerX?: number; // Prozentwert 0-100 (nur radial)
    centerY?: number; // Prozentwert 0-100 (nur radial)
    colorStops?: GradientColorStop[];
    css?: string; // z. B. linear-gradient(...) oder radial-gradient(...)
}

export type BackgroundConfig = SolidBackground | GradientBackground | ImageBackground;

export interface Card {
    artist: string;
    title: string;
    year: string;
    url: string;
    frontBackground?: BackgroundConfig;
    backBackground?: BackgroundConfig;
    qrDataUri?: string; // optional vor-generierte QR-Code Data-URL
}

export interface PageComponentProps {
    cards: Card[];
    styles: any;
    chunkIndex: number;
    frontBackground?: BackgroundConfig;
    backBackground?: BackgroundConfig;
}

export interface CardComponentProps {
    card: Card;
    styles: any;
    background?: BackgroundConfig;
}

export type PDFType = "one-sided" | "double-sided";
export type BindingMode = "short-edge" | "long-edge";

export interface PDFFactoryProps {
    cards: Card[];
    type: PDFType;
    bindingMode?: BindingMode;
    frontBackground?: BackgroundConfig | BackgroundConfig[];
    backBackground?: BackgroundConfig | BackgroundConfig[];
}

export interface PDFQRCodeProps {
    url: string;
}