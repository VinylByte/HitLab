# Plan: HitLab Web-App Refactoring

## TL;DR

Schrittweise Migration von `src/` nach `newSrc/` mit verbesserter Ordnerstruktur, zentralisierten TypeScript-Types (abgeleitet via Utility Types von den auto-generierten Supabase-Types), klarer Aufgabentrennung und Einführung von Quality-Tooling (Prettier, ESLint-Projektconfig, Husky + lint-staged, Knip). Am Ende ersetzt `newSrc/` das alte `src/`.

---

## Zielstruktur newSrc/

```
newSrc/
├── app/
│   ├── App.tsx                    -- Routing + Layout-Shell
│   ├── main.tsx                   -- Entry-Point (Provider-Setup)
│   ├── routes.ts                  -- Route-Definitionen (aus Settings.tsx extrahiert)
│   └── ProtectedRoute.tsx         -- Auth-Guard-Wrapper
│
├── assets/
│   └── ...                        -- Statische Assets (Bilder, Fonts)
│
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Layout.tsx             -- Outlet-Wrapper (Header + Footer)
│   ├── pages/
│   │   ├── home/
│   │   │   ├── HomePage.tsx
│   │   │   ├── HeroHeader.tsx
│   │   │   └── FaqPart.tsx
│   │   ├── login/
│   │   │   └── LoginPage.tsx
│   │   ├── public-decks/
│   │   │   ├── PublicDecksPage.tsx
│   │   │   ├── DeckCard.tsx
│   │   │   └── SearchBar.tsx
│   │   ├── lab/
│   │   │   ├── LabsPage.tsx
│   │   │   ├── DecksTable.tsx
│   │   │   ├── ConfirmDeleteModal.tsx
│   │   │   └── ViewDeckModal.tsx
│   │   ├── deck-editor/
│   │   │   ├── CreateDeckPage.tsx
│   │   │   ├── EditDeckPage.tsx
│   │   │   ├── EditSongsPage.tsx
│   │   │   ├── SongTable.tsx
│   │   │   └── Dropzone.tsx
│   │   ├── play/
│   │   │   ├── GeneralPlayPage.tsx
│   │   │   ├── authorised/
│   │   │   │   ├── AuthorisedPlayPage.tsx
│   │   │   │   ├── Player/
│   │   │   │   └── QRScanner/
│   │   │   └── unauthorised/
│   │   │       ├── UnauthorisedPlayPage.tsx
│   │   │       └── PlayHero/
│   │   └── error/
│   │       ├── NotFoundPage.tsx
│   │       └── Illustration.tsx
│   └── shared/                    -- Wiederverwendbare UI-Bausteine
│       └── (z.B. ErrorBoundary, LoadingSpinner)
│
├── features/
│   └── pdf/                       -- PDF-Modul (aus web-app/PDF/ migriert)
│       ├── DesignResolver.ts
│       ├── HardDesigns.tsx
│       ├── DownloadModal.tsx
│       ├── types.ts               -- PDF-spezifische Types (Card, BackgroundConfig, PDFType, BindingMode)
│       ├── creator/
│       │   ├── PDFFactory.tsx
│       │   ├── OneSidePDF.tsx
│       │   └── DoubleSidePDF.tsx
│       ├── template/
│       │   ├── BackgroundConfig.ts
│       │   ├── PageComponents.tsx
│       │   └── Templates.tsx
│       └── qr/
│           └── qr-generator.tsx
│
├── hooks/
│   ├── useSession.ts
│   ├── useTheme.ts                -- Einziger Theme-Hook (useAppTheme + useTheme zusammengeführt)
│   ├── useOwnDecks.ts
│   ├── usePublicDecks.ts
│   ├── useDeckSongs.ts
│   └── useSongSearch.ts
│
├── lib/
│   ├── supabaseClient.ts          -- Supabase Client Init (aus supabase.ts)
│   ├── constants.ts               -- ALLE Magic Strings/Numbers zentralisiert
│   ├── formatters.ts              -- Datum-Formatierung, Daten-Transformation
│   └── heroTheme.ts               -- HeroUI Theme Config (aus hero.ts)
│
├── services/
│   ├── deckService.ts             -- Deck-Queries (fetchPublicDecks, fetchOwnDecks, etc.)
│   ├── deckMutationService.ts     -- Deck-Mutations (create, update, delete)
│   ├── spotifyClient.ts           -- Spotify API Wrapper
│   └── spotifyErrorMapper.ts      -- Spotify Error Mapping
│
├── types/
│   ├── database.types.ts          -- Auto-generiert (unverändert, read-only)
│   ├── index.ts                   -- Barrel-Export aller Types
│   ├── deck.ts                    -- Deck-Domain-Types, abgeleitet von DB-Types
│   ├── song.ts                    -- Song-Domain-Types
│   ├── spotify.ts                 -- Spotify-spezifische Types (SpotifyTrack, SpotifyDevice, Error-Codes)
│   ├── profile.ts                 -- Profile/Owner-Types
│   └── common.ts                  -- PaginationState, AsyncState<T>, AppError
│
├── index.css
└── styles/
    └── *.module.css               -- CSS-Module (aus verstreuten Locations gesammelt)
```

