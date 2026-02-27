import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

import { HeroUIProvider } from "@heroui/react";
import { createTheme, MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";

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
