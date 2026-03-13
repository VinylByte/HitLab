import { Stack } from "@mantine/core";
import DecksTableSkeleton from "./DecksTableSkeleton";
import DecksTable from "./DecksTable";
import { DeckModal } from "./ViewDeckModal";
import { useEffect, useState } from "react";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { deleteDeckById } from "../../../services/deckService";
import { useOwnDecks } from "../../../hooks/useOwnDecks";
import type { OwnDeck } from "../../../types/deck";

const ViewDeckModal = ({
    isDeckModalOpen,
    setIsDeckModalOpen,
    selectedDeck,
}: {
    isDeckModalOpen: boolean;
    setIsDeckModalOpen: (open: boolean) => void;
    selectedDeck: OwnDeck | null;
}) => {
    return (
        <div>
            <DeckModal
                isOpen={isDeckModalOpen}
                onOpenChange={setIsDeckModalOpen}
                deck={selectedDeck}
            />
        </div>
    );
};

export default function LabsPage() {
    const { ownDecks, loading, error, removeDeck } = useOwnDecks();
    const [searchParams] = useSearchParams();
    const { deckId } = useParams();
    const [selectedDeck, setSelectedDeck] = useState<OwnDeck | null>(null);
    const [isDeckModalOpen, setIsDeckModalOpen] = useState(false);

    const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);

    const navigate = useNavigate();

    const handleDeckModalOpenChange = (isOpen: boolean) => {
        setIsDeckModalOpen(isOpen);
        if (!isOpen && deckId) {
            navigate({
                pathname: "/lab",
                search: searchParams.toString() ? `?${searchParams.toString()}` : "",
            });
        }
    };

    const viewDeck = (deck: OwnDeck) => {
        navigate({
            pathname: `/lab/${deck.id}/view`,
            search: searchParams.toString() ? `?${searchParams.toString()}` : "",
        });
    };

    const editDeck = (deck: OwnDeck) => {
        // console.log("Editing deck:", deck);
        navigate(`/decks/${deck.id}/edit`);
    };

    const createDeck = () => {
        // console.log("Creating new deck");
        navigate("/decks/new");
    };

    const deleteDeck = (deck: OwnDeck) => {
        setSelectedDeck(deck);
        setIsConfirmDeleteModalOpen(true);
        // console.log("Deleting deck:", deck);
    };

    const deleteDeckConfirmed = () => {
        // console.log("Deck deleted:", selectedDeck);
        if (selectedDeck) {
            deleteDeckById(selectedDeck.id);
            removeDeck(selectedDeck.id);
        } else console.error("No Deck Id is selected!");
        setSelectedDeck(null);
    };

    useEffect(() => {
        if (!deckId) {
            setSelectedDeck(null);
            setIsDeckModalOpen(false);
            return;
        }

        const deckFromList = ownDecks.find(deck => deck.id === deckId);
        if (!deckFromList) return;

        setSelectedDeck(deckFromList);
        setIsDeckModalOpen(true);
    }, [deckId, ownDecks]);

    return (
        <div className="labs-page">
            <ViewDeckModal
                isDeckModalOpen={isDeckModalOpen}
                setIsDeckModalOpen={handleDeckModalOpenChange}
                selectedDeck={selectedDeck}
            />
            <ConfirmDeleteModal
                isOpen={isConfirmDeleteModalOpen}
                onOpenChange={setIsConfirmDeleteModalOpen}
                onConfirm={deleteDeckConfirmed}
                deckName={selectedDeck?.name || ""}
            />
            <Stack mt={"lg"} p={"xl"}>
                {loading ? (
                    <DecksTableSkeleton />
                ) : error ? (
                    <div>{error.message}</div>
                ) : (
                    <DecksTable
                        decks={ownDecks}
                        viewDeck={viewDeck}
                        editDeck={editDeck}
                        createDeck={createDeck}
                        deleteDeck={deleteDeck}
                    />
                )}
            </Stack>
        </div>
    );
}
