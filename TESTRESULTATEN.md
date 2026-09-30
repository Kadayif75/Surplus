# Testresultaten Surplus Voorraad

Datum: 30 september 2026 (Europe/Amsterdam). Windows-desktop; Node.js 24.19.0; npm 9.7.2; uitsluitend fictieve data.

## Geautomatiseerde tests

Laatste daadwerkelijk uitgevoerde run: **57/57 geslaagd**. Vitest 5.0.3; fake-indexeddb 6.2.5. Domein/opslag: geen browser. React UI: jsdom 30.1.1 met nagebootste camera/opslag. D01 gebruikt de echte ZXing-decoder en synthetische rasterbeelden, geen camera.

| Test-ID / geval | Datum, apparaat en browser | Invoer | Verwachte uitkomst | Werkelijk waargenomen uitkomst | Status |
|---|---|---|---|---|---|
| D01-1: D01: DEMO-SURPLUS-001 wordt door ZXing correct gelezen | 30-09-2026, Windows / Node; geen browser | JsBarcode-symbool naar raster; ZXing leest code uit testnaam | Exacte rawValue en symbology | Beide decoderassertions geslaagd; geen fysieke camera | Geslaagd |
| D01-2: D01: DEMO-SURPLUS-002 wordt door ZXing correct gelezen | 30-09-2026, Windows / Node; geen browser | JsBarcode-symbool naar raster; ZXing leest code uit testnaam | Exacte rawValue en symbology | Beide decoderassertions geslaagd; geen fysieke camera | Geslaagd |
| D01-3: D01: DEMO-SURPLUS-003 wordt door ZXing correct gelezen | 30-09-2026, Windows / Node; geen browser | JsBarcode-symbool naar raster; ZXing leest code uit testnaam | Exacte rawValue en symbology | Beide decoderassertions geslaagd; geen fysieke camera | Geslaagd |
| D01-4: D01: DEMO-SURPLUS-004 wordt door ZXing correct gelezen | 30-09-2026, Windows / Node; geen browser | JsBarcode-symbool naar raster; ZXing leest code uit testnaam | Exacte rawValue en symbology | Beide decoderassertions geslaagd; geen fysieke camera | Geslaagd |
| D01-5: D01: DEMO-SURPLUS-005 wordt door ZXing correct gelezen | 30-09-2026, Windows / Node; geen browser | JsBarcode-symbool naar raster; ZXing leest code uit testnaam | Exacte rawValue en symbology | Beide decoderassertions geslaagd; geen fysieke camera | Geslaagd |
| D01-6: D01: DEMO-SURPLUS-006 wordt door ZXing correct gelezen | 30-09-2026, Windows / Node; geen browser | JsBarcode-symbool naar raster; ZXing leest code uit testnaam | Exacte rawValue en symbology | Beide decoderassertions geslaagd; geen fysieke camera | Geslaagd |
| D01-7: D01: DEMO-SURPLUS-007 wordt door ZXing correct gelezen | 30-09-2026, Windows / Node; geen browser | JsBarcode-symbool naar raster; ZXing leest code uit testnaam | Exacte rawValue en symbology | Beide decoderassertions geslaagd; geen fysieke camera | Geslaagd |
| D01-8: D01: DEMO-SURPLUS-008 wordt door ZXing correct gelezen | 30-09-2026, Windows / Node; geen browser | JsBarcode-symbool naar raster; ZXing leest code uit testnaam | Exacte rawValue en symbology | Beide decoderassertions geslaagd; geen fysieke camera | Geslaagd |
| D01-9: D01: 2000000000015 wordt door ZXing correct gelezen | 30-09-2026, Windows / Node; geen browser | JsBarcode-symbool naar raster; ZXing leest code uit testnaam | Exacte rawValue en symbology | Beide decoderassertions geslaagd; geen fysieke camera | Geslaagd |
| S01-1: S01: exact acht producten, drie ruimtes, 24 standen, 21 positieve openingsmutaties, negen democodes | 30-09-2026, Windows / Node; geen browser | Seed in lege database | 8 producten; 3 ruimtes; 24 standen; 21 positieve openingsmutaties; 9 codes | Exacte tellingen, metadata en alle beginstanden bevestigd | Geslaagd |
| S02-1: S02: afboeken H1 geeft 8/6/4 en totaal 18, toevoegen H2 geeft 8/9/4 en totaal 21 | 30-09-2026, Windows / Node; geen browser | H1 OUT 2; daarna H2 IN 3 voor 760364 | 8/6/4 totaal 18; daarna 8/9/4 totaal 21 | Beide reeksen en precies twee nieuwe mutaties geobserveerd | Geslaagd |
| S03-1: S03: opnieuw openen en initialiseren behoudt standen en historie | 30-09-2026, Windows / Node; geen browser | Boeken; sluiten; heropenen; initialiseren | H1 8; historie 22 | Stand en historie behouden | Geslaagd |
| S04-1: S04: herkennen verandert geen stand of historie, ook niet bij onbekende code | 30-09-2026, Windows / Node; geen browser | Bekende Code 128 en EAN-13; onbekende code | Alleen herkennen; geen boeking | Bekende matches; onbekend undefined; snapshot gelijk | Geslaagd |
| S05-1: S05: productkeuze gebruikt dezelfde boekingsservice en bewaart de invoerbron | 30-09-2026, Windows / Node; geen browser | Productkeuze | Dezelfde voorraadregels en bron productSearch | H1 8; productSearch; geen demobarcode | Geslaagd |
| S06-1: S06: echte camerascan van democode blijft camera met apart demokenmerk | 30-09-2026, Windows / Node; geen browser | Command met camera-bron en democode; zonder camera | Camera-bron en apart demokenmerk | Bron camera; isDemoBarcode true; rawValue exact behouden | Geslaagd |
| V01-1: V01: ongeldig aantal 0 | 30-09-2026, Windows / Node; geen browser | Aantal uit testnaam | Afwijzen zonder mutatie | Positief-geheel-fout ontvangen; snapshot gelijk | Geslaagd |
| V01-2: V01: ongeldig aantal -1 | 30-09-2026, Windows / Node; geen browser | Aantal uit testnaam | Afwijzen zonder mutatie | Positief-geheel-fout ontvangen; snapshot gelijk | Geslaagd |
| V01-3: V01: ongeldig aantal 1.5 | 30-09-2026, Windows / Node; geen browser | Aantal uit testnaam | Afwijzen zonder mutatie | Positief-geheel-fout ontvangen; snapshot gelijk | Geslaagd |
| V01-4: V01: ongeldig aantal NaN | 30-09-2026, Windows / Node; geen browser | Aantal uit testnaam | Afwijzen zonder mutatie | Positief-geheel-fout ontvangen; snapshot gelijk | Geslaagd |
| V01-5: V01: ongeldig aantal Infinity | 30-09-2026, Windows / Node; geen browser | Aantal uit testnaam | Afwijzen zonder mutatie | Positief-geheel-fout ontvangen; snapshot gelijk | Geslaagd |
| V01-6: V01: ongeldig aantal 9007199254740992 | 30-09-2026, Windows / Node; geen browser | Aantal uit testnaam | Afwijzen zonder mutatie | Positief-geheel-fout ontvangen; snapshot gelijk | Geslaagd |
| V02-1: V02: ontbrekende of ongeldige ruimte  | 30-09-2026, Windows / Node; geen browser | Ruimte uit testnaam | Afwijzen zonder mutatie | Ontbrekende, all of ongeldige ruimte geweigerd; snapshot gelijk | Geslaagd |
| V02-2: V02: ontbrekende of ongeldige ruimte all | 30-09-2026, Windows / Node; geen browser | Ruimte uit testnaam | Afwijzen zonder mutatie | Ontbrekende, all of ongeldige ruimte geweigerd; snapshot gelijk | Geslaagd |
| V02-3: V02: ontbrekende of ongeldige ruimte H9 | 30-09-2026, Windows / Node; geen browser | Ruimte uit testnaam | Afwijzen zonder mutatie | Ontbrekende, all of ongeldige ruimte geweigerd; snapshot gelijk | Geslaagd |
| V03-1: V03: onvoldoende voorraad geeft bruikbare melding | 30-09-2026, Windows / Node; geen browser | 11 afboeken uit 10 | Maximaal 10; geen mutatie | Exacte melding ontvangen; snapshot gelijk | Geslaagd |
| V04-1: V04: onbekende barcode kan niet boeken | 30-09-2026, Windows / Node; geen browser | ONBEKEND boeken | Geen match; geen mutatie | Nog niet gekoppeld gemeld; snapshot gelijk | Geslaagd |
| V05-1: V05: barcode gekoppeld aan ander product kan niet boeken | 30-09-2026, Windows / Node; geen browser | Barcode van ander product | Boeking blokkeren | Koppeling afgewezen; historie 21 | Geslaagd |
| V06-1: V06: niet bestaand product of ontbrekende barcode kan niet boeken | 30-09-2026, Windows / Node; geen browser | Onbekend product; ontbrekende barcode | Beide blokkeren | Beide verwachte fouten ontvangen | Geslaagd |
| V07-1: V07: nulpositie blijft bestaan na volledig afboeken | 30-09-2026, Windows / Node; geen browser | Alle 10 afboeken | Nulpositie behouden; historie behouden | 0 op H1; 8 producten; historie 22 | Geslaagd |
| B01-1: B01: koppeling behoudt voorloopnullen, ruwe scan en echte-barcodekenmerk | 30-09-2026, Windows / Node; geen browser | Synthetische testfixture 0001234567895 als gecontroleerde mapping | Voorloopnullen en ruwe code behouden | RawValue exact; ingekorte code zonder match; isDemoBarcode false volgens fixture | Geslaagd |
| B02-1: B02: dubbele en tegenstrijdige koppelingen zijn verboden | 30-09-2026, Windows / Node; geen browser | RawValue nogmaals aan zelfde/ander product koppelen | Dubbele/tegenstrijdige koppeling blokkeren | Beide verwachte fouten ontvangen | Geslaagd |
| B03-1: B03: EAN met ongeldige controlepositie wordt afgewezen | 30-09-2026, Windows / Node; geen browser | EAN-13 met verkeerde controlepositie | Afwijzen | Controlepositiefout ontvangen | Geslaagd |
| B04-1: B04: ongecontroleerde en doosbarcodes worden afgewezen | 30-09-2026, Windows / Node; geen browser | verified false of doosniveau | Geen ongecontroleerde/doosmapping | Beide afgewezen | Geslaagd |
| B05-1: B05: reset herstelt standen, historie, demokoppelingen en ruimtenamen | 30-09-2026, Windows / Node; geen browser | Boeking; eigen mapping/namen; reset | Volledige fictieve demo hersteld | H1 10; historie 21; 9 codes; eigen mapping weg; standaardnamen | Geslaagd |
| T01-1: T01: twintig gelijktijdige frames/opslagpogingen met één operationId boeken één keer | 30-09-2026, Windows / Node; geen browser | 20 gelijktijdige opdrachten met één operationId | Eén mutatie | 1 resultaat-ID; H1 8; historie 22 | Geslaagd |
| T02-1: T02: dezelfde operationId met gewijzigde quantityPacks geeft een fout | 30-09-2026, Windows / Node; geen browser | Bestaande operationId met gewijzigd veld uit testnaam | Fout, geen tweede boeking | Andere gegevens gemeld; historie 22 | Geslaagd |
| T02-2: T02: dezelfde operationId met gewijzigde locationId geeft een fout | 30-09-2026, Windows / Node; geen browser | Bestaande operationId met gewijzigd veld uit testnaam | Fout, geen tweede boeking | Andere gegevens gemeld; historie 22 | Geslaagd |
| T02-3: T02: dezelfde operationId met gewijzigde productId geeft een fout | 30-09-2026, Windows / Node; geen browser | Bestaande operationId met gewijzigd veld uit testnaam | Fout, geen tweede boeking | Andere gegevens gemeld; historie 22 | Geslaagd |
| T02-4: T02: dezelfde operationId met gewijzigde inputSource geeft een fout | 30-09-2026, Windows / Node; geen browser | Bestaande operationId met gewijzigd veld uit testnaam | Fout, geen tweede boeking | Andere gegevens gemeld; historie 22 | Geslaagd |
| T02-5: T02: dezelfde operationId met gewijzigde scannedBarcode geeft een fout | 30-09-2026, Windows / Node; geen browser | Bestaande operationId met gewijzigd veld uit testnaam | Fout, geen tweede boeking | Andere gegevens gemeld; historie 22 | Geslaagd |
| T02-6: T02: dezelfde operationId met gewijzigde type geeft een fout | 30-09-2026, Windows / Node; geen browser | Bestaande operationId met gewijzigd veld uit testnaam | Fout, geen tweede boeking | Andere gegevens gemeld; historie 22 | Geslaagd |
| T03-1: T03: nieuwe bewuste boeking van hetzelfde product krijgt een nieuwe mutatie | 30-09-2026, Windows / Node; geen browser | Twee nieuwe operationIds, hetzelfde product | Twee boekingen | H1 6; historie 23 | Geslaagd |
| T04-1: T04: actuele voorraad wordt in transactie opnieuw gecontroleerd bij concurrerende boekingen | 30-09-2026, Windows / Node; geen browser | Twee gelijktijdige OUT-opdrachten van elk 7 uit 10 | Eén slaagt; één faalt | 1 fulfilled/1 rejected; H1 3; historie 22 | Geslaagd |
| T05-1: T05: schrijffout na voorraadwijziging rolt voorraad en historie volledig terug, retry slaagt eenmaal | 30-09-2026, Windows / Node; geen browser | Geïnjecteerde schrijffout vóór mutatie; retry | Volledige rollback; retry eenmaal | Snapshot gelijk na fout; retry met dezelfde ID geeft één mutatie | Geslaagd |
| C01-1: C01: toestemming wordt pas na een bewuste klik gevraagd, alleen video met ideale achtercamera | 30-09-2026, Windows / jsdom; camera/opslag-mock | Camera-mock; openen en Start klikken | Alleen na klik video met ideale achtercamera | Geen verzoek vóór klik; juiste constraints; inline/muted/autoplay | Geslaagd |
| C02-1: C02: herhaalde cameraframes herkennen eenmaal en stoppen cameratracks | 30-09-2026, Windows / jsdom; camera/opslag-mock | Twee identieke cameramock-frames | Eén herkenning; camera stopt | Callback eenmaal; tracks gestopt | Geslaagd |
| C03-1: C03: sluiten van scanner stopt alle tracks en decoder | 30-09-2026, Windows / jsdom; camera/opslag-mock | Actieve scanner sluiten; camera-mock | Tracks/decoder stoppen | Stopaanroepen geobserveerd | Geslaagd |
| C04-1: C04: achtergrond plaatsen stopt camera en vraagt een nieuwe startactie | 30-09-2026, Windows / jsdom; camera/opslag-mock | visibilitychange naar achtergrond; camera-mock | Camera stopt; geen automatische herstart | Trackstop en melding geobserveerd; één startverzoek | Geslaagd |
| C05-1: C05: laat ontvangen camera na sluiten wordt direct gestopt | 30-09-2026, Windows / jsdom; camera/opslag-mock | Camera-mock komt beschikbaar na sluiten | Late tracks direct stoppen | Tracks gestopt; decoder en herkenning niet gestart | Geslaagd |
| C06-1: C06: fout NotAllowedError geeft een bruikbare Nederlandse melding | 30-09-2026, Windows / jsdom; camera/opslag-mock | DOMException uit testnaam; camera-mock | Specifieke Nederlandse melding | Melding voor geweigerd/geen camera/bezet geobserveerd | Geslaagd |
| C06-2: C06: fout NotFoundError geeft een bruikbare Nederlandse melding | 30-09-2026, Windows / jsdom; camera/opslag-mock | DOMException uit testnaam; camera-mock | Specifieke Nederlandse melding | Melding voor geweigerd/geen camera/bezet geobserveerd | Geslaagd |
| C06-3: C06: fout NotReadableError geeft een bruikbare Nederlandse melding | 30-09-2026, Windows / jsdom; camera/opslag-mock | DOMException uit testnaam; camera-mock | Specifieke Nederlandse melding | Melding voor geweigerd/geen camera/bezet geobserveerd | Geslaagd |
| C07-1: C07: verlopen scantijd stopt de camera en toont tips en uitwijkmogelijkheid | 30-09-2026, Windows / jsdom; camera/opslag-mock | Virtuele klok +20 seconden; camera-mock | Stoppen; tips en handmatige uitwijk | Trackstop en timeoutmelding geobserveerd | Geslaagd |
| U01-1: U01: annuleren maakt geen voorraadmutatie | 30-09-2026, Windows / jsdom; camera/opslag-mock | Bevestiging annuleren | Geen boeking | Service niet aangeroepen; snapshot gelijk | Geslaagd |
| U02-1: U02: twee directe tikken tijdens opslag sturen één opdracht | 30-09-2026, Windows / jsdom; camera/opslag-mock | Twee tikken tijdens nagebootste opslag | Eén opdracht; succes na uitkomst | 1 aanroep; geen voortijdig succes; daarna succes | Geslaagd |
| U03-1: U03: opslagfout toont geen succes, behoudt aantal en hergebruikt operationId bij retry | 30-09-2026, Windows / jsdom; camera/opslag-mock | Opslagfout vóór commit; retry | Invoer behouden; geen succes; zelfde operationId | Aantal 1 behouden; snapshot gelijk na fout; retry slaagt; één mutatie | Geslaagd |
| U04-1: U04: onzekere opslaguitkomst na commit kan ook bij nulvoorraad veilig opnieuw worden opgevraagd | 30-09-2026, Windows / jsdom; camera/opslag-mock | OUT 10; verloren antwoord ná commit; retry bij nulvoorraad | Eerdere uitkomst zonder tweede boeking | Nulstand; succes na retry; precies één mutatie | Geslaagd |

