import type { ChipProps } from "@heroui/react";

import React, { useMemo, useState } from "react";
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    User,
    Chip,
    Tooltip,
    Dropdown,
    DropdownTrigger,
    DropdownItem,
    DropdownMenu,
    Button,
} from "@heroui/react";
import {
    IconDotsVertical,
    IconDownload,
    IconEdit,
    IconEye,
    IconPlus,
    IconTrash,
} from "@tabler/icons-react";
import { Center, Group } from "@mantine/core";
import SearchBar from "../PublicDecksPage/SearchBarProp";
import { useMediaQuery } from "@mantine/hooks";
import { MOBILE_BREAKPOINT } from "../Settings";
import { useSearchParams } from "react-router";

const statusColorMap: Record<string, ChipProps["color"]> = {
    private: "success",
    public: "danger",
};

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

export default function DecksTable({
    decks,
    viewDeck,
    editDeck,
    createDeck,
    deleteDeck,
}: {
    decks: DECK[];
    viewDeck: (deck: DECK) => void;
    createDeck: () => void;
    editDeck: (deck: DECK) => void;
    deleteDeck: (deck: DECK) => void;
}) {
    const [sortKey, setSortKey] = useState<string>("created_at");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
    const [searchParams,] = useSearchParams();
    const isMobile = useMediaQuery(MOBILE_BREAKPOINT);

    const columns = useMemo(() => {
        if (isMobile) {
            return [
                { name: "TITLE", uid: "title" },
                { name: "ACTIONS", uid: "actions" },
            ];
        }
        return [
            { name: "TITLE", uid: "title" },
            { name: "SONG ANZAHL", uid: "song_count" },
            { name: "STATUS", uid: "status" },
            { name: "ERSTELLT AM", uid: "created_at" },
            { name: "ACTIONS", uid: "actions" },
        ];
    }, [isMobile]);

    const titleCollator = React.useMemo(
        () =>
            new Intl.Collator("de-DE", {
                usage: "sort",
                sensitivity: "base",
                ignorePunctuation: true,
                numeric: false,
            }),
        []
    );

    const handleSort = React.useCallback(
        (uid: string) => {
            if (uid === "actions") return;
            if (uid === sortKey) {
                setSortDir(prev => (prev === "asc" ? "desc" : "asc"));
            } else {
                setSortKey(uid);
                setSortDir("asc");
            }
        },
        [sortKey]
    );

    const renderCell = React.useCallback(
        (deck: DECK, columnKey: React.Key) => {
            switch (columnKey) {
                case "title":
                    return (
                        <User
                            avatarProps={{ radius: "lg", src: deck.cover_url }}
                            name={deck.name}
                        ></User>
                    );
                case "song_count":
                    return (
                        <div className="flex flex-col">
                            <Center>
                                <p className="text-bold text-sm capitalize">{deck.song_count}</p>
                            </Center>
                            <Center>
                                <p className="text-bold text-sm capitalize text-default-400">
                                    Songs
                                </p>
                            </Center>
                        </div>
                    );
                case "status":
                    return (
                        <Center>
                            <Chip
                                className="capitalize"
                                color={statusColorMap[deck.status]}
                                size="sm"
                                variant="flat"
                            >
                                {deck.status}
                            </Chip>
                        </Center>
                    );
                case "created_at":
                    const date = new Date(deck.created_at);
                    return (
                        <Center>
                            <p className="text-bold text-sm capitalize">
                                {date.toLocaleDateString("de-DE", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "2-digit",
                                })}
                            </p>
                        </Center>
                    );
                case "actions":
                    return (
                        <Center className="relative flex items-center gap-2">
                            {isMobile ? (
                                <Dropdown>
                                    <DropdownTrigger>
                                        <IconDotsVertical className="text-lg text-default-400 cursor-pointer active:opacity-50" />
                                    </DropdownTrigger>
                                    <DropdownMenu>
                                        <DropdownItem
                                            key="view-deck"
                                            startContent={<IconEye />}
                                            onClick={() => viewDeck(deck)}
                                        >
                                            Deck ansehen
                                        </DropdownItem>
                                        <DropdownItem
                                            key="edit-deck"
                                            startContent={<IconEdit />}
                                            showDivider
                                            onClick={() => editDeck(deck)}
                                        >
                                            Deck bearbeiten
                                        </DropdownItem>
                                        <DropdownItem
                                            key="delete-deck"
                                            startContent={<IconTrash />}
                                            className="text-danger"
                                            color="danger"
                                            onClick={() => deleteDeck(deck)}
                                        >
                                            Deck löschen
                                        </DropdownItem>
                                    </DropdownMenu>
                                </Dropdown>
                            ) : (
                                <Group>
                                    <Tooltip content="Deck ansehen">
                                        <span
                                            className="text-lg text-default-400 cursor-pointer active:opacity-50"
                                            onClick={() => viewDeck(deck)}
                                        >
                                            <IconEye />
                                        </span>
                                    </Tooltip>
                                    <Tooltip content="Deck bearbeiten">
                                        <span
                                            className="text-lg text-default-400 cursor-pointer active:opacity-50"
                                            onClick={() => editDeck(deck)}
                                        >
                                            <IconEdit />
                                        </span>
                                    </Tooltip>
                                    <Tooltip color="danger" content="Deck löschen">
                                        <span
                                            className="text-lg text-danger cursor-pointer active:opacity-50"
                                            onClick={() => deleteDeck(deck)}
                                        >
                                            <IconTrash />
                                        </span>
                                    </Tooltip>
                                </Group>
                            )}
                        </Center>
                    );
                default:
                    return null;
            }
        },
        [isMobile]
    );

    const sortedDecks = useMemo(() => {
        const arr = [...decks];
        arr.sort((a, b) => {
            const aVal = a[sortKey as keyof DECK];
            const bVal = b[sortKey as keyof DECK];

            if (sortKey === "song_count") {
                return sortDir === "asc"
                    ? Number(aVal) - Number(bVal)
                    : Number(bVal) - Number(aVal);
            }

            if (sortKey === "created_at") {
                const ad = new Date(String(aVal)).getTime();
                const bd = new Date(String(bVal)).getTime();
                return sortDir === "asc" ? ad - bd : bd - ad;
            }

            if (sortKey === "title") {
                const compare = titleCollator.compare(String(a.name), String(b.name));
                return sortDir === "asc" ? compare : -compare;
            }

            const sa = String(aVal).toLowerCase();
            const sb = String(bVal).toLowerCase();
            if (sa < sb) return sortDir === "asc" ? -1 : 1;
            if (sa > sb) return sortDir === "asc" ? 1 : -1;
            return 0;
        });
        return arr;
    }, [sortKey, sortDir, titleCollator]);

    const filteredDecks = useMemo(() => {
        const query = searchParams.get("query")?.trim().toLocaleLowerCase("de-DE") || "";
        if (!query) return sortedDecks;

        return sortedDecks.filter(deck => {
            const title = deck.name.toLocaleLowerCase("de-DE");
            const status = deck.status.toLocaleLowerCase("de-DE");
            const createdAt = deck.created_at.toLocaleLowerCase("de-DE");

            return title.includes(query) || status.includes(query) || createdAt.includes(query);
        });
    }, [searchParams, sortedDecks]);

    return (
        <div>
            <SearchBar />
            <Button
                variant="shadow"
                color="primary"
                startContent={<IconPlus />}
                className="w-full mb-4"
                onPress={createDeck}
            >
                Neues Deck erstellen
            </Button>
            <Table
                isStriped
                aria-label="Example table with custom cells"
                classNames={{ base: "w-full" }}
            >
                <TableHeader>
                    {columns.map(column => (
                        <TableColumn
                            key={column.uid}
                            align={column.uid === "actions" ? "center" : "start"}
                        >
                            <Center>
                                <span
                                    role={column.uid === "actions" ? undefined : "button"}
                                    tabIndex={column.uid === "actions" ? -1 : 0}
                                    onClick={() => handleSort(column.uid)}
                                    onKeyDown={e => {
                                        if (e.key === "Enter") handleSort(column.uid);
                                    }}
                                    style={{
                                        cursor: column.uid === "actions" ? "default" : "pointer",
                                    }}
                                >
                                    {column.name}
                                    {sortKey === column.uid
                                        ? sortDir === "asc"
                                            ? " ▲"
                                            : " ▼"
                                        : null}
                                </span>
                            </Center>
                        </TableColumn>
                    ))}
                </TableHeader>
                <TableBody items={filteredDecks} emptyContent={"Keine Decks gefunden"}>
                    {item => (
                        <TableRow key={item.id}>
                            {columnKey => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
