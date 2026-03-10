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
                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                        {loading
                            ? Array.from({ length: 4 }).map((_, i) => (
                                  <motion.div key={i} variants={cardVariants}>
                                      <Card radius="lg" className="bg-white/60 dark:bg-default-100/10 border border-default-200/50 dark:border-default-100/10">
                                          <CardBody>
                                              <Group>
                                                  <Skeleton className="w-36 h-24 rounded-lg" />
                                                  <div className="flex-1">
                                                      <Skeleton className="h-5 w-3/4 mb-3 rounded-md" />
                                                      <Skeleton className="h-4 w-1/2 mb-2 rounded-md" />
                                                      <Group gap={7}>
                                                          <Skeleton className="w-8 h-8 rounded-full" />
                                                          <Skeleton className="h-3 w-20 rounded-md" />
                                                      </Group>
                                                  </div>
                                              </Group>
                                          </CardBody>
                                      </Card>
                                  </motion.div>
                              ))
                            : displayDecks.map((deck) => (
                                  <motion.div key={deck.id} variants={cardVariants}>
                                      <Card
                                          radius="lg"
                                          isPressable
                                          onPress={() => navigate("/decks")}
                                          className="bg-white/60 dark:bg-default-100/10 border border-default-200/50 dark:border-default-100/10 hover:shadow-lg transition-all duration-300"
                                      >
                                          <CardBody>
                                              <Group>
                                                  <Image
                                                      src={deck.cover_url ?? undefined}
                                                      alt={deck.name}
                                                      className="w-36 h-24 object-cover rounded-lg"
                                                  />
                                                  <div className="flex-1 min-w-0">
                                                      <Text
                                                          fw={600}
                                                          size="lg"
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
                                                      <Group gap={7}>
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
                                              </Group>
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
