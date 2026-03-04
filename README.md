# justSign – Prepaid Digitale Signaturplattform

Eine vollständige Prepaid-Plattform für qualifizierte elektronische Signaturen (QES) in der Schweiz. Kein Abo, kein Konto erforderlich – Nutzer zahlen CHF 3.40/Signatur (inkl. 8.1% MwSt) und erhalten eine gerichtsfeste, eIDAS/ZertES-konforme Signatur via Swisscom Sign.

## Architektur

```
┌─────────────────────────────────────────────────────────────┐
│                        Docker Compose                        │
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   Frontend   │    │   Backend    │    │    Redis     │  │
│  │  (Nginx:80)  │───▶│ (Spring:8080)│───▶│   (:6379)    │  │
│  │  React SPA   │    │  REST API    │    │  Sessions    │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│         │                                                   │
│    Proxy /api/* ──────────────────────────────────────────  │
└─────────────────────────────────────────────────────────────┘
```

**Stack:**
- **Frontend**: React 19 + Vite + TypeScript + React Router v7
- **Backend**: Spring Boot 3.3.5, Java 21, Maven
- **Sessions**: Spring Session Data Redis (HttpOnly Cookie)
- **Proxy**: Nginx (SPA-Fallback + `/api/*` Proxy zum Backend)
- **Zahlungen**: Stripe (Mock, produktionsbereit)
- **Signaturen**: Swisscom All-in Signing Service (Mock, produktionsbereit)

## Schnellstart

```bash
docker compose up --build
```

Anschliessend: http://localhost:3000

- Signatur-Flow: http://localhost:3000/sign
- Dokumentation: http://localhost:3000/docs/how-it-works
- API Health: http://localhost:3000/api/health

## Verzeichnisstruktur

```
prepaid-signer/
├── docker-compose.yml
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
│       ├── App.tsx                  # Routing
│       ├── components/
│       │   ├── Navbar.tsx / .css
│       │   └── Footer.tsx / .css
│       ├── pages/
│       │   ├── HomePage.tsx / .css  # Landingpage
│       │   ├── SignPage.tsx / .css  # 5-Schritt Signatur-Flow
│       │   └── MarkdownPage.tsx / .css  # Dynamische Doku-Seiten
│       ├── content/                 # Markdown SEO-Inhalte
│       │   ├── how-it-works.md
│       │   ├── getting-started.md
│       │   ├── pricing.md
│       │   ├── faq.md
│       │   ├── security.md
│       │   ├── privacy.md
│       │   └── terms.md
│       ├── services/
│       │   ├── api.ts               # Production API-Client
│       │   ├── mockStripe.ts        # Client-seitige Preisberechnung
│       │   └── mockSign.ts          # Mock Swisscom Sign
│       └── test/
│           ├── setup.ts
│           ├── mockStripe.test.ts
│           ├── mockSign.test.ts
│           ├── HomePage.test.tsx
│           ├── SignPage.test.tsx
│           └── Navbar.test.tsx
└── backend/
    ├── Dockerfile
    ├── pom.xml
    └── src/main/java/com/swisssigner/
        ├── PrepaidSignerApplication.java
        ├── controller/
        │   ├── SigningController.java    # POST /api/sign/*
        │   └── HealthController.java    # GET /api/health
        ├── service/
        │   ├── PricingService.java
        │   ├── FileStorageService.java
        │   ├── MockStripeService.java
        │   └── MockSwisscomSignService.java
        ├── model/
        │   ├── Signatory.java
        │   ├── PriceBreakdown.java
        │   ├── InvitationResult.java
        │   └── SigningSessionData.java  # Serializable, in Redis
        └── config/
            └── WebConfig.java           # CORS
```

## API-Endpunkte

| Methode | Pfad                    | Beschreibung                                  |
|--------|------------------------|-----------------------------------------------|
| GET    | `/api/health`           | Health Check (`{"status":"UP"}`)              |
| POST   | `/api/sign/upload`      | PDF hochladen (multipart/form-data)           |
| POST   | `/api/sign/signatories` | Unterzeichner konfigurieren + Preis berechnen |
| POST   | `/api/sign/pay`         | Zahlung verarbeiten (Mock Stripe)             |
| POST   | `/api/sign/invite`      | Signatureinladungen versenden (Mock Swisscom) |
| GET    | `/api/sign/state`       | Aktuellen Session-Status abrufen              |

