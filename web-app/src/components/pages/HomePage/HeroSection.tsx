import { motion } from "framer-motion";
import { Button } from "@heroui/react";
import { Container, Title, Text } from "@mantine/core";
import { useNavigate, useLocation } from "react-router";
import {
    IconPlayerPlay,
    IconCards,
} from "@tabler/icons-react";
import image from "../../../assets/VinylByteLogo.png";

export function HeroSection() {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <section className="relative min-h-[90vh] flex items-center overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-100/40 via-transparent to-secondary-100/30 dark:from-primary-900/30 dark:via-transparent dark:to-secondary-900/20" />

            {/* Animated background circles */}
            <motion.div
                className="absolute top-20 right-10 w-72 h-72 rounded-full bg-primary-200/20 dark:bg-primary-800/10 blur-3xl"
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                className="absolute bottom-20 left-10 w-96 h-96 rounded-full bg-secondary-200/20 dark:bg-secondary-800/10 blur-3xl"
                animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />

            <Container size="lg" className="relative z-10 py-16">
                <div className="flex flex-col lg:flex-row items-center gap-12">
                    {/* Text Content */}
                    <div className="flex-1 text-center lg:text-left">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                            <Title
                                order={1}
                                className="!text-4xl sm:!text-5xl lg:!text-6xl !font-bold !leading-tight"
                                style={{ fontFamily: "Outfit, var(--mantine-font-family)" }}
                            >
                                Dein eigenes{" "}
                                <span className="text-primary-500">Hitster</span>
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
                                c="dimmed"
                                mt="xl"
                                className="max-w-lg mx-auto lg:mx-0"
                            >
                                Erstelle individuelle Hitster-Decks mit deinen Lieblingssongs
                                von Spotify, drucke die Karten aus und spiele mit Freunden.
                            </Text>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                            className="flex flex-col sm:flex-row gap-4 mt-10 justify-center lg:justify-start"
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
                                className="text-lg px-8 py-6"
                                onPress={() =>
                                    navigate("/login", { state: { from: location } })
                                }
                            >
                                Deck erstellen
                            </Button>
                        </motion.div>
                    </div>

                    {/* Hero Image */}
                    <motion.div
                        className="flex-1 flex justify-center"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                    >
                        <motion.img
                            src={image}
                            alt="HitLab Logo"
                            className="w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 object-contain drop-shadow-2xl"
                            animate={{ y: [0, -15, 0] }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                        />
                    </motion.div>
                </div>
            </Container>
        </section>
    );
}