## Browsercontrole

Windows-desktop, Codex In-app Browser (Chromium; exacte versie niet vastgesteld). Omgeving http://127.0.0.1:5173/. Viewporttests bewijzen geen fysieke iPad-/telefoonwerking.

| ID | Datum / apparaat, browser | Invoer | Verwacht | Waargenomen | Status |
|---|---|---|---|---|---|
| W01 | 30-09-2026 / Windows, Codex In-app Browser | Handmatige DEMO-SURPLUS-001; H1 OUT 2, H2 IN 3 | 8/6/4 → 8/9/4; totaal 21 | 10 → 8 en 6 → 9; na verversen 8/9/4 en totaal 21 | Geslaagd |
| W02 | 30-09-2026 / dezelfde browser | Historie na verversen | 23 mutaties; juiste bron en demokenmerk | 23 zichtbaar; laatste twee boekingen handmatig/demobarcode met juiste voor/na | Geslaagd |
| W03 | 30-09-2026 / dezelfde browser | Alle ruimtes kiezen | Beide boekingsacties uitgeschakeld | isEnabled false voor beide | Geslaagd |
| W04 | 30-09-2026 / dezelfde browser | ONBEKEND; synthetische EAN-13; OUT 9 uit 8; annuleren | Fout voor onbekend; EAN match; overboeking blokkeren; niets boeken | Melding zichtbaar; 9 afboeken uitgeschakeld; na annuleren nog 8/9/4, totaal 21 | Geslaagd |
| W05 | 30-09-2026 / dezelfde browser | Demobarcodes openen | 9 symbolen en demo-waarschuwing | 9 SVG-afbeeldingen; Code 128-symbolen en waarschuwing visueel gecontroleerd | Geslaagd |
| W06 | 30-09-2026 / desktop 1180×820 | Landschap voorraad | Twee kolommen; geen pagina-overloop | 680,547 / 412,438 px; overflow false; screenshot bekeken | Geslaagd |
| W07 | 30-09-2026 / desktop 820×1180 | Portret voorraad | Eén kolom; geen pagina-overloop | 757 px; overflow false; screenshot bekeken | Geslaagd |
| W08 | 30-09-2026 / desktop 390×844 | Telefoonformaat | Eén kolom; geen pagina-overloop | 343 px; overflow false; screenshot bekeken; navigatie scrolt afzonderlijk | Geslaagd |

