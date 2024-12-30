const express = require("express");
const mongoose = require("mongoose");
const admin = require("./firebaseAdmin"); // Import Firebase Admin SDK

const app = express();
app.use(express.json());

// MongoDB connection string
const mongoURI = "mongodb://localhost:27017/authentication";

// Connect to MongoDB
mongoose
    .connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("Connected to MongoDB"))
    .catch((error) => console.error("MongoDB connection error:", error));

// Define Mongoose Schema and Model
const UserSchema = new mongoose.Schema({
    uid: String,
    email: String,
    displayName: String,
    photoURL: String,
    emailVerified: Boolean,
    createdAt: Date,
});
const UserModel = mongoose.model("User", UserSchema);

// Function to fetch Firebase users and save emails to MongoDB
async function syncFirebaseUsersToDB() {
    try {
        const listUsersResult = await admin.auth().listUsers(1000); // Fetch all Firebase users
        const users = listUsersResult.users.map((user) => ({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified,
            createdAt: new Date(user.metadata.creationTime),
        }));

        // Save or update users in MongoDB
        for (const user of users) {
            await UserModel.updateOne(
                { uid: user.uid },
                { $set: user },
                { upsert: true }
            );
        }
        console.log("Firebase users synchronized with MongoDB");
    } catch (error) {
        console.error("Error syncing users:", error);
    }
}

// API Endpoint: Get all users from MongoDB
app.get("/users", async (req, res) => {
    try {
        const users = await UserModel.find({}, { email: 1, createdAt: 1, _id: 0 });
        res.json(users);
    } catch (error) {
        res.status(500).send("Error fetching users: " + error.message);
    }
});

// Registration Endpoint (simulating user creation)
app.post("/register", async (req, res) => {
    const { email, password } = req.body;
    try {
        // Register the user with Firebase Authentication
        const userRecord = await admin.auth().createUser({
            email,
            password,
        });

        const user = {
            uid: userRecord.uid,
            email: userRecord.email,
            displayName: userRecord.displayName,
            photoURL: userRecord.photoURL,
            emailVerified: userRecord.emailVerified,
            createdAt: new Date(userRecord.metadata.creationTime),
        };

        // Save the new user data to MongoDB
        await UserModel.create(user);
        console.log("New user created and saved to MongoDB:", user);

        res.status(200).send("User registered successfully!");
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).send("Error registering user: " + error.message);
    }
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    syncFirebaseUsersToDB(); // Sync users on server start
});
