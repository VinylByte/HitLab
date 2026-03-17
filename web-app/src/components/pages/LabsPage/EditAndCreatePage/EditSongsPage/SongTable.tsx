import { Text } from "@mantine/core";
import { Avatar, Spinner, Skeleton, Checkbox } from "@heroui/react";
import type { Selection } from "@heroui/react";
import { MOBILE_BREAKPOINT, SMALL_BREAKPOINT } from "../../../../../lib/constants";
import { useMediaQuery } from "@mantine/hooks";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef, useCallback, useMemo, memo } from "react";

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

const ROW_HEIGHT = 52;
const TABLE_HEIGHT = 400;
const HEADER_HEIGHT = 42;

// Static map so Tailwind includes these classes at build time
const BG_SELECTED: Record<"primary" | "secondary" | "success" | "danger" | "warning", string> = {
    primary: "bg-primary/20",
    secondary: "bg-secondary/20",
    success: "bg-success/20",
    danger: "bg-danger/20",
    warning: "bg-warning/20",
};

/** Memoized row component: only re-renders when song, selection, or loading state changes */
interface VirtualSongRowProps {
    song: SongTableItem;
    virtualStart: number;
    virtualSize: number;
    isSelected: boolean;
    isLoading: boolean;
    color: TableColor;
    isMobile: boolean;
    isSmallScreen: boolean;
    onRowClick: (id: string) => void;
    selectedBgClass: string;
}

const VirtualSongRow = memo(function VirtualSongRow({
    song,
    virtualStart,
    virtualSize,
    isSelected,
    isLoading,
    color,
    isMobile,
    isSmallScreen,
    onRowClick,
    selectedBgClass,
}: VirtualSongRowProps) {
    const handleClick = useCallback(() => {
        if (!isLoading) {
            onRowClick(song.id);
        }
    }, [song.id, isLoading, onRowClick]);

    return (
        <div
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: virtualSize,
                transform: `translateY(${virtualStart}px)`,
            }}
            className={`flex items-center px-3 border-b border-divider transition-colors ${
                isLoading ? "opacity-50" : "cursor-pointer hover:bg-default-100"
            } ${isSelected ? selectedBgClass : ""}`}
            onClick={handleClick}
        >
            {/* Checkbox */}
            <div className="w-10 flex-shrink-0 flex items-center justify-center pointer-events-none">
                <Checkbox
                    isSelected={isSelected}
                    isDisabled={isLoading}
                    color={color}
                    aria-label={`Select ${song.title}`}
                />
            </div>

            {/* Title + Thumbnail */}
            <div className={`flex items-center gap-2 min-w-0 ${isMobile ? "flex-1" : "w-[50%]"}`}>
                {isLoading ? (
                    <Spinner size="sm" className="flex-shrink-0" />
                ) : (
                    <Avatar
                        src={song.thumbnail_url || undefined}
                        alt={song.title}
                        radius="md"
                        className="flex-shrink-0"
                    />
                )}
                <Text
                    truncate="end"
                    className="max-w-[18ch] xs:max-w-[10ch] sm:max-w-[20ch] md:max-w-[10ch] lg:max-w-[15ch] xl:max-w-[25ch]"
                >
                    {song.title}
                </Text>
            </div>

            {/* Artist */}
            {!isMobile && (
                <div className="w-[35%] truncate text-sm text-default-600">{song.artist}</div>
            )}

            {/* Year */}
            {!isMobile && !isSmallScreen && (
                <div className="w-[15%] text-sm text-default-600">{song.year}</div>
            )}
        </div>
    );
});

