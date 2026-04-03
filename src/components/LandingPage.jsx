import { Link } from 'react-router-dom';
import {
    Activity,
    Shield,
    Bell,
    BarChart3,
    Users,
    Zap,
    ArrowRight,
    Heart,
    Cpu,
} from 'lucide-react';

const features = [
    {
        icon: Activity,
        title: 'Real-Time Vitals',
        desc: 'Continuous monitoring of heart rate, SpO₂, temperature, and HRV with live sensor data.',
    },
    {
        icon: Shield,
        title: 'AI Anomaly Detection',
        desc: 'XGBoost and LSTM models flag instability before it becomes critical — automatically.',
    },
    {
        icon: Bell,
        title: 'Instant Alerts',
        desc: 'Threshold-based alerts reach the right clinicians the moment a patient needs attention.',
    },
    {
        icon: BarChart3,
        title: 'Analytics Dashboard',
        desc: 'Trend analysis and historical data across your entire patient population in one view.',
    },
    {
        icon: Users,
        title: 'Patient Management',
        desc: 'Unified records, onboarding workflows, and patient history all in a single platform.',
    },
    {
        icon: Zap,
        title: 'Low-Latency IoT',
        desc: 'Purpose-built for wearable and bedside IoT devices with sub-second data ingestion.',
    },
];

const stats = [
    { value: '< 1s', label: 'Data latency' },
    { value: '99.9%', label: 'Uptime SLA' },
    { value: '2-model', label: 'AI ensemble' },
    { value: '24 / 7', label: 'Monitoring' },
];

