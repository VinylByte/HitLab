import type { BackgroundConfig, Card } from "../interfaces";

export const createChunks = <T,>(array: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
};

export const flipForLongEdgeBinding = (array: Card[], rowSize: number): Card[] => {
    const result: Card[] = [];
    for (let i = 0; i < array.length; i += rowSize) {
        result.push(...array.slice(i, i + rowSize).reverse());
    }
    return result;
};

export const getAlternatingBackground = (
    backgrounds: BackgroundConfig[],
    index: number
): BackgroundConfig | undefined => {
    if (!backgrounds.length) {
        return undefined;
    }
    return backgrounds[index % backgrounds.length];
};

export const resolveCardBackground = (
    card: Card,
    cardIndex: number,
    side: "front" | "back",
    frontBackgrounds: BackgroundConfig[],
    backBackgrounds: BackgroundConfig[]
): BackgroundConfig | undefined => {
    if (side === "front") {
        return card.frontBackground ?? getAlternatingBackground(frontBackgrounds, cardIndex);
    }

    return card.backBackground ?? getAlternatingBackground(backBackgrounds, cardIndex);
};

export const dataUriToBytes = (dataUri: string): Uint8Array => {
    const parts = dataUri.split(",");
    const base64 = parts.length > 1 ? parts[1] : "";
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
};

export const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
