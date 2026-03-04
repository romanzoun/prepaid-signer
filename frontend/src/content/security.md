# Sicherheit bei justSign

Datenschutz und IT-Sicherheit haben bei justSign höchste Priorität. Diese Seite gibt dir einen transparenten Überblick über alle Sicherheitsmassnahmen.

## Technische Sicherheitsmassnahmen

### Transportverschlüsselung

Alle Datenübertragungen zwischen deinem Browser und justSign sind durch **TLS 1.3** verschlüsselt. Ältere Protokollversionen (TLS 1.0, 1.1, SSL) sind deaktiviert.

### Datenverschlüsselung at Rest

Dokumente werden im Ruhezustand mit **AES-256** verschlüsselt gespeichert. Temporäre Speicherung erfolgt ausschliesslich während des aktiven Signaturprozesses – danach werden Dateien unwiderruflich gelöscht.

### Session-Sicherheit

justSign verwendet serverseitige Sessions mit folgenden Schutzmechanismen:

- **HttpOnly Cookie** – kein JavaScript-Zugriff auf das Session-Token
- **SameSite=Lax** – Schutz vor Cross-Site Request Forgery (CSRF)
- **Session-Timeout**: 30 Minuten Inaktivität
- Sessions werden in **Redis** gespeichert (nicht im Browser)

## Signatur-Technologie

### Swisscom All-in Signing Service

Wir nutzen den **Swisscom All-in Signing Service** als Trust Service Provider. Swisscom ist:

- ✅ Akkreditiert nach **eIDAS** (EU-Verordnung Nr. 910/2014)
- ✅ Zertifiziert nach **ZertES** (Schweizer Bundesgesetz)
- ✅ Auf der EU-Vertrauensliste (EUTL) gelistet

Die ausgestellten Signaturen sind:
- **Qualifiziert** (höchste Stufe nach eIDAS/ZertES)
- **Nicht fälschbar** durch kryptografische Bindung an Dokumentinhalt und Zeitstempel
- **Langzeitgültig** und archivierbar (LTA-Format)
- **Gerichtsfest** in der Schweiz und der gesamten EU

### Signaturvalidierung

Signierte Dokumente können jederzeit kostenlos auf [validator.admin.ch](https://www.validator.admin.ch) geprüft werden. Die Validierung ist unabhängig von justSign.

## Zahlungssicherheit

### Stripe

Zahlungen werden ausschliesslich über **Stripe** abgewickelt:

- PCI-DSS **Level 1** zertifiziert (höchste Stufe)
- justSign hat **keinen Zugriff** auf Zahlungsdaten oder Kreditkartennummern
- Keine Speicherung von Zahlungsinformationen auf justSign-Servern
- 3D Secure 2 (3DS2) Unterstützung für zusätzliche Authentifizierung

## Datenhaltung

| Datentyp              | Speicherort      | Aufbewahrungsdauer        |
|----------------------|-----------------|---------------------------|
| PDF-Dokumente         | Schweiz (CH)    | Nur während Signing-Prozess |
| E-Mail-Adressen       | Schweiz (CH)    | 30 Tage nach Abschluss    |
| Zahlungsdaten         | Stripe (US/EU)  | Gemäss Stripe-AGB         |
| Signaturprotokoll     | Schweiz (CH)    | 10 Jahre (ZertES-Pflicht) |
| Session-Daten (Redis) | Schweiz (CH)    | 30 Minuten                |

Alle justSign-eigenen Daten werden **ausschliesslich in der Schweiz** gehosted.

## Compliance

- **DSGVO / GDPR** konform (EU-Datenschutz-Grundverordnung)
- **revDSG** konform (Schweizer Datenschutzgesetz, in Kraft seit 01.09.2023)
- **eIDAS** zertifiziert via Swisscom
- **ZertES** zertifiziert via Swisscom

Details zu Datenschutz und deinen Rechten: [Datenschutzerklärung](/docs/privacy)

## Verantwortliche Offenlegung (Responsible Disclosure)

Sicherheitslücken bitte melden an: **security@swisssigner.ch**

Wir danken für verantwortungsvolle Offenlegung. Gemeldete Lücken werden innerhalb von 48 Stunden bestätigt und schnellstmöglich behoben.

## Weiter lesen

- [Datenschutzerklärung](/docs/privacy)
- [Wie funktioniert justSign?](/docs/how-it-works)
- [FAQ – Häufige Fragen zur Sicherheit](/docs/faq)
