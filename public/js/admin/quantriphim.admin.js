const rowsPerPage = 8;
let currentPage = 1;
console.log(film);
function renderUsers(filter = "") {
  const tbody = document.getElementById("film-table");
  const pagination = document.getElementById("pagination");
  tbody.innerHTML = "";
  pagination.innerHTML = "";

  // Lọc và sắp xếp theo năm tăng dần
  const filtered = film.filter((item) =>
    item.name.toLowerCase().includes(filter.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;

  // Hiển thị dòng dữ liệu
  filtered.slice(start, end).forEach((item) => {
    const realIndex = film.indexOf(item);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="px-6 py-4">${item.name}</td>
      <td class="px-6 py-4">${
        item.type === "single" ? "Phim lẻ" : "Phim bộ"
      }</td>
      <td class="px-6 py-4">${item.year}</td>
      <td class="px-6 py-4">${item.country}</td>
      <td class="px-6 py-4">
        <span class="px-2 inline-flex text-base leading-5  text-gray-800">
          ${item.category === "single" ? "Phim lẻ" : item.category}
        </span>
      </td>
      <td class="px-6 py-4 text-right space-x-2">
        <button onclick="editUser(${realIndex})" class="text-blue-600 hover:text-blue-900">Sửa</button>
        <button onclick="deleteUser(${realIndex})" class="text-red-600 hover:text-red-800">Xóa</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  renderPagination(totalPages, filter);
}
function renderPagination(totalPages, filter = "") {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  const maxVisiblePages = 5;
  const half = Math.floor(maxVisiblePages / 2);
  let startPage = Math.max(1, currentPage - half);
  let endPage = Math.min(totalPages, currentPage + half);

  if (currentPage <= half) {
    endPage = Math.min(totalPages, maxVisiblePages);
  }
  if (currentPage + half > totalPages) {
    startPage = Math.max(1, totalPages - maxVisiblePages + 1);
  }

  if (startPage > 1) {
    const firstBtn = document.createElement("button");
    firstBtn.textContent = "«";
    firstBtn.className = "px-2 py-1 border rounded bg-white text-gray-700";
    firstBtn.onclick = () => {
      currentPage = 1;
      renderUsers(filter);
    };
    pagination.appendChild(firstBtn);
  }

  for (let i = startPage; i <= endPage; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = `px-3 py-1 border rounded ${
      i === currentPage ? "bg-blue-500 text-white" : "bg-white text-gray-700"
    }`;

    btn.onclick = () => {
      currentPage = i;
      renderUsers(filter); // Sẽ truyền đúng currentPage sau khi set
    };
    pagination.appendChild(btn);
  }

  if (endPage < totalPages) {
    const lastBtn = document.createElement("button");
    lastBtn.textContent = "»";
    lastBtn.className = "px-2 py-1 border rounded bg-white text-gray-700";
    lastBtn.onclick = () => {
      currentPage = totalPages;
      renderUsers(filter);
    };
    pagination.appendChild(lastBtn);
  }

  console.log("startPage:", startPage, "endPage:", endPage);
}

document.getElementById("search").addEventListener("input", function () {
  currentPage = 1;
  renderUsers(this.value);
});

renderUsers();

async function deleteUser(index) {
  if (confirm("Bạn có chắc muốn xóa bộ phim này?")) {
    try {
      let respone = await fetch("/admin/deletefilms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: film[index]._id }),
      });

      let data = await respone.json();
      console.log(data);
    } catch (error) {
      console.error(error);
    }

    film.splice(index, 1);
    renderUsers(document.getElementById("search").value);
  }
}
// Nút back
function goBack() {
  document.getElementById("user-table").classList.remove("hidden");
  document.getElementById("edit-film").classList.add("hidden");
}

//
const fetchAPI = async (api) => {
  try {
    const response = await fetch(api);
    const data = await response.json();
    return data?.movie || data?.data?.items || [];
  } catch (error) {
    console.error(`Lỗi khi gọi API: ${api}`, error);
    return [];
  }
};

// Edit phim
async function editUser(index) {
  let a = film[index];
  let edit_film = document.getElementById("edit-film");
  document.getElementById("value-film").value = index;
  document.getElementById("name-film").value = a.name;
  document.getElementById("about-fim").value = a.slug;
  document.getElementById("phude-film").value = a.lang;
  document.getElementById("time").value = a.time;
  document.getElementById("category").value = a.category;
  document.getElementById("country").value = a.country;
  document.getElementById("release").value = a.chieurap ? "true" : "false";
  document.getElementById("year").value = a.year;
  document.getElementById("loaiphim").value = a.type;
  const img = new Image();
  const imgSrc = `https://phimimg.com/${a.poster_url}`;
  img.onload = function () {
    document.getElementById("preview-img").src = imgSrc;
  };
  img.onerror = function () {
    document.getElementById("preview-img").src = a.poster_url;
  };
  img.src = imgSrc;
  document.getElementById("user-table").classList.add("hidden");
  edit_film.classList.remove("hidden");
}

document.getElementById("update-film").addEventListener("click", async () => {
  const getValue = (id) => document.getElementById(id).value;
  const index = getValue("value-film");
  const updatedFilm = {
    name: getValue("name-film"),
    slug: getValue("about-fim"),
    lang: getValue("phude-film"),
    time: getValue("time"),
    category: getValue("category"),
    country: getValue("country"),
    chieurap: getValue("release"),
    year: getValue("year"),
    type: getValue("loaiphim"),
    poster_url: document
      .getElementById("preview-img")
      .src.substring(
        document.getElementById("preview-img").src.indexOf("/upload/")
      ),
  };

  console.log(updatedFilm["poster_url"]);

  // Cập nhật thông tin phim trong mảng
  film[index] = { ...film[index], ...updatedFilm };
  try {
    let respone = await fetch("/admin/updatefilms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ updatedFilm, id: film[index]._id }),
    });

    let data = await respone.json();
    console.log(data);
  } catch (error) {
    console.error(error);
  }

  // Hiển thị lại danh sách phim
  renderUsers(getValue("search"));

  // Giao diện
  document.getElementById("user-table").classList.remove("hidden");
  document.getElementById("edit-film").classList.add("hidden");
});

// Ảnh phim
async function readURL(input) {
  if (input.files && input.files[0]) {
    var reader = new FileReader();
    reader.onload = function (e) {
      document.getElementById("preview-img").src = e.target.result;
    };

    // Upload img
    const file = input.files[0];
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
      console.log("URL ảnh:", data.imageUrl);
      document.getElementById("preview-img").src = data.imageUrl;
    } catch (error) {
      console.error("Lỗi khi upload ảnh:", error);
      return;
    }
  }
}
