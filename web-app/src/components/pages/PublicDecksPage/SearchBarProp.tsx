import { Input } from "@heroui/react";
import { IconSearch } from "@tabler/icons-react";
import { useSearchParams } from "react-router";


export default function SearchBar() {
    const [searchParams, setSearchParams] = useSearchParams();

    const updateSearch = (str: string) => {
        setSearchParams({query: str});
    }

    return (
        <div className="mb-4">
            <Input
                placeholder="Decks durchsuchen..."
                value={searchParams.get("query") || ""}
                startContent={<IconSearch size={16} />}
                onChange={(e) => updateSearch(e.target.value)}
            />
        </div>
    );
}
