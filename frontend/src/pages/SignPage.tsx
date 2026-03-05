import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDocumentSignatureById, localizeDocumentSignature, searchDocumentSignatures } from '../data/documentSignatures'
import { calculatePrice } from '../services/mockStripe'
import * as api from '../services/api'
import type { AnalysisStatusResponse, InviteResponse, PriceBreakdown, Signatory, SignatoryPlacement, SignatureLevel } from '../services/api'
import { type Locale, useI18n } from '../i18n'
import PdfSignaturePlacer from './PdfSignaturePlacer'
import './SignPage.css'

type Step = 'upload' | 'signatureLevel' | 'signatories' | 'placement' | 'pricing' | 'payment' | 'done'

const SIGN_COPY = {
  de: {
    headerTitle: 'Dokument digital signieren',
    headerSubtitle: 'Kein Konto erforderlich. Bezahle nur was du brauchst.',
    errors: {
      pdfOnly: 'Bitte nur PDF-Dateien hochladen.',
      uploadFailed: 'Upload fehlgeschlagen.',
      saveSignatoriesFailed: 'Fehler beim Speichern der Unterzeichner.',
      savePlacementsFailed: 'Fehler beim Speichern der Platzierungen.',
      saveInitiatorFailed: 'Fehler beim Speichern des Initiators.',
      stripeCancelled: 'Zahlung wurde bei Stripe abgebrochen.',
      stripeInvalidReturn: 'Ungültige Rückkehr von Stripe.',
      paymentNotCompleted: 'Zahlung wurde nicht abgeschlossen.',
      paymentPending: 'Zahlung ist noch ausstehend. Bitte kurz warten und erneut versuchen.',
      paymentConfirmFailed: 'Zahlungsprüfung fehlgeschlagen.',
      paymentCancelled: 'Zahlung wurde abgebrochen.',
      checkoutUrlMissing: 'Stripe Checkout URL fehlt.',
      paymentFailed: 'Zahlung fehlgeschlagen. Bitte erneut versuchen.',
      signerNeedsEmail: 'Der ausgewählte Initiator hat keine E-Mail-Adresse. Bitte beim Unterzeichner eine E-Mail eintragen oder "Dritte Person" wählen.',
    },
    stepLabels: {
      upload: 'Upload',
      signatories: 'Unterzeichner',
      placement: 'Platzierung',
      initiator: 'Initiator',
      pricing: 'Preis',
      payment: 'Zahlung',
      done: 'Fertig',
    },
    upload: {
      title: 'Dokument hochladen',
      ariaUpload: 'PDF hochladen',
      chooseOther: 'Andere Datei auswählen',
      dropOrClick: 'PDF hier ablegen oder klicken',
      hint: 'Nur PDF-Dateien · Max. 20 MB',
      uploading: 'Hochladen…',
      next: 'Weiter: Signaturlevel prüfen →',
    },
    signatories: {
      title: 'Unterzeichner konfigurieren',
      desc: 'Gib Vorname, Nachname und E-Mail oder Telefon der Unterzeichner ein.',
      levelHelpStrong: 'Signaturlevel für dieses Dokument:',
      levelHelpText: 'Wähle einmal aus, gilt dann für alle Unterzeichner.',
      levelLabel: 'Signaturlevel für dieses Dokument',
      simpleDesc: 'Einfache elektronische Signatur (niedrigste Hürde)',
      aesDesc: 'Fortgeschrittene elektronische Signatur',
      qesDesc: 'Qualifizierte Signatur (höchste Beweiskraft)',
      firstName: 'Vorname',
      lastName: 'Nachname',
      email: 'E-Mail',
      phoneOptional: 'Telefon (optional)',
      ariaFirstName: 'Vorname Unterzeichner {{index}}',
      ariaLastName: 'Nachname Unterzeichner {{index}}',
      ariaEmail: 'E-Mail Unterzeichner {{index}}',
      ariaPhone: 'Telefon Unterzeichner {{index}}',
      ariaRemove: 'Unterzeichner {{index}} entfernen',
      add: '+ Weiteren Unterzeichner hinzufügen',
      back: '← Zurück',
      saving: 'Speichern…',
      next: 'Weiter: Signaturfelder platzieren →',
    },
    placement: {
      title: 'Signaturfelder platzieren',
      desc: 'Ziehe jeden Unterzeichner auf die gewünschte Stelle im Dokument.',
      coordsTitle: 'Koordinaten pro Unterzeichner',
      notPlaced: 'Noch nicht platziert',
      livePrice: 'Live Preis',
      liveHint: 'Aktualisiert sich mit jeder platzierten Signatur.',
      placedLine: 'Platziert ({{count}} × CHF {{price}} inkl. MwSt)',
      vat: 'MwSt (8.1%)',
      current: 'Aktuell',
      document: 'Dokument',
      totalAll: 'Gesamt (alle Signer)',
      placed: 'platziert',
      open: 'offen',
      back: '← Zurück',
      saving: 'Speichern…',
      next: 'Weiter: Überprüfen →',
      needAllTitle: 'Alle Unterzeichner müssen platziert sein',
      pageCoords: 'Seite {{page}} · X {{x}} · Y {{y}}',
    },
    initiator: {
      title: 'Initiator festlegen',
      desc: 'Der Initiator ist die Person, die den Signaturprozess startet und alle E-Mail-Benachrichtigungen (Einladung, Abschluss, Status) zum Prozess erhält.',
      hintStrong: 'Hinweis:',
      hintText: 'Der Initiator kann einer der Unterzeichner sein oder eine dritte Person.',
      modeLabel: 'Initiator-Typ',
      signerModeTitle: 'Unterzeichner als Initiator',
      signerModeDesc: 'Eine bereits eingetragene Signer-Person wird Initiator.',
      thirdPersonModeTitle: 'Dritte Person',
      thirdPersonModeDesc: 'Jemand ausserhalb der Signer-Liste erhält die Prozess-E-Mails.',
      signerSelectAria: 'Initiator Signer',
      noEmail: 'keine E-Mail',
      firstNameOptional: 'Vorname (optional)',
      lastNameOptional: 'Nachname (optional)',
      requiredEmail: 'E-Mail (erforderlich)',
      firstNameAria: 'Initiator Vorname',
      lastNameAria: 'Initiator Nachname',
      emailAria: 'Initiator E-Mail',
      back: '← Zurück',
      saving: 'Speichern…',
      next: 'Weiter: Preis prüfen →',
    },
    pricing: {
      title: 'Preisübersicht',
      signaturesLine: 'Signaturen ({{count}} × CHF {{price}} inkl. MwSt)',
      vat: 'MwSt (8.1%)',
      total: 'Total',
      level: 'Signaturlevel',
      back: '← Zurück',
      next: 'Weiter: Bezahlen →',
    },
    payment: {
      title: 'Bezahlung',
      secureTitle: 'Sicher bezahlen mit Stripe',
      secureDesc: 'Nach Klick auf "Jetzt bezahlen" wirst du zur sicheren Stripe-Checkout-Seite weitergeleitet.',
      total: 'Total',
      back: '← Zurück',
      processing: 'Verarbeitung…',
      payNow: '💳 Jetzt bezahlen',
    },
    done: {
      title: 'Einladungen verschickt!',
      desc: 'Alle Unterzeichner wurden per E-Mail/SMS benachrichtigt.',
      processTitle: 'Process-ID',
      processDesc: 'Diese ID kannst du im Status Checker einfügen, um den aktuellen Swisscom-Status zu pollen.',
      copyProcessId: 'Kopieren',
      copiedProcessId: 'Kopiert',
      downloadConfirmation: 'Bestaetigung (PDF) herunterladen',
      openStatus: 'Zum Status Checker',
      mockLink: 'Mock-Link →',
      signAnother: 'Weiteres Dokument signieren',
    },
    fallbackDocument: 'Dokument',
    signatoryFallback: 'Unterzeichner {{index}}',
  },
  en: {
    headerTitle: 'Sign document digitally',
    headerSubtitle: 'No account required. Pay only what you need.',
    errors: {
      pdfOnly: 'Please upload PDF files only.',
      uploadFailed: 'Upload failed.',
      saveSignatoriesFailed: 'Failed to save signers.',
      savePlacementsFailed: 'Failed to save placements.',
      saveInitiatorFailed: 'Failed to save initiator.',
      stripeCancelled: 'Payment was cancelled in Stripe.',
      stripeInvalidReturn: 'Invalid return from Stripe.',
      paymentNotCompleted: 'Payment was not completed.',
      paymentPending: 'Payment is still pending. Please wait and try again.',
      paymentConfirmFailed: 'Payment verification failed.',
      paymentCancelled: 'Payment was cancelled.',
      checkoutUrlMissing: 'Stripe Checkout URL is missing.',
      paymentFailed: 'Payment failed. Please try again.',
      signerNeedsEmail: 'The selected initiator has no email address. Please add an email to the signer or choose "Third person".',
    },
    stepLabels: {
      upload: 'Upload',
      signatories: 'Signers',
      placement: 'Placement',
      initiator: 'Initiator',
      pricing: 'Pricing',
      payment: 'Payment',
      done: 'Done',
    },
    upload: {
      title: 'Upload document',
      ariaUpload: 'Upload PDF',
      chooseOther: 'Choose another file',
      dropOrClick: 'Drop PDF here or click',
      hint: 'PDF files only · Max 20 MB',
      uploading: 'Uploading…',
      next: 'Next: Review signature level →',
    },
    signatories: {
      title: 'Configure signers',
      desc: 'Enter first name, last name and email or phone number for each signer.',
      levelHelpStrong: 'Signature level for this document:',
      levelHelpText: 'Select once, applies to all signers.',
      levelLabel: 'Signature level for this document',
      simpleDesc: 'Simple electronic signature (lowest barrier)',
      aesDesc: 'Advanced electronic signature',
      qesDesc: 'Qualified signature (highest evidential value)',
      firstName: 'First name',
      lastName: 'Last name',
      email: 'Email',
      phoneOptional: 'Phone (optional)',
      ariaFirstName: 'First name signer {{index}}',
      ariaLastName: 'Last name signer {{index}}',
      ariaEmail: 'Email signer {{index}}',
      ariaPhone: 'Phone signer {{index}}',
      ariaRemove: 'Remove signer {{index}}',
      add: '+ Add another signer',
      back: '← Back',
      saving: 'Saving…',
      next: 'Next: Place signature fields →',
    },
    placement: {
      title: 'Place signature fields',
      desc: 'Drag each signer to the desired position in the document.',
      coordsTitle: 'Coordinates per signer',
      notPlaced: 'Not placed yet',
      livePrice: 'Live pricing',
      liveHint: 'Updates with every placed signature.',
      placedLine: 'Placed ({{count}} × CHF {{price}} incl. VAT)',
      vat: 'VAT (8.1%)',
      current: 'Current',
      document: 'Document',
      totalAll: 'Total (all signers)',
      placed: 'placed',
      open: 'open',
      back: '← Back',
      saving: 'Saving…',
      next: 'Next: Review →',
      needAllTitle: 'All signers must be placed',
      pageCoords: 'Page {{page}} · X {{x}} · Y {{y}}',
    },
    initiator: {
      title: 'Set initiator',
      desc: 'The initiator starts the signing process and receives all process emails (invitation, completion, status).',
      hintStrong: 'Note:',
      hintText: 'The initiator can be one of the signers or a third person.',
      modeLabel: 'Initiator type',
      signerModeTitle: 'Signer as initiator',
      signerModeDesc: 'An existing signer becomes the initiator.',
      thirdPersonModeTitle: 'Third person',
      thirdPersonModeDesc: 'Someone outside the signer list receives process emails.',
      signerSelectAria: 'Initiator signer',
      noEmail: 'no email',
      firstNameOptional: 'First name (optional)',
      lastNameOptional: 'Last name (optional)',
      requiredEmail: 'Email (required)',
      firstNameAria: 'Initiator first name',
      lastNameAria: 'Initiator last name',
      emailAria: 'Initiator email',
      back: '← Back',
      saving: 'Saving…',
      next: 'Next: Review pricing →',
    },
    pricing: {
      title: 'Pricing summary',
      signaturesLine: 'Signatures ({{count}} × CHF {{price}} incl. VAT)',
      vat: 'VAT (8.1%)',
      total: 'Total',
      level: 'Signature level',
      back: '← Back',
      next: 'Next: Pay →',
    },
    payment: {
      title: 'Payment',
      secureTitle: 'Secure payment with Stripe',
      secureDesc: 'After clicking "Pay now" you will be redirected to Stripe checkout.',
      total: 'Total',
      back: '← Back',
      processing: 'Processing…',
      payNow: '💳 Pay now',
    },
    done: {
      title: 'Invitations sent!',
      desc: 'All signers were notified by email/SMS.',
      processTitle: 'Process ID',
      processDesc: 'Use this ID in the status checker to poll the current Swisscom status.',
      copyProcessId: 'Copy',
      copiedProcessId: 'Copied',
      downloadConfirmation: 'Download confirmation (PDF)',
      openStatus: 'Open status checker',
      mockLink: 'Mock link →',
      signAnother: 'Sign another document',
    },
    fallbackDocument: 'Document',
    signatoryFallback: 'Signer {{index}}',
  },
  fr: {
    headerTitle: 'Signer un document numeriquement',
    headerSubtitle: 'Aucun compte requis. Payez uniquement ce dont vous avez besoin.',
    errors: {
      pdfOnly: 'Veuillez televerser uniquement des fichiers PDF.',
      uploadFailed: 'Echec du televersement.',
      saveSignatoriesFailed: 'Erreur lors de l enregistrement des signataires.',
      savePlacementsFailed: 'Erreur lors de l enregistrement des positions.',
      saveInitiatorFailed: 'Erreur lors de l enregistrement de l initiateur.',
      stripeCancelled: 'Le paiement a ete annule dans Stripe.',
      stripeInvalidReturn: 'Retour Stripe invalide.',
      paymentNotCompleted: 'Le paiement n a pas ete finalise.',
      paymentPending: 'Le paiement est encore en attente. Veuillez patienter et reessayer.',
      paymentConfirmFailed: 'La verification du paiement a echoue.',
      paymentCancelled: 'Le paiement a ete annule.',
      checkoutUrlMissing: 'URL Stripe Checkout manquante.',
      paymentFailed: 'Le paiement a echoue. Veuillez reessayer.',
      signerNeedsEmail: 'L initiateur selectionne n a pas d adresse e-mail. Ajoutez une adresse e-mail au signataire ou choisissez "Tierce personne".',
    },
    stepLabels: {
      upload: 'Import',
      signatories: 'Signataires',
      placement: 'Placement',
      initiator: 'Initiateur',
      pricing: 'Tarif',
      payment: 'Paiement',
      done: 'Termine',
    },
    upload: {
      title: 'Importer le document',
      ariaUpload: 'Importer PDF',
      chooseOther: 'Choisir un autre fichier',
      dropOrClick: 'Deposez le PDF ici ou cliquez',
      hint: 'Fichiers PDF uniquement · Max 20 MB',
      uploading: 'Televersement…',
      next: 'Suivant: verifier le niveau de signature →',
    },
    signatories: {
      title: 'Configurer les signataires',
      desc: 'Saisissez prenom, nom et e-mail ou telephone de chaque signataire.',
      levelHelpStrong: 'Niveau de signature pour ce document:',
      levelHelpText: 'Un seul choix, applique a tous les signataires.',
      levelLabel: 'Niveau de signature pour ce document',
      simpleDesc: 'Signature electronique simple (barriere minimale)',
      aesDesc: 'Signature electronique avancee',
      qesDesc: 'Signature qualifiee (valeur probante maximale)',
      firstName: 'Prenom',
      lastName: 'Nom',
      email: 'E-mail',
      phoneOptional: 'Telephone (optionnel)',
      ariaFirstName: 'Prenom signataire {{index}}',
      ariaLastName: 'Nom signataire {{index}}',
      ariaEmail: 'E-mail signataire {{index}}',
      ariaPhone: 'Telephone signataire {{index}}',
      ariaRemove: 'Supprimer signataire {{index}}',
      add: '+ Ajouter un autre signataire',
      back: '← Retour',
      saving: 'Enregistrement…',
      next: 'Suivant: placer les champs de signature →',
    },
    placement: {
      title: 'Placer les champs de signature',
      desc: 'Glissez chaque signataire a l endroit souhaite dans le document.',
      coordsTitle: 'Coordonnees par signataire',
      notPlaced: 'Pas encore place',
      livePrice: 'Prix en direct',
      liveHint: 'Mise a jour a chaque signature placee.',
      placedLine: 'Places ({{count}} × CHF {{price}} TTC)',
      vat: 'TVA (8.1%)',
      current: 'Actuel',
      document: 'Document',
      totalAll: 'Total (tous les signataires)',
      placed: 'place',
      open: 'ouvert',
      back: '← Retour',
      saving: 'Enregistrement…',
      next: 'Suivant: verifier →',
      needAllTitle: 'Tous les signataires doivent etre places',
      pageCoords: 'Page {{page}} · X {{x}} · Y {{y}}',
    },
    initiator: {
      title: 'Definir l initiateur',
      desc: 'L initiateur demarre le processus de signature et recoit tous les e-mails du processus (invitation, finalisation, statut).',
      hintStrong: 'Info:',
      hintText: 'L initiateur peut etre un des signataires ou une tierce personne.',
      modeLabel: 'Type d initiateur',
      signerModeTitle: 'Signataire comme initiateur',
      signerModeDesc: 'Un signataire deja enregistre devient initiateur.',
      thirdPersonModeTitle: 'Tierce personne',
      thirdPersonModeDesc: 'Une personne hors liste des signataires recoit les e-mails du processus.',
      signerSelectAria: 'Signataire initiateur',
      noEmail: 'pas d e-mail',
      firstNameOptional: 'Prenom (optionnel)',
      lastNameOptional: 'Nom (optionnel)',
      requiredEmail: 'E-mail (obligatoire)',
      firstNameAria: 'Prenom initiateur',
      lastNameAria: 'Nom initiateur',
      emailAria: 'E-mail initiateur',
      back: '← Retour',
      saving: 'Enregistrement…',
      next: 'Suivant: verifier le prix →',
    },
    pricing: {
      title: 'Resume des tarifs',
      signaturesLine: 'Signatures ({{count}} × CHF {{price}} TTC)',
      vat: 'TVA (8.1%)',
      total: 'Total',
      level: 'Niveau de signature',
      back: '← Retour',
      next: 'Suivant: payer →',
    },
    payment: {
      title: 'Paiement',
      secureTitle: 'Paiement securise avec Stripe',
      secureDesc: 'Apres avoir clique sur "Payer maintenant", vous serez redirige vers Stripe Checkout.',
      total: 'Total',
      back: '← Retour',
      processing: 'Traitement…',
      payNow: '💳 Payer maintenant',
    },
    done: {
      title: 'Invitations envoyees !',
      desc: 'Tous les signataires ont ete notifies par e-mail/SMS.',
      processTitle: 'Process ID',
      processDesc: 'Utilisez cet ID dans le status checker pour interroger le statut Swisscom.',
      copyProcessId: 'Copier',
      copiedProcessId: 'Copie',
      downloadConfirmation: 'Telecharger la confirmation (PDF)',
      openStatus: 'Ouvrir le status checker',
      mockLink: 'Lien mock →',
      signAnother: 'Signer un autre document',
    },
    fallbackDocument: 'Document',
    signatoryFallback: 'Signataire {{index}}',
  },
} as const

