import { Center, Group, Text } from "@mantine/core";
import classes from "./DeckCard.module.css";

import { Card, Image, Avatar, CardBody, Skeleton, Chip } from "@heroui/react";
import { useMediaQuery } from "@mantine/hooks";
import { MOBILE_BREAKPOINT } from "../Settings";
import type { PublicDeckDTO } from "../../../services/deckService";
import { useNavigate, useSearchParams } from "react-router";

export function DeckCard({ data }: { data: PublicDeckDTO }) {
    const isMobile = useMediaQuery(MOBILE_BREAKPOINT);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const handleClick = () => {
        navigate({
            pathname: `/decks/${data.id}/view`,
            search: searchParams.toString() ? `?${searchParams.toString()}` : "",
        });
    };

    return (
        <div>
            <Card radius="md" className={classes.card}>
                <CardBody onClick={handleClick}>
                    <Group>
                        <Center w={isMobile ? "100%" : ""}>
                            <Image
                                src={data.cover_url ?? undefined}
                                className={classes.image}
                                alt={data.name}
                                removeWrapper
                            />
                        </Center>

                        <div className={classes.body}>
                            <Group gap={5} wrap="wrap">
                                {data.tags.map(tag => (
                                    <Chip key={tag.id} color="primary" size="sm">
                                        <Text tt="uppercase" size="xs">
                                            {tag.name}
                                        </Text>
                                    </Chip>
                                ))}
                            </Group>
                            <Text className={classes.title} mt="xs" mb="md">
                                {data.name}
                            </Text>
                            <Group gap="xs">
                                <Group gap={7}>
                                    <Avatar
                                        size={"md"}
                                        src={data.owner.avatar_url ?? undefined}
                                        alt={data.owner.display_name ?? undefined}
                                    />
                                    <Text size="xs" c="bright">
                                        {data.owner.display_name}
                                    </Text>
                                </Group>

                                <Text span size="xs" opacity={0.8}>
                                    •
                                </Text>

                                <Text size="xs" opacity={0.8}>
                                    {data.created_at}
                                </Text>
                            </Group>
                        </div>
                    </Group>
                </CardBody>
            </Card>
        </div>
    );
}

export function DeckCardSkeleton() {
    const isMobile = useMediaQuery(MOBILE_BREAKPOINT);
    return (
        <Card radius="md" className={classes.card}>
            <CardBody>
                <Group w={"100%"}>
                    <Center w={isMobile ? "100%" : ""}>
                        <Skeleton
                            className={
                                isMobile
                                    ? "w-70 h-42 rounded-lg mb-2 mt-2"
                                    : "h-27 w-50 rounded-lg mb-4 mt-4"
                            }
                        />
                    </Center>
                    <div className={classes.body}>
                        <Skeleton className="h-4 w-1/2 mb-2" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <Group gap="xs">
                            <Group gap={7}>
                                <Skeleton className="flex rounded-full w-12 h-12" />
                                <Skeleton className="h-4 w-24" />
                            </Group>
                            <Skeleton className="h-4 w-12" />
                        </Group>
                    </div>
                </Group>
            </CardBody>
        </Card>
    );
}
