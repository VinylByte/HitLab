import React, { useEffect, useMemo } from "react";
import {
    Button,
    Drawer,
    DrawerBody,
    DrawerHeader,
    DrawerFooter,
    DrawerContent,
    Select,
    SelectItem,
    type SelectedItems,
    Chip,
    Progress,
} from "@heroui/react";
import { IconDownload } from "@tabler/icons-react";
import { Center, Title, Text } from "@mantine/core";
import QRCode from "qrcode";
import type { Card, BackgroundConfig } from "./interfaces";
import { generateDeckPdfBlob } from "./pdf-lib/pdfLibGenerator";
import { DESIGNS } from "./Design/HardDesigns";
import { getSelectableDesigns, resolveDesignSelection } from "./Design/DesignResolver";
import type { HardDesignPreset } from "./Design/DesignResolver";
import type { PublicDeck } from "../../types/deck";
import type { Song } from "../../types/song";

const getURL = ({ songId }: { songId: string }) => {
    return window.location.origin + `/play/${songId}`;
};

const getBackgroundCss = (bg: BackgroundConfig | undefined): string => {
    if (!bg) return "transparent";
    if (bg.type === "solid") return bg.color;
    if (bg.type === "image") return `url(${bg.url}) center/cover`;
    if (bg.type === "gradient")
        return (bg.css ?? "").replace(/^background:\s*/i, "").replace(/;+$/, "");
    return "transparent";
};

const DesignPreview = ({
    design,
    allDesigns,
}: {
    design: HardDesignPreset;
    allDesigns: HardDesignPreset[];
}) => {
    const designById = new Map(allDesigns.map(d => [d.id, d]));
    const leafDesigns = design.includes
        ? design.includes
              .map(id => designById.get(id))
              .filter((d): d is HardDesignPreset => Boolean(d))
        : [design];

    return (
        <div className="grid grid-cols-3 gap-2">
            {leafDesigns.map(leaf => {
                const frontBg = leaf.frontBackground ?? leaf.background;
                const backBg = leaf.backBackground ?? leaf.background;
                return (
                    <div key={leaf.id} className="flex" title={leaf.name}>
                        <div
                            className="rounded-sm w-7 h-7 shrink-0"
                            style={{ background: getBackgroundCss(frontBg) }}
                        />
                        <div
                            className="rounded-sm w-7 h-7 shrink-0"
                            style={{ background: getBackgroundCss(backBg) }}
                        />
                    </div>
                );
            })}
        </div>
    );
};

export interface DownloadModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    songs: Song[];
    deck: PublicDeck;
}

