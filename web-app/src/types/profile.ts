import type { Tables } from "../database.types";

export type ProfileRow = Tables<"profiles">;

export type DeckOwner = Pick<ProfileRow, "display_name" | "avatar_url">;