const STEP_LABELS: Record<Locale, Record<Step, string>> = {
  de: {
    upload: 'Upload',
    signatureLevel: 'Signaturlevel',
    signatories: 'Unterzeichner',
    placement: 'Platzierung',
    pricing: 'Preis',
    payment: 'Zahlung',
    done: 'Fertig',
  },
  en: {
    upload: 'Upload',
    signatureLevel: 'Signature level',
    signatories: 'Signers',
    placement: 'Placement',
    pricing: 'Pricing',
    payment: 'Payment',
    done: 'Done',
  },
  fr: {
    upload: 'Import',
    signatureLevel: 'Niveau de signature',
    signatories: 'Signataires',
    placement: 'Placement',
    pricing: 'Tarif',
    payment: 'Paiement',
    done: 'Termine',
  },
}

const DOCUMENT_TYPE_COPY = {
  de: {
    title: 'Dokumentart',
    desc: 'Optional: Wähle eine Dokumentart, damit wir das passende Signaturlevel empfehlen.',
    searchLabel: 'Dokumentart suchen',
    searchPlaceholder: 'z. B. Arbeitsvertrag, NDA, Mietvertrag',
    noResult: 'Keine Treffer. Bitte passe den Suchbegriff an.',
    selected: 'Ausgewählt',
    recommendedLabel: 'Empfohlen',
  },
  en: {
    title: 'Document type',
    desc: 'Optional: Pick a document type so we can recommend the right signature level.',
    searchLabel: 'Search document type',
    searchPlaceholder: 'e.g. employment contract, NDA, lease agreement',
    noResult: 'No results found. Please refine your search.',
    selected: 'Selected',
    recommendedLabel: 'Recommended',
  },
  fr: {
    title: 'Type de document',
    desc: 'Optionnel: Choisissez un type de document pour recevoir une recommandation de niveau de signature.',
    searchLabel: 'Rechercher un type de document',
    searchPlaceholder: 'ex. contrat de travail, NDA, bail',
    noResult: 'Aucun resultat. Veuillez affiner la recherche.',
    selected: 'Selectionne',
    recommendedLabel: 'Recommande',
  },
} as const

