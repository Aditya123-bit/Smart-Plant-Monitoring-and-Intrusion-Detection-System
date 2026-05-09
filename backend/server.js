const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(cookieParser());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// --- IN-MEMORY STORAGE ---
// WARNING: Data is lost when server restarts
let users = [
    // Pre-create an admin user for testing
    {
        name: "Admin User",
        email: "admin@gmail.com",
        password: "password123"
    }
];

let sessions = {}; // Map session token to email

let sensorData = {
    soil: "Wet",
    intruder: false,
    status: "Online",
    updatedAt: new Date().toISOString(),
    logs: [
        { time: new Date().toLocaleTimeString(), message: "[SYSTEM] Server started" }
    ]
};

// Helper: Generate random token
function generateToken() {
    return Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2);
}

// --- AUTHENTICATION ROUTES ---

app.post('/api/register', (req, res) => {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    
    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    const userExists = users.find(u => u.email === email);
    if (userExists) {
        return res.status(400).json({ error: 'Email already exists' });
    }
    
    users.push({ name, email, password });
    res.json({ message: 'Registration successful' });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const token = generateToken();
    sessions[token] = { email: user.email, name: user.name };
    
    // Set cookie
    res.cookie('auth_token', token, { 
        httpOnly: true, 
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    });
    
    res.json({ message: 'Login successful', name: user.name });
});

app.get('/api/logout', (req, res) => {
    const token = req.cookies.auth_token;
    if (token && sessions[token]) {
        delete sessions[token];
    }
    res.clearCookie('auth_token');
    res.json({ message: 'Logged out successfully' });
});

app.get('/api/check-auth', (req, res) => {
    const token = req.cookies.auth_token;
    if (!token || !sessions[token]) {
        return res.status(401).json({ authenticated: false });
    }
    res.json({ authenticated: true, user: sessions[token] });
});


// --- IOT ROUTES ---

// ESP8266 sends data here
app.post('/api/update', (req, res) => {
    const { soil, intruder, status } = req.body;
    
    if (soil !== undefined) {
        if (sensorData.soil !== soil) {
            sensorData.logs.unshift({ time: new Date().toLocaleTimeString(), message: `[INFO] Soil Status changed to: ${soil}` });
        }
        sensorData.soil = soil;
    }
    
    if (intruder !== undefined) {
        if (intruder && !sensorData.intruder) {
            sensorData.logs.unshift({ time: new Date().toLocaleTimeString(), message: `[WARNING] Intruder Detected!` });
        } else if (!intruder && sensorData.intruder) {
            sensorData.logs.unshift({ time: new Date().toLocaleTimeString(), message: `[INFO] Area is safe.` });
        }
        sensorData.intruder = intruder;
    }
    
    if (status !== undefined) {
        sensorData.status = status;
    }
    
    sensorData.updatedAt = new Date().toISOString();
    
    // Keep logs array size manageable
    if (sensorData.logs.length > 20) {
        sensorData.logs = sensorData.logs.slice(0, 20);
    }
    
    res.json({ message: 'Data updated successfully' });
});

// Frontend fetches data from here
app.get('/api/data', (req, res) => {
    // Optional: Protect data route as well, but for simplicity we can just return it.
    // However, user requested "Protected Dashboard Access", so it's good to protect API too.
    const token = req.cookies.auth_token;
    if (!token || !sessions[token]) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Prevent browser caching for real-time dashboard
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.json(sensorData);
});

// For any other route, redirect to login page (or dashboard if we want, but login is safer)
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
