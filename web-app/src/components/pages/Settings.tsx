import { IconBrandInstagram, IconBrandTwitter, IconBrandYoutube } from "@tabler/icons-react";

export const Pages = [
    { name: "Home", to: "/", page: <div className="h-170">Home</div>},
    { name: "Decks", to: "/decks", page: <div>Other Decks</div>},
]

export const MOBILE_BREAKPOINT = "(max-width: 768px)";

export const SOCIALS = [
    {
        name: "Twitter",
        icon: <IconBrandTwitter size={18} stroke={1.5} />,
        url: "https://twitter.com/HitLabApp"
    },
    {
        name: "YouTube",
        icon: <IconBrandYoutube size={18} stroke={1.5} />,
        url: "https://www.youtube.com/@HitLabApp"
    },
    {
        name: "Instagram",
        icon: <IconBrandInstagram size={18} stroke={1.5} />,
        url: "https://www.instagram.com/HitLabApp/"
    }
]
