const PDFDocument = require('pdfkit');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const { db, rtdb } = require('../config/firebase');

// ─── Data Fetching ────────────────────────────────────────────────────────────

const fetchPatientInfo = async (patientId) => {
    const doc = await db.collection('users').doc(patientId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
};

const fetchVitals24h = async (patientId) => {
    const snapshot = await rtdb
        .ref(`patient_data/${patientId}`)
        .orderByKey()
        .limitToLast(300)
        .once('value');

    const data = snapshot.val();
    if (!data) return [];

    const cutoff = Date.now() - 24 * 60 * 60 * 1000;

    return Object.entries(data)
        .map(([key, val]) => ({
            timestamp: key.replace(/_/g, '.'),
            ...val
        }))
        .filter(r => new Date(r.timestamp).getTime() >= cutoff)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
};

const fetchRecentPredictions = async (patientId) => {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const snapshot = await db
        .collection('predictions')
        .where('patient_id', '==', patientId)
        .get();

    return snapshot.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(p => p.created_at >= cutoff)
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .slice(0, 25);
};

// ─── Statistics ───────────────────────────────────────────────────────────────

const computeStats = (vitals, predictions) => {
    const hrValues = vitals
        .map(r => parseFloat(r.heart_rate ?? r.hr))
        .filter(v => Number.isFinite(v));

    const tempValues = vitals
        .map(r => parseFloat(r.temperature ?? r.temp))
        .filter(v => Number.isFinite(v));

    const avgHR = hrValues.length
        ? (hrValues.reduce((s, v) => s + v, 0) / hrValues.length).toFixed(1)
        : 'N/A';

    const avgTemp = tempValues.length
        ? (tempValues.reduce((s, v) => s + v, 0) / tempValues.length).toFixed(2)
        : 'N/A';

    const instabilityEvents = vitals.filter(r => r.is_unstable_prediction === true).length;

    const probabilities = predictions
        .map(p => parseFloat(p.anomaly_probability))
        .filter(v => Number.isFinite(v));

    const highestProb = probabilities.length
        ? (Math.max(...probabilities) * 100).toFixed(1) + '%'
        : 'N/A';

    return { avgHR, avgTemp, instabilityEvents, highestProb };
};

// ─── Chart Rendering ──────────────────────────────────────────────────────────

// Render at 2× resolution for crisp embedding in PDF
const CHART_PX_W = 990;
const CHART_PX_H = 300;

const chartCanvas = new ChartJSNodeCanvas({
    width: CHART_PX_W,
    height: CHART_PX_H,
    backgroundColour: 'white',
});

/**
 * Down-sample vitals to at most `maxPoints` evenly-spaced readings so the
 * chart labels don't overlap when there are hundreds of readings.
 */
const sampleVitals = (vitals, maxPoints = 48) => {
    if (vitals.length <= maxPoints) return vitals;
    const step = Math.ceil(vitals.length / maxPoints);
    return vitals.filter((_, i) => i % step === 0);
};

const renderLineChart = async (vitals, valueKey, chartLabel, borderColor) => {
    const sampled = sampleVitals(vitals);

    const labels = sampled.map(r =>
        new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );

    const data = sampled.map(r => {
        const v = parseFloat(r[valueKey]);
        return Number.isFinite(v) ? v : null;
    });

    const config = {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: chartLabel,
                data,
                borderColor,
                backgroundColor: borderColor + '22',
                fill: true,
                pointRadius: data.length > 24 ? 1 : 3,
                tension: 0.3,
                spanGaps: true,
            }],
        },
        options: {
            responsive: false,
            animation: false,
            plugins: {
                legend: {
                    display: true,
                    labels: { font: { size: 18 }, color: '#1E293B' },
                },
            },
            scales: {
                x: {
                    ticks: { maxTicksLimit: 12, font: { size: 14 }, color: '#64748B' },
                    grid: { color: '#F1F5F9' },
                },
                y: {
                    ticks: { font: { size: 14 }, color: '#64748B' },
                    grid: { color: '#F1F5F9' },
                },
            },
        },
    };

    return chartCanvas.renderToBuffer(config);
};

// ─── PDF Helpers ──────────────────────────────────────────────────────────────

const BRAND_BLUE = '#2563EB';
const DARK = '#1E293B';
const MUTED = '#64748B';
const LIGHT_GREY = '#F1F5F9';
const RED = '#DC2626';
const GREEN = '#16A34A';
const YELLOW = '#D97706';

const drawLine = (doc, y, color = '#E2E8F0') => {
    doc.save().strokeColor(color).lineWidth(0.5).moveTo(50, y).lineTo(545, y).stroke().restore();
};

const riskColor = (risk) => {
    if (risk === 'high_risk') return RED;
    if (risk === 'warning') return YELLOW;
    return GREEN;
};

// ─── PDF Generation ───────────────────────────────────────────────────────────

