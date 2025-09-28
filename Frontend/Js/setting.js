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

// Mock ข้อมูลบัญชี
const mockAccount = {
  username: "JeffyTheTrader",
  email: "jeffylnwza007@example.com",
  profileImage: "https://i.pravatar.cc/150?img=12", // รูปโปรไฟล์สุ่ม
  stars: 4.2
};

// ฟังก์ชันแสดงข้อมูล Account
function displayAccountInfo() {
  const container = document.getElementById("account-info");
  if (!container) return;

  // สร้าง HTML ของดาว 5 ดวง (active/inactive)
  let starsHtml = "";
  for (let i = 1; i <= 5; i++) {
    starsHtml += `<span class="star ${i <= mockAccount.stars ? "" : "inactive"}">★</span>`;
  }

  container.innerHTML = `
    <h2 class="section-title">Account Info</h2>
    <div class="form">
    <img src="${mockAccount.profileImage}" alt="Profile Picture" class="account-avatar">

    <div class="form-group">
      <label for="username">Username</label>
      <div class="form-input">${mockAccount.username}</div>
      <label for="email">Email</label>
      <div class="form-input">${mockAccount.email}</div>
    </div>
    <div class="form-group">
        <label for="stars">Rating</label>
        <div class="stars">
        ${starsHtml}
      </div>
      <div class="section-title">${mockAccount.stars} / 5.0</div>
      </div>
      </div>
    
      <a href="index.html" class="log-out-btn">Log Out</a>
      <button class="delete-account-btn">Delete Account</button>
  `;
}

// เรียกใช้งานเมื่อโหลดหน้าเสร็จ
document.addEventListener("DOMContentLoaded", displayAccountInfo);


// เรียกใช้งาน
initMenuToggle(".menu", ".section");
