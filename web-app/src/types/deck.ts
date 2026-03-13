import type { Tables } from "./database.types";
import type { DeckOwner } from "./profile";

export type DeckRow = Tables<"decks">;

/** DTO returned by fetchPublicDecks — one card in the public deck list. */
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

export type CreateDeckInfo = {
    name: string;
    description: string;
    private: boolean;
    cover: Blob;
};

/** Tag attached to a deck. */
export type DeckTag = Pick<Tables<"tags">, "id" | "name">;
