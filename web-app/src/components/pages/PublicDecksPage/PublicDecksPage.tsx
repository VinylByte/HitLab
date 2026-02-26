import { useEffect, useState } from "react";

import { DeckCard, DeckCardSkeleton } from "./DeckCard";
import { Center, SimpleGrid, Stack } from "@mantine/core";
import SearchBar from "./SearchBarProp";
import { Pagination } from "@heroui/react";
import { useMediaQuery } from "@mantine/hooks";
import { MOBILE_BREAKPOINT } from "../Settings";

interface Deck {
    id: string;
    owner_id: string;
    name: string;
    description: string;
    visibility: "public" | "private";
    share_token: string;
    cover_url: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    tags: string[];
}

const MOCK_DECKS: Deck[] = Array.from({ length: 12 }).map((_, i) => ({
    tags: ["technology", "laptops"],
    title: "The best laptop for Frontend engineers in 2022",
    authorName: "Elsa Typechecker",
    authorAvatar:
        "https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-8.png",
    date: "Feb 6th",
    image: "https://images.unsplash.com/photo-1602080858428-57174f9431cf?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&q=80",
}));

export default function PublicDecksPageWrapper() {
    const [search_str, setSearchStr] = useState("");
    const [decks, setDecks] = useState<Deck[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);

    useEffect(() => {
        //
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setDecks(MOCK_DECKS);
        }, 2000);
    }, [search_str, page]);

    return (
        <div className="p-4">
            <PublicDecksPage
                decks={decks}
                search_props={{ search_str, setSearchStr }}
                loading={loading}
                page_props={{ page, setPage }}
            />
        </div>
    );
}

function PublicDecksPage({
    decks,
    search_props,
    loading,
    page_props,
}: {
    decks?: Deck[];
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
                    <Pagination onChange={page_props?.setPage || (() => {})} showControls={isMobile} isDisabled={loading} initialPage={page_props?.page || 1} total={10} />
                </Center>
            </Stack>
        </div>
    );
}
