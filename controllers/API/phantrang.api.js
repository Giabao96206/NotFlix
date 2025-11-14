const express = require("express");
const cors = require("cors");
const app = express();
const os = require("os"); // Đảm bảo đã require 'os' module
const networkInterfaces = os.networkInterfaces();
let fetchAPI = require("../../helpers/FetchAPI");
app.use(express.json()); // Middleware để parse JSON request body
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "*" }));

const {
  PhimLe,
  PhimBo,
  PhimVienTuong,
} = require("../../models/products.model");
const { connectdtb } = require("../../config/database.js");
connectdtb();

async function getProducts(model, query) {
  const products = await model.find(query);
  return products;
}

const { year } = require("../client/phantrang.controllers.js");

function splitMoviesStable(movies, chunkSize = 40) {
  const result = [null];
  for (let i = 0; i < movies.length; i += chunkSize) {
    const chunk = movies.slice(i, i + chunkSize);
    result.push(chunk);
  }
  return result;
}

let cachedMoviePages = {};
const modelMap = {
  "Phim bộ": PhimBo,
  "Phim lẻ": PhimLe,
};
const ngoaile = {
  "Thể loại": null,
  "Quốc gia": null,
  "Năm phát hành": null,
  "Hình thức": null,
  "Ngôn ngữ": null,
};
const taomang = async (a, b) => {
  let mang = await getProducts(a, b); // Lấy dữ liệu đã được sort
  const movieChunks = splitMoviesStable(mang); // Chia nhóm
  return movieChunks;
};

let taomang2 = async (film) => {
  const movieChunks = splitMoviesStable(film); // Chia nhóm
  return movieChunks;
};

const phantrang1 = (app) => {
  app.post("/api/phantrang1", async (req, res) => {
    let { num, theloai, quocgia, namphathanh, hinhthuc, ngonngu } = req.body;

    try {
      let filmKey = "";
      if (ngoaile[theloai] !== null) filmKey += `- ${theloai}`;
      if (ngoaile[quocgia] !== null) filmKey += `- ${quocgia}`;
      if (ngoaile[namphathanh] !== null) filmKey += `- ${namphathanh}`;
      if (ngoaile[hinhthuc] !== null) filmKey += `- ${hinhthuc}`;
      if (ngoaile[ngonngu] !== null) filmKey += `- ${ngonngu}`;
      filmKey = filmKey.slice(1);
      if (!cachedMoviePages[filmKey]) {
        console.log(filmKey);
      }
      let query = {};

      if (ngoaile[theloai] !== null) query.category = theloai;
      if (ngoaile[quocgia] !== null) query.country = quocgia;
      if (ngoaile[namphathanh] !== null) query.year = parseInt(namphathanh);
      if (ngoaile[ngonngu] !== null) query.lang = ngonngu;

      if (!cachedMoviePages[filmKey]) {
        if (ngoaile[hinhthuc] === null) {
          let filml = await getProducts(PhimLe, query);
          let filmb = await getProducts(PhimBo, query);
          let film = [...(filmb || []), ...(filml || [])];
          cachedMoviePages[filmKey] = await taomang2(film);
        } else {
          cachedMoviePages[filmKey] = await taomang(modelMap[hinhthuc], query);
          console.log(query);
        }
      }

      const moviePages = cachedMoviePages[filmKey];

      if (num < 0 || num >= moviePages.length) {
        return res.status(404).json({ message: "Trang không tồn tại!" });
      }

      res.send(moviePages[num]);
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
      res.status(500).json({ message: "Lỗi khi gọi API!" });
    }
  });
};

let g = async () => {
  let filml = await taomang(PhimLe, { year: 2021 });
  let filmb = await taomang(PhimBo, { year: 2021 });
  let film = [...(filmb || []), ...(filml || [])];
  console.log(film[1].length);
};

module.exports = phantrang1;
