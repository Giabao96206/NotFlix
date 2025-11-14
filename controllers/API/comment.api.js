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

// cấu ha=ình upload

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

const commnet = (app, io) => {
  app.get("/", (req, res) => {
    res.render("client/pages/watchMovie/xemtapphim", {});
  });

  io.on("connection", (socket) => {
    console.log("A user connected");
    socket.on("on-chat", async (data) => {
      try {
        const slug = data.slug;
        const pool = await sql.connect(config);

        const request = pool
          .request()
          .input("email", sql.VarChar, data.name)
          .input("movie_slug", sql.VarChar, slug)
          .input("content", sql.NVarChar, data.text)
          .input("time", sql.DateTime, data.time);

        if (data.url) {
          request.input("imageURLs", sql.VarChar, data.url);
          await request.query(
            "INSERT INTO comments (email, movie_slug, content, created_at, image_url) VALUES (@email, @movie_slug, @content, @time, @imageURLs);"
          );
        } else {
          await request.query(
            "INSERT INTO comments (email, movie_slug, content, created_at) VALUES (@email, @movie_slug, @content, @time);"
          );
        }

        io.emit("user-chat", data);
      } catch (error) {
        console.log("Socket error:", error);
      }
    });
  });

  app.get("/commentapi", async (req, res) => {
    try {
      const { slug } = req.query;
      if (!slug) return res.status(400).json({ message: "Thiếu tham số!" });

      const pool = await sql.connect(config);
      const result = await pool
        .request()
        .input("movie_slug", sql.NVarChar, slug)
        .query(
          `SELECT comments.movie_slug, comments.content, comments.created_at, comments.image_url, users.email , users.url_image
           FROM comments 
           INNER JOIN users ON comments.email = users.email 
           WHERE comments.movie_slug = @movie_slug;`
        );
      if (result.recordset.length == 0) return res.json([]);
      res.json(result.recordset);
    } catch (err) {
      console.log("commentapi error:", err);
      res.status(500).json({ message: "Lỗi server!" });
    }
  });

  app.post("/upload", upload.array("image", 10), (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ message: "Không có file nào được gửi lên!" });
    }
    const imageUrl = req.files.map((file) => `/${file.filename}`);
    res.status(200).json({ message: "Upload thành công!", imageUrl });
  });
};

module.exports = commnet;
