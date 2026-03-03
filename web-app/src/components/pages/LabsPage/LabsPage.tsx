import { Stack } from "@mantine/core";
import DecksTableSkeleton from "./DecksTableSkeleton";
import DecksTable from "./DecksTable";
import { DeckModal } from "./ViewDeckModal";
import { useState } from "react";

export const decks = [
    {
        id: "0",
        name: "The Beatles",
        song_count: 12,
        status: "public",
        created_at: "2024-01-01",
        cover_url: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
        tags: [
            { id: "1", name: "Rock" },
            { id: "2", name: "Classic" },
            { id: "3", name: "60s" },
        ],
        description: "Die größten Hits der Fab Four aus Liverpool",
        owner: {
            display_name: "Admin",
            avatar_url: "https://i.pravatar.cc/150?u=admin",
        },
    },
    {
        id: "1",
        name: "80s Classics",
        song_count: 8,
        status: "public",
        created_at: "2023-06-15",
        cover_url: "https://i.pravatar.cc/150?u=80s",
        tags: [
            { id: "4", name: "Pop" },
            { id: "5", name: "80s" },
            { id: "6", name: "Retro" },
        ],
        description: "Die besten Hits aus den 80er Jahren",
        owner: {
            display_name: "DJ Retro",
            avatar_url: "https://i.pravatar.cc/150?u=djretro",
        },
    },
    {
        id: "2",
        name: "Chill Vibes",
        song_count: 24,
        status: "private",
        created_at: "2022-11-03",
        cover_url: "https://i.pravatar.cc/150?u=chill",
        tags: [
            { id: "7", name: "Chill" },
            { id: "8", name: "Relax" },
            { id: "9", name: "Ambient" },
        ],
        description: "Entspannte Melodien für ruhige Momente",
        owner: {
            display_name: "Zen Master",
            avatar_url: "https://i.pravatar.cc/150?u=zenmaster",
        },
    },
    {
        id: "3",
        name: "Roadtrip Mix",
        song_count: 30,
        status: "public",
        created_at: "2024-02-10",
        cover_url: "https://i.pravatar.cc/150?u=roadtrip",
        tags: [
            { id: "1", name: "Rock" },
            { id: "4", name: "Pop" },
            { id: "10", name: "Travel" },
        ],
        description: "Perfekte Songs für lange Autofahrten",
        owner: {
            display_name: "Travel Mike",
            avatar_url: "https://i.pravatar.cc/150?u=travelmike",
        },
    },
    {
        id: "4",
        name: "Indie Essentials",
        song_count: 16,
        status: "private",
        created_at: "2021-08-21",
        cover_url: "https://i.pravatar.cc/150?u=indie",
        tags: [
            { id: "11", name: "Indie" },
            { id: "12", name: "Alternative" },
            { id: "13", name: "Modern" },
        ],
        description: "Die besten unabhängigen Künstler",
        owner: {
            display_name: "Indie Soul",
            avatar_url: "https://i.pravatar.cc/150?u=indiesoul",
        },
    },
    {
        id: "5",
        name: "Party Bangers",
        song_count: 40,
        status: "public",
        created_at: "2023-12-31",
        cover_url: "https://i.pravatar.cc/150?u=party",
        tags: [
            { id: "4", name: "Pop" },
            { id: "14", name: "Party" },
            { id: "15", name: "Dance" },
        ],
        description: "Hits für jede Party und Feier",
        owner: {
            display_name: "Party King",
            avatar_url: "https://i.pravatar.cc/150?u=partyking",
        },
    },
    {
        id: "6",
        name: "Acoustic Mornings",
        song_count: 14,
        status: "private",
        created_at: "2020-04-05",
        cover_url: "https://i.pravatar.cc/150?u=acoustic",
        tags: [
            { id: "16", name: "Acoustic" },
            { id: "7", name: "Chill" },
            { id: "17", name: "Folk" },
        ],
        description: "Sanfte akustische Songs für den Morgen",
        owner: {
            display_name: "Acoustic Anna",
            avatar_url: "https://i.pravatar.cc/150?u=acousticanna",
        },
    },
    {
        id: "7",
        name: "Summer Hits",
        song_count: 22,
        status: "public",
        created_at: "2022-07-01",
        cover_url: "https://i.pravatar.cc/150?u=summer",
        tags: [
            { id: "4", name: "Pop" },
            { id: "18", name: "Summer" },
            { id: "19", name: "Feel Good" },
        ],
        description: "Sonnige Hits für heiße Tage",
        owner: {
            display_name: "Sunny Sam",
            avatar_url: "https://i.pravatar.cc/150?u=sunnysam",
        },
    },
    {
        id: "8",
        name: "Late Night Jazz",
        song_count: 18,
        status: "private",
        created_at: "2021-10-11",
        cover_url: "https://i.pravatar.cc/150?u=late-night",
        tags: [
            { id: "20", name: "Jazz" },
            { id: "21", name: "Smooth" },
            { id: "22", name: "Night" },
        ],
        description: "Smooth Jazz für späte Abende",
        owner: {
            display_name: "Jazz Lover",
            avatar_url: "https://i.pravatar.cc/150?u=jazzlover",
        },
    },
    {
        id: "9",
        name: "Workout Mix",
        song_count: 28,
        status: "public",
        created_at: "2023-03-20",
        cover_url: "https://i.pravatar.cc/150?u=workout",
        tags: [
            { id: "23", name: "Workout" },
            { id: "24", name: "Energetic" },
            { id: "25", name: "Motivational" },
        ],
        description: "Motivierende Beats fürs Training",
        owner: {
            display_name: "Fit Frank",
            avatar_url: "https://i.pravatar.cc/150?u=fitfrank",
        },
    },
    {
        id: "10",
        name: "Classical Focus",
        song_count: 40,
        status: "private",
        created_at: "2020-05-08",
        cover_url: "https://i.pravatar.cc/150?u=classical",
        tags: [
            { id: "26", name: "Classical" },
            { id: "27", name: "Focus" },
            { id: "28", name: "Study" },
        ],
        description: "Klassische Musik für konzentriertes Arbeiten",
        owner: {
            display_name: "Classical Chris",
            avatar_url: "https://i.pravatar.cc/150?u=classicalchris",
        },
    },
    {
        id: "11",
        name: "Electronic Beats",
        song_count: 33,
        status: "public",
        created_at: "2022-12-12",
        cover_url: "https://i.pravatar.cc/150?u=electro",
        tags: [
            { id: "29", name: "Electronic" },
            { id: "30", name: "EDM" },
            { id: "15", name: "Dance" },
        ],
        description: "Elektronische Musik für die Tanzfläche",
        owner: {
            display_name: "DJ Electro",
            avatar_url: "https://i.pravatar.cc/150?u=djelectro",
        },
    },
    {
        id: "12",
        name: "Hip Hop Essentials",
        song_count: 26,
        status: "public",
        created_at: "2021-09-09",
        cover_url: "https://i.pravatar.cc/150?u=hiphop",
        tags: [
            { id: "31", name: "Hip Hop" },
            { id: "32", name: "Rap" },
            { id: "33", name: "Urban" },
        ],
        description: "Die wichtigsten Hip Hop Tracks",
        owner: {
            display_name: "MC Flow",
            avatar_url: "https://i.pravatar.cc/150?u=mcflow",
        },
    },
    {
        id: "13",
        name: "Reggae Roots",
        song_count: 14,
        status: "private",
        created_at: "2019-06-06",
        cover_url: "https://i.pravatar.cc/150?u=reggae",
        tags: [
            { id: "34", name: "Reggae" },
            { id: "35", name: "Roots" },
            { id: "8", name: "Relax" },
        ],
        description: "Authentische Reggae-Klänge",
        owner: {
            display_name: "Rasta Rob",
            avatar_url: "https://i.pravatar.cc/150?u=rastarob",
        },
    },
    {
        id: "14",
        name: "Latin Grooves",
        song_count: 20,
        status: "public",
        created_at: "2020-02-14",
        cover_url: "https://i.pravatar.cc/150?u=latin",
        tags: [
            { id: "36", name: "Latin" },
            { id: "37", name: "Salsa" },
            { id: "15", name: "Dance" },
        ],
        description: "Heiße Latin-Rhythmen zum Tanzen",
        owner: {
            display_name: "Latin Luis",
            avatar_url: "https://i.pravatar.cc/150?u=latinluis",
        },
    },
    {
        id: "15",
        name: "Piano Chill",
        song_count: 11,
        status: "private",
        created_at: "2021-01-19",
        cover_url: "https://i.pravatar.cc/150?u=piano",
        tags: [
            { id: "38", name: "Piano" },
            { id: "7", name: "Chill" },
            { id: "39", name: "Instrumental" },
        ],
        description: "Beruhigende Klaviermelodien",
        owner: {
            display_name: "Piano Pete",
            avatar_url: "https://i.pravatar.cc/150?u=pianopete",
        },
    },
    {
        id: "16",
        name: "Golden Oldies",
        song_count: 36,
        status: "public",
        created_at: "2018-04-22",
        cover_url: "https://i.pravatar.cc/150?u=oldies",
        tags: [
            { id: "2", name: "Classic" },
            { id: "6", name: "Retro" },
            { id: "40", name: "Vintage" },
        ],
        description: "Zeitlose Klassiker aus vergangenen Dekaden",
        owner: {
            display_name: "Vintage Vera",
            avatar_url: "https://i.pravatar.cc/150?u=vintagevera",
        },
    },
    {
        id: "17",
        name: "Movie Scores",
        song_count: 19,
        status: "private",
        created_at: "2022-10-30",
        cover_url: "https://i.pravatar.cc/150?u=movies",
        tags: [
            { id: "41", name: "Soundtrack" },
            { id: "42", name: "Cinematic" },
            { id: "39", name: "Instrumental" },
        ],
        description: "Epische Filmmusik für dramatische Momente",
        owner: {
            display_name: "Cinema Carl",
            avatar_url: "https://i.pravatar.cc/150?u=cinemacarl",
        },
    },
    {
        id: "18",
        name: "Synthwave",
        song_count: 13,
        status: "public",
        created_at: "2021-07-07",
        cover_url: "https://i.pravatar.cc/150?u=synthwave",
        tags: [
            { id: "43", name: "Synthwave" },
            { id: "29", name: "Electronic" },
            { id: "6", name: "Retro" },
        ],
        description: "Retro-futuristischer Synthwave-Sound",
        owner: {
            display_name: "Synth Sarah",
            avatar_url: "https://i.pravatar.cc/150?u=synthsarah",
        },
    },
    {
        id: "19",
        name: "Lofi Study",
        song_count: 42,
        status: "public",
        created_at: "2023-05-05",
        cover_url: "https://i.pravatar.cc/150?u=lofi",
        tags: [
            { id: "44", name: "Lofi" },
            { id: "28", name: "Study" },
            { id: "7", name: "Chill" },
        ],
        description: "Entspannte Lofi-Beats zum Lernen und Arbeiten",
        owner: {
            display_name: "Lofi Leo",
            avatar_url: "https://i.pravatar.cc/150?u=lofileo",
        },
    },
] as DECK[];

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

