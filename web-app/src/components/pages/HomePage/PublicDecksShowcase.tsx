import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Container, Center, Title, Text, Group } from "@mantine/core";
import { Carousel } from "@mantine/carousel";
import { usePublicDecks } from "../../../hooks/usePublicDecks";
import { Image, Avatar, Chip, Skeleton } from "@heroui/react";
import { useNavigate } from "react-router";
import { Button } from "@heroui/react";
import { IconArrowRight, IconCards } from "@tabler/icons-react";
import Autoplay from "embla-carousel-autoplay";

export function PublicDecksShowcase() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });
    const { decks, loading } = usePublicDecks("", 1);
    const navigate = useNavigate();

    const displayDecks = decks.slice(0, 8);

    const autoplay = useRef(Autoplay({ delay: 2000 }));

    return (
        <section className="py-24 w-full" ref={ref}>
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
                        Entdecke <span className="text-secondary-500">Community Decks</span>
                    </Title>
                    <Center>
                        <Text size="lg" c="dimmed" mt="md" className="max-w-2xl mx-auto">
                            Stöbere durch die beliebtesten Decks der Community und lass dich für
                            dein eigenes Spiel inspirieren.
                        </Text>
                    </Center>
                </motion.div>
            </Container>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="w-full"
            >
                <Carousel
                    slideSize={{ sm: "33.333%", md: "17%" }}
                    slideGap={"md"}
                    emblaOptions={{ loop: true }}
                    plugins={[autoplay.current]}
                    draggable
                    withControls={false}
                    onMouseEnter={autoplay.current.stop}
                    onMouseLeave={() => autoplay.current.play()}
                >
                    {loading
                        ? Array.from({ length: 10 }).map((_, i) => (
                              <Carousel.Slide key={i}>
                                  <Skeleton className="w-full aspect-square rounded-none" />
                                  <div className="p-4 flex-1">
                                      <Skeleton className="h-5 w-3/4 mb-3 rounded-md" />
                                      <Skeleton className="h-4 w-1/2 mb-4 rounded-md" />
                                      <Group gap={7}>
                                          <Skeleton className="w-7 h-7 rounded-full" />
                                          <Skeleton className="h-3 w-20 rounded-md" />
                                      </Group>
                                  </div>
                              </Carousel.Slide>
                          ))
                        : displayDecks.map(deck => (
                              <Carousel.Slide
                                  key={deck.id}
                                  onClick={() => navigate(`/decks/${deck.id}/view`)}
                              >
                                  <Image
                                      src={deck.cover_url ?? undefined}
                                      alt={deck.name}
                                      className="w-full aspect-square object-cover max-h-48"
                                      removeWrapper
                                  />
                                  <div className="p-4 flex-1 flex flex-col">
                                      <Text
                                          fw={600}
                                          size="md"
                                          className="truncate"
                                          style={{
                                              fontFamily: "Outfit, var(--mantine-font-family)",
                                          }}
                                      >
                                          {deck.name}
                                      </Text>
                                      <Group gap={5} mt={4} mb={8} wrap="wrap">
                                          {deck.tags.slice(0, 3).map(tag => (
                                              <Chip key={tag.id} color="primary" size="sm">
                                                  <Text tt="uppercase" size="xs">
                                                      {tag.name}
                                                  </Text>
                                              </Chip>
                                          ))}
                                      </Group>
                                      <Group gap={7} className="mt-auto">
                                          <Avatar
                                              size="sm"
                                              src={deck.owner.avatar_url ?? undefined}
                                          />
                                          <Text size="xs" c="dimmed">
                                              {deck.owner.display_name}
                                          </Text>
                                      </Group>
                                  </div>
                              </Carousel.Slide>
                          ))}
                </Carousel>
            </motion.div>

            <Container size="lg">
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
                        className="w-2/4"
                        endContent={<IconArrowRight size={18} />}
                        startContent={<IconCards size={18} />}
                        onPress={() => navigate("/decks")}
                    >
                        Alle Decks anzeigen
                    </Button>
                </motion.div>
            </Container>
        </section>
    );
}
