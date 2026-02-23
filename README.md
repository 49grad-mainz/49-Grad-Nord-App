# 49°N App (Baugemeinschaft & Wohnprojekt App) 🏘️

Willkommen zum Repository der **49°N App**! Dies ist eine Open-Source-Plattform (unter der AGPLv3 Lizenz), die speziell für Baugemeinschaften, Wohnprojekte und Nachbarschaftsinitiativen entwickelt wurde.

Sie bietet Funktionen wie:
* 📅 Ressourcenbuchung (Gemeinschaftsräume, Lastenräder, etc.)
* 🧺 Waschmaschinen- und Trockner-Management
* 🛠️ Gemeinschaftshaushalt & Werkzeugverleih
* 💬 Interne Kommunikation & News

## 🚧 Status: Work in Progress

**Hinweis zur Installation:** Diese App befindet sich aktuell im aktiven Einsatz, aber die Open-Source-Dokumentation für das Setup ist noch unvollständig.

Die Architektur ist relativ komplex und erfordert:
* Angular & Node.js
* Ein Google Firebase Projekt (inkl. **Blaze Plan**)
* Firebase Cloud Functions & Firestore
* Google Cloud Platform (GCP) Konfigurationen

Ein detaillierter Setup-Guide folgt in Zukunft!

## 💻 Für Entwickler (Schnellstart-Info)

Wenn du dich trotzdem schon im Code umsehen möchtest:

1. Repository klonen:
   `git clone https://github.com/49grad-mainz/49-Grad-Nord-App.git`
2. Pakete installieren:
   `npm install`
3. **Wichtig:** Aus Sicherheitsgründen sind keine Firebase-Keys oder rechtlichen Texte im Code enthalten. Um die App lokal zu starten (`ng serve`), musst du dir im Ordner `src/environments/` aus der `environment.template.ts` eigene lokale Konfigurationsdateien bauen und mit deinem eigenen Firebase-Projekt verknüpfen.

---
*Erstellt mit ❤️ in Mainz für gemeinschaftliches Wohnen.*
