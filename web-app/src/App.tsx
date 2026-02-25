import { useEffect, useState } from "react";
import HeaderNav from "./components/elements/header/Header";
import { BrowserRouter, Outlet, Route, Routes } from "react-router";
import { Pages } from "./components/pages/Settings";
import LoginPage from "./components/pages/Authentication/LoginPage";
//import SignUpPage from "./components/pages/Authentication/SignUpPage";
import { useMantineColorScheme } from "@mantine/core";
import { FooterSocial } from "./components/elements/Footer/Footer";

import { PDFDownloadLink } from '@react-pdf/renderer';
import { PDFSheetDoubleSide, PDFSheetOneSide } from '../PDF/PDF-Creator/Sheet'; // Dein Dokument

type Themes = "light" | "dark";

export interface HitsterCard {
  artist: string;
  title: string;
  year: string;
  url: string;
}

export const MOCK_HITSTER_CARDS: HitsterCard[] = [
  {
    artist: "Queen",
    title: "Bohemian Rhapsody",
    year: "1975",
    url: "https://open.spotify.com/track/7tFiyTwm0ao9o7pLpYMCcc"
  },
  {
    artist: "Michael Jackson",
    title: "Billie Jean",
    year: "1982",
    url: "https://open.spotify.com/track/5vjLSvInSj99I90q9Z8pba"
  },
  {
    artist: "Nirvana",
    title: "Smells Like Teen Spirit",
    year: "1991",
    url: "https://open.spotify.com/track/1f3yAtsJvA86uNQ9p9RQar"
  },
  {
    artist: "Britney Spears",
    title: "...Baby One More Time",
    year: "1998",
    url: "https://open.spotify.com/track/3MjUtNVVq3C8A7ctvRLp9I"
  },
  {
    artist: "Eminem",
    title: "Lose Yourself",
    year: "2002",
    url: "https://open.spotify.com/track/77MKo98ZvAtL86nuNQ9p9"
  },
  {
    artist: "Adele",
    title: "Rolling in the Deep",
    year: "2010",
    url: "https://open.spotify.com/track/1CkvWZPnScl6pScl6pScl6"
  },
  {
    artist: "The Weeknd",
    title: "Blinding Lights",
    year: "2019",
    url: "https://open.spotify.com/track/0VjIj6pScl6pScl6pScl6p"
  },
  {
    artist: "Harry Styles",
    title: "As It Was",
    year: "2022",
    url: "https://open.spotify.com/track/4D7RJScl6pScl6pScl6pScl"
  },
  {
    artist: "ABBA",
    title: "Dancing Queen",
    year: "1976",
    url: "https://open.spotify.com/track/0GjEhScl6pScl6pScl6pScl"
  },
  {
    artist: "ABBA",
    title: "Dancing Queen",
    year: "1976",
    url: "https://open.spotify.com/track/0GjEhScl6pScl6pScl6pScl"
  },
  {
    artist: "ABBA",
    title: "Dancing Queen",
    year: "1976",
    url: "https://open.spotify.com/track/0GjEhScl6pScl6pScl6pScl"
  },
  {
    artist: "ABBA",
    title: "Dancing Queen",
    year: "1976",
    url: "https://open.spotify.com/track/0GjEhScl6pScl6pScl6pScl"
  },
  {
    artist: "ABBA",
    title: "Dancing Queen",
    year: "1976",
    url: "https://open.spotify.com/track/0GjEhScl6pScl6pScl6pScl"
  },
  {
    artist: "ABBA",
    title: "Dancing Queen",
    year: "1976",
    url: "https://open.spotify.com/track/0GjEhScl6pScl6pScl6pScl"
  },
  {
    artist: "ABBA",
    title: "Dancing Queen",
    year: "1976",
    url: "https://open.spotify.com/track/0GjEhScl6pScl6pScl6pScl"
  },
  {
    artist: "ABBA",
    title: "Dancing Queen",
    year: "1976",
    url: "https://open.spotify.com/track/0GjEhScl6pScl6pScl6pScl"
  },
];

const myCards = MOCK_HITSTER_CARDS; // Hier kannst du deine echten Daten einfügen

function App() {
    const [theme] = useState<Themes>("light");
    const { setColorScheme } = useMantineColorScheme();

    useEffect(() => {
        setColorScheme(theme);
    }, [theme, setColorScheme]);

    return (
        <main className={theme} style={{ height: "100%", width: "100%" }}>
            <PDFDownloadLink 
            document={<PDFSheetDoubleSide cards={myCards} />} 
            fileName="hitster-karten.pdf"
            style={{
            textDecoration: 'none',
            padding: '10px 20px',
            color: '#fff',
            backgroundColor: '#007bff',
            borderRadius: '5px',
            border: 'none'
            }}
        >
            {({ blob, url, loading, error }) =>
            loading ? 'PDF wird generiert...' : 'Karten jetzt herunterladen!'
            }
        </PDFDownloadLink>
        </main>
    );
}

function Layout() {
    return (
        <div>
            <HeaderNav />
            {/* Hier wird die jeweilige Seite "hineingeladen" */}
            <div>
                <Outlet />
            </div>
            <FooterSocial />
        </div>
    );
}

function Router() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<Layout />}>
                    {Pages.map(page => (
                        <Route
                            key={page.to}
                            path={page.to}
                            element={page.page}
                        />
                    ))}
                </Route>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<LoginPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
