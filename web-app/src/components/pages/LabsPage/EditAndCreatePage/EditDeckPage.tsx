import { useParams } from "react-router";
import EditAndCreatePage from "./EditAndCreatePage";

export default function EditDeckPage() {
    const { id } = useParams<{ id: string }>();
    return <EditAndCreatePage mode="edit" deckId={id} />;
}
