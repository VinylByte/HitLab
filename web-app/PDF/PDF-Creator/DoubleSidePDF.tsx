import { Document } from "@react-pdf/renderer";
import type { Card } from "../PDF-Template/PageComponents";
import { DoublePageStyles } from "../PDF-Template/Templates";
import { CardFrontPage, CardBackPage } from "../PDF-Template/PageComponents";

// Spiegeln an der langen Seite (Long-Edge / Buch-Bindung)
// Die gesamte Reihenfolge wird umgekehrt UND jede Reihe wird umgekehrt
const flipForLongEdgeBinding = (array: any[], size: number) => {
    // Zuerst umkehren
    const reversed = array.reverse();
    // Dann jede Reihe innerhalb umkehren
    const chunks = [];
    for (let i = 0; i < reversed.length; i += size) {
        chunks.push(...reversed.slice(i, i + size).reverse());
    }
    return chunks;
};

// Hilfsfunktion: Teilt das Array in 12er Blöcke
const createChunks = (array: Card[], size: number): Card[][] => {
    const chunks: Card[][] = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
};

export const PDFSheetDoubleSide = ({
    cards,
    bindingMode = "long-edge",
}: {
    cards: Card[];
    bindingMode?: "short-edge" | "long-edge";
}) => {
    const cardsPerRow = 3;
    const CARDS_PER_PAGE = 12; // Dein Limit

    const cardChunks = createChunks(cards, CARDS_PER_PAGE);

    return (
        <Document>
            {cardChunks.map((chunk, chunkIndex) => {
                const flippedChunk =
                    bindingMode === "long-edge"
                        ? flipForLongEdgeBinding(chunk, cardsPerRow)
                        : chunk; // Short-Edge: Normal drucken, keine Spiegelung nötig

                return (
                    <>
                        {/* SEITE 1: ALLE VORDERSEITEN */}
                        <CardFrontPage
                            cards={chunk}
                            styles={DoublePageStyles}
                            chunkIndex={chunkIndex}
                        />

                        {/* SEITE 2: ALLE RÜCKSEITEN (GESPIEGELT) */}
                        <CardBackPage
                            cards={flippedChunk}
                            styles={DoublePageStyles}
                            chunkIndex={chunkIndex}
                        />
                    </>
                );
            })}
        </Document>
    );
};
