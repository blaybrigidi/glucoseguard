import { Link } from 'react-router-dom';
import { ArrowRight, Heart } from 'lucide-react';

// Pulse SVG — reused in bento
function PulseLine({ color = 'rgba(144,202,249,0.8)', height = 48 }) {
    return (
        <svg viewBox="0 0 320 48" width="100%" height={height} preserveAspectRatio="none">
            <polyline
                points="0,24 50,24 65,6 78,42 90,24 140,24 155,8 168,40 180,24 230,24 245,7 258,41 270,24 320,24"
                fill="none"
                stroke={color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

// Mini bar chart for analytics bento
function MiniBarChart() {
    const bars = [40, 65, 50, 80, 60, 90, 55, 75, 45, 85, 70, 95];
    return (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 60, marginTop: 8 }}>
            {bars.map((h, i) => (
                <div key={i} style={{
                    flex: 1,
                    height: `${h}%`,
                    borderRadius: 3,
                    backgroundColor: i === bars.length - 1 ? '#1565C0' : '#E3F2FD',
                    transition: 'height 0.3s',
                }} />
            ))}
        </div>
    );
}

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
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)',
                    backgroundSize: '40px 40px',
                }} />
                <div style={{ position: 'relative', maxWidth: '760px', margin: '0 auto' }}>
                    <h1 style={{
                        fontSize: 'clamp(2.4rem, 6vw, 3.8rem)',
                        fontWeight: 800,
                        color: '#ffffff',
                        lineHeight: 1.12,
                        letterSpacing: '-0.03em',
                        marginBottom: '24px',
                    }}>
                        Real-time patient monitoring<br />
                        <span style={{ color: '#90CAF9' }}>for every patient</span>
                    </h1>
                    <p style={{
                        fontSize: '1.15rem',
                        color: 'rgba(255,255,255,0.75)',
                        lineHeight: 1.7,
                        maxWidth: '540px',
                        margin: '0 auto 48px',
                    }}>
                        GlucoseGuard connects IoT wearables to clinical teams with continuous data ingestion,
                        anomaly detection, and instant escalation alerts.
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

            {/* Bento feature grid */}
            <section style={{ padding: '96px 2rem', maxWidth: '1100px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '56px' }}>
                    <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.025em' }}>
                        From wearable to clinician<br />in seconds
                    </h2>
                    <p style={{ color: '#757575', fontSize: '1rem', marginTop: 12, maxWidth: 480, margin: '12px auto 0' }}>
                        Everything your team needs to monitor, detect, and respond — in one place.
                    </p>
                </div>

                {/* Bento grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(12, 1fr)',
                    gridTemplateRows: 'auto',
                    gap: 16,
                }}>
                    {/* 1 — Live vitals (wide) */}
                    <div style={{
                        gridColumn: 'span 7',
                        backgroundColor: '#fff',
                        border: '1px solid #E0E0E0',
                        borderRadius: 20,
                        padding: '32px',
                        overflow: 'hidden',
                    }}>
                        <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1565C0', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Live vitals</p>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 6, letterSpacing: '-0.01em' }}>Continuous sensor data</h3>
                        <p style={{ fontSize: '0.88rem', color: '#757575', lineHeight: 1.6, marginBottom: 24 }}>
                            Heart rate, temperature, and HRV streamed from IoT devices and displayed the moment a reading lands.
                        </p>
                        {/* Fake vitals row */}
                        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                            {[
                                { label: 'Heart Rate', val: '74', unit: 'bpm', color: '#F48FB1', bg: '#FFF0F3' },
                                { label: 'Temperature', val: '36.8', unit: '°C', color: '#A5D6A7', bg: '#F1FBF2' },
                                { label: 'HRV', val: '42', unit: 'ms', color: '#CE93D8', bg: '#F9F0FF' },
                            ].map(({ label, val, unit, color, bg }) => (
                                <div key={label} style={{ flex: 1, backgroundColor: bg, borderRadius: 12, padding: '14px 16px' }}>
                                    <div style={{ fontSize: '0.72rem', color: '#757575', marginBottom: 4 }}>{label}</div>
                                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color, fontVariantNumeric: 'tabular-nums' }}>
                                        {val}<span style={{ fontSize: '0.75rem', fontWeight: 500, marginLeft: 2 }}>{unit}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <PulseLine color="rgba(21,101,192,0.35)" height={44} />
                    </div>

                    {/* 2 — Anomaly detection (narrow) */}
                    <div style={{
                        gridColumn: 'span 5',
                        background: 'linear-gradient(145deg, #1565C0, #0D47A1)',
                        borderRadius: 20,
                        padding: '32px',
                        color: '#fff',
                        position: 'relative',
                        overflow: 'hidden',
                    }}>
                        <div style={{
                            position: 'absolute', inset: 0,
                            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)',
                            backgroundSize: '28px 28px',
                        }} />
                        <div style={{ position: 'relative' }}>
                            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Anomaly detection</p>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 12, letterSpacing: '-0.01em' }}>Flags instability before it escalates</h3>
                            <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.72)', lineHeight: 1.6, marginBottom: 24 }}>
                                Dual-model analysis runs on every reading. When patterns deviate, your team knows immediately.
                            </p>
                            <div style={{ display: 'flex', gap: 10 }}>
                                {['Normal', 'Warning', 'Critical'].map((s, i) => {
                                    const colors = ['#A5D6A7', '#FFD54F', '#EF9A9A'];
                                    return (
                                        <div key={s} style={{
                                            flex: 1, textAlign: 'center', padding: '8px 4px',
                                            borderRadius: 10,
                                            backgroundColor: 'rgba(255,255,255,0.1)',
                                            border: '1px solid rgba(255,255,255,0.15)',
                                        }}>
                                            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: colors[i], margin: '0 auto 6px' }} />
                                            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.75)' }}>{s}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* 3 — Alerts (narrow) */}
                    <div style={{
                        gridColumn: 'span 4',
                        backgroundColor: '#fff',
                        border: '1px solid #E0E0E0',
                        borderRadius: 20,
                        padding: '32px',
                    }}>
                        <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1565C0', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Instant alerts</p>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 10, letterSpacing: '-0.01em' }}>Right clinician, right time</h3>
                        <p style={{ fontSize: '0.85rem', color: '#757575', lineHeight: 1.6, marginBottom: 20 }}>
                            Threshold breaches trigger alerts that surface directly in the dashboard — no missed events.
                        </p>
                        {/* Fake alert list */}
                        {[
                            { label: 'High heart rate', time: '2m ago', color: '#F44336', bg: '#FFEBEE' },
                            { label: 'Temp elevated', time: '18m ago', color: '#FF9800', bg: '#FFF3E0' },
                        ].map(({ label, time, color, bg }) => (
                            <div key={label} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '10px 12px',
                                borderRadius: 10,
                                backgroundColor: bg,
                                marginBottom: 8,
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: color, flexShrink: 0 }} />
                                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#212121' }}>{label}</span>
                                </div>
                                <span style={{ fontSize: '0.72rem', color: '#9E9E9E' }}>{time}</span>
                            </div>
                        ))}
                    </div>

                    {/* 4 — Analytics (medium) */}
                    <div style={{
                        gridColumn: 'span 4',
                        backgroundColor: '#fff',
                        border: '1px solid #E0E0E0',
                        borderRadius: 20,
                        padding: '32px',
                    }}>
                        <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1565C0', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Analytics</p>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 10, letterSpacing: '-0.01em' }}>Trends across your ward</h3>
                        <p style={{ fontSize: '0.85rem', color: '#757575', lineHeight: 1.6 }}>
                            24-hour and 7-day trend views for each patient, with population-level summaries.
                        </p>
                        <MiniBarChart />
                    </div>

                    {/* 5 — Patient management (wide) */}
                    <div style={{
                        gridColumn: 'span 4',
                        backgroundColor: '#FAFAFA',
                        border: '1px solid #E0E0E0',
                        borderRadius: 20,
                        padding: '32px',
                    }}>
                        <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1565C0', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Patient records</p>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 10, letterSpacing: '-0.01em' }}>All your patients, one view</h3>
                        <p style={{ fontSize: '0.85rem', color: '#757575', lineHeight: 1.6, marginBottom: 20 }}>
                            Onboard patients, view history, and download clinical reports without leaving the portal.
                        </p>
                        {/* Fake patient rows */}
                        {['A. Mensah', 'K. Boateng'].map((name, i) => (
                            <div key={name} style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                padding: '8px 0',
                                borderBottom: i === 0 ? '1px solid #E0E0E0' : 'none',
                            }}>
                                <div style={{
                                    width: 28, height: 28, borderRadius: '50%',
                                    backgroundColor: '#E3F2FD',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.72rem', fontWeight: 700, color: '#1565C0',
                                }}>
                                    {name[0]}
                                </div>
                                <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>{name}</span>
                                <div style={{
                                    marginLeft: 'auto', fontSize: '0.7rem', fontWeight: 600,
                                    padding: '2px 8px', borderRadius: 20,
                                    backgroundColor: i === 0 ? '#E8F5E9' : '#FFF3E0',
                                    color: i === 0 ? '#388E3C' : '#E65100',
                                }}>
                                    {i === 0 ? 'Normal' : 'Warning'}
                                </div>
                            </div>
                        ))}
                    </div>
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
                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', maxWidth: '480px', margin: '0 auto 36px' }}>
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
