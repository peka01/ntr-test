# Hantera nyheter

Nyhetshanteringssystemet låter administratörer skapa, redigera och hantera nyhetsmeddelanden och funktionsannonser för att informera användare om systemuppdateringar och nya funktioner.

## Översikt

Nyhetsmeddelanden (shoutouts) är meddelanden som:
- Informerar användare om nya funktioner
- Annonserar systemuppdateringar
- Höjdpunkter förbättringar
- Ger viktiga systemmeddelanden

## Skapa ett nyhetsmeddelande

### Grundläggande information

1. **Titel**: Ange en tydlig och engagerande titel
2. **Beskrivning**: Skriv en detaljerad beskrivning av nyheten
3. **Kategori**: Välj mellan:
   - **Funktion**: Nya funktioner eller funktionalitet
   - **Förbättring**: Förbättringar av befintliga funktioner
   - **Meddelande**: Viktiga systemmeddelanden eller uppdateringar

### Prioritet och synlighet

- **Låg**: Visas normalt, ingen särskild betoning
- **Medium**: Visas med lätt betoning
- **Hög**: Visas med stark betoning och högre synlighet

### Utgångsdatum

- **Inget utgångsdatum**: Meddelandet visas tills det tas bort manuellt
- **Specifikt datum**: Meddelandet försvinner automatiskt efter det angivna datumet
- **Automatisk rensning**: Systemet rensar automatiskt utgångna meddelanden

## Länka till rundturer

### Integration med rundtursystem

Du kan länka nyhetsmeddelanden till befintliga rundturer för att:
- Ge användare direkt tillgång till guidning
- Skapa en smidig övergång från information till praktisk vägledning
- Förbättra användarupplevelsen

### Så här länkar du till en rundtur

1. **Välj rundtur**: Välj en befintlig rundtur från listan
2. **Automatisk länkning**: Systemet skapar automatiskt en länk till rundturen
3. **Knapptext**: Användare ser en "Starta guidad rundtur" knapp i meddelandet

## Hantera befintliga meddelanden

### Redigera meddelande

1. I meddelandelistan, klicka på **Redigera** bredvid meddelandet
2. Gör dina ändringar
3. Klicka på **Spara** för att uppdatera meddelandet

### Duplicera meddelande

1. Klicka på **Duplicera** bredvid ett befintligt meddelande
2. En kopia skapas med namnet "Kopia av [originaltitel]"
3. Redigera kopian enligt dina behov

### Ta bort meddelande

1. Klicka på **Ta bort** bredvid meddelandet
2. Bekräfta borttagningen i dialogrutan
3. **Varning**: Denna åtgärd kan inte ångras

### Markera som läst

Användare kan markera meddelanden som lästa. Administratörer kan se:
- Antal användare som har läst meddelandet
- Antal användare som inte har läst meddelandet
- Lässtatistik per meddelande

## Meddelandestatistik

Systemet spårar följande statistik för varje meddelande:
- **Totalt antal meddelanden**: Antal skapade meddelanden
- **Aktiva meddelanden**: Meddelanden som visas för användare
- **Utgångna meddelanden**: Meddelanden som har passerat sitt utgångsdatum
- **Kategorier**: Antal meddelanden per kategori
- **Prioritetsfördelning**: Antal meddelanden per prioritetsnivå

## Importera och exportera

### Exportera meddelanden

1. Klicka på **Exportera** i nyhetshanteringspanelen
2. Systemet genererar en JSON-fil med alla meddelanden
3. Spara filen för säkerhetskopiering eller delning

### Importera meddelanden

1. Klicka på **Importera** i nyhetshanteringspanelen
2. Klistra in JSON-data i textfältet
3. Klicka på **Importera meddelanden** för att läsa in data

## "Nytt" indikator

### Automatisk markering

- **Nya meddelanden**: Visas med en "Nytt" indikator
- **Automatisk uppdatering**: Indikatorn försvinner när användaren läser meddelandet
- **Visuell betoning**: "Nytt" indikatorn hjälper användare att upptäcka nya innehåll

### Hantera indikatorer

- **Användarvisning**: Användare ser "Nytt" indikatorn tills de läser meddelandet
- **Adminöversikt**: Administratörer kan se vilka meddelanden som är nya för användare
- **Statistik**: Spåra hur många användare som har sett varje meddelande

## Bästa praxis

### Skriv effektiva meddelanden

- **Tydlig titel**: Använd en titel som förklarar vad nyheten handlar om
- **Konkret beskrivning**: Beskriv specifikt vad som har ändrats eller tillagts
- **Användarcentrerat**: Fokusera på fördelar för användaren
- **Kort och koncis**: Håll meddelandet kort men informativt

### Välj rätt kategori

- **Funktion**: Använd för helt nya funktioner eller betydande tillägg
- **Förbättring**: Använd för förbättringar av befintliga funktioner
- **Meddelande**: Använd för systemuppdateringar, underhåll eller viktiga meddelanden

### Hantera prioritet

- **Hög prioritet**: Använd sparsamt för kritiska meddelanden
- **Medium prioritet**: Använd för viktiga men inte kritiska uppdateringar
- **Låg prioritet**: Använd för mindre viktiga meddelanden

### Planera utgångsdatum

- **Tidsbegränsade kampanjer**: Använd utgångsdatum för tillfälliga meddelanden
- **Permanent information**: Lämna utan utgångsdatum för viktig information
- **Automatisk rensning**: Låt systemet rensa utgångna meddelanden automatiskt

## Felsökning

### Vanliga problem

**Meddelandet visas inte**
- Kontrollera att meddelandet är aktivt
- Verifiera att utgångsdatumet inte har passerat
- Kontrollera att användaren har rätt roll

**"Nytt" indikator försvinner inte**
- Kontrollera att användaren har klickat på meddelandet
- Verifiera att lässtatusen uppdateras korrekt
- Kontrollera webbläsarens cache

**Rundtur länkas inte korrekt**
- Kontrollera att rundturen fortfarande existerar
- Verifiera att användaren har tillgång till rundturen
- Kontrollera att länken är korrekt konfigurerad

### Debug-tips

1. **Testa som användare**: Logga in som en vanlig användare för att se meddelanden
2. **Kontrollera datum**: Verifiera att utgångsdatum är korrekt angivna
3. **Kontrollera roller**: Se till att användaren har rätt behörigheter

## Integration med andra system

### Rundtursystem

- **Automatisk länkning**: Skapa smidiga övergångar från information till praktisk vägledning
- **Kontextuell hjälp**: Ge användare direkt tillgång till relevanta rundturer
- **Förbättrad användarupplevelse**: Kombinera information med interaktiv vägledning

### Hjälpsystem

- **Kontextuell hjälp**: Länka till relevant hjälpdokumentation
- **AI-assistent**: Använd AI-assistenten för att svara på frågor om meddelanden
- **Sökfunktion**: Användare kan söka efter specifika meddelanden i hjälpsystemet
