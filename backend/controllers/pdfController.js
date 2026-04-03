const { generatePDFBuffer } = require('../services/pdfService');

const downloadPatientReport = async (req, res, next) => {
    try {
        const { patientId } = req.params;
        const buffer = await generatePDFBuffer(patientId);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="report-${patientId}.pdf"`
        );
        res.setHeader('Content-Length', buffer.length);
        res.send(buffer);
    } catch (err) {
        console.error('[PDF] Error generating report:', err);
        if (err.message && err.message.startsWith('Patient ')) {
            return res.status(404).json({ message: err.message });
        }
        res.status(500).json({ message: err.message });
    }
};

module.exports = { downloadPatientReport };
