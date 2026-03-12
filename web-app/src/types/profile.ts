import type { Tables } from "./database.types";

export type ProfileRow = Tables<"profiles">;

/** Owner profile summary embedded in a deck. */
export type DeckOwner = Pick<ProfileRow, "display_name" | "avatar_url">;
