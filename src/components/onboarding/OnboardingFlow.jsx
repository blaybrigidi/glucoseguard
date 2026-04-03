import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Activity, Bell, BarChart2, Users, ChevronRight, ChevronLeft,
  Check, AlertTriangle, Building2, Heart, Monitor, Zap,
  FileText, TrendingUp, ArrowRight, Shield, User, Mail,
  Lock, Phone, Hash, X, CheckCircle2, AlertCircle, Info
} from 'lucide-react';

// ─────────────────────────────────────────────
// Design Tokens
// ─────────────────────────────────────────────
const C = {
  primary: '#2B7DE9',
  primaryLight: '#5B9FFF',
  primaryBg: 'rgba(43,125,233,0.08)',
  bg: '#F5F7FA',
  white: '#FFFFFF',
  textPrimary: '#1A1A1A',
  textSecondary: '#6B7280',
  greyLight: '#E5E7EB',
  success: '#10B981',
  successBg: 'rgba(16,185,129,0.08)',
  warning: '#F59E0B',
  warningBg: 'rgba(245,158,11,0.08)',
  critical: '#EF4444',
  criticalBg: 'rgba(239,68,68,0.08)',
  shadow: '0 2px 8px rgba(0,0,0,0.08)',
  shadowMd: '0 4px 16px rgba(0,0,0,0.12)',
};

// ─────────────────────────────────────────────
// Shared Style Helpers
// ─────────────────────────────────────────────
const card = {
  background: C.white,
  borderRadius: '12px',
  boxShadow: C.shadow,
  padding: '28px',
};

const btnPrimary = {
  background: C.primary,
  color: C.white,
  border: 'none',
  borderRadius: '8px',
  padding: '12px 28px',
  fontSize: '15px',
  fontWeight: '600',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  transition: 'opacity 0.2s, transform 0.1s',
  letterSpacing: '0.01em',
};

const btnGhost = {
  background: 'transparent',
  color: C.textSecondary,
  border: 'none',
  padding: '12px 20px',
  fontSize: '14px',
  cursor: 'pointer',
  fontWeight: '500',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  transition: 'color 0.2s',
};

const label = {
  display: 'block',
  fontSize: '13px',
  fontWeight: '600',
  color: C.textPrimary,
  marginBottom: '6px',
  letterSpacing: '0.01em',
};

// ─────────────────────────────────────────────
// Reusable: FocusableInput
// ─────────────────────────────────────────────
const FocusableInput = ({ icon: Icon, type = 'text', placeholder, value, onChange, disabled, name }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      border: `1.5px solid ${focused ? C.primary : C.greyLight}`,
      borderRadius: '8px',
      padding: '11px 14px',
      background: disabled ? C.bg : C.white,
      transition: 'border-color 0.2s',
    }}>
      {Icon && <Icon size={16} color={focused ? C.primary : C.textSecondary} />}
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          border: 'none',
          outline: 'none',
          flex: 1,
          fontSize: '15px',
          color: disabled ? C.textSecondary : C.textPrimary,
          background: 'transparent',
          fontFamily: 'Inter, -apple-system, sans-serif',
        }}
      />
    </div>
  );
};

// ─────────────────────────────────────────────
// Reusable: ProgressStepper
// ─────────────────────────────────────────────
const STEP_LABELS = ['Account', 'Tour', 'Alerts', 'Patient'];

