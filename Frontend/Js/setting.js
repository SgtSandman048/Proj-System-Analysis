// ฟังก์ชันสำหรับสลับเมนูและเนื้อหา
function initMenuToggle(menuSelector, sectionSelector) {
  const menus = document.querySelectorAll(menuSelector);
  const sections = document.querySelectorAll(sectionSelector);

  menus.forEach(menu => {
    menu.addEventListener("click", () => {
      // reset active menu
      menus.forEach(m => m.classList.remove("active"));
      menu.classList.add("active");

      // reset active section
      sections.forEach(sec => sec.classList.remove("active"));
      document.getElementById(menu.dataset.target).classList.add("active");
    });
  });
}

function setValue(value) {
  document.getElementById("selected").textContent = value;
  document.querySelector(".custom-select").removeAttribute("open");
}

// ฟังก์ชันดึงข้อมูลผู้ใช้จาก API
async function fetchUserProfile() {
  try {
    // Get the token from localStorage (use 'authToken' to match your login)
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      // If no token, redirect to login page
      window.location.href = 'index.html';
      return null;
    }

    // Call the API to get user profile
    const response = await fetch('http://localhost:3000/api/user/profile', {
      method: 'GET',
      headers: {
        'x-auth-token': token,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('API Response Status:', response.status);
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', errorData);
      throw new Error('Failed to fetch user profile');
    }

    const userData = await response.json();
    console.log('User Data:', userData);
    return userData;

  } catch (error) {
    console.error('Error fetching user profile:', error);
    // Return null but don't redirect - let displayAccountInfo handle it
    return null;
  }
}

// ฟังก์ชันแสดงข้อมูล Account
async function displayAccountInfo() {
  const container = document.getElementById("account-info");
  if (!container) return;

  // Fetch real user data from the API
  let userData = await fetchUserProfile();
  
  // Fallback to localStorage if API fails
  if (!userData) {
    const username = localStorage.getItem('username');
    if (username) {
      userData = {
        username: username,
        email: 'Update your email in settings',
        stars: 5.0
      };
    } else {
      return;
    }
  }

  // Use default profile image or add profileImage field to your User model
  const profileImage = userData.profileImage || "images/profile.png";
  // Set rating to 5.0 (mock up)
  const stars = 5.0;

  // สร้าง HTML ของดาว 5 ดวง (active/inactive)
  let starsHtml = "";
  for (let i = 1; i <= 5; i++) {
    starsHtml += `<span class="star ${i <= stars ? "" : "inactive"}">★</span>`;
  }

  container.innerHTML = `
    <h2 class="section-title">Account Info</h2>
    <div class="form">
      <img src="${profileImage}" alt="Profile Picture" class="account-avatar">

      <div class="form-group">
        <label for="username">Username</label>
        <div class="form-input">${userData.username}</div>
        <label for="email">Email</label>
        <div class="form-input">${userData.email}</div>
      </div>
      <div class="form-group">
        <label for="stars">Rating</label>
        <div class="stars">
          ${starsHtml}
        </div>
        <div class="section-title">${stars.toFixed(1)} / 5.0</div>
      </div>
    </div>
    
    <a href="index.html" class="log-out-btn" id="logout-btn">Log Out</a>
    <button class="delete-account-btn" id="delete-btn">Delete Account</button>
  `;

  // Add event listener for logout button
  document.getElementById('logout-btn').addEventListener('click', handleLogout);
  
  // Add event listener for delete account button
  document.getElementById('delete-btn').addEventListener('click', handleDeleteAccount);
}

// ฟังก์ชันจัดการ Logout
function handleLogout(e) {
  e.preventDefault();
  // Clear the token from localStorage (use 'authToken' to match your login)
  localStorage.removeItem('authToken');
  localStorage.removeItem('username');
  // Redirect to login page
  window.location.href = 'index.html';
}

// ฟังก์ชันจัดการ Delete Account
async function handleDeleteAccount() {
  const confirmDelete = confirm('Are you sure you want to delete your account? This action cannot be undone.');
  
  if (!confirmDelete) return;

  try {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch('http://localhost:3000/api/user/delete', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to delete account');
    }

    alert('Your account has been deleted successfully.');
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    window.location.href = 'index.html';

  } catch (error) {
    console.error('Error deleting account:', error);
    alert('Failed to delete account. Please try again.');
  }
}

// เรียกใช้งานเมื่อโหลดหน้าเสร็จ
document.addEventListener("DOMContentLoaded", displayAccountInfo);

// เรียกใช้งาน
initMenuToggle(".menu", ".section");