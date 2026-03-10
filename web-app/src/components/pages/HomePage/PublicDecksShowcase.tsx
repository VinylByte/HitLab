import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Container, Title, Text, SimpleGrid, Group } from "@mantine/core";
import { usePublicDecks } from "../../../hooks/usePublicDecks";
import { Card, CardBody, Image, Avatar, Chip, Skeleton } from "@heroui/react";
import { useNavigate } from "react-router";
import { Button } from "@heroui/react";
import { IconArrowRight } from "@tabler/icons-react";

const containerVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.15,
        },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" as const },
    },
};

export function PublicDecksShowcase() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });
    const { decks, loading } = usePublicDecks("", 1);
    const navigate = useNavigate();

    const displayDecks = decks.slice(0, 4);

    return (
        <section className="py-24" ref={ref}>
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
                        Entdecke{" "}
                        <span className="text-secondary-500">Community Decks</span>
                    </Title>
                    <Text size="lg" c="dimmed" mt="md" className="max-w-2xl mx-auto">
                        Stöbere durch die beliebtesten Decks der Community und lass dich
                        für dein eigenes Spiel inspirieren.
                    </Text>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                >
                    <SimpleGrid cols={{ base: 2, sm: 2, md: 4 }} spacing={0}>
                        {loading
                            ? Array.from({ length: 4 }).map((_, i) => (
                                  <motion.div key={i} variants={cardVariants}>
                                      <Card radius="none" className="bg-white/60 dark:bg-default-100/10 border border-default-200/50 dark:border-default-100/10 h-full">
                                          <CardBody className="p-0 flex flex-col">
                                              <Skeleton className="w-full aspect-square rounded-none" />
                                              <div className="p-4 flex-1">
                                                  <Skeleton className="h-5 w-3/4 mb-3 rounded-md" />
                                                  <Skeleton className="h-4 w-1/2 mb-4 rounded-md" />
                                                  <Group gap={7}>
                                                      <Skeleton className="w-7 h-7 rounded-full" />
                                                      <Skeleton className="h-3 w-20 rounded-md" />
                                                  </Group>
                                              </div>
                                          </CardBody>
                                      </Card>
                                  </motion.div>
                              ))
                            : displayDecks.map((deck) => (
                                  <motion.div key={deck.id} variants={cardVariants} className="h-full">
                                      <Card
                                          radius="none"
                                          isPressable
                                          onPress={() => navigate("/decks")}
                                          className="bg-white/60 dark:bg-default-100/10 border border-default-200/50 dark:border-default-100/10 hover:shadow-lg transition-all duration-300 h-full"
                                      >
                                          <CardBody className="p-0 flex flex-col">
                                              <Image
                                                  src={deck.cover_url ?? undefined}
                                                  alt={deck.name}
                                                  className="w-full aspect-square object-cover"
                                                  removeWrapper
                                              />
                                              <div className="p-4 flex-1 flex flex-col">
                                                  <Text
                                                      fw={600}
                                                      size="md"
                                                      className="truncate"
                                                      style={{
                                                          fontFamily:
                                                              "Outfit, var(--mantine-font-family)",
                                                      }}
                                                  >
                                                      {deck.name}
                                                  </Text>
                                                  <Group gap={5} mt={4} mb={8} wrap="wrap">
                                                      {deck.tags.slice(0, 3).map((tag) => (
                                                          <Chip
                                                              key={tag.id}
                                                              color="primary"
                                                              size="sm"
                                                          >
                                                              <Text
                                                                  tt="uppercase"
                                                                  size="xs"
                                                              >
                                                                  {tag.name}
                                                              </Text>
                                                          </Chip>
                                                      ))}
                                                  </Group>
                                                  <Group gap={7} className="mt-auto">
                                                      <Avatar
                                                          size="sm"
                                                          src={
                                                              deck.owner.avatar_url ??
                                                              undefined
                                                          }
                                                      />
                                                      <Text size="xs" c="dimmed">
                                                          {deck.owner.display_name}
                                                      </Text>
                                                  </Group>
                                              </div>
                                          </CardBody>
                                      </Card>
                                  </motion.div>
                              ))}
                    </SimpleGrid>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="text-center mt-12"
                >
                    <Button
                        size="lg"
                        variant="flat"
                        color="primary"
                        endContent={<IconArrowRight size={18} />}
                        onPress={() => navigate("/decks")}
                    >
                        Alle Decks anzeigen
                    </Button>
                </motion.div>
            </Container>
        </section>
    );
}