const ProgressStepper = ({ currentStep }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0', marginBottom: '36px' }}>
    {STEP_LABELS.map((label, i) => {
      const done = i + 1 < currentStep;
      const active = i + 1 === currentStep;
      return (
        <React.Fragment key={i}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: done ? C.success : active ? C.primary : C.greyLight,
              color: done || active ? C.white : C.textSecondary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px',
              fontWeight: '700',
              transition: 'all 0.3s ease',
              boxShadow: active ? `0 0 0 4px ${C.primaryBg}` : 'none',
            }}>
              {done ? <Check size={16} /> : i + 1}
            </div>
            <span style={{
              fontSize: '11px',
              fontWeight: active ? '700' : '500',
              color: active ? C.primary : done ? C.success : C.textSecondary,
              whiteSpace: 'nowrap',
            }}>
              {label}
            </span>
          </div>
          {i < STEP_LABELS.length - 1 && (
            <div style={{
              flex: 1,
              height: '2px',
              background: done ? C.success : C.greyLight,
              margin: '0 8px',
              marginBottom: '20px',
              transition: 'background 0.3s',
              minWidth: '32px',
              maxWidth: '64px',
            }} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

// ─────────────────────────────────────────────
// Reusable: StepCard wrapper
// ─────────────────────────────────────────────
const StepCard = ({ children, maxWidth = '560px' }) => (
  <div style={{
    minHeight: '100vh',
    background: C.bg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 24px',
    fontFamily: 'Inter, -apple-system, sans-serif',
  }}>
    <div style={{ width: '100%', maxWidth }}>
      {children}
    </div>
  </div>
);

// ─────────────────────────────────────────────
// Step 0: Welcome Page
// ─────────────────────────────────────────────
const WelcomePage = ({ onStart, onSkip }) => {
  const features = [
    { icon: Activity, title: 'Real-time Monitoring', desc: 'Live glucose & vital signs from IoT devices', color: C.primary },
    { icon: Zap, title: 'ML-Powered Alerts', desc: 'Predict instability before it becomes critical', color: C.warning },
    { icon: TrendingUp, title: 'Trend Analysis', desc: 'Track patient progress with historical charts', color: C.success },
    { icon: FileText, title: 'Smart Reports', desc: 'Export comprehensive PDF reports in seconds', color: '#8B5CF6' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: C.bg,
      fontFamily: 'Inter, -apple-system, sans-serif',
    }}>
      {/* Nav bar */}
      <nav style={{
        background: C.white,
        borderBottom: `1px solid ${C.greyLight}`,
        padding: '16px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Activity size={20} color={C.white} />
          </div>
          <span style={{ fontSize: '18px', fontWeight: '700', color: C.textPrimary }}>GlucoseGuard</span>
        </div>
        <button onClick={onSkip} style={{ ...btnGhost, fontSize: '13px' }}>
          Skip setup <ArrowRight size={14} />
        </button>
      </nav>

      {/* Hero */}
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '80px 40px 60px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '64px',
        alignItems: 'center',
      }}
        className="welcome-hero"
      >
        {/* Left: Text */}
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: C.primaryBg,
            color: C.primary,
            borderRadius: '20px',
            padding: '6px 14px',
            fontSize: '13px',
            fontWeight: '600',
            marginBottom: '24px',
          }}>
            <Shield size={14} />
            Clinician Dashboard
          </div>
          <h1 style={{
            fontSize: '42px',
            fontWeight: '800',
            color: C.textPrimary,
            lineHeight: '1.2',
            margin: '0 0 20px',
            letterSpacing: '-0.02em',
          }}>
            Welcome to <br />
            <span style={{ color: C.primary }}>GlucoseGuard</span>
          </h1>
          <p style={{
            fontSize: '18px',
            color: C.textSecondary,
            lineHeight: '1.7',
            margin: '0 0 36px',
            maxWidth: '480px',
          }}>
            Monitor your diabetic patients in real-time from anywhere.
            Get started in under 5 minutes.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={onStart}
              style={{ ...btnPrimary, padding: '14px 32px', fontSize: '16px' }}
              onMouseOver={e => e.currentTarget.style.opacity = '0.9'}
              onMouseOut={e => e.currentTarget.style.opacity = '1'}
            >
              Get Started <ChevronRight size={18} />
            </button>
            <button
              onClick={onSkip}
              style={{
                ...btnGhost,
                border: `1.5px solid ${C.greyLight}`,
                borderRadius: '8px',
                padding: '14px 24px',
                color: C.textSecondary,
              }}
            >
              Go to Dashboard
            </button>
          </div>
        </div>

        {/* Right: Hero illustration */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <DashboardIllustration />
        </div>
      </div>

      {/* Feature cards */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 40px 80px' }}>
        <h2 style={{ textAlign: 'center', fontSize: '24px', fontWeight: '700', color: C.textPrimary, marginBottom: '32px' }}>
          Everything you need, in one place
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '20px',
        }}
          className="feature-grid"
        >
          {features.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} style={{
              ...card,
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
              onMouseOver={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = C.shadowMd;
              }}
              onMouseOut={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = C.shadow;
              }}
            >
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                background: `${color}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={22} color={color} />
              </div>
              <div>
                <p style={{ fontSize: '15px', fontWeight: '700', color: C.textPrimary, margin: '0 0 4px' }}>{title}</p>
                <p style={{ fontSize: '13px', color: C.textSecondary, margin: 0, lineHeight: '1.5' }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .welcome-hero { grid-template-columns: 1fr !important; text-align: center; gap: 40px !important; padding: 40px 24px 32px !important; }
          .welcome-hero h1 { font-size: 32px !important; }
          .feature-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 520px) {
          .feature-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

// SVG-based dashboard illustration
const DashboardIllustration = () => (
  <div style={{
    width: '100%',
    maxWidth: '440px',
    background: C.white,
    borderRadius: '16px',
    boxShadow: C.shadowMd,
    overflow: 'hidden',
    border: `1px solid ${C.greyLight}`,
  }}>
    {/* Window chrome */}
    <div style={{ background: '#F0F0F0', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
      {['#EF4444','#F59E0B','#10B981'].map(c => (
        <div key={c} style={{ width: '10px', height: '10px', borderRadius: '50%', background: c }} />
      ))}
    </div>
    {/* Mock dashboard content */}
    <div style={{ padding: '16px', background: C.bg }}>
      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '12px' }}>
        {[
          { label: 'Patients', val: '24', color: C.primary },
          { label: 'Alerts', val: '3', color: C.warning },
          { label: 'Critical', val: '1', color: C.critical },
        ].map(({ label, val, color }) => (
          <div key={label} style={{ background: C.white, borderRadius: '8px', padding: '10px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <p style={{ margin: 0, fontSize: '18px', fontWeight: '800', color }}>{val}</p>
            <p style={{ margin: 0, fontSize: '10px', color: C.textSecondary }}>{label}</p>
          </div>
        ))}
      </div>
      {/* Fake chart bars */}
      <div style={{ background: C.white, borderRadius: '8px', padding: '12px', marginBottom: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <p style={{ margin: '0 0 10px', fontSize: '11px', fontWeight: '700', color: C.textPrimary }}>Glucose Levels (7 days)</p>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '48px' }}>
          {[60, 80, 45, 90, 70, 85, 55].map((h, i) => (
            <div key={i} style={{
              flex: 1, height: `${h}%`,
              background: h > 80 ? C.warning : h > 60 ? C.primary : C.success,
              borderRadius: '3px',
              opacity: 0.8,
            }} />
          ))}
        </div>
      </div>
      {/* Patient list rows */}
      {[
        { name: 'Kofi A.', status: 'Normal', color: C.success },
        { name: 'Ama B.', status: 'Warning', color: C.warning },
        { name: 'Kwame T.', status: 'Critical', color: C.critical },
      ].map(({ name, status, color }) => (
        <div key={name} style={{
          background: C.white,
          borderRadius: '6px',
          padding: '8px 10px',
          marginBottom: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={12} color={color} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: '600', color: C.textPrimary }}>{name}</span>
          </div>
          <span style={{
            fontSize: '10px', fontWeight: '700',
            color, background: `${color}15`,
            padding: '2px 8px', borderRadius: '10px',
          }}>{status}</span>
        </div>
      ))}
    </div>
  </div>
);

// ─────────────────────────────────────────────
// Step 1: Account Setup
// ─────────────────────────────────────────────
const Step1AccountSetup = ({ onNext, onBack, onSkip, formData, setFormData }) => {
  const { currentUser } = useAuth();
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (currentUser && !formData.fullName) {
      setFormData(prev => ({
        ...prev,
        fullName: currentUser.displayName || '',
        email: currentUser.email || '',
      }));
    }
  }, [currentUser]);

  const validate = () => {
    const errs = {};
    if (!formData.fullName?.trim()) errs.fullName = 'Full name is required';
    if (!formData.licenseNumber?.trim()) errs.licenseNumber = 'License number is required';
    if (!formData.facilityName?.trim()) errs.facilityName = 'Facility name is required';
    return errs;
  };

  const handleNext = () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onNext();
  };

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const fields = [
    { field: 'fullName', label: 'Full Name', icon: User, placeholder: 'Dr. Kofi Mensah', type: 'text' },
    { field: 'email', label: 'Email Address', icon: Mail, placeholder: '', type: 'email', disabled: true },
    { field: 'licenseNumber', label: 'Medical License Number', icon: Hash, placeholder: 'GH-MED-12345', type: 'text' },
    { field: 'facilityName', label: 'Facility / Hospital Name', icon: Building2, placeholder: 'Korle Bu Teaching Hospital', type: 'text' },
  ];

  return (
    <StepCard>
      <div style={{ ...card, padding: '40px' }}>
        <ProgressStepper currentStep={1} />
        <p style={{ textAlign: 'center', fontSize: '13px', color: C.textSecondary, marginBottom: '8px', fontWeight: '600' }}>
          STEP 1 OF 4
        </p>
        <h2 style={{ textAlign: 'center', fontSize: '26px', fontWeight: '800', color: C.textPrimary, margin: '0 0 6px' }}>
          Create Your Clinician Account
        </h2>
        <p style={{ textAlign: 'center', fontSize: '14px', color: C.textSecondary, margin: '0 0 32px' }}>
          Complete your profile to personalize your experience
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {fields.map(({ field, label: lbl, icon, placeholder, type, disabled }) => (
            <div key={field}>
              <label style={label}>{lbl}</label>
              <FocusableInput
                icon={icon}
                type={type}
                placeholder={placeholder}
                value={formData[field] || ''}
                onChange={handleChange(field)}
                disabled={disabled}
                name={field}
              />
              {errors[field] && (
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: C.critical, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertCircle size={12} /> {errors[field]}
                </p>
              )}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '32px' }}>
          <button onClick={onBack} style={btnGhost}>
            <ChevronLeft size={16} /> Back
          </button>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button onClick={onSkip} style={{ ...btnGhost, fontSize: '13px' }}>
              Skip for now
            </button>
            <button
              onClick={handleNext}
              style={btnPrimary}
              onMouseOver={e => e.currentTarget.style.opacity = '0.9'}
              onMouseOut={e => e.currentTarget.style.opacity = '1'}
            >
              Continue <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </StepCard>
  );
};

// ─────────────────────────────────────────────
// Step 2: Dashboard Tour
// ─────────────────────────────────────────────
const TOUR_ITEMS = [
  {
    number: 1,
    icon: Users,
    color: C.primary,
    title: 'Patient List (Left Sidebar)',
    desc: 'Browse and search all your registered patients. Filter by status — Normal, Warning, or Critical — to quickly prioritize care.',
  },
  {
    number: 2,
    icon: Activity,
    color: C.success,
    title: 'Live Vital Cards (Main Area)',
    desc: 'Click any patient to see real-time glucose readings, heart rate, SpO₂, and temperature streamed directly from their IoT device.',
  },
  {
    number: 3,
    icon: TrendingUp,
    color: '#8B5CF6',
    title: 'Trend Charts',
    desc: 'Interactive 7-day and 30-day charts let you spot patterns, track medication impact, and prepare for clinical reviews.',
  },
  {
    number: 4,
    icon: Bell,
    color: C.warning,
    title: 'Alert Bell (Top Right)',
    desc: 'The notification bell shows unread alerts. A red badge appears when critical thresholds are breached — tap to view and resolve.',
  },
];

const Step2DashboardTour = ({ onNext, onBack, onSkip }) => {
  const [activeItem, setActiveItem] = useState(0);

  return (
    <StepCard maxWidth="720px">
      <div style={{ ...card, padding: '40px' }}>
        <ProgressStepper currentStep={2} />
        <p style={{ textAlign: 'center', fontSize: '13px', color: C.textSecondary, marginBottom: '8px', fontWeight: '600' }}>
          STEP 2 OF 4
        </p>
        <h2 style={{ textAlign: 'center', fontSize: '26px', fontWeight: '800', color: C.textPrimary, margin: '0 0 6px' }}>
          Navigate Your Dashboard
        </h2>
        <p style={{ textAlign: 'center', fontSize: '14px', color: C.textSecondary, margin: '0 0 32px' }}>
          Learn the key areas of your clinician workspace
        </p>

        {/* Tour layout: mockup left, callouts right */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}
          className="tour-grid">
          {/* Mini dashboard mockup */}
          <div style={{
            background: C.bg,
            borderRadius: '12px',
            border: `2px solid ${C.greyLight}`,
            overflow: 'hidden',
            position: 'relative',
          }}>
            {/* Header */}
            <div style={{
              background: C.white,
              padding: '8px 12px',
              borderBottom: `1px solid ${C.greyLight}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: C.primary }}>GlucoseGuard</span>
              <div style={{
                position: 'relative',
                outline: activeItem === 3 ? `3px solid ${C.warning}` : 'none',
                borderRadius: '6px',
                padding: '2px',
                transition: 'all 0.3s',
              }}>
                <Bell size={16} color={activeItem === 3 ? C.warning : C.textSecondary} />
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: C.critical, position: 'absolute', top: '-1px', right: '-1px',
                }} />
                {activeItem === 3 && <CalloutBadge num={4} color={C.warning} />}
              </div>
            </div>
            <div style={{ display: 'flex', minHeight: '220px' }}>
              {/* Sidebar */}
              <div style={{
                width: '80px',
                background: C.textPrimary,
                padding: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                position: 'relative',
                outline: activeItem === 0 ? `3px solid ${C.primary}` : 'none',
                transition: 'all 0.3s',
              }}>
                {activeItem === 0 && <CalloutBadge num={1} color={C.primary} pos={{ top: '-8px', right: '-8px' }} />}
                {['Kofi A.', 'Ama B.', 'Kwame T.'].map((n, i) => (
                  <div key={n} style={{
                    background: i === 1 ? C.primary : 'rgba(255,255,255,0.1)',
                    borderRadius: '4px',
                    padding: '5px 6px',
                  }}>
                    <p style={{ margin: 0, fontSize: '9px', color: C.white, fontWeight: '600' }}>{n}</p>
                    <p style={{ margin: 0, fontSize: '8px', color: i === 0 ? C.success : i === 1 ? C.warning : C.critical }}>
                      {['Normal', 'Warning', 'Critical'][i]}
                    </p>
                  </div>
                ))}
              </div>
              {/* Main area */}
              <div style={{ flex: 1, padding: '10px', position: 'relative' }}>
                {/* Vital cards */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '10px',
                  outline: activeItem === 1 ? `3px solid ${C.success}` : 'none',
                  borderRadius: '6px',
                  transition: 'all 0.3s',
                  position: 'relative',
                }}>
                  {activeItem === 1 && <CalloutBadge num={2} color={C.success} pos={{ top: '-8px', right: '-8px' }} />}
                  {[
                    { label: 'Glucose', val: '142', unit: 'mg/dL', c: C.warning },
                    { label: 'Heart Rate', val: '78', unit: 'bpm', c: C.success },
                    { label: 'SpO₂', val: '97%', unit: '', c: C.primary },
                    { label: 'Temp', val: '36.8', unit: '°C', c: C.success },
                  ].map(({ label: l, val, unit, c }) => (
                    <div key={l} style={{ background: C.white, borderRadius: '6px', padding: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                      <p style={{ margin: 0, fontSize: '8px', color: C.textSecondary }}>{l}</p>
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: c }}>{val}</p>
                      <p style={{ margin: 0, fontSize: '7px', color: C.textSecondary }}>{unit}</p>
                    </div>
                  ))}
                </div>
                {/* Chart */}
                <div style={{
                  background: C.white, borderRadius: '6px', padding: '8px',
                  outline: activeItem === 2 ? `3px solid #8B5CF6` : 'none',
                  transition: 'all 0.3s',
                  position: 'relative',
                }}>
                  {activeItem === 2 && <CalloutBadge num={3} color="#8B5CF6" pos={{ top: '-8px', right: '-8px' }} />}
                  <p style={{ margin: '0 0 4px', fontSize: '8px', fontWeight: '700', color: C.textPrimary }}>7-Day Trend</p>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '32px' }}>
                    {[60, 75, 55, 88, 70, 82, 65].map((h, i) => (
                      <div key={i} style={{
                        flex: 1, height: `${h}%`,
                        background: h > 80 ? C.warning : C.primary,
                        borderRadius: '2px', opacity: 0.8,
                      }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Callout list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {TOUR_ITEMS.map(({ number, icon: Icon, color, title, desc }, i) => (
              <div
                key={number}
                onClick={() => setActiveItem(i)}
                style={{
                  padding: '14px',
                  borderRadius: '10px',
                  border: `2px solid ${activeItem === i ? color : C.greyLight}`,
                  background: activeItem === i ? `${color}08` : C.white,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                }}
                onMouseOver={e => { if (activeItem !== i) e.currentTarget.style.borderColor = `${color}50`; }}
                onMouseOut={e => { if (activeItem !== i) e.currentTarget.style.borderColor = C.greyLight; }}
              >
                <div style={{
                  minWidth: '32px', height: '32px', borderRadius: '50%',
                  background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `2px solid ${activeItem === i ? color : 'transparent'}`,
                  transition: 'all 0.2s',
                }}>
                  <Icon size={16} color={color} />
                </div>
                <div>
                  <p style={{ margin: '0 0 3px', fontSize: '13px', fontWeight: '700', color: C.textPrimary }}>{title}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: C.textSecondary, lineHeight: '1.5' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '32px' }}>
          <button onClick={onBack} style={btnGhost}><ChevronLeft size={16} /> Back</button>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button onClick={onSkip} style={{ ...btnGhost, fontSize: '13px' }}>Skip</button>
            <button onClick={onNext} style={btnPrimary}
              onMouseOver={e => e.currentTarget.style.opacity = '0.9'}
              onMouseOut={e => e.currentTarget.style.opacity = '1'}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 600px) {
          .tour-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </StepCard>
  );
};

// Small numbered badge for mockup callouts
const CalloutBadge = ({ num, color, pos = { top: '-8px', right: '-8px' } }) => (
  <div style={{
    position: 'absolute',
    ...pos,
    width: '20px', height: '20px',
    borderRadius: '50%',
    background: color,
    color: C.white,
    fontSize: '11px',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
    animation: 'pulse 1.5s infinite',
  }}>
    {num}
  </div>
);

// ─────────────────────────────────────────────
// Step 3: Understanding Alerts
// ─────────────────────────────────────────────
const Step3Alerts = ({ onNext, onBack, onSkip }) => {
  const alertTypes = [
    {
      type: 'Warning',
      color: C.warning,
      bg: C.warningBg,
      icon: AlertTriangle,
      title: 'Glucose Instability Warning',
      subtitle: 'Risk Score: 68%',
      desc: 'ML model detects early signs of instability. Review patient diet and medication. Consider scheduling a check-in within 24 hours.',
      actions: ['Review recent glucose logs', 'Contact patient', 'Adjust monitoring frequency'],
    },
    {
      type: 'Critical',
      color: C.critical,
      bg: C.criticalBg,
      icon: AlertCircle,
      title: 'Critical Glucose Alert',
      subtitle: 'Glucose: 38 mg/dL — Hypoglycemia',
      desc: 'Patient glucose is dangerously low. Immediate intervention required. Notify emergency contacts and arrange urgent care.',
      actions: ['Call emergency contact', 'Alert on-call physician', 'Dispatch emergency services if unreachable'],
    },
  ];

  const howItWorks = [
    { icon: Activity, text: 'IoT sensors stream glucose & vitals every 5 minutes' },
    { icon: Zap, text: 'Our ML model analyzes trends across the last 48 hours' },
    { icon: Bell, text: 'Alerts fire when risk exceeds your configured thresholds' },
  ];

  return (
    <StepCard maxWidth="640px">
      <div style={{ ...card, padding: '40px' }}>
        <ProgressStepper currentStep={3} />
        <p style={{ textAlign: 'center', fontSize: '13px', color: C.textSecondary, marginBottom: '8px', fontWeight: '600' }}>
          STEP 3 OF 4
        </p>
        <h2 style={{ textAlign: 'center', fontSize: '26px', fontWeight: '800', color: C.textPrimary, margin: '0 0 6px' }}>
          Stay Informed with Smart Alerts
        </h2>
        <p style={{ textAlign: 'center', fontSize: '14px', color: C.textSecondary, margin: '0 0 28px' }}>
          Our ML engine monitors patients around the clock
        </p>

        {/* How it works */}
        <div style={{
          background: C.primaryBg,
          borderRadius: '10px',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}>
          <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: '700', color: C.primary }}>How it works</p>
          {howItWorks.map(({ icon: Icon, text }, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Icon size={14} color={C.white} />
              </div>
              <span style={{ fontSize: '13px', color: C.textPrimary }}>{text}</span>
            </div>
          ))}
        </div>

        {/* Alert examples */}
        <p style={{ fontSize: '13px', fontWeight: '700', color: C.textPrimary, margin: '0 0 12px' }}>Alert Examples</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '8px' }}>
          {alertTypes.map(({ type, color, bg, icon: Icon, title, subtitle, desc, actions }) => (
            <div key={type} style={{
              border: `1.5px solid ${color}40`,
              borderLeft: `4px solid ${color}`,
              borderRadius: '10px',
              padding: '16px',
              background: bg,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Icon size={18} color={color} />
                <span style={{ fontWeight: '700', fontSize: '14px', color }}>{type}</span>
                <span style={{
                  marginLeft: 'auto', fontSize: '11px', fontWeight: '700',
                  background: `${color}20`, color, padding: '2px 8px', borderRadius: '10px',
                }}>
                  {type.toUpperCase()}
                </span>
              </div>
              <p style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: '700', color: C.textPrimary }}>{title}</p>
              <p style={{ margin: '0 0 8px', fontSize: '12px', color, fontWeight: '600' }}>{subtitle}</p>
              <p style={{ margin: '0 0 10px', fontSize: '13px', color: C.textSecondary, lineHeight: '1.5' }}>{desc}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {actions.map((a, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: color, flexShrink: 0 }} />
                    <span style={{ fontSize: '12px', color: C.textPrimary }}>{a}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '32px' }}>
          <button onClick={onBack} style={btnGhost}><ChevronLeft size={16} /> Back</button>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button onClick={onSkip} style={{ ...btnGhost, fontSize: '13px' }}>Skip</button>
            <button onClick={onNext} style={btnPrimary}
              onMouseOver={e => e.currentTarget.style.opacity = '0.9'}
              onMouseOut={e => e.currentTarget.style.opacity = '1'}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </StepCard>
  );
};

// ─────────────────────────────────────────────
// Step 4: Add First Patient
// ─────────────────────────────────────────────
const Step4AddPatient = ({ onNext, onBack, onSkip, patientData, setPatientData }) => {
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const errs = {};
    if (!patientData.patientName?.trim()) errs.patientName = 'Patient name is required';
    if (!patientData.patientId?.trim()) errs.patientId = 'Patient ID is required';
    if (!patientData.diabetesType) errs.diabetesType = 'Please select diabetes type';
    return errs;
  };

  const handleNext = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setIsSubmitting(true);
    // Simulate brief processing
    await new Promise(r => setTimeout(r, 600));
    setIsSubmitting(false);
    onNext();
  };

  const handleChange = (field) => (e) => {
    setPatientData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const [focusedSelect, setFocusedSelect] = useState(false);

  return (
    <StepCard maxWidth="640px">
      <div style={{ ...card, padding: '40px' }}>
        <ProgressStepper currentStep={4} />
        <p style={{ textAlign: 'center', fontSize: '13px', color: C.textSecondary, marginBottom: '8px', fontWeight: '600' }}>
          STEP 4 OF 4
        </p>
        <h2 style={{ textAlign: 'center', fontSize: '26px', fontWeight: '800', color: C.textPrimary, margin: '0 0 6px' }}>
          Add Your First Patient
        </h2>
        <p style={{ textAlign: 'center', fontSize: '14px', color: C.textSecondary, margin: '0 0 32px' }}>
          You can add more patients anytime from the Patients tab
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="patient-form-grid">
          {/* Patient Name */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={label}>Patient Name</label>
            <FocusableInput
              icon={User} placeholder="Kofi Mensah"
              value={patientData.patientName || ''}
              onChange={handleChange('patientName')}
              name="patientName"
            />
            {errors.patientName && <ErrMsg msg={errors.patientName} />}
          </div>

          {/* Patient ID */}
          <div>
            <label style={label}>Patient ID</label>
            <FocusableInput
              icon={Hash} placeholder="GH-2024-001"
              value={patientData.patientId || ''}
              onChange={handleChange('patientId')}
              name="patientId"
            />
            {errors.patientId && <ErrMsg msg={errors.patientId} />}
          </div>

          {/* Diabetes Type */}
          <div>
            <label style={label}>Diabetes Type</label>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              border: `1.5px solid ${focusedSelect ? C.primary : C.greyLight}`,
              borderRadius: '8px', padding: '11px 14px', background: C.white,
              transition: 'border-color 0.2s',
            }}>
              <Heart size={16} color={focusedSelect ? C.primary : C.textSecondary} />
              <select
                value={patientData.diabetesType || ''}
                onChange={handleChange('diabetesType')}
                onFocus={() => setFocusedSelect(true)}
                onBlur={() => setFocusedSelect(false)}
                style={{
                  flex: 1, border: 'none', outline: 'none',
                  fontSize: '15px', color: C.textPrimary,
                  background: 'transparent', cursor: 'pointer',
                  fontFamily: 'Inter, -apple-system, sans-serif',
                }}
              >
                <option value="">Select type</option>
                <option value="type1">Type 1</option>
                <option value="type2">Type 2</option>
                <option value="gestational">Gestational</option>
                <option value="prediabetes">Pre-diabetes</option>
              </select>
            </div>
            {errors.diabetesType && <ErrMsg msg={errors.diabetesType} />}
          </div>

          {/* Contact Number */}
          <div>
            <label style={label}>Contact Number</label>
            <FocusableInput
              icon={Phone} placeholder="+233 20 000 0000"
              value={patientData.contactNumber || ''}
              onChange={handleChange('contactNumber')}
              name="contactNumber"
              type="tel"
            />
          </div>

          {/* Emergency Contact */}
          <div>
            <label style={label}>Emergency Contact</label>
            <FocusableInput
              icon={Shield} placeholder="+233 20 000 0001"
              value={patientData.emergencyContact || ''}
              onChange={handleChange('emergencyContact')}
              name="emergencyContact"
              type="tel"
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '32px' }}>
          <button onClick={onBack} style={btnGhost}><ChevronLeft size={16} /> Back</button>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button onClick={onSkip} style={{ ...btnGhost, fontSize: '13px' }}>
              Skip for now
            </button>
            <button
              onClick={handleNext}
              disabled={isSubmitting}
              style={{ ...btnPrimary, opacity: isSubmitting ? 0.75 : 1 }}
              onMouseOver={e => { if (!isSubmitting) e.currentTarget.style.opacity = '0.9'; }}
              onMouseOut={e => { if (!isSubmitting) e.currentTarget.style.opacity = '1'; }}
            >
              {isSubmitting ? 'Saving...' : 'Complete Setup'}
              {!isSubmitting && <Check size={16} />}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 520px) {
          .patient-form-grid { grid-template-columns: 1fr !important; }
          .patient-form-grid > div { grid-column: auto !important; }
        }
      `}</style>
    </StepCard>
  );
};

const ErrMsg = ({ msg }) => (
  <p style={{ margin: '4px 0 0', fontSize: '12px', color: C.critical, display: 'flex', alignItems: 'center', gap: '4px' }}>
    <AlertCircle size={12} /> {msg}
  </p>
);

// ─────────────────────────────────────────────
// Completion Page
// ─────────────────────────────────────────────
const CompletionPage = ({ onGoToDashboard }) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setShowConfetti(true);
  }, []);

  const tips = [
    { icon: Bell, text: 'Check alerts daily to stay on top of patient status', color: C.warning },
    { icon: TrendingUp, text: 'Review patient trends weekly to track progress', color: C.primary },
    { icon: FileText, text: 'Export PDF reports for patient appointments', color: '#8B5CF6' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: C.bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      fontFamily: 'Inter, -apple-system, sans-serif',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Confetti dots (CSS animation) */}
      {showConfetti && <ConfettiLayer />}

      <div style={{ ...card, padding: '52px 44px', maxWidth: '480px', width: '100%', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        {/* Animated checkmark */}
        <div style={{
          width: '80px', height: '80px',
          borderRadius: '50%',
          background: C.successBg,
          border: `3px solid ${C.success}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 28px',
          animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        }}>
          <CheckCircle2 size={44} color={C.success} />
        </div>

        <h1 style={{ fontSize: '32px', fontWeight: '800', color: C.textPrimary, margin: '0 0 10px' }}>
          You're All Set!
        </h1>
        <p style={{ fontSize: '16px', color: C.textSecondary, margin: '0 0 36px', lineHeight: '1.6' }}>
          Your dashboard is ready. Start monitoring your patients in real-time now.
        </p>

        {/* Quick tips */}
        <div style={{
          background: C.bg,
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '32px',
          textAlign: 'left',
        }}>
          <p style={{ fontSize: '13px', fontWeight: '700', color: C.textPrimary, margin: '0 0 14px', textAlign: 'center' }}>
            Quick Tips
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {tips.map(({ icon: Icon, text, color }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: `${color}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icon size={16} color={color} />
                </div>
                <span style={{ fontSize: '13px', color: C.textPrimary, lineHeight: '1.4' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onGoToDashboard}
          style={{ ...btnPrimary, justifyContent: 'center', width: '100%', padding: '15px', fontSize: '16px' }}
          onMouseOver={e => e.currentTarget.style.opacity = '0.9'}
          onMouseOut={e => e.currentTarget.style.opacity = '1'}
        >
          Go to Dashboard <ArrowRight size={18} />
        </button>
      </div>

      <style>{`
        @keyframes popIn {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        @keyframes floatUp {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(-100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

// Simple CSS confetti
const CONFETTI_COLORS = [C.primary, C.success, C.warning, C.critical, '#8B5CF6', C.primaryLight];
const ConfettiLayer = () => (
  <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
    {Array.from({ length: 30 }, (_, i) => (
      <div key={i} style={{
        position: 'absolute',
        left: `${Math.random() * 100}%`,
        top: `${80 + Math.random() * 20}%`,
        width: `${6 + Math.random() * 8}px`,
        height: `${6 + Math.random() * 8}px`,
        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
        background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        animation: `floatUp ${2 + Math.random() * 3}s ease-out ${Math.random() * 0.5}s forwards`,
        opacity: 0.8,
      }} />
    ))}
  </div>
);

// ─────────────────────────────────────────────
// LocalStorage helpers
// ─────────────────────────────────────────────
const STORAGE_KEYS = {
  completed: 'glucoseguard_onboarding_completed',
  step: 'glucoseguard_onboarding_step',
  formData: 'glucoseguard_onboarding_form',
};

export const isOnboardingComplete = () =>
  localStorage.getItem(STORAGE_KEYS.completed) === 'true';

const markComplete = () => {
  localStorage.setItem(STORAGE_KEYS.completed, 'true');
  localStorage.removeItem(STORAGE_KEYS.step);
  localStorage.removeItem(STORAGE_KEYS.formData);
};

const saveProgress = (step, formData) => {
  localStorage.setItem(STORAGE_KEYS.step, String(step));
  localStorage.setItem(STORAGE_KEYS.formData, JSON.stringify(formData));
};

// ─────────────────────────────────────────────
// Main Orchestrator
// ─────────────────────────────────────────────
const STEPS = ['welcome', 'account', 'tour', 'alerts', 'patient', 'complete'];

const OnboardingFlow = () => {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.step);
    return saved ? parseInt(saved, 10) : 0;
  });

  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.formData);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [patientData, setPatientData] = useState({});

  // Persist progress on every step/formData change
  useEffect(() => {
    if (currentStep > 0 && currentStep < STEPS.length - 1) {
      saveProgress(currentStep, formData);
    }
  }, [currentStep, formData]);

  const goNext = useCallback(() => {
    setCurrentStep(s => Math.min(s + 1, STEPS.length - 1));
  }, []);

  const goBack = useCallback(() => {
    setCurrentStep(s => Math.max(s - 1, 0));
  }, []);

  const handleSkip = useCallback(() => {
    markComplete();
    navigate('/', { replace: true });
  }, [navigate]);

  const handleComplete = useCallback(() => {
    markComplete();
    setCurrentStep(STEPS.length - 1); // show completion page
  }, []);

  const handleGoToDashboard = useCallback(() => {
    navigate('/', { replace: true });
  }, [navigate]);

  // Wrap each step in a fade transition
  const stepProps = { onBack: goBack, onSkip: handleSkip };

  return (
    <div style={{ animation: 'fadeStep 0.3s ease-in-out' }}>
      <style>{`
        @keyframes fadeStep {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {currentStep === 0 && (
        <WelcomePage onStart={goNext} onSkip={handleSkip} />
      )}
      {currentStep === 1 && (
        <Step1AccountSetup
          {...stepProps}
          onNext={goNext}
          formData={formData}
          setFormData={setFormData}
        />
      )}
      {currentStep === 2 && (
        <Step2DashboardTour {...stepProps} onNext={goNext} />
      )}
      {currentStep === 3 && (
        <Step3Alerts {...stepProps} onNext={goNext} />
      )}
      {currentStep === 4 && (
        <Step4AddPatient
          {...stepProps}
          onNext={handleComplete}
          patientData={patientData}
          setPatientData={setPatientData}
        />
      )}
      {currentStep === 5 && (
        <CompletionPage onGoToDashboard={handleGoToDashboard} />
      )}
    </div>
  );
};

export default OnboardingFlow;