export default function SongTable({
    songs,
    color = "primary",
    selectedKeys,
    onSelectionChange,
    loadingIds,
    tableLoading,
}: SongTableProps) {
    const parentRef = useRef<HTMLDivElement>(null);
    const isMobile = useMediaQuery(MOBILE_BREAKPOINT);
    const isSmallScreen = useMediaQuery(SMALL_BREAKPOINT);

    const rowVirtualizer = useVirtualizer({
        count: songs.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => ROW_HEIGHT,
        overscan: 5,
    });

    const selectedSet = useMemo(
        () => (selectedKeys instanceof Set ? (selectedKeys as Set<string>) : new Set<string>()),
        [selectedKeys]
    );

    const allSelectableIds = useMemo(
        () => songs.filter(s => !loadingIds?.has(s.id)).map(s => s.id),
        [songs, loadingIds]
    );

    const isAllSelected =
        allSelectableIds.length > 0 && allSelectableIds.every(id => selectedSet.has(id));
    const isIndeterminate = !isAllSelected && allSelectableIds.some(id => selectedSet.has(id));

    const handleRowClick = useCallback(
        (id: string) => {
            const newSet = new Set(selectedSet);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            onSelectionChange?.(newSet);
        },
        [selectedSet, onSelectionChange]
    );

    const handleSelectAll = useCallback(() => {
        if (isAllSelected) {
            onSelectionChange?.(new Set());
        } else {
            onSelectionChange?.("all");
        }
    }, [isAllSelected, onSelectionChange]);

    const selectedBgClass = BG_SELECTED[color ?? "primary"];

    if (tableLoading) {
        return (
            <div
                className="w-full rounded-xl border border-divider overflow-hidden"
                style={{ height: TABLE_HEIGHT }}
            >
                <div
                    className="flex items-center px-3 bg-default-100 border-b border-divider"
                    style={{ height: HEADER_HEIGHT }}
                >
                    <div className="w-10" />
                    <span className="text-xs font-semibold text-default-500 uppercase">NAME</span>
                </div>
                {Array.from({ length: 6 }).map((_, i) => (
                    <div
                        key={i}
                        className="flex items-center px-3 gap-3 border-b border-divider"
                        style={{ height: ROW_HEIGHT }}
                    >
                        <div className="w-10" />
                        <Skeleton className="h-10 w-10 rounded-md flex-shrink-0" />
                        <Skeleton className="h-5 flex-1 rounded-lg" />
                        {!isMobile && <Skeleton className="h-5 w-1/3 rounded-lg" />}
                        {!isMobile && !isSmallScreen && (
                            <Skeleton className="h-5 w-12 rounded-lg" />
                        )}
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div
            className="w-full rounded-xl border border-divider overflow-hidden flex flex-col"
            style={{ height: TABLE_HEIGHT }}
        >
            {/* Sticky header */}
            <div
                className="flex items-center px-3 bg-default-100 border-b border-divider flex-shrink-0"
                style={{ height: HEADER_HEIGHT }}
            >
                <div className="w-10 flex-shrink-0 flex items-center justify-center">
                    <Checkbox
                        isSelected={isAllSelected}
                        isIndeterminate={isIndeterminate}
                        color={color}
                        isDisabled={songs.length === 0}
                        onValueChange={handleSelectAll}
                        aria-label="Select all"
                    />
                </div>
                <div
                    className={`text-xs font-semibold text-default-500 uppercase ${
                        isMobile ? "flex-1" : "w-[50%]"
                    }`}
                >
                    NAME
                </div>
                {!isMobile && (
                    <div className="w-[35%] text-xs font-semibold text-default-500 uppercase">
                        ARTIST
                    </div>
                )}
                {!isMobile && !isSmallScreen && (
                    <div className="w-[15%] text-xs font-semibold text-default-500 uppercase">
                        JAHR
                    </div>
                )}
            </div>

            {/* Virtualized body - only visible rows are in the DOM */}
            <div ref={parentRef} className="flex-1 overflow-y-auto overflow-x-hidden">
                {songs.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-default-400 text-sm">
                        Keine Songs vorhanden
                    </div>
                ) : (
                    <div
                        style={{
                            height: rowVirtualizer.getTotalSize(),
                            position: "relative",
                        }}
                    >
                        {rowVirtualizer.getVirtualItems().map(virtualRow => {
                            const song = songs[virtualRow.index];
                            const isLoading = loadingIds?.has(song.id) ?? false;
                            const isSelected = selectedSet.has(song.id);

                            return (
                                <VirtualSongRow
                                    key={song.id}
                                    song={song}
                                    virtualStart={virtualRow.start}
                                    virtualSize={virtualRow.size}
                                    isSelected={isSelected}
                                    isLoading={isLoading}
                                    color={color}
                                    isMobile={isMobile}
                                    isSmallScreen={isSmallScreen}
                                    onRowClick={handleRowClick}
                                    selectedBgClass={selectedBgClass}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
