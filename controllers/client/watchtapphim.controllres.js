const {
  PhimLe,
  PhimBo,
  PhimVienTuong,
} = require("../../models/products.model.js");
const { connectdtb } = require("../../config/database.js");
const e = require("express");
const { phim } = require("./search.controllers.js");
connectdtb();

async function getProducts(model, query) {
  const products = await model.find(query);
  return products;
}

const fetchAPI = async (api) => {
  try {
    const response = await fetch(api);
    const data = await response.json();
    return data?.items || data?.data?.items || data || [];
  } catch (error) {
    console.error(`Lỗi khi gọi API: ${api}`, error);
    return [];
  }
};

module.exports.index = async (req, res) => {
  try {
    const slug = req.params.slug;
    const id = req.params.id;

    // Fetch film by slug
    const film = await fetchAPI(`https://phimapi.com/phim/${slug}`);
    if (film.movie === "") {
      return res.status(500).send("Không tìm thấy phim");
    }
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
    let math = Math.floor(Math.random() * 299) + 1;

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
