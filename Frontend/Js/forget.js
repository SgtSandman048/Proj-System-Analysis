
const container = document.querySelector('.container');
const registerBtn = document.querySelector('.register-btn');
const loginBtn = document.querySelector('.login-btn');


registerBtn.addEventListener('click',()=>{
    container.classList.add('active');
})
loginBtn.addEventListener('click',()=>{
    container.classList.remove('active');
})

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    const showLoginBtn = document.getElementById('show-login');
    const showRegisterBtn = document.getElementById('show-register');
    const registerSection = document.getElementById('register-section');
    const loginSection = document.getElementById('login-section');

    const confirmError = document.getElementById('confirm-error');

    // Default show register form
    registerSection.classList.add('active');

    // Toggle between forms
    /*showLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        registerSection.classList.remove('active');
        loginSection.classList.add('active');
    });

    showRegisterBtn.addEventListener('click', (e) => {
        e.preventDefault();
        loginSection.classList.remove('active');
        registerSection.classList.add('active');
    });*/

    // Register
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('reg-username').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        const confirmPassword = document.getElementById('reg-confirm-password').value;

        if (password !== confirmPassword) {
            confirmError.style.display = "block";
            return;
        } else {
            confirmError.style.display = "none";
        }

        try {
            const response = await fetch('http://localhost:3000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();
            if (response.ok) {
                alert(data.message || "Registration successful!");
                showLoginBtn.click();
            } else {
                alert(data.message || 'Registration failed');
            }
        } catch (error) {
            alert('Failed to connect to the server.');
        }
    });

    // Login
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
                alert('Login successful!');
                if (data.token) {
                    localStorage.setItem('authToken', data.token);
                    localStorage.setItem('username', data.username || email);
                }
                window.location.href = "home.html"; // ✅ Redirect
            } else {
                alert(data.message || 'Login failed');
            }
        } catch (error) {
            alert('Failed to connect to the server.');
        }
    });

    forgetPassForm.addEventListener('')
});