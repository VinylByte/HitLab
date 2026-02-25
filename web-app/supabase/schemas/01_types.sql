-- Custom enum types

create type public.deck_visibility as enum ('private', 'public');

create type public.collaborator_role as enum ('owner', 'editor', 'viewer');
