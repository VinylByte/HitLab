import { lazy, Suspense } from "react";
import { Loader } from "@/components/elements/PageLoader";
import { routes, routePatterns } from "@/lib/routes";

const HomePage = lazy(() => import("@/components/pages/HomePage/HomePage"));
const PublicDecksPageWrapper = lazy(
    () => import("@/components/pages/PublicDecksPage/PublicDecksPage")
);
const LabsPage = lazy(() => import("@/components/pages/LabsPage/LabsPage"));
const CreateDeckPage = lazy(
    () => import("@/components/pages/LabsPage/EditAndCreatePage/CreateDeckPage")
);
const EditDeckPage = lazy(
    () => import("@/components/pages/LabsPage/EditAndCreatePage/EditDeckPage")
);
const EditSongsPage = lazy(
    () => import("@/components/pages/LabsPage/EditAndCreatePage/EditSongsPage/EditSongsPage")
);
const GeneralPlayPage = lazy(() => import("@/components/pages/PlayPage/GeneralPlayPage"));

export const Pages = [
    {
        name: "Home",
        to: routes.home,
        location: "header",
        page: (
            <Suspense fallback={<Loader />}>
                <HomePage />
            </Suspense>
        ),
    },
    {
        name: "Decks",
        to: routes.decks,
        location: "header",
        page: (
            <Suspense fallback={<Loader />}>
                <PublicDecksPageWrapper />
            </Suspense>
        ),
    },
    {
        name: "DecksById",
        to: routePatterns.publicDeckView,
        location: "none",
        page: (
            <Suspense fallback={<Loader />}>
                <PublicDecksPageWrapper />
            </Suspense>
        ),
    },
    {
        name: "Spielen",
        to: routes.play,
        location: "header",
        page: (
            <Suspense fallback={<Loader />}>
                <GeneralPlayPage />
            </Suspense>
        ),
    },
];

export const ProtectedPages = [
    { name: "Profile", to: routes.profile, location: "avatar", page: <div>Profile</div> },
    {
        name: "Lab",
        to: routes.lab,
        location: "header",
        page: (
            <Suspense fallback={<Loader />}>
                <LabsPage />
            </Suspense>
        ),
    },
    {
        name: "LabDeckView",
        to: routePatterns.labDeckView,
        location: "none",
        page: (
            <Suspense fallback={<Loader />}>
                <LabsPage />
            </Suspense>
        ),
    },
    {
        name: "Create Deck",
        to: routes.createDeck,
        location: "none",
        page: (
            <Suspense fallback={<Loader />}>
                <CreateDeckPage />
            </Suspense>
        ),
    },
    {
        name: "Edit Deck",
        to: routePatterns.deckEdit,
        location: "none",
        page: (
            <Suspense fallback={<Loader />}>
                <EditDeckPage />
            </Suspense>
        ),
    },
    {
        name: "Edit Songs",
        to: routePatterns.deckSongs,
        location: "none",
        page: (
            <Suspense fallback={<Loader />}>
                <EditSongsPage />
            </Suspense>
        ),
    },
];
