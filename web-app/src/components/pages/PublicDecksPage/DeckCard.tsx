import { Center, Group, Text } from "@mantine/core";
import classes from "./DeckCard.module.css";

import { Card, Image, Avatar, CardBody, Skeleton, Chip } from "@heroui/react";
import { useMediaQuery } from "@mantine/hooks";
import { MOBILE_BREAKPOINT } from "../Settings";

interface DeckCardProps {
    tags: string[];
    title: string;
    authorName: string;
    authorAvatar: string;
    date: string;
    image: string;
}

export function DeckCard({ data }: { data: DeckCardProps }) {
    const isMobile = useMediaQuery(MOBILE_BREAKPOINT);
    return (
        <Card radius="md" className={classes.card}>
            <CardBody>
                <Group>
                    <Center w={isMobile ? "100%" : ""}>
                        <Image src={data.image} className={classes.image} alt={data.title} />
                    </Center>

                    <div className={classes.body}>
                        <Group gap={5} wrap="wrap">
                            {data.tags.map(tag => (
                                <Chip key={tag} color="primary" size="sm">
                                    <Text tt="uppercase" size="xs">
                                        {tag}
                                    </Text>
                                </Chip>
                            ))}
                        </Group>
                        <Text className={classes.title} mt="xs" mb="md">
                            {data.title}
                        </Text>
                        <Group gap="xs">
                            <Group gap={7}>
                                <Avatar size={"md"} src={data.authorAvatar} alt={data.authorName} />
                                <Text size="xs" c="bright">
                                    {data.authorName}
                                </Text>
                            </Group>

                            <Text span size="xs" opacity={0.8}>
                                •
                            </Text>

                            <Text size="xs" opacity={0.8}>
                                {data.date}
                            </Text>
                        </Group>
                    </div>
                </Group>
            </CardBody>
        </Card>
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
