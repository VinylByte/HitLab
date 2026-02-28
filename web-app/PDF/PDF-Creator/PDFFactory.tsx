import React from "react";
import { Document, Page, View } from "@react-pdf/renderer";
import type { Card } from "../PDF-Template/PageComponents";
import { CardFront, CardBack, CardFrontPage, CardBackPage } from "../PDF-Template/PageComponents";
import { OnePageStyles, DoublePageStyles } from "../PDF-Template/Templates";

// Typen für die verschiedenen PDF-Varianten
export type PDFType = "one-sided" | "double-sided";
export type BindingMode = "short-edge" | "long-edge";

export interface PDFFactoryProps {
    cards: Card[];
    type: PDFType;
    bindingMode?: BindingMode; // Nur relevant für double-sided
}

// Hilfsfunktion: Teilt das Array in Blöcke
const createChunks = (array: Card[], size: number): Card[][] => {
    const chunks: Card[][] = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
};

// Spiegeln an der langen Seite (Long-Edge / Buch-Bindung)
const flipForLongEdgeBinding = (array: Card[], size: number): Card[] => {
    const reversed = [...array].reverse();
    const chunks = [];
    for (let i = 0; i < reversed.length; i += size) {
        chunks.push(...reversed.slice(i, i + size).reverse());
    }
    return chunks;
};

/**
 * PDF Factory - Universelle PDF-Komponente
 * Kann sowohl one-sided (Faltkarten) als auch double-sided (beidseitig gedruckte Karten) PDFs erstellen
 *
 * @param cards - Array von Karten-Daten
 * @param type - "one-sided" für Faltkarten, "double-sided" für beidseitigen Druck
 * @param bindingMode - "short-edge" oder "long-edge" (nur für double-sided)
 */
export const PDFFactory = ({ cards, type, bindingMode = "long-edge" }: PDFFactoryProps) => {
    // ONE-SIDED: Faltkarten auf einem Blatt
    if (type === "one-sided") {
        return (
            <Document>
                <Page size="A4" style={OnePageStyles.page}>
                    <View style={OnePageStyles.grid}>
                        {cards.map((card, index) => (
                            <View key={index} style={OnePageStyles.cardContainer}>
                                {/* Obere Hälfte: Vorderseite */}
                                <View style={OnePageStyles.frontSide}>
                                    <CardFront card={card} styles={OnePageStyles} />
                                </View>
                                {/* Untere Hälfte: Rückseite (wird umgeknickt) */}
                                <View style={OnePageStyles.backSide}>
                                    <CardBack card={card} styles={OnePageStyles} />
                                </View>
                            </View>
                        ))}
                    </View>
                </Page>
            </Document>
        );
    }

    // DOUBLE-SIDED: Beidseitig gedruckte Karten
    const cardsPerRow = 3;
    const CARDS_PER_PAGE = 12;
    const cardChunks = createChunks(cards, CARDS_PER_PAGE);

    return (
        <Document>
            {cardChunks.map((chunk, chunkIndex) => {
                const flippedChunk =
                    bindingMode === "long-edge"
                        ? flipForLongEdgeBinding(chunk, cardsPerRow)
                        : chunk;

                return (
                    <React.Fragment key={chunkIndex}>
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
                    </React.Fragment>
                );
            })}
        </Document>
    );
};
