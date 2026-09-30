# Surplus Voorraad · Ganshoek

**Publiceren op GitHub:** dit complete project bevat een GitHub Actions-workflow. Volg [GITHUB-PAGES.md](GITHUB-PAGES.md). Upload de uitgepakte projectinhoud één keer; een apart ZIP-bestand met de gebouwde website is niet nodig. GitHub bouwt, test en publiceert vanuit de broncode.

Werkende Nederlandstalige webapp met de acht producten en fictieve beginstanden uit de masterprompt. H1, H2 en H3 houden onafhankelijk voorraad bij. Eén eenheid is één ongeopende **verpakking**. Er is geen gedeelde voorraad, backend, account, bestelling, minimumvoorraad, Excel-koppeling of live Microsoft-verbinding.

## Starten en controleren

Gebruik Node.js **24.15 of nieuwer**. Getest op Windows met **Node 24.19.0 en npm 9.7.2**. De systeem-Node 18.16.1 is te oud; deze bouw gebruikte de reeds aanwezige Codex-Node zonder systeeminstellingen te veranderen.

Open een terminal in deze projectmap:

```powershell
npm ci
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

Open de door Vite gemelde lokale URL in een eigen tabblad. `http://127.0.0.1:5173/` is tijdens de oplevering daadwerkelijk getest. Dit adres is alleen vanaf dezelfde computer bereikbaar. Een andere origin of poort heeft een eigen browserdataset.

Op deze computer werkt ook `./Start-Demo.ps1` vanuit een toegestane PowerShell-sessie. De starter kiest de bestaande Codex-Node als die beschikbaar is en controleert de versie. Hij installeert niets, verandert geen uitvoeringsbeleid en start alleen een lokale server. Bij geblokkeerde scripts: gebruik normale startcommando's in een toegestane omgeving; omzeil apparaatbeleid niet.

```powershell
npm run typecheck
npm test
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

`npm test` is een eenmalige run. De build staat in `dist/`; serveer deze via een webserver, niet door `index.html` te dubbelklikken. Het pakket bevat broncode, lockbestand en build; installeer elders eerst met `npm ci`.

Vite en Vitest gebruiken `--configLoader native`; daarmee wordt de TypeScript-configuratie op deze Windows-omgeving zonder apart configuratiebundelproces geladen. Vitest gebruikt workerthreads. Alleen voor uitvoering in de Codex-sandbox is de npm-cache in de werkmap geplaatst. Geen bibliotheekcode of systeembeleid is gewijzigd.

## Gebouwde functies

- Voorraad per ruimte en een berekend totaal, productdetails, zoeken op naam/variant/artikelnummer/barcode. `Alle ruimtes` is alleen-lezen.
- Toevoegen en afboeken via echte lokale ZXing-decoder, handmatige barcode of productkeuze. Ondersteunde scannerformaten: Code 128, EAN-13, EAN-8, UPC-A. Geen QR-vervanging of afhankelijkheid van alleen BarcodeDetector.
- Controle vóór bevestiging met product, variant, ruimte, actie, aantal en stand vóór/na. Alleen positieve gehele aantallen; geen negatieve voorraad. Scannen en annuleren boeken niets.
- Boekingsvergrendeling, unieke operationId en atomaire Dexie-transactie voor stand plus historie. Identieke retries geven het eerdere resultaat; andere inhoud bij dezelfde ID wordt geweigerd.
- Opslagfouten zonder succesmelding. Invoer en oorspronkelijke opdracht blijven bewaard voor een veilige retry, ook bij een onzekere uitkomst na commit.
- Historie met openingsmutaties, datum/tijd, ruimte, actie, aantal, stand vóór/na, fictieve actor `Demogebruiker`, invoerbron en apart demobarcodekenmerk.
- Bevestigd koppelen van een gecontroleerde verpakkingsbarcode, ruimtenamen aanpassen, volledige demo-reset met bevestiging.
- Afdrukpagina met acht Code 128-symbolen en één synthetische EAN-13-code; tekst `DEMO, geen officiële productbarcode` en witte marges.

Decoder en fonts werken lokaal: er zijn geen externe fontdiensten, trackers, online barcodezoekdiensten of app-API's. Camerabeelden worden lokaal verwerkt, niet opgeslagen of geüpload. Alleen barcode-tekst kan in de historie terechtkomen.

## Camera en mobiele test

Kies ruimte en actie, ga naar productherkenning en tik bewust op `Camera starten`. Alleen video wordt gevraagd met `facingMode: { ideal: "environment" }`; het video-element gebruikt `playsInline`, `muted` en `autoPlay`. Na één herkenning stopt de camera. Sluiten, verlaten, `pagehide`, achtergrondgebruik en een camera die pas na sluiten beschikbaar komt stoppen de tracks. Een nieuwe scan vereist een nieuwe startactie.

Weigering, ontbrekende/bezette camera en een scantijd van 20 seconden geven Nederlandse meldingen. Handmatige invoer en product zoeken blijven beschikbaar. Tips gaan over afstand, scherpte en licht; de app meet geen verlichting. Niet-ondersteunde codes worden niet als een bekende verpakking geboekt.

Voor iPad/smartphone is een **door Surplus/I&A toegestane HTTPS-testomgeving** met een vertrouwd certificaat nodig. Een onbeveiligd lokaal netwerkadres zoals `http://192.168.…` is geen volwaardig alternatief. Localhost op de ontwikkelcomputer is een aparte ontwikkeluitzondering. Een eigen browsertab is nodig omdat een ingebedde preview cameratoegang kan blokkeren. Zie [MDN getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia).

