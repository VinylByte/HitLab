import { IconBrandInstagram, IconBrandTwitter, IconBrandYoutube } from "@tabler/icons-react";

export const MOBILE_BREAKPOINT = "(max-width: 768px)";
export const SMALL_BREAKPOINT = "(max-width: 1350px)";
export const PAGINATION_BREAKPOINT = 12;

export const SPOTIFY_SCOPES = [
    "user-read-email",
    "user-read-private",
    "streaming",
    "user-modify-playback-state",
    "user-read-playback-state",
    "user-read-currently-playing",
    "playlist-read-private",
    "playlist-read-collaborative",
].join(" ");

export const SOCIALS = [
    {
        name: "Twitter",
        icon: IconBrandTwitter,
        url: "https://twitter.com/HitLabApp",
    },
    {
        name: "YouTube",
        icon: IconBrandYoutube,
        url: "https://www.youtube.com/@HitLabApp",
    },
    {
        name: "Instagram",
        icon: IconBrandInstagram,
        url: "https://www.instagram.com/HitLabApp/",
    },
];
