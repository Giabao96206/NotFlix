const sql = require("mssql");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const session = require("express-session");
const app = express();
app.use(express.json()); // Middleware để parse JSON request body
app.use(cors({ origin: "*" }));
app.use(bodyParser.json());

let config = require("../../../config/AdminDatabase");

let checklogin = (app) => {
  // app.post("/checklogin",
  // ... đoạn đầu
  app.post("/checklogin", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đủ email và mật khẩu" });
    }
    console.log("Received login request:", { email, password });
    try {
      const pool = await sql.connect(config);
      const result = await pool
        .request()
        .input("email", sql.VarChar, email)
        .input("password", sql.VarChar, password)
        .query(
          "SELECT * FROM users WHERE email = @email AND password_hash = @password"
        );

      if (result.recordset.length === 0) {
        return res
          .status(400)
          .json({ message: "Email hoặc mật khẩu không đúng" });
      }

      const user = result.recordset[0];

      req.session.user = {
        email: user.email,
        name: user.username,
        avatar: user.url_image,
        role: user.role,
      };

      res.status(200).json({
        message: "Đăng nhập thành công",
        user: {
          email: user.email,
          name: user.username,
          avatar: user.url_image,
          role: user.role,
        },
      });
    } catch (err) {
      console.error("Error /checklogin:", err);
      return res
        .status(500)
        .json({ message: "Lỗi server", error: err.message });
    }
  });
};

module.exports = checklogin;
