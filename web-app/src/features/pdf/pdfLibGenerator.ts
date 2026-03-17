import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { Card, BackgroundConfig, BindingMode, PDFType } from "./interfaces";
import { resolveGradientBackground, createGradientDataUrl } from "./PDF-Template/BackgroundConfig";

type GeneratePdfLibParams = {
    cards: Card[];
    type: PDFType;
    bindingMode: BindingMode;
    frontBackgrounds: BackgroundConfig[];
    backBackgrounds: BackgroundConfig[];
    onProgress?: (percent: number) => void;
    onBeforeFinalize?: () => void;
};

const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;
const PAGE_PADDING = 30;
const CARD_WIDTH = 170;
const CARD_HEIGHT = 170;

const CARDS_PER_ROW_DOUBLE = 3;
const ROWS_PER_PAGE_DOUBLE = 4;
const CARDS_PER_PAGE_DOUBLE = CARDS_PER_ROW_DOUBLE * ROWS_PER_PAGE_DOUBLE;
const DOUBLE_SIDED_COLUMN_GAP = 0;
const DOUBLE_SIDED_ROW_GAP = 0;

const CARDS_PER_ROW_ONE = 3;
const ROWS_PER_PAGE_ONE = 2;
const CARDS_PER_PAGE_ONE = CARDS_PER_ROW_ONE * ROWS_PER_PAGE_ONE;
const ONE_SIDED_COLUMN_GAP = 8;
const ONE_SIDED_ROW_GAP = 24;

const HEX_SHORT = /^#([0-9a-fA-F]{3})$/;
const HEX_LONG = /^#([0-9a-fA-F]{6})$/;

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

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

const createChunks = <T,>(array: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
};

const flipForLongEdgeBinding = (array: Card[], rowSize: number): Card[] => {
    const result: Card[] = [];
    for (let i = 0; i < array.length; i += rowSize) {
        result.push(...array.slice(i, i + rowSize).reverse());
    }
    return result;
};

const getAlternatingBackground = (backgrounds: BackgroundConfig[], index: number) => {
    if (!backgrounds.length) {
        return undefined;
    }
    return backgrounds[index % backgrounds.length];
};

const resolveCardBackground = (
    card: Card,
    cardIndex: number,
    side: "front" | "back",
    frontBackgrounds: BackgroundConfig[],
    backBackgrounds: BackgroundConfig[]
) => {
    if (side === "front") {
        return card.frontBackground ?? getAlternatingBackground(frontBackgrounds, cardIndex);
    }

    return card.backBackground ?? getAlternatingBackground(backBackgrounds, cardIndex);
};

