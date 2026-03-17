import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { Card, BackgroundConfig, BindingMode, PDFType } from "../interfaces";
import {
    A4_HEIGHT,
    A4_WIDTH,
    CARD_HEIGHT,
    CARDS_PER_PAGE_DOUBLE,
    CARDS_PER_PAGE_ONE,
    CARDS_PER_ROW_DOUBLE,
    CARDS_PER_ROW_ONE,
    CARD_WIDTH,
    DOUBLE_SIDED_COLUMN_GAP,
    DOUBLE_SIDED_ROW_GAP,
    ONE_SIDED_COLUMN_GAP,
    ONE_SIDED_ROW_GAP,
    PAGE_PADDING,
} from "./constants";
import {
    createChunks,
    dataUriToBytes,
    flipForLongEdgeBinding,
    resolveCardBackground,
} from "./helpers";
import {
    drawBackQr,
    drawCardBackground,
    drawDoubleSidedSeparators,
    drawFrontText,
} from "./drawing";

type GeneratePdfLibParams = {
    cards: Card[];
    type: PDFType;
    bindingMode: BindingMode;
    frontBackgrounds: BackgroundConfig[];
    backBackgrounds: BackgroundConfig[];
    onProgress?: (percent: number) => void;
    onBeforeFinalize?: () => void;
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

                await drawCardBackground(
                    frontPage,
                    background,
                    x,
                    y,
                    CARD_WIDTH,
                    CARD_HEIGHT,
                    getEmbeddedImage
                );
                drawFrontText(frontPage, card, x, y, CARD_WIDTH, CARD_HEIGHT, fontBold, fontItalic);

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

                await drawCardBackground(
                    backPage,
                    background,
                    x,
                    y,
                    CARD_WIDTH,
                    CARD_HEIGHT,
                    getEmbeddedImage
                );
                await drawBackQr(backPage, card, x, y, CARD_WIDTH, CARD_HEIGHT, getEmbeddedImage);

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

                await drawCardBackground(
                    page,
                    frontBackground,
                    x,
                    yTop,
                    CARD_WIDTH,
                    CARD_HEIGHT,
                    getEmbeddedImage
                );
                drawFrontText(page, card, x, yTop, CARD_WIDTH, CARD_HEIGHT, fontBold, fontItalic);

                await drawCardBackground(
                    page,
                    backBackground,
                    x,
                    yBottom,
                    CARD_WIDTH,
                    CARD_HEIGHT,
                    getEmbeddedImage
                );
                page.drawLine({
                    start: { x, y: yBottom + CARD_HEIGHT },
                    end: { x: x + CARD_WIDTH, y: yBottom + CARD_HEIGHT },
                    thickness: 1,
                    color: rgb(0, 0, 0),
                    dashArray: [4, 2],
                });
                await drawBackQr(page, card, x, yBottom, CARD_WIDTH, CARD_HEIGHT, getEmbeddedImage);

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
