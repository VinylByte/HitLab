import { Title } from "@mantine/core";
import { Button, Modal, ModalBody, ModalContent } from "@heroui/react";
import { QrScannerView } from "./QrScannerView";
import { QR_SCANNER_MODAL_STYLE } from "../config/qrScannerConfig";

type QRScannerModalProps = {
    onScan: (result: string) => void;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
};

export default function QRScannerModal({ onScan, isOpen, onOpenChange }: QRScannerModalProps) {
    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg" placement="center">
            <ModalContent style={QR_SCANNER_MODAL_STYLE}>
                {onClose => (
                    <ModalBody className="p-0 h-full overflow-hidden relative">
                        <div className="absolute inset-0 z-0">
                            <QrScannerView onScan={onScan} />
                        </div>
                        <div className="absolute bottom-4 left-1/2 z-30 w-3/5 -translate-x-1/2">
                            <div className="relative w-full">
                                <div
                                    className="absolute inset-0 rounded-xl bg-black/60"
                                    aria-hidden="true"
                                />
                                <Button
                                    color="danger"
                                    variant="flat"
                                    className="relative z-10 w-full h-15"
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
