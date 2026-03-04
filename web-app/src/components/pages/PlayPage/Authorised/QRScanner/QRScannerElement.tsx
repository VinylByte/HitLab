import { useCallback, useEffect, useId, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

let globalScanner: Html5Qrcode | null = null;

export default function QrScanner({ onScan }: { onScan: (result: string) => void }) {
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
            qrbox: { width: 250, height: 250 },
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
