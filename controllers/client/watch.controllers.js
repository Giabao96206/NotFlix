const {
  PhimLe,
  PhimBo,
  PhimVienTuong,
} = require("../../models/products.model");
const { connectdtb } = require("../../config/database.js");
const NodeCache = require("node-cache");

connectdtb();

const movieCache = new NodeCache({ stdTTL: 300 }); // Cache 5 phút

async function getProducts(model, query) {
  const products = await model.find(query);
  return products;
}

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const fetchAPI = async (api) => {
  try {
    const response = await fetch(api);

    if (!response.ok) {
      if (response.status === 429) {
        console.warn(`🚫 Quá nhiều request (429): ${api}`);
        await delay(1000);
        return [];
      }
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text.slice(0, 200)}`);
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      throw new Error(`Phản hồi không phải JSON: ${text.slice(0, 200)}`);
    }

    const data = await response.json();
    return data?.items || data?.data?.items || data || [];
  } catch (error) {
    console.error(`❌ Lỗi khi gọi API: ${api}`, error.message);
    return [];
  }
};

module.exports.index = async (req, res) => {
  try {
    const movieId = req.params.id;
    console.log("movieId:", movieId);

    // ⚡ Thử lấy từ cache
    let film = movieCache.get(movieId);

    if (!film) {
      console.log("📡 Gọi API vì chưa có cache:", movieId);
      film = await fetchAPI(`https://phimapi.com/phim/${movieId}`);
      movieCache.set(movieId, film);
    } else {
      console.log("✅ Lấy phim từ cache:", movieId);
    }

    let math = Math.floor(Math.random() * 50) + 1;

    const phimbo = await fetchAPI(
      `https://phimapi.com/v1/api/danh-sach/phim-bo?page=${math}&limit=20`
    );

    if (!film || film.movie === "") {
      return res.render("client/pages/Error/Nofilm", {
        user: req.session.user,
      });
    }

    res.render("client/pages/watchMovie/watchList", {
      film,
      phimbo,
      user: req.session.user,
    });
  } catch (err) {
    console.error("Lỗi server:", err.message);
    res.status(500).render("client/pages/Error/Nofilm", {
      user: req.session.user,
    });
  }
};

let a = async () => {
  let b = await getProducts(PhimLe, {});
  console.log("Số lượng phim lẻ:", b.length);
};

a();
