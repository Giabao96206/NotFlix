let socket = io();
if (users) {
  socket.on("connect", () => {
    mySocketId = socket.id;
    socket.emit("register", { email: users.email });
  });
}
let notification = document.querySelector(
  "#header #nav .nav2 .notification .more-notification .add-friend"
);

if (socket) {
  socket.on("send-add-friend", (data) => {
    let li = document.createElement("li");
    li.classList.add("add");
    li.innerHTML = `
      <div class="img-friend">
        <img src="${data.avatar}" alt="" />
      </div>
      <div class="name-friend">
        <p class="name">${data.name} đã gửi yêu cầu kết bạn</p>
        <div class="pending">
          <button class="accept">Chấp nhận</button>
          <button class="decline">Từ chối</button>
        </div>
      </div>`;

    notification.appendChild(li);

    // Gắn sự kiện cho nút "Chấp nhận"
    li.querySelector(".accept").addEventListener("click", async () => {
      await fetch(`/acceptFriends`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_email: users.email,
          friend_email: data.from,
        }),
      });
      li.remove(); // ✅ chỉ xóa đúng thẻ này
    });

    // Gắn sự kiện cho nút "Từ chối"
    li.querySelector(".decline").addEventListener("click", async () => {
      await fetch(`/deleteFriends`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_email: users.email,
          friend_email: data.from,
        }),
      });
      li.remove(); // ✅ xóa đúng cái bị từ chối
    });
  });
} else {
  console.error("Socket not available!");
}

// Hàm xem tồn tại lời mời kết bạn nào của người dùng
async function viewPending() {
  try {
    let respone = await fetch(`/getPending?friend_email=${users.email}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!respone.ok) return;
    let data = await respone.json();
    if (data.length > 0) {
      data.forEach((item) => {
        let li = document.createElement("li");
        li.classList.add("add");
        li.innerHTML = `
      <div class="img-friend">
        <img src="${item.url_image}" alt="" />
      </div>
      <div class="name-friend">
        <p class="name">${item.username} đã gửi yêu cầu kết bạn</p>
        <div class="pending">
          <button class="accept">Chấp nhận</button>
          <button class="decline">Từ chối</button>
        </div>
      </div>`;
        notification.appendChild(li);

        li.querySelector(".accept").addEventListener("click", async () => {
          await fetch(`/acceptFriends`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_email: users.email,
              friend_email: item.user_email,
            }),
          });
          li.remove(); // ✅ chỉ xóa đúng thẻ này
        });

        // Gắn sự kiện cho nút "Từ chối"
        li.querySelector(".decline").addEventListener("click", async () => {
          await fetch(`/deleteFriends`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_email: users.email,
              friend_email: item.user_email,
            }),
          });
          li.remove(); // ✅ xóa đúng cái bị từ chối
        });
      });
    }
  } catch (err) {
    console.log(err);
  }
}

viewPending();
