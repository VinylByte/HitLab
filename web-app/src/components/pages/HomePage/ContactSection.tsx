import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Container, Title, Text, Group, ActionIcon } from "@mantine/core";
import {
    IconMail,
    IconBrandInstagram,
    IconBrandTwitter,
    IconBrandYoutube,
} from "@tabler/icons-react";

const socials = [
    {
        name: "Twitter",
        icon: <IconBrandTwitter size={22} />,
        url: "https://twitter.com/HitLabApp",
    },
    {
        name: "YouTube",
        icon: <IconBrandYoutube size={22} />,
        url: "https://www.youtube.com/@HitLabApp",
    },
    {
        name: "Instagram",
        icon: <IconBrandInstagram size={22} />,
        url: "https://www.instagram.com/HitLabApp/",
    },
];

export function ContactSection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section className="py-24" ref={ref}>
            <Container size="md">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center"
                >
                    <Title
                        order={2}
                        className="!text-3xl sm:!text-4xl !font-bold"
                        style={{ fontFamily: "Outfit, var(--mantine-font-family)" }}
                    >
                        Kontakt
                    </Title>
                    <Text size="lg" c="dimmed" mt="md" className="max-w-xl mx-auto">
                        Hast du Fragen, Feedback oder Vorschläge? Wir freuen uns von dir
                        zu hören!
                    </Text>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mt-12 p-8 sm:p-12 rounded-2xl bg-white/60 dark:bg-default-100/10 border border-default-200/50 dark:border-default-100/10 text-center"
                >
                    <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-500 mx-auto mb-6">
                        <IconMail size={32} />
                    </div>
                    <Title
                        order={4}
                        className="!font-semibold mb-2"
                        style={{ fontFamily: "Outfit, var(--mantine-font-family)" }}
                    >
                        Schreib uns
                    </Title>
                    <Text c="dimmed" mb="xl">
                        Du kannst uns jederzeit über unsere Social-Media-Kanäle
                        erreichen.
                    </Text>

                    <Group justify="center" gap="md">
                        {socials.map((social) => (
                            <motion.div
                                key={social.name}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <ActionIcon
                                    size="xl"
                                    radius="xl"
                                    variant="light"
                                    color="primary"
                                    component="a"
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={social.name}
                                >
                                    {social.icon}
                                </ActionIcon>
                            </motion.div>
                        ))}
                    </Group>
                </motion.div>
            </Container>
        </section>
    );
}
