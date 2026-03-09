import { Stack } from "@mantine/core";
import DecksTableSkeleton from "./DecksTableSkeleton";
import DecksTable from "./DecksTable";
import { DeckModal } from "./ViewDeckModal";
import { useState } from "react";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import { useNavigate } from "react-router";
import { deleteDeckById, type OwnDeckDTO } from "../../../services/deckService";
import { useOwnDecks } from "../../../hooks/useOwnDecks";

const ViewDeckModal = ({
    isDeckModalOpen,
    setIsDeckModalOpen,
    selectedDeck,
}: {
    isDeckModalOpen: boolean;
    setIsDeckModalOpen: (open: boolean) => void;
    selectedDeck: OwnDeckDTO | null;
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
    const [selectedDeck, setSelectedDeck] = useState<OwnDeckDTO | null>(null);
    const [isDeckModalOpen, setIsDeckModalOpen] = useState(false);

    const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);

    const navigate = useNavigate();

    const viewDeck = (deck: OwnDeckDTO) => {
        console.log("Viewing deck:", deck);
        setSelectedDeck(deck);
        setIsDeckModalOpen(true);
    };

    const editDeck = (deck: OwnDeckDTO) => {
        // console.log("Editing deck:", deck);
        navigate(`/decks/${deck.id}/edit`);
    };

    const createDeck = () => {
        // console.log("Creating new deck");
        navigate("/decks/new");
    };

    const deleteDeck = (deck: OwnDeckDTO) => {
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

    return (
        <div className="labs-page">
            <ViewDeckModal
                isDeckModalOpen={isDeckModalOpen}
                setIsDeckModalOpen={setIsDeckModalOpen}
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
