-- ============================================================
-- HitLab Seed Data
-- Safe to re-run: all inserts use ON CONFLICT DO NOTHING
-- ============================================================

-- ============================================================
-- 1. Auth users (test accounts, password: "password123")
-- ============================================================
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, confirmation_token
) values
  (
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-1111-1111-111111111111', 'authenticated', 'authenticated',
    'alice@example.com',
    crypt('password123', gen_salt('bf')),
    now(), now(), now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Alice Mueller", "avatar_url": "https://i.pravatar.cc/150?u=alice"}',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '22222222-2222-2222-2222-222222222222', 'authenticated', 'authenticated',
    'bob@example.com',
    crypt('password123', gen_salt('bf')),
    now(), now(), now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Bob Schmidt", "avatar_url": "https://i.pravatar.cc/150?u=bob"}',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '33333333-3333-3333-3333-333333333333', 'authenticated', 'authenticated',
    'clara@example.com',
    crypt('password123', gen_salt('bf')),
    now(), now(), now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Clara Fischer", "avatar_url": "https://i.pravatar.cc/150?u=clara"}',
    ''
  )
on conflict (id) do nothing;

-- Identities (required for Supabase Auth email login)
insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values
  ('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'alice@example.com', jsonb_build_object('sub', '11111111-1111-1111-1111-111111111111', 'email', 'alice@example.com'), 'email', now(), now(), now()),
  ('22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'bob@example.com',   jsonb_build_object('sub', '22222222-2222-2222-2222-222222222222', 'email', 'bob@example.com'),   'email', now(), now(), now()),
  ('33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'clara@example.com', jsonb_build_object('sub', '33333333-3333-3333-3333-333333333333', 'email', 'clara@example.com'), 'email', now(), now(), now())
on conflict (provider_id, provider) do nothing;

-- ============================================================
-- 2. Profiles
-- ============================================================
insert into public.profiles (id, display_name, avatar_url, spotify_user_id) values
  ('11111111-1111-1111-1111-111111111111', 'Alice Mueller',  'https://i.pravatar.cc/150?u=alice', 'spotify_alice_001'),
  ('22222222-2222-2222-2222-222222222222', 'Bob Schmidt',    'https://i.pravatar.cc/150?u=bob',   'spotify_bob_002'),
  ('33333333-3333-3333-3333-333333333333', 'Clara Fischer',  'https://i.pravatar.cc/150?u=clara', null)
on conflict (id) do nothing;

-- ============================================================
-- 3. Decks
-- ============================================================
insert into public.decks (id, owner_id, name, description, visibility, share_token) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', '80s Classics',       'The greatest hits of the 1980s',                                  'public',  'share_80s_classics_token'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', '90s One Hit Wonders', 'Songs everyone knows but nobody remembers who sang them',          'private', 'share_90s_wonders_token'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', '2000s Party Mix',     'Throwback party bangers from the 2000s',                          'public',  'share_2000s_party_token')
on conflict (id) do nothing;

-- ============================================================
-- 4. Deck collaborators
-- ============================================================
insert into public.deck_collaborators (deck_id, user_id, role) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'editor'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 'viewer'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'editor'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', 'viewer')
on conflict (deck_id, user_id) do nothing;

-- ============================================================
-- 5. Songs (real Spotify track IDs and metadata)
-- ============================================================
insert into public.songs (id, spotify_track_id, title, artist, album, year, thumbnail_url, duration_ms) values
  ('dd000001-0000-0000-0000-000000000001', '4uLU6hMCjMI75M1A2tKUQC', 'Never Gonna Give You Up',     'Rick Astley',    'Whenever You Need Somebody', 1987, 'https://i.scdn.co/image/ab67616d00001e02ccb4e8b355ab38a7de886e8a', 213573),
  ('dd000002-0000-0000-0000-000000000002', '7GhIk7Il098yCjg4BQjzvb', 'Together Forever',            'Rick Astley',    'Whenever You Need Somebody', 1987, 'https://i.scdn.co/image/ab67616d00001e02ccb4e8b355ab38a7de886e8a', 205800),
  ('dd000003-0000-0000-0000-000000000003', '2374M0fQpWi3dLnB54qaLX', 'Africa',                      'TOTO',           'Toto IV',                    1982, 'https://i.scdn.co/image/ab67616d00001e024a052b99c08b45e04e5d2846', 295893),
  ('dd000004-0000-0000-0000-000000000004', '3gdewACMIVMEWVbyb8O9sY', 'Bitter Sweet Symphony',       'The Verve',      'Urban Hymns',                1997, 'https://i.scdn.co/image/ab67616d00001e026a0ddc707e68b0fc4e393203', 357267),
  ('dd000005-0000-0000-0000-000000000005', '0nrRP2bk19rLc0orkWPQk2', 'Wake Me Up Before You Go-Go', 'Wham!',          'Make It Big',                1984, 'https://i.scdn.co/image/ab67616d00001e02cb77ec7dbb744efab8204288', 229773),
  ('dd000006-0000-0000-0000-000000000006', '0C80GCp0mMuBzLf3EAXqxv', 'Smells Like Teen Spirit',     'Nirvana',        'Nevermind',                  1991, 'https://i.scdn.co/image/ab67616d00001e02fbc71c99f9c1296c56dd51b6', 301920),
  ('dd000007-0000-0000-0000-000000000007', '3n3Ppam7vgaVa1iaRUc9Lp', 'Mr. Brightside',              'The Killers',    'Hot Fuss',                   2004, 'https://i.scdn.co/image/ab67616d00001e029c284e8a02aaadeb8e1200b7', 222973),
  ('dd000008-0000-0000-0000-000000000008', '60nZcImufyMA1MKQY3dcCH', 'Toxic',                       'Britney Spears', 'In the Zone',                2003, 'https://i.scdn.co/image/ab67616d00001e02bab944e53f89a226fdd955cb', 198800),
  ('dd000009-0000-0000-0000-000000000009', '5ghIJDpPoe3CfHMGu71E6T', 'Crazy in Love',               'Beyonce',        'Dangerously in Love',        2003, 'https://i.scdn.co/image/ab67616d00001e02b04e7be64b5de8aea0fbc623', 236133),
  ('dd000010-0000-0000-0000-000000000010', '1mea3bSkSGXuIRvnWJo9Id', 'Boulevard of Broken Dreams',  'Green Day',      'American Idiot',             2004, 'https://i.scdn.co/image/ab67616d00001e020e2707e6957e33e9371b5745', 262307),
  ('dd000011-0000-0000-0000-000000000011', '7ouMYWpwJ422jRcDASZB7P', 'Knights of Cydonia',          'Muse',           'Black Holes and Revelations', 2006, 'https://i.scdn.co/image/ab67616d00001e0228933b808bfb4cbad298d264', 366213),
  ('dd000012-0000-0000-0000-000000000012', '4cOdK2wGLETKBW3PvgPWqT', 'Take On Me',                  'a-ha',           'Hunting High and Low',       1985, 'https://i.scdn.co/image/ab67616d00001e02e8dd4db47e7177c63b0b7d7a', 225280)
on conflict (spotify_track_id) do nothing;

-- ============================================================
-- 6. Deck songs (assign songs to decks with positions)
-- ============================================================
-- 80s Classics
insert into public.deck_songs (id, deck_id, song_id, position, card_note) values
  ('ee000001-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'dd000001-0000-0000-0000-000000000001', 1, 'The ultimate rickroll'),
  ('ee000002-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'dd000003-0000-0000-0000-000000000003', 2, 'Bless the rains'),
  ('ee000003-0000-0000-0000-000000000003', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'dd000005-0000-0000-0000-000000000005', 3, null),
  ('ee000004-0000-0000-0000-000000000004', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'dd000012-0000-0000-0000-000000000012', 4, 'Iconic music video')
on conflict (deck_id, song_id) do nothing;

-- 90s One Hit Wonders
insert into public.deck_songs (id, deck_id, song_id, position, card_note) values
  ('ee000005-0000-0000-0000-000000000005', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'dd000004-0000-0000-0000-000000000004', 1, 'Rolling Stones sample controversy'),
  ('ee000006-0000-0000-0000-000000000006', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'dd000006-0000-0000-0000-000000000006', 2, 'Grunge anthem'),
  ('ee000007-0000-0000-0000-000000000007', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'dd000002-0000-0000-0000-000000000002', 3, null)
on conflict (deck_id, song_id) do nothing;

-- 2000s Party Mix
insert into public.deck_songs (id, deck_id, song_id, position, card_note) values
  ('ee000008-0000-0000-0000-000000000008', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'dd000007-0000-0000-0000-000000000007', 1, null),
  ('ee000009-0000-0000-0000-000000000009', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'dd000008-0000-0000-0000-000000000008', 2, 'Iconic Britney'),
  ('ee000010-0000-0000-0000-000000000010', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'dd000009-0000-0000-0000-000000000009', 3, null),
  ('ee000011-0000-0000-0000-000000000011', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'dd000010-0000-0000-0000-000000000010', 4, 'Punk rock classic'),
  ('ee000012-0000-0000-0000-000000000012', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'dd000011-0000-0000-0000-000000000011', 5, 'Epic outro')
on conflict (deck_id, song_id) do nothing;

-- ============================================================
-- 7. Tags
-- ============================================================
insert into public.tags (id, name) values
  ('ff000001-0000-0000-0000-000000000001', '80s'),
  ('ff000002-0000-0000-0000-000000000002', '90s'),
  ('ff000003-0000-0000-0000-000000000003', '2000s'),
  ('ff000004-0000-0000-0000-000000000004', 'Party'),
  ('ff000005-0000-0000-0000-000000000005', 'Rock')
on conflict (name) do nothing;

insert into public.deck_tags (deck_id, tag_id) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'ff000001-0000-0000-0000-000000000001'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'ff000002-0000-0000-0000-000000000002'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'ff000005-0000-0000-0000-000000000005'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'ff000003-0000-0000-0000-000000000003'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'ff000004-0000-0000-0000-000000000004')
on conflict (deck_id, tag_id) do nothing;

-- ============================================================
-- 8. Play tokens
-- ============================================================
insert into public.play_tokens (id, token, deck_id, deck_song_id, expires_at) values
  ('aa000001-0000-0000-0000-000000000001', 'qr_80s_africa_x7k2',    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'ee000002-0000-0000-0000-000000000002', now() + interval '90 days'),
  ('aa000002-0000-0000-0000-000000000002', 'qr_2000s_toxic_m9p4',   'cccccccc-cccc-cccc-cccc-cccccccccccc', 'ee000009-0000-0000-0000-000000000009', now() + interval '90 days'),
  ('aa000003-0000-0000-0000-000000000003', 'qr_2000s_knights_w3r1', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'ee000012-0000-0000-0000-000000000012', null)
on conflict (token) do nothing;

-- ============================================================
-- 9. Play events (sample analytics)
-- ============================================================
insert into public.play_events (play_token_id, deck_id, song_id, scanned_by, ip_address, user_agent, created_at) values
  ('aa000001-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'dd000003-0000-0000-0000-000000000003', '33333333-3333-3333-3333-333333333333', '192.168.1.10',  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',  now() - interval '5 days'),
  ('aa000001-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'dd000003-0000-0000-0000-000000000003', null,                                  '10.0.0.42',     'Mozilla/5.0 (Android 14; Mobile; rv:121.0) Gecko/121.0',  now() - interval '3 days'),
  ('aa000002-0000-0000-0000-000000000002', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'dd000008-0000-0000-0000-000000000008', '11111111-1111-1111-1111-111111111111', '172.16.0.5',    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',          now() - interval '1 day'),
  ('aa000003-0000-0000-0000-000000000003', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'dd000011-0000-0000-0000-000000000011', '22222222-2222-2222-2222-222222222222', '192.168.1.20',  'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',               now() - interval '12 hours'),
  ('aa000002-0000-0000-0000-000000000002', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'dd000008-0000-0000-0000-000000000008', null,                                  '203.0.113.50',  'Mozilla/5.0 (Linux; Android 13)',                          now() - interval '2 hours');
