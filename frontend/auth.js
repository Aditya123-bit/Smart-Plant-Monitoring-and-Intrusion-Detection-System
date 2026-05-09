// auth.js - Handles authentication logic

const API_BASE = '/api';

// Create a toast notification
function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Check if user is authenticated
async function checkAuth(redirectIfNotAuth = false, redirectIfAuth = false) {
    try {
        const response = await fetch(`${API_BASE}/check-auth`);
        const data = await response.json();

        if (data.authenticated) {
            // Update UI with username if element exists
            const usernameElem = document.getElementById('navbar-username');
            if (usernameElem && data.user) {
                usernameElem.textContent = data.user.name;
            }
            if (redirectIfAuth) {
                window.location.href = 'dashboard-soil.html';
            }
            return true;
        } else {
            if (redirectIfNotAuth) {
                window.location.href = 'login.html';
            }
            return false;
        }
    } catch (error) {
        console.error('Auth check error:', error);
        if (redirectIfNotAuth) {
            window.location.href = 'login.html';
        }
        return false;
    }
}

// Handle Logout
async function handleLogout() {
    try {
        await fetch(`${API_BASE}/logout`);
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Logout error:', error);
        showToast('Error logging out', 'error');
    }
}

// Handle Login Form Submit
const loginForm = document.getElementById('login-form');
if (loginForm) {
    // Check if already logged in
    checkAuth(false, true);

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const btn = document.getElementById('login-btn');
        
        btn.innerHTML = '<div class="loader" style="width:20px;height:20px;border-width:2px;border-color:rgba(0,0,0,0.2);border-top-color:#000;"></div>';
        btn.disabled = true;

        try {
            const response = await fetch(`${API_BASE}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                showToast('Login successful!', 'success');
                setTimeout(() => {
                    window.location.href = 'dashboard-soil.html';
                }, 1000);
            } else {
                showToast(data.error || 'Login failed', 'error');
                btn.innerHTML = 'Sign In';
                btn.disabled = false;
            }
        } catch (error) {
            console.error('Login error:', error);
            showToast('Server connection failed', 'error');
            btn.innerHTML = 'Sign In';
            btn.disabled = false;
        }
    });

    // Show/Hide password toggle
    const togglePwd = document.getElementById('toggle-pwd');
    if (togglePwd) {
        togglePwd.addEventListener('click', () => {
            const pwdInput = document.getElementById('password');
            if (pwdInput.type === 'password') {
                pwdInput.type = 'text';
                togglePwd.textContent = 'Hide';
            } else {
                pwdInput.type = 'password';
                togglePwd.textContent = 'Show';
            }
        });
    }
}

// Handle Register Form Submit
const registerForm = document.getElementById('register-form');
if (registerForm) {
    checkAuth(false, true);

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const btn = document.getElementById('register-btn');

        if (password !== confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }

        btn.innerHTML = '<div class="loader" style="width:20px;height:20px;border-width:2px;"></div>';
        btn.disabled = true;

        try {
            const response = await fetch(`${API_BASE}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (response.ok) {
                showToast('Registration successful! Please login.', 'success');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
            } else {
                showToast(data.error || 'Registration failed', 'error');
                btn.innerHTML = 'Create Account';
                btn.disabled = false;
            }
        } catch (error) {
            console.error('Registration error:', error);
            showToast('Server connection failed', 'error');
            btn.innerHTML = 'Create Account';
            btn.disabled = false;
        }
    });
}

// Attach logout event to button if exists
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
}
