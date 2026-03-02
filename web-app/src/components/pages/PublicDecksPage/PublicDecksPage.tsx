import { useState } from "react";

import { DeckCard, DeckCardSkeleton } from "./DeckCard";
import { Center, SimpleGrid, Stack } from "@mantine/core";
import SearchBar from "./SearchBarProp";
import { Pagination } from "@heroui/react";
import { useMediaQuery } from "@mantine/hooks";
import { MOBILE_BREAKPOINT, PAGINATION_BREAKPOINT } from "../Settings";
import { usePublicDecks } from "../../../hooks/usePublicDecks";
import type { PublicDeckDTO } from "../../../services/deckService";

export default function PublicDecksPageWrapper() {
    const [search_str, setSearchStr] = useState("");
    const [page, setPage] = useState(1);

    const { decks, totalCount, loading } = usePublicDecks(search_str, page);

    return (
        <div className="p-4">
            <PublicDecksPage
                decks={decks}
                totalCount={totalCount}
                search_props={{ search_str, setSearchStr }}
                loading={loading}
                page_props={{ page, setPage }}
            />
        </div>
    );
}

interface PropsDecksPage {
    decks?: PublicDeckDTO[];
    totalCount: number;
    search_props?: { search_str: string; setSearchStr: (str: string) => void };
    loading?: boolean;
    page_props?: { page: number; setPage: (page: number) => void };
}

function PublicDecksPage({ decks, totalCount, search_props, loading, page_props }: PropsDecksPage) {
    const isMobile = useMediaQuery(MOBILE_BREAKPOINT);

    return (
        <div>
            <Stack>
                <SearchBar {...search_props!} />
                <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
                    {loading
                        ? Array.from({ length: PAGINATION_BREAKPOINT }).map((_, i) => <DeckCardSkeleton key={i} />)
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
