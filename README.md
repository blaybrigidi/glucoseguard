# GlucoseGuard — Web Dashboard

**Live app: [glucoseguard.vercel.app](https://glucoseguard.vercel.app)**
**Backend API: [glucoseguard.onrender.com](https://glucoseguard.onrender.com)**
**ML Model Service: [modelservice-latest.onrender.com](https://modelservice-latest.onrender.com)**

GlucoseGuard is a real-time health monitoring dashboard built for clinicians managing diabetic patients. It displays live vitals from wearable sensors, surfaces alerts when readings go out of range, and shows predictions from a machine learning model that can flag glucose instability events up to 30 minutes before they happen.

This repository contains the **web frontend** (React) and the **Node.js backend** that connects it to Firebase. The Flutter mobile app and the Python ML service live in separate repositories.

---

## What It Does

- Doctors register on the web app and add patients by email + date of birth
- Patients sign up on the mobile app and accept the doctor's request
- A wearable sensor (ESP32 + MAX30102) sends heart rate, temperature, and HRV data every 5 minutes
- The dashboard shows live readings, an alert feed, and a 24-hour trend chart
- The ML model runs separately and posts its predictions here; if it flags an anomaly, an alert is created and a push notification is sent to the patient's phone
- Doctors can download a PDF report for any patient

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS, Recharts |
| Backend | Node.js, Express 5 |
| Database | Firebase Firestore (patient records) + Realtime Database (live vitals & alerts) |
| Auth | Firebase Authentication |
| Push notifications | Firebase Cloud Messaging (FCM) |
| PDF generation | PDFKit |

---

## Prerequisites

Make sure you have these installed before you start:

- **Node.js** v18 or later — [nodejs.org](https://nodejs.org)
- **npm** v9 or later (comes with Node)
- A **Firebase project** with Firestore, Realtime Database, Authentication, and Cloud Messaging enabled
- A Firebase **service account key** (JSON file, downloaded from Project Settings → Service Accounts)

---

## Project Structure

```
CapstoneWebApp/
├── src/                  # React frontend
│   ├── components/       # All UI pages and widgets
│   ├── context/          # Auth and alerts state (React context)
│   ├── config/           # Firebase client SDK setup
│   └── services/         # API calls to the backend
├── backend/
│   ├── config/           # Firebase Admin SDK setup
│   ├── controllers/      # Request handlers (one per feature)
│   ├── services/         # Business logic (alerts, vitals, PDF, etc.)
│   ├── routes/           # Express route definitions
│   ├── middleware/        # Auth token verification
│   └── simulate_sensor.js  # Dev tool — fakes sensor data
├── docs/                 # Additional documentation
└── package.json          # Frontend dependencies
```

---

## Installation

### 1. Clone the repository

```bash
git clone <repo-url>
cd CapstoneWebApp
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd backend
npm install
cd ..
```

### 4. Configure the backend environment

Create a `.env` file inside the `backend/` folder. Use the example below as a template — you can also copy `backend/.env.example`.

```env
NODE_ENV=development
PORT=5001

# Paste your entire serviceAccountKey.json content on one line
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"your-project",...}

# Your Firebase Realtime Database URL (found in Firebase console)
FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com

# Comma-separated list of frontend origins allowed to call this backend
ALLOWED_ORIGINS=http://localhost:5173

# Optional: if set, the ML service must send this as a Bearer token or X-API-Key header
PREDICTIONS_API_SECRET=your_secret_here
```

> **Where to get the service account key:** Firebase Console → Project Settings → Service Accounts → Generate new private key. Keep this file private — never commit it to git.

### 5. Configure the frontend Firebase connection

The Firebase client config lives in `src/config/firebase.ts`. It is already populated with the project's public keys (these are safe to include in frontend code). If you are connecting to a different Firebase project, replace the values in that file with the ones from your Firebase Console → Project Settings → Your apps.

---

## Running Locally

Open two terminals — one for each process.

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# Server starts on http://localhost:5001
```

**Terminal 2 — Frontend:**
```bash
npm run dev
# App opens on http://localhost:5173
```

Open `http://localhost:5173` in your browser and register a doctor account to get started.

### Simulating sensor data (no hardware needed)

If you do not have the physical sensor, you can generate fake readings to test the dashboard:

```bash
cd backend
node simulate_sensor.js
```

This sends elevated heart rate and temperature readings every 5 seconds for the hardcoded test patient (`PATIENT_ID` at the top of the file). Change that ID to match a patient in your database. All readings are intentionally abnormal so you can see alerts trigger immediately.

---

## Running Tests

```bash
cd backend
npm test
```

Tests cover the patient service and the prediction controller/service. They use Jest and Supertest.

---

## Deployment

### Backend (e.g. Render, Railway, Fly.io)

1. Push the `backend/` folder to your hosting provider
2. Set all the environment variables from the `.env` section above in the hosting dashboard — **do not upload the `.env` file**
3. Set `NODE_ENV=production`
4. The start command is `node server.js`

### Frontend (e.g. Vercel, Netlify)

1. Set the build command to `npm run build`
2. Set the output directory to `dist`
3. After deploying, update `ALLOWED_ORIGINS` in your backend environment to include the new frontend URL (e.g. `https://your-app.vercel.app`)
4. Redeploy the backend so the new CORS setting takes effect

---

## API Reference

All endpoints are prefixed with `/api`. Routes marked **Protected** require a Firebase ID token in the `Authorization: Bearer <token>` header.

### Auth
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/api/auth/register` | Public | Register a new doctor account |

### Patients
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/api/patients` | Protected | List all patients assigned to the logged-in doctor |
| POST | `/api/patients` | Protected | Link a patient to this doctor (by email + date of birth) |
| GET | `/api/patients/:id` | Protected | Get a single patient's profile |
| PUT | `/api/patients/:id` | Protected | Update a patient's profile |
| DELETE | `/api/patients/:id` | Protected | Remove a patient from the list |

### Vitals
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/api/vitals` | Public | Record a vital sign reading (used by the sensor or simulator) |
| GET | `/api/vitals/:patientId` | Public | Get the last 200 readings for a patient |

### Dashboard
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/api/dashboard/stats` | Protected | Summary counts (active patients, critical alerts, warnings) |
| GET | `/api/dashboard/alerts` | Protected | Unread vitals alerts for this doctor's patients |
| GET | `/api/dashboard/activity` | Protected | Last 10 alert events |
| GET | `/api/dashboard/analytics` | Protected | 24-hour HR trend and glucose instability stats |
| GET | `/api/dashboard/prediction-alerts` | Protected | Unread ML prediction alerts |
| PATCH | `/api/dashboard/alerts/:id/resolve` | Protected | Mark an alert as read |

### Predictions (ML service → backend)
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/api/predictions` | Optional secret | Receive a prediction result from the ML service |

For the exact request/response shape for predictions, see [`docs/backend-post-format.md`](docs/backend-post-format.md).

### PDF Reports
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/api/pdf/:patientId` | Protected | Download a patient report as a PDF |

---

## Firebase Database Layout

The app uses two Firebase databases side by side:

**Firestore** — structured records that do not change often:
- `users/{userId}` — doctor and patient profiles, assignment status, last vitals summary

**Realtime Database** — data that updates constantly:
- `patient_data/{patientId}/{timestamp}` — every sensor reading (HR, temperature, HRV, ML prediction)
- `alerts/{patientId}/{alertId}` — all alerts (vitals + ML predictions)

---

## Environment Variables Summary

| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | Yes | `development` or `production` |
| `PORT` | No | Backend port (default: 5001) |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Yes* | Full service account JSON as a single-line string |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | Yes* | Path to the key file (alternative to the above) |
| `FIREBASE_DATABASE_URL` | Yes | Realtime Database URL from Firebase Console |
| `ALLOWED_ORIGINS` | Yes | Comma-separated list of frontend URLs |
| `PREDICTIONS_API_SECRET` | No | If set, ML service must send this to POST /api/predictions |

*One of `FIREBASE_SERVICE_ACCOUNT_JSON` or `FIREBASE_SERVICE_ACCOUNT_PATH` is required.

---

## Related Components

| Component | Description |
|---|---|
| Mobile App | Flutter app for patients — sign up, accept doctor requests, receive push alerts |
| ML Service | Python service running the XGBoost + LSTM ensemble, posts predictions to `/api/predictions` |

---

## Documentation

- [`docs/USER_MANUAL.md`](docs/USER_MANUAL.md) — step-by-step guide for doctors using the dashboard
- [`docs/backend-post-format.md`](docs/backend-post-format.md) — API contract for the ML service integration
- [`ML_WebApp_Integration_Guide.md`](ML_WebApp_Integration_Guide.md) — full write-up on how the ML model works and how it connects to this app