---

## Phasen

### Phase 1: Tooling & Konfiguration (keine Code-Migration)

**Ziel:** Projekt-weite Quality-Tools einrichten, bevor Code bewegt wird. So wird jeder migrierte Code sofort gegen die neuen Standards geprüft.

1. **Prettier einrichten** — `.prettierrc` + `.prettierignore` erstellen. Format-Script in package.json (`"format": "prettier --write ."`). Konfiguration: singleQuote, trailingComma, printWidth 100, semi.
2. **ESLint-Config aktualisieren** — Bestehende `eslint.config.js` erweitern: `newSrc/` in includes aufnehmen, Prettier-Kompatibilität via `eslint-config-prettier`, strikte TypeScript-Regeln aktivieren (`@typescript-eslint/no-explicit-any`, `@typescript-eslint/consistent-type-imports`).
3. **Husky + lint-staged** — `npx husky init`, lint-staged Config in package.json: Prettier + ESLint auf staged Files.
4. **Knip einrichten** — `knip.json` Config erstellen, Script in package.json (`"knip": "knip"`). Hilft bei Erkennung ungenutzter Exports/Dependencies während der Migration.
5. **tsconfig.app.json** — `include` Array um `newSrc/` erweitern. Path-Alias `@/*` auf `newSrc/*` setzen (Vite resolve.alias synchron konfigurieren).
6. **tailwind.config.js** — Content-Pfade um `./newSrc/**/*.{ts,tsx}` erweitern.

**Relevante Dateien:**
- `web-app/eslint.config.js`
- `web-app/tsconfig.app.json`
- `web-app/vite.config.ts`
- `web-app/tailwind.config.js`
- `web-app/package.json`

**Verifikation:** `npx prettier --check .`, `npx eslint .`, `npx knip` laufen fehlerfrei durch.

---

### Phase 2: Types zentralisieren

**Ziel:** Globale Domain-Types in `newSrc/types/` aufbauen, abgeleitet von `database.types.ts` via TypeScript Utility Types. Keine Duplikation.

1. **`database.types.ts` kopieren** nach `newSrc/types/database.types.ts` (read-only, auto-generiert).
2. **`common.ts` erstellen** — Generische typen:
   - `AsyncState<T>` (loading, data, error) — Basis für alle Hooks
   - `PaginationState` (page, pageSize, total)
   - `AppError` (message, code, original?)
3. **`deck.ts` erstellen** — Deck-Types abgeleitet von DB-Types:
   - `type DeckRow = Tables<'decks'>` (re-export)
   - `type DeckInsert = TablesInsert<'decks'>` 
   - `type PublicDeck = Pick<DeckRow, 'id' | 'name' | 'description' | 'cover_url' | 'created_at'> & { owner: DeckOwner; tags: DeckTag[] }`
   - `type OwnDeck = PublicDeck & { song_count: number; visibility: DeckRow['visibility'] }`
   - `type UpdateDeckInfo = Pick<DeckRow, 'name' | 'description'> & { deckId: string; private: boolean }`
   - `type MetaDeckInput = { name: string; description: string; private: boolean; cover: Blob }`
