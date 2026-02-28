import { Page, View, Text } from "@react-pdf/renderer";
import { PDFQRCode } from "../QR-Generator/qr-generator";
import type { BackgroundConfig } from "./BackgroundConfig";
import { createBackgroundStyle } from "./BackgroundConfig";

export interface Card {
    artist: string;
    title: string;
    year: string;
    url: string;
    frontBackground?: BackgroundConfig; // Optionaler Hintergrund für diese spezifische Kartenvorderseite
    backBackground?: BackgroundConfig; // Optionaler Hintergrund für diese spezifische Kartenrückseite
}

interface PageComponentProps {
    cards: Card[];
    styles: any;
    chunkIndex: number;
    frontBackground?: BackgroundConfig;
    backBackground?: BackgroundConfig;
}

interface CardComponentProps {
    card: Card;
    styles: any;
    background?: BackgroundConfig;
}

/**
 * Wiederverwendbare Komponente für einzelne Kartenvorderseite
 * Zeigt Artist, Jahr und Titel
 */
export const CardFront = ({ card, styles }: CardComponentProps) => {
    return (
        <>
            <Text style={styles.artist}>{card.artist}</Text>
            <Text style={styles.year}>{card.year}</Text>
            <Text style={styles.title}>{card.title}</Text>
        </>
    );
};

/**
 * Wiederverwendbare Komponente für einzelne Kartenrückseite
 * Zeigt QR-Code
 */
export const CardBack = ({ card, styles, background }: CardComponentProps) => {
    styles
    background
    return <PDFQRCode url={card.url} />;
};

/**
 * Generische Komponente für eine Vorderseiten-Seite
 * Zeigt Artist, Jahr und Titel für alle Karten auf der Seite an
 */
export const CardFrontPage = ({
    cards,
    styles,
    chunkIndex,
    frontBackground,
}: PageComponentProps) => {
    return (
        <Page size="A4" style={styles.page}>
            <View style={styles.grid}>
                {cards.map((card, i) => {
                    // Nutze kartenspezifischen Hintergrund, falls vorhanden, sonst den globalen
                    const cardBackground = card.frontBackground ?? frontBackground;
                    const backgroundStyle = createBackgroundStyle(cardBackground);

                    return (
                        <View
                            key={`front-${chunkIndex}-${i}`}
                            style={[styles.card, backgroundStyle]}
                        >
                            <CardFront card={card} styles={styles} background={cardBackground} />
                        </View>
                    );
                })}
            </View>
        </Page>
    );
};

/**
 * Generische Komponente für eine Rückseiten-Seite
 * Zeigt QR-Code und optional Titel für alle Karten auf der Seite an
 */
export const CardBackPage = ({ cards, styles, chunkIndex, backBackground }: PageComponentProps) => {
    return (
        <Page size="A4" style={styles.page}>
            <View style={styles.grid}>
                {cards.map((card, i) => {
                    // Nutze kartenspezifischen Hintergrund, falls vorhanden, sonst den globalen
                    const cardBackground = card.backBackground ?? backBackground;
                    const backgroundStyle = createBackgroundStyle(cardBackground);

                    return (
                        <View
                            key={`back-${chunkIndex}-${i}`}
                            style={[styles.card, backgroundStyle]}
                        >
                            <CardBack card={card} styles={styles} background={cardBackground} />
                        </View>
                    );
                })}
            </View>
        </Page>
    );
};
