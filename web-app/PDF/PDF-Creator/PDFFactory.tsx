import React from "react";
import { Document, Page, View } from "@react-pdf/renderer";
import type { Card } from "../PDF-Template/PageComponents";
import {
    CardFront,
    CardBack,
    CardFrontPage,
    CardBackPage,
    CardBackgroundLayer,
    cardContentStyle,
} from "../PDF-Template/PageComponents";
import { OnePageStyles, DoublePageStyles } from "../PDF-Template/Templates";
import type { BackgroundConfig } from "../PDF-Template/BackgroundConfig";
import { createBackgroundStyle } from "../PDF-Template/BackgroundConfig";

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

const createChunks = <T,>(array: T[], size: number): T[][] =>
    Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
        array.slice(i * size, i * size + size)
    );

const flipForLongEdgeBinding = (array: Card[], rowSize: number): Card[] => {
    const result: Card[] = [];
    for (let i = 0; i < array.length; i += rowSize) {
        result.push(...array.slice(i, i + rowSize).reverse());
    }
    return result;
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
                            const cardFrontBg = card.frontBackground ?? frontBackground;
                            const cardBackBg = card.backBackground ?? backBackground;

                            return (
                                <View key={index} style={OnePageStyles.cardContainer}>
                                    <View
                                        style={[
                                            OnePageStyles.frontSide,
                                            createBackgroundStyle(cardFrontBg),
                                        ]}
                                    >
                                        <CardBackgroundLayer background={cardFrontBg} />
                                        <View style={cardContentStyle}>
                                            <CardFront card={card} styles={OnePageStyles} />
                                        </View>
                                    </View>
                                    <View
                                        style={[
                                            OnePageStyles.backSide,
                                            createBackgroundStyle(cardBackBg),
                                        ]}
                                    >
                                        <CardBackgroundLayer background={cardBackBg} />
                                        <View style={cardContentStyle}>
                                            <CardBack card={card} styles={OnePageStyles} />
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
                        <CardFrontPage
                            cards={chunk}
                            styles={DoublePageStyles}
                            chunkIndex={chunkIndex}
                            frontBackground={frontBackground}
                        />
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
