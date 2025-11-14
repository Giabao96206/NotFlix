const products = document.querySelectorAll(".container");
console.log(products);
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
    root: document.querySelector(".num1"), // Giới hạn quan sát trong vùng cuộn
    rootMargin: "0px",
    threshold: 0.2, // Khi 60% sản phẩm vào vùng nhìn thấy thì kích hoạt hiệu ứng
  }
);

// Gán observer cho từng sản phẩm
products.forEach((product) => {
  observer.observe(product);
});
