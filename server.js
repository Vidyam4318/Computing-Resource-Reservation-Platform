// Import required modules
const express = require('express');
const cors = require('cors');
const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

// Initialize Firebase Admin SDK
initializeApp({
    credential: applicationDefault(),
    databaseURL: 'https://fir-project-605f6.firebaseio.com', // Your Firebase database URL
});

const app = express();
const port = 5000;

// Enable CORS for your frontend (React app)
const corsOptions = {
    origin: 'http://localhost:3000', // Make sure this matches your frontend URL
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};
app.use(cors(corsOptions));

// Middleware to parse JSON request bodies
app.use(express.json());

// Google login endpoint for verifying the token
app.post('/google-login', async (req, res) => {
    const { idToken } = req.body; // Get the ID token sent by the frontend
    try {
        // Verify the ID token using Firebase Admin SDK
        const decodedToken = await getAuth().verifyIdToken(idToken);
        const uid = decodedToken.uid;
        console.log('User authenticated with UID:', uid);

        // Send a success response back to the frontend
        res.status(200).send({ message: 'User authenticated', uid });
    } catch (error) {
        console.error('Error verifying ID token:', error);
        res.status(401).send({ error: 'Invalid Google ID token' });
    }
});

// Sample route to check if the server is working
app.get('/', (req, res) => {
    res.send('Server is running!');
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
