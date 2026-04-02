# GlucoseGuard
## Machine Learning to Web Application Integration Guide
### For Web Application Development Team

**GlucoseGuard Team**  
**Ashesi University**  
**February 2026**

---

## Executive Summary

This document explains how the machine learning prediction system integrates with the GlucoseGuard web application. The ML system predicts glucose instability events 30 minutes in advance for diabetic patients using wearable sensor data. This guide is written for web developers who need to understand the ML component but did not work on its development.

### What You Will Learn

- What the ML model does and how it works
- How sensor data flows through Firebase to the model
- What web app pages are needed and what data they display
- How to read predictions from Firebase in your React code
- How to handle alerts and notifications

---

## 1. Machine Learning Model Overview

### 1.1 What the Model Does

The ML model predicts whether a diabetic patient will experience rapid glucose changes in the next 30 minutes. It does **NOT** measure glucose directly. Instead, it analyzes vital signs (heart rate, temperature, heart rate variability) to detect patterns that indicate glucose is about to change rapidly.

#### Prediction Task

| Aspect | Details |
|--------|---------|
| **Input** | 60 minutes of vital sign history (12 data points × 5 minutes) |
| **Features Used** | Heart Rate (BPM), Skin Temperature (°C), HRV SDNN (ms), HRV RMSSD (ms) |
| **Output** | Binary prediction: Stable or Unstable |
| **Definition of Unstable** | Glucose will change by >15 mg/dL in the next 30 minutes |
| **Time Horizon** | 30 minutes ahead |

#### Why This Matters

Rapid glucose changes are dangerous for diabetic patients. A drop below 70 mg/dL (hypoglycemia) can cause dizziness, confusion, or loss of consciousness. A spike above 180 mg/dL (hyperglycemia) can lead to long-term complications. By predicting these events 30 minutes early, patients have time to take corrective action (eat glucose tablets, take insulin, etc.).

### 1.2 Model Performance

The system uses an ensemble of three machine learning models. Performance was validated across 15 diabetic patients who were NOT seen during training.

| Model | Recall | Precision | F2-Score |
|-------|--------|-----------|----------|
| XGBoost (baseline) | 76.8% | 30.1% | 57.2% |
| LSTM | 79.7% | 30.5% | 59.0% |
| **Ensemble (final)** | **80.7%** | **31.1%** | **59.9%** |

#### Understanding the Metrics

- **Recall (80.7%)**: The model catches 80.7% of upcoming glucose instability events. This means it misses about 1 in 5 dangerous events.
- **Precision (31.1%)**: When the model alerts "unstable", it is correct about 1 out of 3 times. The other 2 times are false alarms.
- **Design Decision**: We prioritize recall over precision because missing a dangerous event is worse than a false alarm. Patients can tolerate false alerts better than missed warnings.

### 1.3 What the Model Does NOT Do

It is important to understand the model's limitations:

- Does NOT measure actual glucose levels (no glucose sensor)
- Does NOT diagnose diabetes or other medical conditions
- Does NOT provide medical advice
- **SpO2 is displayed in the app but NOT used as an input to the model** (the training dataset did not include SpO2 measurements)
- Cannot predict which direction glucose will move (only that it will change rapidly)

---

## 2. System Architecture

### 2.1 Overall Data Flow

The system follows this sequence:

1. **ESP32 microcontroller with MAX30102 sensor collects vital signs every 5 minutes**
2. **ESP32 publishes data to Firebase Realtime Database via MQTT protocol**
3. **Firebase Cloud Function is triggered automatically on new data**
4. **Cloud Function runs the ML ensemble model with 60-minute window**
5. **Prediction result is written back to Firebase**
6. **Web app listens to Firebase and updates the UI in real-time**
7. **If prediction is "unstable", Firebase Cloud Messaging sends push notification to clinician**

### 2.2 Firebase Database Structure

The Firebase Realtime Database is organized into three main collections:

#### Collection 1: `users/`

Stores user authentication and profile information.

```
users/
  {userId}/
    name: "Dr. Kwame Mensah"
    email: "kwame.mensah@hospital.gh"
    role: "clinician"
```

#### Collection 2: `patient_data/`

Stores all vital sign readings and ML predictions. New entries are added every 5 minutes.