const generatePDFBuffer = async (patientId) => {
    const [patient, vitals, predictions] = await Promise.all([
        fetchPatientInfo(patientId),
        fetchVitals24h(patientId),
        fetchRecentPredictions(patientId),
    ]);

    if (!patient) throw new Error(`Patient ${patientId} not found`);

    const stats = computeStats(vitals, predictions);
    const latestVital = vitals[vitals.length - 1] ?? {};
    const latestRisk = latestVital.instability_risk ?? 'stable';
    const latestProb = latestVital.instability_probability
        ? (parseFloat(latestVital.instability_probability) * 100).toFixed(1)
        : '0.0';

    // Render charts before opening the PDF stream (both are async)
    const [hrChartBuf, tempChartBuf] = await Promise.all([
        renderLineChart(vitals, 'heart_rate', 'Heart Rate (bpm)', '#2563EB'),
        renderLineChart(vitals, 'temperature', 'Temperature (°C)', '#DC2626'),
    ]);

    // Chart display dimensions in PDF points (half of pixel size = 2× crisp)
    const CHART_PT_W = 495;
    const CHART_PT_H = 150;

    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const chunks = [];
        let pageNum = 1;

        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        const pageWidth = doc.page.width; // 595.28

        // ── Header bar ──────────────────────────────────────────────────────────
        doc.rect(0, 0, pageWidth, 70).fill(BRAND_BLUE);

        doc.fillColor('white').fontSize(22).font('Helvetica-Bold')
            .text('GlucoseGuard', 50, 18);

        doc.fontSize(10).font('Helvetica')
            .text('Patient Health Report', 50, 44);

        doc.text(`Generated: ${new Date().toLocaleString()}`, 0, 44, {
            align: 'right',
            width: pageWidth - 50,
        });

        let y = 90;

        // ── Patient Info ─────────────────────────────────────────────────────────
        doc.fillColor(DARK).fontSize(14).font('Helvetica-Bold').text('Patient Information', 50, y);
        y += 20;
        drawLine(doc, y);
        y += 10;

        const infoRows = [
            ['Name', patient.fullName ?? patient.name ?? 'Unknown'],
            ['Patient ID', patient.id],
            ['Status', patient.status ?? 'Normal'],
            ['Role', patient.role ?? '--'],
        ];

        infoRows.forEach(([label, value]) => {
            doc.font('Helvetica-Bold').fontSize(10).fillColor(MUTED).text(label + ':', 50, y, { width: 100 });
            doc.font('Helvetica').fontSize(10).fillColor(DARK).text(String(value), 160, y);
            y += 18;
        });

        y += 10;

        // ── Current Risk Assessment ──────────────────────────────────────────────
        doc.fillColor(DARK).fontSize(14).font('Helvetica-Bold').text('Current Risk Assessment', 50, y);
        y += 20;
        drawLine(doc, y);
        y += 10;

        const riskLabel = latestRisk.replace('_', ' ').toUpperCase();
        const rc = riskColor(latestRisk);

        doc.roundedRect(50, y, 240, 60, 6).fill(LIGHT_GREY);
        doc.font('Helvetica-Bold').fontSize(11).fillColor(MUTED).text('Risk Level', 65, y + 10);
        doc.font('Helvetica-Bold').fontSize(18).fillColor(rc).text(riskLabel, 65, y + 26);

        doc.roundedRect(310, y, 240, 60, 6).fill(LIGHT_GREY);
        doc.font('Helvetica-Bold').fontSize(11).fillColor(MUTED).text('Confidence Score', 325, y + 10);
        doc.font('Helvetica-Bold').fontSize(18).fillColor(DARK).text(`${latestProb}%`, 325, y + 26);
        doc.font('Helvetica').fontSize(9).fillColor(MUTED).text('Prediction horizon: 30 minutes', 325, y + 48);

        y += 80;

        // ── 24h Summary Stats ────────────────────────────────────────────────────
        doc.fillColor(DARK).fontSize(14).font('Helvetica-Bold').text('24-Hour Summary Statistics', 50, y);
        y += 20;
        drawLine(doc, y);
        y += 10;

        const statBoxes = [
            { label: 'Avg Heart Rate', value: stats.avgHR === 'N/A' ? 'N/A' : `${stats.avgHR} bpm` },
            { label: 'Avg Temperature', value: stats.avgTemp === 'N/A' ? 'N/A' : `${stats.avgTemp} °C` },
            { label: 'Instability Events', value: String(stats.instabilityEvents) },
            { label: 'Highest Anomaly Prob.', value: stats.highestProb },
        ];

        const boxW = 116;
        const boxGap = 8;
        statBoxes.forEach((box, i) => {
            const x = 50 + i * (boxW + boxGap);
            doc.roundedRect(x, y, boxW, 56, 6).fill(LIGHT_GREY);
            doc.font('Helvetica').fontSize(8).fillColor(MUTED).text(box.label, x + 8, y + 8, { width: boxW - 16 });
            doc.font('Helvetica-Bold').fontSize(16).fillColor(DARK).text(box.value, x + 8, y + 24, { width: boxW - 16 });
        });

        y += 76;

        // ── 24h Trend Charts ─────────────────────────────────────────────────────
        doc.fillColor(DARK).fontSize(14).font('Helvetica-Bold').text('24-Hour Trends', 50, y);
        y += 20;
        drawLine(doc, y);
        y += 12;

        if (vitals.length === 0) {
            doc.font('Helvetica').fontSize(10).fillColor(MUTED)
                .text('No vitals data available for chart generation.', 50, y + 8);
            y += 30;
        } else {
            doc.image(hrChartBuf, 50, y, { width: CHART_PT_W, height: CHART_PT_H });
            y += CHART_PT_H + 16;

            doc.image(tempChartBuf, 50, y, { width: CHART_PT_W, height: CHART_PT_H });
            y += CHART_PT_H + 16;
        }

        // ── Footer page 1 then start page 2 ─────────────────────────────────────
        drawLine(doc, 820, '#CBD5E1');
        doc.font('Helvetica').fontSize(8).fillColor(MUTED)
            .text('Confidential Medical Record — GlucoseGuard', 50, 826);
        doc.text(`Page ${pageNum++}`, 0, 826, { align: 'right', width: pageWidth - 50 });

        // ── Vitals History Table (new page) ──────────────────────────────────────
        doc.addPage();
        y = 50;

        doc.fillColor(DARK).fontSize(14).font('Helvetica-Bold').text('Vitals History (Last 24h)', 50, y);
        y += 20;
        drawLine(doc, y);
        y += 10;

        const cols = [
            { label: 'Timestamp', x: 50, w: 130 },
            { label: 'HR (bpm)', x: 185, w: 65 },
            { label: 'Temp (°C)', x: 255, w: 65 },
            { label: 'SpO2 (%)', x: 325, w: 65 },
            { label: 'HRV (ms)', x: 395, w: 65 },
            { label: 'ML Risk', x: 465, w: 80 },
        ];

        doc.rect(50, y, 495, 20).fill(BRAND_BLUE);
        cols.forEach(col => {
            doc.font('Helvetica-Bold').fontSize(9).fillColor('white')
                .text(col.label, col.x + 4, y + 5, { width: col.w - 8 });
        });
        y += 20;

        const displayRows = vitals.slice(-50).reverse(); // most recent first, max 50
        displayRows.forEach((row, idx) => {
            if (y > 760) {
                drawLine(doc, 820, '#CBD5E1');
                doc.font('Helvetica').fontSize(8).fillColor(MUTED)
                    .text('Confidential Medical Record — GlucoseGuard', 50, 826);
                doc.text(`Page ${pageNum++}`, 0, 826, { align: 'right', width: pageWidth - 50 });
                doc.addPage();
                y = 50;
            }

            const bg = idx % 2 === 0 ? 'white' : LIGHT_GREY;
            doc.rect(50, y, 495, 18).fill(bg);

            const ts = new Date(row.timestamp).toLocaleString(undefined, {
                month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit',
            });

            const hr = row.heart_rate ?? row.hr ?? '--';
            const temp = row.temperature ?? row.temp ?? '--';
            const spo2 = row.spo2 ?? '--';
            const hrv = row.hrv_rmssd ?? '--';
            const risk = row.instability_risk ?? 'stable';

            const cellValues = [ts, hr, temp, spo2, hrv, risk];
            cols.forEach((col, ci) => {
                const val = typeof cellValues[ci] === 'number'
                    ? cellValues[ci].toFixed(ci === 1 ? 0 : 1)
                    : String(cellValues[ci]);

                const cellColor = ci === 5 ? riskColor(risk) : DARK;
                doc.font(ci === 5 ? 'Helvetica-Bold' : 'Helvetica')
                    .fontSize(8)
                    .fillColor(cellColor)
                    .text(val, col.x + 4, y + 5, { width: col.w - 8, ellipsis: true });
            });
            y += 18;
        });

        if (displayRows.length === 0) {
            doc.font('Helvetica').fontSize(10).fillColor(MUTED)
                .text('No vitals recorded in the last 24 hours.', 50, y + 8);
        }

        // ── Footer last page ─────────────────────────────────────────────────────
        drawLine(doc, 820, '#CBD5E1');
        doc.font('Helvetica').fontSize(8).fillColor(MUTED)
            .text('Confidential Medical Record — GlucoseGuard', 50, 826);
        doc.text(`Page ${pageNum}`, 0, 826, { align: 'right', width: pageWidth - 50 });

        doc.end();
    });
};

module.exports = { generatePDFBuffer };
