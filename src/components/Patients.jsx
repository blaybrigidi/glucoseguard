import React, { useState } from 'react';
import PatientList from './PatientList';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const Patients = ({ onNavigate }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

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
                <div className="flex gap-4 items-center">
                    <Button
                        className="rounded-full px-6 py-2"
                        onClick={() => {/* no-op for demo */ }}
                    >
                        + Add Patient
                    </Button>
                </div>
            </header>

            <div className="space-y-6">
                {/* Search and Filter Bar */}
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

                {/* Patient List Table */}
                <PatientList
                    onNavigate={onNavigate}
                    searchQuery={searchQuery}
                    statusFilter={statusFilter}
                />
            </div>
        </main>
    );
};

export default Patients;
