import { Image, Page, Text, View } from "@react-pdf/renderer";
import type { ReactNode } from "react";
import type { BackgroundConfig, Card, PageComponentProps, CardComponentProps } from "../interfaces";
import {
    createBackgroundStyle,
    createGradientDataUrl,
    resolveGradientBackground,
} from "./BackgroundConfig";

const backgroundImageStyle = {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
};

export const cardContentStyle = {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    padding: 10,
};

export const CardBackgroundLayer = ({ background }: { background?: BackgroundConfig }) => {
    if (!background) {
        return null;
    }

    if (background.type === "gradient") {
        const resolvedGradient = resolveGradientBackground(background);

        if (!resolvedGradient) {
            return null;
        }

        const gradientDataUrl = createGradientDataUrl(resolvedGradient);

        return <Image src={gradientDataUrl} style={backgroundImageStyle} />;
    }

    if (background.type !== "image") {
        return null;
    }

    return (
        <Image
            src={background.url}
            style={{
                ...backgroundImageStyle,
                opacity: background.opacity ?? 1,
            }}
        />
    );
};

export const CardFront = ({ card, styles }: CardComponentProps) => (
    <>
        <Text style={styles.artist}>{card.artist}</Text>
        <Text style={styles.year}>{card.year}</Text>
        <Text style={styles.title}>{card.title}</Text>
    </>
);

export const CardBack = ({ card }: CardComponentProps) => {
    if (card.qrDataUri) {
        return <Image src={card.qrDataUri} style={{ width: 100, height: 100 }} />;
    }
    return null;
};

const CardWithBackground = ({
    background,
    backgroundStyle,
    styles,
    cardKey,
    children,
}: {
    background?: BackgroundConfig;
    backgroundStyle: any;
    styles: any;
    cardKey: string;
    children: ReactNode;
}) => (
    <View key={cardKey} style={[styles.card, backgroundStyle]}>
        <CardBackgroundLayer background={background} />
        <View style={cardContentStyle}>{children}</View>
    </View>
);

export const CardFrontPage = ({
    cards,
    styles,
    chunkIndex,
    frontBackground,
}: PageComponentProps) => (
    <Page size="A4" style={styles.page}>
        <View style={styles.grid}>
            {cards.map((card, i) => {
                const cardBackground = card.frontBackground ?? frontBackground;
                return (
                    <CardWithBackground
                        key={`front-${chunkIndex}-${i}`}
                        cardKey={`front-${chunkIndex}-${i}`}
                        background={cardBackground}
                        backgroundStyle={createBackgroundStyle(cardBackground)}
                        styles={styles}
                    >
                        <CardFront card={card} styles={styles} />
                    </CardWithBackground>
                );
            })}
        </View>
    </Page>
);

export const CardBackPage = ({ cards, styles, chunkIndex, backBackground }: PageComponentProps) => (
    <Page size="A4" style={styles.page}>
        <View style={styles.grid}>
            {cards.map((card, i) => {
                const cardBackground = card.backBackground ?? backBackground;
                return (
                    <CardWithBackground
                        key={`back-${chunkIndex}-${i}`}
                        cardKey={`back-${chunkIndex}-${i}`}
                        background={cardBackground}
                        backgroundStyle={createBackgroundStyle(cardBackground)}
                        styles={styles}
                    >
                        <CardBack card={card} styles={styles} />
                    </CardWithBackground>
                );
            })}
        </View>
    </Page>
);
