<h1 align="center">
  <img src="public/logo1.png" alt="CivicReports Logo" width="60"/><br/>
  CivicReports — Your City, Your Voice 🏙️
</h1>

<p align="center">
  A modern civic issue reporting platform connecting citizens with local authorities for faster, transparent resolutions.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white&style=flat-square"/>
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white&style=flat-square"/>
  <img src="https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white&style=flat-square"/>
  <img src="https://img.shields.io/badge/Firebase-Backend-FFCA28?logo=firebase&logoColor=black&style=flat-square"/>
  <img src="https://img.shields.io/badge/TailwindCSS-3-06B6D4?logo=tailwindcss&logoColor=white&style=flat-square"/>
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square"/>
</p>

---

## ✨ Features

| Feature | Description |
|---|---|
| 📝 Issue Reporting | Submit civic problems with descriptions and location pins |
| 📍 Map Integration | Pin exact locations using Leaflet interactive maps |
| 🔄 Issue Tracking | Follow real-time status updates from report to resolution |
| 🛡️ Role-Based Access | Separate flows for citizens and authorities |
| 🏛️ Authority Dashboard | Manage, filter, and act on incoming reports |
| 🔔 Status Updates | Progress tracking from open → in-progress → resolved |

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + shadcn/ui (Radix UI) |
| Routing | React Router DOM |
| Backend / DB | Firebase (Firestore + Auth) |
| Maps | Leaflet + React-Leaflet |
| Hosting | Netlify / Vercel / Firebase Hosting |

---

## 🏗️ Getting Started

### Prerequisites
- Node.js `>= 18`
- npm or bun
- A Firebase project

### 1. Clone & Install

```bash
git clone https://github.com/your-username/city-report-track.git
cd city-report-track
npm install
```

### 2. Configure Firebase

Create a `.env` file in the project root:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Run Locally

```bash
npm run dev
```

App runs at `http://localhost:5173` by default.

---

## 🚀 Deployment

```bash
npm run build
```

Deploy the `dist/` folder to any static host — Netlify, Vercel, or Firebase Hosting. A `netlify.toml` is already included for one-click Netlify deploys.

---

## 📌 How It Works

```
Citizen                         Authority
  │                                │
  ├─ Sign up / Log in              ├─ Admin Login
  ├─ Submit issue (+ map pin)      ├─ View all reports on dashboard
  ├─ Track status in real-time     ├─ Update status / add remarks
  └─ Get notified on resolution    └─ Mark issue as resolved
```

---

## 📸 Screenshots

### 🏠 Citizen Views

| | |
|---|---|
| ![Home](project%20ss/1.png) | ![Login](project%20ss/2.png) |
| **1. Home / Landing Page** | **2. Login** |
| ![Report Issue](project%20ss/3.png) | ![Issue Tracker](project%20ss/4.png) |
| **3. Report an Issue** | **4. Issue Tracker** |
| ![Map View](project%20ss/5.png) | ![Profile](project%20ss/6.png) |
| **5. Map / Location Pin** | **6. User Profile** |

### 🏛️ Authority / Admin Views

| | |
|---|---|
| ![Authority Dashboard](project%20ss/7.png) | ![Issue Details](project%20ss/8.png) |
| **7. Authority Dashboard** | **8. Issue Details** |
| ![Status Update](project%20ss/9.png) | ![Admin Login](project%20ss/10.png) |
| **9. Status Update** | **10. Admin Login** |

---

## 📁 Project Structure

```
src/
├── components/       # Reusable UI components
├── contexts/         # Auth context
├── hooks/            # Custom hooks
├── lib/              # Firebase config & utilities
├── pages/            # Route-level page components
├── services/         # Firestore service functions
└── types/            # TypeScript type declarations
```

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push and open a Pull Request

---

## 📄 License

MIT License — feel free to use, modify, and distribute.

---

<p align="center">Built with ❤️ to make cities better, one report at a time.</p>
