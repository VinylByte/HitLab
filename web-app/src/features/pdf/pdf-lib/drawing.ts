import { rgb } from "pdf-lib";
import type { BackgroundConfig, Card } from "../interfaces";
import {
    A4_HEIGHT,
    CARD_HEIGHT,
    CARD_WIDTH,
    CARDS_PER_ROW_DOUBLE,
    DOUBLE_SIDED_COLUMN_GAP,
    DOUBLE_SIDED_ROW_GAP,
    PAGE_PADDING,
    ROWS_PER_PAGE_DOUBLE,
} from "./constants";
import { clamp01 } from "./helpers";
import { resolveGradientBackground, createGradientDataUrl } from "../Design/BackgroundConfig";

type EmbeddedImageLoader = (sourceUrl: string) => Promise<any>;

const HEX_SHORT = /^#([0-9a-fA-F]{3})$/;
const HEX_LONG = /^#([0-9a-fA-F]{6})$/;

/**
 * Sanitizes text to remove diacritics/accents and special Latin characters for PDF rendering.
 * Helvetica font in pdf-lib doesn't support extended Unicode characters.
 * é → e, ç → c, ö → o, Ł → L, Ñ → N, etc.
 */
const sanitizeTextForPdf = (text: string): string => {
    // First, handle special latin characters that don't decompose via NFD
    const specialCharMap: Record<string, string> = {
        'Ł': 'L',
        'ł': 'l',
        'Ø': 'O',
        'ø': 'o',
        'Ð': 'D',
        'ð': 'd',
        'Þ': 'Th',
        'þ': 'th',
        'ß': 'ss',
        'æ': 'ae',
        'Æ': 'AE',
        'œ': 'oe',
        'Œ': 'OE',
        'ƒ': 'f',
    };

    let result = text;
    
    // Replace special characters
    for (const [char, replacement] of Object.entries(specialCharMap)) {
        result = result.split(char).join(replacement);
    }

    // Then decompose and remove combining diacritical marks (é → e + accent → e)
    return result
        .normalize("NFD") // Decompose characters
        .replace(/[\u0300-\u036f]/g, ""); // Remove combining diacritical marks
};

const hexToRgb = (hex: string) => {
    const short = hex.match(HEX_SHORT);
    if (short) {
        const [r, g, b] = short[1].split("").map(v => Number.parseInt(v + v, 16) / 255);
        return { r, g, b };
    }

    const long = hex.match(HEX_LONG);
    if (long) {
        const value = long[1];
        return {
            r: Number.parseInt(value.slice(0, 2), 16) / 255,
            g: Number.parseInt(value.slice(2, 4), 16) / 255,
            b: Number.parseInt(value.slice(4, 6), 16) / 255,
        };
    }

    return { r: 0.99, g: 0.99, b: 0.99 };
};

const normalizeBackgroundToImage = (background: BackgroundConfig | undefined) => {
    if (!background) {
        return undefined;
    }

    if (background.type === "image") {
        return background;
    }

    if (background.type === "gradient") {
        const resolved = resolveGradientBackground(background);
        if (!resolved) {
            return undefined;
        }
        const dataUrl = createGradientDataUrl(resolved);
        if (!dataUrl) {
            return undefined;
        }
        return { type: "image", url: dataUrl, opacity: 1 } as BackgroundConfig;
    }

    return undefined;
};

const drawImageToBounds = (
    page: any,
    image: any,
    x: number,
    y: number,
    width: number,
    height: number,
    opacity = 1
) => {
    page.drawImage(image, {
        x,
        y,
        width,
        height,
        opacity: clamp01(opacity),
    });
};

export const drawCardBackground = async (
    page: any,
    background: BackgroundConfig | undefined,
    x: number,
    y: number,
    width: number,
    height: number,
    getEmbeddedImage: EmbeddedImageLoader
) => {
    const colorBackground =
        background && background.type === "solid"
            ? background
            : ({ type: "solid", color: "#fdfdfd" } as BackgroundConfig);

    const fillRgb =
        colorBackground.type === "solid" ? hexToRgb(colorBackground.color) : hexToRgb("#fdfdfd");

    page.drawRectangle({
        x,
        y,
        width,
        height,
        color: rgb(fillRgb.r, fillRgb.g, fillRgb.b),
    });

    const imageBackground = normalizeBackgroundToImage(background);
    if (!imageBackground || imageBackground.type !== "image") {
        return;
    }

    try {
        const image = await getEmbeddedImage(imageBackground.url);
        drawImageToBounds(page, image, x, y, width, height, imageBackground.opacity ?? 1);
    } catch {
        // ignore image load failures and keep fallback background color
    }
};

const truncateToWidth = (text: string, font: any, size: number, maxWidth: number) => {
    if (font.widthOfTextAtSize(text, size) <= maxWidth) {
        return text;
    }

    const suffix = "...";
    let result = text;
    while (result.length > 0 && font.widthOfTextAtSize(`${result}${suffix}`, size) > maxWidth) {
        result = result.slice(0, -1);
    }

    return `${result}${suffix}`;
};