export default function DownloadModal(props: DownloadModalProps) {
    const { isOpen, onOpenChange, songs, deck } = props;
    const [selectedDesign, setSelectedDesign] = React.useState<Array<string>>(["like-hitster"]);
    const [selectedPrintType, setSelectedPrintType] = React.useState<"one-sided" | "double-sided">(
        "one-sided"
    );
    const [selectedBindingMode, setSelectedBindingMode] = React.useState<
        "long-edge" | "short-edge"
    >("long-edge");

    const [downloadStarted, setDownloadStarted] = React.useState(false);
    const [downloadProgress, setDownloadProgress] = React.useState(0);
    const [downloadPhase, setDownloadPhase] = React.useState<"qr" | "render" | null>(null);

    const selectableDesigns = useMemo(() => getSelectableDesigns(DESIGNS), []);

    // Reset download state when modal is opened/closed
    useEffect(() => {
        setDownloadStarted(false);
        setDownloadProgress(0);
        setDownloadPhase(null);
    }, [isOpen]);

    // QR codes are generated on-demand in startDownload

    const cards = useMemo(() => {
        return songs.map(
            song =>
                ({
                    ...song,
                    year: song.year.toString(),
                    url: getURL({ songId: song.spotify_track_id }),
                    // TODO: use actual track ID
                }) as Card
        );
    }, [songs]);

    // Helper to generate QR codes for an array of cards
    const generateQRCodes = async (
        items: Card[],
        options?: {
            concurrency?: number;
            onProgress?: (percent: number) => void;
        }
    ): Promise<Card[]> => {
        if (!items.length) {
            options?.onProgress?.(100);
            return [];
        }

        const result = new Array<Card>(items.length);
        const concurrency = Math.max(1, Math.min(options?.concurrency ?? 8, items.length));
        let nextIndex = 0;
        let completed = 0;
        const reportProgress = () => {
            const percent = (completed / items.length) * 100;
            options?.onProgress?.(percent);
        };

        options?.onProgress?.(0);

        const worker = async () => {
            while (true) {
                const currentIndex = nextIndex;
                nextIndex += 1;

                if (currentIndex >= items.length) {
                    break;
                }

                const card = items[currentIndex];
                try {
                    const dataUri = await QRCode.toDataURL(card.url, {
                        margin: 1,
                        width: 250,
                        color: { dark: "#000000", light: "#ffffff" },
                    });
                    result[currentIndex] = { ...card, qrDataUri: dataUri } as Card;
                } catch (_err) {
                    result[currentIndex] = card;
                }

                completed += 1;
                reportProgress();
            }
        };

        await Promise.all(Array.from({ length: concurrency }, () => worker()));
        options?.onProgress?.(100);
        return result;
    };

    // remove async useMemo to avoid race conditions; create blob on-demand in startDownload

    const startDownload = async () => {
        setDownloadStarted(true);
        setDownloadProgress(0);

        try {
            setDownloadPhase("qr");
            const sourceCards = await generateQRCodes(cards, {
                concurrency: 8,
                onProgress: percent => {
                    const weighted = percent * 0.5;
                    setDownloadProgress(prev => Math.max(prev, weighted));
                },
            });
            const selectedDesignPresets = resolveDesignSelection(selectedDesign, DESIGNS);

            const frontBackgrounds: BackgroundConfig[] = selectedDesignPresets
                .map(design => design.frontBackground ?? design.background)
                .filter((background): background is BackgroundConfig => Boolean(background));

            const backBackgrounds: BackgroundConfig[] = selectedDesignPresets
                .map(design => design.backBackground ?? design.background ?? design.frontBackground)
                .filter((background): background is BackgroundConfig => Boolean(background));

            setDownloadPhase("render");
            const blob = await generateDeckPdfBlob({
                cards: sourceCards,
                type: selectedPrintType,
                bindingMode: selectedBindingMode,
                frontBackgrounds,
                backBackgrounds,
                onProgress: percent => {
                    const weighted = 50 + percent * 0.5;
                    setDownloadProgress(prev => Math.max(prev, weighted));
                },
            });

            setDownloadProgress(100);
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${deck.name}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } finally {
            setDownloadStarted(false);
            setDownloadPhase(null);
        }
    };

    // no background pre-generation; QR codes are generated on-demand

    return (
        <Drawer size="2xl" isOpen={isOpen} onOpenChange={onOpenChange} placement="left">
            <DrawerContent>
                {onClose => (
                    <>
                        <DrawerHeader className="flex flex-col gap-1">
                            <Center>
                                <Title order={2}>{deck.name}</Title>
                            </Center>
                        </DrawerHeader>
                        <DrawerBody>
                            <Select
                                label="Design auswählen"
                                description="Wenn du mehrere Designs auswählst, wechseln sich die Designs pro Karte ab."
                                selectedKeys={selectedDesign}
                                selectionMode="multiple"
                                isMultiline={true}
                                renderValue={(items: SelectedItems<any>) => {
                                    return (
                                        <div className="flex flex-wrap gap-2">
                                            {items.map(item => (
                                                <Chip key={item.key}>
                                                    {DESIGNS.find(design => design.id === item.key)
                                                        ?.name || "Design"}
                                                </Chip>
                                            ))}
                                        </div>
                                    );
                                }}
                                onSelectionChange={keys =>
                                    setSelectedDesign(
                                        keys instanceof Set
                                            ? Array.from(keys).map(String)
                                            : Array.isArray(keys)
                                              ? keys.map(String)
                                              : []
                                    )
                                }
                            >
                                {selectableDesigns.map(design => (
                                    <SelectItem key={design.id}>
                                        <div className="flex items-start gap-3 py-1">
                                            <div className="shrink-0">
                                                <DesignPreview
                                                    design={design}
                                                    allDesigns={DESIGNS}
                                                />
                                            </div>
                                            <div className="min-w-0">
                                                <Text fw={"600"}>{design.name}</Text>
                                                <div className="text-sm text-gray-500 break-words">
                                                    {design.description}
                                                </div>
                                            </div>
                                        </div>
                                    </SelectItem>
                                ))}
                            </Select>
                            <Select
                                label="Druckart"
                                description="Bestimmt die Anordnung der Karten auf dem Blatt. Bei doppelseitigem Druck sind die Karten so angeordnet, dass Vorder- und Rückseite nach dem Drucken korrekt übereinander liegen."
                                selectedKeys={new Set([selectedPrintType])}
                                onSelectionChange={key => {
                                    const selectedKey =
                                        key instanceof Set ? Array.from(key)[0] : key;
                                    setSelectedPrintType(
                                        selectedKey as "one-sided" | "double-sided"
                                    );
                                }}
                                disallowEmptySelection
                            >
                                <SelectItem key="one-sided">Einseitig</SelectItem>
                                <SelectItem key="double-sided">Doppelseitig</SelectItem>
                            </Select>
                            {selectedPrintType === "double-sided" && (
                                <Select
                                    label="Bindungsart (nur bei doppelseitigem Druck)"
                                    description="Bestimmt, wie die Rückseiten der Karten angeordnet werden: 'An langer Seite spiegeln' bedeutet, dass die Rückseiten horizontal gespiegelt werden (ideal für Bindung an langer Seite), während 'An kurzer Seite spiegeln' keine Spiegelung vornimmt (ideal für Bindung an kurzer Seite)."
                                    selectedKeys={new Set([selectedBindingMode])}
                                    onSelectionChange={key => {
                                        const selectedKey =
                                            key instanceof Set ? Array.from(key)[0] : key;
                                        setSelectedBindingMode(
                                            selectedKey as "long-edge" | "short-edge"
                                        );
                                    }}
                                    disallowEmptySelection
                                >
                                    <SelectItem key="long-edge">
                                        An langer Seite spiegeln
                                    </SelectItem>
                                    <SelectItem key="short-edge">
                                        An kurzer Seite spiegeln
                                    </SelectItem>
                                </Select>
                            )}
                        </DrawerBody>
                        <DrawerFooter className="flex flex-col gap-3">
                            {downloadStarted && (
                                <Progress
                                    label={
                                        downloadPhase === "qr"
                                            ? "QR-Codes werden generiert …"
                                            : "PDF wird gerendert …"
                                    }
                                    value={downloadProgress}
                                    showValueLabel
                                    disableAnimation
                                    className="w-full"
                                />
                            )}
                            <div className="flex w-full justify-end gap-2">
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Abbrechen
                                </Button>
                                <Button
                                    color="primary"
                                    startContent={
                                        downloadStarted ? null : <IconDownload size={18} />
                                    }
                                    onPress={() => startDownload().then(onClose)}
                                    isLoading={downloadStarted}
                                >
                                    PDF herunterladen
                                </Button>
                            </div>
                        </DrawerFooter>
                    </>
                )}
            </DrawerContent>
        </Drawer>
    );
}
