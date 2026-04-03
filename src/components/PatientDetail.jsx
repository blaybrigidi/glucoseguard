import React, { useState, useEffect } from 'react';
import LiveVitalCard from './LiveVitalCard';
import VitalHistoryChart from './VitalHistoryChart';
import { api } from '../services/api';
import { generatePatientReport } from '../services/pdfService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, FileText, Activity, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from 'sonner';

const RiskStatusCard = ({ risk, instabilityProbability }) => {
    const getRiskConfig = (riskLevel) => {
        switch (riskLevel) {
            case 'stable': return { color: 'bg-green-500', label: 'Stable', icon: <CheckCircle className="h-6 w-6" />, textColor: 'text-white' };
            case 'warning': return { color: 'bg-yellow-500', label: 'Warning', icon: <AlertTriangle className="h-6 w-6" />, textColor: 'text-white' };
            case 'high_risk': return { color: 'bg-red-500', label: 'High Risk', icon: <AlertTriangle className="h-6 w-6" />, textColor: 'text-white' };
            default: return { color: 'bg-gray-400', label: 'Unknown', icon: <Activity className="h-6 w-6" />, textColor: 'text-white' };
        }
    };
    const config = getRiskConfig(risk);
    return (
        <Card className={`${config.color} border-none shadow-md`}>
            <CardContent className={`flex flex-col items-center justify-center p-6 ${config.textColor}`}>
                <div className="flex items-center gap-2 mb-2">
                    {config.icon}
                    <h3 className="text-xl font-bold">{config.label}</h3>
                </div>
                <p className="text-sm opacity-90 font-medium text-center">Glucose Instability Risk</p>
                <div className="mt-4 text-center">
                    <span className="text-3xl font-extrabold">{(instabilityProbability * 100).toFixed(1)}%</span>
                    <p className="text-xs opacity-75">Confidence Score</p>
                </div>
                <p className="text-xs mt-4 opacity-75">Prediction Horizon: 30 mins</p>
            </CardContent>
        </Card>
    );
};

const EMPTY_VITALS = {
    hr: { value: '--', unit: 'bpm', status: 'Unknown' },
    temp: { value: '--', unit: '°C', status: 'Unknown' },
    hrv: { value: '--', unit: 'ms', status: 'Unknown' }
};

const PatientDetail = ({ onNavigate, patientId }) => {
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pdfLoading, setPdfLoading] = useState(false);

    const getVitalStatus = (type, value) => {
        if (!value || value === '--') return 'Unknown';
        if (type === 'hr' && (value > 100 || value < 60)) return 'Abnormal';
        return 'Normal';
    };

    const handleDownloadPDF = async () => {
        if (!patient) return;
        setPdfLoading(true);
        try {
            await generatePatientReport(patient.id);
            toast.success('PDF report downloaded');
        } catch (err) {
            console.error("Failed to generate PDF:", err);
            toast.error(`Failed to generate report: ${err.message}`);
        } finally {
            setPdfLoading(false);
        }
    };

    useEffect(() => {
        if (!patientId) return;

        // Start subscription immediately so vitals show as fast as possible
        const unsubscribe = api.subscribeToVitals(patientId, (data) => {
            setPatient(prev => {
                const base = prev || {
                    name: 'Patient',
                    id: patientId,
                    status: 'Normal',
                    vitals: EMPTY_VITALS,
                    ml: { risk: 'stable', probability: 0 }
                };
                return {
                    ...base,
                    vitals: {
                        hr: {
                            value: data.hr ?? base.vitals.hr.value,
                            unit: 'bpm',
                            status: getVitalStatus('hr', data.hr ?? base.vitals.hr.value)
                        },
                        temp: {
                            value: data.temp ?? base.vitals.temp.value,
                            unit: '°C',
                            status: 'Normal'
                        },
                        hrv: {
                            value: data.hrv_rmssd ?? base.vitals.hrv.value,
                            unit: 'ms',
                            status: 'Normal'
                        }
                    },
                    ml: {
                        risk: data.instability_risk ?? base.ml.risk,
                        probability: data.instability_probability ?? base.ml.probability
                    }
                };
            });
            setLoading(false);
        });

        // Fetch patient profile separately — never overwrites vitals
        const fetchInitialData = async () => {
            try {
                const data = await api.getPatient(patientId);
                setPatient(prev => ({
                    vitals: EMPTY_VITALS,
                    ml: { risk: 'stable', probability: 0.0 },
                    ...prev,
                    name: data.name || 'Unknown',
                    id: data.id,
                    status: data.status || 'Normal',
                }));
                setLoading(false);
            } catch (err) {
                console.error("Error fetching patient profile:", err);
                setPatient(prev => prev || {
                    name: 'Unknown',
                    id: patientId,
                    status: 'Normal',
                    vitals: EMPTY_VITALS,
                    ml: { risk: 'stable', probability: 0.0 }
                });
                setLoading(false);
            }
        };

        fetchInitialData();

        return () => {
            if (unsubscribe) unsubscribe();
        };

    }, [patientId]);

    if (loading) {
        return (
            <div className="p-8 min-h-screen max-w-[1400px]">
                <div className="flex flex-col gap-4 mb-10">
                    <Skeleton className="h-6 w-32" />
                    <div className="flex items-baseline gap-4">
                        <Skeleton className="h-10 w-64" />
                        <Skeleton className="h-6 w-24" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Skeleton className="h-40 rounded-xl" />
                    <Skeleton className="h-40 rounded-xl" />
                    <Skeleton className="h-40 rounded-xl" />
                </div>
                <Skeleton className="h-[500px] rounded-xl" />
            </div>
        );
    }

    if (!patient) {
        return <div className="p-10 text-destructive font-medium">Patient not found</div>;
    }

    return (
        <main className="p-8 min-h-screen max-w-[1400px]">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div className="flex flex-col gap-2">
                    <Button
                        variant="ghost"
                        className="text-muted-foreground hover:text-foreground p-0 h-auto font-medium"
                        onClick={() => onNavigate('dashboard')}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Button>
                    <div className="flex items-baseline gap-4 mt-2">
                        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">{patient.name}</h1>
                        <span className="text-lg text-muted-foreground font-medium">ID: {patient.id}</span>
                        {patient.status === 'Critical' && (
                            <Badge variant="destructive" className="text-sm px-3 py-1">CRITICAL</Badge>
                        )}
                    </div>
                </div>
                <Button className="rounded-full shadow-lg" size="lg" onClick={handleDownloadPDF} disabled={pdfLoading}>
                    {pdfLoading
                        ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        : <FileText className="mr-2 h-4 w-4" />}
                    {pdfLoading ? 'Generating...' : 'Generate PDF Report'}
                </Button>
            </header>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <LiveVitalCard
                    label="Heart Rate"
                    value={patient.vitals.hr.value}
                    unit={patient.vitals.hr.unit}
                    status={patient.vitals.hr.status}
                />
                <LiveVitalCard
                    label="Body Temp"
                    value={patient.vitals.temp.value}
                    unit={patient.vitals.temp.unit}
                    status={patient.vitals.temp.status}
                />
                <RiskStatusCard
                    risk={patient.ml.risk}
                    instabilityProbability={patient.ml.probability}
                />
            </section>

            <section className="h-[500px]">
                <VitalHistoryChart patientId={patient.id} />
            </section>
        </main>
    );
};

export default PatientDetail;