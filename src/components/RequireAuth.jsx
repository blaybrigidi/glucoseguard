import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RequireAuth = ({ children }) => {
    const { currentUser, userRole, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div>Loading...</div>; // Or better loader
    }

    if (!currentUser) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (userRole === 'patient') {
        // Explicitly block patients created by the mobile app from accessing the doctor web portal
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-10 text-center bg-gray-50">
                <h2 className="text-2xl font-bold text-red-600 mb-4">Unauthorized Access</h2>
                <p className="text-gray-700 max-w-md">
                    This portal is restricted to medical professionals. Patients must log in using the mobile application.
                </p>
                <button
                    onClick={() => {
                        useAuth().logout(); // Optional but helps UX to clear their session
                        window.location.href = '/login';
                    }}
                    className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Return to Login
                </button>
            </div>
        );
    }

    if (userRole !== 'doctor' && userRole !== null) {
        console.warn(`User ${currentUser.email} has role: ${userRole}. Expected 'doctor'.`);
    }

    return children;
};

export default RequireAuth;
