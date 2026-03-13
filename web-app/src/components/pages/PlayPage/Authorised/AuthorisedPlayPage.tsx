import { Button } from "@heroui/react";
import QRScannerModal from "./QRScanner/QRScannerElement";
import { useCallback, useMemo, useState, useEffect } from "react";
import { useMediaQuery } from "@mantine/hooks";
import { MOBILE_BREAKPOINT } from "../../../../lib/constants";
import PlayerElement from "./Player/PlayerElement";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { IconScan } from "@tabler/icons-react";
import { Stack, Text } from "@mantine/core";

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
                <PlayerElement currentTrackId={currentTrackId} onError={onPlayerError} />
                {errorMsg && (
                    <Text c="red" ta="center" size="sm">
                        {errorMsg}
                    </Text>
                )}
                <Button
                    startContent={<IconScan size={20} />}
                    color="primary"
                    className={isMobile ? "w-6/8 mt-10 mx-auto" : "w-4/10 mt-10 mx-auto"}
                    onPress={() => setScannerOpen(true)}
                >
                    {currentTrackId ? "Nächsten Song scannen" : "Song scannen"}
                </Button>
            </Stack>
        </div>
    );
}
