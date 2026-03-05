import { IconDownload } from "@tabler/icons-react";
import { useMediaQuery } from "@mantine/hooks";
import {
    Image,
    Avatar,
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
import { SimpleGrid, Stack, Group, Text, Title } from "@mantine/core";
import { useState } from "react";
import { MOBILE_BREAKPOINT } from "../Settings";

import type { OwnDeckDTO, PublicDeckDTO } from "../../../services/deckService";
import DownloadModal from "../../../../PDF/DownloadModal";
import { useDeckSongs } from "../../../hooks/useDeckSongs";

export function DeckModal({
    isOpen,
    onOpenChange,
    deck,
}: {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    deck: OwnDeckDTO | null;
}) {
    const activeDeck = deck;
    const deckId = activeDeck?.id ?? "";
    const isMobile = useMediaQuery(MOBILE_BREAKPOINT);
    const { deck_songs, loading } = useDeckSongs(deckId, isOpen && deckId.length > 0);
    const [downloadModalOpen, setDownloadModalOpen] = useState(false);

    if (!activeDeck) return null;

    const downloadDeck: PublicDeckDTO = {
        id: activeDeck.id,
        name: activeDeck.name,
        description: activeDeck.description,
        cover_url: activeDeck.cover_url,
        created_at: activeDeck.created_at,
        owner: activeDeck.owner,
        tags: activeDeck.tags,
    };

    const handleDownload = () => {
        setDownloadModalOpen(true);
    };

    return (
        <div>
            <DownloadModal
                isOpen={downloadModalOpen}
                onOpenChange={setDownloadModalOpen}
                songs={deck_songs.map(ds => ds.song)}
                deck={downloadDeck}
            />
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
                                    <Title order={2}>{activeDeck.name}</Title>
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
                                                src={activeDeck.cover_url ?? undefined}
                                                alt={activeDeck.name}
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
                                                : activeDeck.tags.map(tag => (
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
                                                            activeDeck.owner.avatar_url ?? undefined
                                                        }
                                                        alt={
                                                            activeDeck.owner.display_name ??
                                                            undefined
                                                        }
                                                    />
                                                    <Text size="xs" c="bright">
                                                        {activeDeck.owner.display_name}
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
                                                    {activeDeck.created_at}
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
                                            <Text mt="md">{activeDeck.description}</Text>
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
                                    onPress={handleDownload}
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
