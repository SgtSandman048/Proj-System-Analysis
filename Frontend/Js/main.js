document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    const showLoginBtn = document.getElementById('show-login');
    const showRegisterBtn = document.getElementById('show-register');
    const registerSection = document.getElementById('register-section');
    const loginSection = document.getElementById('login-section');

    // Show register form on page load
    registerSection.classList.add('active');

    // Toggle between forms
    showLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        registerSection.classList.remove('active');
        loginSection.classList.add('active');
    });

    showRegisterBtn.addEventListener('click', (e) => {
        e.preventDefault();
        loginSection.classList.remove('active');
        registerSection.classList.add('active');
    });

    // Handle register form submission
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('reg-username').value; // <-- Corrected placement
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;

        try {
            const response = await fetch('http://localhost:3000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password }) // <-- Now includes username
            });

            const data = await response.json();
            if (response.ok) {
                alert(data.message);
                // Switch to login form after successful registration
                showLoginBtn.click();
            } else {
                alert(data.message || 'Registration failed');
            }
        } catch (error) {
            alert('Failed to connect to the server.');
        }
    });

    // Handle login form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            if (response.ok) {
                alert('Login successful! Token: ' + data.token);
                // You would typically save the token here
            } else {
                alert(data.message || 'Login failed');
            }
        } catch (error) {
            alert('Failed to connect to the server.');
        }
    });
});