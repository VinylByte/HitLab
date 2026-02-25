create table public.pdf_exports (
  id            uuid primary key default gen_random_uuid(),
  deck_id       uuid not null references public.decks(id) on delete cascade,
  format        text not null default 'a4',
  storage_path  text not null,
  file_size     bigint,
  created_at    timestamptz not null default now(),
  deleted_at    timestamptz
);

create index idx_pdf_exports_deck on public.pdf_exports(deck_id);

comment on table public.pdf_exports is 'Records of generated PDF files stored in Supabase Storage.';
