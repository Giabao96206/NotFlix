// let socket = io();

let url = "";

console.log(profiles);
let avainput = document.querySelector("#avatar-input");
// console.log(avainput);
function editInfo() {
  toggleDisplay("info-display", "none");
  toggleDisplay("info-edit", "block");

  const fields = {
    location: "#location .about-location",
    work: "#work .about-linkfb",
    phone: "#phone .about-phone",
    bio: "#bio",
  };

  Object.entries(fields).forEach(([key, selector]) => {
    document.getElementById(`edit-${key}`).value =
      document.querySelector(selector)?.innerText || "";
  });
}

function toggleDisplay(id, display) {
  document.getElementById(id).style.display = display;
}

function cancelEdit() {
  document.getElementById("info-edit").style.display = "none";
  document.getElementById("info-display").style.display = "block";
}

async function saveInfo() {
  // Cập nhật nội dung
  const fields = {
    location: "edit-location",
    work: "edit-work",
    phone: "edit-phone",
    bio: "edit-bio",
  };

  const data = {};

  for (let key in fields) {
    const value = document.getElementById(fields[key]).value.trim();
    data[key] = value;
    const displaySelector =
      key === "bio"
        ? "#bio"
        : `#${key} .about-${key === "work" ? "linkfb" : key}`;
    document.querySelector(displaySelector).innerText = value || "";
  }

  try {
    let response = await fetch("/editprofile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ ...data, email: user.email }),
    });
    if (!response.ok) {
      console.log("Lỗi khi cập nhật thống tin");
    }
    console.log("Đã cập nhật thống tin");
  } catch (err) {
    console.error("Lỗi khi lưu thông tin:", err);
  }
  cancelEdit();
}
let originalAvatarSrc = document.querySelector(".avatar").src;

function changeAvatar(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    // Lưu lại ảnh cũ trước khi xem trước
    originalAvatarSrc = document.querySelector(".avatar").src;

    // Xem trước ảnh mới
    document.querySelector(".avatar").src = e.target.result;

    // Hiện nút xác nhận
    document.querySelector(".change-avatar-btn").style.display = "none";
    document.querySelector(".avatar-action-buttons").style.display = "block";
  };
  reader.readAsDataURL(file);
}

async function confirmAvatar() {
  const file = Array.from(avainput.files)[0];
  // Ẩn nút xác nhận, giữ nguyên ảnh mới
  try {
    let formData = new FormData();
    formData.append("image", file);
    const response = await fetch("/upload", {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      throw new Error("Lỗi khi upload ảnh");
    }
    console.log("Đã upload ảnh thành công");
    const data = await response.json();
    url = data.imageUrl;
    console.log("URL ảnh:", url);
  } catch (error) {
    console.error("Lỗi khi upload ảnh:", error);
    return;
  }

  try {
    const response = await fetch("/anhdaidien", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url, email: user.email }),
    });
    const data = await response.json();
    document.querySelector("#header #nav .nav2 .login-sucess .img-1").src = url;
    document.querySelector(
      "#header #nav .nav2 .login-sucess .about-user .user-img .img img"
    ).src = url;
  } catch (err) {
    console.log(err);
  }

  document.querySelector(".avatar-action-buttons").style.display = "none";
  document.querySelector(".change-avatar-btn").style.display = "block";
}

function cancelAvatar() {
  // Trả lại ảnh cũ
  document.querySelector(".avatar").src = originalAvatarSrc;

  // Ẩn nút xác nhận
  document.querySelector(".avatar-action-buttons").style.display = "none";
  document.querySelector(".change-avatar-btn").style.display = "block";

  // Reset input file (để người dùng chọn lại ảnh nếu muốn)
  document.getElementById("avatar-input").value = "";
}

let a = document.querySelector(".profile-info");

