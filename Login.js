import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google'; // For Google Login
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import './Login.css';
import linkedinLogo from './assets/linkedin-logo.jpg'; // Corrected syntax

// Initialize Firebase with your config (this is from your Firebase Console)
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
    apiKey: "AIzaSyCqImlWVCgBzm9NmWLO_PTX0a-XLAe-efQ",
    authDomain: "fir-project-605f6.firebaseapp.com",
    projectId: "fir-project-605f6",
    storageBucket: "fir-project-605f6.firebasestorage.app",
    messagingSenderId: "574304064991",
    appId: "1:574304064991:web:1e14e123c2e6084daba06a",
    measurementId: "G-J6JEL1V6BF"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();
    const auth = getAuth();
    const googleProvider = new GoogleAuthProvider();

    // Handle email/password login
    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            setSuccessMessage('Login successful!');
            setTimeout(() => {
                if (email === 'admin@example.com') {
                    navigate('/admin/dashboard'); // Navigate to Admin Dashboard if admin
                } else {
                    navigate('/AutoInstallation'); // Navigate to AutoInstallation for other users
                }
            }, 1500);
        } catch (error) {
            setErrorMessage('Login failed. Please try again.');
        }
    };

    // Toggle password visibility
    const togglePasswordVisibility = () => {
        setShowPassword((prevShowPassword) => !prevShowPassword);
    };

    // Handle Google login success
    const handleGoogleSuccess = async (response) => {
        try {
            const credential = GoogleAuthProvider.credential(response.credential); // Create Google credential
            const userCredential = await signInWithCredential(auth, credential); // Sign in using the credential
            if (userCredential) {
                if (userCredential.user.email === 'admin@example.com') {
                    navigate('/admin/dashboard'); // Redirect to admin dashboard
                } else {
                    navigate('/AutoInstallation'); // Redirect to AutoInstallation for other users
                }
            }
        } catch (error) {
            console.error("Google login failed:", error);
            setErrorMessage('Google login failed. Please try again.');
        }
    };

    // Handle Google login failure
    const handleGoogleFailure = (error) => {
        console.error("Google login failed: ", error);
        setErrorMessage('Google login failed. Please try again.');
    };

    // Handle LinkedIn login
    const handleLinkedInLogin = () => {
        const clientId = "86xul1q9z5qlog";
        const redirectUri = "http://localhost:3000/linkedin/callback";
        const scope = "r_liteprofile%20r_emailaddress";
        const url = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
        window.location.href = url;
    };

    return (
        <div className="login-container">
            <div className="left-section">
                <div className="text-overlay">
                    <p>
                        Param Supercomputing provided through this platform are mainly meant for academic teaching
                        and learning purposes for undergraduate students. HPC Virtual Lab Access is intended
                        to respond to those academic institutes or enthusiasts who do not have access to HPC resources
                        and are teaching parallel programming in their respective courses. This virtual lab facility
                        will assist their teaching with a practical learning environment.
                    </p>
                </div>
            </div>
            <div className="right-section">
                <div className="login-form">
                    <h2>Login</h2>
                    <form onSubmit={handleLogin}>
                        <div>
                            <label>Email:</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label>Password:</label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button type="button" onClick={togglePasswordVisibility}>
                                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                            </button>
                        </div>
                        <button type="submit">Login</button>
                    </form>
                    {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
                    {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

                    <p><a href="#" onClick={() => navigate('/forgot-password')}>Forgot Password?</a></p>
                    <p>Don't have an account? <a href="/register">Register here</a></p>

                    <button type="button" className="linkedin-button" onClick={handleLinkedInLogin}>
                        <img src={linkedinLogo} alt="LinkedIn Logo" style={{ width: '24px', height: '24px', marginRight: '8px' }} />
                        Login with LinkedIn
                    </button>

                    <div className="google-login">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleFailure}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
