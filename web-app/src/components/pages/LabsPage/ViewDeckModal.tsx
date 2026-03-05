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

import DownloadModal from "../../../../PDF/DownloadModal";


interface DECK {
    id: string;
    name: string;
    song_count: number;
    status: string;
    created_at: string;
    cover_url: string;
    tags: { id: string; name: string }[];
    description: string;
    owner: {
        display_name: string;
        avatar_url: string;
    };
}

const dummyDeck = {
    id: "1",
    name: "My First Deck",
    song_count: 10,
    status: "public",
    created_at: "2023-01-01",
    cover_url: "https://i.pravatar.cc/150?u=deck1",
    tags: [
        { id: "1", name: "Pop" },
        { id: "2", name: "Rock" }
    ],
    description: "A great deck for pop and rock lovers!",
    owner: {
        display_name: "John Doe",
        avatar_url: "https://i.pravatar.cc/150?u=john"
    }
};


export function DeckModal({
    isOpen,
    onOpenChange,
    Deck,
}: {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    Deck: DECK | null;
}) {
    if (!Deck) Deck = dummyDeck;
    const isMobile = useMediaQuery(MOBILE_BREAKPOINT);
    //const { deck_songs, loading } = useDeckSong(Deck.id, isOpen);
    const { deck_songs, loading } = {deck_songs: [{ song: {
    id: "1",
    title: "Song Title",
    artist: "Artist Name",
    year: 2020,
    thumbnail_url: "https://i.pravatar.cc/150?u=song1",
    } },
    { song: {
    id: "2",
    title: "Another Song",
    artist: "Another Artist",
    year: 2019,
    thumbnail_url: "https://i.pravatar.cc/150?u=song2",
    } },
], loading: false};
    const [downloadModalOpen, setDownloadModalOpen] = useState(false);

    const handleDownload = () => {
        setDownloadModalOpen(true);
    };

    return (
        <div>
            <DownloadModal isOpen={downloadModalOpen} onOpenChange={setDownloadModalOpen} songs={deck_songs.map(ds => ds.song)} deck={Deck} />
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
                                    <Title order={2}>{Deck.name}</Title>
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
                                                src={Deck.cover_url ?? undefined}
                                                alt={Deck.name}
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
                                                : Deck.tags.map(tag => (
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
                                                            Deck.owner.avatar_url ?? undefined
                                                        }
                                                        alt={
                                                            Deck.owner.display_name ??
                                                            undefined
                                                        }
                                                    />
                                                    <Text size="xs" c="bright">
                                                        {Deck.owner.display_name}
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
                                                    {Deck.created_at}
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
                                            <Text mt="md">{Deck.description}</Text>
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
