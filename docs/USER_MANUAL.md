# GlucoseGuard — User Manual

**For clinicians and healthcare staff using the web dashboard**

---

## Overview

GlucoseGuard is a monitoring tool that lets you keep an eye on your diabetic patients' vitals in real time. Their wearable sensor sends readings every five minutes, and the dashboard shows you what's happening, flags anything concerning, and lets you dig into the history whenever you need to.

This manual walks you through every part of the dashboard from logging in for the first time to downloading a patient report.

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [The Dashboard](#2-the-dashboard)
3. [Managing Patients](#3-managing-patients)
4. [Viewing a Patient's Details](#4-viewing-a-patients-details)
5. [Alerts](#5-alerts)
6. [Analytics](#6-analytics)
7. [Downloading a Patient Report](#7-downloading-a-patient-report)
8. [Settings](#8-settings)
9. [Understanding the ML Predictions](#9-understanding-the-ml-predictions)
10. [Alert Thresholds Reference](#10-alert-thresholds-reference)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. Getting Started

### Registering an account

1. Open the app and click **Get Started** or navigate to `/register`
2. Enter your name, email address, phone number, and a password
3. Click **Create Account**
4. You will be taken through a short onboarding flow (just a few setup steps the first time)
5. Once complete, you land on the main dashboard

> Accounts created through the web app are **doctor accounts** by default. Patient accounts are created on the mobile app by the patients themselves.

### Logging in

Go to the login page, enter your email and password, and click **Sign In**. You will be sent back to the dashboard automatically.

### Logging out

Click your profile icon in the top corner of the sidebar and select **Log Out**.

---

## 2. The Dashboard

The dashboard is your home screen. It gives you a high-level view of everything happening across your patients.

### Summary cards

At the top you will see four cards:

| Card | What it shows |
|---|---|
| **Active Patients** | Total number of patients currently assigned to you |
| **Critical Alerts** | Patients whose status is currently marked Critical |
| **Warnings** | Patients whose status is currently marked Warning |
| **Pending Reports** | Reserved for future use |

These numbers update automatically every 15 seconds.

### Recent activity feed

Below the summary cards is a list of the most recent alerts across all your patients — newest first. Each entry shows the patient's name, what was flagged, the value, and how long ago it happened.

### Alerts panel

On the right side you will see unread alerts. You can dismiss an alert by clicking the checkmark next to it, which marks it as resolved. Prediction alerts (from the ML model) appear in a separate tab labelled **Glucose Alerts**.

---

## 3. Managing Patients

Click **Patients** in the left sidebar to open the patient list.

### Adding a patient

1. Click the **Add Patient** button in the top right
2. Enter the patient's **email address** (the one they used to register on the mobile app) and their **date of birth**
3. Click **Add**

The system verifies that a patient account with that email exists and that the date of birth matches. If both check out, a request is sent to the patient — they will see it on their mobile app and can accept or decline.

> The patient must have already registered on the mobile app before you can add them. If you get a "not found" error, ask the patient to sign up first.

**Possible statuses after adding:**

- **Pending** — the patient has not yet accepted the request on their mobile app
- **Accepted** — fully active; you can see their vitals and alerts
- **Rejected / Revoked** — the patient declined or removed you; you can re-send a request

### Searching and filtering

Use the search bar at the top of the patient list to find patients by name. You can also filter by status (Critical, Warning, Stable) using the dropdown.

### Removing a patient

Click on a patient's row to open their detail page, then use the options menu to remove them. This does not delete their account — it just unlinks them from your dashboard.

---

## 4. Viewing a Patient's Details

Click on any patient in the list to open their full detail view.

### Vitals panel

The top section shows the latest reading for each vital sign:

- **Heart Rate** — measured in beats per minute (bpm)
- **Body Temperature** — measured in degrees Celsius (°C)
- **SpO2** — blood oxygen saturation percentage (displayed for reference; not used by the ML model)

Each card also shows a small trend indicator based on recent readings.

### Live chart

Below the vitals panel is a line chart showing the last 200 readings. The chart updates automatically as new readings come in. You can hover over any point to see the exact value and timestamp.

The chart shows heart rate and temperature on the same timeline. If a reading is flagged as high risk by the ML model, those points are highlighted differently.

### Alert history

Further down the page you will see all alerts for this patient — both resolved and unresolved — in reverse chronological order.

---

## 5. Alerts

Alerts are created automatically whenever:

- A reading falls outside the normal range (see [Alert Thresholds Reference](#10-alert-thresholds-reference))
- The ML model predicts a glucose instability event

### Types of alerts

| Type | What it means |
|---|---|
| **Critical** | Heart rate is dangerously high (above 100 bpm). Needs immediate attention. |
| **Warning** | Heart rate is low (below 60 bpm) or temperature is elevated (above 37.5°C) |
| **Glucose Alert** | The ML model has predicted upcoming glucose instability with high confidence |

### What happens when an alert is triggered

1. The alert appears in the dashboard feed immediately
2. A push notification is sent to the **patient's** phone via the mobile app
3. The patient's status badge (Critical / Warning) is updated on their profile

### Resolving an alert

Click the checkmark or **Resolve** button next to an alert to mark it as read. It will move out of the unread panel but stay in the patient's history for reference.

---

## 6. Analytics

Click **Analytics** in the sidebar to see aggregate data across all your accepted patients.

### What's on the Analytics page

- **Heart Rate Trend** — a chart showing average heart rate bucketed by hour across the last 24 hours, from all your patients combined
- **Glucose Instability Events** — the number of times the ML model flagged a likely instability event in the last 24 hours
- **Instability Rate** — the percentage of predictions in the last 24 hours that were flagged as anomalies
- **Total Patients** — total number of patients in the system (not just yours)

This page is useful for spotting patterns across the group — for example, whether instability events tend to cluster at certain times of day.

---

## 7. Downloading a Patient Report

1. Open a patient's detail page
2. Click the **Download Report** button (PDF icon) in the top right
3. The browser will download a PDF file named `report-{patientId}.pdf`

The report includes:
- Patient profile (name, DOB, assigned doctor)
- Latest vital sign readings
- Recent alert history
- A summary of prediction activity

---

## 8. Settings

Click **Settings** in the sidebar to manage your account preferences. From here you can update your display name and other profile details.

---

## 9. Understanding the ML Predictions

The glucose instability predictions come from a separate machine learning model that runs in the background. Here is what you need to know to interpret them correctly.

### What the model does

The model looks at 60 minutes of a patient's heart rate, skin temperature, and heart rate variability (HRV). It uses patterns in those readings to predict whether the patient's blood glucose is likely to change rapidly in the **next 30 minutes**.

It does **not** measure glucose directly — it detects early warning signs in the vital signs that tend to precede a glucose event.

### What the numbers mean

- **Anomaly probability** (0–100%) — the model's confidence that an instability event is coming. Higher means more confident.
- **Instability risk** — a three-level label: `stable`, `warning`, or `high_risk`
- **XGBoost / LSTM probability** — the individual model scores that were combined to produce the final probability

### Important caveats

- The model catches about 80% of real instability events — which means it misses roughly 1 in 5
- When it does alert, it is correct about 1 in 3 times. The other 2 are false alarms. This is intentional: a false alarm is better than a missed real event
- **This tool is not a substitute for clinical judgment.** Use it as an early warning signal, not a diagnosis

### What to do when you see a glucose alert

1. Check the patient's recent vitals on their detail page
2. Contact the patient and ask them to check their blood glucose manually
3. Advise appropriate action based on the actual glucose reading

---

## 10. Alert Thresholds Reference

These are the values that trigger automatic alerts:

| Vital | Normal Range | Warning Trigger | Critical Trigger |
|---|---|---|---|
| Heart Rate | 60–100 bpm | Below 60 bpm | Above 100 bpm |
| Body Temperature | 36.0–37.5°C | Above 37.5°C | — |

---

## 11. Troubleshooting

**I added a patient but their status is stuck on "Pending"**  
The patient needs to open the mobile app and accept your request. Ask them to check their notifications or the requests section in the app.

**The vitals chart is empty or not updating**  
The patient's sensor may be off or out of range. Check that the device is powered on and connected. If you are testing without hardware, run `node simulate_sensor.js` from the backend folder.

**I am not seeing any alerts even when readings are abnormal**  
Make sure the patient's assignment status is **Accepted** — alerts are only surfaced for fully accepted patients.

**The app says "Not authorised" after I log in**  
Your session token may have expired. Log out and log back in to refresh it.

**A push notification was sent but the patient did not receive it**  
The patient may have denied notification permissions on their phone. Ask them to check their app notification settings. If the problem persists, they can try logging out and back in to the mobile app, which refreshes their push notification token.

**I get a "Date of birth does not match" error when adding a patient**  
The date of birth you entered does not match what the patient used when registering on the mobile app. Double-check the format (YYYY-MM-DD) and confirm with the patient.
