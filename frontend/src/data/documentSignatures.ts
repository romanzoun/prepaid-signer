import type { Locale } from '../i18n'
import type { SignatureLevel } from '../services/api'

export interface DocumentSignatureCatalogItem {
  id: string
  recommendedSignatureLevel: SignatureLevel
  title: Record<Locale, string>
  description: Record<Locale, string>
  searchTerms: Record<Locale, string[]>
}

export const DOCUMENT_SIGNATURE_CATALOG: DocumentSignatureCatalogItem[] = [
  {
    "id": "doc_001_nda-geheimhaltungsvereinbarung",
    "recommendedSignatureLevel": "AES",
    "title": {
      "de": "NDA / Geheimhaltungsvereinbarung",
      "en": "NDA / Geheimhaltungsvereinbarung",
      "fr": "NDA / Geheimhaltungsvereinbarung"
    },
    "description": {
      "de": "Vertrag zum Schutz vertraulicher Informationen zwischen Parteien",
      "en": "Vertrag zum Schutz vertraulicher Informationen zwischen Parteien",
      "fr": "Vertrag zum Schutz vertraulicher Informationen zwischen Parteien"
    },
    "searchTerms": {
      "de": [
        "NDA / Geheimhaltungsvereinbarung",
        "NDA",
        "Non Disclosure",
        "Geheimhaltung",
        "Confidentiality"
      ],
      "en": [
        "NDA / Geheimhaltungsvereinbarung",
        "NDA",
        "Non Disclosure",
        "Geheimhaltung",
        "Confidentiality"
      ],
      "fr": [
        "NDA / Geheimhaltungsvereinbarung",
        "NDA",
        "Non Disclosure",
        "Geheimhaltung",
        "Confidentiality"
      ]
    }
  },
  {
    "id": "doc_002_mutual-nda",
    "recommendedSignatureLevel": "AES",
    "title": {
      "de": "Mutual NDA",
      "en": "Mutual NDA",
      "fr": "Mutual NDA"
    },
    "description": {
      "de": "Beide Parteien verpflichten sich zur Geheimhaltung",
      "en": "Beide Parteien verpflichten sich zur Geheimhaltung",
      "fr": "Beide Parteien verpflichten sich zur Geheimhaltung"
    },
    "searchTerms": {
      "de": [
        "Mutual NDA",
        "beidseitige Geheimhaltung"
      ],
      "en": [
        "Mutual NDA",
        "beidseitige Geheimhaltung"
      ],
      "fr": [
        "Mutual NDA",
        "beidseitige Geheimhaltung"
      ]
    }
  },
  {
    "id": "doc_003_kooperationsvertrag",
    "recommendedSignatureLevel": "AES",
    "title": {
      "de": "Kooperationsvertrag",
      "en": "Kooperationsvertrag",
      "fr": "Kooperationsvertrag"
    },
    "description": {
      "de": "Regelt Zusammenarbeit zwischen Organisationen",
      "en": "Regelt Zusammenarbeit zwischen Organisationen",
      "fr": "Regelt Zusammenarbeit zwischen Organisationen"
    },
    "searchTerms": {
      "de": [
        "Kooperationsvertrag",
        "Kooperation",
        "Partnership",
        "Zusammenarbeit"
      ],
      "en": [
        "Kooperationsvertrag",
        "Kooperation",
        "Partnership",
        "Zusammenarbeit"
      ],
      "fr": [
        "Kooperationsvertrag",
        "Kooperation",
        "Partnership",
        "Zusammenarbeit"
      ]
    }
  },
  {
    "id": "doc_004_rahmenvertrag",
    "recommendedSignatureLevel": "AES",
    "title": {
      "de": "Rahmenvertrag",
      "en": "Framework Agreement",
      "fr": "Framework Agreement"
    },
    "description": {
      "de": "Übergeordneter Vertrag für zukünftige Einzelverträge",
      "en": "Übergeordneter Vertrag für zukünftige Einzelverträge",
      "fr": "Übergeordneter Vertrag für zukünftige Einzelverträge"
    },
    "searchTerms": {
      "de": [
        "Rahmenvertrag",
        "Framework Agreement",
        "Master Agreement"
      ],
      "en": [
        "Framework Agreement",
        "Rahmenvertrag",
        "Master Agreement"
      ],
      "fr": [
        "Framework Agreement",
        "Rahmenvertrag",
        "Master Agreement"
      ]
    }
  },
  {
    "id": "doc_005_dienstleistungsvertrag",
    "recommendedSignatureLevel": "AES",
    "title": {
      "de": "Dienstleistungsvertrag",
      "en": "Service Agreement",
      "fr": "Service Agreement"
    },
    "description": {
      "de": "Vertrag über Dienstleistungen und Vergütung",
      "en": "Vertrag über Dienstleistungen und Vergütung",
      "fr": "Vertrag über Dienstleistungen und Vergütung"
    },
    "searchTerms": {
      "de": [
        "Dienstleistungsvertrag",
        "Service Agreement",
        "Consulting Vertrag"
      ],
      "en": [
        "Service Agreement",
        "Dienstleistungsvertrag",
        "Consulting Vertrag"
      ],
      "fr": [
        "Service Agreement",
        "Dienstleistungsvertrag",
        "Consulting Vertrag"
      ]
    }
  },
  {
    "id": "doc_006_werkvertrag",
    "recommendedSignatureLevel": "AES",
    "title": {
      "de": "Werkvertrag",
      "en": "Werkvertrag",
      "fr": "Werkvertrag"
    },
    "description": {
      "de": "Vertrag über Erstellung eines Werkes mit Abnahme",
      "en": "Vertrag über Erstellung eines Werkes mit Abnahme",
      "fr": "Vertrag über Erstellung eines Werkes mit Abnahme"
    },
    "searchTerms": {
      "de": [
        "Werkvertrag",
        "Deliverable"
      ],
      "en": [
        "Werkvertrag",
        "Deliverable"
      ],
      "fr": [
        "Werkvertrag",
        "Deliverable"
      ]
    }
  },
  {
    "id": "doc_007_beratungsvertrag",
    "recommendedSignatureLevel": "AES",
    "title": {
      "de": "Beratungsvertrag",
      "en": "Consulting Agreement",
      "fr": "Consulting Agreement"
    },
    "description": {
      "de": "Regelt Beratungsleistungen und Honorare",
      "en": "Regelt Beratungsleistungen und Honorare",
      "fr": "Regelt Beratungsleistungen und Honorare"
    },
    "searchTerms": {
      "de": [
        "Beratungsvertrag",
        "Consulting Agreement",
        "Beratung"
      ],
      "en": [
        "Consulting Agreement",
        "Beratungsvertrag",
        "Beratung"
      ],
      "fr": [
        "Consulting Agreement",
        "Beratungsvertrag",
        "Beratung"
      ]
    }
  },
  {
    "id": "doc_008_projektvertrag",
    "recommendedSignatureLevel": "AES",
    "title": {
      "de": "Projektvertrag",
      "en": "Project Agreement",
      "fr": "Project Agreement"
    },
    "description": {
      "de": "Vertrag für Projektumsetzung mit Meilensteinen",
      "en": "Vertrag für Projektumsetzung mit Meilensteinen",
      "fr": "Vertrag für Projektumsetzung mit Meilensteinen"
    },
    "searchTerms": {
      "de": [
        "Projektvertrag",
        "Project Agreement",
        "Projektumfang"
      ],
      "en": [
        "Project Agreement",
        "Projektvertrag",
        "Projektumfang"
      ],
      "fr": [
        "Project Agreement",
        "Projektvertrag",
        "Projektumfang"
      ]
    }
  },
  {
    "id": "doc_009_lizenzvertrag",
    "recommendedSignatureLevel": "AES",
    "title": {
      "de": "Lizenzvertrag",
      "en": "License Agreement",
      "fr": "License Agreement"
    },
    "description": {
      "de": "Regelt Nutzung geistigen Eigentums",
      "en": "Regelt Nutzung geistigen Eigentums",
      "fr": "Regelt Nutzung geistigen Eigentums"
    },
    "searchTerms": {
      "de": [
        "Lizenzvertrag",
        "License Agreement",
        "Nutzungsrechte"
      ],
      "en": [
        "License Agreement",
        "Lizenzvertrag",
        "Nutzungsrechte"
      ],
      "fr": [
        "License Agreement",
        "Lizenzvertrag",
        "Nutzungsrechte"
      ]
    }
  },
  {
    "id": "doc_010_software-nutzungsvertrag",
    "recommendedSignatureLevel": "AES",
    "title": {
      "de": "Software-Nutzungsvertrag",
      "en": "SaaS Agreement",
      "fr": "SaaS Agreement"
    },
    "description": {
      "de": "Regelt Nutzung von Software oder Cloud Services",
      "en": "Regelt Nutzung von Software oder Cloud Services",
      "fr": "Regelt Nutzung von Software oder Cloud Services"
    },
    "searchTerms": {
      "de": [
        "Software-Nutzungsvertrag",
        "SaaS Agreement",
        "Software License"
      ],
      "en": [
        "SaaS Agreement",
        "Software-Nutzungsvertrag",
        "Software License"
      ],
      "fr": [
        "SaaS Agreement",
        "Software-Nutzungsvertrag",
        "Software License"
      ]
    }
  },
  {
    "id": "doc_011_api-nutzungsvereinbarung",
    "recommendedSignatureLevel": "AES",
    "title": {
      "de": "API Nutzungsvereinbarung",
      "en": "API Nutzungsvereinbarung",
      "fr": "API Nutzungsvereinbarung"
    },
    "description": {
      "de": "Regelt Zugriff auf APIs",
      "en": "Regelt Zugriff auf APIs",
      "fr": "Regelt Zugriff auf APIs"
    },
    "searchTerms": {
      "de": [
        "API Nutzungsvereinbarung",
        "API Terms",
        "API License"
      ],
      "en": [
        "API Nutzungsvereinbarung",
        "API Terms",
        "API License"
      ],
      "fr": [
        "API Nutzungsvereinbarung",
        "API Terms",
        "API License"
      ]
    }
  },
  {
    "id": "doc_012_open-source-contributor-agreement",
    "recommendedSignatureLevel": "AES",
    "title": {
      "de": "Open Source Contributor Agreement",
      "en": "Open Source Contributor Agreement",
      "fr": "Open Source Contributor Agreement"
    },
    "description": {
      "de": "Übertragung von Rechten an Codebeiträgen",
      "en": "Übertragung von Rechten an Codebeiträgen",
      "fr": "Übertragung von Rechten an Codebeiträgen"
    },
    "searchTerms": {
      "de": [
        "Open Source Contributor Agreement",
        "CLA",
        "Contributor License Agreement"
      ],
      "en": [
        "Open Source Contributor Agreement",
        "CLA",
        "Contributor License Agreement"
      ],
      "fr": [
        "Open Source Contributor Agreement",
        "CLA",
        "Contributor License Agreement"
      ]
    }
  },
  {
    "id": "doc_013_hosting-vertrag",
    "recommendedSignatureLevel": "AES",
    "title": {
      "de": "Hosting Vertrag",
      "en": "Hosting Vertrag",
      "fr": "Hosting Vertrag"
    },
    "description": {
      "de": "Regelt Hosting von IT-Systemen",
      "en": "Regelt Hosting von IT-Systemen",
      "fr": "Regelt Hosting von IT-Systemen"
    },
    "searchTerms": {
      "de": [
        "Hosting Vertrag",
        "Hosting Agreement",
        "Server Hosting"
      ],
      "en": [
        "Hosting Vertrag",
        "Hosting Agreement",
        "Server Hosting"
      ],
      "fr": [
        "Hosting Vertrag",
        "Hosting Agreement",
        "Server Hosting"
      ]
    }
  },
  {
    "id": "doc_014_domainubertragung",
    "recommendedSignatureLevel": "AES",
    "title": {
      "de": "Domainübertragung",
      "en": "Domainübertragung",
      "fr": "Domainübertragung"
    },
    "description": {
      "de": "Übertragung von Domainrechten",
      "en": "Übertragung von Domainrechten",
      "fr": "Übertragung von Domainrechten"
    },
    "searchTerms": {
      "de": [
        "Domainübertragung",
        "Domain Transfer",
        "Domain Verkauf"
      ],
      "en": [
        "Domainübertragung",
        "Domain Transfer",
        "Domain Verkauf"
      ],
      "fr": [
        "Domainübertragung",
        "Domain Transfer",
        "Domain Verkauf"
      ]
    }
  },
  {
    "id": "doc_015_arbeitsvertrag",
    "recommendedSignatureLevel": "QES",
    "title": {
      "de": "Arbeitsvertrag",
      "en": "Employment Contract",
      "fr": "Employment Contract"
    },
    "description": {
      "de": "Regelt Arbeitsverhältnis zwischen Arbeitgeber und Arbeitnehmer",
      "en": "Regelt Arbeitsverhältnis zwischen Arbeitgeber und Arbeitnehmer",
      "fr": "Regelt Arbeitsverhältnis zwischen Arbeitgeber und Arbeitnehmer"
    },
    "searchTerms": {
      "de": [
        "Arbeitsvertrag",
        "Employment Contract",
        "Arbeitsverhältnis"
      ],
      "en": [
        "Employment Contract",
        "Arbeitsvertrag",
        "Arbeitsverhältnis"
      ],
      "fr": [
        "Employment Contract",
        "Arbeitsvertrag",
        "Arbeitsverhältnis"
      ]
    }
  },
  {
    "id": "doc_016_zusatzvereinbarung-arbeitsvertrag",
    "recommendedSignatureLevel": "AES",
    "title": {
      "de": "Zusatzvereinbarung Arbeitsvertrag",
      "en": "Employment Amendment",
      "fr": "Employment Amendment"
    },
    "description": {
      "de": "Änderung eines bestehenden Arbeitsvertrags",
      "en": "Änderung eines bestehenden Arbeitsvertrags",
      "fr": "Änderung eines bestehenden Arbeitsvertrags"
    },
    "searchTerms": {
      "de": [
        "Zusatzvereinbarung Arbeitsvertrag",
        "Employment Amendment"
      ],
      "en": [
        "Employment Amendment",
        "Zusatzvereinbarung Arbeitsvertrag"
      ],
      "fr": [
        "Employment Amendment",
        "Zusatzvereinbarung Arbeitsvertrag"
      ]
    }
  },
  {
    "id": "doc_017_kundigung-arbeitsvertrag",
    "recommendedSignatureLevel": "QES",
    "title": {
      "de": "Kündigung Arbeitsvertrag",
      "en": "Termination Letter",
      "fr": "Termination Letter"
    },
    "description": {
      "de": "Beendigung eines Arbeitsverhältnisses",
      "en": "Beendigung eines Arbeitsverhältnisses",
      "fr": "Beendigung eines Arbeitsverhältnisses"
    },
    "searchTerms": {
      "de": [
        "Kündigung Arbeitsvertrag",
        "Termination Letter",
        "Kündigung"
      ],
      "en": [
        "Termination Letter",
        "Kündigung Arbeitsvertrag",
        "Kündigung"
      ],
      "fr": [
        "Termination Letter",
        "Kündigung Arbeitsvertrag",
        "Kündigung"
      ]
    }
  },
  {
    "id": "doc_018_aufhebungsvereinbarung",
    "recommendedSignatureLevel": "QES",
    "title": {
      "de": "Aufhebungsvereinbarung",
      "en": "Mutual Termination",
      "fr": "Mutual Termination"
    },
    "description": {
      "de": "Einvernehmliche Beendigung eines Arbeitsverhältnisses",
      "en": "Einvernehmliche Beendigung eines Arbeitsverhältnisses",
      "fr": "Einvernehmliche Beendigung eines Arbeitsverhältnisses"
    },
    "searchTerms": {
      "de": [
        "Aufhebungsvereinbarung",
        "Mutual Termination",
        "Severance Agreement"
      ],
      "en": [
        "Mutual Termination",
        "Aufhebungsvereinbarung",
        "Severance Agreement"
      ],
      "fr": [
        "Mutual Termination",
        "Aufhebungsvereinbarung",
        "Severance Agreement"
      ]
    }
  },
  {
    "id": "doc_019_freelancer-vertrag",
    "recommendedSignatureLevel": "AES",
    "title": {
      "de": "Freelancer Vertrag",
      "en": "Freelancer Vertrag",
      "fr": "Freelancer Vertrag"
    },
    "description": {
      "de": "Vertrag mit selbstständigen Dienstleistern",
      "en": "Vertrag mit selbstständigen Dienstleistern",
      "fr": "Vertrag mit selbstständigen Dienstleistern"
    },
    "searchTerms": {
      "de": [
        "Freelancer Vertrag",
        "Contractor Agreement",
        "Freelance"
      ],
      "en": [
        "Freelancer Vertrag",
        "Contractor Agreement",
        "Freelance"
      ],
      "fr": [
        "Freelancer Vertrag",
        "Contractor Agreement",
        "Freelance"
      ]
    }
  },
  {
    "id": "doc_020_praktikumsvertrag",
    "recommendedSignatureLevel": "AES",
    "title": {
      "de": "Praktikumsvertrag",
      "en": "Internship Agreement",
      "fr": "Internship Agreement"
    },
    "description": {
      "de": "Regelt Praktikum und Ausbildungsbedingungen",
      "en": "Regelt Praktikum und Ausbildungsbedingungen",
      "fr": "Regelt Praktikum und Ausbildungsbedingungen"
    },
    "searchTerms": {
      "de": [
        "Praktikumsvertrag",
        "Internship Agreement"
      ],
      "en": [
        "Internship Agreement",
        "Praktikumsvertrag"
      ],
      "fr": [
        "Internship Agreement",
        "Praktikumsvertrag"
      ]
    }
  },
  {
    "id": "doc_021_bonusvereinbarung",
    "recommendedSignatureLevel": "AES",
    "title": {
      "de": "Bonusvereinbarung",
      "en": "Bonusvereinbarung",
      "fr": "Bonusvereinbarung"
    },
    "description": {
      "de": "Regelt variable Vergütung",
      "en": "Regelt variable Vergütung",
      "fr": "Regelt variable Vergütung"
    },
    "searchTerms": {
      "de": [
        "Bonusvereinbarung",
        "Bonus Agreement"
      ],
      "en": [
        "Bonusvereinbarung",
        "Bonus Agreement"
      ],
      "fr": [
        "Bonusvereinbarung",
        "Bonus Agreement"
      ]
    }
  },
  {
    "id": "doc_022_zielvereinbarung",
    "recommendedSignatureLevel": "AES",
    "title": {
      "de": "Zielvereinbarung",
      "en": "KPI Agreement",
      "fr": "KPI Agreement"
    },
    "description": {
      "de": "Festlegung von Leistungszielen",
      "en": "Festlegung von Leistungszielen",
      "fr": "Festlegung von Leistungszielen"
    },
    "searchTerms": {
      "de": [
        "Zielvereinbarung",
        "KPI Agreement",
        "Performance Goals"
      ],
      "en": [
        "KPI Agreement",
        "Zielvereinbarung",
        "Performance Goals"
      ],
      "fr": [
        "KPI Agreement",
        "Zielvereinbarung",
        "Performance Goals"
      ]
    }
  },
  {
    "id": "doc_023_homeoffice-vereinbarung",
    "recommendedSignatureLevel": "AES",
    "title": {
      "de": "Homeoffice Vereinbarung",
      "en": "Remote Work Agreement",
      "fr": "Remote Work Agreement"
    },
    "description": {
      "de": "Regelt Arbeit von zuhause",
      "en": "Regelt Arbeit von zuhause",
      "fr": "Regelt Arbeit von zuhause"
    },
    "searchTerms": {
      "de": [
        "Homeoffice Vereinbarung",
        "Remote Work Agreement"
      ],
      "en": [
        "Remote Work Agreement",
        "Homeoffice Vereinbarung"
      ],
      "fr": [
        "Remote Work Agreement",
        "Homeoffice Vereinbarung"
      ]
    }
  },
  {
    "id": "doc_024_equipment-ubergabeprotokoll",
    "recommendedSignatureLevel": "AES",
    "title": {
      "de": "Equipment Übergabeprotokoll",
      "en": "Equipment Übergabeprotokoll",
      "fr": "Equipment Übergabeprotokoll"
    },
    "description": {
      "de": "Dokumentiert Übergabe von Arbeitsmitteln",
      "en": "Dokumentiert Übergabe von Arbeitsmitteln",
      "fr": "Dokumentiert Übergabe von Arbeitsmitteln"
    },
    "searchTerms": {
      "de": [
        "Equipment Übergabeprotokoll",
        "Equipment Handover",
        "Laptop Übergabe"
      ],
      "en": [
        "Equipment Übergabeprotokoll",
        "Equipment Handover",
        "Laptop Übergabe"
      ],
      "fr": [
        "Equipment Übergabeprotokoll",
        "Equipment Handover",
        "Laptop Übergabe"
      ]
    }
  },
  {
    "id": "doc_025_mietvertrag",
    "recommendedSignatureLevel": "AES",
    "title": {
      "de": "Mietvertrag",
      "en": "Lease Agreement",
      "fr": "Lease Agreement"
    },
    "description": {
      "de": "Regelt Vermietung von Immobilien",
      "en": "Regelt Vermietung von Immobilien",
      "fr": "Regelt Vermietung von Immobilien"
    },
    "searchTerms": {
      "de": [
        "Mietvertrag",
        "Lease Agreement",
        "Miete Wohnung"
      ],
      "en": [
        "Lease Agreement",
        "Mietvertrag",
        "Miete Wohnung"
      ],
      "fr": [
        "Lease Agreement",
        "Mietvertrag",
        "Miete Wohnung"
      ]
    }
  },
  {
    "id": "doc_026_untermietvertrag",
    "recommendedSignatureLevel": "AES",
    "title": {
      "de": "Untermietvertrag",
      "en": "Sublease",
      "fr": "Sublease"
    },
    "description": {
      "de": "Weitervermietung einer gemieteten Immobilie",
      "en": "Weitervermietung einer gemieteten Immobilie",
      "fr": "Weitervermietung einer gemieteten Immobilie"
    },
    "searchTerms": {
      "de": [
        "Untermietvertrag",
        "Sublease"
      ],
      "en": [
        "Sublease",
        "Untermietvertrag"
      ],
      "fr": [
        "Sublease",
        "Untermietvertrag"
      ]
    }
  },
  {
    "id": "doc_027_ferienwohnung-mietvertrag",
    "recommendedSignatureLevel": "AES",
    "title": {
      "de": "Ferienwohnung Mietvertrag",
      "en": "Ferienwohnung Mietvertrag",
      "fr": "Ferienwohnung Mietvertrag"
    },
    "description": {
      "de": "Kurzzeitmiete für Ferienwohnungen",
      "en": "Kurzzeitmiete für Ferienwohnungen",
      "fr": "Kurzzeitmiete für Ferienwohnungen"
    },
    "searchTerms": {
      "de": [
        "Ferienwohnung Mietvertrag",
        "Holiday Rental",
        "Short Term Rental"
      ],
      "en": [
        "Ferienwohnung Mietvertrag",
        "Holiday Rental",
        "Short Term Rental"
      ],
      "fr": [
        "Ferienwohnung Mietvertrag",
        "Holiday Rental",
        "Short Term Rental"
      ]
    }
  },
  {
    "id": "doc_028_schlusselubergabe-protokoll",
    "recommendedSignatureLevel": "AES",
    "title": {
      "de": "Schlüsselübergabe Protokoll",
      "en": "Schlüsselübergabe Protokoll",
      "fr": "Schlüsselübergabe Protokoll"
    },
    "description": {
      "de": "Dokumentiert Übergabe von Schlüsseln",
      "en": "Dokumentiert Übergabe von Schlüsseln",
      "fr": "Dokumentiert Übergabe von Schlüsseln"
    },
    "searchTerms": {
      "de": [
        "Schlüsselübergabe Protokoll",
        "Key Handover"
      ],
      "en": [
        "Schlüsselübergabe Protokoll",
        "Key Handover"
      ],
      "fr": [
        "Schlüsselübergabe Protokoll",
        "Key Handover"
      ]
    }
  },
  {
    "id": "doc_029_ubergabeprotokoll-wohnung",
    "recommendedSignatureLevel": "AES",
    "title": {
      "de": "Übergabeprotokoll Wohnung",
      "en": "Handover Protocol",
      "fr": "Handover Protocol"
    },
    "description": {
      "de": "Zustand der Wohnung bei Ein- oder Auszug",
      "en": "Zustand der Wohnung bei Ein- oder Auszug",
      "fr": "Zustand der Wohnung bei Ein- oder Auszug"
    },
    "searchTerms": {
      "de": [
        "Übergabeprotokoll Wohnung",
        "Handover Protocol",
        "Wohnungsübergabe"
      ],
      "en": [
        "Handover Protocol",
        "Übergabeprotokoll Wohnung",
        "Wohnungsübergabe"
      ],
      "fr": [
        "Handover Protocol",
        "Übergabeprotokoll Wohnung",
        "Wohnungsübergabe"
      ]
    }
  },
  {
    "id": "doc_030_hausordnung-bestatigung",
    "recommendedSignatureLevel": "SIMPLE",
    "title": {
      "de": "Hausordnung Bestätigung",
      "en": "House Rules",
      "fr": "House Rules"
    },
    "description": {
      "de": "Bestätigung der Hausregeln",
      "en": "Bestätigung der Hausregeln",
      "fr": "Bestätigung der Hausregeln"
    },
    "searchTerms": {
      "de": [
        "Hausordnung Bestätigung",
        "House Rules"
      ],
      "en": [
        "House Rules",
        "Hausordnung Bestätigung"
      ],
      "fr": [
        "House Rules",
        "Hausordnung Bestätigung"
      ]
    }
  },
  {
    "id": "doc_031_parkplatz-mietvertrag",
    "recommendedSignatureLevel": "AES",
    "title": {
      "de": "Parkplatz Mietvertrag",
      "en": "Parking Lease",
      "fr": "Parking Lease"
    },
    "description": {
      "de": "Mietvertrag für Parkplatz",
      "en": "Mietvertrag für Parkplatz",
      "fr": "Mietvertrag für Parkplatz"
    },
    "searchTerms": {
      "de": [
        "Parkplatz Mietvertrag",
        "Parking Lease"
      ],
      "en": [
        "Parking Lease",
        "Parkplatz Mietvertrag"
      ],
      "fr": [
        "Parking Lease",
        "Parkplatz Mietvertrag"
      ]
    }
  },
  {
    "id": "doc_032_garagenmietvertrag",
    "recommendedSignatureLevel": "AES",
    "title": {
      "de": "Garagenmietvertrag",
      "en": "Garagenmietvertrag",
      "fr": "Garagenmietvertrag"
    },
    "description": {
      "de": "Mietvertrag für Garage",
      "en": "Mietvertrag für Garage",
      "fr": "Mietvertrag für Garage"
    },
    "searchTerms": {
      "de": [
        "Garagenmietvertrag",
        "Garage Lease"
      ],
      "en": [
        "Garagenmietvertrag",
        "Garage Lease"
      ],
      "fr": [
        "Garagenmietvertrag",
        "Garage Lease"
      ]
    }
  },
  {
    "id": "doc_033_kaufvertrag",
    "recommendedSignatureLevel": "AES",
    "title": {
      "de": "Kaufvertrag",
      "en": "Sale Agreement",
      "fr": "Sale Agreement"
    },
    "description": {
      "de": "Vertrag über Kauf eines Gegenstandes",
      "en": "Vertrag über Kauf eines Gegenstandes",
      "fr": "Vertrag über Kauf eines Gegenstandes"
    },
    "searchTerms": {
      "de": [
        "Kaufvertrag",
        "Sale Agreement"
      ],
      "en": [
        "Sale Agreement",
        "Kaufvertrag"
      ],
      "fr": [
        "Sale Agreement",
        "Kaufvertrag"
      ]
    }
  },
  {
    "id": "doc_034_autokaufvertrag",
    "recommendedSignatureLevel": "AES",
    "title": {
      "de": "Autokaufvertrag",
      "en": "Car Sale Agreement",
      "fr": "Car Sale Agreement"
    },
    "description": {
      "de": "Vertrag über Verkauf eines Fahrzeugs",
      "en": "Vertrag über Verkauf eines Fahrzeugs",
      "fr": "Vertrag über Verkauf eines Fahrzeugs"
    },
    "searchTerms": {
      "de": [
        "Autokaufvertrag",
        "Car Sale Agreement"
      ],
      "en": [
        "Car Sale Agreement",
        "Autokaufvertrag"
      ],
      "fr": [
        "Car Sale Agreement",
        "Autokaufvertrag"
      ]
    }
  },
  {
    "id": "doc_035_leasingvertrag-auto",
    "recommendedSignatureLevel": "QES",
    "title": {
      "de": "Leasingvertrag Auto",
      "en": "Leasingvertrag Auto",
      "fr": "Leasingvertrag Auto"
    },
    "description": {
      "de": "Leasingvertrag für Fahrzeug",
      "en": "Leasingvertrag für Fahrzeug",
      "fr": "Leasingvertrag für Fahrzeug"
    },
    "searchTerms": {
      "de": [
        "Leasingvertrag Auto",
        "Car Leasing"
      ],
      "en": [
        "Leasingvertrag Auto",
        "Car Leasing"
      ],
      "fr": [
        "Leasingvertrag Auto",
        "Car Leasing"
      ]
    }
  },
  {
    "id": "doc_036_reparaturauftrag",
    "recommendedSignatureLevel": "SIMPLE",
    "title": {
      "de": "Reparaturauftrag",
      "en": "Repair Order",
      "fr": "Repair Order"
    },
    "description": {
      "de": "Auftrag für Reparaturarbeiten",
      "en": "Auftrag für Reparaturarbeiten",
      "fr": "Auftrag für Reparaturarbeiten"
    },
    "searchTerms": {
      "de": [
        "Reparaturauftrag",
        "Repair Order"
      ],
      "en": [
        "Repair Order",
        "Reparaturauftrag"
      ],
      "fr": [
        "Repair Order",
        "Reparaturauftrag"
      ]
    }
  },
  {
    "id": "doc_037_bauvertrag",
    "recommendedSignatureLevel": "QES",
    "title": {
      "de": "Bauvertrag",
      "en": "Construction Contract",
      "fr": "Construction Contract"
    },
    "description": {
      "de": "Vertrag für Bauleistungen",
      "en": "Vertrag für Bauleistungen",
      "fr": "Vertrag für Bauleistungen"
    },
    "searchTerms": {
      "de": [
        "Bauvertrag",
        "Construction Contract"
      ],
      "en": [
        "Construction Contract",
        "Bauvertrag"
      ],
      "fr": [
        "Construction Contract",
        "Bauvertrag"
      ]
    }
  },
  {
    "id": "doc_038_architektenvertrag",
    "recommendedSignatureLevel": "AES",
    "title": {
      "de": "Architektenvertrag",
      "en": "Architect Agreement",
      "fr": "Architect Agreement"
    },
    "description": {
      "de": "Vertrag mit Architekt für Planung",
      "en": "Vertrag mit Architekt für Planung",
      "fr": "Vertrag mit Architekt für Planung"
    },
    "searchTerms": {
      "de": [
        "Architektenvertrag",
        "Architect Agreement"
      ],
      "en": [
        "Architect Agreement",
        "Architektenvertrag"
      ],
      "fr": [
        "Architect Agreement",
        "Architektenvertrag"
      ]
    }
  },
  {
    "id": "doc_039_bauabnahmeprotokoll",
    "recommendedSignatureLevel": "AES",
    "title": {
      "de": "Bauabnahmeprotokoll",
      "en": "Bauabnahmeprotokoll",
      "fr": "Bauabnahmeprotokoll"
    },
    "description": {
      "de": "Abnahme der Bauleistung",
      "en": "Abnahme der Bauleistung",
      "fr": "Abnahme der Bauleistung"
    },
    "searchTerms": {
      "de": [
        "Bauabnahmeprotokoll",
        "Construction Acceptance"
      ],
      "en": [
        "Bauabnahmeprotokoll",
        "Construction Acceptance"
      ],
      "fr": [
        "Bauabnahmeprotokoll",
        "Construction Acceptance"
      ]
    }
  },
  {
    "id": "doc_040_liefervertrag",
    "recommendedSignatureLevel": "AES",
    "title": {
      "de": "Liefervertrag",
      "en": "Supply Agreement",
      "fr": "Supply Agreement"
    },
    "description": {
      "de": "Vertrag über Lieferung von Waren",
      "en": "Vertrag über Lieferung von Waren",
      "fr": "Vertrag über Lieferung von Waren"
    },
    "searchTerms": {
      "de": [
        "Liefervertrag",
        "Supply Agreement"
      ],
      "en": [
        "Supply Agreement",
        "Liefervertrag"
      ],
      "fr": [
        "Supply Agreement",
        "Liefervertrag"
      ]
    }
  },
  {
    "id": "doc_041_bestellung",
    "recommendedSignatureLevel": "AES",
    "title": {
      "de": "Bestellung",
      "en": "Purchase Order",
      "fr": "Purchase Order"
    },
    "description": {
      "de": "Bestellung von Produkten oder Dienstleistungen",
      "en": "Bestellung von Produkten oder Dienstleistungen",
      "fr": "Bestellung von Produkten oder Dienstleistungen"
    },
    "searchTerms": {
      "de": [
        "Bestellung",
        "Purchase Order",
        "PO"
      ],
      "en": [
        "Purchase Order",
        "Bestellung",
        "PO"
      ],
      "fr": [
        "Purchase Order",
        "Bestellung",
        "PO"
      ]
    }
  },
  {
    "id": "doc_042_angebot",
    "recommendedSignatureLevel": "SIMPLE",
    "title": {
      "de": "Angebot",
      "en": "Angebot",
      "fr": "Angebot"
    },
    "description": {
      "de": "Preisangebot für Leistungen",
      "en": "Preisangebot für Leistungen",
      "fr": "Preisangebot für Leistungen"
    },
    "searchTerms": {
      "de": [
        "Angebot",
        "Quote",
        "Offer"
      ],
      "en": [
        "Angebot",
        "Quote",
        "Offer"
      ],
      "fr": [
        "Angebot",
        "Quote",
        "Offer"
      ]
    }
  },
  {
    "id": "doc_043_rechnung",
    "recommendedSignatureLevel": "SIMPLE",
    "title": {
      "de": "Rechnung",
      "en": "Invoice",
      "fr": "Invoice"
    },
    "description": {
      "de": "Abrechnung für Leistungen",
      "en": "Abrechnung für Leistungen",
      "fr": "Abrechnung für Leistungen"
    },
    "searchTerms": {
      "de": [
        "Rechnung",
        "Invoice"
      ],
      "en": [
        "Invoice",
        "Rechnung"
      ],
      "fr": [
        "Invoice",
        "Rechnung"
      ]
    }
  },
  {
    "id": "doc_044_gutschrift",
    "recommendedSignatureLevel": "SIMPLE",
    "title": {
      "de": "Gutschrift",
      "en": "Credit Note",
      "fr": "Credit Note"
    },
    "description": {
      "de": "Korrektur einer Rechnung",
      "en": "Korrektur einer Rechnung",
      "fr": "Korrektur einer Rechnung"
    },
    "searchTerms": {
      "de": [
        "Gutschrift",
        "Credit Note"
      ],
      "en": [
        "Credit Note",
        "Gutschrift"
      ],
      "fr": [
        "Credit Note",
        "Gutschrift"
      ]
    }
  },
  {
    "id": "doc_045_abnahmeprotokoll",
    "recommendedSignatureLevel": "AES",
    "title": {
      "de": "Abnahmeprotokoll",
      "en": "Acceptance Protocol",
      "fr": "Acceptance Protocol"
    },
    "description": {
      "de": "Dokumentiert Abnahme von Leistungen",
      "en": "Dokumentiert Abnahme von Leistungen",
      "fr": "Dokumentiert Abnahme von Leistungen"
    },
    "searchTerms": {
      "de": [
        "Abnahmeprotokoll",
        "Acceptance Protocol"
      ],
      "en": [
        "Acceptance Protocol",
        "Abnahmeprotokoll"
      ],
      "fr": [
        "Acceptance Protocol",
        "Abnahmeprotokoll"
      ]
    }
  },
  {
    "id": "doc_046_vollmacht",
    "recommendedSignatureLevel": "QES",
    "title": {
      "de": "Vollmacht",
      "en": "Vollmacht",
      "fr": "Vollmacht"
    },
    "description": {
      "de": "Ermächtigung zur Vertretung",
      "en": "Ermächtigung zur Vertretung",
      "fr": "Ermächtigung zur Vertretung"
    },
    "searchTerms": {
      "de": [
        "Vollmacht",
        "Power of Attorney"
      ],
      "en": [
        "Vollmacht",
        "Power of Attorney"
      ],
      "fr": [
        "Vollmacht",
        "Power of Attorney"
      ]
    }
  },
  {
    "id": "doc_047_bankvollmacht",
    "recommendedSignatureLevel": "QES",
    "title": {
      "de": "Bankvollmacht",
      "en": "Bankvollmacht",
      "fr": "Bankvollmacht"
    },
    "description": {
      "de": "Vertretungsrecht für Bankgeschäfte",
      "en": "Vertretungsrecht für Bankgeschäfte",
      "fr": "Vertretungsrecht für Bankgeschäfte"
    },
    "searchTerms": {
      "de": [
        "Bankvollmacht",
        "Bank Power of Attorney"
      ],
      "en": [
        "Bankvollmacht",
        "Bank Power of Attorney"
      ],
      "fr": [
        "Bankvollmacht",
        "Bank Power of Attorney"
      ]
    }
  },
  {
    "id": "doc_048_kontoeroffnung",
    "recommendedSignatureLevel": "QES",
    "title": {
      "de": "Kontoeröffnung",
      "en": "Kontoeröffnung",
      "fr": "Kontoeröffnung"
    },
    "description": {
      "de": "Eröffnung eines Bankkontos",
      "en": "Eröffnung eines Bankkontos",
      "fr": "Eröffnung eines Bankkontos"
    },
    "searchTerms": {
      "de": [
        "Kontoeröffnung",
        "Account Opening",
        "KYC"
      ],
      "en": [
        "Kontoeröffnung",
        "Account Opening",
        "KYC"
      ],
      "fr": [
        "Kontoeröffnung",
        "Account Opening",
        "KYC"
      ]
    }
  },
  {
    "id": "doc_049_kreditvertrag",
    "recommendedSignatureLevel": "QES",
    "title": {
      "de": "Kreditvertrag",
      "en": "Loan Agreement",
      "fr": "Loan Agreement"
    },
    "description": {
      "de": "Finanzierungsvertrag",
      "en": "Finanzierungsvertrag",
      "fr": "Finanzierungsvertrag"
    },
    "searchTerms": {
      "de": [
        "Kreditvertrag",
        "Loan Agreement"
      ],
      "en": [
        "Loan Agreement",
        "Kreditvertrag"
      ],
      "fr": [
        "Loan Agreement",
        "Kreditvertrag"
      ]
    }
  },
  {
    "id": "doc_050_hypothekenvertrag",
    "recommendedSignatureLevel": "QES",
    "title": {
      "de": "Hypothekenvertrag",
      "en": "Hypothekenvertrag",
      "fr": "Hypothekenvertrag"
    },
    "description": {
      "de": "Immobilienfinanzierung",
      "en": "Immobilienfinanzierung",
      "fr": "Immobilienfinanzierung"
    },
    "searchTerms": {
      "de": [
        "Hypothekenvertrag",
        "Mortgage"
      ],
      "en": [
        "Hypothekenvertrag",
        "Mortgage"
      ],
      "fr": [
        "Hypothekenvertrag",
        "Mortgage"
      ]
    }
  },
  {
    "id": "doc_051_depotvertrag",
    "recommendedSignatureLevel": "AES",
    "title": {
      "de": "Depotvertrag",
      "en": "Depotvertrag",
      "fr": "Depotvertrag"
    },
    "description": {
      "de": "Wertpapierdepot Vertrag",
      "en": "Wertpapierdepot Vertrag",
      "fr": "Wertpapierdepot Vertrag"
    },
    "searchTerms": {
      "de": [
        "Depotvertrag",
        "Brokerage Account"
      ],
      "en": [
        "Depotvertrag",
        "Brokerage Account"
      ],
      "fr": [
        "Depotvertrag",
        "Brokerage Account"
      ]
    }
  },
  {
    "id": "doc_052_anlegerprofil",
    "recommendedSignatureLevel": "AES",
    "title": {
      "de": "Anlegerprofil",
      "en": "Investor Profile",
      "fr": "Investor Profile"
    },
    "description": {
      "de": "Risikoprofil eines Anlegers",
      "en": "Risikoprofil eines Anlegers",
      "fr": "Risikoprofil eines Anlegers"
    },
    "searchTerms": {
      "de": [
        "Anlegerprofil",
        "Investor Profile"
      ],
      "en": [
        "Investor Profile",
        "Anlegerprofil"
      ],
      "fr": [
        "Investor Profile",
        "Anlegerprofil"
      ]
    }
  },
  {
    "id": "doc_053_risikoaufklarung",
    "recommendedSignatureLevel": "AES",
    "title": {
      "de": "Risikoaufklärung",
      "en": "Risk Disclosure",
      "fr": "Risk Disclosure"
    },
    "description": {
      "de": "Information über Risiken von Finanzprodukten",
      "en": "Information über Risiken von Finanzprodukten",
      "fr": "Information über Risiken von Finanzprodukten"
    },
    "searchTerms": {
      "de": [
        "Risikoaufklärung",
        "Risk Disclosure"
      ],
      "en": [
        "Risk Disclosure",
        "Risikoaufklärung"
      ],
      "fr": [
        "Risk Disclosure",
        "Risikoaufklärung"
      ]
    }
  },
  {
    "id": "doc_054_wallet-nutzungsbedingungen",
    "recommendedSignatureLevel": "SIMPLE",
    "title": {
      "de": "Wallet Nutzungsbedingungen",
      "en": "Wallet Nutzungsbedingungen",
      "fr": "Wallet Nutzungsbedingungen"
    },
    "description": {
      "de": "Bedingungen für Nutzung einer digitalen Wallet",
      "en": "Bedingungen für Nutzung einer digitalen Wallet",
      "fr": "Bedingungen für Nutzung einer digitalen Wallet"
    },
    "searchTerms": {
      "de": [
        "Wallet Nutzungsbedingungen",
        "Wallet Terms",
        "Crypto Wallet"
      ],
      "en": [
        "Wallet Nutzungsbedingungen",
        "Wallet Terms",
        "Crypto Wallet"
      ],
      "fr": [
        "Wallet Nutzungsbedingungen",
        "Wallet Terms",
        "Crypto Wallet"
      ]
    }
  },
  {
    "id": "doc_055_token-kaufvereinbarung",
    "recommendedSignatureLevel": "AES",
    "title": {
      "de": "Token Kaufvereinbarung",
      "en": "Token Kaufvereinbarung",
      "fr": "Token Kaufvereinbarung"
    },
    "description": {
      "de": "Kauf von Blockchain Tokens",
      "en": "Kauf von Blockchain Tokens",
      "fr": "Kauf von Blockchain Tokens"
    },
    "searchTerms": {
      "de": [
        "Token Kaufvereinbarung",
        "Token Purchase Agreement"
      ],
      "en": [
        "Token Kaufvereinbarung",
        "Token Purchase Agreement"
      ],
      "fr": [
        "Token Kaufvereinbarung",
        "Token Purchase Agreement"
      ]
    }
  },
  {
    "id": "doc_056_nft-kaufvertrag",
    "recommendedSignatureLevel": "AES",
    "title": {
      "de": "NFT Kaufvertrag",
      "en": "NFT Kaufvertrag",
      "fr": "NFT Kaufvertrag"
    },
    "description": {
      "de": "Vertrag über Verkauf eines NFTs",
      "en": "Vertrag über Verkauf eines NFTs",
      "fr": "Vertrag über Verkauf eines NFTs"
    },
    "searchTerms": {
      "de": [
        "NFT Kaufvertrag",
        "NFT Sale Agreement"
      ],
      "en": [
        "NFT Kaufvertrag",
        "NFT Sale Agreement"
      ],
      "fr": [
        "NFT Kaufvertrag",
        "NFT Sale Agreement"
      ]
    }
  },
  {
    "id": "doc_057_staking-vereinbarung",
    "recommendedSignatureLevel": "AES",
    "title": {
      "de": "Staking Vereinbarung",
      "en": "Staking Vereinbarung",
      "fr": "Staking Vereinbarung"
    },
    "description": {
      "de": "Teilnahme an Blockchain Staking",
      "en": "Teilnahme an Blockchain Staking",
      "fr": "Teilnahme an Blockchain Staking"
    },
    "searchTerms": {
      "de": [
        "Staking Vereinbarung",
        "Staking Agreement"
      ],
      "en": [
        "Staking Vereinbarung",
        "Staking Agreement"
      ],
      "fr": [
        "Staking Vereinbarung",
        "Staking Agreement"
      ]
    }
  },
  {
    "id": "doc_058_validator-teilnahme-vertrag",
    "recommendedSignatureLevel": "AES",
    "title": {
      "de": "Validator Teilnahme Vertrag",
      "en": "Validator Teilnahme Vertrag",
      "fr": "Validator Teilnahme Vertrag"
    },
    "description": {
      "de": "Teilnahme als Validator in Blockchain Netzwerk",
      "en": "Teilnahme als Validator in Blockchain Netzwerk",
      "fr": "Teilnahme als Validator in Blockchain Netzwerk"
    },
    "searchTerms": {
      "de": [
        "Validator Teilnahme Vertrag",
        "Validator Agreement"
      ],
      "en": [
        "Validator Teilnahme Vertrag",
        "Validator Agreement"
      ],
      "fr": [
        "Validator Teilnahme Vertrag",
        "Validator Agreement"
      ]
    }
  },
  {
    "id": "doc_059_datenschutzvereinbarung",
    "recommendedSignatureLevel": "AES",
    "title": {
      "de": "Datenschutzvereinbarung",
      "en": "Datenschutzvereinbarung",
      "fr": "Datenschutzvereinbarung"
    },
    "description": {
      "de": "Regelt Auftragsverarbeitung personenbezogener Daten",
      "en": "Regelt Auftragsverarbeitung personenbezogener Daten",
      "fr": "Regelt Auftragsverarbeitung personenbezogener Daten"
    },
    "searchTerms": {
      "de": [
        "Datenschutzvereinbarung",
        "DPA",
        "AVV"
      ],
      "en": [
        "Datenschutzvereinbarung",
        "DPA",
        "AVV"
      ],
      "fr": [
        "Datenschutzvereinbarung",
        "DPA",
        "AVV"
      ]
    }
  },
  {
    "id": "doc_060_datennutzungsfreigabe",
    "recommendedSignatureLevel": "AES",
    "title": {
      "de": "Datennutzungsfreigabe",
      "en": "Data Usage Consent",
      "fr": "Data Usage Consent"
    },
    "description": {
      "de": "Einwilligung zur Nutzung von Daten",
      "en": "Einwilligung zur Nutzung von Daten",
      "fr": "Einwilligung zur Nutzung von Daten"
    },
    "searchTerms": {
      "de": [
        "Datennutzungsfreigabe",
        "Data Usage Consent"
      ],
      "en": [
        "Data Usage Consent",
        "Datennutzungsfreigabe"
      ],
      "fr": [
        "Data Usage Consent",
        "Datennutzungsfreigabe"
      ]
    }
  },
  {
    "id": "doc_061_cookie-zustimmung",
    "recommendedSignatureLevel": "SIMPLE",
    "title": {
      "de": "Cookie Zustimmung",
      "en": "Cookie Consent",
      "fr": "Cookie Consent"
    },
    "description": {
      "de": "Einwilligung zur Speicherung von Cookies",
      "en": "Einwilligung zur Speicherung von Cookies",
      "fr": "Einwilligung zur Speicherung von Cookies"
    },
    "searchTerms": {
      "de": [
        "Cookie Zustimmung",
        "Cookie Consent"
      ],
      "en": [
        "Cookie Consent",
        "Cookie Zustimmung"
      ],
      "fr": [
        "Cookie Consent",
        "Cookie Zustimmung"
      ]
    }
  },
  {
    "id": "doc_062_foto-freigabe",
    "recommendedSignatureLevel": "SIMPLE",
    "title": {
      "de": "Foto Freigabe",
      "en": "Photo Release",
      "fr": "Photo Release"
    },
    "description": {
      "de": "Erlaubnis zur Nutzung von Fotos",
      "en": "Erlaubnis zur Nutzung von Fotos",
      "fr": "Erlaubnis zur Nutzung von Fotos"
    },
    "searchTerms": {
      "de": [
        "Foto Freigabe",
        "Photo Release"
      ],
      "en": [
        "Photo Release",
        "Foto Freigabe"
      ],
      "fr": [
        "Photo Release",
        "Foto Freigabe"
      ]
    }
  },
  {
    "id": "doc_063_event-teilnahmevereinbarung",
    "recommendedSignatureLevel": "SIMPLE",
    "title": {
      "de": "Event Teilnahmevereinbarung",
      "en": "Event Teilnahmevereinbarung",
      "fr": "Event Teilnahmevereinbarung"
    },
    "description": {
      "de": "Teilnahme an Veranstaltung",
      "en": "Teilnahme an Veranstaltung",
      "fr": "Teilnahme an Veranstaltung"
    },
    "searchTerms": {
      "de": [
        "Event Teilnahmevereinbarung",
        "Event Participation"
      ],
      "en": [
        "Event Teilnahmevereinbarung",
        "Event Participation"
      ],
      "fr": [
        "Event Teilnahmevereinbarung",
        "Event Participation"
      ]
    }
  },
  {
    "id": "doc_064_sponsoringvertrag",
    "recommendedSignatureLevel": "AES",
    "title": {
      "de": "Sponsoringvertrag",
      "en": "Sponsorship Agreement",
      "fr": "Sponsorship Agreement"
    },
    "description": {
      "de": "Regelt Sponsoring Leistungen",
      "en": "Regelt Sponsoring Leistungen",
      "fr": "Regelt Sponsoring Leistungen"
    },
    "searchTerms": {
      "de": [
        "Sponsoringvertrag",
        "Sponsorship Agreement"
      ],
      "en": [
        "Sponsorship Agreement",
        "Sponsoringvertrag"
      ],
      "fr": [
        "Sponsorship Agreement",
        "Sponsoringvertrag"
      ]
    }
  },
  {
    "id": "doc_065_influencer-vertrag",
    "recommendedSignatureLevel": "AES",
    "title": {
      "de": "Influencer Vertrag",
      "en": "Influencer Vertrag",
      "fr": "Influencer Vertrag"
    },
    "description": {
      "de": "Kooperation mit Social Media Influencer",
      "en": "Kooperation mit Social Media Influencer",
      "fr": "Kooperation mit Social Media Influencer"
    },
    "searchTerms": {
      "de": [
        "Influencer Vertrag",
        "Influencer Agreement"
      ],
      "en": [
        "Influencer Vertrag",
        "Influencer Agreement"
      ],
      "fr": [
        "Influencer Vertrag",
        "Influencer Agreement"
      ]
    }
  },
  {
    "id": "doc_066_affiliate-vertrag",
    "recommendedSignatureLevel": "AES",
    "title": {
      "de": "Affiliate Vertrag",
      "en": "Affiliate Vertrag",
      "fr": "Affiliate Vertrag"
    },
    "description": {
      "de": "Provisionsbasierte Marketingpartnerschaft",
      "en": "Provisionsbasierte Marketingpartnerschaft",
      "fr": "Provisionsbasierte Marketingpartnerschaft"
    },
    "searchTerms": {
      "de": [
        "Affiliate Vertrag",
        "Affiliate Agreement"
      ],
      "en": [
        "Affiliate Vertrag",
        "Affiliate Agreement"
      ],
      "fr": [
        "Affiliate Vertrag",
        "Affiliate Agreement"
      ]
    }
  },
  {
    "id": "doc_067_eventlocation-vertrag",
    "recommendedSignatureLevel": "AES",
    "title": {
      "de": "Eventlocation Vertrag",
      "en": "Eventlocation Vertrag",
      "fr": "Eventlocation Vertrag"
    },
    "description": {
      "de": "Miete von Veranstaltungsräumen",
      "en": "Miete von Veranstaltungsräumen",
      "fr": "Miete von Veranstaltungsräumen"
    },
    "searchTerms": {
      "de": [
        "Eventlocation Vertrag",
        "Venue Rental"
      ],
      "en": [
        "Eventlocation Vertrag",
        "Venue Rental"
      ],
      "fr": [
        "Eventlocation Vertrag",
        "Venue Rental"
      ]
    }
  },
  {
    "id": "doc_068_catering-vertrag",
    "recommendedSignatureLevel": "AES",
    "title": {
      "de": "Catering Vertrag",
      "en": "Catering Vertrag",
      "fr": "Catering Vertrag"
    },
    "description": {
      "de": "Vertrag für Eventverpflegung",
      "en": "Vertrag für Eventverpflegung",
      "fr": "Vertrag für Eventverpflegung"
    },
    "searchTerms": {
      "de": [
        "Catering Vertrag",
        "Catering Agreement"
      ],
      "en": [
        "Catering Vertrag",
        "Catering Agreement"
      ],
      "fr": [
        "Catering Vertrag",
        "Catering Agreement"
      ]
    }
  },
  {
    "id": "doc_069_podcast-gastevereinbarung",
    "recommendedSignatureLevel": "AES",
    "title": {
      "de": "Podcast Gästevereinbarung",
      "en": "Podcast Gästevereinbarung",
      "fr": "Podcast Gästevereinbarung"
    },
    "description": {
      "de": "Rechte an Podcastaufnahme",
      "en": "Rechte an Podcastaufnahme",
      "fr": "Rechte an Podcastaufnahme"
    },
    "searchTerms": {
      "de": [
        "Podcast Gästevereinbarung",
        "Podcast Guest Release"
      ],
      "en": [
        "Podcast Gästevereinbarung",
        "Podcast Guest Release"
      ],
      "fr": [
        "Podcast Gästevereinbarung",
        "Podcast Guest Release"
      ]
    }
  },
  {
    "id": "doc_070_musiklizenz",
    "recommendedSignatureLevel": "AES",
    "title": {
      "de": "Musiklizenz",
      "en": "Music License",
      "fr": "Music License"
    },
    "description": {
      "de": "Lizenz für Nutzung von Musik",
      "en": "Lizenz für Nutzung von Musik",
      "fr": "Lizenz für Nutzung von Musik"
    },
    "searchTerms": {
      "de": [
        "Musiklizenz",
        "Music License"
      ],
      "en": [
        "Music License",
        "Musiklizenz"
      ],
      "fr": [
        "Music License",
        "Musiklizenz"
      ]
    }
  },
  {
    "id": "doc_071_fotografenvertrag",
    "recommendedSignatureLevel": "AES",
    "title": {
      "de": "Fotografenvertrag",
      "en": "Photography Contract",
      "fr": "Photography Contract"
    },
    "description": {
      "de": "Vertrag mit Fotografen",
      "en": "Vertrag mit Fotografen",
      "fr": "Vertrag mit Fotografen"
    },
    "searchTerms": {
      "de": [
        "Fotografenvertrag",
        "Photography Contract"
      ],
      "en": [
        "Photography Contract",
        "Fotografenvertrag"
      ],
      "fr": [
        "Photography Contract",
        "Fotografenvertrag"
      ]
    }
  },
  {
    "id": "doc_072_reisevollmacht-kind",
    "recommendedSignatureLevel": "AES",
    "title": {
      "de": "Reisevollmacht Kind",
      "en": "Reisevollmacht Kind",
      "fr": "Reisevollmacht Kind"
    },
    "description": {
      "de": "Elterliche Zustimmung für Reise eines Kindes",
      "en": "Elterliche Zustimmung für Reise eines Kindes",
      "fr": "Elterliche Zustimmung für Reise eines Kindes"
    },
    "searchTerms": {
      "de": [
        "Reisevollmacht Kind",
        "Child Travel Authorization"
      ],
      "en": [
        "Reisevollmacht Kind",
        "Child Travel Authorization"
      ],
      "fr": [
        "Reisevollmacht Kind",
        "Child Travel Authorization"
      ]
    }
  },
  {
    "id": "doc_073_schulfreigabe-ausflug",
    "recommendedSignatureLevel": "SIMPLE",
    "title": {
      "de": "Schulfreigabe Ausflug",
      "en": "Schulfreigabe Ausflug",
      "fr": "Schulfreigabe Ausflug"
    },
    "description": {
      "de": "Einverständnis Eltern für Schulreise",
      "en": "Einverständnis Eltern für Schulreise",
      "fr": "Einverständnis Eltern für Schulreise"
    },
    "searchTerms": {
      "de": [
        "Schulfreigabe Ausflug",
        "School Trip Permission"
      ],
      "en": [
        "Schulfreigabe Ausflug",
        "School Trip Permission"
      ],
      "fr": [
        "Schulfreigabe Ausflug",
        "School Trip Permission"
      ]
    }
  },
  {
    "id": "doc_074_vereinsmitgliedschaft",
    "recommendedSignatureLevel": "SIMPLE",
    "title": {
      "de": "Vereinsmitgliedschaft",
      "en": "Membership Agreement",
      "fr": "Membership Agreement"
    },
    "description": {
      "de": "Beitritt zu Verein",
      "en": "Beitritt zu Verein",
      "fr": "Beitritt zu Verein"
    },
    "searchTerms": {
      "de": [
        "Vereinsmitgliedschaft",
        "Membership Agreement"
      ],
      "en": [
        "Membership Agreement",
        "Vereinsmitgliedschaft"
      ],
      "fr": [
        "Membership Agreement",
        "Vereinsmitgliedschaft"
      ]
    }
  },
  {
    "id": "doc_075_sportverein-anmeldung",
    "recommendedSignatureLevel": "SIMPLE",
    "title": {
      "de": "Sportverein Anmeldung",
      "en": "Sportverein Anmeldung",
      "fr": "Sportverein Anmeldung"
    },
    "description": {
      "de": "Mitgliedschaft in Sportverein",
      "en": "Mitgliedschaft in Sportverein",
      "fr": "Mitgliedschaft in Sportverein"
    },
    "searchTerms": {
      "de": [
        "Sportverein Anmeldung",
        "Sports Club Membership"
      ],
      "en": [
        "Sportverein Anmeldung",
        "Sports Club Membership"
      ],
      "fr": [
        "Sportverein Anmeldung",
        "Sports Club Membership"
      ]
    }
  },
  {
    "id": "doc_076_kindergarten-anmeldung",
    "recommendedSignatureLevel": "SIMPLE",
    "title": {
      "de": "Kindergarten Anmeldung",
      "en": "Kindergarten Anmeldung",
      "fr": "Kindergarten Anmeldung"
    },
    "description": {
      "de": "Anmeldung eines Kindes",
      "en": "Anmeldung eines Kindes",
      "fr": "Anmeldung eines Kindes"
    },
    "searchTerms": {
      "de": [
        "Kindergarten Anmeldung",
        "Kindergarten Registration"
      ],
      "en": [
        "Kindergarten Anmeldung",
        "Kindergarten Registration"
      ],
      "fr": [
        "Kindergarten Anmeldung",
        "Kindergarten Registration"
      ]
    }
  },
  {
    "id": "doc_077_nachhilfevertrag",
    "recommendedSignatureLevel": "AES",
    "title": {
      "de": "Nachhilfevertrag",
      "en": "Tutoring Agreement",
      "fr": "Tutoring Agreement"
    },
    "description": {
      "de": "Vertrag für Nachhilfeunterricht",
      "en": "Vertrag für Nachhilfeunterricht",
      "fr": "Vertrag für Nachhilfeunterricht"
    },
    "searchTerms": {
      "de": [
        "Nachhilfevertrag",
        "Tutoring Agreement"
      ],
      "en": [
        "Tutoring Agreement",
        "Nachhilfevertrag"
      ],
      "fr": [
        "Tutoring Agreement",
        "Nachhilfevertrag"
      ]
    }
  },
  {
    "id": "doc_078_haustierbetreuungsvertrag",
    "recommendedSignatureLevel": "AES",
    "title": {
      "de": "Haustierbetreuungsvertrag",
      "en": "Pet Sitting Agreement",
      "fr": "Pet Sitting Agreement"
    },
    "description": {
      "de": "Betreuung von Haustieren",
      "en": "Betreuung von Haustieren",
      "fr": "Betreuung von Haustieren"
    },
    "searchTerms": {
      "de": [
        "Haustierbetreuungsvertrag",
        "Pet Sitting Agreement"
      ],
      "en": [
        "Pet Sitting Agreement",
        "Haustierbetreuungsvertrag"
      ],
      "fr": [
        "Pet Sitting Agreement",
        "Haustierbetreuungsvertrag"
      ]
    }
  },
  {
    "id": "doc_079_tierarzt-einwilligung",
    "recommendedSignatureLevel": "AES",
    "title": {
      "de": "Tierarzt Einwilligung",
      "en": "Veterinary Consent",
      "fr": "Veterinary Consent"
    },
    "description": {
      "de": "Einwilligung für Behandlung eines Tieres",
      "en": "Einwilligung für Behandlung eines Tieres",
      "fr": "Einwilligung für Behandlung eines Tieres"
    },
    "searchTerms": {
      "de": [
        "Tierarzt Einwilligung",
        "Veterinary Consent"
      ],
      "en": [
        "Veterinary Consent",
        "Tierarzt Einwilligung"
      ],
      "fr": [
        "Veterinary Consent",
        "Tierarzt Einwilligung"
      ]
    }
  },
  {
    "id": "doc_080_gastemeldeschein",
    "recommendedSignatureLevel": "SIMPLE",
    "title": {
      "de": "Gästemeldeschein",
      "en": "Gästemeldeschein",
      "fr": "Gästemeldeschein"
    },
    "description": {
      "de": "Registrierung von Gästen in Unterkunft",
      "en": "Registrierung von Gästen in Unterkunft",
      "fr": "Registrierung von Gästen in Unterkunft"
    },
    "searchTerms": {
      "de": [
        "Gästemeldeschein",
        "Guest Registration",
        "Tourism Registration"
      ],
      "en": [
        "Gästemeldeschein",
        "Guest Registration",
        "Tourism Registration"
      ],
      "fr": [
        "Gästemeldeschein",
        "Guest Registration",
        "Tourism Registration"
      ]
    }
  },
  {
    "id": "doc_081_kurtaxe-anmeldung",
    "recommendedSignatureLevel": "SIMPLE",
    "title": {
      "de": "Kurtaxe Anmeldung",
      "en": "Kurtaxe Anmeldung",
      "fr": "Kurtaxe Anmeldung"
    },
    "description": {
      "de": "Registrierung für Kurtaxe im Tourismus",
      "en": "Registrierung für Kurtaxe im Tourismus",
      "fr": "Registrierung für Kurtaxe im Tourismus"
    },
    "searchTerms": {
      "de": [
        "Kurtaxe Anmeldung",
        "Tourist Tax Registration"
      ],
      "en": [
        "Kurtaxe Anmeldung",
        "Tourist Tax Registration"
      ],
      "fr": [
        "Kurtaxe Anmeldung",
        "Tourist Tax Registration"
      ]
    }
  },
  {
    "id": "doc_082_hotel-check-in-formular",
    "recommendedSignatureLevel": "SIMPLE",
    "title": {
      "de": "Hotel Check-in Formular",
      "en": "Hotel Check-in Formular",
      "fr": "Hotel Check-in Formular"
    },
    "description": {
      "de": "Registrierung beim Check-in im Hotel",
      "en": "Registrierung beim Check-in im Hotel",
      "fr": "Registrierung beim Check-in im Hotel"
    },
    "searchTerms": {
      "de": [
        "Hotel Check-in Formular",
        "Hotel Registration"
      ],
      "en": [
        "Hotel Check-in Formular",
        "Hotel Registration"
      ],
      "fr": [
        "Hotel Check-in Formular",
        "Hotel Registration"
      ]
    }
  },
]