const LEVEL_COPY = {
  de: {
    title: 'Signaturlevel wählen',
    desc: 'Wir haben ein Level vorausgewählt. Du kannst es anpassen.',
    recommendation: 'Basierend auf der Dokumentart "{{documentType}}" empfehlen wir {{level}}.',
    recommendationHint: 'Dieses Level ist bereits vorausgewählt.',
    label: 'Signaturlevel für dieses Dokument',
    simpleDesc: 'Schnell und einfach, für unkritische Unterlagen',
    aesDesc: 'Empfohlen für die meisten Geschäftsunterlagen',
    qesDesc: 'Stärkster Nachweis, mit Identifikation',
    back: '← Zurück',
    next: 'Weiter: Unterzeichner →',
  },
  en: {
    title: 'Choose signature level',
    desc: 'One level is preselected for you. You can still change it.',
    recommendation: 'Based on document type "{{documentType}}", we recommend {{level}}.',
    recommendationHint: 'This level is already preselected.',
    label: 'Signature level for this document',
    simpleDesc: 'Fast and easy, for low-risk documents',
    aesDesc: 'Recommended for most business documents',
    qesDesc: 'Strongest proof, with identification',
    back: '← Back',
    next: 'Next: Signers →',
  },
  fr: {
    title: 'Choisir le niveau de signature',
    desc: 'Un niveau est deja preselectionne. Vous pouvez le modifier.',
    recommendation: 'Selon le type de document "{{documentType}}", nous recommandons {{level}}.',
    recommendationHint: 'Ce niveau est deja preselectionne.',
    label: 'Niveau de signature pour ce document',
    simpleDesc: 'Rapide et simple, pour documents peu sensibles',
    aesDesc: 'Recommande pour la plupart des documents business',
    qesDesc: 'Preuve la plus forte, avec identification',
    back: '← Retour',
    next: 'Suivant: signataires →',
  },
} as const

const STEP_GUIDE_COPY: Record<Locale, Record<Step, { now: string; next: string }>> = {
  de: {
    upload: {
      now: 'Jetzt: PDF hochladen (Dokumentart ist optional).',
      next: 'Danach: Wir empfehlen ein Signaturlevel, das du bestätigen kannst.',
    },
    signatureLevel: {
      now: 'Jetzt: Passendes Signaturlevel prüfen.',
      next: 'Danach: Unterzeichner mit Name und E-Mail/Telefon erfassen.',
    },
    signatories: {
      now: 'Jetzt: Personen eintragen, die unterschreiben sollen.',
      next: 'Danach: Signaturfelder im Dokument platzieren.',
    },
    placement: {
      now: 'Jetzt: Jede Signatur an die richtige Stelle ziehen.',
      next: 'Danach: Preis prüfen und Zahlung starten.',
    },
    pricing: {
      now: 'Jetzt: Kosten transparent prüfen.',
      next: 'Danach: Sicher bezahlen und Einladungen versenden.',
    },
    payment: {
      now: 'Jetzt: Zahlung bei Stripe abschließen.',
      next: 'Danach: Process-ID erhalten und Status prüfen.',
    },
    done: {
      now: 'Fertig: Der Signaturprozess wurde gestartet.',
      next: 'Nächster Schritt: Process-ID speichern oder Status prüfen.',
    },
  },
  en: {
    upload: {
      now: 'Now: Upload your PDF (document type is optional).',
      next: 'Next: We preselect a signature level for your review.',
    },
    signatureLevel: {
      now: 'Now: Review the suggested signature level.',
      next: 'Next: Add signers with name and email/phone.',
    },
    signatories: {
      now: 'Now: Enter the people who need to sign.',
      next: 'Next: Place signature fields inside the document.',
    },
    placement: {
      now: 'Now: Drag each signature to the correct location.',
      next: 'Next: Review pricing and proceed to payment.',
    },
    pricing: {
      now: 'Now: Check the total cost clearly.',
      next: 'Next: Pay securely and send invitations.',
    },
    payment: {
      now: 'Now: Complete payment in Stripe.',
      next: 'Next: Receive the process ID and check status.',
    },
    done: {
      now: 'Done: The signing process has started.',
      next: 'Next step: Save the process ID or open status checker.',
    },
  },
  fr: {
    upload: {
      now: 'Maintenant: Televersez le PDF (type de document optionnel).',
      next: 'Ensuite: Nous preselectionnons un niveau de signature.',
    },
    signatureLevel: {
      now: 'Maintenant: Verifiez le niveau de signature propose.',
      next: 'Ensuite: Ajoutez les signataires avec nom et e-mail/telephone.',
    },
    signatories: {
      now: 'Maintenant: Saisissez les personnes qui doivent signer.',
      next: 'Ensuite: Placez les zones de signature dans le document.',
    },
    placement: {
      now: 'Maintenant: Glissez chaque signature au bon endroit.',
      next: 'Ensuite: Verifiez le prix puis passez au paiement.',
    },
    pricing: {
      now: 'Maintenant: Verifiez clairement le cout total.',
      next: 'Ensuite: Payez en securite et envoyez les invitations.',
    },
    payment: {
      now: 'Maintenant: Finalisez le paiement dans Stripe.',
      next: 'Ensuite: Recevez le process ID et verifiez le statut.',
    },
    done: {
      now: 'Termine: Le processus de signature est lance.',
      next: 'Etape suivante: Conservez le process ID ou ouvrez le status checker.',
    },
  },
}

