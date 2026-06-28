# CivicReports — Your City, Your Voice 🚀

**CivicReports** is a modern civic issue reporting platform that connects citizens with local authorities. Report problems in your community, track their progress, and support faster resolutions with an organized, transparent workflow.

Designed with a clean user experience and role-based navigation to help both citizens and authorities manage issues efficiently.

---

## ✨ Key Features

- **Issue Reporting:** Submit civic problems with clear descriptions.
- **Issue Tracking:** Follow updates and changes over time.
- **Authority Dashboard:** View and manage incoming issues.
- **Status Updates:** Track resolution progress from report to completion.
- **Interactive UI:** Built with React, TypeScript, and a modern component system.

---

## 🧰 Tech Stack

- **Frontend:** React + TypeScript + Vite
- **UI:** Tailwind CSS + shadcn/ui (Radix UI)
- **Routing:** React Router DOM
- **Data/Backend:** Firebase (via `src/lib/firebase.ts`)
- **Mapping:** Leaflet + React-Leaflet (for location-based reporting)

---

## 🏗️ Project Setup

### Prerequisites
- Node.js `>= 18`
- npm (or bun)
- A Firebase project

### 1) Install dependencies
```bash
npm install
```

### 2) Configure Firebase
Create a `.env` file in the project root (adjust values to match your Firebase config used in the app):

```env
# Example names (update to what your app expects)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### 3) Run locally
```bash
npm run dev
```

---

## 🚀 Deployment

This app can be deployed to any static hosting that supports Vite builds (e.g. Netlify, Vercel, Firebase Hosting).

Production build:
```bash
npm run build
```

---

## 📌 Usage

- **Citizens:** report issues and track status from the UI.
- **Authorities:** review, update, and manage reported issues.

---

## 📸 Screenshots

Screenshots are stored in the folder `project ss/` at the root of this repository.

> GitHub note: for images to render, ensure you commit that `project ss/` folder and that the paths below match the uploaded filenames.

### Overview

| Screenshot | Description |
|---|---|
| ![Project Screenshot 1](project%20ss/1.png) | Home / Landing |
| ![Project Screenshot 2](project%20ss/2.png) | Login |
| ![Project Screenshot 3](project%20ss/3.png) | Report Issue |
| ![Project Screenshot 4](project%20ss/4.png) | Issue Tracker |

### Authority / Admin views

| Screenshot | Description |
|---|---|
| ![Project Screenshot 5](project%20ss/5.png) | Authority Dashboard |
| ![Project Screenshot 6](project%20ss/6.png) | Status Updates |

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues and pull requests.

---

## 📄 License

MIT License


