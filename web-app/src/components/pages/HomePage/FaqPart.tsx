import { Accordion, Container, Title } from '@mantine/core';
import classes from './FaqSimple.module.css';

export function FaqPart() {
  return (
    <Container size="xl" w={"100%"} className={classes.wrapper}>
      <Title ta="center" className={classes.title}>
        Häufig gestellte Fragen
      </Title>

      <Accordion variant="separated" pt={"md"}>

        <Accordion.Item className={classes.item} value="how-to-play">
          <Accordion.Control>Wie Spiele ich das Spiel?</Accordion.Control>
          <Accordion.Panel>Du scannst einfach den QR-Code auf der Karte und wirst dann auf unsere Seite geleite, wo dann der Song abgespielt wird. 
            Alternativ kannst du den QR-Code Scanner auf unserer Seite nutzen.</Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item className={classes.item} value="how-to-create-deck">
          <Accordion.Control>Wie erstelle ich ein neues Deck?</Accordion.Control>
          <Accordion.Panel>Nachdem du dich angemeldet hast kannst du auf den Lab-Reiter gehen und dort mit der Erstellung beginnen. Dort kannst du auch deine Freunde hinzufügen und erstellte Decks bearbeiten.</Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item className={classes.item} value="how-to-get-cards">
          <Accordion.Control>Wie komme ich an die Spielkarten?</Accordion.Control>
          <Accordion.Panel>Nach der Erstellung eines Decks kannst du dir die Karten als PDF-Herunterladen. Danach müssen diese nurnoch ausgedruckt werden und das Spiel kann beginnen.</Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item className={classes.item} value="spotify-usage">
          <Accordion.Control>Wofür wird mein Spotify Konto benötigt?</Accordion.Control>
          <Accordion.Panel>Wir benötigen dein Konto um Informationen, wie Künstler, Songtitel und Erscheinungsjahr, über das von dir erstellte Deck zu bekommen. Dafür benötigst du ein Spotify Premium Konto.</Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item className={classes.item} value="forgot-pwd">
          <Accordion.Control>Ich habe mein Passwort vergessen.</Accordion.Control>
          <Accordion.Panel>Wenn du dein Passwort vergessen hast, musst du dich an Spotify wenden und dort dein Passwort zurücksetzen. Anschließend kannst du dich hier in dein altes Konto einloggen.</Accordion.Panel>
        </Accordion.Item>

      </Accordion>
    </Container>
  );
}