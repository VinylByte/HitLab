import { IconBrandInstagram, IconBrandTwitter, IconBrandYoutube } from "@tabler/icons-react";
import PublicDecksPageWrapper from "./PublicDecksPage/PublicDecksPage";

export const Pages = [
    { name: "Home", to: "/", page: <div className="h-170">Home</div> },
    { name: "Decks", to: "/public-decks", page: <PublicDecksPageWrapper /> },
];

export const ProtectedPages = [
    { name: "Profile", to: "/profile", page: <div>Profile</div> },
    { name: "My Decks", to: "/mydecks", page: <div>My Decks</div> },
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
