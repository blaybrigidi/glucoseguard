# Prediction POST payload (ML service → Node backend)

The Python ML service sends predictions to the Node backend at **POST /api/predictions**.  
Configure the ML service with this path (e.g. `BACKEND_PREDICTIONS_PATH=/api/predictions`).

## Request

- **Method:** `POST`
- **Content-Type:** `application/json`
- **Optional auth:** If the backend sets `PREDICTIONS_API_SECRET`, send either:
  - `Authorization: Bearer <PREDICTIONS_API_SECRET>`
  - or `X-API-Key: <PREDICTIONS_API_SECRET>`

## Body shape

| Field                | Type    | Required | Description                          |
|----------------------|---------|----------|--------------------------------------|
| `prediction`         | int     | Yes      | `0` or `1`                           |
| `anomaly_probability`| number  | Yes      | e.g. 0.0–1.0                         |
| `is_anomaly`         | boolean | Yes      | Derived from prediction/threshold    |
| `earliest_reading`   | string  | Yes      | ISO 8601 datetime of window start    |
| `latest_reading`     | string  | Yes      | ISO 8601 datetime of window end      |
| `xgboost_probability`| number  | No       | Model-specific probability           |
| `lstm_probability`   | number  | No       | Model-specific probability           |
| `confidence`         | string  | No       | e.g. `'high'`, `'medium'`, `'low'`   |

## Example

```json
{
  "prediction": 1,
  "anomaly_probability": 0.87,
  "xgboost_probability": 0.85,
  "lstm_probability": 0.89,
  "confidence": "high",
  "is_anomaly": true,
  "earliest_reading": "2025-03-14T12:00:00.000Z",
  "latest_reading": "2025-03-14T12:05:00.000Z"
}
```

## Response

- **201 Created:** Body is the saved record (includes `id`, `created_at`, and all stored fields).
- **400 Bad Request:** Invalid payload; body has `{ "message": "..." }` (from error handler).
- **401 Unauthorized:** Missing or wrong secret when `PREDICTIONS_API_SECRET` is set.
- **500:** Server error; body has `{ "message": "..." }`.
