import { useEffect, useRef, useState } from "react";

import { DeckCard, DeckCardSkeleton } from "./DeckCard";
import { Center, SimpleGrid, Stack } from "@mantine/core";
import SearchBar from "./SearchBarProp";
import { Pagination } from "@heroui/react";
import { useMediaQuery } from "@mantine/hooks";
import { MOBILE_BREAKPOINT, PAGINATION_BREAKPOINT } from "@/lib/constants";
import { usePublicDecks } from "@/hooks/usePublicDecks";
import { fetchPublicDeckById } from "@/services/deckService";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { DeckModal } from "../LabsPage/ViewDeckModal";
import { routes } from "@/lib/routes";
import type { PublicDeck } from "@/types/deck";

export default function PublicDecksPageWrapper() {
    const [searchParams] = useSearchParams();
    const { deckId } = useParams();
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [routeDeck, setRouteDeck] = useState<PublicDeck | null>(null);
    const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
    const lastHandledDeckId = useRef<string | null>(null);

    const { decks, totalCount, loading } = usePublicDecks(searchParams.get("query") || "", page);

    const handleRouteModalOpenChange = (isOpen: boolean) => {
        setIsRouteModalOpen(isOpen);
        if (!isOpen && deckId) {
            navigate({
                pathname: routes.decks,
                search: searchParams.toString() ? `?${searchParams.toString()}` : "",
            });
        }
    };

    useEffect(() => {
        if (!deckId) {
            setRouteDeck(null);
            setIsRouteModalOpen(false);
            lastHandledDeckId.current = null;
            return;
        }

        if (lastHandledDeckId.current === deckId) return;

        const deckFromPage = decks.find(deck => deck.id === deckId);
        if (deckFromPage) {
            setRouteDeck(deckFromPage);
            setIsRouteModalOpen(true);
            lastHandledDeckId.current = deckId;
            return;
        }

        let cancelled = false;
        fetchPublicDeckById(deckId)
            .then(deck => {
                if (cancelled || !deck) return;
                setRouteDeck(deck);
                setIsRouteModalOpen(true);
                lastHandledDeckId.current = deckId;
            })
            .catch(() => {
                if (cancelled) return;
                lastHandledDeckId.current = deckId;
            });

        return () => {
            cancelled = true;
        };
    }, [deckId, decks]);

    return (
        <div className="p-4">
            <DeckModal
                isOpen={isRouteModalOpen}
                onOpenChange={handleRouteModalOpenChange}
                deck={routeDeck}
            />
            <PublicDecksPage
                decks={decks}
                totalCount={totalCount}
                loading={loading}
                page_props={{ page, setPage }}
            />
        </div>
    );
}

interface PropsDecksPage {
    decks?: PublicDeck[];
    totalCount: number;
    search_props?: { search_str: string; setSearchStr: (str: string) => void };
    loading?: boolean;
    page_props?: { page: number; setPage: (page: number) => void };
}

function PublicDecksPage({ decks, totalCount, loading, page_props }: PropsDecksPage) {
    const isMobile = useMediaQuery(MOBILE_BREAKPOINT);

    return (
        <div>
            <Stack>
                <SearchBar />
                <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
                    {loading
                        ? Array.from({ length: PAGINATION_BREAKPOINT }).map((_, i) => (
                              <DeckCardSkeleton key={i} />
                          ))
                        : decks?.map(deck => <DeckCard key={deck.id} data={deck} />)}
                </SimpleGrid>
                <Center>
                    <Pagination
                        onChange={page_props?.setPage || (() => {})}
                        showControls={isMobile}
                        isDisabled={loading}
                        initialPage={page_props?.page || 1}
                        total={Math.ceil(totalCount / PAGINATION_BREAKPOINT)}
                    />
                </Center>
            </Stack>
        </div>
    );
}
