import React, { useEffect, useRef, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Toaster, toast } from 'sonner';

const AlertMonitor = () => {
    const { currentUser } = useAuth();
    const [knownAlertIds, setKnownAlertIds] = useState(new Set());
    const audioContextRef = useRef(null);
    const audioInitialized = useRef(false);

    // Initialize AudioContext (must be essentially ready, but browsers block auto-play until interaction)
    // We'll handle the "resume" on first interaction if needed, or just try to play.
    const playAlertSound = () => {
        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            }

            const ctx = audioContextRef.current;

            // Simple beep sequence: High-Low-High
            const t = ctx.currentTime;

            const osc1 = ctx.createOscillator();
            const gain1 = ctx.createGain();
            osc1.connect(gain1);
            gain1.connect(ctx.destination);

            osc1.frequency.setValueAtTime(880, t); // A5
            osc1.frequency.setValueAtTime(440, t + 0.2); // A4
            osc1.frequency.setValueAtTime(880, t + 0.4); // A5

            gain1.gain.setValueAtTime(0.1, t);
            gain1.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);

            osc1.start(t);
            osc1.stop(t + 0.6);

        } catch (e) {
            console.error("Audio playback failed:", e);
        }
    };

    useEffect(() => {
        if (!currentUser) return;

        // Poll for alerts every 30 seconds
        const checkAlerts = async () => {
            try {
                // We fetch ALL alerts. In a real app with pagination, this might be just "latest".
                // Assuming api.getAlerts returns a list of recent alerts.
                const alerts = await api.getAlerts();

                let hasNewCritical = false;
                const currentIds = new Set(knownAlertIds);

                alerts.forEach(alert => {
                    // Check if critical and not seen before
                    // Note: 'alert.id' or however the backend returns keys
                    const id = alert.id || `${alert.patientId}_${alert.timestamp}`;

                    if (!currentIds.has(id)) {
                        // It's a new alert (to this session)
                        // Only add to known set
                        currentIds.add(id);

                        // If it's critical AND not just "initial load" (we might want to skip sound on first page load)
                        // But for safety, let's alert if it's recent (e.g., last 5 mins)
                        const isRecent = (Date.now() - new Date(alert.timestamp).getTime()) < 5 * 60 * 1000;

                        if (alert.severity === 'critical' && isRecent) {
                            hasNewCritical = true;
                            // Show toast
                            toast.error(`CRITICAL ALERT: ${alert.patientName || 'Unknown Patient'}`, {
                                description: alert.message,
                                duration: 10000,
                            });
                        }
                    }
                });

                if (hasNewCritical) {
                    playAlertSound();
                }

                setKnownAlertIds(currentIds);

            } catch (error) {
                console.error("Error checking alerts:", error);
            }
        };

        // Initial check immediately
        checkAlerts();

        const interval = setInterval(checkAlerts, 30000); // 30s polling
        return () => clearInterval(interval);
    }, [currentUser, knownAlertIds]); // dependency on knownAlertIds ensures we update our set

    // Ensure Toaster is present in App structure (it usually is in Layout, but we can add one here if needed)
    return null; // This component renders nothing visual (except maybe the Toaster if we included it)
};

export default AlertMonitor;