Alle `/api/sign/*`-Endpunkte verwenden einen gemeinsamen `SIGNER_SESSION`-Cookie für die State-Verwaltung.

## Sessions & State

Die Session-Daten (`SigningSessionData`) werden serverseitig in **Redis** gespeichert:

```java
// Felder in SigningSessionData (Serializable):
String documentName
String documentRef      // Dateipfad auf dem Server
List<Signatory> signatories
PriceBreakdown price
String paymentSessionId
String paymentStatus
List<InvitationResult> invitations
String step             // UPLOAD | SIGNATORIES | PRICING | PAYMENT | DONE
```

Der Cookie `SIGNER_SESSION` enthält ausschliesslich die Session-ID – keine persönlichen Daten. Er ist HttpOnly und SameSite=Lax.

## Preisberechnung

```
Swisscom-Kosten:  CHF 2.50 / Signatur
Marge (20%):      CHF 2.50 / 0.80 = CHF 3.125 → gerundet CHF 3.15
MwSt (8.1%):      CHF 3.15 × 1.081 = CHF 3.405 → CHF 3.40
```

Implementiert in `PricingService.java` (Backend) und `mockStripe.ts` (Client-seitige Vorschau).

## Frontend – Signatur-Flow (5 Schritte)

```
upload → signatories → pricing → payment → done
```

1. **Upload**: PDF per Drag & Drop oder Klick hochladen
2. **Signatories**: Name, E-Mail (Pflicht), Telefon (optional) pro Unterzeichner
3. **Pricing**: Transparente Preisübersicht vor Zahlung
4. **Payment**: Stripe-Integration (aktuell Mock)
5. **Done**: Einladungslinks angezeigt, E-Mails versandt

## SEO-Seiten

Markdown-Inhalte unter `/docs/:slug` werden als statische Chunks per Vite lazy-geladen:

| URL                      | Datei               |
|--------------------------|---------------------|
| `/docs/how-it-works`     | `how-it-works.md`   |
| `/docs/getting-started`  | `getting-started.md`|
| `/docs/pricing`          | `pricing.md`        |
| `/docs/faq`              | `faq.md`            |
| `/docs/security`         | `security.md`       |
| `/docs/privacy`          | `privacy.md`        |
| `/docs/terms`            | `terms.md`          |

Jede Seite hat: `<title>`, `<meta description>`, JSON-LD BreadcrumbList, Breadcrumb-Navigation, Interne Links, "Weiter lesen"-Sektion.

## Tests ausführen

Tests laufen nur innerhalb Docker (keine lokalen Node/Maven-Installationen vorausgesetzt):

```bash
# Frontend-Tests
docker run --rm -v "$(pwd)/frontend:/app" -w /app node:20-alpine \
  sh -c "npm ci && npm test -- --run"

# Backend-Tests
docker run --rm -v "$(pwd)/backend:/app" -w /app maven:3.9-eclipse-temurin-21 \
  mvn test
```

**Test-Coverage:**
- Frontend: 28 Tests (Vitest + @testing-library/react)
- Backend: 13 Tests (JUnit 5, MockMvc, MockHttpSession)

## Docker Services

```yaml
services:
  frontend:   # React SPA via Nginx – Port 3000
  backend:    # Spring Boot REST API – Port 8080
  redis:      # Session-Storage – Port 6379 (intern)
```

Health Checks:
- Backend: `curl -f http://localhost:8080/api/health`
- Redis: `redis-cli ping`

Frontend startet erst, wenn Backend `healthy` ist.

## Produktions-Checkliste

- [ ] Stripe Live-API-Keys als Umgebungsvariablen setzen
- [ ] Swisscom All-in Signing Service Credentials konfigurieren
- [ ] Redis mit Passwort absichern
- [ ] HTTPS/TLS termination einrichten (Load Balancer oder Nginx)
- [ ] `UPLOAD_DIR` auf persistentes Volume setzen
- [ ] CORS-Origins in `WebConfig.java` auf Produktionsdomain beschränken
- [ ] Session-Timeout und Cookie-Domain anpassen
- [ ] Monitoring / Alerting einrichten

## Lizenz

Proprietär – alle Rechte vorbehalten. © 2026 justSign
