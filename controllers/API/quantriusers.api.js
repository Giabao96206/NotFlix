const express = require("express");
const app = express();
const sql = require("mssql");
const cors = require("cors");
app.use(express.json()); // Middleware để parse JSON request body
app.use(cors());
// app.use(express.static(path.join(__dirname, "uploads")));
let config = require("../../config/AdminDatabase");
// DTB mongoDB
const {
  PhimLe,
  PhimBo,
  PhimVienTuong,
} = require("../../models/products.model.js");
const { connectdtb } = require("../../config/database.js");
connectdtb();

app.use(express.json()); // Middleware để parse JSON request body
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "*" }));

// Hàm Update Film
async function updateMovieById(id, data) {
  const collections = [PhimBo, PhimLe, PhimVienTuong];

  for (const Model of collections) {
    const result = await Model.findByIdAndUpdate(id, data, { new: true });

    if (result) {
      console.log("Đã cập nhật thành công");
      return result;
    }
  }

  console.log("Không tìm thấy phim với ID:", id);
  return null;
}

// Hàm xóa Movie
async function deleteMovieById(id) {
  const collections = [PhimBo, PhimLe, PhimVienTuong];

  for (const Model of collections) {
    const deleted = await Model.findByIdAndDelete(id);

    if (deleted) {
      console.log("Đã xóa thành công phim:", deleted.title);
      return deleted;
    }
  }

  console.log("Không tìm thấy phim để xóa với ID:", id);
  return null;
}

const quantri = (app) => {
  app.post("/admin/addusers", async (req, res) => {
    let Object = req.body;

    try {
      const pool = await sql.connect(config);
      let respone = await pool
        .request()
        .input("username", sql.VarChar, String(Object.username))
        .input("email", sql.VarChar, String(Object.email))
        .input("password_hash", sql.VarChar, String(Object.password_hash))
        .input("phone", sql.NVarChar, String(Object.phone))
        .input("address", sql.NVarChar, String(Object.address))
        .input("role", sql.NVarChar, String(Object.role))
        .query(
          `INSERT INTO users (username, email,password_hash  , phone, address , role) VALUES (@username, @email, @password_hash , @phone, @address, @role);`
        );
      if (!respone)
        return res.status(400).json({ message: "Không thêm người dụng" });
      res.status(200).json({ message: "Đã thêm người dụng" });
    } catch (err) {
      console.log(err);
    }
  });

  app.post("/admin/editusers", async (req, res) => {
    const allowedFields = {
      username: sql.VarChar,
      password_hash: sql.VarChar,
      phone: sql.NVarChar,
      address: sql.NVarChar,
      role: sql.NVarChar,
    };

    let users = req.body;
    // console.log(users);
    if (users.email == undefined) {
      return res.status(400).json({ message: "Không có email" });
    }

    try {
      let pool = await sql.connect(config);
      let request = pool.request();
      let updates = [];

      for (let field in allowedFields) {
        if (users[field] !== undefined) {
          updates.push(`${field} = @${field}`);
          request.input(field, allowedFields[field], users[field]);
        }
      }

      if (updates.length === 0) {
        return res
          .status(400)
          .json({ message: "Không có thông tin nào để cập nhật" });
      }

      request.input("email", sql.VarChar, users.email);
      let query = `UPDATE users SET ${updates.join(", ")} WHERE email = @email`;
      await request.query(query);

      res.status(200).json({ message: "Cập nhật thành công" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Lỗi khi cập nhật thông tin" });
    }
  });

  app.post("/admin/deleteusers", async (req, res) => {
    try {
      let Object = req.body;
      let email = Object.email;
      let pool = await sql.connect(config);
      let respone = await pool
        .request()
        .input("email", sql.VarChar, String(email))
        .query(`DELETE FROM users WHERE email = @email;`);

      return res.status(200).json({ message: "Đã xóa người dụng" });
    } catch (err) {
      console.log(err);
    }
  });
  app.post("/admin/updatefilms", async (req, res) => {
    try {
      let Object = req.body.updatedFilm;
      let id = req.body.id;
      updateMovieById(id, Object);

      return res.status(200).json({ message: "Đã update phim" });
    } catch (err) {
      console.log(err);
    }
  });

  app.post("/admin/deletefilms", async (req, res) => {
    try {
      let id = req.body.id;
      deleteMovieById(id);
      return res.status(200).json({ message: "Đã xóa phim" });
    } catch (err) {
      console.log(err);
    }
  });
};

module.exports = quantri;
