import { Button } from "@heroui/react";
import QRScannerModal from "./QRScanner/QRScannerElement";
import { useMemo, useState, useEffect } from "react";
import { useMediaQuery } from "@mantine/hooks";
import { MOBILE_BREAKPOINT } from "../../Settings";
import PlayerElement from "./Player/PlayerElement";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { IconScan } from "@tabler/icons-react";
import { Stack } from "@mantine/core";

export default function AuthorisedPlayPage() {
    const [scannerOpen, setScannerOpen] = useState(false);
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
        navigate(result.replace(window.location.origin, ""));
    };

    const currentTrackId = useMemo(() => {
        return (
            currentTrackIdFromPath ??
            searchParams.get("currentTrackId") ??
            searchParams.get("trackId")
        );
    }, [currentTrackIdFromPath, searchParams]);

    return (
        <div style={{ height: "90vh", overflow: "hidden" }}>
            <QRScannerModal onScan={onScan} isOpen={scannerOpen} onOpenChange={setScannerOpen} />
            <Stack h={"100%"} style={{ overflow: "hidden" }}>
                <PlayerElement currentTrackId={currentTrackId} />
                <Button
                    startContent={<IconScan size={20} />}
                    color="primary"
                    className={isMobile ? "w-6/8 mt-10 left-1/8 right-1/8" : "w-4/10 left-3/10 mt-10"}
                    onPress={() => setScannerOpen(true)}
                >
                    {currentTrackId ? "Nächsten Song scannen" : "Song scannen"}
                </Button>
            </Stack>
        </div>
    );
}
