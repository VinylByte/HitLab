import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Skeleton,
} from "@heroui/react";
import { Center } from "@mantine/core";
import { PAGINATION_BREAKPOINT } from "../Settings";

const skeletonColumns = ["TITLE", "SONG ANZAHL", "STATUS", "ERSTELLT AM", "ACTIONS"];

export default function DecksTableSkeleton() {
    return (
        <div>
            <Skeleton className="h-10 w-full rounded-lg mb-4" />
            <Table
                isStriped
                aria-label="Deck table loading skeleton"
                classNames={{ base: "w-full" }}
            >
                <TableHeader>
                    {skeletonColumns.map(column => (
                        <TableColumn key={column}>
                            <Center>{column}</Center>
                        </TableColumn>
                    ))}
                </TableHeader>
                <TableBody>
                    {Array.from({ length: PAGINATION_BREAKPOINT }).map((_, rowIndex) => (
                        <TableRow key={rowIndex}>
                            {skeletonColumns.map((column, columnIndex) => (
                                <TableCell key={`${column}-${columnIndex}`}>
                                    <Center>
                                        <Skeleton
                                            className={
                                                column === "ACTIONS"
                                                    ? "h-5 w-20 rounded-md"
                                                    : "h-5 w-32 rounded-md"
                                            }
                                        />
                                    </Center>
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
