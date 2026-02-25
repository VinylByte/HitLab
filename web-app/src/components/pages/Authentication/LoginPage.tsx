import {Button, Image} from "@heroui/react";
import { Center, Group, Paper, Stack } from "@mantine/core";

import VinylLogo from "../../../assets/VinylByteLogo.svg";
import { IconBrandSpotify } from "@tabler/icons-react";
import { useMediaQuery } from "@mantine/hooks";
import { MOBILE_BREAKPOINT } from "../Settings";


export default function LoginPage() {
    const isMobile = useMediaQuery(MOBILE_BREAKPOINT);

    const handleSpotifyLogin = () => {
        // Hier würde die Logik für die Spotify-Authentifizierung implementiert werden
        console.log("Spotify Login Button Clicked");
    };

    return (
    <div>
        <Center style={{ height: '100vh'}}>
            <Paper shadow={isMobile? "": "md"} p="xl" withBorder={!isMobile} radius={"lg"}>
                <Stack>
                    <Center ml={-20}>
                        <Group>
                            <Image src={VinylLogo} alt="VinylByte Logo" className="w-10 h-10 mr-2" />
                            <p className="font-bold text-inherit text-xl">HitLab</p>
                        </Group>
                    </Center>
                    <Button className={isMobile? "w-80": "w-100"} startContent={<IconBrandSpotify />} color="success" variant="flat" size="lg" onClick={handleSpotifyLogin}>
                        Login with Spotify
                    </Button>
                </Stack>
            </Paper>
        </Center>
    </div>
  );
}
