import { Text, View } from '@react-pdf/renderer';
import { PDFQRCode } from '../QR-Generator/qr-generator'; // Import deiner Komponente

export interface Card {
  artist: string;
  title: string;
  year: string;
  url: string;
}



export const CardComponent = ({ card, styles }: { card: Card, styles: any }) => (
  <View style={styles.cardContainer}>
    {/* Vorderseite */}
    <View style={styles.frontSide}>
      <Text style={styles.artist}>{card.artist}</Text>
      <Text style={styles.year}>{card.year}</Text>
      <Text style={styles.title}>{card.title}</Text>
    </View>

    {/* Rückseite mit deiner PDFQRCode Komponente */}
    <View style={styles.backSide}>
      <PDFQRCode url={card.url} />
    </View>
  </View>
);