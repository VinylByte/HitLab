import { Group, Text } from "@mantine/core";
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Avatar,
    Spinner,
    Skeleton,
} from "@heroui/react";
import type { Selection } from "@heroui/react";
import { MOBILE_BREAKPOINT } from "../../../Settings";
import { useMediaQuery } from "@mantine/hooks";

/** Display-only row type shared by Spotify search results and DB songs. */
export type SongTableItem = {
    id: string;
    title: string;
    artist: string;
    year: number;
    thumbnail_url: string | null;
};

type TableColor = "primary" | "secondary" | "success" | "danger" | "warning" | undefined;

interface SongTableProps {
    songs: SongTableItem[];
    color: TableColor;
    selectedKeys?: Selection;
    onSelectionChange?: (keys: Selection) => void;
    loadingIds?: Set<string>;
    tableLoading?: boolean;
}

export default function SongTable({
    songs,
    color,
    selectedKeys,
    onSelectionChange,
    loadingIds,
    tableLoading,
}: SongTableProps) {
    const isMobile = useMediaQuery(MOBILE_BREAKPOINT);

    // IDs die gerade laden dürfen nicht auswählbar sein
    const disabledKeys = loadingIds ?? new Set<string>();

    return (
        <div>
            <Table
                aria-label="Songs table"
                color={color}
                selectionMode={tableLoading ? "none" : "multiple"}
                selectedKeys={selectedKeys}
                onSelectionChange={onSelectionChange}
                disabledKeys={disabledKeys}
                className={isMobile ? "h-80" : "h-100"}
                isHeaderSticky
            >
                <TableHeader>
                    <TableColumn>NAME</TableColumn>
                    <TableColumn>ARTIST</TableColumn>
                    <TableColumn hidden={isMobile}>JAHR</TableColumn>
                </TableHeader>
                <TableBody emptyContent={"Keine Songs vorhanden"}>
                    {tableLoading
                        ? Array.from({ length: 5 }).map(() => (
                              <TableRow>
                                  <TableCell>
                                      <Group>
                                          <Skeleton className="h-10 w-10 rounded-md" />
                                          <Skeleton className="h-5 w-15 rounded-lg" />
                                      </Group>
                                  </TableCell>
                                  <TableCell>
                                      <Skeleton className="h-5 w-20 rounded-lg" />
                                  </TableCell>
                                  <TableCell hidden={isMobile}>
                                      <Skeleton className="h-5 w-25 rounded-lg" />
                                  </TableCell>
                              </TableRow>
                          ))
                        : songs.map((song, index) => {
                              const isLoading = loadingIds?.has(song.id) ?? false;
                              return (
                                  <TableRow
                                      key={song.id || index}
                                      className={isLoading ? "opacity-50" : ""}
                                  >
                                      <TableCell>
                                          <Group gap="sm">
                                              {isLoading ? (
                                                  <Spinner size="sm" />
                                              ) : (
                                                  <Avatar
                                                      src={song.thumbnail_url || undefined}
                                                      alt={song.title}
                                                      radius="md"
                                                  />
                                              )}
                                              <Text>{song.title}</Text>
                                          </Group>
                                      </TableCell>
                                      <TableCell>{song.artist}</TableCell>
                                      <TableCell hidden={isMobile}>{song.year}</TableCell>
                                  </TableRow>
                              );
                          })}
                </TableBody>
            </Table>
        </div>
    );
}
