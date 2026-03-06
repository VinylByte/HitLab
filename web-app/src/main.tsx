import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

import { HeroUIProvider } from "@heroui/react";
import { createTheme, MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
// ‼️ import dropzone styles after core package styles
import "@mantine/dropzone/styles.css";

const RUNTIME_MARKER = "hitlab-runtime-2026-03-06-spotify-debug-v2";

console.warn("[hitlab] app-start", {
    marker: RUNTIME_MARKER,
    mode: import.meta.env.MODE,
    origin: window.location.origin,
    href: window.location.href,
    hasSpotifyClientId: Boolean(import.meta.env.VITE_SPOTIFY_CLIENT_ID),
});
(window as Window & { __HITLAB_RUNTIME_MARKER__?: string }).__HITLAB_RUNTIME_MARKER__ =
    RUNTIME_MARKER;

// Mantine theme configuration
const mantineTheme = createTheme({});

// Initialize theme (default: light)
document.documentElement.classList.remove("dark");

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <HeroUIProvider>
            <MantineProvider theme={mantineTheme} defaultColorScheme="light">
                <App />
            </MantineProvider>
        </HeroUIProvider>
    </StrictMode>
);
