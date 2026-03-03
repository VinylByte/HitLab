import { Title, Text, Stack, Group, SimpleGrid, Center } from "@mantine/core";
import { Button, Input, Tab, Tabs } from "@heroui/react";
import type { Selection } from "@heroui/react";
import { useNavigate, useParams } from "react-router";
import type { Song } from "../../../../../services/deckService";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useMediaQuery } from "@mantine/hooks";
import { MOBILE_BREAKPOINT } from "../../../Settings";
import SongTable from "./SongTable";
import { IconSearch, IconPlus, IconTrash, IconCheck } from "@tabler/icons-react";

/**
 * Sucht Songs nach Name.
 * @param query - Suchbegriff
 * @returns Array gefundener Songs
 */
async function searchSongsSpotify(query: string): Promise<Song[]> {
    // TODO: Datenbank-Call implementieren
    return mockSearchResults.filter(song => song.title.toLowerCase().includes(query.toLowerCase()));
}

/**
 * Laden aller Songs für ein bestimmtes Deck.
 * @param deckId - ID des Decks
 * @returns Array der Songs im Deck
 */
async function loadDeckSongsDB(_deckId: string): Promise<[Song[], boolean]> {
    let loading = true;
    // TODO: Datenbank-Call implementieren
    await new Promise(resolve => setTimeout(resolve, 5000)); // Simuliere Netzwerkverzögerung
    loading = false;
    return [mockSongsInDeck, loading];
}

/**
 * Fügt Songs zum Deck in der Datenbank hinzu.
 * @param deckId - ID des Decks
 * @param songs - Vollständige Song-Objekte
 */
async function addSongsToDeckDB(_deckId: string, _songs: Song[]): Promise<void> {
    // TODO: Datenbank-Call implementieren
    await new Promise(resolve => setTimeout(resolve, 5000)); // Simuliere Netzwerkverzögerung
}

/**
 * Entfernt Songs aus dem Deck in der Datenbank.
 * @param deckId - ID des Decks
 * @param songIds - IDs der zu entfernenden Songs
 */
async function removeSongsFromDeckDB(_deckId: string, _songIds: string[]): Promise<void> {
    // TODO: Datenbank-Call implementieren
}

const mockSongsInDeck: Song[] = [
    {
        id: "1",
        title: "Song 1",
        artist: "Artist A",
        album: null,
        year: 2020,
        thumbnail_url: "https://example.com/cover1.jpg",
    },
    {
        id: "2",
        title: "Song 2",
        artist: "Artist B",
        album: null,
        year: 2019,
        thumbnail_url: "https://example.com/cover2.jpg",
    },
    {
        id: "3",
        title: "Song 3",
        artist: "Artist C",
        album: null,
        year: 2021,
        thumbnail_url: "https://example.com/cover3.jpg",
    },
];

const mockSearchResults: Song[] = [
    {
        id: "4",
        title: "Song 4",
        artist: "Artist D",
        album: null,
        year: 2018,
        thumbnail_url: "https://example.com/cover4.jpg",
    },
    {
        id: "5",
        title: "Song 5",
        artist: "Artist E",
        album: null,
        year: 2022,
        thumbnail_url: "https://example.com/cover5.jpg",
    },
    {
        id: "6",
        title: "Song 6",
        artist: "Artist F",
        album: null,
        year: 2020,
        thumbnail_url: "https://example.com/cover6.jpg",
    },
    {
        id: "7",
        title: "Song 7",
        artist: "Artist G",
        album: null,
        year: 2019,
        thumbnail_url: "https://example.com/cover7.jpg",
    },
    {
        id: "8",
        title: "Song 8",
        artist: "Artist H",
        album: null,
        year: 2021,
        thumbnail_url: "https://example.com/cover8.jpg",
    },
];

