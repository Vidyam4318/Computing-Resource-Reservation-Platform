import { initializeApp, getApps, getApp } from 'firebase/app'; // Ensure the right imports
import { getAuth, onAuthStateChanged } from 'firebase/auth'; // Firebase auth imports
import { useState, useEffect } from 'react'; // For the custom hook

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCqImlWVCgBzm9NmWLO_PTX0a-XLAe-efQ",
    authDomain: "fir-project-605f6.firebaseapp.com",
    projectId: "fir-project-605f6",
    storageBucket: "fir-project-605f6.firebasestorage.app",
    messagingSenderId: "574304064991",
    appId: "1:574304064991:web:1e14e123c2e6084daba06a",
    measurementId: "G-J6JEL1V6BF"
};

// Check if Firebase is already initialized, and initialize it only once
let app;
if (getApps().length === 0) {
    app = initializeApp(firebaseConfig); // Initialize Firebase if no apps are initialized
} else {
    app = getApp(); // If Firebase app is already initialized, use the existing app
}

const auth = getAuth(app); // Get the Firebase Auth instance

// Custom hook to manage authentication state
export const useAuth = () => {
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user); // Set current user on auth state change
        });
        return unsubscribe; // Cleanup the listener on component unmount
    }, []);

    return currentUser; // Return the current user or null
};

// Export the auth instance and useAuth hook
export { auth };
export default app; // Export the default app instance for global use
