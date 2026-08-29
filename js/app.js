/* ============================================================
   app.js
   Responsibility:
   - Storage initialization on page load
   - Mobile hamburger menu toggle
   - Smooth scroll navigation (About / Contact)
   - "Shop Now" / "Shop" navigation
   - Contact form validation + fake submit
   Note: Product modal + cart drawer wiring live in products.js / cart.js,
   but this file safely checks for elements before using them so it never
   errors on pages where they don't exist.
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {
  initStorage();
  initMobileMenu();
  initSmoothScrollLinks();
  initContactForm();
});

/* ---------- Mobile menu ---------- */
function initMobileMenu() {
  const toggleBtn = document.getElementById("mobile-menu-toggle");
  const navLinks = document.getElementById("nav-links");

  if (!toggleBtn || !navLinks) return;

  toggleBtn.addEventListener("click", function () {
    navLinks.classList.toggle("open");
    toggleBtn.classList.toggle("open");
  });

  // Close menu when a link is clicked (mobile UX)
  navLinks.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      navLinks.classList.remove("open");
      toggleBtn.classList.remove("open");
    });
  });
}

/* ---------- Smooth scroll for in-page anchors (About / Contact) ---------- */
function initSmoothScrollLinks() {
  const scrollLinks = document.querySelectorAll(".js-scroll-link");
  scrollLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      const targetId = link.getAttribute("href");
      const targetEl = targetId ? document.querySelector(targetId) : null;

      // Only intercept if the target section exists on this page
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: "smooth" });
      }
      // otherwise let the browser navigate normally (e.g. index.html#about from products.html)
    });
  });
}

/* ---------- Contact form ---------- */
function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const successMsg = document.getElementById("contact-success");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("contact-name");
    const email = document.getElementById("contact-email");
    const subject = document.getElementById("contact-subject");
    const message = document.getElementById("contact-message");

    let isValid = true;
    [name, email, subject, message].forEach(function (field) {
      if (!field || field.value.trim() === "") {
        isValid = false;
        if (field) field.classList.add("input-error");
      } else if (field) {
        field.classList.remove("input-error");
      }
    });

    if (!isValid) {
      if (successMsg) {
        successMsg.textContent = "Please fill out all required fields.";
        successMsg.className = "form-message form-message-error";
        successMsg.style.display = "block";
      }
      return;
    }

    // No real email functionality yet — just simulate success.
    form.reset();
    if (successMsg) {
      successMsg.textContent = "Thanks! Your message has been received.";
      successMsg.className = "form-message form-message-success";
      successMsg.style.display = "block";
    }
  });
}
