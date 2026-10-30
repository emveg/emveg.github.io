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

document.querySelectorAll(".gallery img, .shots img").forEach((img) => {
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

// Current year in footer
document.querySelectorAll(".year").forEach((el) => (el.textContent = new Date().getFullYear()));
