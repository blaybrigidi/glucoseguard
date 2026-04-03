import React, { useState, useEffect } from 'react';
import SummaryCard from './SummaryCard';
import AlertsDropdown from './AlertsDropdown';
import PatientList from './PatientList';
import RecentActivity from './RecentActivity';
import AssignPatientModal from './AssignPatientModal';
import { api } from '../services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const Dashboard = ({ onNavigate }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [dashboardStats, setDashboardStats] = useState({
        criticalAlerts: 0,
        warnings: 0,
        activePatients: 0,
        pendingReports: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await api.getDashboardStats();
                setDashboardStats(data);
            } catch (error) {
                console.error("Failed to load dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 5000);

        return () => clearInterval(interval);
    }, []);

    const statsCards = [
        {
            title: 'Critical Alerts',
            value: dashboardStats.criticalAlerts,
            icon: 'Activity',
            type: 'critical',
            subtext: 'Requires immediate attention',
            action: () => onNavigate('alerts', null, { filter: 'critical' })
        },
        {
            title: 'Warnings',
            value: dashboardStats.warnings,
            icon: 'AlertTriangle',
            type: 'warning',
            subtext: 'Monitor closely',
            action: () => onNavigate('alerts', null, { filter: 'warning' })
        },
        {
            title: 'Active Patients',
            value: dashboardStats.activePatients,
            icon: 'Users',
            type: 'info',
            subtext: 'Currently monitored',
            action: () => { setSearchQuery(''); setStatusFilter('All'); }
        },
        {
            title: 'Reports Pending',
            value: dashboardStats.pendingReports,
            icon: 'FileText',
            type: 'info',
            subtext: 'To be reviewed',
            action: null
        },
    ];

    return (
        <main className="p-8 min-h-screen max-w-[1600px]">
            <header className="mb-12 flex justify-between items-baseline">
                <h1 className="text-5xl font-extrabold tracking-tight leading-none text-foreground">
                    Patient Overview
                </h1>
                <div className="flex gap-4 items-center">
                    <AlertsDropdown />
                    <Button
                        className="rounded-full px-8 py-6 text-md font-medium shadow-lg hover:shadow-xl transition-all"
                        onClick={() => setShowAssignModal(true)}
                    >
                        + New Patient
                    </Button>
                </div>
            </header>

            {/* Summary Cards */}
            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
                {statsCards.map((stat, index) => (
                    <div key={index} className="transition-transform hover:-translate-y-1">
                        <SummaryCard
                            title={stat.title}
                            value={stat.value}
                            subtext={stat.subtext}
                            type={stat.type}
                            icon={stat.icon}
                            onClick={stat.action}
                            isActive={false}
                        />
                    </div>
                ))}
            </section>

            {/* Content Area: Patient List + Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                <div className="lg:col-span-3 flex flex-col gap-6">

                    {/* Search and Filter Bar */}
                    <div className="flex justify-between items-center pb-2">
                        <div className="relative w-[300px]">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search patients..."
                                className="pl-9 h-11 bg-background"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <select
                            className="px-4 py-2.5 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="All">All Statuses</option>
                            <option value="Critical">Critical Only</option>
                            <option value="Warning">Warning Only</option>
                            <option value="Normal">Normal Only</option>
                        </select>
                    </div>

                    <PatientList
                        onNavigate={onNavigate}
                        searchQuery={searchQuery}
                        statusFilter={statusFilter}
                    />
                </div>

                <div className="lg:col-span-1 flex flex-col">
                    <RecentActivity onNavigate={onNavigate} />
                </div>
            </div>

            {showAssignModal && (
                <AssignPatientModal
                    onClose={() => setShowAssignModal(false)}
                    onAssigned={() => setShowAssignModal(false)}
                />
            )}
        </main>
    );
};

export default Dashboard;
