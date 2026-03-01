import { Center, Group, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import classes from "./DeckCard.module.css";
import { useState } from "react";

import {
    Card,
    Image,
    Avatar,
    CardBody,
    Skeleton,
    Chip,
    Modal,
    ModalBody,
    ModalContent,
    ModalHeader,
    ModalFooter,
    Button,
    Table,
    TableBody,
    TableRow,
    TableCell,
    TableHeader,
    TableColumn,
} from "@heroui/react";
import { useMediaQuery } from "@mantine/hooks";
import { MOBILE_BREAKPOINT } from "../Settings";
import { IconDownload } from "@tabler/icons-react";
import type { PublicDeckDTO } from "../../../services/deckService";
import { useDeckSong } from "../../../hooks/useDeckSong";

function DeckModal({
    isOpen,
    onOpenChange,
    publicDeck,
}: {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    publicDeck: PublicDeckDTO;
}) {
    const isMobile = useMediaQuery(MOBILE_BREAKPOINT);
    const { deck_songs, loading } = useDeckSong(publicDeck.id, isOpen);

    return (
        <div>
            <Modal size="5xl" isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {onClose => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                {loading ? (
                                    <Skeleton
                                        className={
                                            isMobile
                                                ? "h-8 w-85 mb-2 rounded-lg"
                                                : "h-8 w-2/3 mb-2 rounded-lg"
                                        }
                                    />
                                ) : (
                                    <Title order={2}>{publicDeck.name}</Title>
                                )}
                            </ModalHeader>
                            <ModalBody>
                                <SimpleGrid cols={{ base: 1, sm: 2 }}>
                                    <Stack>
                                        {loading ? (
                                            <Skeleton
                                                className={
                                                    isMobile
                                                        ? "h-62 w-90 mb-2 rounded-md"
                                                        : "h-62 w-100 mb-2 rounded-md"
                                                }
                                            />
                                        ) : (
                                            <Image
                                                src={publicDeck.cover_url ?? undefined}
                                                alt={publicDeck.name}
                                                radius="md"
                                            />
                                        )}

                                        <Group gap={5} wrap="wrap">
                                            {loading
                                                ? Array.from({ length: 3 }).map((_, i) => (
                                                      <Skeleton
                                                          key={i}
                                                          className="h-6 w-16 mb-1 rounded-xl"
                                                      />
                                                  ))
                                                : publicDeck.tags.map(tag => (
                                                      <Chip key={tag.id} color="primary" size="sm">
                                                          <Text tt="uppercase" size="xs">
                                                              {tag.name}
                                                          </Text>
                                                      </Chip>
                                                  ))}
                                        </Group>
                                        <Group gap="xs">
                                            {loading ? (
                                                <Group gap={7}>
                                                    <Skeleton className="flex rounded-full w-12 h-12" />
                                                    <Skeleton className="h-4 w-24 rounded-md" />
                                                </Group>
                                            ) : (
                                                <Group gap={7}>
                                                    <Avatar
                                                        size={"md"}
                                                        src={
                                                            publicDeck.owner.avatar_url ?? undefined
                                                        }
                                                        alt={
                                                            publicDeck.owner.display_name ??
                                                            undefined
                                                        }
                                                    />
                                                    <Text size="xs" c="bright">
                                                        {publicDeck.owner.display_name}
                                                    </Text>
                                                </Group>
                                            )}

                                            {!loading && (
                                                <Text span size="xs" opacity={0.8}>
                                                    •
                                                </Text>
                                            )}

                                            {loading ? (
                                                <Skeleton className="h-4 w-12 rounded-md" />
                                            ) : (
                                                <Text size="xs" opacity={0.8}>
                                                    {publicDeck.created_at}
                                                </Text>
                                            )}
                                        </Group>
                                        {loading ? (
                                            <>
                                                <Skeleton className="h-4 w-full rounded-md" />
                                                <Skeleton className="h-4 w-80 rounded-md" />
                                                <Skeleton className="h-4 w-90 rounded-md" />
                                            </>
                                        ) : (
                                            <Text mt="md">{publicDeck.description}</Text>
                                        )}
                                    </Stack>
                                    <Stack>
                                        <Table
                                            aria-label="Songs in this deck"
                                            maxTableHeight={isMobile ? 300 : 400}
                                            isVirtualized
                                            isHeaderSticky
                                        >
                                            <TableHeader>
                                                <TableColumn>{""}</TableColumn>
                                                <TableColumn>Name</TableColumn>
                                                <TableColumn>Artist</TableColumn>
                                                <TableColumn>Year</TableColumn>
                                            </TableHeader>
                                            <TableBody>
                                                {loading
                                                    ? Array.from({ length: 6 }).map((_, i) => (
                                                          <TableRow key={i}>
                                                              <TableCell>
                                                                  <Skeleton className="h-9 w-9 rounded-md" />
                                                              </TableCell>
                                                              <TableCell>
                                                                  <Skeleton className="h-4 w-24 rounded-md" />
                                                              </TableCell>
                                                              <TableCell>
                                                                  <Skeleton className="h-4 w-24 rounded-md" />
                                                              </TableCell>
                                                              <TableCell>
                                                                  <Skeleton className="h-4 w-12 rounded-md" />
                                                              </TableCell>
                                                          </TableRow>
                                                      ))
                                                    : deck_songs.map(meta => (
                                                          <TableRow key={meta.song.id}>
                                                              <TableCell>
                                                                  <Avatar
                                                                      radius="full"
                                                                      size="sm"
                                                                      src={
                                                                          meta.song.thumbnail_url ??
                                                                          undefined
                                                                      }
                                                                      className="rounded-md"
                                                                  />
                                                              </TableCell>
                                                              <TableCell>
                                                                  {meta.song.title}
                                                              </TableCell>
                                                              <TableCell>
                                                                  {meta.song.artist}
                                                              </TableCell>
                                                              <TableCell>
                                                                  {meta.song.year}
                                                              </TableCell>
                                                          </TableRow>
                                                      ))}
                                            </TableBody>
                                        </Table>
                                    </Stack>
                                </SimpleGrid>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Schließen
                                </Button>
                                <Button
                                    color="primary"
                                    startContent={<IconDownload />}
                                    onPress={() => alert("Download started")}
                                >
                                    Herunterladen
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}

export function DeckCard({ data }: { data: PublicDeckDTO }) {
    const isMobile = useMediaQuery(MOBILE_BREAKPOINT);
    const [modalOpen, setModalOpen] = useState(false);

    const handleClick = () => {
        setModalOpen(true);
    };

    return (
        <div>
            <Card radius="md" className={classes.card}>
                <CardBody onClick={handleClick}>
                    <Group>
                        <Center w={isMobile ? "100%" : ""}>
                            <Image
                                src={data.cover_url ?? undefined}
                                className={classes.image}
                                alt={data.name}
                            />
                        </Center>

                        <div className={classes.body}>
                            <Group gap={5} wrap="wrap">
                                {data.tags.map(tag => (
                                    <Chip key={tag.id} color="primary" size="sm">
                                        <Text tt="uppercase" size="xs">
                                            {tag.name}
                                        </Text>
                                    </Chip>
                                ))}
                            </Group>
                            <Text className={classes.title} mt="xs" mb="md">
                                {data.name}
                            </Text>
                            <Group gap="xs">
                                <Group gap={7}>
                                    <Avatar
                                        size={"md"}
                                        src={data.owner.avatar_url ?? undefined}
                                        alt={data.owner.display_name ?? undefined}
                                    />
                                    <Text size="xs" c="bright">
                                        {data.owner.display_name}
                                    </Text>
                                </Group>

                                <Text span size="xs" opacity={0.8}>
                                    •
                                </Text>

                                <Text size="xs" opacity={0.8}>
                                    {data.created_at}
                                </Text>
                            </Group>
                        </div>
                    </Group>
                </CardBody>
            </Card>
            <DeckModal isOpen={modalOpen} onOpenChange={setModalOpen} publicDeck={data} />
        </div>
    );
}

export function DeckCardSkeleton() {
    const isMobile = useMediaQuery(MOBILE_BREAKPOINT);
    return (
        <Card radius="md" className={classes.card}>
            <CardBody>
                <Group w={"100%"}>
                    <Center w={isMobile ? "100%" : ""}>
                        <Skeleton
                            className={
                                isMobile
                                    ? "w-70 h-42 rounded-lg mb-2 mt-2"
                                    : "h-27 w-50 rounded-lg mb-4 mt-4"
                            }
                        />
                    </Center>
                    <div className={classes.body}>
                        <Skeleton className="h-4 w-1/2 mb-2" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <Group gap="xs">
                            <Group gap={7}>
                                <Skeleton className="flex rounded-full w-12 h-12" />
                                <Skeleton className="h-4 w-24" />
                            </Group>
                            <Skeleton className="h-4 w-12" />
                        </Group>
                    </div>
                </Group>
            </CardBody>
        </Card>
    );
}
