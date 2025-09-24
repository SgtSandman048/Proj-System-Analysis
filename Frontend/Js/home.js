        // Add interactive hover effects
        const gameCards = document.querySelectorAll('.game-card');
        const heroCtaBtn = document.querySelector('.hero-cta-btn');
        
        gameCards.forEach(card => {
            card.addEventListener('click', () => {
                const gameTitle = card.querySelector('.game-title').textContent;
                
            });
        });

        // Hero CTA Button Click Event
        if (heroCtaBtn) {
            heroCtaBtn.addEventListener('click', () => {
                // เลื่อนลงไปยังส่วนเกม
                document.querySelector('.games-section').scrollIntoView({
                    behavior: 'smooth'
                });
            });
        }

        // Add smooth scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
         if (!localStorage.getItem('authToken')) {
        window.location.href = "index.html";
        }

        //สมมติ การล็อคอิน
let isLoggedIn = true; // เปลี่ยนเป็น false ถ้า logout
/*
async function updateUserMenu() {
    try {
        const res = await fetch('/api/current-user'); // ✅ backend ต้องเขียน endpoint นี้
        const data = await res.json();

        const signInLink = document.getElementById("signInLink");
        const userDropdown = document.getElementById("userDropdown");

        if (data.loggedIn) {
            signInLink.style.display = "none";
            userDropdown.style.display = "inline-block";
            document.getElementById("usernameDisplay").textContent = data.username;
        } else {
            signInLink.style.display = "inline-block";
            userDropdown.style.display = "none";
        }
    } catch (err) {
        console.error("เชื่อมต่อ backend ไม่ได้:", err);
    }
}

// กดปุ่ม Sign out → ส่งไปที่ backend
document.getElementById("signOutBtn").addEventListener("click", async function(e) {
    e.preventDefault();
    await fetch('/api/logout', { method: 'POST' });
    updateUserMenu();
});

// โหลดหน้ามา → อัปเดตเมนู
document.addEventListener("DOMContentLoaded", updateUserMenu);
*/