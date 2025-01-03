import React, { useEffect, useState } from "react";
import "./AdminDashboard.css";

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUsers, setShowUsers] = useState(false); // State to toggle user records

    // Fetch all users when the component loads
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch("http://localhost:5000/users");
                const data = await response.json();
                setUsers(data);
            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    // Function to handle enabling/disabling the account and sending renewal email
    const handleAccountStatus = async (uid, disabled) => {
        try {
            const response = await fetch(`http://localhost:5000/users/${uid}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ disabled }),
            });

            if (response.ok) {
                setUsers((prev) =>
                    prev.map((user) =>
                        user.uid === uid ? { ...user, disabled } : user
                    )
                );

                alert(`User ${uid} has been ${disabled ? "disabled" : "enabled"} successfully.`);
            } else {
                alert("Failed to update account status.");
            }
        } catch (error) {
            alert("Error updating account status: " + error.message);
        }
    };

    // Handle reset password request
    const handleResetPassword = async (uid) => {
        try {
            const response = await fetch(`http://localhost:5000/users/${uid}/reset-password`, {
                method: "POST",
            });

            if (response.ok) {
                alert("Password reset email sent successfully!");
            } else {
                alert("Error sending reset password email.");
            }
        } catch (error) {
            alert("Error sending reset password email: " + error.message);
        }
    };

    if (loading) return <div>Loading users...</div>;

    return (
        <div>
            <h1>Admin Dashboard</h1>

            {/* Button to toggle user records */}
            <button onClick={() => setShowUsers(!showUsers)}>
                {showUsers ? "User Management Records" : "Show User Records"}
            </button>

            {/* Conditionally render user records */}
            {showUsers && (
                <table border="1">
                    <thead>
                        <tr>
                            <th>UID</th>
                            <th>Email</th>
                            <th>Created At</th>
                            <th>Status</th>
                            <th>Toggle Status</th>
                            <th>Reset Password</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.uid}>
                                <td>{user.uid}</td>
                                <td>{user.email}</td>
                                <td>{new Date(user.createdAt).toLocaleString()}</td>
                                <td>{user.disabled ? "Disabled" : "Enabled"}</td>
                                <td>
                                    <button
                                        onClick={() => handleAccountStatus(user.uid, !user.disabled)}
                                    >
                                        {user.disabled ? "Enable" : "Disable"}
                                    </button>
                                </td>
                                <td>
                                    <button onClick={() => handleResetPassword(user.uid)}>
                                        Reset Password
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default AdminDashboard;
