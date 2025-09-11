# Rundturshantering

Rundturshanteringssystemet låter administratörer skapa, redigera och hantera guidade rundturer för att hjälpa användare att lära sig systemets funktioner.

## Översikt

Guidade rundturer är interaktiva vägledningar som hjälper användare att:
- Lär sig nya funktioner
- Förstå systemets struktur
- Navigera genom komplexa arbetsflöden
- Få kontextuell hjälp

## Skapa en ny rundtur

### Grundläggande information

1. **Rundtursnamn**: Ange ett beskrivande namn för rundturen
2. **Beskrivning**: Skriv en kort beskrivning av vad rundturen täcker
3. **Kategori**: Välj mellan:
   - **Introduktion**: För nya användare
   - **Funktion**: För specifika funktioner
   - **Admin**: För administrativa funktioner
   - **Användare**: För användarfunktioner

### Rollkrav

- **Vilken användare som helst**: Alla användare kan se rundturen
- **Endast Admin**: Endast administratörer kan se rundturen
- **Endast Användare**: Endast vanliga användare kan se rundturen

### Beräknad varaktighet

Ange hur lång tid (i minuter) rundturen beräknas att ta.

## Hantera rundturssteg

### Stegtyper

Varje steg i en rundtur kan ha olika åtgärdstyper:

#### Navigera
- Flyttar användaren till en specifik sida
- Används för att visa olika delar av systemet

#### Klicka
- Markerar ett element som användaren ska klicka på
- Används för att visa interaktiva element

#### Rulla
- Visar användaren att de ska scrolla på sidan
- Används för att visa innehåll som inte är synligt

#### Vänta
- Pausar rundturen i en bestämd tid
- Används för att ge användaren tid att läsa

#### Markera
- Höjdpunkter ett element utan klick
- Används för att uppmärksamma viktiga element

### Stegkonfiguration

För varje steg anger du:

1. **Stegtitel**: En kort titel för steget
2. **Steginnehåll**: Detaljerad beskrivning av vad användaren ska göra
3. **Målväljare**: CSS-väljare för elementet som ska markeras
4. **Position**: Var tooltipen ska visas (överst, underst, vänster, höger, centrum)
5. **Åtgärd**: Vilken typ av åtgärd som ska utföras
6. **Krävd vy**: Vilken sida som måste vara aktiv för steget
7. **Hoppa över om mål inte hittas**: Om steget ska hoppas över om elementet inte finns

### Målväljare (data-tour attribut)

För att en rundtur ska fungera korrekt måste målväljarna matcha `data-tour` attribut i koden:

```html
<!-- Exempel på data-tour attribut -->
<button data-tour="create-training-btn">Skapa träning</button>
<div data-tour="user-list">Användarlista</div>
```

## Rundtursstatistik

Systemet spårar följande statistik för varje rundtur:
- **Totalt antal rundturer**: Antal skapade rundturer
- **Totalt antal steg**: Totalt antal steg i alla rundturer
- **Genomsnitt steg/rundtur**: Genomsnittligt antal steg per rundtur
- **Kategorier**: Antal rundturer per kategori

## Importera och exportera

### Exportera rundturer

1. Klicka på **Exportera** i rundturshanteringspanelen
2. Systemet genererar en JSON-fil med alla rundturer
3. Spara filen för säkerhetskopiering eller delning

### Importera rundturer

1. Klicka på **Importera** i rundturshanteringspanelen
2. Klistra in JSON-data i textfältet
3. Klicka på **Importera rundturer** för att läsa in data

## Redigera befintliga rundturer

### Välja rundtur att redigera

1. I rundturslistan, klicka på **Redigera** bredvid den rundtur du vill ändra
2. Rundturen laddas i redigeringsläge
3. Gör dina ändringar och klicka på **Spara**

### Duplicera rundtur

1. Klicka på **Duplicera** bredvid en befintlig rundtur
2. En kopia skapas med namnet "Kopia av [originalnamn]"
3. Redigera kopian enligt dina behov

### Ta bort rundtur

1. Klicka på **Ta bort** bredvid rundturen
2. Bekräfta borttagningen i dialogrutan
3. **Varning**: Denna åtgärd kan inte ångras

## Bästa praxis

### Planera din rundtur

- **Börja med mål**: Vad ska användaren lära sig?
- **Bryt ner i steg**: Varje steg ska fokusera på en sak
- **Testa flödet**: Gå igenom rundturen som en användare skulle göra

### Skriv effektiva steg

- **Var tydlig**: Använd enkla, direkta instruktioner
- **Var konkret**: Specificera exakt vad användaren ska göra
- **Håll det kort**: Varje steg ska vara lätt att förstå snabbt

### Välj rätt målväljare

- **Använd data-tour attribut**: Detta är den bästa metoden
- **Testa väljare**: Kontrollera att elementet hittas korrekt
- **Planera för ändringar**: Välj stabila element som inte ändras ofta

## Felsökning

### Vanliga problem

**Rundturen startar inte**
- Kontrollera att alla steg har giltiga målväljare
- Verifiera att krävda vyer är korrekt angivna
- Kontrollera att användaren har rätt roll

**Steg hoppas över oväntat**
- Kontrollera att målväljaren matchar ett element på sidan
- Verifiera att elementet är synligt när steget körs
- Kontrollera "Hoppa över om mål inte hittas" inställningen

**Tooltip visas på fel plats**
- Justera positionen (överst, underst, vänster, höger, centrum)
- Kontrollera att det finns tillräckligt med utrymme
- Testa på olika skärmstorlekar

### Debug-tips

1. **Använd utvecklarverktyg**: Inspektera element för att hitta rätt väljare
2. **Testa steg för steg**: Kör rundturen och kontrollera varje steg
3. **Kontrollera konsolen**: Leta efter felmeddelanden i webbläsarens konsol

## Integration med nyhetssystem

Rundturer kan länkas till nyhetsmeddelanden för att:
- Annonsera nya funktioner
- Ge användare direkt tillgång till guidning
- Skapa en smidig användarupplevelse

När du skapar ett nyhetsmeddelande kan du länka det till en befintlig rundtur för att ge användare både information och praktisk vägledning.
