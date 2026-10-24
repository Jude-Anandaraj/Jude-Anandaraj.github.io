/* =========================================================
   HELPERS
========================================================= */

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/* =========================================================
   LOADER
========================================================= */

const loader = $("#loader");
const skipLoader = document.documentElement.classList.contains("skip-loader");

try {
  sessionStorage.setItem("jgr-visited", "1");
} catch (e) {}

if (loader && !skipLoader) {
  document.body.classList.add("loading");

  const bar = $(".loader-bar span", loader);
  const percent = $("#loader-percent");
  let progress = 0;

  const tick = setInterval(() => {
    progress = Math.min(progress + Math.random() * 18, 92);
    if (bar) bar.style.width = progress + "%";
    if (percent) percent.textContent = Math.floor(progress);
  }, 120);

  const finish = () => {
    clearInterval(tick);
    if (bar) bar.style.width = "100%";
    if (percent) percent.textContent = "100";

    setTimeout(() => {
      loader.classList.add("done");
      document.body.classList.remove("loading");
    }, 300);
  };

  window.addEventListener("load", finish);

  // Never trap the visitor behind the loader if an asset hangs
  setTimeout(finish, 4000);
}

/* =========================================================
   NAVIGATION
========================================================= */

const nav = $("nav");
const navToggle = $("#nav-toggle");
const navLinks = $("#nav-links");
const progressBar = $("#scroll-progress");
const sections = $$("section[id]");
const anchorLinks = $$('.nav-links a[href^="#"]');

// Pill that slides behind the active nav link
let navIndicator = null;

if (navLinks) {
  navIndicator = document.createElement("span");
  navIndicator.className = "nav-indicator";
  navIndicator.setAttribute("aria-hidden", "true");
  navLinks.prepend(navIndicator);
}

function moveIndicator(link) {
  if (!navIndicator) return;

  if (!link || link.classList.contains("nav-cta")) {
    navIndicator.style.opacity = "0";
    return;
  }

  navIndicator.style.opacity = "1";
  navIndicator.style.width = link.offsetWidth + "px";
  navIndicator.style.transform = `translateX(${link.offsetLeft}px)`;
}

function activeLink() {
  return $(".nav-links a.active");
}

if (navLinks) {
  $$("a", navLinks).forEach((link) => {
    link.addEventListener("mouseenter", () => moveIndicator(link));
  });

  navLinks.addEventListener("mouseleave", () => moveIndicator(activeLink()));
  window.addEventListener("resize", () => moveIndicator(activeLink()));

  // Re-measure once fonts load, since link widths change
  if (document.fonts) document.fonts.ready.then(() => moveIndicator(activeLink()));
}

function onScroll() {
  const scrollY = window.scrollY;

  if (nav) nav.classList.toggle("scrolled", scrollY > 40);

  if (progressBar) {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  }

  if (anchorLinks.length) {
    let current = "";

    sections.forEach((section) => {
      if (scrollY >= section.offsetTop - 200) current = section.id;
    });

    let changed = false;

    anchorLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === "#" + current;
      if (isActive !== link.classList.contains("active")) changed = true;
      link.classList.toggle("active", isActive);
    });

    if (changed && navLinks && !navLinks.matches(":hover")) moveIndicator(activeLink());
  }
}

window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

function setMenu(open) {
  if (!navToggle || !navLinks) return;

  navToggle.classList.toggle("open", open);
  navLinks.classList.toggle("open", open);
  navToggle.setAttribute("aria-expanded", String(open));
  if (nav) nav.classList.toggle("menu-open", open);
  document.body.style.overflow = open ? "hidden" : "";
}

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    setMenu(!navLinks.classList.contains("open"));
  });

  $$("a", navLinks).forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });
}

/* =========================================================
   CUSTOM CURSOR + FLASHLIGHT
========================================================= */

if (finePointer && !reduceMotion) {
  const dot = $(".cursor-dot");
  const ring = $(".cursor-ring");

  const flashlight = document.createElement("div");
  flashlight.className = "flashlight";
  document.body.appendChild(flashlight);

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;

  document.addEventListener("mousemove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    document.body.classList.add("has-cursor");
  });

  // Hide the custom cursor when the mouse leaves the window
  document.addEventListener("mouseout", (event) => {
    if (!event.relatedTarget) document.body.classList.remove("has-cursor");
  });

  window.addEventListener("blur", () => document.body.classList.remove("has-cursor"));

  (function follow() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;

    if (dot) dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    if (ring) ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
    flashlight.style.transform = `translate(${ringX}px, ${ringY}px)`;

    requestAnimationFrame(follow);
  })();

  document.addEventListener("mouseover", (event) => {
    const interactive = event.target.closest("a, button, .card, .asset-card, model-viewer");
    document.body.classList.toggle("cursor-hover", Boolean(interactive));
  });
}

