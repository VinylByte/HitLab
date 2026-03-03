import { Alert, Button, Image } from "@heroui/react";
import { Center, Group, Paper, Stack, Title } from "@mantine/core";
import VinylLogo from "../../assets/VinylByteLogo.svg";
import { IconArrowLeft, IconBrandSpotify } from "@tabler/icons-react";
import { useMediaQuery } from "@mantine/hooks";
import { MOBILE_BREAKPOINT, SPOTIFY_SCOPES } from "./Settings";
import supabase from "../../supabase";
import { useSession } from "../../hooks/useSession";
import { Link, Navigate } from "react-router";
import { useState } from "react";

export default function LoginPage() {
    const isMobile = useMediaQuery(MOBILE_BREAKPOINT);
    const session = useSession();
    const [loading, setLoading] = useState(false);

    // Already logged in — redirect to home
    if (session) {
        return <Navigate to="/" replace />;
    }

    const signInWithSpotify = async () => {
        await supabase.auth.signInWithOAuth({
            provider: "spotify",
            options: {
                redirectTo: window.location.origin,
                scopes: SPOTIFY_SCOPES,
            },
        });
    };

    return (
        <div>
            <div style={{ position: "absolute", top: "1rem", left: "1rem" }}>
                <Button as={Link} to="/" variant="light" startContent={<IconArrowLeft />}>
                    Zurück zur Startseite
                </Button>
            </div>
            <Center style={{ height: "100vh" }}>
                <Paper
                    shadow={isMobile ? "" : "md"}
                    p="xl"
                    withBorder={!isMobile}
                    radius={"lg"}
                    maw={{ base: "100%", md: "50%" }}
                >
                    <Stack>
                        <Center ml={-20} mb={10}>
                            <Group>
                                <Image
                                    src={VinylLogo}
                                    alt="VinylByte Logo"
                                    className="w-12 h-12 mr-2"
                                />
                                <Title order={2}>HitLab</Title>
                            </Group>
                        </Center>
                        <Alert color="warning">
                            Für die Nutzung unseres Services ist ein Spotify-Premium-Konto
                            erforderlich, da dieser die Spotify API nutzt um Informationen über die
                            Songs und Playlists zu erhalten.
                        </Alert>
                        <Button
                            className={"w-full"}
                            startContent={loading ? null : <IconBrandSpotify />}
                            color="success"
                            variant="flat"
                            size="lg"
                            onPress={() => {
                                setLoading(true);
                                signInWithSpotify().then(() => setLoading(false));
                            }}
                            isLoading={loading}
                        >
                            Anmelden mit Spotify
                        </Button>
                    </Stack>
                </Paper>
            </Center>
        </div>
    );
}