const dataUriToBytes = (dataUri: string): Uint8Array => {
    const parts = dataUri.split(",");
    const base64 = parts.length > 1 ? parts[1] : "";
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
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

const drawImageCover = (
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

export const generateDeckPdfBlob = async ({
    cards,
    type,
    bindingMode,
    frontBackgrounds,
    backBackgrounds,
    onProgress,
    onBeforeFinalize,
}: GeneratePdfLibParams): Promise<Blob> => {
    const pdfDoc = await PDFDocument.create();
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    const imageCache = new Map<string, any>();
    const getEmbeddedImage = async (sourceUrl: string) => {
        if (imageCache.has(sourceUrl)) {
            return imageCache.get(sourceUrl);
        }

        let bytes: Uint8Array;
        if (sourceUrl.startsWith("data:")) {
            bytes = dataUriToBytes(sourceUrl);
        } else {
            const response = await fetch(sourceUrl);
            bytes = new Uint8Array(await response.arrayBuffer());
        }

        const lower = sourceUrl.toLowerCase();
        const image =
            lower.includes("image/png") || lower.endsWith(".png")
                ? await pdfDoc.embedPng(bytes)
                : await pdfDoc.embedJpg(bytes);

        imageCache.set(sourceUrl, image);
        return image;
    };

    const totalSteps = type === "double-sided" ? cards.length * 2 : cards.length;
    let completedSteps = 0;
    let lastReported = -1;

    const reportProgress = () => {
        if (!onProgress || totalSteps <= 0) {
            return;
        }
        const percent = Math.min(100, Math.round((completedSteps / totalSteps) * 100));
        if (percent !== lastReported) {
            lastReported = percent;
            onProgress(percent);
        }
    };

    onProgress?.(0);

    const drawCardBackground = async (
        page: any,
        background: BackgroundConfig | undefined,
        x: number,
        y: number,
        width: number,
        height: number
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
            drawImageCover(page, image, x, y, width, height, imageBackground.opacity ?? 1);
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

    const wrapText = (
        text: string,
        font: any,
        size: number,
        maxWidth: number,
        maxLines: number
    ) => {
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

    const drawFrontText = (page: any, card: Card, x: number, y: number, width: number, height: number) => {
        const centerX = x + width / 2;
        const maxTextWidth = width - 16;
        const artistSize = 12;
        const yearSize = 26;
        const titleSize = 10;
        const artistLineHeight = 14;
        const titleLineHeight = 12;

        const artistLines = wrapText(card.artist ?? "", fontBold, artistSize, maxTextWidth, 2);
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

        const yearText = String(card.year ?? "");
        const yearWidth = fontBold.widthOfTextAtSize(yearText, yearSize);
        page.drawText(yearText, {
            x: centerX - yearWidth / 2,
            y: y + height / 2 - 6,
            size: yearSize,
            font: fontBold,
            color: rgb(0, 0, 0),
        });

        const titleLines = wrapText(card.title ?? "", fontItalic, titleSize, maxTextWidth, 2);
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

    const drawBackQr = async (
        page: any,
        card: Card,
        x: number,
        y: number,
        width: number,
        height: number
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

    const drawDoubleSidedSeparators = (page: any) => {
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
            const x =
                left +
                col * CARD_WIDTH +
                (col - 0.5) * DOUBLE_SIDED_COLUMN_GAP;
            page.drawLine({
                start: { x, y: bottom },
                end: { x, y: top },
                thickness: 0.8,
                color: separatorColor,
                dashArray: [4, 2],
            });
        }

        for (let row = 1; row < ROWS_PER_PAGE_DOUBLE; row++) {
            const y =
                top -
                row * CARD_HEIGHT -
                (row - 0.5) * DOUBLE_SIDED_ROW_GAP;
            page.drawLine({
                start: { x: left, y },
                end: { x: right, y },
                thickness: 0.8,
                color: separatorColor,
                dashArray: [4, 2],
            });
        }
    };

    if (type === "double-sided") {
        const chunks = createChunks(cards, CARDS_PER_PAGE_DOUBLE);

        for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
            const chunk = chunks[chunkIndex];
            const chunkStart = chunkIndex * CARDS_PER_PAGE_DOUBLE;
            const frontPage = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);
            for (let i = 0; i < chunk.length; i++) {
                const row = Math.floor(i / CARDS_PER_ROW_DOUBLE);
                const col = i % CARDS_PER_ROW_DOUBLE;
                const x = PAGE_PADDING + col * (CARD_WIDTH + DOUBLE_SIDED_COLUMN_GAP);
                const y =
                    A4_HEIGHT -
                    PAGE_PADDING -
                    row * (CARD_HEIGHT + DOUBLE_SIDED_ROW_GAP) -
                    CARD_HEIGHT;
                const card = chunk[i];
                const globalIndex = chunkStart + i;
                const background = resolveCardBackground(
                    card,
                    globalIndex,
                    "front",
                    frontBackgrounds,
                    backBackgrounds
                );

                await drawCardBackground(frontPage, background, x, y, CARD_WIDTH, CARD_HEIGHT);
                drawFrontText(frontPage, card, x, y, CARD_WIDTH, CARD_HEIGHT);

                completedSteps += 1;
                reportProgress();
            }

            drawDoubleSidedSeparators(frontPage);

            const backPage = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);
            const backCards =
                bindingMode === "long-edge"
                    ? flipForLongEdgeBinding(chunk, CARDS_PER_ROW_DOUBLE)
                    : chunk;

            for (let i = 0; i < backCards.length; i++) {
                const row = Math.floor(i / CARDS_PER_ROW_DOUBLE);
                const col = i % CARDS_PER_ROW_DOUBLE;
                const x = PAGE_PADDING + col * (CARD_WIDTH + DOUBLE_SIDED_COLUMN_GAP);
                const y =
                    A4_HEIGHT -
                    PAGE_PADDING -
                    row * (CARD_HEIGHT + DOUBLE_SIDED_ROW_GAP) -
                    CARD_HEIGHT;
                const card = backCards[i];
                const originalIndex = chunk.findIndex(candidate => candidate === card);
                const globalIndex =
                    originalIndex >= 0 ? chunkStart + originalIndex : chunkStart + i;
                const background = resolveCardBackground(
                    card,
                    globalIndex,
                    "back",
                    frontBackgrounds,
                    backBackgrounds
                );

                await drawCardBackground(backPage, background, x, y, CARD_WIDTH, CARD_HEIGHT);
                await drawBackQr(backPage, card, x, y, CARD_WIDTH, CARD_HEIGHT);

                completedSteps += 1;
                reportProgress();
            }

            drawDoubleSidedSeparators(backPage);
        }
    } else {
        const chunks = createChunks(cards, CARDS_PER_PAGE_ONE);

        for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
            const chunk = chunks[chunkIndex];
            const chunkStart = chunkIndex * CARDS_PER_PAGE_ONE;
            const page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);
            for (let i = 0; i < chunk.length; i++) {
                const row = Math.floor(i / CARDS_PER_ROW_ONE);
                const col = i % CARDS_PER_ROW_ONE;
                const x = PAGE_PADDING + col * (CARD_WIDTH + ONE_SIDED_COLUMN_GAP);
                const yTop =
                    A4_HEIGHT -
                    PAGE_PADDING -
                    row * (CARD_HEIGHT * 2 + ONE_SIDED_ROW_GAP) -
                    CARD_HEIGHT;
                const yBottom = yTop - CARD_HEIGHT;

                const card = chunk[i];
                const globalIndex = chunkStart + i;
                const frontBackground = resolveCardBackground(
                    card,
                    globalIndex,
                    "front",
                    frontBackgrounds,
                    backBackgrounds
                );
                const backBackground = resolveCardBackground(
                    card,
                    globalIndex,
                    "back",
                    frontBackgrounds,
                    backBackgrounds
                );

                await drawCardBackground(page, frontBackground, x, yTop, CARD_WIDTH, CARD_HEIGHT);
                drawFrontText(page, card, x, yTop, CARD_WIDTH, CARD_HEIGHT);

                await drawCardBackground(page, backBackground, x, yBottom, CARD_WIDTH, CARD_HEIGHT);
                page.drawLine({
                    start: { x, y: yBottom + CARD_HEIGHT },
                    end: { x: x + CARD_WIDTH, y: yBottom + CARD_HEIGHT },
                    thickness: 1,
                    color: rgb(0, 0, 0),
                    dashArray: [4, 2],
                });
                await drawBackQr(page, card, x, yBottom, CARD_WIDTH, CARD_HEIGHT);

                completedSteps += 1;
                reportProgress();
            }
        }
    }

    onBeforeFinalize?.();
    const bytes = await pdfDoc.save();
    const safeBytes = new Uint8Array(bytes.byteLength);
    safeBytes.set(bytes);
    return new Blob([safeBytes], { type: "application/pdf" });
};
