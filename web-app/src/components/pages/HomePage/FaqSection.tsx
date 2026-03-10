import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Container, Title, Text } from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";

const faqItems = [
    {
        question: "Wie spiele ich das Spiel?",
        answer: "Du scannst einfach den QR-Code auf der Karte und wirst dann auf unsere Seite geleitet, wo der Song abgespielt wird. Alternativ kannst du den QR-Code Scanner auf unserer Seite nutzen. Die anderen Spieler müssen dann erraten, in welchem Jahr der Song erschienen ist!",
    },
    {
        question: "Wie erstelle ich ein neues Deck?",
        answer: "Nachdem du dich angemeldet hast, kannst du auf den Lab-Reiter gehen und dort mit der Erstellung beginnen. Dort kannst du auch Freunde hinzufügen und erstellte Decks bearbeiten. Suche einfach nach deinen Lieblingssongs und füge sie zum Deck hinzu.",
    },
    {
        question: "Wie komme ich an die Spielkarten?",
        answer: "Nach der Erstellung eines Decks kannst du dir die Karten als PDF herunterladen. Danach müssen diese nur noch ausgedruckt werden und das Spiel kann beginnen. Wir empfehlen dickeres Papier oder Karton für ein besseres Spielerlebnis.",
    },
    {
        question: "Wofür wird mein Spotify Konto benötigt?",
        answer: "Wir benötigen dein Konto, um Informationen wie Künstler, Songtitel und Erscheinungsjahr über die Songs in deinem Deck zu bekommen. Dafür benötigst du ein Spotify Premium Konto, damit die Songs direkt auf unserer Seite abgespielt werden können.",
    },
    {
        question: "Kann ich Decks mit Freunden teilen?",
        answer: "Ja! Du kannst deine Decks öffentlich machen, sodass jeder sie finden und nutzen kann. Außerdem kannst du Freunde als Mitbearbeiter einladen, um gemeinsam an einem Deck zu arbeiten.",
    },
    {
        question: "Ist HitLab kostenlos?",
        answer: "Ja, HitLab ist komplett kostenlos. Du brauchst lediglich einen Spotify Premium Account, um die Songs abspielen zu können. Die Erstellung und das Teilen von Decks ist kostenlos.",
    },
];

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, delay: i * 0.1, ease: "easeOut" as const },
    }),
};

export function FaqSection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleItem = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="py-24 bg-default-50/50 dark:bg-default-50/5" ref={ref}>
            <Container size="md">
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
                        Häufig gestellte{" "}
                        <span className="text-primary-500">Fragen</span>
                    </Title>
                    <Text size="lg" c="dimmed" mt="md">
                        Hier findest du Antworten auf die wichtigsten Fragen.
                    </Text>
                </motion.div>

                <div className="space-y-4">
                    {faqItems.map((item, index) => (
                        <motion.div
                            key={index}
                            custom={index}
                            variants={itemVariants}
                            initial="hidden"
                            animate={isInView ? "visible" : "hidden"}
                            className="rounded-xl border border-default-200/50 dark:border-default-100/10 bg-white/60 dark:bg-default-100/10 overflow-hidden"
                        >
                            <button
                                onClick={() => toggleItem(index)}
                                className="w-full flex items-center justify-between p-5 text-left hover:bg-default-100/50 dark:hover:bg-default-100/5 transition-colors cursor-pointer"
                            >
                                <Text fw={600} size="md">
                                    {item.question}
                                </Text>
                                <motion.div
                                    animate={{
                                        rotate: openIndex === index ? 180 : 0,
                                    }}
                                    transition={{ duration: 0.3 }}
                                    className="flex-shrink-0 ml-4"
                                >
                                    <IconChevronDown size={20} />
                                </motion.div>
                            </button>
                            <motion.div
                                initial={false}
                                animate={{
                                    height: openIndex === index ? "auto" : 0,
                                    opacity: openIndex === index ? 1 : 0,
                                }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="overflow-hidden"
                            >
                                <div className="px-5 pb-5">
                                    <Text size="sm" c="dimmed" className="leading-relaxed">
                                        {item.answer}
                                    </Text>
                                </div>
                            </motion.div>
                        </motion.div>
                    ))}
                </div>
            </Container>
        </section>
    );
}