export interface LocalizedDocumentSignature {
  id: string
  recommendedSignatureLevel: SignatureLevel
  title: string
  description: string
  searchTerms: string[]
}

export function localizeDocumentSignature(locale: Locale, item: DocumentSignatureCatalogItem): LocalizedDocumentSignature {
  return {
    id: item.id,
    recommendedSignatureLevel: item.recommendedSignatureLevel,
    title: item.title[locale],
    description: item.description[locale],
    searchTerms: item.searchTerms[locale],
  }
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

function scoreItem(item: LocalizedDocumentSignature, normalizedQuery: string): number {
  if (!normalizedQuery) return 1

  const title = normalizeText(item.title)
  const description = normalizeText(item.description)
  const terms = item.searchTerms.map(normalizeText)

  let score = 0
  if (title === normalizedQuery) score += 300
  if (title.startsWith(normalizedQuery)) score += 200
  if (title.includes(normalizedQuery)) score += 120

  for (const term of terms) {
    if (term === normalizedQuery) score += 140
    else if (term.startsWith(normalizedQuery)) score += 100
    else if (term.includes(normalizedQuery)) score += 60
  }

  if (description.includes(normalizedQuery)) score += 40

  return score
}

export function searchDocumentSignatures(locale: Locale, query: string, limit = 10): LocalizedDocumentSignature[] {
  const localized = DOCUMENT_SIGNATURE_CATALOG.map((item) => localizeDocumentSignature(locale, item))
  const normalizedQuery = normalizeText(query)

  return localized
    .map((item, index) => ({ item, score: scoreItem(item, normalizedQuery), index }))
    .filter(({ score }) => !normalizedQuery || score > 1)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return a.index - b.index
    })
    .slice(0, limit)
    .map(({ item }) => item)
}

export function getDocumentSignatureById(id: string): DocumentSignatureCatalogItem | undefined {
  return DOCUMENT_SIGNATURE_CATALOG.find((item) => item.id === id)
}
