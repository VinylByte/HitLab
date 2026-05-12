import { useCallback, useEffect, useId, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { createLogger } from "@/lib/logger";
import { createQrScanConfig } from "../config/qrScannerConfig";

const log = createLogger("qr-scanner");

let globalScanner: Html5Qrcode | null = null;

type UseQrScannerOptions = {
    onScan: (result: string) => void;
};

export function useQrScanner({ onScan }: UseQrScannerOptions) {
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

    const stopActiveScanner = useCallback(
        async (scanner: Html5Qrcode) => {
            if (scanner.isScanning) {
                try {
                    await scanner.stop();
                } catch (error) {
                    log.error("Failed to stop scanner", error);
                }
            }

            try {
                scanner.clear();
            } catch (error) {
                log.error("Failed to clear scanner", error);
            }
            clearReaderContainer();
        },
        [clearReaderContainer]
    );

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
        const scanConfig = createQrScanConfig();

        const onScanSuccess = (decodedText: string, decodedResult: unknown) => {
            log.debug("code found", { decodedText, decodedResult });
            onScanRef.current(decodedText);
        };

        const onScanFailure = (_error: string) => {};

        try {
            if (globalScanner && globalScanner !== scanner) {
                await stopActiveScanner(globalScanner);
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
                log.error("Failed to start scanner with fallback camera", fallbackError);
            }

            log.error("Failed to start scanner", primaryError);
            try {
                scanner.clear();
            } catch (clearError) {
                log.error("Failed to clear scanner after start failure", clearError);
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
    }, [clearReaderContainer, readerId, setBusyState, setRunningState, stopActiveScanner]);

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

            void stopActiveScanner(activeScanner);
            setRunningState(false);
            setBusyState(false);
        };
    }, [clearReaderContainer, setBusyState, setRunningState, startScanner, stopActiveScanner]);

    return {
        readerId,
    };
}
