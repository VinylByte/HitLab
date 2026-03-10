import { motion } from "framer-motion";
import { Button } from "@heroui/react";
import { Container, Title, Text } from "@mantine/core";
import { useNavigate, useLocation } from "react-router";
import {
    IconPlayerPlay,
    IconCards,
} from "@tabler/icons-react";

export function HeroSection() {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <section className="relative min-h-[90vh] flex items-center overflow-hidden">
            {/* Background image */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: "url('/PeoplePlayingHitLab.png')" }}
            />
            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-black/60" />

            <Container size="lg" className="relative z-10 py-16">
                <div className="flex flex-col items-center text-center gap-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <Title
                            order={1}
                            className="!text-4xl sm:!text-5xl lg:!text-6xl !font-bold !leading-tight !text-white"
                            style={{ fontFamily: "Outfit, var(--mantine-font-family)" }}
                        >
                            Dein eigenes{" "}
                            <span className="text-primary-400">Hitster</span>
                            <br />
                            Erlebnis
                        </Title>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    >
                        <Text
                            size="xl"
                            className="max-w-lg mx-auto !text-white/80"
                        >
                            Erstelle individuelle Hitster-Decks mit deinen Lieblingssongs
                            von Spotify, drucke die Karten aus und spiele mit Freunden.
                        </Text>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                        className="flex flex-col sm:flex-row gap-4 mt-4"
                    >
                        <Button
                            size="lg"
                            color="primary"
                            startContent={<IconPlayerPlay size={20} />}
                            className="text-lg px-8 py-6"
                            onPress={() => navigate("/play")}
                        >
                            Jetzt Spielen
                        </Button>
                        <Button
                            size="lg"
                            variant="bordered"
                            startContent={<IconCards size={20} />}
                            className="text-lg px-8 py-6 !border-white/50 !text-white hover:!bg-white/10"
                            onPress={() =>
                                navigate("/login", { state: { from: location } })
                            }
                        >
                            Deck erstellen
                        </Button>
                    </motion.div>
                </div>
            </Container>
        </section>
    );
}
