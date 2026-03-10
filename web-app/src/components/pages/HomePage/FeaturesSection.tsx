import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Container, Title, Text, SimpleGrid } from "@mantine/core";
import {
    IconMusic,
    IconUsers,
    IconCards,
    IconBrandSpotify,
    IconPrinter,
    IconWorld,
} from "@tabler/icons-react";

const features = [
    {
        icon: <IconBrandSpotify size={32} />,
        title: "Spotify Integration",
        description:
            "Nutze alle Songs von Spotify, um dein personalisiertes Hitster-Deck zusammenzustellen.",
    },
    {
        icon: <IconCards size={32} />,
        title: "Eigene Decks",
        description:
            "Erstelle dein eigenes Deck mit Songs aus deiner Lieblingsepoche oder deinem Lieblingsgenre.",
    },
    {
        icon: <IconPrinter size={32} />,
        title: "Drucken & Spielen",
        description:
            "Lade deine Karten als PDF herunter, drucke sie aus und starte direkt in den Spieleabend.",
    },
    {
        icon: <IconUsers size={32} />,
        title: "Gemeinsam erstellen",
        description:
            "Lade Freunde ein, um gemeinsam an eurem perfekten Deck zu arbeiten.",
    },
    {
        icon: <IconMusic size={32} />,
        title: "QR-Code Abspielen",
        description:
            "Scanne die QR-Codes auf den Karten und spiele die Songs direkt auf unserer Seite ab.",
    },
    {
        icon: <IconWorld size={32} />,
        title: "Decks teilen",
        description:
            "Veröffentliche deine Decks und entdecke die besten Kreationen der Community.",
    },
];

const containerVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" as const },
    },
};

export function FeaturesSection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section className="py-24 bg-default-50/50 dark:bg-default-50/5" ref={ref}>
            <Container size="lg">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <Title
                        order={2}
                        className="!text-3xl sm:!text-4xl !font-bold"
                        style={{ fontFamily: "Outfit, var(--mantine-font-family)" }}
                    >
                        So funktioniert{" "}
                        <span className="text-primary-500">HitLab</span>
                    </Title>
                    <Text size="lg" c="dimmed" mt="md" className="max-w-2xl mx-auto">
                        HitLab macht es einfach, dein eigenes Hitster-Spiel zu erstellen.
                        Von der Songauswahl bis zum Spieleabend – alles in wenigen Schritten.
                    </Text>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                >
                    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl">
                        {features.map((feature) => (
                            <motion.div
                                key={feature.title}
                                variants={itemVariants}
                                className="p-8 rounded-2xl bg-white/60 dark:bg-default-100/10 border border-default-200/50 dark:border-default-100/10 hover:shadow-lg hover:border-primary-200 dark:hover:border-primary-800/30 transition-all duration-300 text-center flex flex-col items-center"
                            >
                                <div className="w-14 h-14 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-500 mb-5">
                                    {feature.icon}
                                </div>
                                <Title
                                    order={4}
                                    className="!font-semibold mb-3"
                                    style={{
                                        fontFamily: "Outfit, var(--mantine-font-family)",
                                    }}
                                >
                                    {feature.title}
                                </Title>
                                <Text size="sm" c="dimmed" className="leading-relaxed">
                                    {feature.description}
                                </Text>
                            </motion.div>
                        ))}
                    </SimpleGrid>
                </motion.div>
            </Container>
        </section>
    );
}
