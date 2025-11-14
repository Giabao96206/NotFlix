let input = document.querySelector("#header #nav .nav2 form input");
let goiy = document.querySelector("#header #nav .nav2 form .goiy");
let inputtable = document.querySelector("#header #nav .search-text input");
let goiytable = document.querySelector("#header #nav .search-text form .goiy");
const loader = document.querySelector(
  "#header #nav .search-text form .goiy .loader"
);

console.log(loader);

function hamgoiy(inputEl, resultBox, loaderEl) {
  let timeout = null;
  let currentController = null;

  inputEl.addEventListener("input", () => {
    clearTimeout(timeout);

    timeout = setTimeout(async () => {
      const keyword = inputEl.value.trim();

      if (!keyword) {
        resultBox.innerHTML = "";
        resultBox.innerHTML = `<img src="../../../../imgage/Bean Eater@1x-1.0s-200px-200px.svg" alt="" id="#loader" class="loader" ">`;
        resultBox.style.display = "none";
        loaderEl.style.display = "none";
        return;
      }

      // Hủy request cũ nếu còn đang xử lý
      if (currentController) currentController.abort();
      currentController = new AbortController();
      // Lấy signal từ controller
      const signal = currentController.signal;

      loaderEl.style.display = "block";
      resultBox.style.display = "block";

      try {
        const response = await fetch(
          `/api/goi-y?q=${encodeURIComponent(keyword)}`,
          { signal }
        );
        const data = await response.json();

        loaderEl.style.display = "none";

        if (response.ok && Array.isArray(data)) {
          resultBox.innerHTML = data
            .map(
              (item) => `
            <li>
              <a href="/watch/${item.slug}"></a>
              <div class="anh">
                 <img src="https://phimimg.com/${item.poster_url}" alt="${item.name} onerror='this.src=\"../imgage/coco.jpg"">
              </div>
              <div>
                 <p class="vie">${item.name}</p>
                 <p class="eng">${item.name}</p>
              </div>
            </li>
            `
            )
            .join("");
        } else {
          resultBox.innerHTML = "<li>No results found</li>";
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
          loaderEl.style.display = "none";
          resultBox.innerHTML = "<li>Error loading suggestions</li>";
        }
      }
    }, 200);
  });
}

hamgoiy(input, goiy, loader);
hamgoiy(inputtable, goiytable, loader);
document.addEventListener("click", (e) => {
  if (!input.contains(e.target) && !goiy.contains(e.target)) {
    goiy.style.display = "none";
  }
});

document.addEventListener("click", (e) => {
  if (!inputtable.contains(e.target) && !goiytable.contains(e.target)) {
    goiytable.style.display = "none";
  }
});

let thean = document.querySelector(
  "#header #nav .nav2 .about-user .showmore .theshow a"
);
if (!thean) {
  console.log("Không tìm thấy phần tử thean");
} else {
  console.log(thean);
  thean.addEventListener("click", function (e) {
    e.preventDefault();
    revealList();
  });
}

function revealList() {
  const list = document.querySelector(
    "#header #nav .nav2 .about-user .more-option ul "
  );
  const items = list.querySelectorAll(
    "#header #nav .nav2 .about-user .more-option ul li"
  );

  // Hiển thị danh sách nếu đang ẩn
  if (list.style.display === "none" || list.style.display === "") {
    list.style.display = "block";

    // Dùng setTimeout để chờ DOM render trước khi chạy hiệu ứng
    setTimeout(() => {
      items.forEach((item, index) => {
        setTimeout(() => {
          item.classList.add("hienthi");
          if (index === items.length - 1) {
            item.scrollIntoView({ behavior: "smooth", block: "end" });
          }
        }, index * 200); // delay từng dòng
      });
    }, 10); // Delay nhỏ để đảm bảo DOM đã vẽ lại
  } else {
    // Ẩn danh sách nếu đang hiển thị
    items.forEach((item) => {
      item.classList.remove("hienthi");
    });
    setTimeout(() => {
      list.style.display = "none";
    }, items.length * 100); // Đợi hiệu ứng hoàn thành trước khi ẩn
  }
}

let v = document.querySelector("#header #nav .nav2 .about-user .btn-close");
if (!v) {
  console.log("Không tìm thấy phần tử v");
} else {
  v.addEventListener("click", function (event) {
    event.preventDefault();
    document.querySelector(
      "#header #nav .nav2 .login-sucess .about-user"
    ).style.display = "none";
  });
}

let loginSuccessImg = document.querySelector(
  "#header #nav .nav2 .login-sucess .img-1"
);
if (loginSuccessImg) {
  loginSuccessImg.addEventListener("click", () => {
    let a = document.querySelector(
      "#header #nav .nav2 .login-sucess .about-user"
    );
    if (a.style.display === "none" || a.style.display === "") {
      a.style.display = "block";
    } else {
      a.style.display = "none";
    }
  });
}
let logoutBtn = document.querySelector(
  "#header #nav .nav2 .about-user .more-option .logout"
);
if (logoutBtn) {
  logoutBtn.addEventListener("click", async (event) => {
    event.preventDefault();
    let conf = confirm("Bạn có chắc muốn đăng xuất không?");
    if (conf) {
      try {
        let respone = await fetch("/logout");
        if (respone.ok) {
          window.location.reload();
        } else {
          alert("Lỗi đăng xuất. Vui lòng thử lại sau.");
        }
      } catch (error) {
        console.error("Lỗi khi đăng xuất:", error);
      }
    }
  });
}

let bell = document.querySelector("#header #nav .nav2 .notification i");
let more_notification = document.querySelector(
  "#header #nav .nav2 .notification .more-notification"
);
if (bell) {
  bell.addEventListener("click", (event) => {
    event.stopPropagation();
    if (
      more_notification.style.display === "none" ||
      more_notification.style.display === ""
    ) {
      more_notification.style.display = "block";
    } else {
      more_notification.style.display = "none";
    }
  });
}
