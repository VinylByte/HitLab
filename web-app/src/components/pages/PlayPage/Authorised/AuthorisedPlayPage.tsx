import { Modal, ModalBody, ModalContent, Button } from "@heroui/react";
import QrScanner from "./QRScanner/QRScannerElement";
import { useState } from "react";
import { useMediaQuery } from "@mantine/hooks";
import { MOBILE_BREAKPOINT } from "../../Settings";

export default function AuthorisedPlayPage() {
    const [scannerOpen, setScannerOpen] = useState(false);
    const isMobile = useMediaQuery(MOBILE_BREAKPOINT)

    const onScan = (result: string) => {
        setScannerOpen(false);
        alert("Scanned QR code:" + result);
    };

    return (
        <div>
            <Button color="primary" onPress={() => setScannerOpen(true)}>
                Open QR Scanner
            </Button>
            <Modal isOpen={scannerOpen} onOpenChange={setScannerOpen} size="xl" placement={isMobile ? "center" : "auto"}>
                <ModalContent>
                    {onClose => (
                        <>
                            
                            <ModalBody className="p-0 flex-1 overflow-hidden">
                                <div className="h-full w-full relative">
                                    <QrScanner onScan={onScan} />
                                    <div className={"absolute bottom-" + (isMobile ? "2" : "4") + " w-3/5 left-1/5"}>
                                        <Button color="danger" variant="flat" className="w-full" onPress={onClose}>
                                            Abbrechen
                                        </Button>
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
