let path = window.location.pathname.split("/");
console.log(path);

let avatar = document.querySelector(
  ".main-content .content .container .comment-fb form.comment-form .avatar"
);
console.log(avatar.src);
const socket = io();
const form = document.querySelector(
  ".main-content .content .container .comment-fb form.comment-form"
);
const nameInput = document.querySelector(
  ".main-content .content .container .comment-fb .comment-container .comment-form .input-area h4"
);
const commentInput = document.querySelector(
  ".main-content .content .container .comment-fb .input-area textarea"
);
const imageInput = document.querySelector(
  ".main-content .content .container .comment-fb #image-input"
);

// console.log(imageInput);
const commentList = document.querySelector(
  ".main-content .content .container .comment-fb ul.comment-list"
);
const iconBar = document.querySelector(
  ".main-content .content .container .comment-fb .icon-bar"
);
// const modal = document.querySelector(
//   ".main-content .content .container .comment-fb #image-modal"
// );
const modalImg = document.querySelector(
  ".main-content .content .container .comment-fb #modal-img"
);
const preview = document.querySelector(
  ".main-content .content .container .comment-fb #preview"
);

console.log(commentList);
function formatTime() {
  const now = new Date();
  return now.toISOString();
}
// function restoreImageURLsFromJoinedString(joinedString) {
//   if (!joinedString || typeof joinedString !== "string") return [];
//   return joinedString
//     .split(/(?=data:image\/[a-zA-Z]+;base64,)/)
//     .filter(Boolean);
// }

function chuyendoi(timeStr) {
  const date = new Date(timeStr);
  if (isNaN(date)) return "00:00";

  const hours = `0${date.getHours()}`.slice(-2);
  const minutes = `0${date.getMinutes()}`.slice(-2);

  return `${hours}:${minutes}`;
}
const loadComments = async () => {
  try {
    let result = await fetch(`/commentapi?slug=${path[2]}`);
    let data = await result.json();
    console.log(data);
    data.forEach((comment) => {
      const li = renderComment(
        comment.email,
        comment.content,
        chuyendoi(comment.created_at),
        comment.image_url,
        comment.url_image
      );
      commentList.appendChild(li);
    });
  } catch (error) {
    console.log(error);
  }
};

const renderImages = (imageURLs) => {
  if (!imageURLs || (Array.isArray(imageURLs) && imageURLs.length === 0))
    return "";
  const urls = Array.isArray(imageURLs) ? imageURLs : [imageURLs];
  return `
        <div class="comment-images">
          ${urls
            .map(
              (url) =>
                `<img src="${url}" class="comment-image" data-url="${url}" />`
            )
            .join("")}
        </div>`;
};

function renderComment(name, text, time, imageURLs, url_image) {
  const li = document.createElement("li");
  li.className = "comment-item";
  li.innerHTML = `
        <img src="${url_image}" alt="avatar" class="avatar">
        <div class="comment-content">
          <strong>${name}</strong>
          <p>${text}</p>     
            ${renderImages(imageURLs)}
          <div class="comment-time">${time}</div>
        </div>
      `;
  return li;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = nameInput.textContent;
  const text = commentInput.value.trim();
  const files = Array.from(imageInput.files);
  if (!name || !text) return;

  let url = "";

  if (files.length > 0) {
    const formData = new FormData();
    formData.append("image", files[0]);

    try {
      const response = await fetch("/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        console.error("Lỗi khi upload ảnh:", data.message);
        return;
      }
      url = data.imageUrl.join(","); // Giả sử server trả về mảng URL
    } catch (error) {
      console.error("Lỗi khi upload ảnh:", error);
      return;
    }
  }

  socket.emit("on-chat", {
    name,
    text,
    url, // có thể là "" nếu không có ảnh
    time: formatTime(),
    slug: path[2],
    avatar: avatar.src,
  });

  commentInput.value = "";
  imageInput.value = "";
  preview.innerHTML = "";
});

socket.on("user-chat", (data) => {
  commentList.appendChild(
    renderComment(
      data.name,
      data.text,
      chuyendoi(data.time),
      data.url,
      data.avatar
    )
  );
});
iconBar.querySelectorAll("span").forEach((icon) => {
  icon.addEventListener("click", () => {
    commentInput.value += icon.dataset.emoji;
    commentInput.focus();
  });
});

imageInput.addEventListener("change", () => {
  const files = Array.from(imageInput.files);
  preview.innerHTML = "";
  files.forEach((file) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = document.createElement("img");
      img.src = reader.result;
      preview.appendChild(img);
    };
    reader.readAsDataURL(file);
  });
});

commentList.addEventListener("click", (e) => {
  if (e.target.classList.contains("comment-image")) {
    modalImg.src = e.target.dataset.url;
    modal.style.display = "flex";
  }
});

// modal.addEventListener("click", () => {
//   modal.style.display = "none";
// });

loadComments();