export default function LandingPage() {
    return (
        <div style={{ fontFamily: 'Inter, -apple-system, sans-serif', backgroundColor: '#F5F5F5', color: '#212121', minHeight: '100vh' }}>

            {/* Nav */}
            <nav style={{
                position: 'sticky', top: 0, zIndex: 50,
                backgroundColor: 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid #E0E0E0',
                padding: '0 2rem',
                height: '64px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        backgroundColor: '#1565C0',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Heart size={18} color="#fff" />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>GlucoseGuard</span>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <Link to="/login" style={{
                        padding: '8px 20px', borderRadius: 8,
                        border: '1px solid #E0E0E0',
                        color: '#212121', textDecoration: 'none',
                        fontWeight: 500, fontSize: '0.9rem',
                        backgroundColor: '#fff',
                        transition: 'border-color 0.15s',
                    }}>
                        Sign In
                    </Link>
                    <Link to="/register" style={{
                        padding: '8px 20px', borderRadius: 8,
                        backgroundColor: '#1565C0',
                        color: '#fff', textDecoration: 'none',
                        fontWeight: 500, fontSize: '0.9rem',
                    }}>
                        Get Started
                    </Link>
                </div>
            </nav>

            {/* Hero */}
            <section style={{
                background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 50%, #1a237e 100%)',
                padding: '100px 2rem 120px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* Subtle grid overlay */}
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)',
                    backgroundSize: '40px 40px',
                }} />

                <div style={{ position: 'relative', maxWidth: '760px', margin: '0 auto' }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        backgroundColor: 'rgba(255,255,255,0.12)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '100px',
                        padding: '6px 16px',
                        marginBottom: '32px',
                        color: '#E3F2FD',
                        fontSize: '0.82rem', fontWeight: 500,
                    }}>
                        <Cpu size={13} />
                        IoT-powered clinical intelligence
                    </div>

                    <h1 style={{
                        fontSize: 'clamp(2.4rem, 6vw, 3.8rem)',
                        fontWeight: 800,
                        color: '#ffffff',
                        lineHeight: 1.12,
                        letterSpacing: '-0.03em',
                        marginBottom: '24px',
                    }}>
                        Real-time patient monitoring<br />
                        <span style={{ color: '#90CAF9' }}>powered by AI</span>
                    </h1>

                    <p style={{
                        fontSize: '1.15rem',
                        color: 'rgba(255,255,255,0.75)',
                        lineHeight: 1.7,
                        marginBottom: '48px',
                        maxWidth: '540px',
                        margin: '0 auto 48px',
                    }}>
                        GlucoseGuard connects IoT wearables to clinical teams with sub-second data ingestion,
                        machine-learning anomaly detection, and instant escalation alerts.
                    </p>

                    <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to="/register" style={{
                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                            padding: '14px 28px', borderRadius: 10,
                            backgroundColor: '#ffffff',
                            color: '#1565C0',
                            textDecoration: 'none',
                            fontWeight: 700, fontSize: '0.95rem',
                        }}>
                            Create free account <ArrowRight size={16} />
                        </Link>
                        <Link to="/login" style={{
                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                            padding: '14px 28px', borderRadius: 10,
                            border: '1px solid rgba(255,255,255,0.3)',
                            backgroundColor: 'transparent',
                            color: '#ffffff',
                            textDecoration: 'none',
                            fontWeight: 500, fontSize: '0.95rem',
                        }}>
                            Sign in to dashboard
                        </Link>
                    </div>
                </div>
            </section>

            {/* Stats bar */}
            <section style={{
                backgroundColor: '#ffffff',
                borderBottom: '1px solid #E0E0E0',
                padding: '0 2rem',
            }}>
                <div style={{
                    maxWidth: '900px', margin: '0 auto',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '0',
                }}>
                    {stats.map((s, i) => (
                        <div key={i} style={{
                            padding: '32px 24px',
                            textAlign: 'center',
                            borderRight: i < stats.length - 1 ? '1px solid #E0E0E0' : 'none',
                        }}>
                            <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#1565C0', letterSpacing: '-0.03em' }}>
                                {s.value}
                            </div>
                            <div style={{ fontSize: '0.82rem', color: '#757575', marginTop: '4px', fontWeight: 500 }}>
                                {s.label}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features */}
            <section style={{ padding: '96px 2rem', maxWidth: '1100px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '64px' }}>
                    <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1565C0', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
                        Platform capabilities
                    </p>
                    <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800, letterSpacing: '-0.025em', color: '#212121' }}>
                        Everything a clinical team needs
                    </h2>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '24px',
                }}>
                    {features.map(({ icon: Icon, title, desc }, i) => (
                        <div key={i} style={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #E0E0E0',
                            borderRadius: '16px',
                            padding: '32px',
                            transition: 'box-shadow 0.2s',
                        }}
                            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 24px rgba(21,101,192,0.10)'}
                            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                        >
                            <div style={{
                                width: 44, height: 44, borderRadius: 12,
                                backgroundColor: '#E3F2FD',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                marginBottom: '20px',
                            }}>
                                <Icon size={20} color="#1565C0" />
                            </div>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '10px', color: '#212121' }}>
                                {title}
                            </h3>
                            <p style={{ fontSize: '0.9rem', color: '#757575', lineHeight: 1.65, margin: 0 }}>
                                {desc}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Banner */}
            <section style={{ padding: '0 2rem 96px' }}>
                <div style={{
                    maxWidth: '900px', margin: '0 auto',
                    background: 'linear-gradient(135deg, #1565C0, #0D47A1)',
                    borderRadius: '24px',
                    padding: '64px 48px',
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                }}>
                    <div style={{
                        position: 'absolute', inset: 0,
                        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)',
                        backgroundSize: '32px 32px',
                    }} />
                    <div style={{ position: 'relative' }}>
                        <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 800, color: '#fff', letterSpacing: '-0.025em', marginBottom: '16px' }}>
                            Ready to protect your patients?
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', marginBottom: '36px', maxWidth: '480px', margin: '0 auto 36px' }}>
                            Get started in minutes. Connect your IoT devices and go live with real-time monitoring today.
                        </p>
                        <Link to="/register" style={{
                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                            padding: '14px 32px', borderRadius: 10,
                            backgroundColor: '#ffffff',
                            color: '#1565C0',
                            textDecoration: 'none',
                            fontWeight: 700, fontSize: '0.95rem',
                        }}>
                            Create your account <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{
                borderTop: '1px solid #E0E0E0',
                backgroundColor: '#ffffff',
                padding: '32px 2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                        width: 28, height: 28, borderRadius: 8,
                        backgroundColor: '#1565C0',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Heart size={13} color="#fff" />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>GlucoseGuard</span>
                </div>
                <p style={{ color: '#757575', fontSize: '0.82rem', margin: 0 }}>
                    © {new Date().getFullYear()} GlucoseGuard. Built for clinical IoT monitoring.
                </p>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <Link to="/login" style={{ color: '#757575', fontSize: '0.82rem', textDecoration: 'none' }}>Sign In</Link>
                    <Link to="/register" style={{ color: '#757575', fontSize: '0.82rem', textDecoration: 'none' }}>Register</Link>
                </div>
            </footer>

        </div>
    );
}