Er is geen tunnel, externe hosting of Surplus-netwerkverbinding ingericht. Test de door apparaatbeleid toegestane browser, eventueel Edge, op een beheerde iPad. Registreer apparaat, iPadOS, browser, HTTPS-origin, testcode en uitkomst. Eigen telefoongebruik vereist toestemming van Surplus. **Fysieke camerascans zijn hier niet getest.**

## Lokale opslag

Elke browser, origin en browserprofiel heeft een afzonderlijke IndexedDB-dataset. Er is geen synchronisatie tussen iPads of productieback-up. Standen en historie blijven bij verversen/heropenen in dezelfde browser en origin bewaard zolang de browseropslag aanwezig blijft. Lokale opslag bewijst geen offline-herladen; er is geen serviceworker of offline synchronisatie.

`src/domain` bevat entiteiten/regels; `src/data` Dexie, seed en `LocalInventoryRepository`; `src/scanner` camera; `src/screens` schermen; `src/tests` voorraad-, transactie-, barcode- en UI-tests. De vervangbare repository-interface biedt `listProducts`, `listLocations`, `getStock`, `resolveBarcode`, `bookMovement`, `listMovements`. Alleen de lokale implementatie is gebouwd.

De samengestelde sleutel `[productId+locationId]` en unieke barcode-/operationId-indexen bewaken de data. Eén lees/schrijftransactie controleert operatie, product, ruimte, koppeling en actuele stand en schrijft voorraad plus mutatie. Fouten worden buiten de transactie afgehandeld. Binnen de transactie wordt niet gewacht op camera, timers of netwerk. Totalen worden uit de ruimteposities berekend. Seedversie 1 wordt eenmaal atomair ingericht; nulstanden krijgen geen nulmutatie.

Een centrale implementatie vereist daarnaast servercontrole voor autorisatie, gelijktijdige boekingen, logging en herstel. Alleen een opslagklasse vervangen maakt geen gedeelde productievoorraad.

## Demo van vijf minuten

1. Bevestig Demo resetten in Demo-instellingen: artikel 760364 begint met H1/H2/H3 = 10/6/4.
2. Print de demobarcodes op 100% met witte randen of open ze op een tweede scherm. Scan geen code op het eigen iPad-scherm.
3. Kies H1 en Afboeken; scan `DEMO-SURPLUS-001`; controleer en boek 2 af: 8/6/4, totaal 18.
4. Kies H2 en Toevoegen; scan dezelfde code; voeg 3 toe: 8/9/4, totaal 21.
5. Toon onbekende barcode, afboeken boven beschikbaar en annuleren: niets wordt geboekt.
6. Toon Mutaties, ververs en controleer de standen opnieuw. Een tweede apparaat heeft bewust een eigen dataset.
7. Scan `2000000000015` en annuleer, zodat de eindstanden gelijk blijven.

Zonder camera kan dit handmatig. Vermeld dan **Camerascannen niet getest**. Rasterdecodertests vervangen geen fysieke scanproef en bewijzen geen leesbaarheid van echte TENA-verpakkingen.

## Verpakkingsbarcode koppelen

Controleer op een aanwezige verpakking artikel, variant, formaat en verpakkingsniveau. Voer in Demo-instellingen de exacte barcode als tekst in, kies bestaand product/formaat en bevestig controle van één ongeopende verpakking. Controleer het samenvattingsscherm en bevestig de koppeling. Dubbele of tegenstrijdige codes worden geweigerd. EAN/UPC krijgen lengte- en controlepositievalidatie. Doos-/stuksbarcodes en stille omrekening zijn niet toegestaan.

Voorloopnullen en oorspronkelijke scanresultaten blijven behouden. Er worden geen cijfers toegevoegd of verwijderd voor een match. Er is geen online catalogus of productaanmaak vanuit onbekende codes.

Geseede synthetische codes zijn `isDemo=true` en `verified=true`: alleen hun demo-koppeling is gecontroleerd, geen officiële TENA-GTIN. `0001234567895` is uitsluitend een synthetische testfixture, geen echte TENA-code en geen app-seed. Voor een echte pilotdataset moeten alle demokoppelingen worden verwijderd; die dataset valt buiten deze versie. Reset herstelt juist de demo-inrichting, inclusief standen, historie, koppelingen en ruimtenamen.

## Versies en bewijs

Zie `VERSIES.md` en het lockbestand voor exacte versies. `TESTRESULTATEN.md` registreert per test invoer, verwachting, waarneming, context en status.

