import { IconCheck } from "@tabler/icons-react";
import { Container, Group, Image, List, Text, ThemeIcon, Title } from "@mantine/core";
import image from "../../../assets/VinylByteLogo.png";
import classes from "./HeroBullets.module.css";
import { useLocation, useNavigate } from "react-router";
import { useMediaQuery } from "@mantine/hooks";
import { MOBILE_BREAKPOINT } from "../Settings";

import { Button } from "@heroui/react";

export function HeroHeader() {
    const navigate = useNavigate();
    const location = useLocation();
    const isMobile = useMediaQuery(MOBILE_BREAKPOINT);
    return (
        <Container size="md">
            <div className={classes.inner}>
                <div className={classes.content}>
                    <Title className={classes.title}>
                        Erstelle dein <span className={classes.highlight}>eigenes</span>
                        <br /> Hitster Spiel!
                    </Title>
                    <Text c="dimmed" mt="md">
                        Erstelle dein eigenes Hitster-Deck mit deinen Lieblingssongs von Spotify und
                        teile es mit deinen Freunden.
                    </Text>

                    <List
                        mt={30}
                        spacing="sm"
                        size="sm"
                        icon={
                            <ThemeIcon size={20} radius="xl">
                                <IconCheck size={12} stroke={1.5} />
                            </ThemeIcon>
                        }
                    >
                        <List.Item>
                            <b>Alle Lieder</b> – Nutze alle Spotify Songs
                        </List.Item>
                        <List.Item>
                            <b>Teile mit deinen Freunden</b> – Lade deine Freunde ein, um gemeinsam
                            euer Hitster zu erstellen
                        </List.Item>
                        <List.Item>
                            <b>Schnell und Einfach</b> – Erstelle dein Hitster in wenigen Minuten,
                            ohne technische Kenntnisse
                        </List.Item>
                        <List.Item>
                            <b>Teile die Besten</b> – Teile deine Hitster-Decks mit der Community
                            und lass dich inspirieren
                        </List.Item>
                    </List>

                    <Group mt={30}>
                        <Button
                            size="lg"
                            color="primary"
                            className={classes.control}
                            onPress={() => navigate("/login", { state: { from: location } })}
                        >
                            Loslegen
                        </Button>
                        <Button
                            size="lg"
                            className={classes.control}
                            onPress={() => navigate("/decks")}
                        >
                            Entdecken
                        </Button>
                    </Group>
                </div>
                {!isMobile && <Image src={image} className={classes.image} alt="" fit="contain" />}
            </div>
        </Container>
    );
}
