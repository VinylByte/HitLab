import { Center, Container, Stack, Text, Title } from "@mantine/core";
import { Button } from "@heroui/react";
import classes from "./PlayHeroHeader.module.css";
import { IconBrandAppleArcade, IconCards } from "@tabler/icons-react";
import { useMediaQuery } from "@mantine/hooks";
import { MOBILE_BREAKPOINT } from "../../../Settings";
import { useLocation, useNavigate } from "react-router";
import { useEffect } from "react";

export default function PlayHeroHeader() {
    const isMobile = useMediaQuery(MOBILE_BREAKPOINT);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const previousBodyOverflow = document.body.style.overflow;
        const previousHtmlOverflow = document.documentElement.style.overflow;

        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousBodyOverflow;
            document.documentElement.style.overflow = previousHtmlOverflow;
        };
    }, []);

    return (
        <div className={classes.rootHero}>
            <Container size="lg" h="calc(100vh - 16rem)">
                <Center w={isMobile ? "100%" : "50%"} h={"100%"}>
                    <div className={classes.content}>
                        <Stack>
                            <Title className={classes.title}>
                                Hast du bereits ein{" "}
                                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                    Deck
                                </span>
                                ?
                            </Title>

                            <Text className={classes.description} c={"white"} mb={"lg"}>
                                Dann starte sofort mit dem Spielen! Logge dich ein, um die Songs
                                abspielen zu können oder erstelle zuerst dein eigenes Deck.
                            </Text>

                            <Button
                                color="primary"
                                startContent={<IconBrandAppleArcade />}
                                variant="shadow"
                                className={" w-full h-12"}
                                onPress={() => {
                                    navigate("/login", { state: { from: location } });
                                }}
                            >
                                <Text fw="bold">Spielen Starten</Text>
                            </Button>
                            <Button
                                color="primary"
                                startContent={<IconCards />}
                                variant="flat"
                                className={" w-full h-12"}
                                onPress={() => {
                                    navigate("/lab", { state: { from: location } });
                                }}
                            >
                                <Text fw="bold">Deck erstellen</Text>
                            </Button>
                        </Stack>
                    </div>
                </Center>
            </Container>
        </div>
    );
}
