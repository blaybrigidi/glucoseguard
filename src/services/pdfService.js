import { auth } from '../config/firebase';

export const generatePatientReport = async (patientId) => {
    const user = auth.currentUser;
    const headers = {};
    if (user) {
        const token = await user.getIdToken();
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`/api/pdf/${patientId}`, { headers });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to generate PDF report');
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `GlucoseGuard_Report_${patientId}_${Date.now()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