4. **`song.ts` erstellen** — Song-Types:
   - `type SongRow = Tables<'songs'>`
   - `type Song = Pick<SongRow, 'id' | 'spotify_track_id' | 'title' | 'artist' | 'album' | 'year' | 'thumbnail_url'>`
   - `type DeckSong = { id: string; deck_id: string; song: Song; card_note: string | null; created_at: Date }`
5. **`profile.ts` erstellen**:
   - `type ProfileRow = Tables<'profiles'>`
   - `type DeckOwner = Pick<ProfileRow, 'display_name' | 'avatar_url'>`
   - `type DeckTag = Pick<Tables<'tags'>, 'id' | 'name'>`
6. **`spotify.ts` erstellen** — Spotify-spezifische Types:
   - `SpotifyTrack`, `SpotifyDevice`, `SpotifyApiErrorCode`, `SpotifyApiError` (verschoben aus spotifyClient.ts + spotifyErrorMapper.ts)
7. **`index.ts` erstellen** — Barrel re-exports für alle Type-Module.

**Strategie:** `Pick`, `Omit`, `Partial`, `Required` und Intersection-Types nutzen, um DTOs aus DB-Row-Types abzuleiten. Inline-Types in Services/Components werden durch Imports aus `types/` ersetzt.

**Verifikation:** `tsc --noEmit` kompiliert fehlerfrei. Knip meldet keine ungenutzten Type-Exports.

---

### Phase 3: Lib & Services migrieren

**Ziel:** Utility-Funktionen und Services nach newSrc/ verschieben, zentralisierte Types verwenden, Magic-Strings eliminieren.

1. **`lib/constants.ts`** — Alle konstanten Werte zentralisieren:
   - Supabase Bucket-Namen (`DECK_COVERS_BUCKET = "deck-covers"`)
   - Spotify Scopes (`SPOTIFY_SCOPES`)
   - Breakpoints (`MOBILE_BREAKPOINT`, `PAGINATION_BREAKPOINT`)
   - Social-Links (`SOCIALS` Array, ohne JSX-Icons — Icons inline in Footer-Komponente)
2. **`lib/supabaseClient.ts`** — Supabase-Client-Init verschieben (aus `src/supabase.ts`). Import-Pfad: `@/types/database.types`.
3. **`lib/formatters.ts`** — Gemeinsame Formatierungsfunktionen extrahieren:
   - `formatDate(dateStr: string): string` — Aktuell in deckService.ts dupliziert pro fetch-Funktion
   - `toLocaleDateString()` Wrapper mit konsistentem Locale
4. **`lib/heroTheme.ts`** — `hero.ts` verschieben.
5. **`services/deckService.ts`** — Migrieren, DTOs durch Types aus `@/types/deck` ersetzen. Inline-Interfaces entfernen. `formatDate` aus `@/lib/formatters` importieren.
6. **`services/deckMutationService.ts`** — `createDeckService.ts` umbenennen + migrieren. Zusätzlich `updateDeckInfo`, `removeDeckSongs`, `setDeckTags`, `updateDeckCover`, `deleteDeckById` aus deckService.ts hierhin verschieben (Queries vs. Mutations trennen).
7. **`services/spotifyClient.ts`** — Migrieren, interne Types durch Imports aus `@/types/spotify` ersetzen. Interne API-Response-Types bleiben lokal (da nur intern genutzt).
8. **`services/spotifyErrorMapper.ts`** — Migrieren, `SpotifyApiErrorCode` kommt aus `@/types/spotify`.

**Verifikation:** Alle Services importieren Types aus `@/types/`, keine inline Interface-Definitionen für globale DTOs.

---

### Phase 4: Hooks migrieren

**Ziel:** Hooks deduplizieren und mit zentralisierten Types typisieren.

