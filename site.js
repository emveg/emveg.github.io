// Mobile menu toggle
const toggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav");
const setMenu = (open) => {
  nav.classList.toggle("open", open);
  toggle.setAttribute("aria-expanded", open);
  toggle.innerHTML = open ? "&#10005;" : "&#9776;";   // ✕ while open, ☰ when closed
};
toggle?.addEventListener("click", (e) => {
  e.stopPropagation();
  setMenu(!nav.classList.contains("open"));
});
// close when a link is chosen, when tapping outside the menu, or with Esc
nav?.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
document.addEventListener("click", (e) => { if (nav?.classList.contains("open") && !nav.contains(e.target)) setMenu(false); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && nav?.classList.contains("open")) setMenu(false); });

// Lightbox: full-screen view with caption, close button, and previous/next
// through the images of the same section (arrows, keyboard or swipe)
const box = document.createElement("div");
box.className = "lightbox";
box.setAttribute("role", "dialog");
box.setAttribute("aria-modal", "true");
box.setAttribute("aria-label", "Image viewer");
box.innerHTML = `
  <button class="lb-close" aria-label="Close">&#10005;</button>
  <button class="lb-prev" aria-label="Previous image">&#8249;</button>
  <figure class="lb-figure"><img alt=""><figcaption><span class="lb-caption"></span><span class="lb-count"></span></figcaption></figure>
  <button class="lb-next" aria-label="Next image">&#8250;</button>`;
document.body.appendChild(box);
const boxImg = box.querySelector("img");
const boxCaption = box.querySelector(".lb-caption");
const boxCount = box.querySelector(".lb-count");
let group = [], current = 0, lastFocus = null;

const captionOf = (img) => img.closest("figure")?.querySelector("figcaption")?.textContent.trim() || img.alt || "";
function show(i) {
  current = (i + group.length) % group.length;
  const img = group[current];
  boxImg.src = img.dataset.full || img.currentSrc || img.src;
  boxImg.alt = img.alt;
  boxCaption.textContent = captionOf(img);
  boxCount.textContent = group.length > 1 ? `${current + 1} / ${group.length}` : "";
  box.classList.toggle("single", group.length < 2);
}
function openBox(list, i) {
  group = list;
  lastFocus = document.activeElement;
  show(i);
  box.classList.add("open");
  document.body.style.overflow = "hidden";
  box.querySelector(".lb-close").focus();
}
function closeBox() {
  box.classList.remove("open");
  document.body.style.overflow = "";
  lastFocus?.focus?.();
}

document.querySelectorAll(".gallery figure:not(.compare) img, .shots img").forEach((img) => {
  img.addEventListener("click", () => {
    // step through the images in the same section of the page
    const scope = img.closest("section") || document;
    const list = [...scope.querySelectorAll(".gallery figure:not(.compare) img, .shots img")];
    openBox(list, list.indexOf(img));
  });
});
box.querySelector(".lb-close").addEventListener("click", closeBox);
box.querySelector(".lb-prev").addEventListener("click", () => show(current - 1));
box.querySelector(".lb-next").addEventListener("click", () => show(current + 1));
box.addEventListener("click", (e) => { if (e.target === box) closeBox(); });   // click the dark backdrop
document.addEventListener("keydown", (e) => {
  if (!box.classList.contains("open")) return;
  if (e.key === "Escape") closeBox();
  if (e.key === "ArrowLeft") show(current - 1);
  if (e.key === "ArrowRight") show(current + 1);
});
// swipe left/right on touch screens
let touchX = null;
box.addEventListener("touchstart", (e) => { touchX = e.touches[0].clientX; }, { passive: true });
box.addEventListener("touchend", (e) => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 50 && group.length > 1) show(current + (dx < 0 ? 1 : -1));
  touchX = null;
});

// Area restoration viewers: each button shows one state of the area
document.querySelectorAll(".area").forEach((area) => {
  const imgs = [...area.querySelectorAll(".states img")];
  const buttons = [...area.querySelectorAll(".state-tabs button")];
  // the other states only download once someone points at or uses this card
  const loadAll = () => imgs.forEach((img) => { if (img.dataset.src) { img.src = img.dataset.src; delete img.dataset.src; } });
  area.addEventListener("pointerenter", loadAll, { once: true });
  area.addEventListener("focusin", loadAll, { once: true });
  buttons.forEach((btn, i) => {
    btn.addEventListener("click", () => {
      loadAll();
      imgs.forEach((img, j) => img.classList.toggle("on", i === j));
      buttons.forEach((b, j) => b.setAttribute("aria-pressed", i === j));
    });
  });
  area.querySelector(".states").addEventListener("click", () => {
    loadAll();
    // open on the state being shown; arrows step through this area's states
    openBox(imgs, imgs.findIndex((img) => img.classList.contains("on")));
  });
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

// Contact form: send through Formspree without leaving the page
const form = document.querySelector(".contact-form");
form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const status = form.querySelector(".form-status");
  const button = form.querySelector("button");
  button.disabled = true;
  button.textContent = "Sending…";
  status.className = "form-status";
  status.textContent = "";
  try {
    const res = await fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error();
    form.reset();
    status.classList.add("ok");
    status.textContent = "Thanks! Your message was sent — I'll get back to you soon.";
  } catch {
    status.classList.add("error");
    status.innerHTML = 'Sorry, that didn\'t go through. Please email me at <a href="mailto:viziolimatias@gmail.com">viziolimatias@gmail.com</a>.';
  } finally {
    button.disabled = false;
    button.textContent = "Send message";
  }
});

// Current year in footer
document.querySelectorAll(".year").forEach((el) => (el.textContent = new Date().getFullYear()));