const wrapText = (text: string, font: any, size: number, maxWidth: number, maxLines: number) => {
    const words = text.trim().split(/\s+/).filter(Boolean);
    if (!words.length || maxLines <= 0) {
        return [] as string[];
    }

    const lines: string[] = [];
    let current = "";
    let overflow = false;

    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const candidate = current ? `${current} ${word}` : word;

        if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
            current = candidate;
            continue;
        }

        if (current) {
            lines.push(current);
            current = "";

            if (lines.length >= maxLines) {
                overflow = true;
                break;
            }

            i -= 1;
            continue;
        }

        lines.push(truncateToWidth(word, font, size, maxWidth));
        if (lines.length >= maxLines) {
            overflow = i < words.length - 1;
            break;
        }
    }

    if (current && lines.length < maxLines) {
        lines.push(current);
    } else if (current) {
        overflow = true;
    }

    if (overflow && lines.length) {
        lines[lines.length - 1] = truncateToWidth(lines[lines.length - 1], font, size, maxWidth);
    }

    return lines.slice(0, maxLines);
};

export const drawFrontText = (
    page: any,
    card: Card,
    x: number,
    y: number,
    width: number,
    height: number,
    fontBold: any,
    fontItalic: any
) => {
    const centerX = x + width / 2;
    const maxTextWidth = width - 16;
    const artistSize = 12;
    const yearSize = 26;
    const titleSize = 10;
    const artistLineHeight = 14;
    const titleLineHeight = 12;

    // Sanitize all text to remove diacritics that Helvetica can't encode
    const sanitizedArtist = sanitizeTextForPdf(card.artist ?? "");
    const sanitizedTitle = sanitizeTextForPdf(card.title ?? "");
    const sanitizedYear = sanitizeTextForPdf(String(card.year ?? ""));

    const artistLines = wrapText(sanitizedArtist, fontBold, artistSize, maxTextWidth, 2);
    const artistStartY = y + height - 40;
    artistLines.forEach((line, index) => {
        const lineWidth = fontBold.widthOfTextAtSize(line, artistSize);
        page.drawText(line, {
            x: centerX - lineWidth / 2,
            y: artistStartY - index * artistLineHeight,
            size: artistSize,
            font: fontBold,
            color: rgb(0, 0, 0),
        });
    });

    const yearWidth = fontBold.widthOfTextAtSize(sanitizedYear, yearSize);
    page.drawText(sanitizedYear, {
        x: centerX - yearWidth / 2,
        y: y + height / 2 - 6,
        size: yearSize,
        font: fontBold,
        color: rgb(0, 0, 0),
    });

    const titleLines = wrapText(sanitizedTitle, fontItalic, titleSize, maxTextWidth, 2);
    const titleStartY = y + 36;
    titleLines.forEach((line, index) => {
        const lineWidth = fontItalic.widthOfTextAtSize(line, titleSize);
        page.drawText(line, {
            x: centerX - lineWidth / 2,
            y: titleStartY - index * titleLineHeight,
            size: titleSize,
            font: fontItalic,
            color: rgb(0, 0, 0),
        });
    });
};

export const drawBackQr = async (
    page: any,
    card: Card,
    x: number,
    y: number,
    width: number,
    height: number,
    getEmbeddedImage: EmbeddedImageLoader
) => {
    if (!card.qrDataUri) {
        return;
    }

    try {
        const qrImage = await getEmbeddedImage(card.qrDataUri);
        const qrSize = 90;
        const qrX = x + (width - qrSize) / 2;
        const qrY = y + (height - qrSize) / 2;
        page.drawImage(qrImage, {
            x: qrX,
            y: qrY,
            width: qrSize,
            height: qrSize,
        });
    } catch {
        // ignore broken QR images
    }
};

export const drawDoubleSidedSeparators = (page: any) => {
    const separatorColor = rgb(0.6, 0.6, 0.6);
    const left = PAGE_PADDING;
    const top = A4_HEIGHT - PAGE_PADDING;
    const gridWidth =
        CARDS_PER_ROW_DOUBLE * CARD_WIDTH +
        (CARDS_PER_ROW_DOUBLE - 1) * DOUBLE_SIDED_COLUMN_GAP;
    const gridHeight =
        ROWS_PER_PAGE_DOUBLE * CARD_HEIGHT +
        (ROWS_PER_PAGE_DOUBLE - 1) * DOUBLE_SIDED_ROW_GAP;
    const right = left + gridWidth;
    const bottom = top - gridHeight;

    for (let col = 1; col < CARDS_PER_ROW_DOUBLE; col++) {
        const x = left + col * CARD_WIDTH + (col - 0.5) * DOUBLE_SIDED_COLUMN_GAP;
        page.drawLine({
            start: { x, y: bottom },
            end: { x, y: top },
            thickness: 0.8,
            color: separatorColor,
            dashArray: [4, 2],
        });
    }

    for (let row = 1; row < ROWS_PER_PAGE_DOUBLE; row++) {
        const y = top - row * CARD_HEIGHT - (row - 0.5) * DOUBLE_SIDED_ROW_GAP;
        page.drawLine({
            start: { x: left, y },
            end: { x: right, y },
            thickness: 0.8,
            color: separatorColor,
            dashArray: [4, 2],
        });
    }
};
