'use client';

import React, { useState } from 'react';
import { Button } from './button';
import { AtSign, ChevronLeft, User, Phone, Lock, Heart, Activity, Shield, Bell } from 'lucide-react';
import { Input } from './input';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const highlights = [
    { icon: Activity, text: 'Live vitals from IoT wearables' },
    { icon: Shield, text: 'AI-powered anomaly detection' },
    { icon: Bell,   text: 'Instant critical alerts' },
    { icon: Heart,  text: 'Built for clinical teams' },
];

function LeftPanel() {
    return (
        <div style={{
            background: 'linear-gradient(160deg, #1565C0 0%, #0D47A1 60%, #1a237e 100%)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            padding: '48px 44px',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Grid overlay */}
            <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)',
                backgroundSize: '36px 36px',
            }} />

            {/* Logo */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    border: '1px solid rgba(255,255,255,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Heart size={18} color="#fff" />
                </div>
                <span style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.01em' }}>
                    GlucoseGuard
                </span>
            </div>

            {/* Central visual — pulse monitor mockup */}
            <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                    backgroundColor: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: 20,
                    padding: '28px 32px',
                    width: '100%',
                    maxWidth: 340,
                }}>
                    {/* Fake patient card header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: '50%',
                            backgroundColor: 'rgba(255,255,255,0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <User size={18} color="rgba(255,255,255,0.8)" />
                        </div>
                        <div>
                            <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.88rem' }}>Patient Monitor</div>
                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>Live — Ward B</div>
                        </div>
                        <div style={{
                            marginLeft: 'auto',
                            width: 8, height: 8, borderRadius: '50%',
                            backgroundColor: '#4CAF50',
                            boxShadow: '0 0 0 3px rgba(76,175,80,0.25)',
                        }} />
                    </div>

                    {/* Fake vitals */}
                    {[
                        { label: 'Heart Rate', value: '74 bpm', color: '#F48FB1' },
                        { label: 'SpO₂',       value: '98%',    color: '#90CAF9' },
                        { label: 'Temperature', value: '36.8°C', color: '#A5D6A7' },
                    ].map(({ label, value, color }) => (
                        <div key={label} style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '10px 0',
                            borderBottom: '1px solid rgba(255,255,255,0.08)',
                        }}>
                            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>{label}</span>
                            <span style={{ color, fontWeight: 700, fontSize: '0.88rem', fontVariantNumeric: 'tabular-nums' }}>{value}</span>
                        </div>
                    ))}

                    {/* Fake pulse line */}
                    <div style={{ marginTop: 20, position: 'relative', height: 40 }}>
                        <svg viewBox="0 0 300 40" width="100%" height="40" preserveAspectRatio="none">
                            <polyline
                                points="0,20 40,20 55,5 65,35 75,20 120,20 135,8 145,32 155,20 200,20 215,6 225,34 235,20 300,20"
                                fill="none"
                                stroke="rgba(144,202,249,0.7)"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Feature highlights */}
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {highlights.map(({ icon: Icon, text }) => (
                    <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: 8,
                            backgroundColor: 'rgba(255,255,255,0.12)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                        }}>
                            <Icon size={15} color="rgba(255,255,255,0.85)" />
                        </div>
                        <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', fontWeight: 500 }}>{text}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function fieldError(errors: Record<string, string>, field: string) {
    if (!errors[field]) return null;
    return (
        <p style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: 4, marginLeft: 2 }}>
            {errors[field]}
        </p>
    );
}

