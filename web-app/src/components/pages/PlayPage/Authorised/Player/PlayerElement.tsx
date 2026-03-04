import { useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router";
import { Center, Container, Stack } from "@mantine/core";
import { Button, Slider } from "@heroui/react";
import { IconPlayerPause, IconPlayerPlay } from "@tabler/icons-react";

export default function PlayerElement() {
    const { currentTrackId: currentTrackIdFromPath } = useParams();
    const [searchParams] = useSearchParams();

    const currentTrackId = useMemo(() => {
        return (
            currentTrackIdFromPath ??
            searchParams.get("currentTrackId") ??
            searchParams.get("trackId")
        );
    }, [currentTrackIdFromPath, searchParams]);

    // Time in Seconds
    const [currentTrackTime, setCurrentTrackTime] = useState(50);
    const [totalTrackTime, setTotalTrackTime] = useState(100);

    const [isPlaying, setIsPlaying] = useState(false);
    const togglePlay = () => {
        setIsPlaying(!isPlaying);
    };

    return (
        <div>
            <p>Current track id: {currentTrackId ?? "-"}</p>
            <Container size={"md"}>
                <Stack>
                    <Slider
                        aria-label="Player progress"
                        className="w-full"
                        color="primary"
                        value={totalTrackTime > 0 ? (currentTrackTime / totalTrackTime) * 100 : 0}
                        hideThumb={true}
                    />
                    <Center>
                        <Button
                            isIconOnly
                            color="primary"
                            className="w-15 h-15"
                            radius="full"
                            onPress={togglePlay}
                        >
                            {isPlaying ? <IconPlayerPause /> : <IconPlayerPlay />}
                        </Button>
                    </Center>
                </Stack>
            </Container>
        </div>
    );
}
