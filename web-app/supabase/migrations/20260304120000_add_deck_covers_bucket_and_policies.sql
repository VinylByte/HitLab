-- Ensure bucket exists in all environments
insert into storage.buckets (id, name, public)
values ('deck-covers', 'deck-covers', true)
on conflict (id) do update
set public = excluded.public;

drop policy if exists "deck_covers_public_read" on storage.objects;
drop policy if exists "deck_covers_auth_insert_own_folder" on storage.objects;
drop policy if exists "deck_covers_auth_update_own_folder" on storage.objects;
drop policy if exists "deck_covers_auth_delete_own_folder" on storage.objects;

-- Allow everyone to read files from the public deck-covers bucket
create policy "deck_covers_public_read"
on storage.objects
for select
using (bucket_id = 'deck-covers');

-- Allow authenticated users to upload only into their own folder: <uid>/<filename>
create policy "deck_covers_auth_insert_own_folder"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'deck-covers'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update only their own files
create policy "deck_covers_auth_update_own_folder"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'deck-covers'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'deck-covers'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete only their own files
create policy "deck_covers_auth_delete_own_folder"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'deck-covers'
  and (storage.foldername(name))[1] = auth.uid()::text
);