## Fysieke camera- en praktijktests

| ID | Datum / apparaat, browser | Invoer | Verwacht | Waargenomen | Status |
|---|---|---|---|---|---|
| P01 | 30-09-2026 / iPad, iPadOS/browser nog te registreren | Code 128 en EAN-13-democode via echte camera | Correct herkennen en gecontroleerd boeken | Geen fysieke scanopstelling beschikbaar | Niet uitgevoerd |
| P02 | 30-09-2026 / echte iPad portret/landschap | Hoofdroute, schermtoetsenbord, heropenen | Bruikbare bediening en camera | Alleen desktop-viewports getest | Niet uitgevoerd |
| P03 | 30-09-2026 / geschikte smartphone | Hoofdroute met camera | Correcte scan en boeking | Alleen desktop-telefoonformaat bekeken | Niet uitgevoerd |
| P04 | 30-09-2026 / beheerde Surplus-iPad; browser eventueel Edge | Bedrijfsportaal/webclip/camera | Toegestane route werkt | Geen beheerd apparaat of tenanttoegang | Niet uitgevoerd |
| P05 | 30-09-2026 / goedgekeurde HTTPS-omgeving | Eigen browsertab op mobiel | Vertrouwde HTTPS en camerarechten | Geen goedgekeurde mobiele testomgeving ingericht | Niet uitgevoerd |
| P06 | 30-09-2026 / vijf echte gecontroleerde TENA-verpakkingen | 5 × 3 ruimtes × 2 = 30 scans | Voorgesteld doel 27/30 binnen 5 s; geen verkeerde koppeling/boeking | Geen praktijkpogingen uitgevoerd | Niet uitgevoerd |
| P07 | 30-09-2026 / drie medewerkers | Ieder 6 taken na maximaal 1 minuut uitleg | Voorgesteld doel 16/18 zonder hulp; nul verkeerde boekingen | Geen medewerkerstest uitgevoerd | Niet uitgevoerd |
| P08 | 30-09-2026 / fysieke camera | Sluiten, achtergrond, weigering, bezette camera | Camera stopt; melding en handmatige uitwijk | Alleen nagebootste softwaretests uitgevoerd | Niet uitgevoerd |
| P09 | 30-09-2026 / printer | A4 op 100%, daarna camerascan | Volledige symbolen met witte marges en scanbaarheid | SVG en rasterdecoder gecontroleerd; geen fysieke afdruk | Niet uitgevoerd |

