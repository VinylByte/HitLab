import { Document, Page, View } from "@react-pdf/renderer";
import type { Card } from "../PDF-Template/PageComponents";
import { CardFront, CardBack } from "../PDF-Template/PageComponents";
import { OnePageStyles } from "../PDF-Template/Templates";

export const PDFSheetOneSide = ({ cards }: { cards: Card[] }) => {
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
};