async function checkfriend() {
  try {
    const response = await fetch(
      `/checkfriend?user_email=${user.email}&friend_email=${profiles.email}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      console.log("Lỗi khi kiểm tra kết bạn");
      return;
    }

    const data = await response.json();
    // console.log(data);

    const oldBtns = document.querySelector(".buttons");
    if (oldBtns) oldBtns.remove();

    const div = document.createElement("div");
    div.classList.add("buttons");

    if (data.status) {
      // Đã là bạn bè
      div.innerHTML = `
        <button id="remove-friend">Hủy kết bạn</button>
        <button class="send-message">💬 Nhắn tin</button>
      `;
      a.appendChild(div);

      document.querySelector(".send-message").addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = `/message/${profiles.email}`;
      });

      document
        .getElementById("remove-friend")
        .addEventListener("click", async (e) => {
          e.preventDefault();
          await fetch(`/deleteFriends`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_email: user.email,
              friend_email: profiles.email,
            }),
          });
          checkfriend();
        });
    } else if (user.email !== profiles.email) {
      // ✨ Kiểm tra xem có lời mời đến không (từ người kia)
      const pendingRes = await fetch(
        `/checkpendingreceived?user_email=${user.email}&friend_email=${profiles.email}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      const pendingReceived = await pendingRes.json();

      if (pendingReceived.status) {
        // 📥 Đang chờ xác nhận (người nhận)
        div.innerHTML = `
          <button id="accept-request">Chấp nhận</button>
          <button id="decline-request">Từ chối</button>
        `;
        a.appendChild(div);

        document
          .getElementById("accept-request")
          .addEventListener("click", async () => {
            await fetch(`/acceptFriends`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                user_email: user.email,
                friend_email: profiles.email,
              }),
            });

            checkfriend();
          });

        document
          .getElementById("decline-request")
          .addEventListener("click", async () => {
            await fetch(`/deleteFriends`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                user_email: user.email,
                friend_email: profiles.email,
              }),
            });
            checkfriend();
          });
      } else {
        // 🟡 Kiểm tra xem mình có gửi lời mời không
        const sentReq = await fetch(
          `/checkpending?user_email=${user.email}&friend_email=${profiles.email}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        const pendingData = await sentReq.json();

        if (pendingData.status) {
          // 🕒 Đã gửi lời mời
          div.innerHTML = `<button id="cancel-request">Hủy lời mời</button>`;
          a.appendChild(div);

          document
            .getElementById("cancel-request")
            .addEventListener("click", async () => {
              await fetch(`/deleteFriends`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  user_email: user.email,
                  friend_email: profiles.email,
                }),
              });
              checkfriend();
            });
        } else {
          // ➕ Chưa có gì
          div.innerHTML = `<button id="add-friend">Kết bạn</button>`;
          a.appendChild(div);

          document
            .getElementById("add-friend")
            .addEventListener("click", async () => {
              await fetch(`/addFriends`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  user_email: user.email,
                  friend_email: profiles.email,
                }),
              });
              socket.emit("add-friend", {
                from: user.email,
                to: profiles.email,
                name: user.name,
                avatar: user.avatar,
              });
              checkfriend();
            });
        }
      }
    }
  } catch (err) {
    console.error("Lỗi khi kiểm tra kết bạn:", err);
  }
}

checkfriend();

// Hiển thị Post
document.getElementById("tab-posts").addEventListener("click", function (e) {
  e.preventDefault();
  // Ẩn phần danh sách bạn bè
  document.getElementById("friends-list").style.display = "none";
  document.getElementById("friends-list2").style.display = "none";
  // Hiện các phần profile info và details
  document.querySelector(".profile-details").style.display = "block";

  // Đổi đường dẫn URL mà không reload
  history.pushState(null, "", `/profile/${profiles.email}`);
});

// Hàm render friends
let renderFriends = async () => {
  try {
    let response = await fetch(`/getFriends?email=${profiles.email}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) return;
    let data = await response.json();
    console.log(data);
    let a = document.querySelector("#friends-list .danhsach");
    a.innerHTML = "";
    for (let friend of data) {
      let div = document.createElement("div");
      div.classList.add("friend");
      div.innerHTML = `
        <a href="/profile/${friend.email}"></a>
        <img src="${friend.url_image}" alt="Friend" />
        <p>${friend.username}</p>
      `;
      a.appendChild(div);
    }
  } catch (err) {
    console.log(err);
  }
};

// Hiển danh sách bằn bè
document
  .getElementById("tab-friends")
  .addEventListener("click", async function (e) {
    e.preventDefault();
    await renderFriends();
    // console.log(a);
    // Ẩn các phần profile info và details
    document.querySelector(".profile-details").style.display = "none";
    document.getElementById("friends-list2").style.display = "none";

    // Hiện phần danh sách bạn bè
    document.getElementById("friends-list").style.display = "block";

    // Đổi đường dẫn URL mà không reload
    // Kĩ thuật SPA
    history.pushState(null, "", `/profile/${profiles.email}/ban-be`);
  });

window.onpopstate = function (event) {
  // Xử lý hiển thị lại nội dung phù hợp theo URL
  const path = window.location.pathname;

  if (path === `/profile/${profiles.email}/ban-be`) {
    document.querySelector(".profile-details").style.display = "none";
    document.getElementById("friends-list").style.display = "block";
  } else if (path === `/profile/${profiles.email}/ket-noi`) {
    document.querySelector(".profile-details").style.display = "none";
    document.getElementById("friends-list").style.display = "none";
    document.getElementById("friends-list2").style.display = "block";
  } else {
    document.querySelector(".profile-details").style.display = "block";
    document.getElementById("friends-list").style.display = "none";
  }
};

// Hàm render bạn connect
let renderConnect = () => {
  let a = document.querySelector("#friends-list2 .danhsach");
  a.innerHTML = "";
  for (let friend of moreFriend) {
    let div = document.createElement("div");
    div.classList.add("friend");
    div.innerHTML = `
        <a href="/profile/${friend.email}"></a>
        <img style="width: 150px; height: 150px;" src="${friend.url_image}" alt="Friend" />
        <p>${friend.username}</p>
        <button>Kết bạn</button>
      `;
    a.appendChild(div);
  }
};

// Xử lí Kết nối bạn bè
console.log(moreFriend);
document.getElementById("tab-connect").addEventListener("click", function (e) {
  e.preventDefault();
  renderConnect();
  document.querySelector(".profile-details").style.display = "none";
  document.getElementById("friends-list").style.display = "none";
  document.getElementById("friends-list2").style.display = "block";

  history.pushState(null, "", `/profile/${profiles.email}/ket-noi`);
});

// renderConnect();
