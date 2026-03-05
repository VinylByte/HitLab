import { Modal, ModalBody, ModalContent, Button } from "@heroui/react";
import QrScanner from "./QRScanner/QRScannerElement";
import { useState } from "react";
import { useMediaQuery } from "@mantine/hooks";
import { MOBILE_BREAKPOINT } from "../../Settings";
import PlayerElement from "./Player/PlayerElement";
import { useNavigate } from "react-router";

export default function AuthorisedPlayPage() {
    const [scannerOpen, setScannerOpen] = useState(false);
    const isMobile = useMediaQuery(MOBILE_BREAKPOINT);
    const navigate = useNavigate();

    const onScan = (result: string) => {
        setScannerOpen(false);
        navigate(result.replace(window.location.origin, ""));
    };

    return (
        <div>
            <PlayerElement />
            <Button color="primary" onPress={() => setScannerOpen(true)}>
                Open QR Scanner
            </Button>
            <Modal
                isOpen={scannerOpen}
                onOpenChange={setScannerOpen}
                size="xl"
                placement={isMobile ? "center" : "auto"}
            >
                <ModalContent>
                    {onClose => (
                        <>
                            <ModalBody className="p-0 flex-1 overflow-hidden">
                                <div className="h-full w-full relative">
                                    <QrScanner onScan={onScan} />
                                    <div
                                        className={
                                            isMobile
                                                ? "absolute bottom-2 w-3/5 left-1/5"
                                                : "absolute bottom-4 w-3/5 left-1/5"
                                        }
                                    >
                                        <div className="relative w-full">
                                            <div
                                                className="absolute inset-0 rounded-xl bg-black/60"
                                                aria-hidden="true"
                                            />
                                            <Button
                                                color="danger"
                                                variant="flat"
                                                className="relative z-10 w-full"
                                                onPress={onClose}
                                            >
                                                Abbrechen
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </ModalBody>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
