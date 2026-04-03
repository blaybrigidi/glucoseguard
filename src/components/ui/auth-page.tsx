'use client';

import React from 'react';
import { Button } from './button';
import {
    AtSign,
    ChevronLeft,
    LayoutGrid
} from 'lucide-react';
// import { Input } from './input'; // Can reuse the one we made, but the code in prompt used it inside form
import { Input } from './input';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export function AuthPage() {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            setLoading(true);
            await login(email, password);
            navigate('/app');
        } catch (error: any) {
            const code = error?.code || '';
            if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
                setError('Incorrect email or password.');
            } else if (code === 'auth/too-many-requests') {
                setError('Too many attempts. Please wait a moment and try again.');
            } else if (code === 'auth/invalid-email') {
                setError('Please enter a valid email address.');
            } else {
                setError(error.message || 'Sign in failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                <Button variant="ghost" className="mb-6 -ml-4" asChild>
                    <Link to="/">
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Back to Home
                    </Link>
                </Button>

                <div className="flex flex-col items-center mb-8">
                    <div className="flex items-center gap-2 mb-4 text-primary">
                        <LayoutGrid className="w-8 h-8" />
                        <span className="text-2xl font-bold tracking-tight text-gray-900">GlucoseGuard</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Sign In</h1>
                    <p className="text-gray-500 text-sm mt-1">Access your clinician dashboard</p>
                </div>

                {error && (
                    <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                        {error}
                    </div>
                )}

                <form className="space-y-4" onSubmit={handleLogin}>
                    <div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <AtSign className="w-5 h-5" />
                            </div>
                            <Input
                                placeholder="Email address"
                                className="pl-10 py-6 bg-gray-50 border-gray-200 focus:bg-white text-base"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <LayoutGrid className="w-5 h-5" />
                            </div>
                            <Input
                                placeholder="Password"
                                className="pl-10 py-6 bg-gray-50 border-gray-200 focus:bg-white text-base"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <Button type="submit" className="w-full bg-primary hover:bg-blue-700 text-white py-6 text-base font-semibold mt-2 shadow-md transition-all" disabled={loading}>
                        {loading ? "Signing In..." : "Sign In"}
                    </Button>
                </form>

                <p className="text-center text-gray-500 mt-8 text-sm">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-primary font-semibold hover:underline">
                        Register
                    </Link>
                </p>
            </div>
        </main>
    );
}



const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        {...props}
    >
        <g>
            <path d="M12.479,14.265v-3.279h11.049c0.108,0.571,0.164,1.247,0.164,1.979c0,2.46-0.672,5.502-2.84,7.669   C18.744,22.829,16.051,24,12.483,24C5.869,24,0.308,18.613,0.308,12S5.869,0,12.483,0c3.659,0,6.265,1.436,8.223,3.307L18.392,5.62   c-1.404-1.317-3.307-2.341-5.913-2.341C7.65,3.279,3.873,7.171,3.873,12s3.777,8.721,8.606,8.721c3.132,0,4.916-1.258,6.059-2.401   c0.927-0.927,1.537-2.251,1.777-4.059L12.479,14.265z" />
        </g>
    </svg>
);

const AuthSeparator = () => {
    return (
        <div className="flex w-full items-center justify-center">
            <div className="bg-border h-px w-full" />
            <span className="text-muted-foreground px-2 text-xs">OR</span>
            <div className="bg-border h-px w-full" />
        </div>
    );
};
