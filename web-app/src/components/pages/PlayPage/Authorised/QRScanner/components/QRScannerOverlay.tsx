import { useEffect } from "react";
import { createPortal } from "react-dom";
import { IconX } from "@tabler/icons-react";
import { QrScannerView } from "./QrScannerView";
import styles from "../styles/QRScannerElement.module.css";

type QRScannerOverlayProps = {
    onScan: (result: string) => void;
    isOpen: boolean;
    onClose: () => void;
};

export function QRScannerOverlay({ onScan, isOpen, onClose }: QRScannerOverlayProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="relative w-full h-full max-w-96 max-h-96 bg-black rounded-lg overflow-hidden flex flex-col">
                <div className={`${styles.scanner} flex-1`}>
                    <QrScannerView onScan={onScan} isOpen={isOpen} />
                </div>

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-40 p-2 rounded-full bg-danger hover:bg-danger/80 text-white"
                    aria-label="Close scanner"
                >
                    <IconX size={24} />
                </button>
            </div>
        </div>,
        document.body
    );
}
