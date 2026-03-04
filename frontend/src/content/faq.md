# Häufig gestellte Fragen (FAQ)

Hier findest du Antworten auf die häufigsten Fragen zu justSign. Nicht dabei? Schreib uns: support@swisssigner.ch

## Allgemein

### Was ist eine qualifizierte elektronische Signatur?

Eine qualifizierte elektronische Signatur (QES) ist die höchste Stufe der elektronischen Signatur. Sie ist rechtlich gleichwertig mit einer handschriftlichen Unterschrift und entspricht den Standards gemäss **eIDAS** (EU-Verordnung Nr. 910/2014) und **ZertES** (Schweizer Bundesgesetz über Zertifizierungsdienste).

QES-Signaturen sind:
- **Gerichtsfest** in der Schweiz und der EU
- **Nicht fälschbar** durch kryptografische Bindung an das Dokument
- **Langzeitgültig** und archivierbar

### Ist justSign kostenlos?

Nein. justSign ist ein Prepaid-Service. Du zahlst **CHF 3.15 pro Signatur (CHF 3.40 inkl. 8.1% MwSt)** – aber es gibt keine Grundgebühren, kein Abo und keine Mindestlaufzeit.

Vollständige Preisübersicht: [Preise & Konditionen](/docs/pricing)

### Brauche ich ein Konto?

Nein. justSign funktioniert vollständig ohne Registrierung. Gib die Daten ein, bezahle, und die Einladungen werden verschickt. Deine Session wird durch einen sicheren, kurzlebigen Cookie verwaltet.

### Ist justSign nur für Unternehmen?

Nein. Privat- und Geschäftskunden können den Service gleichermassen nutzen. Für häufige Nutzung (>20 Signaturen/Monat) kontaktiere uns für ein individuelles Angebot.

## Technisches

### Welche Dateiformate werden unterstützt?

Aktuell ausschliesslich **PDF**. Alle PDF-Versionen (1.0–2.0) werden unterstützt. Andere Formate (Word, Excel) sind in Planung.

### Wie gross darf das PDF sein?

Maximal **20 MB**. Bei grösseren Dokumenten empfehlen wir, das PDF vorher zu komprimieren (z.B. mit Smallpdf oder Adobe Acrobat).

### Ist der Prozess sicher?

Ja. justSign setzt auf mehrere Sicherheitsebenen:

- **TLS 1.3** für alle Datenübertragungen
- **AES-256** für die Verschlüsselung im Ruhezustand
- **Swisscom Sign** als akkreditierter Trust Service Provider (eIDAS, ZertES)
- **Stripe** als PCI-DSS Level 1 zertifizierter Zahlungsabwickler
- Alle Daten werden **ausschliesslich in der Schweiz** gehosted

Detaillierte Sicherheitsinformationen: [Sicherheit bei justSign](/docs/security)

### Kann ich ein signiertes Dokument validieren?

Ja. Signierte Dokumente enthalten einen kryptografischen Signaturstempel. Über [validator.admin.ch](https://www.validator.admin.ch) kannst du die Gültigkeit kostenlos und unabhängig prüfen.

### Wo werden meine Daten gespeichert?

Ausschliesslich in der **Schweiz**. justSign nutzt keine Cloud-Dienste ausserhalb der Schweiz für die Dokument- und Kontaktdatenspeicherung. Zahlungsdaten werden von Stripe (US/EU) verarbeitet.

## Unterzeichner

### Was passiert, wenn ein Unterzeichner die E-Mail nicht erhalten hat?

1. Prüfe den Spam-/Junk-Ordner
2. Stelle sicher, dass die E-Mail-Adresse korrekt eingegeben wurde
3. Falls die E-Mail nach 30 Minuten nicht angekommen ist: support@swisssigner.ch

### Kann ein Unterzeichner den Link ablehnen?

Ja. Unterzeichner können die Signatur ablehnen – in diesem Fall erhältst du eine Benachrichtigung. Der Prozess wird gestoppt und du kannst den Unterzeichner ersetzen oder die Transaktion abbrechen.

### In welcher Reihenfolge wird signiert?

Die Reihenfolge entspricht der Eingabe-Reihenfolge im Formular. Unterzeichner 2 erhält seinen Einladungslink erst, wenn Unterzeichner 1 erfolgreich signiert hat (**sequenzieller Modus**).

### Wie lange ist der Signaturlink gültig?

Der Link ist **30 Tage** gültig. Nach Ablauf erlischt er automatisch. Eine Erinnerungs-E-Mail wird nach 7 Tagen ohne Signatur versandt.

## Zahlung

### Was passiert, wenn die Zahlung fehlschlägt?

Du wirst zur Bezahlseite zurückgeleitet. Das Dokument und die Unterzeichner-Daten bleiben in deiner Session erhalten. Du kannst die Zahlung sofort erneut versuchen.

### Kann ich eine Rechnung erhalten?

Stripe sendet automatisch eine E-Mail-Quittung nach erfolgreicher Zahlung. Für formelle Rechnungen mit Firmenangaben: buchhaltung@swisssigner.ch

### Werden Kreditkartendaten gespeichert?

Nein. Zahlungsdaten werden ausschliesslich von Stripe verarbeitet. justSign hat keinen Zugriff auf Kreditkartendaten. Details: [Datenschutzerklärung](/docs/privacy)

### Kann ich eine Rückerstattung erhalten?

Nicht verwendete Signaturen können innerhalb von 30 Tagen zurückerstattet werden. Bereits versendete Einladungen sind nicht rückerstattungsfähig. Vollständige Bedingungen: [AGB](/docs/terms)

## Rechtliches

### Ist die QES in der Schweiz rechtsgültig?

Ja. Qualifizierte Elektronische Signaturen sind in der Schweiz gemäss **OR Art. 14 Abs. 2bis** rechtsgültig und handschriftlichen Unterschriften gleichgestellt (ausser in gesetzlich vorgeschriebenen Ausnahmen wie Testamente oder Grundbucheinträge).

### Für welche Dokumente eignet sich QES?

QES eignet sich für:
- Arbeitsverträge, Mietverträge, Lieferantenverträge
- Gesellschaftsverträge, Aktionärsbindungsverträge
- Vollmachten, Vereinbarungen, NDAs
- Protokolle, Genehmigungen

Nicht geeignet für: notarielle Urkunden, Testamente, Grundbucheinträge (diese erfordern notarielle Beglaubigung).

Weiter lesen: [Wie funktioniert justSign?](/docs/how-it-works) | [Getting Started](/docs/getting-started)