1. **`useTheme.ts`** — `useAppTheme.ts` und `useTheme.ts` zusammenführen zu einem Hook. Einheitlicher localStorage-Key `'app-theme'`.
2. **`useSession.ts`** — Migrieren, Supabase-Client Import umstellen auf `@/lib/supabaseClient`.
3. **`useOwnDecks.ts`** — Migrieren, `OwnDeck` Type aus `@/types/deck` importieren. AsyncState Pattern beibehalten (useReducer).
4. **`usePublicDecks.ts`** — Migrieren, analog.
5. **`useDeckSongs.ts`** — Migrieren, `DeckSong` Type aus `@/types/song`.
6. **`useSongSearch.ts`** — Migrieren, Debounce-Timing als Konstante aus `@/lib/constants` (`SEARCH_DEBOUNCE_MS = 350`).
7. **Optional: Generischen `useAsyncReducer<T>` Helper extrahieren** — Falls das Reducer-Pattern (fetch/success/error) in 4+ Hooks identisch ist, in `hooks/useAsyncReducer.ts` abstrahieren.

**Verifikation:** Keine doppelten Hooks. Alle Hooks importieren Types aus `@/types/`.

---

### Phase 5: Components migrieren

**Ziel:** Komponenten nach Feature/Page gruppieren, Routing-Config extrahieren.

1. **`app/routes.ts`** — Route-Definitionen aus Settings.tsx extrahieren. Konstanten (`Pages`, `ProtectedPages`) als reine Daten-Objekte (ohne JSX), Page-Components lazy importieren.
2. **`app/App.tsx`** — Migrieren, Route-Config aus `@/app/routes` importieren.
3. **`app/main.tsx`** — Migrieren, Provider-Setup beibehalten.
4. **`app/ProtectedRoute.tsx`** — Aus App.tsx extrahieren (falls inline) oder verschieben.
5. **`components/layout/`** — Header, Footer, Layout-Wrapper verschieben. CSS-Module neben Komponenten legen.
6. **`components/pages/`** — Jede Page bekommt eigenen Ordner. Alle zugehörigen Sub-Komponenten, Modals, CSS-Module liegen im gleichen Ordner.
7. **`components/shared/`** — Falls gemeinsam genutzte Komponenten existieren (z.B. ErrorBoundary, Loader-Wrapper), hier ablegen.
8. **CSS-Module** — Neben die jeweilige Komponente verschieben (Co-Location statt separater CSS-Ordner). `FaqSimple.module.css` -> neben `FaqPart.tsx`, `HeroBullets.module.css` -> neben `HeroHeader.tsx`.

**Verifikation:** Jede Page-Ordner enthält alle zugehörigen Dateien. Keine verwaisten CSS-Module.

---

### Phase 6: PDF-Modul integrieren

**Ziel:** `web-app/PDF/` nach `newSrc/features/pdf/` verschieben.

1. `PDF/interfaces.ts` -> `features/pdf/types.ts` (eigene Types, da PDF-Modul selbstständig ist)
2. Alle Dateien 1:1 verschieben, Import-Pfade anpassen
3. `DownloadModal.tsx` nutzt ggf. `Song` Type aus `@/types/song` — dort Bridge-Import einrichten
4. QR-Modul und Design-Dateien mitverschieben
5. `public/PDFDesigns/` Assets bleiben in `public/`

**Verifikation:** PDF-Export funktioniert wie zuvor (manueller Test: Deck öffnen, PDF generieren).

---

### Phase 7: Config finalisieren & Cleanup

**Ziel:** Build-Config auf newSrc/ umstellen, altes src/ entfernen.

1. **tsconfig.app.json** — `include` auf `["newSrc"]` ändern (oder nach Umbenennung `["src"]`)
2. **Umbenennung**: `src/` -> `src-old/` (Backup), `newSrc/` -> `src/`
3. **vite.config.ts** — Path-Alias `@` -> `./src` (nach Umbenennung)
4. **tailwind.config.js** — Content-Pfade aktualisieren
5. **vercel.json** — Prüfen ob Build-Config betroffen
6. **Smoketest** — `npm run build` + lokaler Dev-Server, alle Routen durchklicken
7. **src-old/ löschen** — Erst nach erfolgreichem Build + Test