const ANALYZER_COPY = {
  de: {
    title: 'AI Vertrags-Analyzer (optional)',
    hint: 'Hinweis: Wenn du diese Option aktivierst, werden Vertragsinhalte nach der Zahlung an OpenAI zur Analyse übertragen.',
    buttonAdd: 'AI Analyse hinzufügen (CHF 1.00)',
    buttonRemove: 'AI Analyse entfernen',
    running: 'Wird gespeichert…',
    included: 'Analyse ist zur Rechnung hinzugefügt (+ CHF 1.00).',
    invoiceLine: 'AI Analyzer Zusatz (CHF 1.00)',
    includesTitle: 'Enthalten in der Analyse',
    includes: 'Zusammenfassung, wichtige Fristen/Daten, Pflichten, Risiken, Chancen und Confidence-Score.',
    openResult: 'Analyse ansehen',
    downloadReport: 'Analysebericht (PDF) herunterladen',
    pendingAfterPayment: 'Die Analyse startet nach erfolgreicher Zahlung.',
    polling: 'Analyse wird erstellt. Bitte kurz warten…',
    ready: 'Analyse ist bereit.',
    failed: 'Analyse konnte nicht erstellt werden.',
    processLabel: 'analyticProcessID',
    close: 'Schliessen',
    resultTitle: 'AI Analyseergebnis',
    confidence: 'Confidence',
    keyDates: 'Wichtige Daten',
    topRisks: 'Top Risiken',
    topOps: 'Top Chancen',
  },
  en: {
    title: 'AI Contract Analyzer (optional)',
    hint: 'Notice: if you enable this option, contract content is sent to OpenAI for analysis after payment.',
    buttonAdd: 'Add AI analysis (CHF 1.00)',
    buttonRemove: 'Remove AI analysis',
    running: 'Saving…',
    included: 'Analysis is added to invoice (+ CHF 1.00).',
    invoiceLine: 'AI Analyzer add-on (CHF 1.00)',
    includesTitle: 'Included in analysis',
    includes: 'Summary, key dates/deadlines, obligations, risks, opportunities, and confidence score.',
    openResult: 'View analysis',
    downloadReport: 'Download analysis report (PDF)',
    pendingAfterPayment: 'Analysis starts after successful payment.',
    polling: 'Analysis is running. Please wait…',
    ready: 'Analysis is ready.',
    failed: 'Analysis could not be completed.',
    processLabel: 'analyticProcessID',
    close: 'Close',
    resultTitle: 'AI analysis result',
    confidence: 'Confidence',
    keyDates: 'Key dates',
    topRisks: 'Top risks',
    topOps: 'Top opportunities',
  },
  fr: {
    title: 'Analyseur IA de contrat (optionnel)',
    hint: 'Note: si vous activez cette option, le contenu du contrat est envoye a OpenAI apres paiement.',
    buttonAdd: 'Ajouter analyse IA (CHF 1.00)',
    buttonRemove: 'Retirer analyse IA',
    running: 'Enregistrement…',
    included: 'Analyse ajoutee a la facture (+ CHF 1.00).',
    invoiceLine: 'Supplement AI Analyzer (CHF 1.00)',
    includesTitle: 'Inclus dans l analyse',
    includes: 'Resume, dates/delais importants, obligations, risques, opportunites et score de confiance.',
    openResult: 'Voir l analyse',
    downloadReport: 'Telecharger le rapport d analyse (PDF)',
    pendingAfterPayment: 'L analyse demarre apres le paiement.',
    polling: 'Analyse en cours. Veuillez patienter…',
    ready: 'Analyse prete.',
    failed: 'Analyse impossible.',
    processLabel: 'analyticProcessID',
    close: 'Fermer',
    resultTitle: 'Resultat de l analyse IA',
    confidence: 'Confiance',
    keyDates: 'Dates importantes',
    topRisks: 'Risques principaux',
    topOps: 'Opportunites principales',
  },
} as const

let signatoryCounter = 0

function normalizeSignatureLevel(level?: string): SignatureLevel {
  if (level === 'SIMPLE') return 'SIMPLE'
  return level === 'AES' ? 'AES' : 'QES'
}

function createSignatory(): Signatory {
  signatoryCounter++
  return { id: `sig_${signatoryCounter}`, firstName: '', lastName: '', email: '', phone: '' }
}

function replaceIndex(template: string, index: number): string {
  return template.replace('{{index}}', String(index))
}

function replacePlacement(template: string, count: number, price: number): string {
  return template
    .replace('{{count}}', String(count))
    .replace('{{price}}', price.toFixed(2))
}

function replaceCoords(template: string, page: number, x: number, y: number): string {
  return template
    .replace('{{page}}', String(page))
    .replace('{{x}}', String(x))
    .replace('{{y}}', String(y))
}

function replaceRecommendation(template: string, documentType: string, level: SignatureLevel): string {
  return template
    .replace('{{documentType}}', documentType)
    .replace('{{level}}', level)
}

function asArray(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null) : []
}

function confidenceText(analysis: Record<string, unknown>): string {
  const confidence = analysis.confidence
  if (confidence && typeof confidence === 'object') {
    const score =
      (confidence as Record<string, unknown>).overall_score
      ?? (confidence as Record<string, unknown>).score
    if (typeof score === 'number' || typeof score === 'string') {
      return `${score}/100`
    }
  }
  return 'n/a'
}

function analysisSummaryText(analysis: Record<string, unknown>): string {
  const summary = analysis.summary
  if (typeof summary === 'string') {
    return summary
  }
  if (summary && typeof summary === 'object') {
    const candidate = (summary as Record<string, unknown>).executive
      ?? (summary as Record<string, unknown>).plain_language
    if (typeof candidate === 'string') {
      return candidate
    }
  }
  return ''
}

