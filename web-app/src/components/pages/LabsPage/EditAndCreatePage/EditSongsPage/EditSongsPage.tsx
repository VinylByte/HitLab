import { Title, Text, Stack, Group, SimpleGrid, Center } from "@mantine/core";
import { Button, Input, Tab, Tabs } from "@heroui/react";
import type { Selection } from "@heroui/react";
import { useNavigate, useParams } from "react-router";
import { useState, useMemo, useEffect, useCallback } from "react";
import { useMediaQuery } from "@mantine/hooks";
import { MOBILE_BREAKPOINT } from "../../../../../lib/constants";
import SongTable from "./SongTable";
import type { SongTableItem } from "./SongTable";
import { IconSearch, IconPlus, IconTrash, IconCheck, IconLink } from "@tabler/icons-react";
import { useSongSearch } from "../../../../../hooks/useSongSearch";
import { usePlaylist } from "../../../../../hooks/usePlaylist";
import { fetchDeckSongs, removeDeckSongs } from "../../../../../services/deckService";
import { addDeckSong } from "../../../../../services/createDeckService";
import type { SpotifyTrack } from "../../../../../types/spotify";
import type { Song } from "../../../../../types/song";

type SearchMode = "song" | "playlist";

function songToTableItem(song: Song): SongTableItem {
    return {
        id: song.id,
        title: song.title,
        artist: song.artist,
        year: song.year,
        thumbnail_url: song.thumbnail_url,
    };
}

function spotifyTrackToTableItem(track: SpotifyTrack): SongTableItem {
    return {
        id: track.spotify_track_id,
        title: track.title,
        artist: track.artist,
        year: track.year,
        thumbnail_url: track.thumbnail_url,
    };
}

