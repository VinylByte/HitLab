import React from "react";
import { Document, Page, View } from "@react-pdf/renderer";
import type { Card } from "../PDF-Template/PageComponents";
import {
    CardFront,
    CardBack,
    CardFrontPage,
    CardBackPage,
    CardBackgroundLayer,
} from "../PDF-Template/PageComponents";
import { OnePageStyles, DoublePageStyles } from "../PDF-Template/Templates";
import type { BackgroundConfig } from "../PDF-Template/BackgroundConfig";
import { createBackgroundStyle } from "../PDF-Template/BackgroundConfig";

const cardContentStyle = {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    padding: 10,
};

// Typen für die verschiedenen PDF-Varianten
export type PDFType = "one-sided" | "double-sided";
export type BindingMode = "short-edge" | "long-edge";

export interface PDFFactoryProps {
    cards: Card[];
    type: PDFType;
    bindingMode?: BindingMode; // Nur relevant für double-sided
    frontBackground?: BackgroundConfig; // Hintergrund für Vorderseiten
    backBackground?: BackgroundConfig; // Hintergrund für Rückseiten
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
// Bei Long-Edge wird das Papier vertikal umgedreht (wie ein Buch)
// Jede Zeile muss horizontal gespiegelt werden
const flipForLongEdgeBinding = (array: Card[], size: number): Card[] => {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        // Jede Zeile (Chunk) wird umgekehrt
        chunks.push(...array.slice(i, i + size).reverse());
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
 * @param frontBackground - Hintergrund-Konfiguration für Vorderseiten
 * @param backBackground - Hintergrund-Konfiguration für Rückseiten
 */
export const PDFFactory = ({
    cards,
    type,
    bindingMode = "long-edge",
    frontBackground,
    backBackground,
}: PDFFactoryProps) => {
    // ONE-SIDED: Faltkarten auf einem Blatt
    if (type === "one-sided") {
        return (
            <Document>
                <Page size="A4" style={OnePageStyles.page}>
                    <View style={OnePageStyles.grid}>
                        {cards.map((card, index) => {
                            // Nutze kartenspezifischen Hintergrund, falls vorhanden, sonst den globalen
                            const cardFrontBg = card.frontBackground ?? frontBackground;
                            const cardBackBg = card.backBackground ?? backBackground;
                            const frontBgStyle = createBackgroundStyle(cardFrontBg);
                            const backBgStyle = createBackgroundStyle(cardBackBg);

                            return (
                                <View key={index} style={OnePageStyles.cardContainer}>
                                    {/* Obere Hälfte: Vorderseite */}
                                    <View style={[OnePageStyles.frontSide, frontBgStyle]}>
                                        <CardBackgroundLayer background={cardFrontBg} />
                                        <View style={cardContentStyle}>
                                            <CardFront
                                                card={card}
                                                styles={OnePageStyles}
                                                background={cardFrontBg}
                                            />
                                        </View>
                                    </View>
                                    {/* Untere Hälfte: Rückseite (wird umgeknickt) */}
                                    <View style={[OnePageStyles.backSide, backBgStyle]}>
                                        <CardBackgroundLayer background={cardBackBg} />
                                        <View style={cardContentStyle}>
                                            <CardBack
                                                card={card}
                                                styles={OnePageStyles}
                                                background={cardBackBg}
                                            />
                                        </View>
                                    </View>
                                </View>
                            );
                        })}
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
                            frontBackground={frontBackground}
                        />

                        {/* SEITE 2: ALLE RÜCKSEITEN (GESPIEGELT) */}
                        <CardBackPage
                            cards={flippedChunk}
                            styles={DoublePageStyles}
                            chunkIndex={chunkIndex}
                            backBackground={backBackground}
                        />
                    </React.Fragment>
                );
            })}
        </Document>
    );
};
