const express = require("express");
const app = express();
const sql = require("mssql");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
app.use(express.static(path.join(__dirname, "../../uploads")));
app.use(express.json()); // Middleware để parse JSON request body
app.use(cors());
// app.use(express.static(path.join(__dirname, "uploads")));
let config = require("../../config/AdminDatabase");

const addanhdaidien = async (app) => {
  app.post("/anhdaidien", async (req, res) => {
    let { url, email } = req.body;
    console.log("Received request to update avatar:", { url, email });
    try {
      let pool = await sql.connect(config);
      let result = await pool
        .request()
        .input("email", sql.VarChar, email)
        .input("url_image", sql.NVarChar, String(url))
        .query("UPDATE users SET url_image = @url_image WHERE email = @email;");
      req.session.user.avatar = url;
      res.status(200).json({ message: "Đã update anh đại diện" });
    } catch (err) {
      console.log(err);
    }
  });

  app.post("/editprofile", async (req, res) => {
    let { email, location, work, phone, bio } = req.body;

    console.log("Received request to update profile:", {
      email,
      location: location,
      linkfb: work,
      phone: phone,
      bio: bio,
    });

    try {
      let pool = await sql.connect(config);
      let result = await pool
        .request()
        .input("email", sql.VarChar, email)
        .input("address", sql.NVarChar, String(location))
        .input("linkfb", sql.NVarChar, String(work))
        .input("phone", sql.NVarChar, String(phone))
        .input("about_me", sql.NVarChar, String(bio))
        .query(
          "UPDATE users SET address = @address, linkfb = @linkfb, phone = @phone, about_me = @about_me WHERE email = @email"
        );
      res.status(200).json({ message: "Đã update thống tin ca nhan" });
    } catch (err) {
      console.log(err);
    }
  });

  app.get("/checkfriend", async (req, res) => {
    let { user_email, friend_email } = req.query;
    if (!user_email || !friend_email) {
      return res
        .status(400)
        .json({ message: "Missing user_email or friend_email" });
    }
    try {
      let pool = await sql.connect(config);
      let result = await pool
        .request()
        .input("user_email", sql.VarChar, user_email)
        .input("friend_email", sql.VarChar, friend_email)
        .query(`SELECT status FROM friends f
              WHERE (
                (f.user_email = @user_email AND f.friend_email = @friend_email)
              OR
                (f.user_email = @friend_email AND f.friend_email = @user_email)
                )
              AND status = 'accepted' `);
      if (result.recordset.length > 0) {
        return res.json(result.recordset[0]);
      } else {
        return res.json({ message: "User not found" });
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/getPending", async (req, res) => {
    let { friend_email } = req.query;
    if (!friend_email) {
      return res
        .status(400)
        .json({ message: "Missing user_email or friend_email" });
    }
    try {
      let pool = await sql.connect(config);
      let result = await pool
        .request()
        .input("friend_email", sql.VarChar, friend_email).query(` SELECT 
              u.username,
              f.friend_email, 
              f.user_email, 
              f.status, 
              u.url_image
          FROM 
              friends f
          INNER JOIN 
              users u ON f.user_email = u.email
          WHERE 
              f.friend_email = @friend_email
              AND f.status = 'pending'
          ORDER BY 
              f.created_at ASC; `);
      if (result.recordset.length > 0) {
        return res.json(result.recordset);
      } else {
        return res.json({ message: "User not found" });
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/getFriends", async (req, res) => {
    let { email } = req.query;
    try {
      let pool = await sql.connect(config);
      let result = await pool
        .request()
        .input("email", sql.VarChar, email)
        .query(
          `SELECT u.* FROM users u
            WHERE u.email IN (
            SELECT friend_email FROM friends WHERE user_email = @email AND status = 'accepted'
            UNION
            SELECT user_email FROM friends WHERE friend_email = @email AND status = 'accepted');`
        );
      // console.log(result.recordset);
      res.status(200).json(result.recordset);
    } catch (err) {
      console.log(err);
    }
  });
  app.post("/addFriends", async (req, res) => {
    let { user_email, friend_email } = req.body;
    try {
      let pool = await sql.connect(config);
      let result = await pool
        .request()
        .input("user_email", sql.VarChar, user_email)
        .input("friend_email", sql.VarChar, friend_email)
        .query(
          "INSERT INTO friends (user_email, friend_email, status) VALUES (@user_email, @friend_email, 'pending');"
        );
      res.status(200).json({ message: "Đã thêm bạn" });
    } catch (err) {
      console.log(err);
    }
  });

  app.post("/deleteFriends", async (req, res) => {
    let { user_email, friend_email } = req.body;
    try {
      let pool = await sql.connect(config);
      let result = await pool
        .request()
        .input("user_email", sql.VarChar, user_email)
        .input("friend_email", sql.VarChar, friend_email)
        .query(
          "DELETE FROM friends WHERE (user_email = @user_email AND friend_email = @friend_email) OR (user_email = @friend_email AND friend_email = @user_email);"
        );
      res.status(200).json({ message: "Đã xóa bạn" });
    } catch (err) {
      console.log(err);
    }
  });

  app.post("/acceptFriends", async (req, res) => {
    let { user_email, friend_email } = req.body;
    try {
      let pool = await sql.connect(config);
      let result = await pool
        .request()
        .input("user_email", sql.VarChar, friend_email) // người đã gửi lời mời
        .input("friend_email", sql.VarChar, user_email) // người đang chấp nhận
        .query(`
        UPDATE friends 
        SET status = 'accepted'
        WHERE user_email = @user_email AND friend_email = @friend_email AND status = 'pending' OR user_email = @friend_email AND friend_email = @user_email AND status = 'pending';
      `);

      if (result.rowsAffected[0] > 0) {
        res.status(200).json({ message: "Đã thêm bạn thành công" });
      } else {
        res
          .status(404)
          .json({ message: "Không tìm thấy lời mời để chấp nhận" });
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Lỗi server" });
    }
  });

  app.get("/checkpending", async (req, res) => {
    let { user_email, friend_email } = req.query;
    console.log(user_email, friend_email);
    if (!user_email || !friend_email) {
      return res
        .status(400)
        .json({ message: "Missing user_email or friend_email" });
    }
    try {
      let pool = await sql.connect(config);
      let result = await pool
        .request()
        .input("user_email", sql.VarChar, user_email)
        .input("friend_email", sql.VarChar, friend_email)
        .query(`SELECT status FROM friends f
              WHERE (
                (f.user_email = @user_email AND f.friend_email = @friend_email)
              OR
                (f.user_email = @friend_email AND f.friend_email = @user_email)
                )
              AND status = 'pending' `);
      console.log(result.recordset);
      if (result.recordset.length > 0) {
        return res.json(result.recordset[0]);
      } else {
        return res.json({ message: "User not found" });
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/checkpendingreceived", async (req, res) => {
    let { user_email, friend_email } = req.query;
    console.log(user_email, friend_email);
    if (!user_email || !friend_email) {
      return res
        .status(400)
        .json({ message: "Missing user_email or friend_email" });
    }
    try {
      let pool = await sql.connect(config);
      let result = await pool
        .request()
        .input("user_email", sql.VarChar, user_email) // người ĐANG NHẬN lời mời
        .input("friend_email", sql.VarChar, friend_email) // người GỬI lời mời
        .query(`
        SELECT status FROM friends f
        WHERE f.user_email = @friend_email AND f.friend_email = @user_email
        AND status = 'pending'
      `);

      console.log(result.recordset);

      if (result.recordset.length > 0) {
        return res.json({ status: true }); // đang chờ xác nhận
      } else {
        return res.json({ status: false }); // không có lời mời đến
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });
};

module.exports = addanhdaidien;
