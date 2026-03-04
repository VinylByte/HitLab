import { Container, Text, Title } from "@mantine/core";
import { Button } from "@heroui/react";
import { useNavigate } from "react-router"



export default function UnauthorisedPlayPage() {
    const navigate = useNavigate();
    return (
        <Container size="md" >
            <Title>Du bist nicht eingeloggt</Title>
            <Text c="dimmed" mt="md">
                Um ein Spiel zu spielen, musst du eingeloggt sein. Bitte logge dich ein, um fortzufahren.
            </Text>
            <Button size="lg" color="primary" onPress={() => navigate("/login")}>
                Zum Login
            </Button>
        </Container>
    );
}
