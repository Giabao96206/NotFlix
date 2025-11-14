const products = document.querySelectorAll(".section1-film-container");
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
      } else {
        entry.target.classList.remove("active");
      }
    });
  },
  {
    root: document.querySelector(".section1-film"),
    rootMargin: "0px",
    threshold: 0.6,
  }
);

products.forEach((product) => {
  observer.observe(product);
});

document.addEventListener("mousemove", function (e) {
  const trail = document.createElement("div");
  trail.className = "trail";
  document.body.appendChild(trail);
  trail.style.left = e.clientX - 4 + "px";
  trail.style.top = e.clientY + window.scrollY - 4 + "px";

  setTimeout(() => {
    trail.remove();
  }, 1000);
});

// Hiệu ứng about-film
let about_film = document.querySelectorAll(
  ".main-content .content .container .more-movie"
);

let observe5 = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("showes2");
      } else {
        entry.target.classList.remove("showes2");
      }
    });
  },
  {
    threshold: 0.2,
  }
);

about_film.forEach((box) => {
  observe5.observe(box);
});

let sectionfilm1 = document.querySelectorAll(
  ".main-content .content .container .section1"
);
sectionfilm1.forEach((box) => {
  observe5.observe(box);
});
