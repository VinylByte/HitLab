import { Container, Title, Stack, Group } from "@mantine/core";
import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { useForm } from "@mantine/form";
import {
    Input,
    Textarea,
    Switch,
    Button,
    Alert,
    Chip,
    Select,
    SelectItem,
    type Selection,
} from "@heroui/react";
import { IconLock, IconLockOpen, IconPencilPlus, IconX } from "@tabler/icons-react";
import { DropzoneField } from "./Dropzone";

interface DeckFormData {
    name: string;
    description: string;
    private: boolean;
    cover_url: string;
}

interface EditAndCreatePageProps {
    mode: "create" | "edit";
    deckId?: string;
}

interface Song {
    id: number;
    title: string;
    artist: string;
    year?: number;
    cover_url?: string;
}

interface DeckTagOption {
    key: string;
    label: string;
}

export default function EditAndCreatePage({ mode, deckId }: EditAndCreatePageProps) {
    const navigate = useNavigate();
    const form = useForm({
        initialValues: {
            name: "",
            description: "",
            private: true,
        } as DeckFormData,
        validate: {
            name: value => (value.trim().length > 0 ? null : "Name ist erforderlich"),
        },
    });

    const [, setSongList] = useState<Song[]>([]);
    const [coverBlob, setCoverBlob] = useState<Blob | null>(null);
    const [dropZoneError, setDropZoneError] = useState<string | null>(null);
    const [availableTags] = useState<DeckTagOption[]>([
        { key: "rock", label: "Rock" },
        { key: "pop", label: "Pop" },
        { key: "hiphop", label: "Hip-Hop" },
        { key: "jazz", label: "Jazz" },
        { key: "electronic", label: "Electronic" },
    ]);
    const [selectedTagKeys, setSelectedTagKeys] = useState<Selection>(new Set());
    const [tagError, setTagError] = useState<string | null>(null);

    // Lade Deck-Daten für Edit-Modus
    useEffect(() => {
        if (mode === "edit" && deckId) {
            // TODO: Deck-Daten aus der Datenbank laden
            console.log("Loading deck data for ID:", deckId);
            // Beispieldaten für Demo:
            form.setValues({
                name: "Beispiel Deck",
                description: "Dies ist ein Beispiel-Deck zum Bearbeiten",
                private: false,
                cover_url: "https://example.com/cover.jpg",
            });
            setSongList([
                {
                    id: 1,
                    title: "Song 1",
                    artist: "Artist A",
                    year: 2020,
                    cover_url: "https://example.com/song1.jpg",
                },
                {
                    id: 2,
                    title: "Song 2",
                    artist: "Artist B",
                    year: 2019,
                    cover_url: "https://example.com/song2.jpg",
                },
            ]);
        }
    }, [mode, deckId]);

    const handleFileUpload = (blob: Blob) => {
        setDropZoneError(null);
        setCoverBlob(blob);
        // TODO: Hier können Sie den Blob zu Supabase hochladen
        // uploadToStorage(blob);
    };

    const handleTagSelectionChange = (keys: Selection) => {
        setTagError(null);
        setSelectedTagKeys(keys);
    };

    const handleSubmit = (data: DeckFormData) => {
        const selectedTags =
            selectedTagKeys === "all"
                ? availableTags.map(tag => tag.key)
                : Array.from(selectedTagKeys as Set<string>);

        if (mode === "create" && selectedTags.length === 0) {
            setTagError("Bitte wähle mindestens einen Tag aus.");
            return;
        }

        if (!coverBlob) {
            setDropZoneError("Bitte lade ein Coverbild hoch.");
            return;
        }
        if (mode === "create") {
            console.log("Creating deck:", data, { tags: selectedTags });
            // TODO: Deck zu Datenbank hinzufügen und die neue ID erhalten
            // Nach dem Erstellen zur EditSongsPage mit der neuen Deck ID navigieren
            // const newDeckId = await createDeck(data);
            // navigate(`/decks/${newDeckId}/songs`);

            // Für jetzt: Platzhalter Navigation (würde mit echter ID ersetzt)
            alert("Deck würde jetzt erstellt und Songs-Bearbeitung würde folgen");
        } else {
            console.log("Updating deck:", deckId, data, { tags: selectedTags });
            // TODO: Deck in Datenbank aktualisieren
            // await updateDeck(deckId, data);

            // Nach dem Bearbeiten zur EditSongsPage navigieren
            if (deckId) {
                navigate(`/decks/${deckId}/songs`);
            }
        }
    };

    return (
        <Container size="md" py="xl">
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="lg">
                    <div>
                        <Title order={2}>
                            {mode === "create" ? "Neues Deck erstellen" : "Deck bearbeiten"}
                        </Title>
                    </div>

                    <Group>
                        <Input
                            label="Deck Name"
                            placeholder="z.B. Meine Lieblingssongs"
                            {...form.getInputProps("name")}
                            required
                            className="w-150"
                        />
                        <Switch
                            thumbIcon={form.values.private ? <IconLock /> : <IconLockOpen />}
                            title="Privat"
                            {...form.getInputProps("private", { type: "checkbox" })}
                        >
                            Privat
                            <p className="text-small text-default-500">
                                {!form.values.private
                                    ? "Dieses Deck ist für alle sichtbar"
                                    : "Dieses Deck ist privat"}
                            </p>
                        </Switch>
                    </Group>

                    <Select
                        label="Tags"
                        placeholder="Wähle Tags für dein Deck"
                        selectionMode="multiple"
                        selectedKeys={selectedTagKeys}
                        onSelectionChange={handleTagSelectionChange}
                        isInvalid={!!tagError}
                        errorMessage={tagError ?? undefined}
                        renderValue={items => (
                            <div className="flex flex-wrap gap-2">
                                {items.map(item => (
                                    <Chip key={item.key} size="sm" variant="flat" color="primary">
                                        {item.textValue}
                                    </Chip>
                                ))}
                            </div>
                        )}
                    >
                        {availableTags.map(tag => (
                            <SelectItem key={tag.key}>{tag.label}</SelectItem>
                        ))}
                    </Select>

                    <Textarea
                        label="Beschreibung"
                        placeholder="Beschreibe dein Deck..."
                        {...form.getInputProps("description")}
                        minRows={3}
                        required
                    />
                    {dropZoneError && <Alert color="danger">{dropZoneError}</Alert>}
                    <DropzoneField currentBlob={coverBlob} onFileUpload={handleFileUpload} />

                    <Group justify="space-between" mt="xl">
                        <Button
                            color="danger"
                            startContent={<IconX />}
                            onPress={() => navigate("/lab")}
                            variant="light"
                        >
                            Abbrechen
                        </Button>
                        <Button startContent={<IconPencilPlus />} type="submit" color="primary">
                            {mode === "create"
                                ? "Deck erstellen und Songs hinzufügen"
                                : "Änderungen speichern und Songs bearbeiten"}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Container>
    );
}
