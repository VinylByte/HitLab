import { StyleSheet } from "@react-pdf/renderer";

// Gemeinsame Konstanten für konsistente Kartengrößen
const CARD_WIDTH = "170pt";
const CARD_HEIGHT = "170pt";

// Gemeinsame Text-Styles
const commonTextStyles = {
    artist: {
        fontSize: 12,
        fontFamily: "Helvetica-Bold",
        textAlign: "center" as const,
    },
    title: {
        fontSize: 10,
        fontFamily: "Helvetica-Oblique",
        textAlign: "center" as const,
        marginTop: 4,
    },
    year: {
        fontSize: 26,
        fontFamily: "Helvetica-Bold",
        marginTop: 5,
    },
};

export const OnePageStyles = StyleSheet.create({
    page: {
        padding: 30,
        backgroundColor: "#fff",
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    cardContainer: {
        width: CARD_WIDTH,
        height: `${parseInt(CARD_HEIGHT) * 2}pt`, // Doppelte Höhe für Vorder- und Rückseite
        border: "1pt solid #000",
        borderRadius: 5,
        marginBottom: 40,
        display: "flex",
        flexDirection: "column",
    },
    // Obere Hälfte: Sichtbare Info beim Spielen
    frontSide: {
        flex: 1,
        padding: 10,
        position: "relative",
        overflow: "hidden",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fdfdfd",
    },
    // Untere Hälfte: Die Lösung (wird umgeknickt)
    backSide: {
        flex: 1,
        padding: 10,
        position: "relative",
        overflow: "hidden",
        justifyContent: "center",
        alignItems: "center",
        borderTop: "1pt dashed #000", // Markierung zum Falten
    },
    ...commonTextStyles,
});

export const DoublePageStyles = StyleSheet.create({
    page: {
        padding: 30,
        backgroundColor: "#fff",
        paddingBottom: 100,
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 0,
    },
    card: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        position: "relative",
        overflow: "hidden",
        border: "0.5pt solid #000",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: 10,
    },
    ...commonTextStyles,
});
