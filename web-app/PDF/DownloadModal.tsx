import React, { useEffect, useMemo } from "react";
import type { PublicDeckDTO, Song } from "../src/services/deckService";
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
} from "@heroui/react";
import { IconDownload } from "@tabler/icons-react";
import { Center, Title, Text } from "@mantine/core";
import QRCode from "qrcode";
import { PDFFactory } from "./PDF-Creator/PDFFactory";
import { pdf } from "@react-pdf/renderer";
import type { Card, BackgroundConfig } from "./interfaces";
import { DESIGNS } from "./HardDesigns";
import { getSelectableDesigns, resolveDesignSelection } from "./DesignResolver";

const getURL = ({ songId }: { songId: string }) => {
    return window.location.origin + `/play/${songId}`;
};

export interface DownloadModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    songs: Song[];
    deck: PublicDeckDTO;
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

    const selectableDesigns = useMemo(() => getSelectableDesigns(DESIGNS), []);

    // Reset download state when modal is opened/closed
    useEffect(() => {
        setDownloadStarted(false);
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
    const generateQRCodes = async (items: Card[]): Promise<Card[]> => {
        const result: Card[] = [];
        for (let i = 0; i < items.length; i++) {
            const c = items[i];
            try {
                const dataUri = await QRCode.toDataURL(c.url, {
                    margin: 1,
                    width: 250,
                    color: { dark: "#000000", light: "#ffffff" },
                });
                result.push({ ...c, qrDataUri: dataUri } as Card);
            } catch (_err) {
                result.push(c);
            }
        }
        return result;
    };

    // remove async useMemo to avoid race conditions; create blob on-demand in startDownload

    const startDownload = async () => {
        // Generate QR codes and create PDF blob
        setDownloadStarted(true);
        const sourceCards = await generateQRCodes(cards);
        const selectedDesignPresets = resolveDesignSelection(selectedDesign, DESIGNS);

        const frontBackgrounds: BackgroundConfig[] = selectedDesignPresets
            .map(design => design.frontBackground ?? design.background)
            .filter((background): background is BackgroundConfig => Boolean(background));

        const backBackgrounds: BackgroundConfig[] = selectedDesignPresets
            .map(design => design.backBackground ?? design.background ?? design.frontBackground)
            .filter((background): background is BackgroundConfig => Boolean(background));

        const blob = await pdf(
            <PDFFactory
                frontBackground={frontBackgrounds}
                backBackground={backBackgrounds}
                cards={sourceCards}
                type={selectedPrintType}
                bindingMode={selectedBindingMode}
            />
        ).toBlob();

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${deck.name}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setDownloadStarted(false);
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
                                description="Wenn du mehrere Designs auswählst, wechseln sich die designs pro Karte ab."
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
                                        <div className="flex items-center gap-3">
                                            <div>
                                                <Text fw={"600"}>{design.name}</Text>
                                                <div className="text-sm text-gray-500">
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
                        <DrawerFooter>
                            <Button color="danger" variant="light" onPress={onClose}>
                                Abbrechen
                            </Button>
                            <Button
                                color="primary"
                                startContent={downloadStarted ? null : <IconDownload size={18} />}
                                onPress={() => startDownload().then(onClose)}
                                isLoading={downloadStarted}
                            >
                                PDF herunterladen
                            </Button>
                        </DrawerFooter>
                    </>
                )}
            </DrawerContent>
        </Drawer>
    );
}
