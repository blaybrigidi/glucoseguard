import React, { useState } from 'react';
import PatientList from './PatientList';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { api } from '../services/api';

// ── Add Patient Modal ──────────────────────────────────────────────────────────

const EMPTY_FORM = {
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    condition: '',
    phoneNumber: '',
};

function AddPatientModal({ onClose, onCreated }) {
    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const next = {};
        if (!form.firstName.trim()) next.firstName = 'First name is required.';
        if (!form.lastName.trim()) next.lastName = 'Last name is required.';
        return next;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const fieldErrors = validate();
        if (Object.keys(fieldErrors).length > 0) { setErrors(fieldErrors); return; }

        try {
            setLoading(true);
            setServerError('');
            const patient = await api.createPatient(form);
            onCreated(patient);
            onClose();
        } catch (err) {
            setServerError(err.message || 'Failed to create patient. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 100,
            backgroundColor: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
        }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div style={{
                backgroundColor: '#fff',
                borderRadius: 16,
                width: '100%',
                maxWidth: 480,
                padding: '32px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.01em', margin: 0 }}>Add patient</h2>
                        <p style={{ fontSize: '0.85rem', color: '#757575', marginTop: 4 }}>The patient will be assigned to your account.</p>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9E9E9E', padding: 4 }}>
                        <X size={20} />
                    </button>
                </div>

                {serverError && (
                    <div style={{ padding: '10px 14px', borderRadius: 8, backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', fontSize: '0.83rem', marginBottom: 16 }}>
                        {serverError}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4, color: '#374151' }}>First name *</label>
                            <Input name="firstName" value={form.firstName} onChange={handleChange}
                                style={{ borderColor: errors.firstName ? '#EF4444' : undefined }} />
                            {errors.firstName && <p style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: 3 }}>{errors.firstName}</p>}
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4, color: '#374151' }}>Last name *</label>
                            <Input name="lastName" value={form.lastName} onChange={handleChange}
                                style={{ borderColor: errors.lastName ? '#EF4444' : undefined }} />
                            {errors.lastName && <p style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: 3 }}>{errors.lastName}</p>}
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4, color: '#374151' }}>Date of birth</label>
                        <Input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4, color: '#374151' }}>Condition / diagnosis</label>
                        <Input name="condition" placeholder="e.g. Type 2 Diabetes" value={form.condition} onChange={handleChange} />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4, color: '#374151' }}>Phone number</label>
                        <Input type="tel" name="phoneNumber" placeholder="+233244000000" value={form.phoneNumber} onChange={handleChange} />
                    </div>

                    <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                        <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1" style={{ backgroundColor: '#1565C0', color: '#fff' }} disabled={loading}>
                            {loading ? 'Adding...' : 'Add patient'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Patients Page ──────────────────────────────────────────────────────────────

const Patients = ({ onNavigate }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [showModal, setShowModal] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const handlePatientCreated = () => {
        setRefreshKey(k => k + 1);
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

                <PatientList
                    key={refreshKey}
                    onNavigate={onNavigate}
                    searchQuery={searchQuery}
                    statusFilter={statusFilter}
                />
            </div>

            {showModal && (
                <AddPatientModal
                    onClose={() => setShowModal(false)}
                    onCreated={handlePatientCreated}
                />
            )}
        </main>
    );
};

export default Patients;
