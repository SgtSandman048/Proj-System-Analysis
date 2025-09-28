// forget.js - JavaScript for password reset functionality
// Configuration - Update this URL to match your backend
const API_BASE_URL = 'http://localhost:3000/api'; // Change this to your backend URL

// State management for the reset process
let resetToken = null;
let userEmail = null;

// Handle form submission
document.getElementById('forget-pass-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('login-email').value;
  const newPassword = document.getElementById('new-password').value;
  const confirmPassword = document.getElementById('confirmnew-password').value;
  
  // Validate passwords match
  if (newPassword !== confirmPassword) {
    alert('Passwords do not match!');
    return;
  }
  
  // Validate password strength
  if (newPassword.length < 6) {
    alert('Password must be at least 6 characters long!');
    return;
  }
  
  // If we don't have a reset token yet, request one first
  if (!resetToken) {
    await requestPasswordReset(email, newPassword, confirmPassword);
  } else {
    // We have a token, proceed with password reset
    await resetPassword(resetToken, newPassword);
  }
});

// Step 1: Request password reset token
async function requestPasswordReset(email, newPassword, confirmPassword) {
  try {
    showLoading(true);
    
    const response = await fetch(`${API_BASE_URL}/user/forgotpassword`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      userEmail = email;
      
      // Check if token is provided (for testing)
      if (data.resetToken) {
        resetToken = data.resetToken;
        // Automatically proceed to reset password
        await resetPassword(resetToken, newPassword);
      } else {
        // In production, user would need to get token from email
        alert('Reset link sent to your email! Please check your email for the token.');
        // For now, we'll ask user to enter the token manually
        const token = prompt('Please enter the reset token you received in your email:');
        if (token) {
          resetToken = token;
          await resetPassword(resetToken, newPassword);
        }
      }
    } else {
      alert(data.message || 'An error occurred. Please try again.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Network error. Please check your connection and try again.');
  } finally {
    showLoading(false);
  }
}

// Step 2: Reset password with token
async function resetPassword(token, newPassword) {
  try {
    showLoading(true);
    
    const response = await fetch(`${API_BASE_URL}/user/resetpassword/${token}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password: newPassword }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      alert('Password reset successfully! Redirecting to login...');
      // Redirect to login page
      window.location.href = 'index.html';
    } else {
      alert(data.message || 'Failed to reset password. Please try again.');
      // Reset state so user can try again
      resetToken = null;
      userEmail = null;
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Network error. Please check your connection and try again.');
    // Reset state so user can try again
    resetToken = null;
    userEmail = null;
  } finally {
    showLoading(false);
  }
}

// Show/hide loading state
function showLoading(isLoading) {
  const submitBtn = document.querySelector('.btn[type="submit"]');
  
  if (isLoading) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';
  } else {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Reset Pass';
  }
}

// Handle direct token links (if user clicks email link with token)
window.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const email = urlParams.get('email');
  
  if (token) {
    resetToken = token;
    if (email) {
      userEmail = email;
      document.getElementById('login-email').value = email;
    }
    alert('Reset token detected! Please enter your new password.');
  }
});

console.log('Password reset functionality loaded successfully');