/* =========================================
   ASSET FILTER
========================================= */

const filterButtons = document.querySelectorAll(".filter-btn");

const assetSections = document.querySelectorAll(".asset-section");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    /* Remove active state */

    filterButtons.forEach((btn) => {
      btn.classList.remove("active");
    });

    /* Add active state */

    button.classList.add("active");

    /* Get selected category */

    const filter = button.dataset.filter;

    /* Filter sections */

    assetSections.forEach((section) => {
      const category = section.dataset.section;

      if (filter === "all") {
        section.classList.remove("hidden");
      } else if (category === filter) {
        section.classList.remove("hidden");
      } else {
        section.classList.add("hidden");
      }
    });
  });
});
