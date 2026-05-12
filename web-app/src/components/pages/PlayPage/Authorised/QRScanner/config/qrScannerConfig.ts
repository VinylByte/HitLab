export type ResponsiveModalSize = "mobile" | "tablet" | "desktop";

export function getModalStyle(size: ResponsiveModalSize): React.CSSProperties {
    switch (size) {
        case "mobile":
            return {
                width: "480px",
                height: "480px",
                maxWidth: "95vw",
                maxHeight: "95dvh",
                padding: "0",
                margin: "0",
            };
        case "tablet":
            return {
                width: "90vw",
                height: "90vh",
                maxWidth: "600px",
                maxHeight: "600px",
                aspectRatio: "1",
            };
        case "desktop":
        default:
            return {
                width: "560px",
                height: "560px",
                maxWidth: "none",
                maxHeight: "none",
                aspectRatio: "1",
            };
    }
}

export function createQrScanConfig() {
    return {
        fps: 10,
        qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
            const minSize = Math.min(viewfinderWidth, viewfinderHeight);
            return { width: minSize * 0.75, height: minSize * 0.75 };
        },
        aspectRatio: 1,
    };
}
