/* =========================================
   EMPTY CATEGORIES + COUNTS
========================================= */

const assetSections = document.querySelectorAll(".asset-section");

assetSections.forEach((section) => {
  const grid = section.querySelector(".asset-grid");
  const count = section.querySelectorAll(".asset-card").length;
  const heading = section.querySelector(".section-heading h2");

  if (heading) {
    const badge = document.createElement("span");
    badge.className = "section-count";
    badge.textContent = `[${String(count).padStart(2, "0")}]`;
    heading.appendChild(badge);
  }

  if (grid && count === 0) {
    grid.innerHTML = `
      <div class="asset-empty">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" /><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5" /></svg>
        New assets in production
      </div>
    `;
  }
});

/* =========================================
   ASSET FILTER
========================================= */

const filterButtons = document.querySelectorAll(".filter-btn");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");

    const filter = button.dataset.filter;

    assetSections.forEach((section) => {
      const show = filter === "all" || section.dataset.section === filter;
      section.classList.toggle("is-filtered", !show);

      // Make sure cards in a newly shown section are visible
      if (show) {
        section.querySelectorAll(".reveal").forEach((el) => el.classList.add("in-view"));
      }
    });
  });
});
