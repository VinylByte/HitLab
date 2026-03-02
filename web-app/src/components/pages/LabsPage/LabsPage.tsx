import { Stack } from "@mantine/core";
import DecksTableSkeleton from "./DecksTableSkeleton";
import DecksTable from "./DecksTable";

export const decks = [
    {
        id: 0,
        title: "The Beatles",
        song_count: 12,
        status: "public",
        created_at: "2024-01-01",
        cover_url: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
    },
    {
        id: 1,
        title: "80s Classics",
        song_count: 8,
        status: "public",
        created_at: "2023-06-15",
        cover_url: "https://i.pravatar.cc/150?u=80s",
    },
    {
        id: 2,
        title: "Chill Vibes",
        song_count: 24,
        status: "private",
        created_at: "2022-11-03",
        cover_url: "https://i.pravatar.cc/150?u=chill",
    },
    {
        id: 3,
        title: "Roadtrip Mix",
        song_count: 30,
        status: "public",
        created_at: "2024-02-10",
        cover_url: "https://i.pravatar.cc/150?u=roadtrip",
    },
    {
        id: 4,
        title: "Indie Essentials",
        song_count: 16,
        status: "private",
        created_at: "2021-08-21",
        cover_url: "https://i.pravatar.cc/150?u=indie",
    },
    {
        id: 5,
        title: "Party Bangers",
        song_count: 40,
        status: "public",
        created_at: "2023-12-31",
        cover_url: "https://i.pravatar.cc/150?u=party",
    },
    {
        id: 6,
        title: "Acoustic Mornings",
        song_count: 14,
        status: "private",
        created_at: "2020-04-05",
        cover_url: "https://i.pravatar.cc/150?u=acoustic",
    },
    {
        id: 7,
        title: "Summer Hits",
        song_count: 22,
        status: "public",
        created_at: "2022-07-01",
        cover_url: "https://i.pravatar.cc/150?u=summer",
    },
    {
        id: 8,
        title: "Late Night Jazz",
        song_count: 18,
        status: "private",
        created_at: "2021-10-11",
        cover_url: "https://i.pravatar.cc/150?u=late-night",
    },
    {
        id: 9,
        title: "Workout Mix",
        song_count: 28,
        status: "public",
        created_at: "2023-03-20",
        cover_url: "https://i.pravatar.cc/150?u=workout",
    },
    {
        id: 10,
        title: "Classical Focus",
        song_count: 40,
        status: "private",
        created_at: "2020-05-08",
        cover_url: "https://i.pravatar.cc/150?u=classical",
    },
    {
        id: 11,
        title: "Electronic Beats",
        song_count: 33,
        status: "public",
        created_at: "2022-12-12",
        cover_url: "https://i.pravatar.cc/150?u=electro",
    },
    {
        id: 12,
        title: "Hip Hop Essentials",
        song_count: 26,
        status: "public",
        created_at: "2021-09-09",
        cover_url: "https://i.pravatar.cc/150?u=hiphop",
    },
    {
        id: 13,
        title: "Reggae Roots",
        song_count: 14,
        status: "private",
        created_at: "2019-06-06",
        cover_url: "https://i.pravatar.cc/150?u=reggae",
    },
    {
        id: 14,
        title: "Latin Grooves",
        song_count: 20,
        status: "public",
        created_at: "2020-02-14",
        cover_url: "https://i.pravatar.cc/150?u=latin",
    },
    {
        id: 15,
        title: "Piano Chill",
        song_count: 11,
        status: "private",
        created_at: "2021-01-19",
        cover_url: "https://i.pravatar.cc/150?u=piano",
    },
    {
        id: 16,
        title: "Golden Oldies",
        song_count: 36,
        status: "public",
        created_at: "2018-04-22",
        cover_url: "https://i.pravatar.cc/150?u=oldies",
    },
    {
        id: 17,
        title: "Movie Scores",
        song_count: 19,
        status: "private",
        created_at: "2022-10-30",
        cover_url: "https://i.pravatar.cc/150?u=movies",
    },
    {
        id: 18,
        title: "Synthwave",
        song_count: 13,
        status: "public",
        created_at: "2021-07-07",
        cover_url: "https://i.pravatar.cc/150?u=synthwave",
    },
    {
        id: 19,
        title: "Lofi Study",
        song_count: 42,
        status: "public",
        created_at: "2023-05-05",
        cover_url: "https://i.pravatar.cc/150?u=lofi",
    },
];

interface DECK {
    id: number;
    title: string;
    song_count: number;
    status: string;
    created_at: string;
    cover_url: string;
}

export default function LabsPage() {
    const isLoading = false;

    const viewDeck = (deck: DECK) => {
        console.log("Viewing deck:", deck);
    }

    const downloadDeck = (deck: DECK) => {
        console.log("Downloading deck:", deck);
    }

    const editDeck = (deck: DECK) => {
        console.log("Editing deck:", deck);
    }

    const createDeck = () => {
        console.log("Creating new deck");
    }
    
    const deleteDeck = (deck: DECK) => {
        console.log("Deleting deck:", deck);
    }

    return (
        <div className="labs-page">
            <Stack mt={"lg"} p={"xl"}>
                {isLoading ? <DecksTableSkeleton /> : <DecksTable decks={decks} viewDeck={viewDeck} downloadDeck={downloadDeck} editDeck={editDeck} deleteDeck={deleteDeck} />}
            </Stack>
        </div>
    );
}
