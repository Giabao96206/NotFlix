let host = window.location.hostname;
const forgotpass = document.getElementById("forgotpass");
const Signin = document.getElementById("a22");
let buttonforgot = document.getElementsByClassName("button-forgot");
let alertne = document.getElementById("alertne");
let text = document.querySelector("#alertne .box-alert #success");
forgotpass.addEventListener("click", (event) => {
  event.preventDefault();
  document.getElementsByClassName("login-user")[0].style.display = "none";
  document.getElementsByClassName("forgot")[0].style.display = "block";
});

Signin.addEventListener("click", (event) => {
  event.preventDefault();

  document.getElementsByClassName("forgot")[0].style.display = "none";
  document.getElementsByClassName("login-user")[0].style.display = "block";
});

document.getElementById("span-clos").addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    document.getElementById("form-veryfi").style.display = "none";
  }
});

// Phần đếm ngược của phần verify-code

buttonforgot[0].addEventListener("click", async (event) => {
  event.preventDefault();
  let email = document.getElementById("input-email-forgot").value;
  APICODE();
  if (!email) {
    text.innerHTML = "Vui lòng nhập email";
    alertne.style.display = "block";
    setTimeout(() => {
      alertne.style.display = "none";
    }, 3000);
    return;
  } else {
    document.getElementById("form-veryfi").style.visibility = "visible";
    let timeleft = 5 * 60; // Đặt số giây đếm ngược
    let interval = setInterval(() => {
      let Minute = Math.floor(timeleft / 60);
      let secon = timeleft % 60;
      // Định dạng số giây và phút để hiển thị đẹp hơn
      let formattedTime = `${String(Minute).padStart(2, "0")}:${String(
        secon
      ).padStart(2, "0")}`;
      if (timeleft <= 0) {
        clearInterval(interval); // Dừng bộ đếm
        console.log("end");
        // Ẩn nút gửi code và hiển thị nút tiếp theo
        let b = document.getElementById("send-code");
        b.style.display = "none";
        let a = document.getElementById("send-code-next");
        a.style.display = "inline-block";
        a.addEventListener("click", () => {
          a.style.display = "none";
          b.style.display = "inline-block";
          APICODE();
          let timeleft = 5 * 60; // Đặt số giây đếm ngược
          let interval = setInterval(() => {
            let Minute = Math.floor(timeleft / 60);
            let secon = timeleft % 60;
            // Định dạng số giây và phút để hiển thị đẹp hơn
            let formattedTime = `${String(Minute).padStart(2, "0")}:${String(
              secon
            ).padStart(2, "0")}`;
            if (timeleft <= 0) {
              clearInterval(interval); // Dừng bộ đếm
              console.log("end");
              // Ẩn nút gửi code và hiển thị nút tiếp theo
              document.getElementById("send-code").style.display = "none";
              document.getElementById("send-code-next").style.display =
                "inline-block";
            } else {
              document.getElementById("send-code").innerHTML = formattedTime;
              timeleft--;
            }
          }, 1000);
        });
      } else {
        document.getElementById("send-code").innerHTML = formattedTime;
        timeleft--;
      }
    }, 1000);
  }
});

// Verify

let Verify = document.getElementsByClassName("verify");
let arr = [];
for (let i = 1; i <= 4; i++) {
  arr.push(document.getElementById("input-" + i));
}

Verify[0].addEventListener("click", () => {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].value.trim() === "") {
      text.innerHTML = "Vui lòng nhập đầy đủ mã xác nhận";
      alertne.style.display = "block";
      setTimeout(() => {
        alertne.style.display = "none";
      }, 3000);
      return;
    }
  }
  let codeArr = arr.map((x) => x.value).join("");
  console.log(codeArr);
  const check = async () => {
    let email = document.getElementById("input-email-forgot").value;
    try {
      let response = await fetch(`/selectCode`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          code: codeArr,
        }),
      });
      const data = await response.json();
      console.log(data);
      if (!response.ok) {
        text.innerHTML = "Vui lòng nhập đúng mã xác nhận";
        alertne.style.display = "block";
        setTimeout(() => {
          alertne.style.display = "none";
        }, 3000);
      } else {
        console.log("Xác nhận thành công:", data);
        document.getElementById("form-veryfi").style.visibility = "hidden";
        // chọn phần tử cha
        const target = document.querySelector(
          "#main .login .forgot .form-pass"
        );

        // thêm div ngay sau nó
        target.insertAdjacentHTML(
          "afterend",
          `
        <div class="form-sub" id="form-reset">
          <input type="password" placeholder="New Password" />
          <div class="icon-login"><i class="ti-lock"></i></div>
        </div>
      `
        );
        document.getElementById("form-reset").style.display = "block";
        document.getElementsByClassName("button-forgot")[0].style.display =
          "none";
        document.getElementsByClassName("button-forgot")[1].style.display =
          "block";
      }
    } catch (error) {
      console.error("Lỗi:", error.message);
    }
  };
  check();
});

document.querySelectorAll(".box-alert #close").forEach((item) => {
  item.addEventListener("click", () => {
    alertne.style.display = "none";
  });
});
