/* =========================
   ELEMENT
========================== */

const sidebar = document.querySelector(".sidebar");

const overlay = document.querySelector(".sidebar-overlay");

const toggleBtn = document.querySelector(".toggle-sidebar-btn");

const menuLinks = document.querySelectorAll(".sidebar-menu a");

const closeButtons = document.querySelectorAll(".sidebar-footer button");

/* =========================
   SAFETY CHECK
========================== */

if (sidebar && overlay && toggleBtn) {
  function closeSidebar() {
    sidebar.classList.remove("active");

    overlay.classList.remove("active");
  }

  /* OPEN SIDEBAR */
  toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("active");

    overlay.classList.toggle("active");
  });

  /* CLOSE SIDEBAR */
  overlay.addEventListener("click", () => {
    closeSidebar();
  });

  menuLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (!window.matchMedia("(max-width: 992px)").matches) return;

      closeSidebar();
    });
  });

  closeButtons.forEach((button) => {
    button.addEventListener("click", closeSidebar);
  });
}
