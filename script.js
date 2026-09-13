/* =========================================================
   LOADER
========================================================= */

window.addEventListener("load", () => {
  const loader = document.getElementById("loader");

  if (!loader) return;

  loader.style.opacity = "0";

  setTimeout(() => {
    loader.style.display = "none";
  }, 500);

  animateProgressBars();
});

/* =========================================================
   VIDEO MODAL
========================================================= */

function openVideo(url) {
  const modal = document.getElementById("modal");

  const video = document.getElementById("videoFrame");

  if (!modal || !video) return;

  modal.style.display = "flex";

  video.src = url;
}

function closeVideo() {
  const modal = document.getElementById("modal");

  const video = document.getElementById("videoFrame");

  if (!modal || !video) return;

  modal.style.display = "none";

  video.src = "";
}

/* =========================================================
   DESIGN DETAILS
========================================================= */

function toggleDetails(id) {
  const target = document.getElementById(id);

  if (!target) return;

  target.classList.toggle("active");
}

/* =========================================================
   SCROLL REVEAL
========================================================= */

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
      }
    });
  },

  {
    threshold: 0.15,
  },
);

document.querySelectorAll("section, .card").forEach((element) => {
  element.classList.add("hidden");

  observer.observe(element);
});

/* =========================================================
   ACTIVE NAVIGATION
========================================================= */

const sections = document.querySelectorAll("section");

const navLinks = document.querySelectorAll("nav ul a");

window.addEventListener("scroll", () => {
  let current = "";

  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 150;

    if (window.scrollY >= sectionTop) {
      current = section.getAttribute("id");
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove("active");

    if (link.getAttribute("href") === "#" + current) {
      link.classList.add("active");
    }
  });
});

/* =========================================================
   PROGRESS BAR
========================================================= */

function animateProgressBars() {
  const bars = document.querySelectorAll(".progress-bar");

  bars.forEach((bar) => {
    const finalWidth = bar.style.width;

    bar.style.width = "0";

    setTimeout(() => {
      bar.style.transition = "width 2s ease";

      bar.style.width = finalWidth;
    }, 300);
  });
}

/* =========================================================
   FLASHLIGHT
========================================================= */

const flashlight = document.createElement("div");

flashlight.classList.add("flashlight");

document.body.appendChild(flashlight);

document.addEventListener("mousemove", (event) => {
  flashlight.style.left = event.clientX + "px";

  flashlight.style.top = event.clientY + "px";
});

/* =========================================================
   ACHIEVEMENT
========================================================= */

let achievementShown = false;

window.addEventListener("scroll", () => {
  const projects = document.getElementById("games");

  if (!projects) return;

  const trigger =
    projects.getBoundingClientRect().top < window.innerHeight / 1.5;

  if (trigger && !achievementShown) {
    achievementShown = true;

    const achievement = document.createElement("div");

    achievement.className = "achievement";

    achievement.innerHTML = `

            <h4>
                Achievement Unlocked
            </h4>

            <p>
                Explorer
            </p>

            <small>
                Viewed Featured Projects
            </small>

        `;

    document.body.appendChild(achievement);

    setTimeout(() => {
      achievement.classList.add("show");
    }, 100);

    setTimeout(() => {
      achievement.classList.remove("show");

      setTimeout(() => {
        achievement.remove();
      }, 500);
    }, 4000);
  }
});
