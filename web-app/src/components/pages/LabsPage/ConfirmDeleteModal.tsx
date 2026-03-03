import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/react";
import { IconTrash, IconX } from "@tabler/icons-react";
import { Text } from "@mantine/core";

export default function ConfirmDeleteModal({
    isOpen,
    onOpenChange,
    onConfirm,
    deckName,
}: {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    deckName: string;
}) {
    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="md">
            <ModalContent>
                {onClose => (
                    <>
                        <ModalHeader>Deck Löschen</ModalHeader>
                        <ModalBody>
                            <Text>
                                Möchtest du das Deck <span className="font-bold">{deckName}</span> wirklich
                                löschen? <br/> <br/> Diese Aktion kann nicht rückgängig gemacht werden!
                            </Text>
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                startContent={<IconX />}
                                variant="light"
                                onPress={() => onClose()}
                            >
                                Abbrechen
                            </Button>
                            <Button
                                startContent={<IconTrash />}
                                variant="solid"
                                color="danger"
                                onPress={() => {
                                    onConfirm();
                                    onClose();
                                }}
                            >
                                Löschen
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
