import React, { useState, useEffect } from 'react';
import PatientList from './PatientList';
import AssignPatientModal from './AssignPatientModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { api } from '../services/api';

// ── Patients Page ──────────────────────────────────────────────────────────────

const Patients = ({ onNavigate }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [showModal, setShowModal] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [activeTab, setActiveTab] = useState('accepted');
    const [pendingCount, setPendingCount] = useState(0);

    // Fetch pending count for the tab badge
    useEffect(() => {
        const loadCount = async () => {
            try {
                const patients = await api.getPatients();
                const count = patients.filter(p => p.assignmentStatus === 'pending').length;
                setPendingCount(count);
            } catch (_) {}
        };
        loadCount();
        const interval = setInterval(loadCount, 10000);
        return () => clearInterval(interval);
    }, [refreshKey]);

    const handlePatientCreated = () => {
        setRefreshKey(k => k + 1);
        setActiveTab('pending');
    };

    return (
        <main className="p-8 min-h-screen max-w-[1600px]">
            <header className="mb-8 flex justify-between items-baseline">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight leading-none text-foreground mb-2">
                        Patients
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Manage and monitor all registered patients.
                    </p>
                </div>
                <Button className="rounded-full px-6 py-2" onClick={() => setShowModal(true)}>
                    + Add Patient
                </Button>
            </header>

            <div className="space-y-6">
                {/* Tabs */}
                <div className="flex gap-1 border-b border-border">
                    <button
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'accepted'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                        onClick={() => setActiveTab('accepted')}
                    >
                        Active Patients
                    </button>
                    <button
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                            activeTab === 'pending'
                                ? 'border-yellow-500 text-yellow-700'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                        onClick={() => setActiveTab('pending')}
                    >
                        Pending
                        {pendingCount > 0 && (
                            <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-200">
                                {pendingCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* Filters — only show for active tab */}
                {activeTab === 'accepted' && (
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-card p-4 rounded-lg border shadow-sm">
                        <div className="relative w-full sm:w-[400px]">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search by name..."
                                className="pl-9 h-10 bg-background"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Filter status:</span>
                            <select
                                className="px-3 py-2 rounded-md border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="All">All Statuses</option>
                                <option value="Critical">Critical</option>
                                <option value="Warning">Warning</option>
                                <option value="Normal">Normal</option>
                            </select>
                        </div>
                    </div>
                )}

                {activeTab === 'pending' && (
                    <div className="flex flex-col sm:flex-row items-center gap-4 bg-card p-4 rounded-lg border shadow-sm">
                        <div className="relative w-full sm:w-[400px]">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search by name..."
                                className="pl-9 h-10 bg-background"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            These patients have been sent a request. Their vitals and alerts will be available once they accept.
                        </p>
                    </div>
                )}

                <PatientList
                    key={refreshKey}
                    onNavigate={onNavigate}
                    searchQuery={searchQuery}
                    statusFilter={statusFilter}
                    activeTab={activeTab}
                />
            </div>

            {showModal && (
                <AssignPatientModal
                    onClose={() => setShowModal(false)}
                    onAssigned={handlePatientCreated}
                />
            )}
        </main>
    );
};

export default Patients;
