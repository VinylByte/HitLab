export const QR_SCANNER_MODAL_STYLE = {
    width: "min(92vw, 92vh, 560px)",
    height: "min(92vw, 92vh, 560px)",
    maxWidth: "none",
    maxHeight: "none",
} as const;

export function createQrScanConfig() {
    return {
        fps: 10,
        qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
            const minSize = Math.min(viewfinderWidth, viewfinderHeight);
            return { width: minSize * 0.7, height: minSize * 0.7 };
        },
        aspectRatio: 1,
    };
}
