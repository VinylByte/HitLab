import styles from "../styles/QRScannerElement.module.css";
import { useQrScanner } from "../hooks/useQrScanner";

type QrScannerViewProps = {
    onScan: (result: string) => void;
};

export function QrScannerView({ onScan }: QrScannerViewProps) {
    const { readerId } = useQrScanner({ onScan });

    return (
        <div className={styles.scanner}>
            <div id={readerId} className={styles.reader} />
        </div>
    );
}
