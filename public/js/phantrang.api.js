let host = window.location.hostname;
console.log(num);
document
  .querySelector(
    ".main-content .content .container .block .heading ul li .btn-search "
  )
  .addEventListener("click", async function () {
    document.querySelector(
      ".main-content .content .container .block .content-search"
    ).style.display = "block";
    let x = document.querySelector(
      ".main-content .content .container .block .heading ul li .theloai"
    );
    let y = document.querySelector(
      ".main-content .content .container .block .heading ul li .quocgia"
    );
    let z = document.querySelector(
      ".main-content .content .container .block .heading ul li .namphathanh"
    );
    let a = document.querySelector(
      ".main-content .content .container .block .heading ul li .hinhthuc"
    );
    let b = document.querySelector(
      ".main-content .content .container .block .heading ul li .ngonngu"
    );
    let theloai = x.options[x.selectedIndex].text;
    let quocgia = y.options[y.selectedIndex].text;
    let namphathanh = z.options[z.selectedIndex].text;
    let hinhthuc = a.options[a.selectedIndex].text;
    let ngonngu = b.options[b.selectedIndex].text;

    if (theloai != "Thể loại") console.log(theloai);
    if (quocgia != "Quốc gia") console.log(quocgia);
    if (namphathanh != "Năm phát hành") console.log(namphathanh);
    if (hinhthuc != "Hình thức") console.log(hinhthuc);
    if (ngonngu != "Ngôn ngữ") console.log(ngonngu);
    let data;

    console.log("num", num);
    console.log("theloai", theloai);
    console.log("quocgia", quocgia);
    console.log("namphathanh", namphathanh);
    console.log("hinhthuc", hinhthuc);
    console.log("ngonngu", ngonngu);

    try {
      const response = await fetch(`/api/phantrang1`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          num,
          theloai,
          quocgia,
          namphathanh,
          hinhthuc,
          ngonngu,
        }),
      });

      if (response.ok) {
        console.log("Kết nối thành công");
        data = await response.json();
        console.log(data);
      } else {
        console.error("Lỗi kết nối:", response.status);
      }
    } catch (error) {
      console.error("Lỗi:", error);
    }

    let g = document.querySelectorAll(
      ".main-content .content .container .list-film .list-small"
    );

    const alertBox = document.createElement("div");
    alertBox.className = "hotro open";
    alertBox.innerHTML = `
      <div class="icon">
        <i class="ti-check"></i>
      </div>
      <p>Phim đã được lọc thành công mời bạn chọn</p>
    `;

    let content = document.querySelector(".mainhotro");

    content.appendChild(alertBox, content.firstChild);

    let inactivityTimer;
    function resetInactivityTimer() {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        alertBox.classList.remove("open");
        alertBox.classList.add("hide");
        setTimeout(() => alertBox.remove(), 500);
      }, 5000); // 5 giây không tương tác => ẩn
    }

    ["mousemove", "click", "mouseenter", "keydown", "touchstart"].forEach(
      (event) => {
        alertBox.addEventListener(event, resetInactivityTimer);
      }
    );

    resetInactivityTimer();
    for (let i = 0; i < g.length; i++) {
      if (data[i] !== undefined) {
        g[i].style.display = "block";
        g[i].children[0].src = "";
        g[i].children[1].innerText = data[i].lang + " - " + data[i].quality;
        g[i].children[2].innerText = data[i].name;
        g[i].children[0].src = `https://phimimg.com/${data[i].poster_url}`;
        g[i].children[4].href = `/watch/${data[i].slug}`;
        g[i].children[4].title = data[i].name;
      } else {
        g[i].style.display = "none";
      }
    }
  });

let list_small = document.querySelectorAll(
  ".main-content .content .container .list-film .list-small"
);

let observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
      } else {
        entry.target.classList.remove("show"); // Ẩn khi ra khỏi khung nhìn
      }
    });
  },
  {
    threshold: 0.1,
  }
);
list_small.forEach((box) => {
  observer.observe(box);
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
