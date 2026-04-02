'use client';

import React, { useState } from 'react';
import { Button } from './button';
import {
    AtSign,
    ChevronLeft,
    LayoutGrid,
    User,
    Phone
} from 'lucide-react';
import { Input } from './input';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export function RegisterPage() {
    const [formData, setFormData] = useState({
        displayName: '',
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const formatPhoneNumber = (phone: string) => {
        // Remove all non-digit characters
        const cleaned = phone.replace(/\D/g, '');
        // If it starts with 1 and is 11 digits, add +
        if (cleaned.length === 11 && cleaned.startsWith('1')) {
            return `+${cleaned}`;
        }
        // If it is 10 digits, add +1
        if (cleaned.length === 10) {
            return `+1${cleaned}`;
        }
        // Otherwise return original (or let backend validation fail if invalid)
        // If user entered + already, it might be fine, but we cleaned it.
        // Let's handle the case where user typed +1...
        if (phone.startsWith('+')) {
            return phone;
        }
        return `+${cleaned}`;
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        try {
            setLoading(true);
            const formattedPhone = formatPhoneNumber(formData.phoneNumber);
            await register(
                formData.email,
                formData.password,
                formData.displayName,
                formattedPhone
            );
            navigate('/');
        } catch (error: any) {
            console.error("Registration failed", error);
            alert("Registration failed: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="relative md:h-screen md:overflow-hidden lg:grid lg:grid-cols-2">
            <div className="bg-primary text-primary-foreground relative hidden h-full flex-col border-r p-10 lg:flex">
                <div className="from-background absolute inset-0 z-10 bg-gradient-to-t to-transparent" />
                <div className="z-10 flex items-center gap-2">
                    <LayoutGrid className="size-6" />
                    <p className="text-xl font-semibold">DialLog</p>
                </div>
                <div className="z-10 mt-auto">
                    <blockquote className="space-y-2">
                        <footer className="font-mono text-sm font-semibold">
                        </footer>
                    </blockquote>
                </div>
            </div>
            <div className="relative flex min-h-screen flex-col justify-center p-4">
                <Button variant="ghost" className="absolute top-7 left-5" asChild>
                    <Link to="/">
                        <ChevronLeft className='size-4 me-2' />
                        Back to Home
                    </Link>
                </Button>
                <div className="mx-auto space-y-4 sm:w-[400px]">
                    <div className="flex items-center gap-2 lg:hidden">
                        <LayoutGrid className="size-6" />
                        <p className="text-xl font-semibold">DialLog</p>
                    </div>
                    <div className="flex flex-col space-y-1">
                        <h1 className="font-heading text-2xl font-bold tracking-wide">
                            Create Account
                        </h1>
                        <p className="text-muted-foreground text-base">
                            Join the DialLog Health Portal
                        </p>
                    </div>

                    <form className="space-y-4" onSubmit={handleRegister}>
                        <div className="relative h-max">
                            <Input
                                placeholder="Full Name"
                                className="peer ps-9"
                                type="text"
                                name="displayName"
                                value={formData.displayName}
                                onChange={handleChange}
                                required
                            />
                            <div className="text-muted-foreground pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                                <User className="size-4" aria-hidden="true" />
                            </div>
                        </div>

                        <div className="relative h-max">
                            <Input
                                placeholder="Phone Number"
                                className="peer ps-9"
                                type="tel"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                required
                            />
                            <div className="text-muted-foreground pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                                <Phone className="size-4" aria-hidden="true" />
                            </div>
                        </div>

                        <div className="relative h-max">
                            <Input
                                placeholder="Email Address"
                                className="peer ps-9"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                            <div className="text-muted-foreground pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                                <AtSign className="size-4" aria-hidden="true" />
                            </div>
                        </div>

                        <div className="relative h-max">
                            <Input
                                placeholder="Password"
                                className="peer ps-9"
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <div className="text-muted-foreground pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                                <LayoutGrid className="size-4" aria-hidden="true" />
                            </div>
                        </div>

                        <div className="relative h-max">
                            <Input
                                placeholder="Confirm Password"
                                className="peer ps-9"
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                            <div className="text-muted-foreground pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                                <LayoutGrid className="size-4" aria-hidden="true" />
                            </div>
                        </div>

                        <Button type="submit" className="w-full bg-slate-600 hover:bg-slate-700 text-white" disabled={loading}>
                            <span>{loading ? "Creating Account..." : "Register"}</span>
                        </Button>
                    </form>
                    <p className="text-muted-foreground mt-8 text-sm">
                        Already have an account?{' '}
                        <Link
                            to="/login"
                            className="hover:text-primary underline underline-offset-4"
                        >
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    );
}
