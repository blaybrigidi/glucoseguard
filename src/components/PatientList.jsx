import React, { useState, useEffect, useMemo, useRef } from 'react';
import { api } from '../services/api';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock } from 'lucide-react';

const PatientList = ({ onNavigate, searchQuery = '', statusFilter = 'All', activeTab = 'accepted' }) => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const { currentUser } = useAuth();
    const prevStatusMap = useRef({});

    useEffect(() => {
        if (!currentUser?.uid) return;

        const q = query(
            collection(db, 'users'),
            where('role', '==', 'patient'),
            where('assignedDoctor', '==', currentUser.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const mapped = [];

            snapshot.forEach(doc => {
                const p = doc.data();
                const status = p.assignmentStatus || 'accepted';
                const prev = prevStatusMap.current[doc.id];

                // Fire toast the moment a patient flips from pending → accepted
                if (prev === 'pending' && status === 'accepted') {
                    const name = p.displayName || p.name || 'A patient';
                    toast.success(`${name} accepted your request`, {
                        description: 'They have been moved to your active patients list.',
                        duration: 6000,
                    });
                }

                prevStatusMap.current[doc.id] = status;

                if (!['pending', 'accepted'].includes(status)) return;

                mapped.push({
                    id: doc.id,
                    name: p.displayName || p.name || 'Unknown',
                    hr: p.lastVitalsConfig?.heartRate || '--',
                    hrTrend: { dir: 'stable', val: 0 },
                    temp: '--',
                    status: p.status || 'Normal',
                    assignmentStatus: status,
                    lastUpdate: p.updatedAt ? new Date(p.updatedAt).getTime() : Date.now(),
                    avatar: (p.displayName || p.name || '??').split(' ').map(n => n[0]).join('').toUpperCase(),
                });
            });

            setPatients(mapped);
            setLoading(false);
        }, (error) => {
            console.error("Error listening to patients:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser?.uid]);

    const { acceptedPatients, pendingPatients } = useMemo(() => {
        const accepted = [];
        const pending = [];

        patients.forEach(p => {
            if (p.assignmentStatus === 'pending') {
                pending.push(p);
            } else {
                accepted.push(p);
            }
        });

        return { acceptedPatients: accepted, pendingPatients: pending };
    }, [patients]);

    const filteredAccepted = useMemo(() => {
        let result = [...acceptedPatients];

        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(p => p.name.toLowerCase().includes(lowerQuery));
        }
        if (statusFilter !== 'All') {
            result = result.filter(p => p.status === statusFilter);
        }

        const statusPriority = { 'Critical': 0, 'Warning': 1, 'Normal': 2 };
        result.sort((a, b) => (statusPriority[a.status] ?? 2) - (statusPriority[b.status] ?? 2));

        return result;
    }, [acceptedPatients, searchQuery, statusFilter]);

    const filteredPending = useMemo(() => {
        if (!searchQuery) return pendingPatients;
        const lowerQuery = searchQuery.toLowerCase();
        return pendingPatients.filter(p => p.name.toLowerCase().includes(lowerQuery));
    }, [pendingPatients, searchQuery]);

    if (loading) {
        return <PatientListSkeleton />;
    }

    if (activeTab === 'pending') {
        return (
            <div className="w-full rounded-xl border border-border bg-card shadow-sm overflow-hidden mt-4">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="w-[40%]">PATIENT NAME</TableHead>
                            <TableHead>STATUS</TableHead>
                            <TableHead>REQUESTED</TableHead>
                            <TableHead>ASSIGNMENT</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPending.map((patient) => (
                            <PendingPatientRow key={patient.id} patient={patient} />
                        ))}
                    </TableBody>
                </Table>
                {filteredPending.length === 0 && (
                    <div className="p-12 text-center text-muted-foreground">
                        No pending assignment requests.
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="w-full rounded-xl border border-border bg-card shadow-sm overflow-hidden mt-4">
            <Table>
                <TableHeader className="bg-muted/50">
                    <TableRow>
                        <TableHead className="w-[30%]">PATIENT NAME</TableHead>
                        <TableHead>HEART RATE</TableHead>
                        <TableHead>TEMP</TableHead>
                        <TableHead>STATUS</TableHead>
                        <TableHead>LAST UPDATE</TableHead>
                        <TableHead>ACTIONS</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredAccepted.map((patient) => (
                        <PatientRow
                            key={patient.id}
                            initialData={patient}
                            onNavigate={onNavigate}
                        />
                    ))}
                </TableBody>
            </Table>
            {filteredAccepted.length === 0 && (
                <div className="p-12 text-center text-muted-foreground">
                    No patients found matching your search.
                </div>
            )}
        </div>
    );
};

const PendingPatientRow = ({ patient }) => {
    return (
        <TableRow className="border-b border-l-4 border-l-yellow-400 bg-yellow-50/30">
            <TableCell>
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground text-xs">
                        {patient.avatar}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-foreground">{patient.name}</span>
                        <span className="text-xs text-muted-foreground">ID: {1000 + String(patient.id)}</span>
                    </div>
                </div>
            </TableCell>
            <TableCell>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                    Unavailable
                </span>
            </TableCell>
            <TableCell>
                <span className="text-xs text-muted-foreground">
                    {patient.lastUpdate ? new Date(patient.lastUpdate).toLocaleDateString() : '—'}
                </span>
            </TableCell>
            <TableCell>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200">
                    <Clock size={11} />
                    Awaiting patient confirmation
                </span>
            </TableCell>
        </TableRow>
    );
};

const PatientRow = ({ initialData, onNavigate }) => {
    const [data, setData] = useState(initialData);

    useEffect(() => {
        const unsubscribe = api.subscribeToVitals(initialData.id, (reading) => {
            if (!reading) return;

            let newStatus = 'Normal';
            if (reading.instability_risk === 'warning') newStatus = 'Warning';
            if (reading.instability_risk === 'high_risk') newStatus = 'Critical';

            setData(prev => ({
                ...prev,
                hr: reading.hr || prev.hr,
                temp: reading.temp || prev.temp,
                status: newStatus,
                lastUpdate: new Date(reading.timestamp).getTime()
            }));
        });

        return () => unsubscribe();
    }, [initialData.id]);

    const freshness = getFreshnessStatus(data.lastUpdate);
    const isCritical = data.status === 'Critical';

    return (
        <TableRow
            className={`
                border-b transition-colors hover:bg-muted/50 cursor-pointer
                ${isCritical ? 'bg-red-50/50 hover:bg-red-50/80 border-l-4 border-l-red-500' : 'border-l-4 border-l-transparent'}
            `}
            onClick={() => onNavigate('patient-detail', data.id)}
        >
            <TableCell>
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground text-xs">
                        {data.avatar}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-foreground">{data.name}</span>
                        <span className="text-xs text-muted-foreground">ID: {1000 + String(data.id)}</span>
                    </div>
                </div>
            </TableCell>
            <TableCell>
                <div className="font-medium text-foreground">{data.hr} bpm</div>
            </TableCell>
            <TableCell>
                <span className="font-medium">{data.temp}°C</span>
            </TableCell>
            <TableCell>
                <StatusBadge status={data.status} />
            </TableCell>
            <TableCell>
                {freshness.isOffline ? (
                    <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                        OFFLINE
                    </span>
                ) : (
                    <div className="flex items-center gap-2">
                        <div className={`h-1.5 w-1.5 rounded-full ${freshness.dot}`} />
                        <span className={`text-xs ${freshness.color}`}>{freshness.text}</span>
                    </div>
                )}
            </TableCell>
            <TableCell>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => { e.stopPropagation(); onNavigate('patient-detail', data.id); }}
                >
                    Details
                </Button>
            </TableCell>
        </TableRow>
    );
};

const getFreshnessStatus = (timestamp) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 2) return { text: 'Just now', color: 'text-green-600', dot: 'bg-green-600' };
    if (minutes < 60) return { text: `${minutes} min ago`, color: 'text-yellow-600', dot: 'bg-yellow-600' };
    return { text: 'Offline', color: 'text-red-500', isOffline: true };
};

const StatusBadge = ({ status }) => {
    let classes = "bg-green-100 text-green-700 hover:bg-green-100/80";
    if (status === 'Warning') classes = "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80";
    if (status === 'Critical') classes = "bg-red-100 text-red-700 border border-red-200 hover:bg-red-100/80";

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold transition-colors ${classes}`}>
            {status === 'Critical' && <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-red-600" />}
            {status}
        </span>
    );
};

const PatientListSkeleton = () => (
    <div className="w-full rounded-xl border border-border bg-card shadow-sm overflow-hidden mt-4">
        <Table>
            <TableHeader className="bg-muted/50">
                <TableRow>
                    <TableHead className="w-[30%]">PATIENT NAME</TableHead>
                    <TableHead>HEART RATE</TableHead>
                    <TableHead>TEMP</TableHead>
                    <TableHead>STATUS</TableHead>
                    <TableHead>LAST UPDATE</TableHead>
                    <TableHead>ACTIONS</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {[...Array(5)].map((_, i) => (
                    <TableRow key={i} className="border-b">
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-9 w-9 rounded-full" />
                                <div className="flex flex-col gap-1">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-20" />
                                </div>
                            </div>
                        </TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-16" /></TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </div>
);

export default PatientList;