export function RegisterPage() {
    const [formData, setFormData] = useState({
        displayName: '',
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear field error on change
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const formatPhoneNumber = (phone: string) => {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 11 && cleaned.startsWith('1')) return `+${cleaned}`;
        if (cleaned.length === 10) return `+1${cleaned}`;
        if (phone.startsWith('+')) return phone;
        return `+${cleaned}`;
    };

    const validate = () => {
        const next: Record<string, string> = {};
        if (!formData.displayName.trim()) next.displayName = 'Full name is required.';
        if (!formData.email.trim()) next.email = 'Email address is required.';
        const digits = formData.phoneNumber.replace(/\D/g, '');
        if (!formData.phoneNumber.trim()) {
            next.phoneNumber = 'Phone number is required.';
        } else if (digits.length < 10) {
            next.phoneNumber = 'Phone number must be at least 10 digits (e.g. 0244000000 or +233244000000).';
        }
        if (!formData.password) next.password = 'Password is required.';
        else if (formData.password.length < 6) next.password = 'Password must be at least 6 characters.';
        if (formData.password !== formData.confirmPassword) next.confirmPassword = 'Passwords do not match.';
        return next;
    };

    const parseBackendError = (message: string): Record<string, string> => {
        const lower = message.toLowerCase();
        if (lower.includes('phone') || lower.includes('too short') || lower.includes('e.164')) {
            return { phoneNumber: 'Invalid phone number. Use international format, e.g. +233244000000.' };
        }
        if (lower.includes('email already') || lower.includes('email-already')) {
            return { email: 'An account with this email already exists.' };
        }
        if (lower.includes('weak-password') || lower.includes('password')) {
            return { password: message };
        }
        return { form: message };
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            setLoading(true);
            setErrors({});
            const formattedPhone = formatPhoneNumber(formData.phoneNumber);
            await register(formData.email, formData.password, formData.displayName, formattedPhone);
            navigate('/app');
        } catch (error: any) {
            setErrors(parseBackendError(error.message || 'Registration failed. Please try again.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <main style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '100vh' }}>
            {/* Left panel — hidden on small screens */}
            <div style={{ display: 'flex' }} className="hidden lg:flex">
                <div style={{ width: '100%' }}>
                    <LeftPanel />
                </div>
            </div>

            {/* Right panel — form */}
            <div style={{
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
                padding: '48px 48px',
                backgroundColor: '#F5F5F5',
                overflowY: 'auto',
            }}>
                <Button variant="ghost" style={{ alignSelf: 'flex-start', marginBottom: 24, marginLeft: -8 }} asChild>
                    <Link to="/">
                        <ChevronLeft className="size-4 me-2" />
                        Back to Home
                    </Link>
                </Button>

                <div style={{ maxWidth: 400, width: '100%', margin: '0 auto' }}>
                    {/* Mobile logo */}
                    <div className="flex items-center gap-2 lg:hidden mb-6">
                        <Heart size={20} color="#1565C0" />
                        <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>GlucoseGuard</span>
                    </div>

                    <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: 6 }}>
                        Create an account
                    </h1>
                    <p style={{ color: '#757575', fontSize: '0.9rem', marginBottom: 28 }}>
                        Join the GlucoseGuard clinical portal
                    </p>

                    {errors.form && (
                        <div style={{
                            padding: '12px 16px', borderRadius: 8,
                            backgroundColor: '#FEF2F2', border: '1px solid #FECACA',
                            color: '#DC2626', fontSize: '0.85rem', marginBottom: 20,
                        }}>
                            {errors.form}
                        </div>
                    )}

                    <form style={{ display: 'flex', flexDirection: 'column', gap: 16 }} onSubmit={handleRegister}>
                        {/* Full Name */}
                        <div>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', inset: '0 auto 0 12px', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                                    <User size={16} color="#9CA3AF" />
                                </div>
                                <Input
                                    placeholder="Full name"
                                    className="ps-9"
                                    style={{ borderColor: errors.displayName ? '#EF4444' : undefined }}
                                    type="text"
                                    name="displayName"
                                    value={formData.displayName}
                                    onChange={handleChange}
                                />
                            </div>
                            {fieldError(errors, 'displayName')}
                        </div>

                        {/* Email */}
                        <div>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', inset: '0 auto 0 12px', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                                    <AtSign size={16} color="#9CA3AF" />
                                </div>
                                <Input
                                    placeholder="Email address"
                                    className="ps-9"
                                    style={{ borderColor: errors.email ? '#EF4444' : undefined }}
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                            {fieldError(errors, 'email')}
                        </div>

                        {/* Phone */}
                        <div>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', inset: '0 auto 0 12px', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                                    <Phone size={16} color="#9CA3AF" />
                                </div>
                                <Input
                                    placeholder="Phone number (e.g. +233244000000)"
                                    className="ps-9"
                                    style={{ borderColor: errors.phoneNumber ? '#EF4444' : undefined }}
                                    type="tel"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                />
                            </div>
                            {fieldError(errors, 'phoneNumber')}
                        </div>

                        {/* Password */}
                        <div>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', inset: '0 auto 0 12px', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                                    <Lock size={16} color="#9CA3AF" />
                                </div>
                                <Input
                                    placeholder="Password (min. 6 characters)"
                                    className="ps-9"
                                    style={{ borderColor: errors.password ? '#EF4444' : undefined }}
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                            {fieldError(errors, 'password')}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', inset: '0 auto 0 12px', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                                    <Lock size={16} color="#9CA3AF" />
                                </div>
                                <Input
                                    placeholder="Confirm password"
                                    className="ps-9"
                                    style={{ borderColor: errors.confirmPassword ? '#EF4444' : undefined }}
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                />
                            </div>
                            {fieldError(errors, 'confirmPassword')}
                        </div>

                        <Button
                            type="submit"
                            style={{ backgroundColor: '#1565C0', color: '#fff', marginTop: 4 }}
                            className="w-full hover:bg-blue-800"
                            disabled={loading}
                        >
                            {loading ? 'Creating account...' : 'Create account'}
                        </Button>
                    </form>

                    <p style={{ color: '#757575', fontSize: '0.85rem', marginTop: 24, textAlign: 'center' }}>
                        Already have an account?{' '}
                        <Link to="/login" style={{ color: '#1565C0', fontWeight: 600, textDecoration: 'none' }}>
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    );
}