/* =========================================================
   HERO PARTICLES
========================================================= */

const canvas = $("#hero-canvas");

if (canvas) {
  const ctx = canvas.getContext("2d");
  const pointer = { x: -9999, y: -9999 };
  let particles = [];
  let width = 0;
  let height = 0;
  let visible = true;

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.offsetWidth;
    height = canvas.offsetHeight;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    const count = Math.min(Math.floor((width * height) / 14000), 110);

    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.6 + 0.4,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      // Particles drift away from the cursor
      const dx = p.x - pointer.x;
      const dy = p.y - pointer.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 120) {
        p.x += (dx / dist) * 1.2;
        p.y += (dy / dist) * 1.2;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0, 229, 255, 0.7)";
      ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const d = Math.hypot(p.x - q.x, p.y - q.y);

        if (d < 120) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(0, 229, 255, ${0.14 * (1 - d / 120)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    if (visible) draw();
    requestAnimationFrame(loop);
  }

  resize();
  window.addEventListener("resize", resize);

  canvas.parentElement.addEventListener("mousemove", (event) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
  });

  canvas.parentElement.addEventListener("mouseleave", () => {
    pointer.x = pointer.y = -9999;
  });

  // Pause the animation while the hero is off-screen
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
  }).observe(canvas);

  if (reduceMotion) draw();
  else loop();
}

/* =========================================================
   TYPED ROLE
========================================================= */

const typedRole = $("#typed-role");

if (typedRole && !reduceMotion) {
  const roles = ["Level Designer", "World Builder", "Level Artist", "3D Asset Creator"];
  let roleIndex = 0;
  let charIndex = roles[0].length;
  let deleting = true;

  function type() {
    const word = roles[roleIndex];

    charIndex += deleting ? -1 : 1;
    typedRole.textContent = word.slice(0, charIndex);

    let delay = deleting ? 45 : 90;

    if (!deleting && charIndex === word.length) {
      deleting = true;
      delay = 2200;
    } else if (deleting && charIndex === 0) {
      deleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      delay = 400;
    }

    setTimeout(type, delay);
  }

  setTimeout(type, 2600);
}

/* =========================================================
   HUD CLOCK
========================================================= */

const hudTime = $("#hud-time");

if (hudTime) {
  const updateTime = () => {
    hudTime.textContent = new Date().toLocaleTimeString([], { hour12: false });
  };

  updateTime();
  setInterval(updateTime, 1000);
}

/* =========================================================
   SCROLL REVEAL
========================================================= */

// Wrap each word of plain-text titles so they can slide up one by one
$$(".section-title, .section-heading h2").forEach((title) => {
  const textNode = title.firstChild;
  if (!textNode || textNode.nodeType !== Node.TEXT_NODE) return;

  const words = textNode.textContent.trim().split(/\s+/);
  const fragment = document.createDocumentFragment();

  words.forEach((word, i) => {
    const outer = document.createElement("span");
    outer.className = "split-word";
    outer.style.setProperty("--i", i);

    const inner = document.createElement("span");
    inner.textContent = word;

    outer.appendChild(inner);
    fragment.appendChild(outer);
    if (i < words.length - 1) fragment.appendChild(document.createTextNode(" "));
  });

  title.replaceChild(fragment, textNode);
  title.setAttribute("aria-label", words.join(" "));
  title.classList.add("reveal-title");
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add("in-view");
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
);

$$(".reveal").forEach((element) => {
  // Stagger siblings so grids cascade in
  const siblings = $$(":scope > .reveal", element.parentElement);
  element.style.setProperty("--delay", siblings.indexOf(element) * 70 + "ms");
  revealObserver.observe(element);
});

$$(".reveal-title").forEach((title) => revealObserver.observe(title));

/* =========================================================
   COUNTERS + PROGRESS BARS
========================================================= */

function countUp(element, target, suffix = "") {
  if (reduceMotion) {
    element.textContent = target + suffix;
    return;
  }

  const start = performance.now();
  const duration = 1600;

  (function step(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    element.textContent = Math.round(target * eased) + suffix;
    if (t < 1) requestAnimationFrame(step);
  })(start);
}

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
  { threshold: 0.5 },
);