export default function SignPage() {
  const { locale } = useI18n()
  const copy = SIGN_COPY[locale]
  const documentTypeCopy = DOCUMENT_TYPE_COPY[locale]
  const levelCopy = LEVEL_COPY[locale]
  const stepGuideCopy = STEP_GUIDE_COPY[locale]
  const analyzerCopy = ANALYZER_COPY[locale]

  const [step,        setStep]        = useState<Step>('upload')
  const [file,        setFile]        = useState<File | null>(null)
  const [documentUploaded, setDocumentUploaded] = useState(false)
  const [documentTypeQuery, setDocumentTypeQuery] = useState('')
  const [selectedDocumentTypeId, setSelectedDocumentTypeId] = useState<string | null>(null)
  const [signatories, setSignatories] = useState<Signatory[]>(() => [createSignatory()])
  const [documentSignatureLevel, setDocumentSignatureLevel] = useState<SignatureLevel>('QES')
  const [placements,  setPlacements]  = useState<SignatoryPlacement[]>([])
  const [analysisSelected, setAnalysisSelected] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<Record<string, unknown> | null>(null)
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [analysisModalOpen, setAnalysisModalOpen] = useState(false)
  const [analysisProcessId, setAnalysisProcessId] = useState<string | null>(null)
  const [analysisStatus, setAnalysisStatus] = useState('NOT_REQUESTED')
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [analysisPolling, setAnalysisPolling] = useState(false)
  const [serverPrice, setServerPrice] = useState<PriceBreakdown | null>(null)
  const [loading,     setLoading]     = useState(false)
  const [session,     setSession]     = useState<InviteResponse | null>(null)
  const [processIdCopied, setProcessIdCopied] = useState(false)
  const [error,       setError]       = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const documentTypeSuggestions = useMemo(
    () => searchDocumentSignatures(locale, documentTypeQuery, 6),
    [locale, documentTypeQuery],
  )

  const selectedDocumentType = useMemo(() => {
    if (!selectedDocumentTypeId) return undefined
    const item = getDocumentSignatureById(selectedDocumentTypeId)
    return item ? localizeDocumentSignature(locale, item) : undefined
  }, [locale, selectedDocumentTypeId])

  const recommendedSignatureLevel = selectedDocumentType?.recommendedSignatureLevel ?? 'QES'
  const estimatedPrice = calculatePrice(signatories.length, documentSignatureLevel, analysisSelected)
  const price = serverPrice ?? estimatedPrice

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f && f.type === 'application/pdf') {
      setFile(f)
      setDocumentUploaded(false)
      setAnalysisSelected(false)
      setAnalysisResult(null)
      setAnalysisProcessId(null)
      setAnalysisStatus('NOT_REQUESTED')
      setAnalysisError(null)
      setServerPrice(null)
      setError(null)
    } else if (f) {
      setError(copy.errors.pdfOnly)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f && f.type === 'application/pdf') {
      setFile(f)
      setDocumentUploaded(false)
      setAnalysisSelected(false)
      setAnalysisResult(null)
      setAnalysisProcessId(null)
      setAnalysisStatus('NOT_REQUESTED')
      setAnalysisError(null)
      setServerPrice(null)
      setError(null)
    } else {
      setError(copy.errors.pdfOnly)
    }
  }

  async function handleUploadNext() {
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      if (!documentUploaded) {
        await api.uploadDocument(file)
        setDocumentUploaded(true)
      }
      setStep('signatureLevel')
    } catch (e) {
      setError(e instanceof Error ? e.message : copy.errors.uploadFailed)
    } finally {
      setLoading(false)
    }
  }

  function handleDocumentTypeSelect(id: string) {
    const item = getDocumentSignatureById(id)
    if (!item) return
    const localized = localizeDocumentSignature(locale, item)
    setSelectedDocumentTypeId(id)
    setDocumentTypeQuery(localized.title)
    setDocumentSignatureLevel(item.recommendedSignatureLevel)
    setError(null)
  }

  async function handleSignatoriesNext() {
    setLoading(true)
    setError(null)
    try {
      const result = await api.setSignatories(signatories, documentSignatureLevel)
      setServerPrice(result.price)
      setPlacements([])
      setStep('placement')
    } catch (e) {
      setError(e instanceof Error ? e.message : copy.errors.saveSignatoriesFailed)
    } finally {
      setLoading(false)
    }
  }

  async function handlePlacementNext() {
    setLoading(true)
    setError(null)
    try {
      await api.savePlacements(placements)
      setStep('pricing')
    } catch (e) {
      setError(e instanceof Error ? e.message : copy.errors.savePlacementsFailed)
    } finally {
      setLoading(false)
    }
  }

  function addSignatory() {
    setSignatories((prev) => [...prev, createSignatory()])
  }

  function removeSignatory(id: string) {
    setSignatories((prev) => prev.filter((s) => s.id !== id))
    setPlacements((prev) => prev.filter((p) => p.signatoryId !== id))
  }

  function updateSignatory<K extends keyof Signatory>(id: string, field: K, value: Signatory[K]) {
    setSignatories((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)))
  }

  function isSignatoriesValid() {
    return signatories.every((s) => s.firstName.trim() && s.lastName.trim() && (s.email.trim() || s.phone.trim()))
  }

  const placedIds = new Set(placements.map((p) => p.signatoryId))
  const placedCount = signatories.filter((s) => placedIds.has(s.id)).length
  const allPlaced = signatories.length > 0 && placedCount === signatories.length
  const placedPrice = calculatePrice(placedCount, documentSignatureLevel, analysisSelected)
  const signaturesSubtotal = Number((price.count * (price.perSignatureGross ?? price.perSignature)).toFixed(2))
  const placedSignaturesSubtotal = Number((placedCount * (placedPrice.perSignatureGross ?? placedPrice.perSignature)).toFixed(2))

  async function handleToggleAnalysis() {
    if (!file) return
    setAnalysisLoading(true)
    setError(null)
    setAnalysisError(null)
    try {
      if (!documentUploaded) {
        await api.uploadDocument(file)
        setDocumentUploaded(true)
      }
      const enabled = !analysisSelected
      const response = await api.selectAnalysisAddon(enabled)
      setAnalysisSelected(response.analysisRequested)
      setAnalysisStatus(response.analysisStatus ?? (response.analysisRequested ? 'PENDING_PAYMENT' : 'NOT_REQUESTED'))
      if (response.price) setServerPrice(response.price)
      if (!response.analysisRequested) {
        setAnalysisResult(null)
        setAnalysisProcessId(null)
        setAnalysisModalOpen(false)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'AI analysis selection failed')
    } finally {
      setAnalysisLoading(false)
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const stripeState = params.get('stripe')
    const sessionId = params.get('session_id')
    if (!stripeState) {
      return
    }

    let cancelled = false
    const clearStripeQuery = () => {
      const cleanUrl = `${window.location.pathname}${window.location.hash}`
      window.history.replaceState({}, '', cleanUrl)
    }

    if (stripeState === 'cancel') {
      setStep('payment')
      setError(copy.errors.stripeCancelled)
      clearStripeQuery()
      return
    }

    if (stripeState !== 'success' || !sessionId) {
      setError(copy.errors.stripeInvalidReturn)
      clearStripeQuery()
      return
    }

    const finalizePayment = async () => {
      setLoading(true)
      setError(null)
      setStep('payment')
      try {
        const currentState = await api.getSigningState().catch(() => null)
        if (currentState?.signatories?.length) {
          setSignatories(currentState.signatories)
        }
        if (currentState?.placements) {
          setPlacements(currentState.placements)
        }
        if (currentState?.signatureLevel) {
          setDocumentSignatureLevel(normalizeSignatureLevel(currentState.signatureLevel))
        } else if (currentState?.signatories?.[0]?.signatureLevel) {
          setDocumentSignatureLevel(normalizeSignatureLevel(currentState.signatories[0].signatureLevel))
        }
        setAnalysisSelected(Boolean(currentState?.contractAnalysisRequested))
        setAnalysisProcessId(currentState?.analysisProcessId ?? null)
        setAnalysisStatus(currentState?.analysisStatus ?? (currentState?.contractAnalysisRequested ? 'PENDING_PAYMENT' : 'NOT_REQUESTED'))
        setAnalysisError(currentState?.analysisError ?? null)
        if (currentState?.contractAnalysisResult && typeof currentState.contractAnalysisResult === 'object') {
          setAnalysisResult(currentState.contractAnalysisResult as Record<string, unknown>)
        } else {
          setAnalysisResult(null)
        }
        if (currentState?.price) {
          setServerPrice(currentState.price)
        }

        const payment = await api.confirmPayment(sessionId)
        if (cancelled) return

        if (payment.status === 'success') {
          setAnalysisSelected(Boolean(payment.analysisRequested ?? currentState?.contractAnalysisRequested))
          setAnalysisProcessId(payment.analyticProcessID ?? currentState?.analysisProcessId ?? null)
          setAnalysisStatus(payment.analysisStatus ?? currentState?.analysisStatus ?? 'PENDING_PAYMENT')
          setAnalysisError(payment.analysisError ?? currentState?.analysisError ?? null)
          if (payment.analysis && typeof payment.analysis === 'object') {
            setAnalysisResult(payment.analysis)
          }
          if (payment.invitations?.length) {
            setSession({
              sessionId: payment.sessionId,
              documentName: payment.documentName ?? (currentState?.documentName ?? file?.name ?? copy.fallbackDocument),
              processId: payment.processId ?? currentState?.processId,
              invitations: payment.invitations,
            })
            setStep('done')
          } else {
            const result = await api.sendInvitations()
            if (cancelled) return
            setAnalysisSelected(Boolean(result.analysisRequested ?? analysisSelected))
            setAnalysisProcessId(result.analyticProcessID ?? currentState?.analysisProcessId ?? null)
            if (result.analysisStatus) setAnalysisStatus(result.analysisStatus)
            if (result.analysisError) setAnalysisError(result.analysisError)
            if (result.analysis && typeof result.analysis === 'object') setAnalysisResult(result.analysis)
            setSession(result)
            setStep('done')
          }
        } else if (payment.status === 'cancelled') {
          setError(copy.errors.paymentNotCompleted)
        } else {
          setError(copy.errors.paymentPending)
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : copy.errors.paymentConfirmFailed)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
        clearStripeQuery()
      }
    }

    void finalizePayment()
    return () => {
      cancelled = true
    }
  }, [copy, file?.name])

  useEffect(() => {
    if (step !== 'done' || !analysisSelected) {
      setAnalysisPolling(false)
      return
    }

    let cancelled = false
    let timer: number | null = null

    const refreshAnalysis = async () => {
      try {
        let result: AnalysisStatusResponse
        if (!analysisProcessId) {
          result = await api.startAnalysis({ language: locale, analysisProfile: 'standard' })
        } else {
          result = await api.getAnalysisStatus(analysisProcessId)
        }
        if (cancelled) return

        if (result.analyticProcessID) setAnalysisProcessId(result.analyticProcessID)
        const nextStatus = result.analysisStatus ?? result.status ?? 'PENDING_PAYMENT'
        setAnalysisStatus(nextStatus)
        setAnalysisError(result.analysisError ?? null)
        if (result.analysis && typeof result.analysis === 'object') {
          setAnalysisResult(result.analysis)
        }

        const needsPolling = nextStatus === 'QUEUED' || nextStatus === 'RUNNING' || nextStatus === 'PENDING_PAYMENT'
        setAnalysisPolling(needsPolling)
        if (needsPolling) {
          timer = window.setTimeout(() => {
            void refreshAnalysis()
          }, 3500)
        }
      } catch (e) {
        if (cancelled) return
        const message = e instanceof Error ? e.message : analyzerCopy.failed
        setAnalysisError(message)
        setAnalysisStatus('FAILED')
        setAnalysisPolling(false)
      }
    }

    void refreshAnalysis()
    return () => {
      cancelled = true
      if (timer !== null) window.clearTimeout(timer)
    }
  }, [analysisProcessId, analysisSelected, analyzerCopy.failed, locale, step])

  async function handlePay() {
    setLoading(true)
    setError(null)
    setAnalysisError(null)
    try {
      const payment = await api.processPayment()
      setAnalysisSelected(Boolean(payment.analysisRequested ?? analysisSelected))
      setAnalysisProcessId(payment.analyticProcessID ?? null)
      if (payment.analysisStatus) {
        setAnalysisStatus(payment.analysisStatus)
      }
      if (payment.analysisError) {
        setAnalysisError(payment.analysisError)
      }
      if (payment.analysis && typeof payment.analysis === 'object') {
        setAnalysisResult(payment.analysis)
      }
      if (payment.status === 'success') {
        if (payment.invitations?.length) {
          setSession({
            sessionId: payment.sessionId,
            documentName: payment.documentName ?? file?.name ?? copy.fallbackDocument,
            processId: payment.processId,
            invitations: payment.invitations,
          })
        } else {
          const result = await api.sendInvitations()
          setAnalysisSelected(Boolean(result.analysisRequested ?? analysisSelected))
          setAnalysisProcessId(result.analyticProcessID ?? analysisProcessId)
          if (result.analysisStatus) setAnalysisStatus(result.analysisStatus)
          if (result.analysisError) setAnalysisError(result.analysisError)
          if (result.analysis && typeof result.analysis === 'object') setAnalysisResult(result.analysis)
          setSession(result)
        }
        setStep('done')
        return
      }
      if (payment.status === 'pending' && payment.checkoutUrl) {
        window.location.assign(payment.checkoutUrl)
        return
      }
      if (payment.status === 'cancelled') {
        setError(copy.errors.paymentCancelled)
        return
      }
      setError(copy.errors.checkoutUrlMissing)
    } catch (e) {
      setError(e instanceof Error ? e.message : copy.errors.paymentFailed)
    } finally {
      setLoading(false)
    }
  }

  async function copyProcessId(value: string) {
    try {
      await navigator.clipboard.writeText(value)
      setProcessIdCopied(true)
      window.setTimeout(() => setProcessIdCopied(false), 1400)
    } catch {
      setProcessIdCopied(false)
    }
  }

  return (
    <main className="sign-page">
      <div className="container">
        <div className="sign-header">
          <h1>{copy.headerTitle}</h1>
          <p>{copy.headerSubtitle}</p>
        </div>

        <div className="sign-stepper">
          {(['upload', 'signatureLevel', 'signatories', 'placement', 'pricing', 'payment', 'done'] as Step[]).map((s, i) => (
            <div key={s} className={`stepper-item ${step === s ? 'active' : ''} ${isStepDone(step, s) ? 'done' : ''}`}>
              <div className="stepper-dot">{isStepDone(step, s) ? '✓' : i + 1}</div>
              <span>{stepLabel(s, locale)}</span>
            </div>
          ))}
        </div>

        {error && <div className="sign-error" role="alert">{error}</div>}

        {step === 'upload' && (
          <div className="sign-step card">
            <h2>{copy.upload.title}</h2>
            <div className="step-guide">
              <p>{stepGuideCopy.upload.now}</p>
              <p>{stepGuideCopy.upload.next}</p>
            </div>
            <div
              className={`dropzone ${file ? 'dropzone-filled' : ''}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              aria-label={copy.upload.ariaUpload}
              onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                data-testid="file-input"
              />
              {file ? (
                <>
                  <span className="dropzone-icon">📄</span>
                  <p className="dropzone-filename">{file.name}</p>
                  <p className="dropzone-hint">{copy.upload.chooseOther}</p>
                </>
              ) : (
                <>
                  <span className="dropzone-icon">📂</span>
                  <p>{copy.upload.dropOrClick}</p>
                  <p className="dropzone-hint">{copy.upload.hint}</p>
                </>
              )}
            </div>
            <h3 className="document-type-title">{documentTypeCopy.title}</h3>
            <p className="step-desc">{documentTypeCopy.desc}</p>
            <label className="document-type-label" htmlFor="document-type-search">{documentTypeCopy.searchLabel}</label>
            <input
              id="document-type-search"
              className="document-type-search"
              type="text"
              value={documentTypeQuery}
              onChange={(e) => {
                const value = e.target.value
                setDocumentTypeQuery(value)
                if (selectedDocumentType && value.trim() !== selectedDocumentType.title) {
                  setSelectedDocumentTypeId(null)
                }
              }}
              placeholder={documentTypeCopy.searchPlaceholder}
              autoComplete="off"
            />

            <div className="document-type-results" role="listbox">
              {documentTypeSuggestions.length === 0 && (
                <div className="document-type-empty">{documentTypeCopy.noResult}</div>
              )}
              {documentTypeSuggestions.map((item) => (
                <button
                  key={item.id}
                  className={`document-type-option ${selectedDocumentType?.id === item.id ? 'selected' : ''}`}
                  aria-selected={selectedDocumentType?.id === item.id}
                  type="button"
                  onClick={() => handleDocumentTypeSelect(item.id)}
                >
                  <div className="document-type-option-top">
                    <strong>{item.title}</strong>
                    <span className="document-type-level">
                      {documentTypeCopy.recommendedLabel}: {item.recommendedSignatureLevel}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {selectedDocumentType && (
              <div className="document-type-selected">
                <strong>{documentTypeCopy.selected}:</strong> {selectedDocumentType.title} ({recommendedSignatureLevel})
              </div>
            )}

            <div className="analysis-upsell card">
              <h4>{analyzerCopy.title}</h4>
              <p>{analyzerCopy.hint}</p>
              <p><strong>{analyzerCopy.includesTitle}:</strong> {analyzerCopy.includes}</p>
              <div className="analysis-upsell-actions">
                <button
                  className="btn btn-outline"
                  type="button"
                  disabled={!file || analysisLoading}
                  onClick={() => void handleToggleAnalysis()}
                >
                  {analysisLoading
                    ? analyzerCopy.running
                    : (analysisSelected ? analyzerCopy.buttonRemove : analyzerCopy.buttonAdd)}
                </button>
                {analysisResult && (
                  <button
                    className="btn btn-ghost"
                    type="button"
                    onClick={() => setAnalysisModalOpen(true)}
                  >
                    {analyzerCopy.openResult}
                  </button>
                )}
              </div>
              {analysisSelected && (
                <div className="analysis-upsell-note">
                  {analyzerCopy.included}
                </div>
              )}
              {analysisSelected && (
                <div className="analysis-upsell-note">{analyzerCopy.pendingAfterPayment}</div>
              )}
            </div>

            <div className="step-actions">
              <button className="btn btn-primary" disabled={!file || loading} onClick={handleUploadNext}>
                {loading ? copy.upload.uploading : copy.upload.next}
              </button>
            </div>
          </div>
        )}

        {step === 'signatureLevel' && (
          <div className="sign-step card">
            <h2>{levelCopy.title}</h2>
            <p className="step-desc">{levelCopy.desc}</p>
            <div className="step-guide">
              <p>{stepGuideCopy.signatureLevel.now}</p>
              <p>{stepGuideCopy.signatureLevel.next}</p>
            </div>

            {selectedDocumentType && (
              <div className="signature-level-recommendation">
                <strong>{replaceRecommendation(levelCopy.recommendation, selectedDocumentType.title, recommendedSignatureLevel)}</strong>
                <p>{levelCopy.recommendationHint}</p>
              </div>
            )}

            <div className="document-level-select" role="radiogroup" aria-label={levelCopy.label}>
              <label className={`document-level-option ${recommendedSignatureLevel === 'SIMPLE' ? 'recommended' : ''}`}>
                <input
                  type="radio"
                  name="document-signature-level"
                  checked={documentSignatureLevel === 'SIMPLE'}
                  onChange={() => setDocumentSignatureLevel('SIMPLE')}
                />
                <span>
                  <strong>SIMPLE</strong>
                  <small>{levelCopy.simpleDesc}</small>
                </span>
              </label>
              <label className={`document-level-option ${recommendedSignatureLevel === 'AES' ? 'recommended' : ''}`}>
                <input
                  type="radio"
                  name="document-signature-level"
                  checked={documentSignatureLevel === 'AES'}
                  onChange={() => setDocumentSignatureLevel('AES')}
                />
                <span>
                  <strong>AES</strong>
                  <small>{levelCopy.aesDesc}</small>
                </span>
              </label>
              <label className={`document-level-option ${recommendedSignatureLevel === 'QES' ? 'recommended' : ''}`}>
                <input
                  type="radio"
                  name="document-signature-level"
                  checked={documentSignatureLevel === 'QES'}
                  onChange={() => setDocumentSignatureLevel('QES')}
                />
                <span>
                  <strong>QES</strong>
                  <small>{levelCopy.qesDesc}</small>
                </span>
              </label>
            </div>

            <div className="step-actions">
              <button className="btn btn-ghost" onClick={() => setStep('upload')}>{levelCopy.back}</button>
              <button className="btn btn-primary" onClick={() => setStep('signatories')}>
                {levelCopy.next}
              </button>
            </div>
          </div>
        )}

        {step === 'signatories' && (
          <div className="sign-step card">
            <h2>{copy.signatories.title}</h2>
            <p className="step-desc">{copy.signatories.desc}</p>
            <div className="step-guide">
              <p>{stepGuideCopy.signatories.now}</p>
              <p>{stepGuideCopy.signatories.next}</p>
            </div>
            <div className="signatories-list">
              {signatories.map((s, i) => (
                <div key={s.id} className="signatory-row">
                  <div className="signatory-num">{i + 1}</div>
                  <div className="signatory-fields">
                    <input
                      type="text"
                      placeholder={copy.signatories.firstName}
                      value={s.firstName}
                      onChange={(e) => updateSignatory(s.id, 'firstName', e.target.value)}
                      aria-label={replaceIndex(copy.signatories.ariaFirstName, i + 1)}
                    />
                    <input
                      type="text"
                      placeholder={copy.signatories.lastName}
                      value={s.lastName}
                      onChange={(e) => updateSignatory(s.id, 'lastName', e.target.value)}
                      aria-label={replaceIndex(copy.signatories.ariaLastName, i + 1)}
                    />
                    <input
                      type="email"
                      placeholder={copy.signatories.email}
                      value={s.email}
                      onChange={(e) => updateSignatory(s.id, 'email', e.target.value)}
                      aria-label={replaceIndex(copy.signatories.ariaEmail, i + 1)}
                    />
                    <input
                      type="tel"
                      placeholder={copy.signatories.phoneOptional}
                      value={s.phone}
                      onChange={(e) => updateSignatory(s.id, 'phone', e.target.value)}
                      aria-label={replaceIndex(copy.signatories.ariaPhone, i + 1)}
                    />
                  </div>
                  {signatories.length > 1 && (
                    <button
                      className="btn btn-ghost signatory-remove"
                      onClick={() => removeSignatory(s.id)}
                      aria-label={replaceIndex(copy.signatories.ariaRemove, i + 1)}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button className="btn btn-ghost add-signatory" onClick={addSignatory}>
              {copy.signatories.add}
            </button>
            <div className="step-actions">
              <button className="btn btn-ghost" onClick={() => setStep('signatureLevel')}>{copy.signatories.back}</button>
              <button
                className="btn btn-primary"
                disabled={!isSignatoriesValid() || loading}
                onClick={handleSignatoriesNext}
              >
                {loading ? copy.signatories.saving : copy.signatories.next}
              </button>
            </div>
          </div>
        )}

        {step === 'placement' && file && (
          <div className="sign-step card placement-card">
            <h2>{copy.placement.title}</h2>
            <p className="step-desc">{copy.placement.desc}</p>
            <div className="step-guide">
              <p>{stepGuideCopy.placement.now}</p>
              <p>{stepGuideCopy.placement.next}</p>
            </div>
            <div className="placement-layout">
              <div className="placement-workspace">
                <PdfSignaturePlacer
                  file={file}
                  signatories={signatories}
                  placements={placements}
                  onChange={setPlacements}
                />
                <div className="placement-summary">
                  <h3>{copy.placement.coordsTitle}</h3>
                  {signatories.map((s, index) => {
                    const placement = placements.find((pl) => pl.signatoryId === s.id)
                    const label = signatoryLabel(s, index, locale)
                    return (
                      <div key={s.id} className="placement-row">
                        <span className="placement-name">{label}</span>
                        <span className="placement-values">
                          {placement
                            ? replaceCoords(copy.placement.pageCoords, placement.page, placement.x, placement.y)
                            : copy.placement.notPlaced}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <aside className="placement-price-panel card">
                <h3>{copy.placement.livePrice}</h3>
                <p className="placement-price-hint">{copy.placement.liveHint}</p>

                <div className="price-breakdown placement-price-breakdown">
                  <div className="price-row">
                    <span>{replacePlacement(copy.placement.placedLine, placedCount, placedPrice.perSignatureGross ?? placedPrice.perSignature)}</span>
                    <span>CHF {placedSignaturesSubtotal.toFixed(2)}</span>
                  </div>
                  {analysisSelected && (
                    <div className="price-row">
                      <span>{analyzerCopy.invoiceLine}</span>
                      <span>CHF {(placedPrice.analysisGross ?? 0).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="price-row">
                    <span>{copy.placement.vat}</span>
                    <span>CHF {placedPrice.tax.toFixed(2)}</span>
                  </div>
                  <div className="price-row price-total">
                    <span>{copy.placement.current}</span>
                    <span>CHF {placedPrice.total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="placement-price-meta">
                  <div className="placement-price-meta-row">
                    <span>{copy.placement.document}</span>
                    <strong>{file.name}</strong>
                  </div>
                  <div className="placement-price-meta-row">
                    <span>{copy.placement.totalAll}</span>
                    <strong>CHF {price.total.toFixed(2)}</strong>
                  </div>
                </div>

                <div className="placement-review-list">
                  {signatories.map((s, index) => {
                    const isPlaced = placedIds.has(s.id)
                    const label = signatoryLabel(s, index, locale)
                    return (
                      <div key={s.id} className="placement-review-row">
                        <span>{isPlaced ? '✓' : '○'} {label}</span>
                        <span>{isPlaced ? copy.placement.placed : copy.placement.open}</span>
                      </div>
                    )
                  })}
                </div>

                <div className="step-actions placement-actions">
                  <button className="btn btn-ghost" onClick={() => setStep('signatories')}>{copy.placement.back}</button>
                  <button
                    className="btn btn-primary"
                    disabled={!allPlaced || loading}
                    onClick={handlePlacementNext}
                    title={!allPlaced ? copy.placement.needAllTitle : undefined}
                  >
                    {loading ? copy.placement.saving : copy.placement.next}
                  </button>
                </div>
              </aside>
            </div>
          </div>
        )}

        {step === 'pricing' && (
          <div className="sign-step card">
            <h2>{copy.pricing.title}</h2>
            <div className="step-guide">
              <p>{stepGuideCopy.pricing.now}</p>
              <p>{stepGuideCopy.pricing.next}</p>
            </div>
            <div className="price-breakdown">
              <div className="price-row">
                <span>{replacePlacement(copy.pricing.signaturesLine, price.count, price.perSignatureGross ?? price.perSignature)}</span>
                <span>CHF {signaturesSubtotal.toFixed(2)}</span>
              </div>
              {analysisSelected && (
                <div className="price-row">
                  <span>{analyzerCopy.invoiceLine}</span>
                  <span>CHF {(price.analysisGross ?? 0).toFixed(2)}</span>
                </div>
              )}
              <div className="price-row">
                <span>{copy.pricing.vat}</span>
                <span>CHF {price.tax.toFixed(2)}</span>
              </div>
              <div className="price-row price-total">
                <span>{copy.pricing.total}</span>
                <span>CHF {price.total.toFixed(2)}</span>
              </div>
            </div>
            <div className="price-doc">
              <span>📄 {file?.name}</span>
            </div>
            <div className="price-signatories">
              {signatories.map((s, index) => (
                <div key={s.id} className="price-signatory">
                  <span>👤 {signatoryLabel(s, index, locale)}</span>
                  <span>{s.email || s.phone}</span>
                </div>
              ))}
            </div>
            <div className="price-doc">
              <span>{copy.pricing.level}: <strong>{documentSignatureLevel}</strong></span>
            </div>
            {analysisSelected && (
              <div className="price-doc">
                <span><strong>AI Analyzer:</strong> {analyzerCopy.includes}</span>
              </div>
            )}
            <div className="step-actions">
              <button className="btn btn-ghost" onClick={() => setStep('placement')}>{copy.pricing.back}</button>
              <button className="btn btn-primary" onClick={() => setStep('payment')}>
                {copy.pricing.next}
              </button>
            </div>
          </div>
        )}

        {step === 'payment' && (
          <div className="sign-step card">
            <h2>{copy.payment.title}</h2>
            <div className="step-guide">
              <p>{stepGuideCopy.payment.now}</p>
              <p>{stepGuideCopy.payment.next}</p>
            </div>
            <div className="payment-mock-notice">
              <span>🔒</span>
              <div>
                <strong>{copy.payment.secureTitle}</strong>
                <p>{copy.payment.secureDesc}</p>
              </div>
            </div>
            <div className="payment-summary">
              <span>{copy.payment.total}</span>
              <span className="payment-total">CHF {price.total.toFixed(2)}</span>
            </div>
            {analysisSelected && (
              <div className="price-doc">
                <span>{analyzerCopy.invoiceLine} · {analyzerCopy.includes}</span>
              </div>
            )}
            <div className="step-actions">
              <button className="btn btn-ghost" onClick={() => setStep('pricing')}>{copy.payment.back}</button>
              <button className="btn btn-primary" onClick={handlePay} disabled={loading}>
                {loading ? copy.payment.processing : copy.payment.payNow}
              </button>
            </div>
          </div>
        )}

        {step === 'done' && session && (
          <div className="sign-step card sign-done">
            <div className="done-icon">✅</div>
            <h2>{copy.done.title}</h2>
            <p>{copy.done.desc}</p>
            <div className="step-guide step-guide-done">
              <p>{stepGuideCopy.done.now}</p>
              <p>{stepGuideCopy.done.next}</p>
            </div>
            {session.processId && (
              <div className="done-process card">
                <h3>{copy.done.processTitle}</h3>
                <p>{copy.done.processDesc}</p>
                <div className="done-process-row">
                  <code>{session.processId}</code>
                  <button
                    className="btn btn-ghost done-process-copy"
                    type="button"
                    onClick={() => void copyProcessId(session.processId!)}
                    aria-label={copy.done.copyProcessId}
                    title={copy.done.copyProcessId}
                  >
                    📋 {processIdCopied ? copy.done.copiedProcessId : copy.done.copyProcessId}
                  </button>
                </div>
                <div className="done-process-link">
                  <Link to={`/status?processId=${encodeURIComponent(session.processId)}`}>
                    {copy.done.openStatus}
                  </Link>
                </div>
                <div className="done-process-link">
                  <a
                    href={`/api/sign/confirmation?processId=${encodeURIComponent(session.processId)}&lang=${encodeURIComponent(locale)}`}
                    className="done-process-download"
                  >
                    {copy.done.downloadConfirmation}
                  </a>
                </div>
              </div>
            )}
            {analysisSelected && (
              <div className="done-process card">
                <h3>{analyzerCopy.title}</h3>
                <p>{analyzerCopy.includes}</p>
                {analysisProcessId && (
                  <div className="done-process-row">
                    <span>{analyzerCopy.processLabel}</span>
                    <code>{analysisProcessId}</code>
                  </div>
                )}
                {(analysisStatus === 'QUEUED' || analysisStatus === 'RUNNING' || analysisStatus === 'PENDING_PAYMENT') && (
                  <div className="done-process-link">
                    <span>
                      {analysisPolling && <span className="analysis-spinner" aria-hidden="true" />}
                      {analyzerCopy.polling}
                    </span>
                  </div>
                )}
                {analysisStatus === 'COMPLETED' && (
                  <>
                    <div className="done-process-link">
                      <span>{analyzerCopy.ready}</span>
                    </div>
                    {analysisResult && (
                      <div className="done-process-link">
                        <button className="btn btn-ghost" type="button" onClick={() => setAnalysisModalOpen(true)}>
                          {analyzerCopy.openResult}
                        </button>
                      </div>
                    )}
                    {analysisProcessId && (
                      <div className="done-process-link">
                        <a
                          href={`/api/sign/analysis/report?analyticProcessID=${encodeURIComponent(analysisProcessId)}&lang=${encodeURIComponent(locale)}`}
                          className="done-process-download"
                        >
                          {analyzerCopy.downloadReport}
                        </a>
                      </div>
                    )}
                  </>
                )}
                {(analysisStatus === 'FAILED' || analysisError) && (
                  <div className="done-process-link">
                    <span>{analyzerCopy.failed} {analysisError ? `(${analysisError})` : ''}</span>
                  </div>
                )}
              </div>
            )}
            <div className="done-invitations">
              {session.invitations.map((inv, index) => (
                <div key={inv.signatory.id} className="done-invite">
                  <div>
                    <strong>{signatoryLabel(inv.signatory, index, locale)}</strong>
                    <span>{inv.signatory.email || inv.signatory.phone}</span>
                  </div>
                  <a href={inv.inviteLink} className="invite-link" target="_blank" rel="noreferrer">
                    {copy.done.mockLink}
                  </a>
                </div>
              ))}
            </div>
            <button
              className="btn btn-outline"
              onClick={() => {
                const initialSignatories = [createSignatory()]
                setStep('upload')
                setFile(null)
                setDocumentUploaded(false)
                setDocumentTypeQuery('')
                setSelectedDocumentTypeId(null)
                setSignatories(initialSignatories)
                setDocumentSignatureLevel('QES')
                setPlacements([])
                setAnalysisSelected(false)
                setAnalysisResult(null)
                setAnalysisModalOpen(false)
                setAnalysisProcessId(null)
                setAnalysisStatus('NOT_REQUESTED')
                setAnalysisError(null)
                setAnalysisPolling(false)
                setServerPrice(null)
                setProcessIdCopied(false)
                setSession(null)
              }}
            >
              {copy.done.signAnother}
            </button>
          </div>
        )}

        {analysisModalOpen && analysisResult && (
          <div className="analysis-overlay" role="dialog" aria-modal="true" aria-label={analyzerCopy.resultTitle}>
            <div className="analysis-modal card">
              <h3>{analyzerCopy.resultTitle}</h3>
              <p className="analysis-modal-summary">{analysisSummaryText(analysisResult)}</p>
              <p><strong>{analyzerCopy.confidence}:</strong> {confidenceText(analysisResult)}</p>

              {asArray(analysisResult.key_dates).length > 0 && (
                <div className="analysis-modal-block">
                  <h4>{analyzerCopy.keyDates}</h4>
                  <ul>
                    {asArray(analysisResult.key_dates).slice(0, 4).map((item, idx) => (
                      <li key={`kd-${idx}`}>
                        {String(item.date ?? 'n/a')} - {String(item.label ?? item.description ?? '')}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {asArray(analysisResult.risks).length > 0 && (
                <div className="analysis-modal-block">
                  <h4>{analyzerCopy.topRisks}</h4>
                  <ul>
                    {asArray(analysisResult.risks).slice(0, 3).map((item, idx) => (
                      <li key={`risk-${idx}`}>{String(item.risk ?? item.title ?? '')}</li>
                    ))}
                  </ul>
                </div>
              )}

              {asArray(analysisResult.opportunities).length > 0 && (
                <div className="analysis-modal-block">
                  <h4>{analyzerCopy.topOps}</h4>
                  <ul>
                    {asArray(analysisResult.opportunities).slice(0, 3).map((item, idx) => (
                      <li key={`opp-${idx}`}>{String(item.opportunity ?? item.title ?? '')}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="analysis-modal-actions">
                <button className="btn btn-primary" type="button" onClick={() => setAnalysisModalOpen(false)}>
                  {analyzerCopy.close}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

function isStepDone(current: Step, check: Step): boolean {
  const order: Step[] = ['upload', 'signatureLevel', 'signatories', 'placement', 'pricing', 'payment', 'done']
  return order.indexOf(current) > order.indexOf(check)
}

function stepLabel(step: Step, locale: Locale): string {
  return STEP_LABELS[locale][step]
}

function signatoryLabel(s: Signatory, index: number, locale: Locale): string {
  const full = `${s.firstName ?? ''} ${s.lastName ?? ''}`.trim()
  return full || SIGN_COPY[locale].signatoryFallback.replace('{{index}}', String(index + 1))
}
