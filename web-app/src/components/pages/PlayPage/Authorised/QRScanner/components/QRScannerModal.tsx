import { Title } from "@mantine/core";
import { Button, Modal, ModalBody, ModalContent } from "@heroui/react";
import { useMediaQuery } from "@mantine/hooks";
import { QrScannerView } from "./QrScannerView";
import { getModalStyle, type ResponsiveModalSize } from "../config/qrScannerConfig";
import { MOBILE_BREAKPOINT, SMALL_BREAKPOINT } from "@/lib/constants";

type QRScannerModalProps = {
    onScan: (result: string) => void;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
};

export default function QRScannerModal({ onScan, isOpen, onOpenChange }: QRScannerModalProps) {
    const isMobile = useMediaQuery(MOBILE_BREAKPOINT);
    const isSmall = useMediaQuery(SMALL_BREAKPOINT);

    let size: ResponsiveModalSize = "desktop";
    if (isMobile) size = "mobile";
    else if (isSmall) size = "tablet";

    const modalStyle = getModalStyle(size);
    const isMobileMode = size === "mobile";

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            size="lg"
            placement="center"
            backdrop={isMobileMode ? "opaque" : "blur"}
            className={isMobileMode ? "w-screen h-screen" : ""}
        >
            <ModalContent
                style={modalStyle}
                className={isMobileMode ? "rounded-none" : "rounded-lg"}
            >
                {onClose => (
                    <ModalBody className="p-0 h-full w-full overflow-hidden relative">
                        <div className="absolute inset-0 z-0">
                            <QrScannerView onScan={onScan} isOpen={isOpen} />
                        </div>
                        <div className="absolute bottom-4 z-30 left-0 right-0 flex justify-center px-4">
                            <div className="w-3/5 relative">
                                <div
                                    className="absolute inset-0 rounded-xl bg-black/60"
                                    aria-hidden="true"
                                />
                                <Button
                                    color="danger"
                                    variant="flat"
                                    className={`relative z-10 w-full ${
                                        isMobileMode ? "h-14" : "h-15"
                                    }`}
                                    onPress={onClose}
                                >
                                    <Title order={4}>Abbrechen</Title>
                                </Button>
                            </div>
                        </div>
                    </ModalBody>
                )}
            </ModalContent>
        </Modal>
    );
}
