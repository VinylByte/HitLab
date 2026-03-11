import { lazy, Suspense } from "react";
import { Loader } from "../components/elements/PageLoader";

const HomePage = lazy(() => import("../components/pages/HomePage/HomePage"));
const PublicDecksPageWrapper = lazy(
    () => import("../components/pages/PublicDecksPage/PublicDecksPage")
);
const LabsPage = lazy(() => import("../components/pages/LabsPage/LabsPage"));
const CreateDeckPage = lazy(
    () => import("../components/pages/LabsPage/EditAndCreatePage/CreateDeckPage")
);
const EditDeckPage = lazy(
    () => import("../components/pages/LabsPage/EditAndCreatePage/EditDeckPage")
);
const EditSongsPage = lazy(
    () => import("../components/pages/LabsPage/EditAndCreatePage/EditSongsPage/EditSongsPage")
);
const GeneralPlayPage = lazy(() => import("../components/pages/PlayPage/GeneralPlayPage"));

export const Pages = [
    {
        name: "Home",
        to: "/",
        location: "header",
        page: (
            <Suspense fallback={<Loader />}>
                <HomePage />
            </Suspense>
        ),
    },
    {
        name: "Decks",
        to: "/decks",
        location: "header",
        page: (
            <Suspense fallback={<Loader />}>
                <PublicDecksPageWrapper />
            </Suspense>
        ),
    },
    {
        name: "DecksById",
        to: "/decks/:deckId/view",
        location: "none",
        page: (
            <Suspense fallback={<Loader />}>
                <PublicDecksPageWrapper />
            </Suspense>
        ),
    },
    {
        name: "Spielen",
        to: "/play",
        location: "header",
        page: (
            <Suspense fallback={<Loader />}>
                <GeneralPlayPage />
            </Suspense>
        ),
    },
];

export const ProtectedPages = [
    { name: "Profile", to: "/profile", location: "avatar", page: <div>Profile</div> },
    {
        name: "Lab",
        to: "/lab",
        location: "header",
        page: (
            <Suspense fallback={<Loader />}>
                <LabsPage />
            </Suspense>
        ),
    },
    {
        name: "LabDeckView",
        to: "/lab/:deckId/view",
        location: "none",
        page: (
            <Suspense fallback={<Loader />}>
                <LabsPage />
            </Suspense>
        ),
    },
    {
        name: "Create Deck",
        to: "/decks/new",
        location: "none",
        page: (
            <Suspense fallback={<Loader />}>
                <CreateDeckPage />
            </Suspense>
        ),
    },
    {
        name: "Edit Deck",
        to: "/decks/:id/edit",
        location: "none",
        page: (
            <Suspense fallback={<Loader />}>
                <EditDeckPage />
            </Suspense>
        ),
    },
    {
        name: "Edit Songs",
        to: "/decks/:id/songs",
        location: "none",
        page: (
            <Suspense fallback={<Loader />}>
                <EditSongsPage />
            </Suspense>
        ),
    },
];