export default function EditSongsPage() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [songsInDeck, setSongsInDeck] = useState<Song[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchDeckValue, setSearchDeckValue] = useState("");
    const [searchResultsValue, setSearchResultsValue] = useState("");
    const [selectedSearchKeys, setSelectedSearchKeys] = useState<Selection>(new Set());
    const [selectedDeckKeys, setSelectedDeckKeys] = useState<Selection>(new Set());
    const [loadingDeckIds, setLoadingDeckIds] = useState<Set<string>>(new Set());

    const isMobile = useMediaQuery(MOBILE_BREAKPOINT);

    // Lade Songs im Deck beim Initialisieren
    useEffect(() => {
        loadDeckSongsDB(id!).then(([songs, loading]) => {
            setSongsInDeck(songs);
            setLoading(loading);
        });
    }, [id]);

    // TODO: Songs vom Backend fetchen basierend auf Suchtext
    const [songsInSearchResults, setSongsInSearchResults] = useState<Song[]>(mockSearchResults);

    // "all" in explizite IDs umwandeln, damit nur angezeigte Songs selektiert werden
    const handleSearchSelectionChange = useCallback(
        (keys: Selection) => {
            if (keys === "all") {
                // Alle Songs außer ladenden auswählen
                const selectableIds = songsInSearchResults
                    .filter(s => !loadingDeckIds.has(s.id))
                    .map(s => s.id);
                setSelectedSearchKeys(new Set(selectableIds));
            } else {
                setSelectedSearchKeys(keys);
            }
        },
        [songsInSearchResults, loadingDeckIds]
    );

    // Cache für Song-Objekte, damit ausgewählte Songs auch nach Query-Wechsel verfügbar bleiben
    const songCacheRef = useRef<Map<string, Song>>(new Map());
    // Cache inline aktualisieren (vor useMemo)
    songsInSearchResults.forEach(s => songCacheRef.current.set(s.id, s));

    // Angezeigte Suchergebnisse: Ausgewählte Songs oben gepinnt, restliche darunter
    const displayedSearchSongs = useMemo(() => {
        const selectedIds = Array.from(selectedSearchKeys as Set<string>);

        const selectedIdSet = new Set(selectedIds);

        // Ausgewählte Songs aus dem Cache holen (bleiben auch nach Query-Wechsel erhalten)
        const pinnedSongs = selectedIds
            .map(id => songCacheRef.current.get(id))
            .filter((s): s is Song => s !== undefined);

        // Nicht-ausgewählte Songs aus den aktuellen Ergebnissen
        const nonSelected = songsInSearchResults.filter(s => !selectedIdSet.has(s.id));

        return [...pinnedSongs, ...nonSelected];
    }, [selectedSearchKeys, songsInSearchResults]);

    // Filtere Songs im Deck basierend auf Suchtext
    const filteredSongsInDeck = useMemo(() => {
        if (!searchDeckValue.trim()) return songsInDeck;

        const query = searchDeckValue.toLowerCase();
        return songsInDeck.filter(
            song =>
                song.title?.toLowerCase().includes(query) ||
                song.artist?.toLowerCase().includes(query) ||
                String(song.year)?.includes(query)
        );
    }, [songsInDeck, searchDeckValue]);

    // Angezeigte Deck-Songs: Ausgewählte oben gepinnt, auch wenn sie nicht zur Query passen
    const displayedDeckSongs = useMemo(() => {
        const selectedIds = Array.from(selectedDeckKeys as Set<string>);
        const selectedIdSet = new Set(selectedIds);

        // Ausgewählte Songs aus dem gesamten Deck holen (unabhängig vom Filter)
        const pinnedSongs = selectedIds
            .map(id => songsInDeck.find(s => s.id === id))
            .filter((s): s is Song => s !== undefined);

        // Nicht-ausgewählte Songs aus den gefilterten Ergebnissen
        const nonSelected = filteredSongsInDeck.filter(s => !selectedIdSet.has(s.id));

        return [...pinnedSongs, ...nonSelected];
    }, [selectedDeckKeys, filteredSongsInDeck, songsInDeck]);

    const handleDeckSelectionChange = useCallback(
        (keys: Selection) => {
            if (keys === "all") {
                // Alle Songs außer ladenden auswählen
                const selectableIds = filteredSongsInDeck
                    .filter(s => !loadingDeckIds.has(s.id))
                    .map(s => s.id);
                setSelectedDeckKeys(new Set(selectableIds));
            } else {
                setSelectedDeckKeys(keys);
            }
        },
        [filteredSongsInDeck, loadingDeckIds]
    );

    useEffect(() => {
        searchSongsSpotify(searchResultsValue).then(results => {
            setSongsInSearchResults(results);
        });
    }, [searchResultsValue]);

    const hasSearchSelection = selectedSearchKeys instanceof Set && selectedSearchKeys.size > 0;
    const hasDeckSelection = selectedDeckKeys instanceof Set && selectedDeckKeys.size > 0;

    const handleAddToDeck = useCallback(async () => {
        const keysToAdd = Array.from(selectedSearchKeys as Set<string>);

        const songsToAdd = keysToAdd
            .map(songId => songCacheRef.current.get(songId))
            .filter((s): s is Song => s !== undefined);

        // Nur Songs einfügen, die noch nicht im Deck sind
        const existingIds = new Set(songsInDeck.map(s => s.id));
        const newSongs = songsToAdd.filter(s => !existingIds.has(s.id));
        if (newSongs.length === 0) return;

        const newIds = newSongs.map(s => s.id);

        // Sofort ins Deck einfügen (optimistisch) + Loading-State setzen
        setSongsInDeck(prev => [...prev, ...newSongs]);
        setLoadingDeckIds(prev => new Set([...prev, ...newIds]));
        setSelectedSearchKeys(new Set());

        try {
            await addSongsToDeckDB(id!, newSongs);
        } catch (error) {
            // Rollback bei Fehler
            setSongsInDeck(prev => prev.filter(s => !newIds.includes(s.id)));
            console.error("Fehler beim Hinzufügen:", error);
        } finally {
            setLoadingDeckIds(prev => {
                const next = new Set(prev);
                newIds.forEach(songId => next.delete(songId));
                return next;
            });
        }
    }, [selectedSearchKeys, songsInDeck, id]);

    const handleRemoveFromDeck = useCallback(async () => {
        const keysToRemove = Array.from(selectedDeckKeys as Set<string>);
        if (keysToRemove.length === 0) return;

        // Songs merken für Rollback
        const removedSongs = songsInDeck.filter(s => keysToRemove.includes(s.id));

        // Sofort entfernen (optimistisch)
        setSongsInDeck(prev => prev.filter(s => !keysToRemove.includes(s.id)));
        setSelectedDeckKeys(new Set());

        try {
            await removeSongsFromDeckDB(id!, keysToRemove);
        } catch (error) {
            // Rollback bei Fehler
            setSongsInDeck(prev => [...prev, ...removedSongs]);
            console.error("Fehler beim Entfernen:", error);
        }
    }, [selectedDeckKeys, songsInDeck, id]);

    const SongsSearchTable = (
        <div>
            <Center className="w-full">
                <Title order={4} mb="sm" hidden={isMobile}>
                    Songs hinzufügen
                    <Center>
                        <Text c={"dimmed"}>(Spotify)</Text>
                    </Center>
                </Title>
            </Center>
            <Input
                isClearable
                className="w-full mb-4"
                placeholder="Nach Song-Namen suchen..."
                startContent={<IconSearch />}
                value={searchResultsValue}
                onValueChange={setSearchResultsValue}
            />
            <SongTable
                songs={displayedSearchSongs}
                color="secondary"
                selectedKeys={selectedSearchKeys}
                onSelectionChange={handleSearchSelectionChange}
                tableLoading={loading}
            />
            <Button
                className="w-full mt-3"
                color="secondary"
                variant="flat"
                isDisabled={!hasSearchSelection || loading}
                onPress={handleAddToDeck}
                startContent={<IconPlus size={18} />}
            >
                Zum Deck hinzufügen
            </Button>
        </div>
    );

    const SongsInDeckTable = (
        <div>
            <Center className="w-full">
                <Title order={4} mb="sm" hidden={isMobile}>
                    Songs im Deck
                    <Center>
                        <Text c={"dimmed"}>(Lokal)</Text>
                    </Center>
                </Title>
            </Center>
            <Input
                isClearable
                className="w-full mb-4"
                placeholder="Nach Songs, Künstlern oder Jahr suchen..."
                startContent={<IconSearch />}
                value={searchDeckValue}
                onValueChange={setSearchDeckValue}
            />
            <SongTable
                songs={displayedDeckSongs}
                color="primary"
                selectedKeys={selectedDeckKeys}
                onSelectionChange={handleDeckSelectionChange}
                loadingIds={loadingDeckIds}
                tableLoading={loading}
            />
            <Button
                className="w-full mt-3"
                color="danger"
                variant="flat"
                isDisabled={!hasDeckSelection || loading}
                onPress={handleRemoveFromDeck}
                startContent={<IconTrash size={18} />}
            >
                Aus Deck entfernen
            </Button>
        </div>
    );

    return (
        <Stack gap="lg" p={"lg"}>
            <Center className="w-full">
                <Title order={2}>Songs bearbeiten</Title>
            </Center>

            {!isMobile ? (
                <SimpleGrid cols={2} spacing="lg">
                    <div>{SongsSearchTable}</div>
                    <div>{SongsInDeckTable}</div>
                </SimpleGrid>
            ) : (
                <Center>
                    <Stack>
                        <Tabs>
                            <Tab title="Songs hinzufügen">{SongsSearchTable}</Tab>
                            <Tab title="Songs im Deck">{SongsInDeckTable}</Tab>
                        </Tabs>
                    </Stack>
                </Center>
            )}

            <Group justify="space-between" mt="xl">
                <Button
                    color="primary"
                    className="w-full"
                    onPress={() => navigate("/lab")}
                    isLoading={loadingDeckIds.size > 0 || loading}
                    startContent={!loading && <IconCheck size={18} />}
                >
                    Fertig
                </Button>
            </Group>
        </Stack>
    );
}
