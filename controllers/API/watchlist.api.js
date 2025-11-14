const express = require("express");
const app = express();
const port = 5000;
const sql = require("mssql");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const { message } = require("../client/message.controllers");
app.use(express.json()); // Middleware để parse JSON request body
app.use(cors());
// app.use(express.static(path.join(__dirname, "uploads")));
let config = require("../../config/AdminDatabase");
const watchlist = (app) => {
  app.post("/watchlist", async (req, res) => {
    let { name, email } = req.body;
    if (!name || !email)
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin" });
    try {
      let pool = await sql.connect(config);
      let result = await pool
        .request()
        .input("user_email", sql.VarChar, email)
        .input("movie_slug", sql.VarChar, name)
        .query(
          "INSERT INTO watchlist (user_email, movie_slug) VALUES (@user_email, @movie_slug);"
        );
      res.status(200).json({ message: "Đã thêm vào danh sách theo dõi" });
    } catch (err) {
      console.log(err);
    }
  });

  app.delete("/watchlist", async (req, res) => {
    let { name, email } = req.body;
    if (!name || !email)
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin" });
    try {
      let pool = await sql.connect(config);
      let result = await pool
        .request()
        .input("user_email", sql.VarChar, email)
        .input("movie_slug", sql.VarChar, name)
        .query(
          "DELETE FROM watchlist WHERE user_email = @user_email AND movie_slug = @movie_slug;"
        );

      if (result.rowsAffected < 0) {
        res.json({ message: 2 });
      }
      res.json({ message: 1 });
    } catch (err) {
      console.log(err);
    }
  });

  app.get("/checklike", async (req, res) => {
    let { email, name } = req.query;
    if (!email || !name)
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin" });
    try {
      let pool = await sql.connect(config);
      let response = await pool
        .request()
        .input("user_email", sql.VarChar, email)
        .input("movie_slug", sql.VarChar, name)
        .query(
          "SELECT * FROM watchlist WHERE user_email = @user_email AND movie_slug = @movie_slug;"
        );
      if (response.recordset.length > 0) {
        res.json({ message: 1 });
      } else {
        res.json({ message: 2 });
      }
    } catch (err) {
      console.log(err);
    }
  });
};

module.exports = watchlist;
