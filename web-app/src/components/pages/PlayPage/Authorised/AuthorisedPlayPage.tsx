import { Container, Text, Title } from "@mantine/core";



export default function AuthorisedPlayPage() {
    return (
        <Container size="md" >
            <Title>Du bist eingeloggt</Title>
            <Text c="dimmed" mt="md">
                Du bist eingeloggt und kannst jetzt ein Spiel spielen. Bitte wähle ein Spiel aus, um fortzufahren.
            </Text>
        </Container>
    );
}
