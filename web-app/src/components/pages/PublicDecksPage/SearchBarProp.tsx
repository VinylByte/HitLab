import { Input } from "@heroui/react";
import { IconSearch } from "@tabler/icons-react";


export default function SearchBar({search_str, setSearchStr}: {search_str: string, setSearchStr: (str: string) => void}) {
    return (
        <div className="mb-4">
            <Input
                placeholder="Search decks..."
                value={search_str}
                startContent={<IconSearch size={16} />}
                onChange={(e) => setSearchStr(e.target.value)}
            />
        </div>
    );
}