export default function EditSongsPage() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [songsInDeck, setSongsInDeck] = useState<Song[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchDeckValue, setSearchDeckValue] = useState("");
    const [songSearchValue, setSongSearchValue] = useState("");
    const [playlistLinkValue, setPlaylistLinkValue] = useState("");
    const [searchMode, setSearchMode] = useState<SearchMode>("song");
    const [selectedSearchKeys, setSelectedSearchKeys] = useState<Selection>(new Set());
    const [selectedDeckKeys, setSelectedDeckKeys] = useState<Selection>(new Set());
    const [loadingDeckIds, setLoadingDeckIds] = useState<Set<string>>(new Set());

    const isMobile = useMediaQuery(MOBILE_BREAKPOINT);
    const desktopControlsClass = isMobile ? "" : "h-[170px] flex flex-col";

    // Lade Songs im Deck aus der Datenbank
    useEffect(() => {
        if (!id) return;
        fetchDeckSongs(id)
            .then(deckSongs => setSongsInDeck(deckSongs.map(ds => ds.song)))
            .catch(err => console.error("Fehler beim Laden der Deck-Songs:", err))
            .finally(() => setLoading(false));
    }, [id]);

    // Spotify-Suche via useSongSearch Hook (debounced, min. 2 Zeichen)
    const {
        songs: songSearchResults,
        loading: songSearchLoading,
        error: songSearchError,
    } = useSongSearch(searchMode === "song" ? songSearchValue : "");

    const {
        songs: playlistResults,
        loading: playlistLoading,
        error: playlistError,
    } = usePlaylist(searchMode === "playlist" ? playlistLinkValue : "");

    const activeSpotifyResults = useMemo(
        () => (searchMode === "song" ? songSearchResults : playlistResults),
        [searchMode, songSearchResults, playlistResults]
    );

    const searchLoading = searchMode === "song" ? songSearchLoading : playlistLoading;
    const searchError = searchMode === "song" ? songSearchError : playlistError;

    // Konvertiere Spotify-Ergebnisse zu SongTableItems
    const searchTableItems = useMemo(
        () => activeSpotifyResults.map(spotifyTrackToTableItem),
        [activeSpotifyResults]
    );

    // Caches für ausgewählte Songs (nur in Event-Handlern aktualisiert)
    const [selectedItemsCache, setSelectedItemsCache] = useState<Map<string, SongTableItem>>(
        new Map()
    );
    const [selectedTracksCache, setSelectedTracksCache] = useState<Map<string, SpotifyTrack>>(
        new Map()
    );

    // "all" in explizite IDs umwandeln + Caches für gepinnte Auswahl aktualisieren
    const handleSearchSelectionChange = useCallback(
        (keys: Selection) => {
            let newKeySet: Set<string>;
            if (keys === "all") {
                newKeySet = new Set(
                    searchTableItems.filter(s => !loadingDeckIds.has(s.id)).map(s => s.id)
                );
            } else {
                newKeySet = keys as Set<string>;
            }

            setSelectedSearchKeys(newKeySet);

            // SongTableItem-Cache: Nur ausgewählte Items speichern
            setSelectedItemsCache(prev => {
                const next = new Map<string, SongTableItem>();
                for (const id of Array.from(newKeySet)) {
                    const cached = prev.get(id);
                    if (cached) {
                        next.set(id, cached);
                    } else {
                        const fromResults = searchTableItems.find(s => s.id === id);
                        if (fromResults) next.set(id, fromResults);
                    }
                }
                return next;
            });

            // SpotifyTrack-Cache: populate with tracks from activeSpotifyResults at time of selection
            setSelectedTracksCache(() => {
                const next = new Map<string, SpotifyTrack>();
                for (const id of Array.from(newKeySet)) {
                    const fromResults = activeSpotifyResults.find(t => t.spotify_track_id === id);
                    if (fromResults) next.set(id, fromResults);
                }
                return next;
            });
        },
        [searchTableItems, loadingDeckIds, activeSpotifyResults]
    );

    useEffect(() => {
        setSelectedSearchKeys(new Set());
        setSelectedItemsCache(new Map());
        setSelectedTracksCache(new Map());
    }, [searchMode]);

    // Pin selected search rows only when they would disappear due to current filter/query.
    // Short-circuit to stable reference when no pinning is needed (avoids re-rendering SongTable).
    const displayedSearchItems = useMemo(() => {
        if (!(selectedSearchKeys instanceof Set) || selectedSearchKeys.size === 0)
            return searchTableItems;

        const visibleIds = new Set(searchTableItems.map(s => s.id));
        const pinnedMissing = Array.from(selectedSearchKeys as Set<string>)
            .filter(id => !visibleIds.has(id))
            .map(id => selectedItemsCache.get(id))
            .filter((s): s is SongTableItem => s !== undefined);

        return pinnedMissing.length === 0
            ? searchTableItems
            : [...pinnedMissing, ...searchTableItems];
    }, [selectedSearchKeys, selectedItemsCache, searchTableItems]);

    // Deck-Songs als SongTableItems
    const deckTableItems = useMemo(() => songsInDeck.map(songToTableItem), [songsInDeck]);

    // Filtere Songs im Deck basierend auf Suchtext
    const filteredDeckItems = useMemo(() => {
        if (!searchDeckValue.trim()) return deckTableItems;

        const query = searchDeckValue.toLowerCase();
        return deckTableItems.filter(
            song =>
                song.title?.toLowerCase().includes(query) ||
                song.artist?.toLowerCase().includes(query) ||
                String(song.year)?.includes(query)
        );
    }, [deckTableItems, searchDeckValue]);

    // Pin selected deck rows only when they would disappear due to the local search filter.
    // Short-circuit to stable reference when no pinning is needed (avoids re-rendering SongTable).
    const displayedDeckItems = useMemo(() => {
        if (!(selectedDeckKeys instanceof Set) || selectedDeckKeys.size === 0)
            return filteredDeckItems;

        const visibleIds = new Set(filteredDeckItems.map(s => s.id));
        const pinnedMissing = Array.from(selectedDeckKeys as Set<string>)
            .filter(id => !visibleIds.has(id))
            .map(itemId => deckTableItems.find(s => s.id === itemId))
            .filter((s): s is SongTableItem => s !== undefined);

        return pinnedMissing.length === 0
            ? filteredDeckItems
            : [...pinnedMissing, ...filteredDeckItems];
    }, [selectedDeckKeys, filteredDeckItems, deckTableItems]);

    const handleDeckSelectionChange = useCallback(
        (keys: Selection) => {
            if (keys === "all") {
                const selectableIds = filteredDeckItems
                    .filter(s => !loadingDeckIds.has(s.id))
                    .map(s => s.id);
                setSelectedDeckKeys(new Set(selectableIds));
            } else {
                setSelectedDeckKeys(keys);
            }
        },
        [filteredDeckItems, loadingDeckIds]
    );

    const hasSearchSelection = selectedSearchKeys instanceof Set && selectedSearchKeys.size > 0;
    const hasDeckSelection = selectedDeckKeys instanceof Set && selectedDeckKeys.size > 0;

    const handleAddToDeck = useCallback(async () => {
        const keysToAdd = Array.from(selectedSearchKeys as Set<string>);
        if (keysToAdd.length === 0) return;

        // Get tracks from cache (populated at selection time)
        const tracksToAdd = keysToAdd
            .map(spotifyId => {
                const track = selectedTracksCache.get(spotifyId);
                if (!track) {
                    console.warn(`Track not found in cache for ID: ${spotifyId}`);
                    console.warn("Cached IDs:", Array.from(selectedTracksCache.keys()));
                }
                return track;
            })
            .filter((t): t is SpotifyTrack => {
                if (!t) return false;
                if (!t.spotify_track_id) {
                    console.warn("Track has no spotify_track_id:", t);
                    return false;
                }
                return true;
            });

        if (tracksToAdd.length === 0) {
            console.error("No valid tracks in cache");
            return;
        }

        // Nur Songs einfügen, die noch nicht im Deck sind
        const existingSpotifyIds = new Set(songsInDeck.map(s => s.spotify_track_id));
        const newTracks = tracksToAdd.filter(t => !existingSpotifyIds.has(t.spotify_track_id));
        if (newTracks.length === 0) return;

        // Optimistisch ins Deck einfügen mit temporären IDs + Loading-State
        const tempSongs: Song[] = newTracks.map(t => ({
            id: `temp-${t.spotify_track_id}`,
            spotify_track_id: t.spotify_track_id,
            title: t.title,
            artist: t.artist,
            album: t.album,
            year: t.year,
            thumbnail_url: t.thumbnail_url,
        }));

        const tempIds = tempSongs.map(s => s.id);
        setSongsInDeck(prev => [...prev, ...tempSongs]);
        setLoadingDeckIds(prev => new Set([...prev, ...tempIds]));
        setSelectedSearchKeys(new Set());
        setSelectedItemsCache(new Map());
        setSelectedTracksCache(new Map());

        try {
            await addDeckSong(id!, newTracks, spotifyTrackId => {
                setLoadingDeckIds(prev => {
                    const next = new Set(prev);
                    next.delete(`temp-${spotifyTrackId}`);
                    return next;
                });
            });

            // Refetch für korrekte DB-IDs
            const deckSongs = await fetchDeckSongs(id!);
            setSongsInDeck(deckSongs.map(ds => ds.song));
        } catch (error) {
            // Rollback
            setSongsInDeck(prev => prev.filter(s => !tempIds.includes(s.id)));
            setLoadingDeckIds(prev => {
                const next = new Set(prev);
                tempIds.forEach(tempId => next.delete(tempId));
                return next;
            });
            console.error("Fehler beim Hinzufügen:", error);
        }
    }, [selectedSearchKeys, selectedTracksCache, songsInDeck, id]);

    const handleRemoveFromDeck = useCallback(async () => {
        const keysToRemove = Array.from(selectedDeckKeys as Set<string>);
        if (keysToRemove.length === 0) return;

        // Songs merken für Rollback
        const removedSongs = songsInDeck.filter(s => keysToRemove.includes(s.id));

        // Optimistisch entfernen
        setSongsInDeck(prev => prev.filter(s => !keysToRemove.includes(s.id)));
        setSelectedDeckKeys(new Set());

        try {
            await removeDeckSongs(id!, keysToRemove);
        } catch (error) {
            // Rollback
            setSongsInDeck(prev => [...prev, ...removedSongs]);
            console.error("Fehler beim Entfernen:", error);
        }
    }, [selectedDeckKeys, songsInDeck, id]);

    const SongsSearchTable = (
        <div className="w-full min-w-0 flex flex-col h-full">
            <div className={desktopControlsClass}>
                <Center className="w-full">
                    <Title order={4} mb="sm" hidden={isMobile}>
                        Songs hinzufügen
                        <Center>
                            <Text c={"dimmed"}>(Spotify)</Text>
                        </Center>
                    </Title>
                </Center>
                <Tabs
                    fullWidth
                    color="secondary"
                    selectedKey={searchMode}
                    onSelectionChange={key => {
                        setSearchMode(String(key) as SearchMode);
                    }}
                    className="mt-auto"
                >
                    <Tab key="song" title="Song suchen">
                        <Input
                            isClearable
                            className="w-full"
                            placeholder="Nach Song-Namen suchen..."
                            startContent={<IconSearch />}
                            value={songSearchValue}
                            onValueChange={setSongSearchValue}
                        />
                    </Tab>
                    <Tab key="playlist" title="Playlist importieren">
                        <Input
                            isClearable
                            className="w-full"
                            placeholder="Spotify-Playlist-Link eingeben..."
                            startContent={<IconLink />}
                            value={playlistLinkValue}
                            onValueChange={setPlaylistLinkValue}
                        />
                    </Tab>
                </Tabs>
            </div>
            <div className="min-h-[20px] mb-2">
                {searchError && (
                    <Center>
                        <Text c="red" size="sm">
                            Fehler: {searchError.message}
                        </Text>
                    </Center>
                )}
            </div>
            <SongTable
                songs={displayedSearchItems}
                color="secondary"
                selectedKeys={selectedSearchKeys}
                onSelectionChange={handleSearchSelectionChange}
                tableLoading={loading || searchLoading}
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
        <div className="w-full min-w-0 flex flex-col h-full">
            <div className={desktopControlsClass}>
                <Center className="w-full">
                    <Title order={4} mb="sm" hidden={isMobile}>
                        Songs im Deck
                        <Center>
                            <Text c={"dimmed"}>(Lokal)</Text>
                        </Center>
                    </Title>
                </Center>
                <div className={isMobile ? "" : "pt-14"}>
                    <Input
                        isClearable
                        className="w-full"
                        placeholder="Nach Songs, Künstlern oder Jahr suchen..."
                        startContent={<IconSearch />}
                        value={searchDeckValue}
                        onValueChange={setSearchDeckValue}
                    />
                </div>
            </div>
            <div className="min-h-[20px] mb-2"></div>
            <SongTable
                songs={displayedDeckItems}
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
        <Stack p={"lg"}>
            <Center className="w-full">
                <Title order={2}>Songs bearbeiten</Title>
            </Center>

            {!isMobile ? (
                <SimpleGrid cols={2} spacing="lg">
                    <div className="min-w-0">{SongsSearchTable}</div>
                    <div className="min-w-0">{SongsInDeckTable}</div>
                </SimpleGrid>
            ) : (
                <div className="w-full min-w-0">
                    <Tabs fullWidth color="primary">
                        <Tab title="Songs hinzufügen">{SongsSearchTable}</Tab>
                        <Tab title="Songs im Deck">{SongsInDeckTable}</Tab>
                    </Tabs>
                </div>
            )}

            <Group justify="space-between">
                <Button
                    color="primary"
                    className="w-full"
                    onPress={() => navigate("/lab")}
                    isLoading={loadingDeckIds.size > 0 || loading}
                    startContent={!loading && loadingDeckIds.size === 0 && <IconCheck size={18} />}
                >
                    Fertig
                </Button>
            </Group>
        </Stack>
    );
}
