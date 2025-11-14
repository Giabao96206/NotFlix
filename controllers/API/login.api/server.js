const express = require("express");
const sql = require("mssql");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
app.use(cors()); // Cho phép truy cập từ trình duyệt
app.use(bodyParser.json()); // Xử lý dữ liệu JSON từ client
const os = require("os"); // Đảm bảo đã require 'os' module
const networkInterfaces = os.networkInterfaces();

function getLocalIP() {
  for (const interfaceName in networkInterfaces) {
    for (const iface of networkInterfaces[interfaceName]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost";
}
// Cấu hình SQL Server
let config = require("../../../config/AdminDatabase");
// API thêm người dùng

const adduser = (app) => {
  app.post("/pushuser", async (req, res) => {
    const { username, password, email } = req.body;

    if (!username || !password || !email) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu thông tin!" });
    }

    let pool;
    try {
      pool = await sql.connect(config);
      console.log("📩 Dữ liệu nhận được:", { username, password, email });

      // Kiem tra Name và email
      const check = await pool
        .request()
        .input("username", sql.VarChar, username)
        .input("email", sql.VarChar, email)
        .query(
          "SELECT * FROM users WHERE username = @username OR email = @email;"
        );
      if (check.recordset.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Tài khoản hoặc email và username đã đc dùng!",
        });
      }

      // Thêm ng dùng
      const result = await pool
        .request()
        .input("email", sql.VarChar, email)
        .input("username", sql.VarChar, username)
        .input("password", sql.VarChar, password)
        .query(
          "INSERT INTO users (username, password_hash, email) VALUES (@username, @password, @email);"
        );

      if (!result) {
        return res.status(500).json({
          success: false,
          message: "Thêm người dùng thất bại!",
        });
      }
      return res.json({
        success: true,
        message: "Thêm người dùng thành công!",
        result,
      });
    } catch (err) {
      console.log("❌ Lỗi API /register:", err);
      return res.status(500).json({ success: false, error: err.message });
    } finally {
      if (pool) await sql.close(); // Đóng kết nối đúng cách
    }
  });
};

module.exports = adduser;