$$("[data-count], [data-progress], [data-width]").forEach((el) => valueObserver.observe(el));

/* =========================================================
   CARD TILT + SPOTLIGHT
========================================================= */

if (finePointer) {
  $$(".card, .skill-tag, .asset-card").forEach((card) => {
    const tilt = card.classList.contains("tilt") && !reduceMotion;

    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      card.style.setProperty("--mx", x + "px");
      card.style.setProperty("--my", y + "px");

      if (tilt) {
        card.classList.add("tilting");
        card.style.setProperty("--ry", ((x / rect.width - 0.5) * 6).toFixed(2) + "deg");
        card.style.setProperty("--rx", ((0.5 - y / rect.height) * 6).toFixed(2) + "deg");
      }
    });

    card.addEventListener("mouseleave", () => {
      card.classList.remove("tilting");
      card.style.setProperty("--rx", "0deg");
      card.style.setProperty("--ry", "0deg");
    });
  });

  // Magnetic buttons
  if (!reduceMotion) {
    $$(".magnetic").forEach((button) => {
      button.addEventListener("mousemove", (event) => {
        const rect = button.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        button.style.transform = `translate(${x * 0.2}px, ${y * 0.3}px)`;
      });

      button.addEventListener("mouseleave", () => {
        button.style.transform = "";
      });
    });
  }
}

/* =========================================================
   DESIGN DETAILS
========================================================= */

$$("[data-toggle]").forEach((button) => {
  button.addEventListener("click", () => {
    const target = document.getElementById(button.dataset.toggle);
    if (!target) return;

    const open = target.classList.toggle("active");
    button.setAttribute("aria-expanded", String(open));
  });
});

/* =========================================================
   VIDEO MODAL
========================================================= */

const modal = $("#modal");
const videoFrame = $("#videoFrame");
const modalEmpty = $("#modal-empty");
const modalImage = $("#modal-image");

function openVideo(url, image) {
  if (!modal || !videoFrame) return;

  if (modalImage) modalImage.hidden = !image;

  if (image) {
    modalImage.src = image;
    videoFrame.hidden = true;
    if (modalEmpty) modalEmpty.hidden = true;
  } else if (url) {
    videoFrame.src = url;
    videoFrame.hidden = false;
    if (modalEmpty) modalEmpty.hidden = true;
  } else {
    // No trailer yet: show a "coming soon" screen instead of a blank frame
    videoFrame.hidden = true;
    if (modalEmpty) modalEmpty.hidden = false;
  }

  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeVideo() {
  if (!modal || !videoFrame) return;

  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";

  setTimeout(() => {
    videoFrame.src = "";
  }, 400);
}

$$("[data-video]").forEach((button) => {
  button.addEventListener("click", () => openVideo(button.dataset.video));
});

$$("[data-image]").forEach((button) => {
  button.addEventListener("click", () => openVideo(null, button.dataset.image));
});

if (modal) {
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeVideo();
  });

  const closeButton = $("#close-modal");
  if (closeButton) closeButton.addEventListener("click", closeVideo);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("open")) closeVideo();
  });
}

/* =========================================================
   COPY EMAIL
========================================================= */

const emailCopy = $("#email-copy");

if (emailCopy) {
  const label = $(".copy-label", emailCopy);

  emailCopy.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(emailCopy.dataset.email);
      label.textContent = "Copied!";
    } catch {
      label.textContent = "Select it";
    }

    emailCopy.classList.add("copied");

    setTimeout(() => {
      emailCopy.classList.remove("copied");
      label.textContent = "Copy";
    }, 2000);
  });
}

/* =========================================================
   ACHIEVEMENT
========================================================= */

const projects = $("#games");

if (projects) {
  const achievementObserver = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;

      achievementObserver.disconnect();

      const achievement = document.createElement("div");
      achievement.className = "achievement";
      achievement.setAttribute("role", "status");
      achievement.innerHTML = `
        <div class="achievement-icon">🏆</div>
        <div>
          <h4>Achievement Unlocked</h4>
          <p>Explorer</p>
          <small>Viewed Featured Projects</small>
        </div>
      `;

      document.body.appendChild(achievement);

      setTimeout(() => achievement.classList.add("show"), 100);

      setTimeout(() => {
        achievement.classList.remove("show");
        setTimeout(() => achievement.remove(), 600);
      }, 4500);
    },
    { threshold: 0.3 },
  );

  achievementObserver.observe(projects);
}
