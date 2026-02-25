import { Page, View, Document, Text } from "@react-pdf/renderer";
import { CardComponent } from "../PDF-Template/Card";
import type { Card } from "../PDF-Template/Card";

import {OnePageStyles, DoublePageStyles} from "../PDF-Template/Templates";
import { PDFQRCode } from '../QR-Generator/qr-generator'; 

interface HitsterPDFProps {
    cards: Card[];
}


export const PDFSheetOneSide = ({ cards }: HitsterPDFProps) => {
    const styles = OnePageStyles;
    return (
        <Document>
        <Page size="A4" style={styles.page}>
            <View style={styles.grid}>
                {cards.map((card, index) => (
                    <CardComponent key={index} card={card} styles={styles} />
                ))}
            </View>
        </Page>
    </Document>
    );
};



// Hilfsfunktion zum Spiegeln der Reihenfolge pro Zeile (für Duplex)
const chunkAndFlip = (array: any[], size: number) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    // Für die Rückseite drehen wir jede 3er-Gruppe horizontal um
    chunks.push(...array.slice(i, i + size).reverse());
  }
  return chunks;
};

export const PDFSheetDoubleSide = ({ cards }:  HitsterPDFProps ) => {
  const cardsPerRow = 3;
  const flippedCards = chunkAndFlip(cards, cardsPerRow);

  return (
    <Document>
      {/* SEITE 1: ALLE VORDERSEITEN */}
      <Page size="A4" style={DoublePageStyles.page}>
        <View style={DoublePageStyles.grid}>
          {cards.map((card, i) => (
            <View key={`front-${i}`} style={DoublePageStyles.card}>
              <Text style={DoublePageStyles.artist}>{card.artist}</Text>
              <Text style={DoublePageStyles.year}>{card.year}</Text>
              <Text style={DoublePageStyles.title}>{card.title}</Text>
            </View>
          ))}
        </View>
      </Page>

      {/* SEITE 2: ALLE RÜCKSEITEN (GESPIEGELT) */}
      <Page size="A4" style={DoublePageStyles.page}>
        <View style={DoublePageStyles.grid}>
          {flippedCards.map((card, i) => (
            <View key={`back-${i}`} style={DoublePageStyles.card}>
              <PDFQRCode url={card.url} />
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};


