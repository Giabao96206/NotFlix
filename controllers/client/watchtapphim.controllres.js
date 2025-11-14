const {
  PhimLe,
  PhimBo,
  PhimVienTuong,
} = require("../../models/products.model.js");
const { connectdtb } = require("../../config/database.js");
const e = require("express");
const { phim } = require("./search.controllers.js");
connectdtb();
const NodeCache = require("node-cache");
const movieCache = new NodeCache({ stdTTL: 300 }); // Cache 5 phút

async function getProducts(model, query) {
  const products = await model.find(query);
  return products;
}

const fetchAPI = async (api) => {
  try {
    const response = await fetch(api);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
      return res.render(`client/pages/Error/404`, {});
    }

    // Kiểm tra content-type xem có phải JSON không
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error(
        `❌ Phản hồi không phải JSON từ ${api}\n${text.slice(0, 200)}`
      );
      return [];
    }

    // Nếu tất cả ổn thì parse JSON
    const data = await response.json();
    return data?.items || data?.data?.items || data || [];
  } catch (error) {
    console.error(`Lỗi khi gọi API: ${api}`, error);
    return res.render(`client/pages/Error/404`, {});
  }
};
module.exports.index = async (req, res) => {
  try {
    const slug = req.params.slug;
    const id = req.params.id;

    // Fetch film by slug
    // ⚡ Thử lấy từ cache
    let film = movieCache.get(slug);

    if (!film) {
      console.log("📡 Gọi API vì chưa có cache:", slug);
      film = await fetchAPI(`https://phimapi.com/phim/${slug}`);
      movieCache.set(slug, film);
    } else {
      console.log("✅ Lấy phim từ cache:", slug);
    }

    // console.log("Film data:", film);
    const epIndex = id;

    let tap;
    for (let i = 0; i < film.episodes[0].server_data.length; i++) {
      if (film.episodes[0].server_data[i].slug == epIndex) {
        tap = film.episodes[0].server_data[i];
      }
    }

    if (!tap) {
      return res.status(404).send("Không tìm thấy tập phim");
    }
    let math = Math.floor(Math.random() * 50) + 1;

    const phimbo = await fetchAPI(
      `https://phimapi.com/v1/api/danh-sach/phim-bo?page=${math}&limit=20`
    );

    if (phimbo.length == 0) {
      return res.render("client/pages/Error/404", {});
    }

    res.render("client/pages/watchMovie/xemtapphim", {
      film,
      tap,
      phimbo,
      user: req.session.user,
    });
  } catch (err) {
    console.error("Lỗi server:", err);
    return res.render("client/pages/Error/404", {});
  }
};

//
