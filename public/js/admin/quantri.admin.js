const rowsPerPage = 5;
let currentPage = 1;
let users = [...admins, ...userss];
function toggleForm() {
  const form = document.getElementById("user-form-container");
  form.classList.toggle("hidden");
  if (form.classList.contains("hidden")) {
    resetForm();
  }
}
function resetForm() {
  document.getElementById("user-form").reset();
  document.getElementById("edit-index").value = "";
  document.querySelector("#user-form-container .btn-add").textContent = "Thêm";
}
function renderUsers(filter = "") {
  const tbody = document.getElementById("user-table");
  const pagination = document.getElementById("pagination");
  tbody.innerHTML = "";
  pagination.innerHTML = "";
  const filtered = users.filter(
    (user) =>
      typeof user.username === "string" &&
      user.username.toLowerCase().includes(filter.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  filtered.slice(start, end).forEach((user, index) => {
    const realIndex = users.indexOf(filtered[start + index]);
    const tr = document.createElement("tr");
    tr.innerHTML = `
        <td class="px-6 py-4">${user.username}</td>
        <td class="px-6 py-4">${user.email}</td>
        <td class="px-6 py-4">${user.phone}</td>
        <td class="px-6 py-4">${user.address}</td>
        <td class="px-6 py-4">
        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          user.role === "admin"
            ? "bg-green-100 text-green-800"
            : "bg-gray-100 text-gray-800"
        }">
        ${user.role}
        </span>
        </td>
        <td class="px-6 py-4 text-right space-x-2">
        <button onclick="editUser(${realIndex})" class="text-blue-600 hover:text-blue-900">Sửa</button>
        <button onclick="deleteUser(${realIndex})" class="text-red-600 hover:text-red-800">Xóa</button>
        </td>
        `;
    tbody.appendChild(tr);
  });
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = `px-3 py-1 border rounded ${
      i === currentPage ? "bg-blue-500 text-white" : "bg-white text-gray-700"
    }`;
    btn.onclick = () => {
      currentPage = i;
      renderUsers(document.getElementById("search").value);
    };
    pagination.appendChild(btn);
  }
}

let addUserAPI = async (Object) => {
  try {
    const response = await fetch("/admin/addusers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(Object),
    });

    const data = await response.json();
    console.log(data);
  } catch (err) {
    console.log(err);
  }
};
function editUser(index) {
  const user = users[index];
  document.querySelector("#user-form-container .btn-add").textContent =
    "Chỉnh sửa";
  document.getElementById("edit-index").value = index;
  document.getElementById("name").value = user.username;
  document.getElementById("email").value = user.email;
  document.getElementById("phone").value = user.phone;
  document.getElementById("province").value = user.address;
  document.getElementById("password").value = user.password_hash;
  document.getElementById("role").value = user.role;
  document.getElementById("user-form-container").classList.remove("hidden");
}

let deleteUserAPI = async (index) => {
  try {
    const response = await fetch("/admin/deleteusers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(users[index]),
    });

    const data = await response.json();
    console.log(data);
  } catch (err) {
    console.log(err);
  }
};
function deleteUser(index) {
  if (confirm("Bạn có chắc muốn xóa người dùng này?")) {
    deleteUserAPI(index);
    console.log(users[index].email);
    users.splice(index, 1);
    renderUsers(document.getElementById("search").value);
  }
}

let editUserAPI = async (index) => {
  try {
    const response = await fetch("/admin/editusers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(users[index]),
    });

    const data = await response.json();
    console.log(data);
  } catch (err) {
    console.log(err);
  }
};
document
  .getElementById("user-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const index = document.getElementById("edit-index").value;
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const role = document.getElementById("role").value;
    const phone = document.getElementById("phone").value;
    const address = document.getElementById("province").value;
    const password = document.getElementById("password").value;
    if (index === "") {
      users.push({
        username: name,
        email,
        role,
        phone,
        address,
        password_hash: password,
      });
      console.log(users[users.length - 1]);
      addUserAPI(users[users.length - 1]);
    } else {
      users[index] = {
        username: name,
        email,
        role,
        phone,
        address,
        password_hash: password,
      };
      console.log(users[index]);
      editUserAPI(index);
    }

    resetForm();
    document.getElementById("user-form-container").classList.add("hidden");
    renderUsers(document.getElementById("search").value);
  });
document.getElementById("search").addEventListener("input", function () {
  currentPage = 1;
  renderUsers(this.value);
});
renderUsers();
function togglePasswordVisibility() {
  const passwordInput = document.getElementById("password");
  const eyeIcon = document.getElementById("password-eye");
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    eyeIcon.classList.remove("fa-eye");
    eyeIcon.classList.add("fa-eye-slash");
  } else {
    passwordInput.type = "password";
    eyeIcon.classList.remove("fa-eye-slash");
    eyeIcon.classList.add("fa-eye");
  }
}
const provinces = [
  "Hà Nội",
  "Hồ Chí Minh",
  "Hải Phòng",
  "Đà Nẵng",
  "Cần Thơ",
  "An Giang",
  "Bà Rịa - Vũng Tàu",
  "Bạc Liêu",
  "Bắc Giang",
  "Bắc Kạn",
  "Bắc Ninh",
  "Bến Tre",
  "Bình Dương",
  "Bình Định",
  "Bình Phước",
  "Bình Thuận",
  "Cà Mau",
  "Cao Bằng",
  "Đắk Lắk",
  "Đắk Nông",
  "Điện Biên",
  "Đồng Nai",
  "Đồng Tháp",
  "Gia Lai",
  "Hà Giang",
  "Hà Nam",
  "Hà Tĩnh",
  "Hải Dương",
  "Hậu Giang",
  "Hòa Bình",
  "Hưng Yên",
  "Khánh Hòa",
  "Kiên Giang",
  "Kon Tum",
  "Lai Châu",
  "Lâm Đồng",
  "Lạng Sơn",
  "Lào Cai",
  "Long An",
  "Nam Định",
  "Nghệ An",
  "Ninh Bình",
  "Ninh Thuận",
  "Phú Thọ",
  "Phú Yên",
  "Quảng Bình",
  "Quảng Nam",
  "Quảng Ngãi",
  "Quảng Ninh",
  "Quảng Trị",
  "Sóc Trăng",
  "Sơn La",
  "Tây Ninh",
  "Thái Bình",
  "Thái Nguyên",
  "Thanh Hóa",
  "Thừa Thiên Huế",
  "Tiền Giang",
  "Trà Vinh",
  "Tuyên Quang",
  "Vĩnh Long",
  "Vĩnh Phúc",
  "Yên Bái",
];
const select = document.getElementById("province");
select.innerHTML =
  `<option value="">-- Chọn tỉnh/thành phố --</option>` +
  provinces.map((p) => `<option value="${p}">${p}</option>`).join("");
