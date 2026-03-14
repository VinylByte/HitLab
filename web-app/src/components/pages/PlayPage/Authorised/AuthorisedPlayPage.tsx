import { Button, Alert } from "@heroui/react";
import QRScannerModal from "./QRScanner/QRScannerElement";
import { useCallback, useMemo, useState, useEffect } from "react";
import { useMediaQuery } from "@mantine/hooks";
import { MOBILE_BREAKPOINT } from "../../../../lib/constants";
import PlayerElement from "./Player/PlayerElement";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { IconScan } from "@tabler/icons-react";
import { Center, Stack, Text } from "@mantine/core";

export default function AuthorisedPlayPage() {
    const [scannerOpen, setScannerOpen] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const isMobile = useMediaQuery(MOBILE_BREAKPOINT);
    const navigate = useNavigate();

    const { currentTrackId: currentTrackIdFromPath } = useParams();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";

        return () => {
            document.documentElement.style.overflow = "";
            document.body.style.overflow = "";
        };
    }, []);

    const onScan = (result: string) => {
        setScannerOpen(false);
        setErrorMsg(null);
        navigate(result.replace(window.location.origin, ""));
    };

    const onPlayerError = useCallback((msg: string) => {
        setErrorMsg(msg);
    }, []);

    const currentTrackId = useMemo(() => {
        return (
            currentTrackIdFromPath ??
            searchParams.get("currentTrackId") ??
            searchParams.get("trackId")
        );
    }, [currentTrackIdFromPath, searchParams]);

    return (
        <div
            style={{
                height: "90vh",
                overflow: "hidden",
                display: "flex",
                justifyContent: "center",
            }}
        >
            <QRScannerModal onScan={onScan} isOpen={scannerOpen} onOpenChange={setScannerOpen} />
            <Stack
                h={"100%"}
                align="stretch"
                justify="center"
                style={{ overflow: "hidden", width: "100%" }}
            >
                {currentTrackId ? (
                    <PlayerElement currentTrackId={currentTrackId} onError={onPlayerError} />
                ) : (
                    <Center style={{ flex: 1 }}>
                        <Stack align="center" gap="md" w="100%">
                            <Alert
                                variant="flat"
                                color="secondary"
                                className={
                                    isMobile
                                        ? "w-[88%] max-w-[520px] py-4 px-4 text-center"
                                        : "w-[68%] max-w-[560px] py-7 px-6 text-center"
                                }
                            >
                                <div className="flex flex-col items-center gap-2 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <IconScan size={22} />
                                        <Text fw={700} size={isMobile ? "md" : "lg"}>
                                            Bereit zum Starten?
                                        </Text>
                                    </div>
                                    <Text size={isMobile ? "sm" : "md"}>
                                        Scanne einen Song, damit das Spiel beginnen kann.
                                    </Text>
                                </div>
                            </Alert>
                            <Button
                                startContent={<IconScan size={20} />}
                                color="primary"
                                className={
                                    isMobile ? "w-[88%] max-w-[520px]" : "w-[68%] max-w-[560px]"
                                }
                                onPress={() => setScannerOpen(true)}
                            >
                                Song scannen
                            </Button>
                        </Stack>
                    </Center>
                )}
                {errorMsg && (
                    <Text c="red" ta="center" size="sm">
                        {errorMsg}
                    </Text>
                )}
                {currentTrackId && (
                    <Button
                        startContent={<IconScan size={20} />}
                        color="primary"
                        className={isMobile ? "w-6/8 mt-10 mx-auto" : "w-4/10 mt-10 mx-auto"}
                        onPress={() => setScannerOpen(true)}
                    >
                        Nächsten Song scannen
                    </Button>
                )}
            </Stack>
        </div>
    );
}
