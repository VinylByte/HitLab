import { Page, View, Text } from "@react-pdf/renderer";
import { PDFQRCode } from "../QR-Generator/qr-generator";

export interface Card {
    artist: string;
    title: string;
    year: string;
    url: string;
}

interface PageComponentProps {
    cards: Card[];
    styles: any;
    chunkIndex: number;
}

interface CardComponentProps {
    card: Card;
    styles: any;
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
export const CardBack = ({ card, styles }: CardComponentProps) => {
    styles
    return <PDFQRCode url={card.url} />;
};

/**
 * Generische Komponente für eine Vorderseiten-Seite
 * Zeigt Artist, Jahr und Titel für alle Karten auf der Seite an
 */
export const CardFrontPage = ({ cards, styles, chunkIndex }: PageComponentProps) => {
    return (
        <Page size="A4" style={styles.page}>
            <View style={styles.grid}>
                {cards.map((card, i) => (
                    <View key={`front-${chunkIndex}-${i}`} style={styles.card}>
                        <CardFront card={card} styles={styles} />
                    </View>
                ))}
            </View>
        </Page>
    );
};

/**
 * Generische Komponente für eine Rückseiten-Seite
 * Zeigt QR-Code und optional Titel für alle Karten auf der Seite an
 */
export const CardBackPage = ({ cards, styles, chunkIndex }: PageComponentProps) => {
    return (
        <Page size="A4" style={styles.page}>
            <View style={styles.grid}>
                {cards.map((card, i) => (
                    <View key={`back-${chunkIndex}-${i}`} style={styles.card}>
                        <CardBack card={card} styles={styles} />
                    </View>
                ))}
            </View>
        </Page>
    );
};
