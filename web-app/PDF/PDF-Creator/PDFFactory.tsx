import React from "react";
import { Document, View } from "@react-pdf/renderer";
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
    frontBackground?: BackgroundConfig | BackgroundConfig[]; // Hintergrund für Vorderseiten
    backBackground?: BackgroundConfig | BackgroundConfig[]; // Hintergrund für Rückseiten
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

const getAlternatingBackground = (
    backgrounds: BackgroundConfig | BackgroundConfig[] | undefined,
    index: number
): BackgroundConfig | undefined => {
    if (!backgrounds) {
        return undefined;
    }

    if (!Array.isArray(backgrounds)) {
        return backgrounds;
    }

    if (!backgrounds.length) {
        return undefined;
    }

    return backgrounds[index % backgrounds.length];
};

const applyGlobalAlternatingBackgrounds = (
    cards: Card[],
    frontBackgrounds: BackgroundConfig | BackgroundConfig[] | undefined,
    backBackgrounds: BackgroundConfig | BackgroundConfig[] | undefined
): Card[] =>
    cards.map((card, index) => ({
        ...card,
        frontBackground: card.frontBackground ?? getAlternatingBackground(frontBackgrounds, index),
        backBackground: card.backBackground ?? getAlternatingBackground(backBackgrounds, index),
    }));

/**
 * PDFFactory - Universelle PDF-Komponente für Musikquiz-Karten
 *
 * Erstellt PDF-Dokumente in zwei Modi:
 * - ONE-SIDED: Faltkarten mit Vorder- und Rückseite auf einem Blatt (gestrichelte Faltlinie)
 * - DOUBLE-SIDED: Separate Seiten für beidseitigen Druck (3x4 Layout, 12 Karten/Blatt)
 *   • long-edge: Blatt an langer Kante umdrehen (Rückseiten horizontal gespiegelt)
 *   • short-edge: Blatt an kurzer Kante umdrehen (keine Spiegelung)
 *
 * Unterstützt Hintergründe: solid, gradient (CSS → PNG via Canvas), image
 * Globale Hintergründe können als einzelnes Design oder als Array übergeben werden.
 * Bei Arrays werden die Designs pro Karte abwechselnd verwendet.
 * Card-spezifische Hintergründe überschreiben globale Hintergründe.
 *
 * @param {Card[]} cards - Array von Karten mit artist, title, year, url
 * @param {PDFType} type - "one-sided" oder "double-sided"
 * @param {BindingMode} [bindingMode="long-edge"] - "long-edge" oder "short-edge" (nur für double-sided)
 * @param {BackgroundConfig | BackgroundConfig[]} [frontBackground] - Globaler Vorderseiten-Hintergrund (einzeln oder alternierend)
 * @param {BackgroundConfig | BackgroundConfig[]} [backBackground] - Globaler Rückseiten-Hintergrund (einzeln oder alternierend)
 *
 * @example
 * <PDFFactory
 *   type="double-sided"
 *   bindingMode="long-edge"
 *   frontBackground={{ type: 'gradient', gradient: 'linear-gradient(90deg, #2A7B9B 0%, #57C785 100%)' }}
 *   backBackground={{ type: 'solid', color: '#ffffff' }}
 *   cards={[
 *     { artist: 'Beatles', title: 'Hey Jude', year: '1968', url: 'https://...' },
 *     { artist: 'Queen', title: 'Bohemian Rhapsody', year: '1975', url: 'https://...',
 *       frontBackground: { type: 'image', url: '/special.jpg', opacity: 0.3 } }
 *   ]}
 * />
 */
export const PDFFactory = ({
    cards,
    type,
    bindingMode = "long-edge",
    frontBackground,
    backBackground,
}: PDFFactoryProps) => {
    const cardsWithGlobalBackgrounds = applyGlobalAlternatingBackgrounds(
        cards,
        frontBackground,
        backBackground
    );

    // ONE-SIDED: Faltkarten auf einem Blatt
    if (type === "one-sided") {
        return (
            <Document>
                <Page size="A4" style={OnePageStyles.page}>
                    <View style={OnePageStyles.grid}>
                        {cardsWithGlobalBackgrounds.map((card, index) => {
                            const cardFrontBg = card.frontBackground;
                            const cardBackBg = card.backBackground;

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
    const cardChunks = createChunks(cardsWithGlobalBackgrounds, CARDS_PER_PAGE);

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
                        />
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
