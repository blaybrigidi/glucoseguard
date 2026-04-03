import React, { useState, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { AlertsProvider } from './context/AlertsContext';
import RequireAuth from './components/RequireAuth';
import { AuthPage } from './components/ui/auth-page';
import { RegisterPage } from './components/ui/register-page';
import AlertMonitor from './components/AlertMonitor';
import { Toaster } from 'sonner';
import OnboardingFlow, { isOnboardingComplete } from './components/onboarding/OnboardingFlow';
import LandingPage from './components/LandingPage';

// Lazy Load Components
const Sidebar = React.lazy(() => import('./components/Sidebar'));
const Dashboard = React.lazy(() => import('./components/Dashboard'));
const PatientDetail = React.lazy(() => import('./components/PatientDetail'));
const Patients = React.lazy(() => import('./components/Patients'));
const Settings = React.lazy(() => import('./components/Settings').then(module => ({ default: module.Settings })));
const AlertsManagement = React.lazy(() => import('./components/AlertsManagement'));
const Analytics = React.lazy(() => import('./components/Analytics'));

import './styles/variables.css';

// Loading Fallback
const PageLoader = () => (
  <div className="flex items-center justify-center h-full w-full min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);
// Redirects to /onboarding if the user hasn't completed it yet
const OnboardingGuard = ({ children }) => {
  const navigate = useNavigate();
  useEffect(() => {
    if (!isOnboardingComplete()) {
      navigate('/onboarding', { replace: true });
    }
  }, [navigate]);
  return isOnboardingComplete() ? children : null;
};

const MainApp = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [viewParams, setViewParams] = useState({});

  const handleNavigate = (view, patientId = null, params = {}) => {
    setCurrentView(view);
    if (patientId) setSelectedPatientId(patientId);
    setViewParams(params);
  };

  return (
    <div style={{ display: 'flex', width: '100%', minHeight: '100vh' }}>
      <Suspense fallback={<PageLoader />}>
        <Sidebar onNavigate={handleNavigate} currentView={currentView} />
        <div style={{ marginLeft: '280px', flex: 1, width: 'calc(100% - 280px)', minHeight: '100vh' }}>
          {currentView === 'dashboard' ? (
            <Dashboard key="dashboard" onNavigate={handleNavigate} />
          ) : currentView === 'patients' ? (
            <Patients key="patients" onNavigate={handleNavigate} />
          ) : currentView === 'settings' ? (
            <Settings key="settings" />
          ) : currentView === 'alerts' ? (
            <AlertsManagement key="alerts" {...viewParams} />
          ) : currentView === 'analytics' ? (
            <Analytics key="analytics" />
          ) : (
            <PatientDetail
              key="patient-detail"
              onNavigate={handleNavigate}
              patientId={selectedPatientId}
            />
          )}
        </div>
      </Suspense>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AlertsProvider>
        <Router>
          <Toaster position="top-right" />
          <AlertMonitor />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Onboarding (protected — must be logged in) */}
            <Route
              path="/onboarding"
              element={
                <RequireAuth>
                  <OnboardingFlow />
                </RequireAuth>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/*"
              element={
                <RequireAuth>
                  <OnboardingGuard>
                    <MainApp />
                  </OnboardingGuard>
                </RequireAuth>
              }
            />
          </Routes>
        </Router>
      </AlertsProvider>
    </AuthProvider>
  );
}

export default App;

