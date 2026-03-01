import { StyleSheet } from '@react-pdf/renderer';



export const OnePageStyles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#fff',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  cardContainer: {
    width: '170pt', 
    height: '340pt',
    border: '1pt solid #000',
    borderRadius: 5,
    marginBottom: 40,
    display: 'flex',
    flexDirection: 'column',
  },
  // Obere Hälfte: Sichtbare Info beim Spielen
  frontSide: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fdfdfd',
  },
  // Untere Hälfte: Die Lösung (wird umgeknickt)
  backSide: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderTop: '1pt dashed #000', // Markierung zum Falten
  },
  artist: { 
    fontSize: 12, 
    fontFamily: 'Helvetica-Bold', 
    textAlign: 'center' 
  },
  title: { 
    fontSize: 10, 
    fontFamily: 'Helvetica-Oblique', 
    textAlign: 'center', 
    marginTop: 4 
  },
  year: { 
    fontSize: 26, 
    fontFamily: 'Helvetica-Bold', 
    marginTop: 5 
  }
});


export const DoublePageStyles = StyleSheet.create({
  page: {
    padding: 30, // Konsistentes Padding ist wichtig für die Zentrierung
    backgroundColor: '#fff',
    paddingBottom: 100
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center', // Zentriert das Grid auf der Seite
    gap: 0, // Wir nutzen Borders statt Gap für nahtloses Schneiden
  },
  card: {
    width: '170pt',
    height: '170pt', // Jetzt quadratisch, da kein Umknicken mehr
    border: '0.5pt solid #000', // Dünne Schnittlinien
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    padding: 10,
  },
  artist: { fontSize: 12, fontFamily: 'Helvetica-Bold' },
  title: { fontSize: 10, fontFamily: 'Helvetica-Oblique', marginTop: 4 },
  year: { fontSize: 26, fontFamily: 'Helvetica-Bold', marginTop: 5 },
});