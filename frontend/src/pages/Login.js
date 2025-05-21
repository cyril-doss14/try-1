import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [flipped, setFlipped] = useState(false);

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(`/api/auth/login`, {
                email,
                password,
            });

            const { token, user, isFirstLogin } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('userId', user.id);
            localStorage.setItem('userData', JSON.stringify(user));

            console.log('Login Successful', user);
            console.log('isFirstLogin?', isFirstLogin);

            // Delay to allow layout rendering
            setTimeout(() => {
                if (isFirstLogin) {
                    navigate('/post-idea', { replace: true });
                } else {
                    navigate('/feed', { replace: true });
                }
            }, 100);

        } catch (error) {
            setError(error.response?.data?.msg || 'Something went wrong');
            console.error('Login error:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
        }
    };

    const handleFlipToRegister = () => {
        setFlipped(true);
        setTimeout(() => {
            navigate('/register');
        }, 300);
    };

    return (
        <div className="auth-container">
            <div className={`auth-card-wrapper ${flipped ? 'flip' : ''}`}>
                <div className="auth-card card-front">
                    <h2>Login</h2>
                    <form onSubmit={handleLogin}>
                        <input 
                            type="email" 
                            placeholder="Email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                        />
                        <input 
                            type="password" 
                            placeholder="Password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                        />
                        <button type="submit">Login</button>
                        {error && <p className="error">{error}</p>}
                        <p>
                            Don't have an account? 
                            <span className="toggle-link" onClick={handleFlipToRegister}>
                                Register
                            </span>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;