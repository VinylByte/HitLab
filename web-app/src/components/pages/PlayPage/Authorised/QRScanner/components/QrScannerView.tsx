import styles from "../styles/QRScannerElement.module.css";
import { useQrScanner } from "../hooks/useQrScanner";
import { useMediaQuery } from "@mantine/hooks";
import { MOBILE_BREAKPOINT } from "@/lib/constants";

type QrScannerViewProps = {
    onScan: (result: string) => void;
    isOpen?: boolean;
};

export function QrScannerView({ onScan, isOpen = true }: QrScannerViewProps) {
    const isMobile = useMediaQuery(MOBILE_BREAKPOINT);
    const { readerId } = useQrScanner({ onScan, isMobile, shouldStart: isOpen });

    return (
        <div className={styles.scanner}>
            <div id={readerId} className={styles.reader} />
        </div>
    );
}
