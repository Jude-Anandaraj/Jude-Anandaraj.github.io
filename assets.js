/* =========================================
   ASSET LIBRARY: counts, empty states, filters
========================================= */

const assetSections = [...document.querySelectorAll(".asset-section")];
const filterButtons = [...document.querySelectorAll(".filter-btn")];

const pad = (n) => String(n).padStart(2, "0");
let total = 0;

assetSections.forEach((section) => {
  const grid = section.querySelector(".asset-grid");
  const count = section.querySelectorAll(".asset-card").length;
  const heading = section.querySelector(".asset-section-head h2");
  total += count;

  if (heading) {
    const badge = document.createElement("span");
    badge.className = "asset-section-count";
    badge.textContent = `(${pad(count)})`;
    heading.appendChild(badge);
  }

  // Show a tidy placeholder for categories that have no assets yet
  if (grid && count === 0) {
    grid.innerHTML = '<p class="asset-empty">New assets in production — check back soon.</p>';
  }

  // Add the count to the matching filter button
  const button = filterButtons.find((btn) => btn.dataset.filter === section.dataset.section);
  if (button) button.insertAdjacentHTML("beforeend", `<span class="count">${count}</span>`);
});

const allButton = filterButtons.find((btn) => btn.dataset.filter === "all");
if (allButton) allButton.insertAdjacentHTML("beforeend", `<span class="count">${total}</span>`);

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((btn) => {
      btn.classList.toggle("active", btn === button);
      btn.setAttribute("aria-pressed", String(btn === button));
    });

    const filter = button.dataset.filter;

    assetSections.forEach((section) => {
      const show = filter === "all" || section.dataset.section === filter;
      section.classList.toggle("is-filtered", !show);

      // Cards in a newly shown section should appear immediately
      if (show) section.querySelectorAll(".reveal").forEach((el) => el.classList.add("in-view"));
    });
  });
});
