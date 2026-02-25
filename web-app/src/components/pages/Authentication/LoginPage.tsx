import { Button, Image } from "@heroui/react";
import { Center, Group, Paper, Stack } from "@mantine/core";
import VinylLogo from "../../../assets/VinylByteLogo.svg";
import { IconBrandSpotify } from "@tabler/icons-react";
import { useMediaQuery } from "@mantine/hooks";
import { MOBILE_BREAKPOINT } from "../Settings";
import { supabase } from "../../../lib/supabase";
import { useSession } from "../../../hooks/useSession";
import { Navigate } from "react-router";

const SPOTIFY_SCOPES = [
    "user-read-email",
    "user-read-private",
    "streaming",
    "user-modify-playback-state",
    "user-read-playback-state",
    "user-read-currently-playing",
].join(" ");

export default function LoginPage() {
    const isMobile = useMediaQuery(MOBILE_BREAKPOINT);
    const session = useSession();

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
            <Center style={{ height: "100vh" }}>
                <Paper shadow={isMobile ? "" : "md"} p="xl" withBorder={!isMobile} radius={"lg"}>
                    <Stack>
                        <Center ml={-20}>
                            <Group>
                                <Image
                                    src={VinylLogo}
                                    alt="VinylByte Logo"
                                    className="w-10 h-10 mr-2"
                                />
                                <p className="font-bold text-inherit text-xl">HitLab</p>
                            </Group>
                        </Center>
                        <Button
                            className={isMobile ? "w-80" : "w-100"}
                            startContent={<IconBrandSpotify />}
                            color="success"
                            variant="flat"
                            size="lg"
                            onPress={signInWithSpotify}
                        >
                            Login with Spotify
                        </Button>
                    </Stack>
                </Paper>
            </Center>
        </div>
    );
}
