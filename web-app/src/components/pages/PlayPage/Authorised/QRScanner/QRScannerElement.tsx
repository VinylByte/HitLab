import { useCallback, useEffect, useId, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useMediaQuery } from "@mantine/hooks";
import { MOBILE_BREAKPOINT } from "../../../Settings";
import { Modal, ModalBody, ModalContent, Button } from "@heroui/react";

let globalScanner: Html5Qrcode | null = null;

export function QrScanner({ onScan }: { onScan: (result: string) => void }) {
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const onScanRef = useRef(onScan);
    const readerId = useId().replace(/:/g, "");
    const isRunningRef = useRef(false);
    const isBusyRef = useRef(false);

    useEffect(() => {
        onScanRef.current = onScan;
    }, [onScan]);

    const setRunningState = useCallback((value: boolean) => {
        isRunningRef.current = value;
    }, []);

    const setBusyState = useCallback((value: boolean) => {
        isBusyRef.current = value;
    }, []);

    const clearReaderContainer = useCallback(() => {
        const container = document.getElementById(readerId);
        if (container) {
            container.innerHTML = "";
        }
    }, [readerId]);

    const startScanner = useCallback(async () => {
        if (isRunningRef.current || isBusyRef.current || scannerRef.current) {
            return;
        }

        const readerElement = document.getElementById(readerId);
        if (!readerElement) {
            return;
        }

        setBusyState(true);
        clearReaderContainer();

        const scanner = new Html5Qrcode(readerId, false);

        const scanConfig = {
            fps: 10,
            qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
                const minSize = Math.min(viewfinderWidth, viewfinderHeight);
                return { width: minSize * 0.7, height: minSize * 0.7 };
            },
            aspectRatio: 1,
        };

        const onScanSuccess = (decodedText: string, decodedResult: unknown) => {
            console.log(`Code gefunden: ${decodedText}`, decodedResult);
            onScanRef.current(decodedText);
        };

        const onScanFailure = (_error: string) => {};

        try {
            if (globalScanner && globalScanner !== scanner) {
                if (globalScanner.isScanning) {
                    await globalScanner.stop().catch((error: unknown) => {
                        console.error("Failed to stop existing scanner", error);
                    });
                }

                try {
                    globalScanner.clear();
                } catch (clearError) {
                    console.error("Failed to clear existing scanner", clearError);
                }
            }

            globalScanner = scanner;
            scannerRef.current = scanner;
            await scanner.start(
                { facingMode: "environment" },
                scanConfig,
                onScanSuccess,
                onScanFailure
            );

            setRunningState(true);
        } catch (primaryError) {
            try {
                const cameras = await Html5Qrcode.getCameras();
                if (cameras.length > 0) {
                    await scanner.start(cameras[0].id, scanConfig, onScanSuccess, onScanFailure);
                    setRunningState(true);
                    setBusyState(false);
                    return;
                }
            } catch (fallbackError) {
                console.error("Failed to start scanner with fallback camera", fallbackError);
            }

            console.error("Failed to start scanner", primaryError);
            try {
                scanner.clear();
            } catch (clearError) {
                console.error("Failed to clear scanner after start failure", clearError);
            }
            if (globalScanner === scanner) {
                globalScanner = null;
            }
            scannerRef.current = null;
            clearReaderContainer();
            setRunningState(false);
        } finally {
            setBusyState(false);
        }
    }, [clearReaderContainer, readerId, setBusyState, setRunningState]);

    useEffect(() => {
        const autoStartTimeout = window.setTimeout(() => {
            void startScanner();
        }, 0);

        return () => {
            window.clearTimeout(autoStartTimeout);

            const activeScanner = scannerRef.current;
            scannerRef.current = null;

            if (!activeScanner) {
                clearReaderContainer();
                return;
            }

            if (globalScanner === activeScanner) {
                globalScanner = null;
            }

            if (activeScanner.isScanning) {
                void activeScanner.stop().catch((error: unknown) => {
                    console.error("Failed to stop scanner", error);
                });
            }

            try {
                activeScanner.clear();
            } catch (error) {
                console.error("Failed to clear scanner", error);
            }
            clearReaderContainer();
            setRunningState(false);
            setBusyState(false);
        };
    }, [clearReaderContainer, setBusyState, setRunningState, startScanner]);

    return (
        <div>
            <div id={readerId} style={{ width: "100%", height: "100%" }} />
        </div>
    );
}

export default function QRScannerModal({
    onScan,
    isOpen,
    onOpenChange,
}: {
    onScan: (result: string) => void;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const isMobile = useMediaQuery(MOBILE_BREAKPOINT);
    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
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
    );
}