```
patient_data/
  {patientId}/
    {timestamp}/  // e.g., "2026-02-17T14:30:00Z"
      heart_rate: 78             (integer, BPM)
      temperature: 36.2          (float, °C)
      hrv_sdnn: 62.5             (float, ms)
      hrv_rmssd: 68.3            (float, ms)
      spo2: 98                   (integer, %)
      is_unstable_prediction: false    (boolean)
      instability_risk: "stable"       (string: "stable" | "warning" | "high_risk")
      anomaly_score: 0.12        (float, 0.0-1.0)
```

#### Field Explanations

| Field | Type | Description |
|-------|------|-------------|
| `heart_rate` | integer | Heart rate in beats per minute (BPM). **Used in ML model.** |
| `temperature` | float | Skin temperature in Celsius. **Used in ML model.** |
| `hrv_sdnn` | float | Heart rate variability standard deviation (ms). **Used in ML model.** |
| `hrv_rmssd` | float | Heart rate variability root mean square (ms). **Used in ML model.** |
| `spo2` | integer | Blood oxygen saturation percentage. **NOT used in ML model** but displayed for general health awareness. |
| `is_unstable_prediction` | boolean | True if model predicts glucose will change rapidly in next 30 min. |
| `instability_risk` | string | Three-level risk classification. Values: `"stable"`, `"warning"`, `"high_risk"` |
| `anomaly_score` | float | Raw model confidence score between 0.0 (stable) and 1.0 (unstable). |

#### Collection 3: `alerts/`

Stores historical alert notifications for display in the web app.

```
alerts/
  {patientId}/
    {alertId}/
      type: "glucose_instability"
      severity: "critical"    ("warning" | "critical")
      timestamp: "2026-02-17T14:35:00Z"
      message: "High risk of glucose instability detected."
      triggered_by: {
        heart_rate: 92,
        temperature: 35.8,
        anomaly_score: 0.87
      }
```

---

## 3. Web Application Requirements

### 3.1 Required Pages

The web application is for clinicians (doctors, nurses). It requires these pages:

#### Page 1: Login / Authentication

- Email + password login via Firebase Authentication
- Verify user role is 'clinician' before allowing access
- Redirect to Patient List after successful login

#### Page 2: Patient List

- Display all patients assigned to the logged-in clinician
- Show: Patient name, current risk status, last reading timestamp
- Visual indicators: Green (stable), Amber (warning), Red (high risk)
- Clicking a patient navigates to Live Monitoring page

#### Page 3: Live Monitoring Dashboard

This is the main monitoring interface for a single patient.

- Patient name and ID at the top
- **Four vital signs cards showing current values:**
  - Heart Rate (BPM)
  - Skin Temperature (°C)
  - HRV/RMSSD (ms)
  - SpO2 (%) - displayed but NOT used in predictions
- **ML Prediction card showing:**
  - Current risk level: Stable / Warning / High Risk
  - Prediction timestamp
  - Anomaly score (confidence level)
- **Real-time line chart showing trends over past 6 hours**

#### Page 4: Historical Data

- Date range selector (last 24 hours, 7 days, 30 days, custom)
- Filterable charts for each vital sign metric
- Timeline showing when alerts were triggered
- Export to PDF button for medical records

#### Page 5: Alerts Log

- Chronological list of all past alerts for selected patient
- Each entry shows: Date/time, alert type, severity, vital signs at time of alert
- Filter by severity (warning vs critical)
- Mark alerts as 'acknowledged' after review

---

## 4. Implementation Guide for React Developers

### 4.1 Reading Real-Time Data from Firebase

Use Firebase's `onValue()` listener to get real-time updates when new sensor data arrives.

**Example: Fetching Latest Patient Data**

```javascript
import { ref, onValue, query, orderByKey, limitToLast } from 'firebase/database';
import { database } from './firebase-config';

function LiveMonitoring({ patientId }) {
  const [latestData, setLatestData] = useState(null);

  useEffect(() => {
    // Reference to patient's data, get only the most recent entry
    const dataRef = query(
      ref(database, `patient_data/${patientId}`),
      orderByKey(),
      limitToLast(1)
    );

    const unsubscribe = onValue(dataRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const latestTimestamp = Object.keys(data)[0];
        const latestReading = data[latestTimestamp];
        setLatestData({ timestamp: latestTimestamp, ...latestReading });
      }
    });

    return () => unsubscribe(); // Cleanup listener
  }, [patientId]);

  return (
    <div>
      <h2>Live Patient Data</h2>
      {latestData && (
        <>
          <p>Heart Rate: {latestData.heart_rate} BPM</p>
          <p>Temperature: {latestData.temperature} °C</p>
          <p>Risk: {latestData.instability_risk}</p>
          <p>Last Updated: {new Date(latestData.timestamp).toLocaleString()}</p>
        </>
      )}
    </div>
  );
}
```

