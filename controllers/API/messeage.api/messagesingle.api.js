const express = require("express");
const app = express();
const port = 5000;
const sql = require("mssql");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
app.use(express.static(path.join(__dirname, "../../uploads")));
app.use(express.json()); // Middleware để parse JSON request body
app.use(cors());
// app.use(express.static(path.join(__dirname, "uploads")));
const config = {
  user: "sa",
  password: "Giahuybao123zx",
  server: "localhost",
  database: "DESKtop1",
  options: { encrypt: false, trustServerCertificate: true },
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage: storage });

const message = (app, io) => {
  app.get("/", (req, res) => {
    res.render("client/pages/message/message", {});
  });

  const users = {}; // users[email] = [socketId1, socketId2, ...]

  io.on("connection", (socket) => {
    // console.log("🔌 User connected, socket id:", socket.id);
    socket.emit("registered", { id_main: socket.id });

    // Khi client đăng ký (gửi email)
    socket.on("register", (data) => {
      const email = data.email;
      if (email) {
        if (!users[email]) users[email] = [];
        users[email].push(socket.id);
        socket.email = email; // lưu email vào socket để quản lý khi disconnect
        console.log(`✅ Registered ${email} with socket ${socket.id}`);
      }
    });

    // Khi đang gõ
    socket.on("typing", (data) => {
      const toSocketList = users[data.email];
      if (toSocketList) {
        toSocketList.forEach((id) => {
          socket.to(id).emit("typing", data);
        });
      }
    });

    // Khi ngừng gõ
    socket.on("stopTyping", (data) => {
      const toSocketList = users[data.email];
      if (toSocketList) {
        toSocketList.forEach((id) => {
          socket.to(id).emit("stopTyping", data);
        });
      }
    });

    // Xử lý tin nhắn riêng
    socket.on("private-message", async (data) => {
      const { from, to, text, images = [], avatar } = data;
      const toSocketList = users[to];

      // Gửi đến người nhận (nếu online)
      if (toSocketList) {
        toSocketList.forEach((id) => {
          io.to(id).emit("send_private_message", {
            from,
            text,
            images,
            avatar,
          });
        });
      } else {
        console.log(`⚠️ Người nhận ${to} hiện không online.`);
      }

      // Gửi lại cho chính sender
      io.to(socket.id).emit("send_private_message", {
        from,
        text,
        images,
      });

      // Lưu tin nhắn vào database
      try {
        const pool = await sql.connect(config);
        await pool
          .request()
          .input("sender_email", sql.VarChar, from)
          .input("receiver_email", sql.VarChar, to)
          .input("content", sql.NVarChar, text)
          .input(
            "image_url",
            sql.NVarChar,
            images.length ? images.join(",") : null
          ).query(`
          INSERT INTO messages (sender_email, receiver_email, content, image_url)
          VALUES (@sender_email, @receiver_email, @content, @image_url)
        `);
        await pool.close();
        console.log("✅ Tin nhắn đã được lưu vào database.");
      } catch (err) {
        console.error("❌ Lỗi khi lưu tin nhắn:", err);
      }
    });

    // Khi client disconnect
    socket.on("disconnect", () => {
      const email = socket.email;
      if (email && users[email]) {
        users[email] = users[email].filter((id) => id !== socket.id);
        if (users[email].length === 0) {
          delete users[email];
        }
        console.log(`🔌 Disconnected socket ${socket.id} for user ${email}`);
      }
    });

    // Khi user disconnect thì xóa khỏi danh sách users
    socket.on("disconnect", () => {
      for (const email in users) {
        if (users[email] === socket.id) {
          delete users[email];
          console.log(`User disconnected: ${email}`);
          break;
        }
      }
    });
  });

  app.get("/loadmessage", async (req, res) => {
    try {
      const { from, to } = req.query;
      if (!from || !to) {
        return res
          .status(400)
          .json({ message: "Thiếu thông tin người gửi hoặc người nhận." });
      }
      const pool = await sql.connect(config);
      const result = await pool
        .request()
        .input("sender_email", sql.NVarChar, from)
        .input("receiver_email", sql.NVarChar, to)
        .query(
          `SELECT messages.*, u1.url_image AS sender_img, u2.url_image AS receiver_img
          FROM messages
              JOIN users AS u1 ON messages.sender_email = u1.email
              JOIN users AS u2 ON messages.receiver_email = u2.email
          WHERE
             (sender_email = @sender_email AND receiver_email = @receiver_email)
          OR
             (sender_email = @receiver_email AND receiver_email = @sender_email)
          ORDER BY sent_at ASC;`
        );
      await pool.close();
      if (result.recordset.length == 0) return res.json([]);
      return res.json(result.recordset);
    } catch (err) {
      console.log("commentapi error:", err);
      res.status(500).json({ message: "Lỗi server!" });
    }
  });

  app.get("/loadfriend", async (req, res) => {
    try {
      const { email } = req.query;
      if (!email) {
        return res.status(400).json({ message: "Thiếu email." });
      }
      console.log("email:", email);
      const pool = await sql.connect(config);
      const result = await pool
        .request()
        .input("email", sql.VarChar, email)
        .query(
          `SELECT u.*
            FROM friends f
            JOIN users u
              ON (f.user_email = u.email AND f.friend_email = @email)
              OR (f.friend_email = u.email AND f.user_email = @email)
            WHERE f.status = 'accepted' AND u.email <> @email;`
        );
      await pool.close();
      return res.json(result.recordset);
    } catch (err) {
      console.log("loadfriend error:", err);
      res.status(500).json({ message: "Lỗi server!" });
    }
  });

  app.get("/finduser", async (req, res) => {
    try {
      const { email } = req.query;
      if (!email) {
        return res.status(400).json({ message: "Thiếu email." });
      }
      const pool = await sql.connect(config);
      const result = await pool
        .request()
        .input("email", sql.VarChar, email)
        .query(
          `SELECT username, about_me, url_image, background_image, email, linkfb
            FROM users
            WHERE email = @email;`
        );
      await pool.close();
      if (result.recordset.length === 0) {
        return res.status(404).json({ message: "Không tìm thấy người dùng." });
      }
      return res.json(result.recordset[0]);
    } catch (err) {
      console.log("finduser error:", err);
      res.status(500).json({ message: "Lỗi server!" });
    }
  });
};

module.exports = message;
