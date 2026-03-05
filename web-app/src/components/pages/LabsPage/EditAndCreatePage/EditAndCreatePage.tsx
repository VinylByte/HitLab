import { Container, Title, Stack, Group, Text, Image } from "@mantine/core";
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
import {
    fetchOwnDeckById,
    updateDeckInfo,
    fetchAllTags,
    setDeckTags,
    updateDeckCover,
    type DeckTag,
} from "../../../../services/deckService";
import { createDeck } from "../../../../services/createDeckService";

interface DeckFormData {
    name: string;
    description: string;
    private: boolean;
}

interface EditAndCreatePageProps {
    mode: "create" | "edit";
    deckId?: string;
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

    const [coverBlob, setCoverBlob] = useState<Blob | null>(null);
    const [dropZoneError, setDropZoneError] = useState<string | null>(null);
    const [availableTags, setAvailableTags] = useState<DeckTag[]>([]);
    const [selectedTagKeys, setSelectedTagKeys] = useState<Selection>(new Set());
    const [tagError, setTagError] = useState<string | null>(null);
    const [loadingDeck, setLoadingDeck] = useState(mode === "edit");
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [existingCoverUrl, setExistingCoverUrl] = useState<string | null>(null);
    const [deckLoaded, setDeckLoaded] = useState(false);

    // Lade verfügbare Tags aus der Datenbank
    useEffect(() => {
        fetchAllTags()
            .then(tags => setAvailableTags(tags))
            .catch(err => console.error("Fehler beim Laden der Tags:", err));
    }, []);

    // Lade Deck-Daten für Edit-Modus
    useEffect(() => {
        if (mode !== "edit" || !deckId || deckLoaded) return;
        fetchOwnDeckById(deckId)
            .then(deck => {
                form.setValues({
                    name: deck.name,
                    description: deck.description ?? "",
                    private: deck.visibility === "private",
                });
                setExistingCoverUrl(deck.cover_url);
                setSelectedTagKeys(new Set(deck.tags.map(t => t.id)));
                setDeckLoaded(true);
            })
            .catch(err => {
                console.error("Fehler beim Laden des Decks:", err);
                setSubmitError("Deck konnte nicht geladen werden.");
            })
            .finally(() => setLoadingDeck(false));
    }, [mode, deckId, form, deckLoaded]);

    const handleFileUpload = (blob: Blob) => {
        setDropZoneError(null);
        setCoverBlob(blob);
    };

    const handleTagSelectionChange = (keys: Selection) => {
        setTagError(null);
        setSelectedTagKeys(keys);
    };

    const handleSubmit = async (data: DeckFormData) => {
        const selectedTags =
            selectedTagKeys === "all"
                ? availableTags.map(tag => tag.id)
                : Array.from(selectedTagKeys as Set<string>);

        if (selectedTags.length === 0) {
            setTagError("Bitte wähle mindestens einen Tag aus.");
            return;
        }

        if (mode === "create" && !coverBlob) {
            setDropZoneError("Bitte lade ein Coverbild hoch.");
            return;
        }

        setSubmitting(true);
        setSubmitError(null);

        try {
            if (mode === "create") {
                const newDeckId = await createDeck({
                    name: data.name,
                    description: data.description,
                    private: data.private,
                    cover: coverBlob!,
                });
                await setDeckTags(newDeckId, selectedTags);
                navigate(`/decks/${newDeckId}/songs`);
            } else if (deckId) {
                await updateDeckInfo({
                    deckId,
                    name: data.name,
                    description: data.description,
                    private: data.private,
                });
                await setDeckTags(deckId, selectedTags);
                if (coverBlob) {
                    await updateDeckCover(deckId, coverBlob);
                }
                navigate(`/decks/${deckId}/songs`);
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : "Ein Fehler ist aufgetreten.";
            setSubmitError(message);
        } finally {
            setSubmitting(false);
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

                    {submitError && <Alert color="danger">{submitError}</Alert>}

                    <Group>
                        <Input
                            label="Deck Name"
                            placeholder="z.B. Meine Lieblingssongs"
                            {...form.getInputProps("name")}
                            required
                            className="w-150"
                            isDisabled={loadingDeck}
                        />
                        <Switch
                            thumbIcon={form.values.private ? <IconLock /> : <IconLockOpen />}
                            title="Privat"
                            {...form.getInputProps("private", { type: "checkbox" })}
                            isDisabled={loadingDeck}
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
                        isDisabled={loadingDeck}
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
                            <SelectItem key={tag.id}>{tag.name}</SelectItem>
                        ))}
                    </Select>

                    <Textarea
                        label="Beschreibung"
                        placeholder="Beschreibe dein Deck..."
                        {...form.getInputProps("description")}
                        minRows={3}
                        required
                        isDisabled={loadingDeck}
                    />

                    {existingCoverUrl && !coverBlob && (
                        <div>
                            <Text size="sm" c="dimmed" mb="xs">
                                Aktuelles Coverbild:
                            </Text>
                            <Image src={existingCoverUrl} alt="Deck Cover" maw={200} radius="md" />
                        </div>
                    )}
                    {dropZoneError && <Alert color="danger">{dropZoneError}</Alert>}
                    <DropzoneField currentBlob={coverBlob} onFileUpload={handleFileUpload} />

                    <Group justify="space-between" mt="xl">
                        <Button
                            color="danger"
                            startContent={<IconX />}
                            onPress={() => navigate("/lab")}
                            variant="light"
                            isDisabled={submitting}
                        >
                            Abbrechen
                        </Button>
                        <Button
                            startContent={<IconPencilPlus />}
                            type="submit"
                            color="primary"
                            isLoading={submitting}
                            isDisabled={loadingDeck}
                        >
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
