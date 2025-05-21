import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Register.css';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mobile, setMobile] = useState('');
    const [university, setUniversity] = useState('');
    const [isStudent, setIsStudent] = useState(false);
    const [hasWorkExp, setHasWorkExp] = useState(false);
    const [company, setCompany] = useState('');
    const [years, setYears] = useState(0);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [flipped, setFlipped] = useState(false);

    const navigate = useNavigate();

    const validatePassword = (password) => password.length >= 6;

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!validatePassword(password)) {
            setError("Password must be at least 6 characters long.");
            return;
        }

        const userData = {
            name,
            email,
            password,
            mobile,
            student: isStudent,
            university: isStudent ? university : '',
            workExp: hasWorkExp,
            companyName: hasWorkExp ? company : '',
            yearsOfExperience: hasWorkExp ? years : 0,
        };

        console.log("User Data Sent to Backend:", userData);

        setLoading(true);

        try {
            const response = await axios.post(`/api/auth/register`, userData);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            localStorage.setItem('token', response.data.token);
            setSuccessMessage('Registration successful! Redirecting to login...');
            setTimeout(() => navigate('/login'), 3000);
        } catch (error) {
            setError(error.response?.data?.msg || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleFlipToLogin = () => {
        setFlipped(true);
        setTimeout(() => {
            navigate('/login');
        }, 300);
    };

    return (
        <div className="auth-container">
            <div className={`auth-card-wrapper ${flipped ? 'flip' : ''}`}>

                {/* Register Card */}
                <div className="auth-card card-front">
                    <h2>Register</h2>
                    <form onSubmit={handleRegister}>
                    <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
                        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        <input type="number" placeholder="Contact" value={mobile} onChange={(e) => setMobile(e.target.value)} required />

                        <div className="dropdown-container">
                            <label>Are you a student?</label>
                            <select onChange={(e) => setIsStudent(e.target.value === 'Yes')} value={isStudent ? 'Yes' : 'No'} required>
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                            </select>
                        </div>

                        {isStudent && (
                            <input type="text" placeholder="University Name" value={university} onChange={(e) => setUniversity(e.target.value)} required />
                        )}

                        <div className="dropdown-container">
                            <label>Have work experience?</label>
                            <select onChange={(e) => setHasWorkExp(e.target.value === 'Yes')} value={hasWorkExp ? 'Yes' : 'No'} required>
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                            </select>
                        </div>

                        {hasWorkExp && (
                            <>
                                <input type="text" placeholder="Company" value={company} onChange={(e) => setCompany(e.target.value)} required />
                                <label>Years of Experience</label><input type="number" placeholder="Years of Experience" value={years} onChange={(e) => setYears(e.target.value)} required />
                            </>
                        )}

                        <button type="submit" className='button' disabled={loading}>Register</button>
                        {loading && <p>Loading...</p>}

                    {error && <p className="error">{error}</p>}
                    {successMessage && <p className="success">{successMessage}</p>}

                    <p>Already have an account? <span className="toggle-link" onClick={handleFlipToLogin}>Login</span></p>
                    </form>
                </div>

            </div>
        </div>
    );
};

export default Register;
