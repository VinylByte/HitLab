import { Container, Group, Title, Text, Stack, Center } from "@mantine/core";
import classes from "./404ErrorPage.module.css";
import { Button } from "@heroui/react";
import { Illustration } from "./Illustration";
import { IconArrowBack, IconHome } from "@tabler/icons-react";
import { Link } from "react-router";

export default function Error404Page() {
    return (
        <Container className={classes.root} w={"100%"}>
            <div className={classes.inner}>
                <Illustration className={classes.image} />
                <Stack className={classes.content}>
                    <Title className={classes.title}>Nichts gefunden!</Title>
                    <Center>
                        <Text c="dimmed" size="lg" ta="center" className={classes.description}>
                            Die Seite, die Sie versuchen zu öffnen, existiert nicht. Möglicherweise
                            haben Sie die Adresse falsch eingegeben oder die Seite wurde auf eine
                            andere URL verschoben. Wenn Sie denken, dass dies ein Fehler ist,
                            kontaktieren Sie bitte den Support.
                        </Text>
                    </Center>
                    <Group justify="center">
                        <Button color="primary" as={Link} to="/" startContent={<IconHome size={16}/>} size="md">Zurück zur Startseite</Button>
                        <Button color="secondary" startContent={<IconArrowBack size={16}/>} onPress={() => window.history.back()} size="md">Zurück zur vorheringen Seite</Button>
                    </Group>
                </Stack>
            </div>
        </Container>
    );
}
