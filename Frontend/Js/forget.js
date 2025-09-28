// เลือกฟอร์ม
const form = document.getElementById("forget-pass-form");

form.addEventListener("submit", function (e) {
  e.preventDefault(); // ป้องกันการ reload หน้า

  // ดึงค่าจาก input
  const email = document.getElementById("login-email").value.trim();
  const newPassword = document.getElementById("new-password").value.trim();
  const confirmPassword = document.getElementById("confirmnew-password").value.trim();

  // ตรวจสอบ validation
  if (!email) {
    alert("กรุณากรอกอีเมล");
    return;
  }

  if (newPassword.length < 6) {
    alert("รหัสผ่านใหม่ควรมีอย่างน้อย 6 ตัวอักษร");
    return;
  }

  if (newPassword !== confirmPassword) {
    alert("รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน");
    return;
  }

  // ตัวอย่างการส่งข้อมูลไป Backend (เช่น PHP API)
  fetch("reset_password.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json", 
    },
    body: JSON.stringify({
      email: email,
      new_password: newPassword
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        alert("เปลี่ยนรหัสผ่านสำเร็จ!");
        window.location.href = "index.html"; // กลับไปหน้า login
      } else {
        alert("เกิดข้อผิดพลาด: " + data.message);
      }
    })
    .catch((err) => {
      console.error(err);
      alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    });
});
