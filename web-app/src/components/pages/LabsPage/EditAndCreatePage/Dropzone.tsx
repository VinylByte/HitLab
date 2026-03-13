import { useEffect, useRef, useState } from "react";
import { IconCloudUpload, IconDownload, IconX, IconCheck } from "@tabler/icons-react";
import { Group, Stack, Text, useMantineTheme } from "@mantine/core";
import { Dropzone, MIME_TYPES } from "@mantine/dropzone";
import classes from "./Dropzone.module.css";
import { Spinner } from "@heroui/react";

export function DropzoneField({
    onFileUpload,
    currentBlob,
    currentFileName,
    isBusy,
}: {
    onFileUpload: (blob: Blob) => void;
    currentBlob?: Blob | null;
    currentFileName?: string | null;
    isBusy?: boolean;
}) {
    const theme = useMantineTheme();
    const openRef = useRef<() => void>(null);
    const [uploadedFile, setUploadedFile] = useState<{
        name: string;
        size: number;
        type: string;
    } | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleDrop = (files: File[]) => {
        if (files.length > 0) {
            const file = files[0]; // Erste Datei nehmen

            // Datei-Info speichern
            setUploadedFile({
                name: file.name,
                size: file.size,
                type: file.type,
            });

            // Blob direkt verwenden (File ist ein Blob)
            const blob: Blob = file;

            // URL für Vorschau erstellen
            const previewUrl = URL.createObjectURL(file);
            setPreviewUrl(previewUrl);

            // Callback mit Blob und Preview-URL
            onFileUpload(blob);

            // TODO: Hier könntest du auch zu Supabase hochladen
            // uploadToStorage(blob, file.name);
        }
    };

    useEffect(() => {
        // Wenn currentBlob sich ändert, aktualisiere die Vorschau
        if (currentBlob) {
            const previewUrl = URL.createObjectURL(currentBlob);
            setPreviewUrl(previewUrl);

            // Wenn kein uploadedFile gesetzt ist, erstelle Dateiinformationen aus dem Blob
            if (!uploadedFile) {
                setUploadedFile({
                    name: currentFileName
                        ? "Aktuelles Cover"
                        : "cover." + (currentBlob.type.split("/")[1] || "jpg"),
                    size: currentBlob.size,
                    type: currentBlob.type,
                });
            }
        } else {
            setPreviewUrl(null);
            setUploadedFile(null);
        }
        // Aufräumen der URL-Objekte, um Speicherlecks zu vermeiden
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [currentBlob, currentFileName]);

    return (
        <div className={classes.wrapper}>
            <Dropzone
                openRef={openRef}
                onDrop={handleDrop}
                className={classes.dropzone}
                radius="md"
                disabled={isBusy}
                accept={[
                    MIME_TYPES.webp,
                    MIME_TYPES.jpeg,
                    MIME_TYPES.png,
                    MIME_TYPES.svg,
                    "image/jpg",
                ]}
                maxSize={10 * 1024 ** 2}
                aria-label="Drop files here"
            >
                {previewUrl ? (
                    <div style={{ pointerEvents: "none" }}>
                        <Group justify="center" mb="md">
                            <img
                                src={previewUrl}
                                alt={uploadedFile?.name ?? "Cover"}
                                style={{
                                    maxWidth: "200px",
                                    maxHeight: "200px",
                                    borderRadius: theme.radius.md,
                                    border: `2px solid ${theme.colors.green[3]}`,
                                    objectFit: "cover",
                                }}
                            />
                        </Group>
                        {uploadedFile && (
                            <Group justify="center" mb="md">
                                <Group gap="sm">
                                    <IconCheck size={20} color={theme.colors.green[6]} />
                                    <div>
                                        <Text fw={500} size="sm">
                                            {uploadedFile.name}
                                        </Text>
                                        <Text size="xs" c="dimmed">
                                            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                                        </Text>
                                    </div>
                                </Group>
                            </Group>
                        )}
                        <Text ta="center" size="sm" c="dimmed">
                            Klicke hier um eine andere Datei auszuwählen
                        </Text>
                    </div>
                ) : (
                    <div style={{ pointerEvents: "none" }}>
                        <Group justify="center">
                            <Dropzone.Accept>
                                <IconDownload size={50} color={theme.colors.blue[6]} stroke={1.5} />
                            </Dropzone.Accept>
                            <Dropzone.Reject>
                                <IconX size={50} color={theme.colors.red[6]} stroke={1.5} />
                            </Dropzone.Reject>
                            <Dropzone.Idle>
                                <IconCloudUpload size={50} stroke={1.5} className={classes.icon} />
                            </Dropzone.Idle>
                        </Group>

                        <Text ta="center" fw={700} fz="lg" mt="xl">
                            <Dropzone.Accept>Drop files here</Dropzone.Accept>
                            <Dropzone.Reject>Nur Bilder bis zu 10MB erlaubt.</Dropzone.Reject>
                            <Dropzone.Idle>Cover hochladen</Dropzone.Idle>
                        </Text>

                        <Text className={classes.description}>
                            Drag&apos;n&apos;drop ein Bild hierher oder Clicke hier um eine Datei
                            auszuwählen.{" "}
                            <Text c={"dimmed"}>
                                Wir akzeptieren nur <i>.jpg</i>, <i>.webp</i>, <i>.jpeg</i>,{" "}
                                <i>.svg</i> und <i>.png</i> Dateien, die kleiner als 10MB sind.
                            </Text>
                        </Text>
                    </div>
                )}
            </Dropzone>

            {isBusy && (
                <div className={classes.loadingOverlay} aria-live="polite" aria-busy="true">
                    <Stack align="center" gap="xs">
                        <Spinner size="md" />
                        <Text fw={600}>Cover wird verarbeitet...</Text>
                        <Text size="sm" c="dimmed">
                            Bitte warten, bis der Vorgang abgeschlossen ist.
                        </Text>
                    </Stack>
                </div>
            )}
        </div>
    );
}
