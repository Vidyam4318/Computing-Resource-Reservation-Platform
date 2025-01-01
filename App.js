import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebaseConfig';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Component imports
import Overview from './Overview';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import Header from './Header';
import Footer from './Footer';
import Hero from './Hero';
import FAQs from './FAQs';
import Termsandcondition from './Termsandcondition';
import Login from './Login';
import AutoInstallationPage from './AutoInstallationPage';
import OrderPage from './OrderPage';
import Categories from './Categories';
import Features from './Features';
import ShortTerm from './ShortTerm';
import LongTerm from './LongTerm';
import ForgotPassword from './ForgotPassword';
import CartPage from './CartPage';
import Help from './Help';
import LinkedInCallback from './LinkedInCallback';
import Registration from './Registration';
import AccountRenewal from "./AccountRenewal";

// Google OAuth Client ID
const clientId = "652020141620-gcakic12f28m138ucqilbegb16i1583n.apps.googleusercontent.com";

const App = () => {
    const [cart, setCart] = useState([]);
    const [responseId, setResponseId] = useState("");
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isRestricted, setIsRestricted] = useState(false);
    const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
                fetchUserRole(user);
                checkUserRestriction(user);
            } else {
                setUser(null);
                setRole(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const fetchUserRole = async (user) => {
        try {
            const idToken = await user.getIdToken();
            const response = await fetch('/get-user-role', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${idToken}`,
                },
                body: JSON.stringify({ email: user.email }),
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            if (data.role) {
                setRole(data.role);
            } else {
                console.error('Role not found in response');
                setRole(null);
            }
        } catch (error) {
            console.error('Error fetching user role:', error);
            setRole(null);
        }
    };

    const checkUserRestriction = (user) => {
        const loginTime = localStorage.getItem('firstLoginTime');
        if (loginTime) {
            const daysSinceLogin = (new Date() - new Date(loginTime)) / (1000 * 3600 * 24);
            if (daysSinceLogin < 10) {
                setIsRestricted(true);
            } else {
                setIsRestricted(false);
            }
        } else {
            localStorage.setItem('firstLoginTime', new Date());
            setIsRestricted(false);
        }
    };

    const handleAdminLogin = () => {
        setIsAdminLoggedIn(true);
    };

    const handleAdminLogout = () => {
        setIsAdminLoggedIn(false);
    };

    const ProtectedRoute = ({ element }) => {
        if (loading) return null;
        return role === 'admin' ? element : <Navigate to="/order" />;
    };

    const UserProtectedRoute = ({ element }) => {
        if (loading) return null;
        return user ? element : <Navigate to="/login" />;
    };

    const AdminRoute = ({ element }) => {
        if (loading) return null;
        return user?.email === 'admin@example.com' ? element : <Navigate to="/AutoInstallation" />;
    };

    const addItemToCart = (item) => {
        setCart((prevCart) => [...prevCart, item]);
        alert('Item added to cart!');
    };

    const handleRemoveItem = (index) => {
        setCart((prevCart) => prevCart.filter((_, i) => i !== index));
    };

    const handlePaymentSuccess = (id) => {
        setResponseId(id);
    };

    const UserRestrictedRoute = ({ element }) => {
        if (loading) return null;
        if (isRestricted) {
            alert("You are restricted from accessing this feature for 10 days after your first login.");
            return <Navigate to="/order" />;
        }
        return element;
    };

    return (
        <GoogleOAuthProvider clientId={clientId}>
            <Router>
                <Header />
                <div className="content-container">
                    {isAdminLoggedIn ? (
                        <div>
                            <AdminDashboard />
                            <button onClick={handleAdminLogout}>Logout</button>
                        </div>
                    ) : (
                        <Routes>
                            <Route path="/" element={<Hero />} />
                            <Route path="/overview" element={<Overview />} />
                            <Route path="/categories" element={<Categories />} />
                            <Route path="/features" element={<Features />} />
                            <Route path="/faqs" element={<FAQs />} />
                            <Route path="/terms" element={<Termsandcondition />} />
                            <Route path="/help" element={<Help />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/AutoInstallation" element={<AutoInstallationPage />} />
                            <Route path="/register" element={<Registration />} />
                            <Route path="/short-term" element={<ShortTerm />} />
                            <Route path="/long-term" element={<LongTerm />} />
                            <Route path="/forgot-password" element={<ForgotPassword />} />
                            <Route path="/linkedIn/callback" element={<LinkedInCallback />} />
                            <Route path="/order" element={<OrderPage onAddToCart={addItemToCart} />} />
                            <Route path="/cart" element={<CartPage cart={cart} onRemoveItem={handleRemoveItem} />} />
                            <Route path="/admin/login" element={<AdminLogin onLogin={handleAdminLogin} />} />
                            <Route path="/admin/dashboard" element={<AdminRoute element={<AdminDashboard />} />} />
                            <Route path="/orderPage" element={<UserProtectedRoute element={<OrderPage onAddToCart={addItemToCart} />} />} />
                            <Route path="*" element={<Navigate to="/" />} />
                            <Route path="/renew-account" element={<AccountRenewal />} />
                        </Routes>
                    )}
                    {responseId && <p>Payment ID: {responseId}</p>}
                </div>
                <Footer />
            </Router>
        </GoogleOAuthProvider>
    );
};

export default App;
