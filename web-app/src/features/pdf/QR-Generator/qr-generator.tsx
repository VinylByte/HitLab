import { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import QRCode from "qrcode";

const styles = StyleSheet.create({
    qrContainer: {
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
    },
    qrImage: {
        width: 100,
        height: 100,
    },
    label: {
        fontSize: 10,
        marginBottom: 5,
        fontFamily: "Helvetica-Bold",
    },
});

import type { PDFQRCodeProps } from "../interfaces";

export const PDFQRCode = ({ url }: PDFQRCodeProps) => {
    const [qrDataUri, setQrDataUri] = useState<string | null>(null);

    useEffect(() => {
        const generateQR = async () => {
            try {
                // Wir erzeugen eine Data-URL (base64 PNG)
                const dataUri = await QRCode.toDataURL(url, {
                    margin: 1,
                    width: 200, // Höhere Auflösung für schärferen Druck
                    color: {
                        dark: "#000000",
                        light: "#FFFFFF",
                    },
                });
                setQrDataUri(dataUri);
            } catch (err) {
                console.error("QR Code Fehler:", err);
            }
        };

        generateQR();
    }, [url]);

    if (!qrDataUri) return <Text>Generiere Code...</Text>;

    return (
        <View style={styles.qrContainer}>
            <Image src={qrDataUri} style={styles.qrImage} />
        </View>
    );
};
