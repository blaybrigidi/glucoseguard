import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('');
            setLoading(true);
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError('Failed to sign in. Please check your credentials.');
            console.error(err);
        }
        setLoading(false);
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.logoContainer}>
                    <div style={styles.logoIcon}>+</div>
                    <h2 style={styles.title}>DialLog</h2>
                </div>

                {error && <div style={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={styles.input}
                            placeholder="Enter your email"
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={styles.input}
                            placeholder="Enter your password"
                        />
                    </div>
                    <button disabled={loading} type="submit" style={styles.button}>
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <div style={styles.footer}>
                    Need an account? <Link to="/register" style={styles.link}>Register now</Link>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F0F4F8',
        fontFamily: "'Inter', sans-serif",
    },
    card: {
        backgroundColor: '#FFFFFF',
        padding: '3rem',
        borderRadius: '16px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)',
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center',
    },
    logoContainer: {
        marginBottom: '2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px'
    },
    logoIcon: {
        width: '48px',
        height: '48px',
        backgroundColor: 'var(--color-primary)',
        color: 'white',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '2rem',
        fontWeight: 'bold',
    },
    title: {
        color: 'var(--color-primary)',
        fontSize: '1.5rem',
        fontWeight: 'bold',
        margin: 0
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    },
    inputGroup: {
        textAlign: 'left',
    },
    label: {
        display: 'block',
        marginBottom: '0.5rem',
        fontSize: '0.9rem',
        color: '#555',
        fontWeight: '500'
    },
    input: {
        width: '100%',
        padding: '12px',
        borderRadius: '8px',
        border: '1px solid #ddd',
        fontSize: '1rem',
        outline: 'none',
        transition: 'border-color 0.2s',
        boxSizing: 'border-box' // Fixes padding width issue
    },
    button: {
        width: '100%',
        padding: '12px',
        backgroundColor: 'var(--color-primary)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
        marginTop: '0.5rem',
        transition: 'background-color 0.2s'
    },
    footer: {
        marginTop: '2rem',
        fontSize: '0.9rem',
        color: '#666'
    },
    link: {
        color: 'var(--color-primary)',
        textDecoration: 'none',
        fontWeight: '600'
    },
    error: {
        backgroundColor: '#FCE8E6',
        color: '#D93025',
        padding: '10px',
        borderRadius: '6px',
        marginBottom: '1rem',
        fontSize: '0.9rem'
    }
};

export default Login;
