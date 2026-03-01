import { IconBrandInstagram, IconBrandTwitter, IconBrandYoutube } from "@tabler/icons-react";
import HomePage from "./HomePage/HomePage";
import PublicDecksPageWrapper from "./PublicDecksPage/PublicDecksPage";

export const Pages = [
    { name: "Home", to: "/", location: "header", page: <HomePage /> },
    { name: "Decks", to: "/decks", location: "header", page: <PublicDecksPageWrapper /> },
];

export const ProtectedPages = [
    { name: "Profile", to: "/profile", location: "avatar", page: <div>Profile</div> },
    { name: "Lab", to: "/lab", location: "header", page: <div>My Decks</div> },
];

export const MOBILE_BREAKPOINT = "(max-width: 768px)";
export const PAGINATION_BREAKPOINT = 12;

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
