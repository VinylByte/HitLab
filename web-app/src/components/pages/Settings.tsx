import { IconBrandInstagram, IconBrandTwitter, IconBrandYoutube } from "@tabler/icons-react";
import HomePage from "./HomePage/HomePage";
import PublicDecksPageWrapper from "./PublicDecksPage/PublicDecksPage";
import LabsPage from "./LabsPage/LabsPage";
import CreateDeckPage from "./LabsPage/EditAndCreatePage/CreateDeckPage";
import EditDeckPage from "./LabsPage/EditAndCreatePage/EditDeckPage";
import EditSongsPage from "./LabsPage/EditAndCreatePage/EditSongsPage/EditSongsPage";

export const Pages = [
    { name: "Home", to: "/", location: "header", page: <HomePage /> },
    { name: "Decks", to: "/decks", location: "header", page: <PublicDecksPageWrapper /> },
];

export const ProtectedPages = [
    { name: "Profile", to: "/profile", location: "avatar", page: <div>Profile</div> },
    { name: "Lab", to: "/lab", location: "header", page: <LabsPage /> },
    { name: "Create Deck", to: "/decks/new", location: "none", page: <CreateDeckPage /> },
    { name: "Edit Deck", to: "/decks/:id/edit", location: "none", page: <EditDeckPage /> },
    { name: "Edit Songs", to: "/decks/:id/songs", location: "none", page: <EditSongsPage /> },
];

export const MOBILE_BREAKPOINT = "(max-width: 768px)";
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
