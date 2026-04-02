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
        if (err.message && err.message.startsWith('Patient ')) {
            return res.status(404).json({ message: err.message });
        }
        next(err);
    }
};

module.exports = { downloadPatientReport };
