import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    LineElement,
    PointElement,
    LineController,
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import './AdminDashboard.css';

// Register Chart.js components
ChartJS.register(
    LineElement,
    PointElement,
    LineController,
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend
);

const AdminDashboard = () => {
    const [userCount, setUserCount] = useState(0);
    const [logData, setLogData] = useState([]);
    const [adminProfile, setAdminProfile] = useState({});
    const [users, setUsers] = useState([]);
    const [showUsers, setShowUsers] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [filter, setFilter] = useState('All');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const navigate = useNavigate();
    const auth = getAuth();
    const user = auth.currentUser;

    useEffect(() => {
        if (!user || user.email !== 'admin@example.com') {
            navigate('/login');
        } else {
            fetchData();
        }
    }, [user, navigate]);

    const fetchData = () => {
        const loggedInUsers = [
            { email: 'v5071634@gmail.com'},
            { email: 'chethanam562@gmail.com',},
        ];
        setUsers(loggedInUsers);
        setUserCount(loggedInUsers.length);
        setLogData([
            { id: 1, action: 'Login', timestamp: '2024-12-01' },
            { id: 2, action: 'View Page', timestamp: '2024-12-02' },
        ]);
        setAdminProfile({
            name: 'Admin User',
            email: 'admin@example.com',
            role: 'Super Admin',
        });
    };

    const handleLogout = () => {
        auth.signOut();
        navigate('/login');
    };

    const toggleUserList = () => {
        setShowUsers(!showUsers);
    };

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    const addNotification = (message) => {
        setNotifications([...notifications, { id: Date.now(), message }]);
    };

    const logAction = (action) => {
        setAuditLogs([...auditLogs, { action, timestamp: new Date().toISOString() }]);
    };

    const handleGenerateReport = () => {
        logAction('Generated Report');
        addNotification('Report generated successfully!');
        console.log('Report Generated');
    };

    const filterLogs = () => {
        let filteredLogs = logData;

        if (filter !== 'All') {
            filteredLogs = filteredLogs.filter(log => log.action === filter);
        }

        if (startDate && endDate) {
            filteredLogs = filteredLogs.filter(log =>
                new Date(log.timestamp) >= new Date(startDate) &&
                new Date(log.timestamp) <= new Date(endDate)
            );
        }

        return filteredLogs;
    };

    const chartData = {
        labels: logData.map((log) => log.timestamp), // x-axis labels
        datasets: [
            {
                label: 'Activity Log',
                data: logData.map((log) => log.id), // y-axis values
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.4, // Optional: adds curve to line
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'User Activity Trends',
            },
        },
        scales: {
            x: {
                type: 'category', // Use registered scale
                title: {
                    display: true,
                    text: 'Date',
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Activity Count',
                },
            },
        },
    };

    return (
        <div className={`admin-dashboard ${darkMode ? 'dark-mode' : ''}`}>
            <header className="dashboard-header">
                <button className="logout-btn" onClick={handleLogout}>Log out</button>
                <button className="action-btn" onClick={toggleDarkMode}>
                    {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                </button>
                <h1>Admin Dashboard</h1>
            </header>

            <div className="dashboard-main">
                <section className="profile-section">
                    <div className="profile-card">
                        <h2>Welcome, {adminProfile.name}</h2>
                        <p>Email: {adminProfile.email}</p>
                        <p>Role: {adminProfile.role}</p>
                    </div>
                </section>

                <section className="stats-section">
                    <div className="stats-card">
                        <h2>User Management</h2>
                        <p>Total Users: {userCount}</p>
                        <button className="action-btn" onClick={toggleUserList}>View Users</button>
                        {showUsers && (
                            <ul>
                                {users.map((user, index) => (
                                    <li key={index}>{user.name} - {user.email}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                </section>

                <section className="chart-section">
                    <h2>User Activity Trends</h2>
                    <Line data={chartData} options={chartOptions} />
                </section>

                <section className="logs-section">
                    <h2>Activity Logs</h2>
                    <div className="filter-section">
                        <select onChange={(e) => setFilter(e.target.value)}>
                            <option value="All">All Actions</option>
                            <option value="Login">Login</option>
                            <option value="View Page">View Page</option>
                        </select>
                        <input type="date" onChange={(e) => setStartDate(e.target.value)} />
                        <input type="date" onChange={(e) => setEndDate(e.target.value)} />
                    </div>
                    <ul>
                        {filterLogs().map(log => (
                            <li key={log.id}>{log.action} - {log.timestamp}</li>
                        ))}
                    </ul>
                </section>

                <section className="actions-section">
                    <div className="action-card">
                        <h2>Reports</h2>
                        <button className="action-btn" onClick={handleGenerateReport}>Generate Report</button>
                    </div>

                    <div className="action-card">
                        <h2>Settings</h2>
                        <button className="action-btn">Change Settings</button>
                    </div>
                </section>

                <section className="audit-section">
                    <h2>Audit Logs</h2>
                    <ul>
                        {auditLogs.map((log, index) => (
                            <li key={index}>{log.action} - {log.timestamp}</li>
                        ))}
                    </ul>
                </section>
            </div>

            <div className="notifications">
                {notifications.map((notification) => (
                    <div key={notification.id} className="notification">
                        {notification.message}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminDashboard;
