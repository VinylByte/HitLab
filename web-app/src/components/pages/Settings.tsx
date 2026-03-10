import { Suspense, lazy } from "react";
import { IconBrandInstagram, IconBrandTwitter, IconBrandYoutube } from "@tabler/icons-react";
import { Spinner } from "@heroui/react";

const HomePage = lazy(() => import("./HomePage/HomePage"));
const PublicDecksPageWrapper = lazy(() => import("./PublicDecksPage/PublicDecksPage"));
const LabsPage = lazy(() => import("./LabsPage/LabsPage"));
const CreateDeckPage = lazy(() => import("./LabsPage/EditAndCreatePage/CreateDeckPage"));
const EditDeckPage = lazy(() => import("./LabsPage/EditAndCreatePage/EditDeckPage"));
const EditSongsPage = lazy(
    () => import("./LabsPage/EditAndCreatePage/EditSongsPage/EditSongsPage")
);
const GeneralPlayPage = lazy(() => import("./PlayPage/GeneralPlayPage"));

const Loader = () => (
    <div className="flex items-center justify-center h-screen">
        <Spinner variant="wave"/>
    </div>
);

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

export const MOBILE_BREAKPOINT = "(max-width: 768px)";
export const SMALL_BREAKPOINT = "(max-width: 1350px)";
export const PAGINATION_BREAKPOINT = 12;
/**
const SPOTIFY_SCOPES = [
    "user-read-email",
    "user-read-private",
    "streaming",
    "user-modify-playback-state",
    "user-read-playback-state",
    "user-read-currently-playing",
 ].join(" ");
 */
export const SPOTIFY_SCOPES =
    "user-read-email user-read-private streaming user-modify-playback-state user-read-playback-state user-read-currently-playing";

export const SOCIALS = [
    {
        name: "Twitter",
        icon: <IconBrandTwitter size={18} stroke={1.5} />,
        url: "https://twitter.com/HitLabApp",
    },
    {
        name: "YouTube",
        icon: <IconBrandYoutube size={18} stroke={1.5} />,
        url: "https://www.youtube.com/@HitLabApp",
    },
    {
        name: "Instagram",
        icon: <IconBrandInstagram size={18} stroke={1.5} />,
        url: "https://www.instagram.com/HitLabApp/",
    },
];
