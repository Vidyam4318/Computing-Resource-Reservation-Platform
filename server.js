const express = require("express");
const mongoose = require("mongoose");
const admin = require("./firebaseAdmin");
const nodemailer = require("nodemailer");
const UserModel = require("./users");
const cors = require("cors");

const app = express();

// Enable CORS
app.use(cors());
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

// Configure Nodemailer
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "v5071634@gmail.com", // Replace with your email
        pass: "hnon nhuo yiuu qhha", // Replace with your App Password
    },
});

// Sync Firebase Users to MongoDB and Disable Accounts After 10 Days
async function syncFirebaseUsersToDB() {
    try {
        const listUsersResult = await admin.auth().listUsers(1000);
        const now = new Date();

        for (const user of listUsersResult.users) {
            const createdAt = new Date(user.metadata.creationTime);
            const daysSinceCreation = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
            const disabled = daysSinceCreation > 10;

            const userData = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                emailVerified: user.emailVerified,
                createdAt,
                disabled,
            };

            await UserModel.updateOne({ uid: user.uid }, { $set: userData }, { upsert: true });

            // Sync with Firebase
            if (disabled !== user.disabled) {
                await admin.auth().updateUser(user.uid, { disabled });
            }
        }

        console.log("Firebase users synchronized with MongoDB and account age checked.");
    } catch (error) {
        console.error("Error syncing users:", error);
    }
}

// Password Reset Endpoint
app.post("/users/:uid/reset-password", async (req, res) => {
    const { uid } = req.params;

    try {
        const user = await admin.auth().getUser(uid);
        if (!user.email) {
            return res.status(400).send("User does not have an email associated.");
        }

        const resetLink = await admin.auth().generatePasswordResetLink(user.email);

        const mailOptions = {
            from: "v5071634@gmail.com",
            to: user.email,
            subject: "Password Reset Request",
            html: `
                <h2>Password Reset</h2>
                <p>Click the link below to reset your password:</p>
                <a href="${resetLink}" target="_blank">Reset Password</a>
            `,
        };

        await transporter.sendMail(mailOptions);
        res.status(200).send("Password reset email sent successfully.");
    } catch (error) {
        res.status(500).send("Error resetting password: " + error.message);
    }
});

// Update user account status
app.patch("/users/:uid/status", async (req, res) => {
    const { uid } = req.params;
    const { disabled } = req.body;

    try {
        await admin.auth().updateUser(uid, { disabled });
        await UserModel.updateOne({ uid }, { $set: { disabled } });

        res.status(200).send(`User ${uid} ${disabled ? "disabled" : "enabled"} successfully.`);
    } catch (error) {
        res.status(500).send("Error updating user status: " + error.message);
    }
});

// Get users
app.get("/users", async (req, res) => {
    try {
        const users = await UserModel.find({}, { email: 1, uid: 1, createdAt: 1, disabled: 1 });
        res.json(users);
    } catch (error) {
        res.status(500).send("Error fetching users: " + error.message);
    }
});

// Sync Firebase users on server start
syncFirebaseUsersToDB();

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
