import type { Tables } from "../database.types";
import type { DeckOwner } from "./profile";

export type DeckRow = Tables<"decks">;

export type PublicDeck = Pick<
    DeckRow,
    "id" | "name" | "description" | "cover_url" | "created_at"
> & {
    owner: DeckOwner;
    tags: DeckTag[];
};

export type OwnDeck = PublicDeck & {
    song_count: number;
    visibility: DeckRow["visibility"];
};

export type UpdateDeckInfo = {
    deckId: string;
    name: string;
    description: string;
    private: boolean;
};

export type CreateDeckInput = {
    name: string;
    description: string;
    private: boolean;
    cover: Blob;
};

export type DeckTag = Pick<Tables<"tags">, "id" | "name">;
