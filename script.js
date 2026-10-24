/* =========================================================
   JGR STUDIOS — PORTFOLIO SCRIPT
   Shared by index.html and assets.html. Every feature checks
   that its elements exist, so each page only runs what it has.
========================================================= */

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* =========================================================
   HEADER: scrolled state, progress bar, active section
========================================================= */

const header = $("#nav");
const navLinks = $("#nav-links");
const navToggle = $("#nav-toggle");
const progressBar = $("#scroll-progress");
const anchorLinks = $$('.nav-links a[href^="#"]');
const sections = anchorLinks
  .map((link) => document.getElementById(link.getAttribute("href").slice(1)))
  .filter(Boolean);

// Pill that slides behind the active / hovered nav link (desktop only)
const indicator = document.createElement("span");
indicator.className = "nav-indicator";
indicator.setAttribute("aria-hidden", "true");
if (navLinks) navLinks.prepend(indicator);

function moveIndicator(link) {
  if (!link) {
    indicator.style.opacity = "0";
    return;
  }

  indicator.style.opacity = "1";
  indicator.style.width = link.offsetWidth + "px";
  indicator.style.transform = `translateX(${link.offsetLeft}px)`;
}

const activeLink = () => $(".nav-links a.active");

if (navLinks) {
  $$("a", navLinks).forEach((link) => {
    link.addEventListener("mouseenter", () => moveIndicator(link));
  });

  navLinks.addEventListener("mouseleave", () => moveIndicator(activeLink()));
  window.addEventListener("resize", () => moveIndicator(activeLink()));
  if (document.fonts) document.fonts.ready.then(() => moveIndicator(activeLink()));
}

function onScroll() {
  const y = window.scrollY;

  if (header) header.classList.toggle("scrolled", y > 20);

  if (progressBar) {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
  }

  if (!sections.length) return;

  // The last section whose top has passed the header is "current"
  let current = sections[0].id;
  sections.forEach((section) => {
    if (section.getBoundingClientRect().top <= window.innerHeight * 0.35) current = section.id;
  });

  // At the very bottom, always highlight the last section
  if (window.innerHeight + y >= document.documentElement.scrollHeight - 4) {
    current = sections[sections.length - 1].id;
  }

  let changed = false;
  anchorLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === "#" + current;
    if (isActive !== link.classList.contains("active")) changed = true;
    link.classList.toggle("active", isActive);
  });

  if (changed && navLinks && !navLinks.matches(":hover")) moveIndicator(activeLink());
}

let ticking = false;
window.addEventListener(
  "scroll",
  () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      onScroll();
      ticking = false;
    });
  },
  { passive: true },
);
onScroll();

/* =========================================================
   MOBILE MENU
========================================================= */

function setMenu(open) {
  if (!navToggle || !navLinks) return;

  navToggle.classList.toggle("open", open);
  navLinks.classList.toggle("open", open);
  if (header) header.classList.toggle("menu-open", open);
  navToggle.setAttribute("aria-expanded", String(open));
  navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  document.body.style.overflow = open ? "hidden" : "";
}

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => setMenu(!navLinks.classList.contains("open")));
  $$("a", navLinks).forEach((link) => link.addEventListener("click", () => setMenu(false)));

  // Close the menu if the window grows back to desktop size
  window.matchMedia("(min-width: 901px)").addEventListener("change", (event) => {
    if (event.matches) setMenu(false);
  });
}

/* =========================================================
   REVEAL ON SCROLL
========================================================= */

const revealItems = $$(".reveal");

if ("IntersectionObserver" in window && !reduceMotion) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in-view");
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
  );

  revealItems.forEach((item) => {
    // Stagger siblings (e.g. process steps) so they cascade in
    const siblings = $$(":scope > .reveal", item.parentElement);
    item.style.setProperty("--delay", siblings.indexOf(item) * 80 + "ms");
    revealObserver.observe(item);
  });
} else {
  revealItems.forEach((item) => item.classList.add("in-view"));
}

/* =========================================================
   PROGRESS BAR + COUNTERS
========================================================= */

function countUp(el, target, suffix = "") {
  if (reduceMotion) {
    el.textContent = target + suffix;
    return;
  }

  const start = performance.now();
  const duration = 1400;

  (function step(now) {
    const t = Math.min((now - start) / duration, 1);
    el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3))) + suffix;
    if (t < 1) requestAnimationFrame(step);
  })(start);
}

const valueItems = $$("[data-count], [data-progress], [data-width]");

if ("IntersectionObserver" in window) {
  const valueObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;

        if (el.dataset.count) countUp(el, Number(el.dataset.count));
        if (el.dataset.progress) countUp(el, Number(el.dataset.progress), "%");
        if (el.dataset.width) el.style.width = el.dataset.width + "%";

        valueObserver.unobserve(el);
      });
    },
    { threshold: 0.4 },
  );

  valueItems.forEach((el) => valueObserver.observe(el));
} else {
  valueItems.forEach((el) => {
    if (el.dataset.width) el.style.width = el.dataset.width + "%";
  });
}

/* =========================================================
   BLUEPRINT: pause the SVG animation for reduced motion
========================================================= */

const blueprint = $(".bp-svg");

if (blueprint && reduceMotion && blueprint.pauseAnimations) {
  blueprint.pauseAnimations();
}

/* =========================================================
   MODAL: trailers + full-size images
========================================================= */

const modal = $("#modal");
const modalVideo = $("#modal-video");
const modalImage = $("#modal-image");
const modalEmpty = $("#modal-empty");
let lastFocus = null;

function openModal({ video, image }) {
  if (!modal) return;

  lastFocus = document.activeElement;

  modalVideo.hidden = !video;
  modalImage.hidden = !image;
  modalEmpty.hidden = Boolean(video || image);

  if (video) modalVideo.src = video;
  if (image) modalImage.src = image;

  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  $("#modal-close").focus();
}

function closeModal() {
  if (!modal || !modal.classList.contains("open")) return;

  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";

  // Stop the video once the fade-out finishes
  setTimeout(() => {
    modalVideo.src = "";
  }, 300);

  if (lastFocus) lastFocus.focus();
}

if (modal) {
  $$("[data-video]").forEach((button) => {
    button.addEventListener("click", () => openModal({ video: button.dataset.video }));
  });

  $$("[data-image]").forEach((button) => {
    button.addEventListener("click", () => openModal({ image: button.dataset.image }));
  });

  $("#modal-close").addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeModal();
      setMenu(false);
    }
  });
}

/* =========================================================
   COPY EMAIL
========================================================= */

const copyEmail = $("#copy-email");

if (copyEmail) {
  const label = $(".copy-label", copyEmail);

  copyEmail.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(copyEmail.dataset.email);
      label.textContent = "Copied";
    } catch {
      // Clipboard can be blocked (e.g. file:// or old browsers): select the text instead
      const range = document.createRange();
      range.selectNodeContents(copyEmail.firstElementChild);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      label.textContent = "Selected";
    }

    copyEmail.classList.add("copied");

    setTimeout(() => {
      copyEmail.classList.remove("copied");
      label.textContent = "Copy";
    }, 2000);
  });
}

/* =========================================================
   FOOTER YEAR
========================================================= */

const year = $("#year");
if (year) year.textContent = new Date().getFullYear();
