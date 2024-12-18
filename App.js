import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';

// Firebase import
import { auth } from './firebaseConfig';

// Component imports
import Overview from './Overview';
import Categories from './Categories';
import Features from './Features';
import Login from './Login';
import AutoInstallationPage from './AutoInstallationPage';
import OrderPage from './OrderPage';
import LinkedInCallback from './LinkedInCallback';
import Registration from './Registration';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import Header from './Header';
import Footer from './Footer';
import Hero from './Hero';
import FAQs from './FAQs';
import Termsandcondition from './Termsandcondition';
import ShortTerm from './ShortTerm';
import LongTerm from './LongTerm';
import ForgotPassword from './ForgotPassword';
import CartPage from './CartPage';
import Help from './Help';
// Import GoogleOAuthProvider
import { GoogleOAuthProvider } from '@react-oauth/google';

// Google OAuth Client ID
const clientId = "652020141620-gcakic12f28m138ucqilbegb16i1583n.apps.googleusercontent.com";

const App = () => {
    const [cart, setCart] = useState([]);
    const [responseId, setResponseId] = useState("");
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true); // Add loading state

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
                fetchUserRole(user);
            } else {
                setUser(null);
                setRole(null);
            }
            setLoading(false); // Set loading to false after user state is checked
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
            const data = await response.json();
            if (response.ok && data.role) {
                setRole(data.role);
            } else {
                setRole(null);
            }
        } catch (error) {
            console.error('Error fetching user role:', error);
            setRole(null);
        }
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

    const ProtectedRoute = ({ element }) => {
        if (loading) return null;  // Avoid rendering until role is fetched
        return role === 'admin' ? element : <Navigate to="/order" />;
    };

    const UserProtectedRoute = ({ element }) => {
        if (loading) return null;  // Avoid rendering until user is fetched
        return user ? element : <Navigate to="/login" />;
    };

    const AdminRoute = ({ element }) => {
        if (loading) return null;  // Avoid rendering until user is fetched
        return user?.email === 'admin@example.com' ? element : <Navigate to="/AutoInstallation" />;
    };

    return (
        <GoogleOAuthProvider clientId={clientId}>
            <Router>
                <Header />
                <div className="content-container">
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
                        <Route path="/admin/login" element={<AdminLogin />} />
                        <Route path="/admin/dashboard" element={<AdminRoute element={<AdminDashboard />} />} />
                        <Route path="/OrderPage" element={<UserProtectedRoute element={<OrderPage onAddToCart={addItemToCart} />} />} />
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                    {responseId && <p>Payment ID: {responseId}</p>}
                </div>
                <Footer />
            </Router>
        </GoogleOAuthProvider>
    );
};

export default App;
