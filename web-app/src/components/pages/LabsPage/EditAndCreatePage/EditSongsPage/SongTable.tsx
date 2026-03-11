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
import { MOBILE_BREAKPOINT, SMALL_BREAKPOINT } from "../../../../../lib/constants";
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
    const isSmallScreen = useMediaQuery(SMALL_BREAKPOINT);

    // IDs die gerade laden dürfen nicht auswählbar sein
    const disabledKeys = loadingIds ?? new Set<string>();

    return (
        <div className="h-[400px] w-full" style={{ overflow: "hidden" }}>
            <Table
                aria-label="Songs table"
                color={color}
                selectionMode={tableLoading ? "none" : "multiple"}
                selectedKeys={selectedKeys}
                onSelectionChange={onSelectionChange}
                disabledKeys={disabledKeys}
                className="h-[400px]"
                isHeaderSticky
                classNames={{
                    wrapper: "h-[400px] overflow-y-auto overflow-x-hidden",
                    table: "w-full table-fixed",
                }}
            >
                <TableHeader>
                    <TableColumn className={isMobile ? "w-full" : "w-[50%]"} align="center">
                        NAME
                    </TableColumn>
                    <TableColumn hidden={isMobile} className="w-[35%]" align="center">
                        ARTIST
                    </TableColumn>
                    <TableColumn
                        hidden={isMobile || isSmallScreen}
                        className="w-[15%]"
                        align="center"
                    >
                        JAHR
                    </TableColumn>
                </TableHeader>
                <TableBody emptyContent={"Keine Songs vorhanden"}>
                    {tableLoading
                        ? Array.from({ length: 5 }).map((_, i) => (
                              <TableRow key={i}>
                                  <TableCell className="max-w-0">
                                      <Group gap="sm">
                                          <Skeleton className="h-10 w-10 rounded-md flex-shrink-0" />
                                          <Skeleton className="h-5 flex-1 rounded-lg" />
                                      </Group>
                                  </TableCell>
                                  <TableCell hidden={isMobile} className="max-w-0">
                                      <Skeleton className="h-5 w-full rounded-lg" />
                                  </TableCell>
                                  <TableCell hidden={isMobile || isSmallScreen}>
                                      <Skeleton className="h-5 w-12 rounded-lg" />
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
                                      <TableCell className={isMobile ? "w-100" : ""}>
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
                                              <Text
                                                  truncate="end"
                                                  className={
                                                      "max-w-[18ch] xs:max-w-[10ch] sm:max-w-[20ch] md:max-w-[10ch] lg:max-w-[15ch] xl:max-w-[25ch]"
                                                  }
                                              >
                                                  {song.title}
                                              </Text>
                                          </Group>
                                      </TableCell>
                                      <TableCell hidden={isMobile}>
                                          <span className="block truncate max-w-[5ch] md:max-w-[9ch] lg:max-w-[15ch] xl:max-w-[25ch]">
                                              {song.artist}
                                          </span>
                                      </TableCell>
                                      <TableCell hidden={isMobile || isSmallScreen}>
                                          {song.year}
                                      </TableCell>
                                  </TableRow>
                              );
                          })}
                </TableBody>
            </Table>
        </div>
    );
}