export default function LabsPage() {
    const isLoading = false;

    const [selectedDeck, setSelectedDeck] = useState<DECK | null>(null);
    const [isDeckModalOpen, setIsDeckModalOpen] = useState(false);

    const ViewDeckModal = () => {
        return (
            <div>
                <DeckModal
                    isOpen={isDeckModalOpen}
                    onOpenChange={setIsDeckModalOpen}
                    Deck={selectedDeck}
                />
            </div>
        );
    };

    const viewDeck = (deck: DECK) => {
        console.log("Viewing deck:", deck);
        setSelectedDeck(deck);
        setIsDeckModalOpen(true);
    };

    const downloadDeck = (deck: DECK) => {
        console.log("Downloading deck:", deck);
    };

    const editDeck = (deck: DECK) => {
        console.log("Editing deck:", deck);
    };

    const createDeck = () => {
        console.log("Creating new deck");
    };

    const deleteDeck = (deck: DECK) => {
        console.log("Deleting deck:", deck);
    };

    return (
        <div className="labs-page">
            <ViewDeckModal />
            <Stack mt={"lg"} p={"xl"}>
                {isLoading ? (
                    <DecksTableSkeleton />
                ) : (
                    <DecksTable
                        decks={decks}
                        viewDeck={viewDeck}
                        downloadDeck={downloadDeck}
                        editDeck={editDeck}
                        deleteDeck={deleteDeck}
                    />
                )}
            </Stack>
        </div>
    );
}