### 4.2 Displaying the ML Prediction

The `instability_risk` field has three values you should display differently:

| Value | Display Color | Meaning |
|-------|--------------|---------|
| `"stable"` | Green (#4CAF50) | No glucose instability predicted in next 30 min |
| `"warning"` | Amber (#FFA726) | Moderate risk detected, monitor closely |
| `"high_risk"` | Red (#EF5350) | High confidence prediction of glucose instability |

**Example: Risk Status Component**

```javascript
function RiskStatusCard({ risk, anomalyScore }) {
  const getRiskConfig = (riskLevel) => {
    switch(riskLevel) {
      case 'stable':
        return { color: '#4CAF50', label: 'Stable', icon: '✓' };
      case 'warning':
        return { color: '#FFA726', label: 'Warning', icon: '⚠' };
      case 'high_risk':
        return { color: '#EF5350', label: 'High Risk', icon: '⚠⚠' };
      default:
        return { color: '#9E9E9E', label: 'Unknown', icon: '?' };
    }
  };

  const config = getRiskConfig(risk);

  return (
    <div style={{ 
      backgroundColor: config.color, 
      padding: '20px', 
      borderRadius: '8px',
      color: 'white'
    }}>
      <h3>{config.icon} {config.label}</h3>
      <p>Glucose Instability Risk (next 30 min)</p>
      <p>Confidence: {(anomalyScore * 100).toFixed(1)}%</p>
    </div>
  );
}
```

### 4.3 Fetching Historical Data for Charts

For the Historical Data page, query a time range of readings.

**Example: Fetching Last 24 Hours of Data**

```javascript
import { ref, query, orderByKey, startAt, endAt, get } from 'firebase/database';

function HistoricalData({ patientId }) {
  const [historicalData, setHistoricalData] = useState([]);

  const fetchHistoricalData = async () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    // Firebase keys are ISO timestamps
    const startKey = yesterday.toISOString();
    const endKey = now.toISOString();

    const dataRef = query(
      ref(database, `patient_data/${patientId}`),
      orderByKey(),
      startAt(startKey),
      endAt(endKey)
    );

    const snapshot = await get(dataRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      // Convert object to array for charting
      const dataArray = Object.entries(data).map(([timestamp, values]) => ({
        timestamp,
        ...values
      }));
      setHistoricalData(dataArray);
    }
  };

  useEffect(() => {
    fetchHistoricalData();
  }, [patientId]);

  return (
    <div>
      <h2>Historical Trends (Last 24 Hours)</h2>
      {/* Use dataArray with your charting library (e.g., Recharts, Chart.js) */}
    </div>
  );
}
```

### 4.4 Listening for New Alerts

The `alerts` collection is updated by the Cloud Function when a high-risk prediction occurs. Your web app should listen for new alerts and optionally play a sound or show a modal.

**Example: Alert Listener**

```javascript
import { ref, query, orderByKey, limitToLast, onValue } from 'firebase/database';

function AlertMonitor({ patientId }) {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const alertsRef = query(
      ref(database, `alerts/${patientId}`),
      orderByKey(),
      limitToLast(10) // Get latest 10 alerts
    );

    const unsubscribe = onValue(alertsRef, (snapshot) => {
      if (snapshot.exists()) {
        const alertsData = snapshot.val();
        const alertsArray = Object.entries(alertsData).map(
          ([id, alert]) => ({ id, ...alert })
        );
        setAlerts(alertsArray);
        
        // If there's a new critical alert, play sound
        const latestAlert = alertsArray[alertsArray.length - 1];
        if (latestAlert.severity === 'critical') {
          playAlertSound();
        }
      }
    });

    return () => unsubscribe();
  }, [patientId]);

  return (
    <div>
      <h2>Recent Alerts</h2>
      {alerts.map(alert => (
        <div key={alert.id} style={{
          backgroundColor: alert.severity === 'critical' ? '#FFEBEE' : '#FFF9C4',
          padding: '10px',
          margin: '5px 0',
          borderRadius: '4px'
        }}>
          <p><strong>{alert.type}</strong> - {alert.severity}</p>
          <p>{alert.message}</p>
          <p>{new Date(alert.timestamp).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## 5. ML Backend Integration (For Reference)

This section explains how the ML model is deployed. As the web developer, you do not need to modify this code, but understanding it will help debug issues.

### 5.1 Firebase Cloud Function Trigger

The Cloud Function automatically runs every time new sensor data is written to `patient_data/{patientId}/{timestamp}`.

**Simplified Cloud Function Flow:**

1. New sensor data arrives in Firebase
2. Cloud Function triggers automatically
3. Function fetches last 60 minutes of data (12 readings × 5 min intervals)
4. If <12 readings exist, skip prediction (not enough history yet)
5. Else, run XGBoost model and LSTM model
6. Combine predictions using weighted average (Ensemble Strategy B)
7. Apply threshold to convert probability to stable/warning/high_risk
8. Write prediction back to Firebase under the same timestamp
9. If high_risk, create entry in `alerts/` collection and send FCM notification

### 5.2 Model Files Location

The trained models are stored in the Cloud Function deployment package:

- XGBoost model: `models/xgboost_trend_model.pkl`
- LSTM model: `models/lstm_trend_model.keras`
- Feature scaler (XGBoost): `models/xgboost_scaler.pkl`
- Feature scaler (LSTM): `models/lstm_scaler.pkl`

**Important:** These models were trained in Python using scikit-learn, XGBoost, and TensorFlow. The Cloud Function runs on a Node.js runtime, so it calls a Python subprocess to load and run the models. This is handled automatically.

---

## 6. Testing and Debugging

### 6.1 Simulating Sensor Data for Testing

While developing the web app, you may not have access to the physical hardware sensor. You can manually write test data to Firebase to simulate incoming readings.

**Test Data Script (Node.js):**

```javascript
import { ref, set } from 'firebase/database';
import { database } from './firebase-config';

function simulateReading(patientId) {
  const timestamp = new Date().toISOString();
  const testData = {
    heart_rate: Math.floor(Math.random() * 30) + 60,  // 60-90 BPM
    temperature: (Math.random() * 2 + 36).toFixed(1), // 36-38°C
    hrv_sdnn: Math.floor(Math.random() * 40) + 40,   // 40-80 ms
    hrv_rmssd: Math.floor(Math.random() * 50) + 50,  // 50-100 ms
    spo2: Math.floor(Math.random() * 5) + 95,        // 95-100%
    // ML prediction fields will be filled by Cloud Function
  };

  set(ref(database, `patient_data/${patientId}/${timestamp}`), testData);
  console.log('Simulated reading written:', timestamp);
}

// Simulate a reading every 5 minutes
setInterval(() => simulateReading('test-patient-001'), 5 * 60 * 1000);
```

### 6.2 Common Issues and Solutions

| Problem | Possible Cause | Solution |
|---------|----------------|----------|
| No predictions appearing | Cloud Function not deployed or failed | Check Firebase Console → Functions tab for errors |
| Predictions always 'stable' | Not enough historical data (<12 readings) | Wait 60 minutes for enough data to accumulate |
| Real-time updates not working | Firebase listener not attached correctly | Verify onValue() is called in useEffect with proper cleanup |
| Wrong data displayed | Using wrong patient ID | Console.log patientId to verify it matches Firebase structure |
| Charts not rendering | Data not in correct format | Ensure historicalData is an array with timestamp and value fields |

### 6.3 Monitoring Cloud Function Logs

To debug issues with the ML prediction pipeline, check the Cloud Function logs in the Firebase Console:

1. Go to Firebase Console → Functions
2. Click on the function name (e.g., 'runMLPrediction')
3. View Logs tab to see execution history
4. Look for errors like 'Model file not found' or 'Insufficient data'

---

## 7. Deployment Checklist

Before deploying the web application to production, ensure the following items are complete:

### 7.1 Firebase Configuration

- [ ] Firebase project created with Realtime Database enabled
- [ ] Firebase Authentication configured for email/password
- [ ] Database security rules configured to restrict access by user role
- [ ] Firebase Cloud Messaging (FCM) enabled for push notifications
- [ ] Cloud Functions deployed with ML models included in package

### 7.2 Security Rules Example

Firebase Realtime Database security rules to protect patient data:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth != null && auth.uid == $uid",
        ".write": "auth != null && auth.uid == $uid"
      }
    },
    "patient_data": {
      "$patientId": {
        ".read": "auth != null && (auth.uid == $patientId || root.child('users/' + auth.uid + '/role').val() == 'clinician')",
        ".write": "auth != null && auth.uid == $patientId"
      }
    },
    "alerts": {
      "$patientId": {
        ".read": "auth != null && (auth.uid == $patientId || root.child('users/' + auth.uid + '/role').val() == 'clinician')",
        ".write": false  // Only Cloud Functions can write alerts
      }
    }
  }
}
```

### 7.3 Web App Deployment

- [ ] React app built for production (`npm run build`)
- [ ] Environment variables configured (Firebase config keys)
- [ ] Hosted on Firebase Hosting or other platform
- [ ] HTTPS enabled (required for Firebase Authentication)
- [ ] Error boundary components added to catch runtime errors

---

## 8. Frequently Asked Questions

### Q1: Why is SpO2 not used in the ML model?

**A:** The training dataset (BIG IDEAs Lab from PhysioNet) did not include SpO2 measurements, only heart rate, temperature, and heart rate variability. While the MAX30102 sensor can measure SpO2, we cannot include it as an ML input feature without retraining the model on a dataset that contains SpO2 readings. It is still displayed in the app as a general health indicator.

### Q2: How often should the web app update vital signs?

**A:** New sensor readings arrive every 5 minutes. The Firebase real-time listener (`onValue`) will automatically trigger your UI update callback when new data is written. You do not need to manually poll for updates.

### Q3: What happens if the patient's internet connection drops?

**A:** The ESP32 will buffer sensor readings locally and upload them when connectivity is restored. Firebase Realtime Database has built-in offline persistence for the web app, so clinicians will see the last known data even if the patient goes offline temporarily.

### Q4: How accurate is the 30-minute prediction horizon?

**A:** The model predicts that glucose will change rapidly sometime within the next 30 minutes, not at exactly 30 minutes from now. The recall rate of 80.7% means it catches about 8 out of 10 upcoming instability events. This is a screening tool, not a diagnostic device.

### Q5: Can I query Firebase for data older than 30 days?

**A:** Yes, all patient data is stored indefinitely in Firebase unless explicitly deleted. You can query any time range using `startAt()` and `endAt()` with ISO timestamp strings. For very large time ranges (e.g., 1 year), consider pagination to avoid downloading excessive data at once.

### Q6: What if the ML prediction takes longer than 5 minutes to compute?

**A:** Cloud Functions have a maximum timeout of 9 minutes. Our ensemble model typically completes prediction in under 2 seconds, so this is not a concern. If the function times out, it will retry automatically and log an error.

### Q7: How do I test the alert notification system?

**A:** Manually write a test alert to the `alerts/` collection in Firebase Console with `severity='critical'`. This will trigger the FCM notification to the clinician's device if notifications are properly configured. Alternatively, simulate unstable vital signs (e.g., heart rate = 120, temperature = 34.5) to trigger a real prediction alert.

---

## 9. Next Steps and Collaboration

### 9.1 Development Workflow

Recommended development sequence:

1. **Set up Firebase project and configure authentication**
2. **Build Login and Patient List pages first**
3. **Use simulated data script to populate Firebase with test readings**
4. **Build Live Monitoring page with real-time Firebase listeners**
5. **Deploy Cloud Function with ML models (ML team provides this)**
6. **Test end-to-end flow: sensor data → prediction → web app display**
7. **Build Historical Data and Alerts Log pages**
8. **Implement FCM push notifications for critical alerts**
9. **User testing with clinicians and iterate based on feedback**

### 9.2 Communication Between Teams

To ensure smooth integration, the ML team and web app team should coordinate on:

- Firebase database schema (both teams must use identical field names)
- Threshold values for warning vs high_risk classification
- Alert message templates and notification content
- Testing procedures using simulated data
- Deployment timeline and environment setup

### 9.3 Contact Information

For questions about this integration guide or the ML model:

- ML Team Lead: [Your Name and Email]
- Web App Team Lead: [Partner's Name and Email]
- Project Supervisor: Dr. Albert Dede

---

## Appendix A: Complete Firebase Schema Reference

**Full Firebase Realtime Database Structure:**

```json
{
  "users": {
    "uid_001": {
      "name": "Dr. Kwame Mensah",
      "email": "kwame@hospital.gh",
      "role": "clinician",
      "assigned_patients": ["patient_001", "patient_002"]
    },
    "patient_001": {
      "name": "John Doe",
      "email": "john.doe@example.com",
      "role": "patient",
      "diabetes_type": "Type 2",
      "assigned_clinician": "uid_001"
    }
  },
  "patient_data": {
    "patient_001": {
      "2026-02-17T14:30:00Z": {
        "heart_rate": 78,
        "temperature": 36.2,
        "hrv_sdnn": 62.5,
        "hrv_rmssd": 68.3,
        "spo2": 98,
        "is_unstable_prediction": false,
        "instability_risk": "stable",
        "anomaly_score": 0.12
      },
      "2026-02-17T14:35:00Z": {
        "heart_rate": 92,
        "temperature": 35.8,
        "hrv_sdnn": 45.2,
        "hrv_rmssd": 52.1,
        "spo2": 97,
        "is_unstable_prediction": true,
        "instability_risk": "high_risk",
        "anomaly_score": 0.87
      }
    }
  },
  "alerts": {
    "patient_001": {
      "alert_001": {
        "type": "glucose_instability",
        "severity": "critical",
        "timestamp": "2026-02-17T14:35:00Z",
        "message": "High risk of glucose instability detected in the next 30 minutes.",
        "triggered_by": {
          "heart_rate": 92,
          "temperature": 35.8,
          "anomaly_score": 0.87
        },
        "acknowledged": false
      }
    }
  }
}
```

---

## Appendix B: Recommended Libraries

Suggested React libraries for building the web application:

| Library | Purpose | Installation |
|---------|---------|--------------|
| firebase | Firebase SDK for React | `npm install firebase` |
| recharts | Charts and data visualization | `npm install recharts` |
| react-router-dom | Page navigation and routing | `npm install react-router-dom` |
| Material-UI or Ant Design | UI component library | `npm install @mui/material` OR `npm install antd` |
| date-fns | Date formatting and manipulation | `npm install date-fns` |
| react-toastify | Toast notifications for alerts | `npm install react-toastify` |

---

## Appendix C: Glossary

| Term | Definition |
|------|------------|
| **Anomaly Score** | A number between 0.0 and 1.0 representing the model's confidence that glucose will become unstable. Higher = more confident in instability. |
| **BPM** | Beats per minute, the unit for measuring heart rate. |
| **Cloud Function** | Server-side code that runs automatically in response to Firebase events (e.g., new data). |
| **Ensemble Model** | A machine learning technique that combines multiple models (XGBoost + LSTM) to improve accuracy. |
| **FCM** | Firebase Cloud Messaging, a service for sending push notifications to mobile and web apps. |
| **Glucose Instability** | Rapid change in blood glucose levels (>15 mg/dL in 30 minutes). Can be dangerous for diabetic patients. |
| **HRV** | Heart Rate Variability, the variation in time between heartbeats. Lower HRV may indicate stress or health issues. |
| **LSTM** | Long Short-Term Memory, a type of neural network good at learning from sequential data (time series). |
| **Recall** | The percentage of actual unstable events that the model successfully detects. Also called sensitivity. |
| **Precision** | The percentage of model predictions that are correct. Low precision = many false alarms. |
| **RMSSD** | Root Mean Square of Successive Differences, a specific HRV metric measuring short-term variability. |
| **SDNN** | Standard Deviation of NN intervals, a specific HRV metric measuring overall variability. |
| **SpO2** | Blood oxygen saturation percentage. Normal range is 95-100%. |
| **XGBoost** | eXtreme Gradient Boosting, a machine learning algorithm known for high accuracy on tabular data. |

---

**End of Document**

*GlucoseGuard ML to Web Integration Guide v1.0 | February 2026*
