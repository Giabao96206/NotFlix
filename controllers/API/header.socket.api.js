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
let config = require("../../config/AdminDatabase");

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

const headerbell = (app, io) => {
  const users = {}; // users[email] = [socketId1, socketId2, ...]

  io.on("connection", (socket) => {
    console.log("🔌 User connected, socket id:", socket.id);
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
    socket.on("add-friend", async (data) => {
      const { from, to, name, avatar } = data;
      const toSocketList = users[to];

      // Gửi đến người nhận (nếu online)
      if (toSocketList) {
        toSocketList.forEach((id) => {
          io.to(id).emit("send-add-friend", {
            from,
            name,
            avatar,
          });
        });
      } else {
        console.log(`⚠️ Người nhận ${to} hiện không online.`);
      }

      // Lưu tin nhắn vào database
      try {
        const pool = await sql.connect(config);
        await pool
          .request()
          .input("user_email", sql.VarChar, socket.email) // người ĐANG NHẬN lời mời
          .input("friend_email", sql.VarChar, data.to) // người GỬI lời mời
          .query(`
               SELECT status FROM friends f
               WHERE f.user_email = @friend_email AND f.friend_email = @user_email
               AND status = 'pending'
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
  });
};

module.exports = headerbell;
