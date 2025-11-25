console.log(users);
let like = document.querySelector(
  ".main-content .content .container .more-movie .social .sharelike .share"
);
let unlike = document.querySelector(
  ".main-content .content .container .more-movie .social .sharelike .unlike"
);

const products = document.querySelectorAll(".section1-film-container");
let slug = window.location.pathname.split("/")[2];
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

const a = document.querySelector(
  ".main-content .content .container .about1-movie .text .list-button li:nth-child(1) a"
);

const b = document.querySelector(
  ".main-content .content .container .movie .trailer"
);

const c = document.querySelector(
  ".main-content .content .container .movie .trailer iframe"
);

function getYouTubeVideoId(url) {
  const regex =
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

a.addEventListener("click", (event) => {
  event.preventDefault(); // Ngăn chặn hành vi mặc định của liên kết
  const videoId = getYouTubeVideoId(a.href);
  if (!videoId) {
    alert("Không có trailer video");
    return;
  }
  c.src = `https://www.youtube.com/embed/${videoId}`;
  b.style.display = "block"; // Hiển thị iframe
  b.scrollIntoView({
    behavior: "smooth",
  });
});

let scoreElement = document.querySelector(
  `.main-content .content .container .more-movie .social .vote .stars-inner`
);
let score = scoreElement.getAttribute("leng");
console.log(score);
function updateStars(score) {
  const widthPercent = Math.max(0, Math.min(score * 10, 100)); // giới hạn từ 0 đến 100%
  document.getElementById("stars-inner").style.width = widthPercent + "%";
}

updateStars(score);

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

// fb -commnet
let fbcommnet = document.querySelectorAll(
  ".main-content .content .container .comment-fb"
);
fbcommnet.forEach((box) => {
  observe5.observe(box);
});

let film_list = document.querySelectorAll(
  ".main-content .content .container .section1-film"
);

document
  .querySelector(".main-content .icon-next #icon-next1")
  .addEventListener("click", () => {
    film_list.forEach((item) => {
      item.scrollLeft += 300;
    });
  });

// Check like phim chưa
async function toggleWatchlist(method) {
  try {
    const response = await fetch("/watchlist", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: users.email, name: slug }),
    });

    const data = await response.json();

    // Chuyển trạng thái hiển thị nút
    if (method === "POST") {
      like.style.display = "none";
      unlike.style.display = "inline-block";
    } else {
      like.style.display = "inline-block";
      unlike.style.display = "none";
    }
  } catch (err) {
    console.error("Lỗi xử lý watchlist:", err);
  }
}

// Xử lý nút Like
like.addEventListener("click", (e) => {
  e.preventDefault();
  if (!users) return alert("Vui lòng đăng nhập");
  toggleWatchlist("POST");
});

// Xử lý nút Unlike
unlike.addEventListener("click", (e) => {
  e.preventDefault();
  toggleWatchlist("DELETE");
});

// Kiểm tra đã like hay chưa
async function checkLikeStatus(email, slug) {
  try {
    const response = await fetch(`/checklike?email=${email}&name=${slug}`);
    const data = await response.json();

    const liked = data.message == 1; // hoặc data.liked nếu bạn đổi response như đã gợi ý trước
    like.style.display = liked ? "none" : "inline-block";
    unlike.style.display = liked ? "inline-block" : "none";
  } catch (err) {
    console.error("Lỗi kiểm tra trạng thái like:", err);
  }
}

// Gọi khi trang load
if (users) {
  checkLikeStatus(users.email, slug);
}

const link = document.querySelector("a[name]");
const nameValue = link.getAttribute("name");
document.title = nameValue;
