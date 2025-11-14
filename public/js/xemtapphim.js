const products = document.querySelectorAll(
  ".main-content .content .container .section1-film-container"
);

let icon_forward = document.querySelector(
  ".main-content .content .container .movie .about1-movie .icon-forward"
);
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
    root: document.querySelector(".section1-film"), // Giới hạn quan sát trong vùng cuộn
    rootMargin: "0px",
    threshold: 0.6, // Khi 60% sản phẩm vào vùng nhìn thấy thì kích hoạt hiệu ứng
  }
);
// Gán observer cho từng sản phẩm
products.forEach((product) => {
  observer.observe(product);
});
const productss = document.querySelectorAll(
  ".main-content .content .container #section2 .section1-film-container"
);
const observers = new IntersectionObserver(
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
    root: document.querySelector(".section1-film"), // Giới hạn quan sát trong vùng cuộn
    rootMargin: "0px",
    threshold: 0.6, // Khi 60% sản phẩm vào vùng nhìn thấy thì kích hoạt hiệu ứng
  }
);
// Gán observer cho từng sản phẩm
products.forEach((product) => {
  observer.observe(product);
});

let video = document.querySelector(
  ".main-content .content .container .movie .about1-movie .vide"
);
let a = video.dataset.link;
const videoSrc = a;
if (Hls.isSupported()) {
  var hls = new Hls();
  hls.loadSource(videoSrc);
  hls.attachMedia(video);
} else if (video.canPlayType("application/vnd.apple.mpegurl")) {
  video.src = videoSrc;
} else {
  alert("Trình duyệt của bạn không hỗ trợ HLS.");
}
video.addEventListener("mouseover", () => {
  icon_forward.classList.remove("icon-special2");
  icon_forward.classList.add("icon-special");
});

video.addEventListener("mouseout", () => {
  if (video.paused) {
    icon_forward.classList.remove("icon-special2");
    icon_forward.classList.remove("icon-special");
  }
});
document.addEventListener("keydown", (event) => {
  // Kiểm tra xem có đang gõ văn bản trong input hoặc textarea không
  const activeElement = document.activeElement;
  let isTyping =
    activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA";
  if (isTyping) return;
  if (event.key === "K" || event.key === "k" || event.key === "Space") {
    if (video.paused) {
      video.play();
      icon_forward.classList.remove("icon-special");
      icon_forward.classList.add("icon-special2");
    } else {
      video.pause();
      icon_forward.classList.remove("icon-special");
      icon_forward.classList.remove("icon-special2");
    }
  }

  if (event.key === "F" || event.key === "f") {
    if (video.requestFullscreen) {
      video.requestFullscreen();
    } else if (video.mozRequestFullScreen) {
      // Firefox
      video.mozRequestFullScreen();
    } else if (video.webkitRequestFullscreen) {
      // Chrome, Safari and Opera
      video.webkitRequestFullscreen();
    } else if (video.msRequestFullscreen) {
      // IE/Edge
      video.msRequestFullscreen();
    }
  }

  if (event.key === "J" || event.key === "j") {
    video.currentTime -= 10; // Lùi lại 10 giây
  }

  if (event.key === "L" || event.key === "l") {
    video.currentTime += 10; // Tua tới 10 giây
  }

  if (event.key === "ArrowUp" || event.key === "PageUp") {
    if (video.volume < 1) {
      video.volume = Math.min(1, video.volume + 0.1);
    }
  } else if (event.key === "ArrowDown" || event.key === "PageDown") {
    if (video.volume > 0) {
      video.volume = Math.max(0, video.volume - 0.1);
    }
  }
});

icon_forward.addEventListener("click", function () {
  video.currentTime += 10; // Tua tới 10 giây
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

// Hiệu ứng tập phim

let tapphim = document.querySelectorAll(
  ".main-content .content .container .episode ul li"
);

let observer4 = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("showes");
      } else {
        entry.target.classList.remove("showes"); // Ẩn khi ra khỏi khung nhìn
      }
    });
  },
  {
    threshold: 0.1,
  }
);

tapphim.forEach((box) => {
  observer4.observe(box);
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
    threshold: 0.1,
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

const link = document.querySelector("a[name]");
const nameValue = link.getAttribute("name");
document.title = nameValue;
