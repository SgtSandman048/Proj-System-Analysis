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

// เรียกใช้งาน
initMenuToggle(".menu", ".section");
