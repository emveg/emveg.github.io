// Mobile menu toggle
const toggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav");
toggle?.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  toggle.setAttribute("aria-expanded", open);
});

// Lightbox for gallery images and game screenshots
const box = document.createElement("div");
box.className = "lightbox";
box.innerHTML = '<img alt="">';
document.body.appendChild(box);
const boxImg = box.querySelector("img");

document.querySelectorAll(".gallery figure:not(.compare) img, .shots img").forEach((img) => {
  img.addEventListener("click", () => {
    boxImg.src = img.dataset.full || img.src;
    boxImg.alt = img.alt;
    box.classList.add("open");
  });
});
box.addEventListener("click", () => box.classList.remove("open"));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") box.classList.remove("open");
});

// Line-to-colour sliders
document.querySelectorAll(".compare input").forEach((range) => {
  range.addEventListener("input", () => range.parentElement.style.setProperty("--pos", range.value + "%"));
});

// Floating episode panel: built from the page's jump links, shown once they scroll out of view
const chips = document.querySelector(".chips");
if (chips) {
  const rail = document.createElement("nav");
  rail.className = "ep-rail";
  rail.setAttribute("aria-label", "Episodes");
  chips.querySelectorAll("a").forEach((chip) => {
    const section = document.querySelector(chip.getAttribute("href"));
    const link = document.createElement("a");
    link.href = chip.getAttribute("href");
    link.textContent = chip.textContent;
    link.dataset.title = section.querySelector("h2").textContent;   // full title in the hover label
    rail.appendChild(link);
  });
  document.body.appendChild(rail);

  // Show the panel once the jump links have scrolled above the screen
  const updateRail = () => rail.classList.toggle("show", chips.getBoundingClientRect().bottom < 0);
  window.addEventListener("scroll", updateRail, { passive: true });
  updateRail();

  // Highlight the episode currently in the middle of the screen
  const links = [...rail.querySelectorAll("a")];
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === "#" + e.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  links.forEach((l) => spy.observe(document.querySelector(l.getAttribute("href"))));
}

// Back-to-top arrow, appears after scrolling down a bit
const toTop = document.createElement("button");
toTop.className = "to-top";
toTop.setAttribute("aria-label", "Back to top");
toTop.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5l-7 7 1.4 1.4L11 8.8V20h2V8.8l4.6 4.6L19 12z"/></svg>';
document.body.appendChild(toTop);
toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
const updateToTop = () => toTop.classList.toggle("show", window.scrollY > 600);
window.addEventListener("scroll", updateToTop, { passive: true });
updateToTop();

// Current year in footer
document.querySelectorAll(".year").forEach((el) => (el.textContent = new Date().getFullYear()));