**Verifikation:**
- `npm run build` fehlerfrei
- `npm run dev` — alle Seiten erreichbar
- `npx prettier --check .` — keine Formatierungsfehler
- `npx eslint .` — keine Linting-Fehler
- `npx knip` — keine ungenutzten Exports/Dependencies
- Manuell: Login, Deck erstellen, Songs bearbeiten, PDF generieren, Spotify Playback

---

## Relevante Dateien (aktuell)

### Types & Config (zu erstellen/migrieren)
- `web-app/src/database.types.ts` — Auto-generierte DB-Types, Quelle für alle Domain-Types
- `web-app/src/supabase.ts` — Client Init -> `newSrc/lib/supabaseClient.ts`
- `web-app/src/hero.ts` — Theme Config -> `newSrc/lib/heroTheme.ts`

### Services (zu migrieren + refactoren)
- `web-app/src/services/deckService.ts` — Split in Queries + Mutations, inline DTOs entfernen
- `web-app/src/services/createDeckService.ts` — -> `deckMutationService.ts`
- `web-app/src/services/spotifyClient.ts` — Types externalisieren
- `web-app/src/services/spotifyErrorMapper.ts` — Types externalisieren

### Hooks (zu migrieren + deduplizieren)
- `web-app/src/hooks/useTheme.ts` + `useAppTheme.ts` -> Ein Hook
- `web-app/src/hooks/useSession.ts`, `useOwnDecks.ts`, `usePublicDecks.ts`, `useDeckSongs.ts`, `useSongSearch.ts` — 1:1 migrieren mit Type-Imports

### Components (zu restrukturieren)
- `web-app/src/App.tsx` — -> `newSrc/app/App.tsx`
- `web-app/src/main.tsx` — -> `newSrc/app/main.tsx`
- `web-app/src/components/pages/Settings.tsx` — -> `newSrc/app/routes.ts` (nur Daten) + Konstanten -> `lib/constants.ts`
- `web-app/src/components/pages/*` — Jeweils in eigene Page-Ordner
- `web-app/src/components/elements/*` — -> `components/layout/`

### PDF-Modul
- `web-app/PDF/*` — Gesamtes Modul -> `newSrc/features/pdf/`

### Tooling
- `web-app/eslint.config.js` — Erweitern
- `web-app/package.json` — Neue devDependencies + Scripts

---

## Decisions

- **Migration-Strategie:** newSrc/ ersetzt src/ am Ende (Umbenennung)
- **UI-Libraries:** Mantine + HeroUI bleiben parallel
- **Data-Fetching:** Custom Hooks mit useReducer bleiben (kein TanStack Query)
- **PDF-Modul:** Wird als Feature-Modul unter `newSrc/features/pdf/` integriert
- **Type-Strategie:** Alle globalen DTOs leiten sich von `Tables<>` / `TablesInsert<>` / `TablesUpdate<>` Utility-Types ab. Nur PDF-interne Types bleiben im Feature-Modul.
- **Path-Aliases:** `@/*` -> `newSrc/*` (später `src/*`) für saubere Imports

---

## Weitere Überlegungen

1. **Error Handling:** Aktuell inkonsistent (manche Services werfen raw Supabase-Errors, andere mappen). Empfehlung: Einheitlichen `AppError` Type in `types/common.ts` definieren, Service-Fehler normalisieren. Scope: Kann in Phase 3 mit erledigt oder als separates Follow-up behandelt werden.
2. **Vitest:** Wurde als Tool gewählt aber nicht priorisiert. Empfehlung: Setup in Phase 1 (Config), erste Tests für Services in Phase 3 schreiben. Kann auch als separates Follow-up nach der Migration erfolgen.
3. **Incremental Migration:** Während der Migration können `src/` und `newSrc/` parallel existieren. Komponenten können schrittweise verschoben werden, solange `tsconfig` beide Ordner inkludiert.