## Beperkingen en herstel

C/U-tests gebruiken mocks, geen fysieke camera. B01 gebruikt een synthetische fixture; de testclaim is geen TENA-GTIN-bevestiging. S06 bewijst alleen bronregistratie. Geen Microsoft-koppeling, portaalgoedkeuring, productiehosting, certificering of offline-herlaadbewijs.

Volledige toegankelijkheidsaudit en 200% tekstvergroting zijn niet uitgevoerd. Contrast van de hoofdtekstkleuren is berekend in CONTRAST.md; labels, zichtbare focus en aanraakdoelen zijn in de interface aanwezig.

Een eerdere UI-run vond een probleem met DOMException-camerafouten. Dat is hersteld en de volledige suite is opnieuw uitgevoerd. Deze tabel vermeldt de laatste resultaten.

## Bouw en starter

| ID | Datum / apparaat | Invoer | Verwacht | Waargenomen | Status |
|---|---|---|---|---|---|
| BLD01 | 30-09-2026 / Windows 10.0.26200, Node 24.19.0 | npm run typecheck | Geen typefouten | Exitcode 0 | Geslaagd |
| BLD02 | 30-09-2026 / zelfde omgeving | npm run build | Bruikbare dist-build | Exitcode 0; HTML, CSS en gebundelde JavaScript geschreven. Waarschuwing voor JavaScript-bundel groter dan 500 kB; geen buildfout | Geslaagd |
| BLD03 | 30-09-2026 / zelfde omgeving | Start-Demo.ps1 -Port 5174; HTTP-controle | Server start en geeft HTTP 200 | Vite ready en HTTP 200 | Geslaagd |


## Compleet GitHub-projectpakket

| ID | Datum / omgeving | Invoer | Verwacht | Waargenomen | Status |
|---|---|---|---|---|---|
| GH01 | 30-09-2026 / Windows, Node 24.19.0 | npm test na Pages-configuratie | Alle tests slagen | 57/57 geslaagd | Geslaagd |
| GH02 | 30-09-2026 / dezelfde omgeving | npm run build met relatieve base | Typecontrole slaagt en alle assets laden onder repository-map | Exitcode 0; drie relatieve HTML-assetverwijzingen wijzen naar bestaande bestanden | Geslaagd |
| GH03 | 30-09-2026 / GitHub Actions | Installeren, testen, bouwen en publiceren op GitHub | Groene jobs en werkende HTTPS-URL | Workflow voorbereid; nog niet in een GitHub-account uitgevoerd | Niet uitgevoerd |

