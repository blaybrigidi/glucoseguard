import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Clock } from 'lucide-react';
import { api } from '../services/api';

const EMPTY_FORM = { email: '', dateOfBirth: '' };

const AssignPatientModal = ({ onClose, onAssigned }) => {
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
        if (!form.email.trim()) next.email = 'Email is required.';
        if (!form.dateOfBirth) next.dateOfBirth = 'Date of birth is required.';
        return next;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const fieldErrors = validate();
        if (Object.keys(fieldErrors).length > 0) { setErrors(fieldErrors); return; }

        try {
            setLoading(true);
            setServerError('');
            const patient = await api.createPatient({ email: form.email.trim().toLowerCase(), dateOfBirth: form.dateOfBirth });
            onAssigned(patient);
            onClose();
        } catch (err) {
            setServerError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
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
                maxWidth: 440,
                padding: '32px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                    <div>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Add patient</h2>
                        <p style={{ fontSize: '0.83rem', color: '#757575', marginTop: 4 }}>
                            The patient must already have a GlucoseGuard account.
                        </p>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9E9E9E', padding: 4 }}>
                        <X size={20} />
                    </button>
                </div>

                <div style={{
                    display: 'flex', gap: 8, alignItems: 'flex-start',
                    padding: '10px 14px', borderRadius: 8,
                    backgroundColor: '#FEF9EC', border: '1px solid #FDE68A',
                    color: '#92400E', fontSize: '0.8rem', marginBottom: 20,
                }}>
                    <Clock size={13} style={{ marginTop: 2, flexShrink: 0 }} />
                    <span>The patient will receive a confirmation request on their mobile app before you gain access to their data.</span>
                </div>

                {serverError && (
                    <div style={{
                        padding: '10px 14px', borderRadius: 8,
                        backgroundColor: '#FEF2F2', border: '1px solid #FECACA',
                        color: '#DC2626', fontSize: '0.83rem', marginBottom: 16,
                    }}>
                        {serverError}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4, color: '#374151' }}>
                            Patient email *
                        </label>
                        <Input
                            name="email"
                            type="email"
                            placeholder="patient@example.com"
                            value={form.email}
                            onChange={handleChange}
                            style={{ borderColor: errors.email ? '#EF4444' : undefined }}
                        />
                        {errors.email && <p style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: 3 }}>{errors.email}</p>}
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4, color: '#374151' }}>
                            Date of birth *
                        </label>
                        <Input
                            name="dateOfBirth"
                            type="date"
                            value={form.dateOfBirth}
                            onChange={handleChange}
                            style={{ borderColor: errors.dateOfBirth ? '#EF4444' : undefined }}
                        />
                        {errors.dateOfBirth && <p style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: 3 }}>{errors.dateOfBirth}</p>}
                    </div>

                    <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                        <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1" style={{ backgroundColor: '#1565C0', color: '#fff' }} disabled={loading}>
                            {loading ? 'Sending...' : 'Send request'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AssignPatientModal;
