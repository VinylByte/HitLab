import { useState } from "react";

import { DeckCard, DeckCardSkeleton } from "./DeckCard";
import { Center, SimpleGrid, Stack } from "@mantine/core";
import SearchBar from "./SearchBarProp";
import { Pagination } from "@heroui/react";
import { useMediaQuery } from "@mantine/hooks";
import { MOBILE_BREAKPOINT } from "../Settings";
import { usePublicDecks } from "../../../hooks/usePublicDecks";
import type { PublicDeckDTO } from "../../../services/deckService";

export default function PublicDecksPageWrapper() {
    const [search_str, setSearchStr] = useState("");
    const [page, setPage] = useState(1);

    const { decks, loading } = usePublicDecks(search_str, page);

    return (
        <div className="p-4">
            <PublicDecksPage decks={decks} search_props={{ search_str, setSearchStr }} loading={loading} page_props={{ page, setPage }} />
        </div>
    );
}

function PublicDecksPage({
    decks,
    search_props,
    loading,
    page_props,
}: {
    decks?: PublicDeckDTO[];
    search_props?: { search_str: string; setSearchStr: (str: string) => void };
    loading?: boolean;
    page_props?: { page: number; setPage: (page: number) => void };
}) {
    const isMobile = useMediaQuery(MOBILE_BREAKPOINT);

    return (
        <div>
            <Stack>
                <SearchBar {...search_props!} />
                <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
                    {loading
                        ? Array.from({ length: 12 }).map((_, i) => <DeckCardSkeleton key={i} />)
                        : decks?.map(deck => <DeckCard key={deck.id} data={deck} />)}
                </SimpleGrid>
                <Center>
                    <Pagination
                        onChange={page_props?.setPage || (() => {})}
                        showControls={isMobile}
                        isDisabled={loading}
                        initialPage={page_props?.page || 1}
                        total={10}
                    />
                </Center>
            </Stack>
        </div>
    );
}