De laatste run bevat **57 geslaagde tests**. Typecheck en build zijn uitgevoerd. Browsercontrole omvatte handmatige boekingen, verversen/historie, Alle ruimtes, onbekende barcode, overboeking/annuleren en demobarcodes. Desktop-viewports 1180×820, 820×1180 en 390×844 zijn bekeken; zij bewijzen geen fysieke iPad-/telefoonwerking.

Camera- en opslagfouten zijn in UI-tests nagebootst. De negen barcodepatronen zijn met de echte ZXing-softwaredecoder uit synthetische rasters gelezen. Fysieke camera, printer, echte verpakkingen, mobiel HTTPS, Bedrijfsportaal, medewerkerstaken en 30 praktijkpogingen zijn **Niet uitgevoerd**. Een volledige toegankelijkheidsaudit, 200% tekstvergroting en offline-herladen zijn eveneens niet getest. Bediening heeft zichtbare focus, labels en minimaal 48 px hoge knoppen; de hoofdtekstkleuren zijn op contrast berekend.

De praktijkgrenzen blijven voorgestelde doelen: 27/30 scans binnen vijf seconden, nul verkeerde koppelingen/boekingen; 16/18 medewerkerstaken zonder hulp na maximaal één minuut uitleg. Leg ook mislukkingen vast. Dit zijn geen behaalde resultaten.

## Open punten Kim en I&A

- Kim: bevestig actuele selectie, verpakkingseenheid, artikelgegevens en namen/plaatsen H1/H2/H3. Geen onbevestigde koppeling aan Oranje, Groen of Rood.
- Team/Kim: controleer echte barcodeformaten, regel verpakkingen, tweede scherm/printer, apparaten en toestemming voor praktijktests.
- I&A: bepaal toegestane HTTPS-testomgeving, browser, camerarechten, gegevensbeheer en distributie.
- Onderzoek een iOS/iPadOS-webclip/weblink via Intune en Bedrijfsportaal. Het portaal host de app niet zelf. Test en laat beschikbaarheid, startgedrag en camerarechten goedkeuren op een beheerd apparaat. Zie [Microsoft webapps in Intune](https://learn.microsoft.com/en-us/intune/app-management/deployment/add-web).
- Een toekomstige SharePoint-aansluiting vereist een door I&A gekozen opslag-/autorisatielaag en documentbibliotheek voor goedgekeurde bestanden. Deze demo heeft geen tenantverbinding, Graph-rechten, accounts of sleutels.
- Authenticatie, rechten, centrale mutaties, logging, beheer, herstel en back-up zijn nodig vóór een pilot. Er is geen claim van goedkeuring, NEN 7510- of ISO 27001-conformiteit.

## Later uitbreiden, nu uitsluitend beschreven

Minimum- en aanvulvoorraad volgen na vaststelling van eenheid, verbruik, levertijd en verantwoordelijkheden. Een gecontroleerd bestelvoorstel moet voorraad, openstaande bestellingen, reeds goedgekeurde voorstellen en TENA-besteleenheden meenemen; de bestaande bestelroute blijft leidend.

Excel-invulling is niet gebouwd. Onderzoek later alleen een kopie van de bestaande TENA-.xlsm. `Adviesbestelling in weken`: artikelen A, verpakking E:H, adviezen I:L, mogelijke invoer `Bestelling / Dozen` M, weken J4. Kim/beheerder moeten invoervelden bevestigen. Koppel op artikelnummer én sjabloonversie. Behoud bladen, opmaak, formules, beveiliging, validaties en macro's; voer geen macro's uit of verwijder beveiliging zonder toestemming. Onderzoek apart herberekening, behoud van dit specifieke .xlsm en TENA-acceptatie. Office Scripts/Power Automate voeren niet vanzelf bestaande VBA uit. Geaggregeerde voorraadmutaties zijn geen bewonersgebonden verbruik of zorgbehoefte. Een medewerker controleert en rondt af.

## Bronnen

De implementatiegegevens komen uit de door de gebruiker geplakte masterprompt. De bewonerswerkmap en het toelichtende Word-document zijn niet geopend, gewijzigd, uitgevoerd, gekopieerd, in Git opgenomen of naar een externe dienst gestuurd. Productgegevens/celverwijzingen uit de prompt zijn niet opnieuw uit de werkmap geverifieerd. Het Word-document is toelichting, geen extra opdracht.

[Surplus](https://surplus.nl/) is geraadpleegd als visuele referentie op 30 september 2026. Tokens zijn voorgestelde promptkleuren, geen officiële codes. Er is geen goedgekeurd logo aangeleverd; de kop is gewone tekst. Het favicon is een generiek voorraadicoon.

Technische referenties, geraadpleegd op 30 september 2026: [Vite](https://vite.dev/guide/), [ZXing](https://github.com/zxing-js/browser), [Dexie-transacties](https://dexie.org/docs/Dexie/Dexie.transaction()), [JsBarcode](https://github.com/lindell/JsBarcode), [MDN camera](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia).
