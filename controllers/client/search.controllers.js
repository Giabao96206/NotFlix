const { PhimLe, PhimBo } = require("../../models/products.model.js");
const { connectdtb } = require("../../config/database.js");
const NodeCache = require("node-cache");
const Fuse = require("fuse.js");
let fetchAPI = require("../../helpers/FetchAPI");

connectdtb();
const cache = new NodeCache({ stdTTL: 300 }); // Cache 5 phút

async function getProductsPaginated(model, query, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  return await model.find(query).skip(skip).limit(limit).exec();
}

const timPhimFuzzy = async (tuKhoa, limit) => {
  const options = {
    keys: ["name", "slug", "origin_name"],
    threshold: 0.4, // nhỏ hơn = chính xác hơn
  };
  const dsPhim = [];
  for (let i = 1; i < 3; i++) {
    const a = await fetchAPI(
      `https://phimapi.com/v1/api/tim-kiem?keyword=${encodeURIComponent(
        tuKhoa
      )}&page=${i}`
    );
    if (Array.isArray(a)) {
      dsPhim.push(...a);
    } else {
      continue; // Bỏ qua nếu không phải mảng
    }
  }

  const fuse = new Fuse(dsPhim, options);
  const ketQua = fuse.search(tuKhoa);

  return ketQua.slice(0, limit).map((kq) => kq.item);
};
async function countProducts(model, query) {
  return await model.countDocuments(query).exec();
}

async function getCombinedFilms(modelA, modelB, query, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const filmsA = await modelA.find(query).skip(skip).limit(limit).exec();
  const filmsB = await modelB.find(query).skip(skip).limit(limit).exec();
  return [...filmsA, ...filmsB];
}

module.exports.gener = async (req, res) => {
  try {
    const key = req.params.key;
    const page = parseInt(req.params.num) || 1;
    const PAGE_SIZE = 20;

    const theloai = {
      "hanh-dong": "Hành Động",
      "tinh-cam": "Tình Cảm",
      "hai-huoc": "Hài Hước",
      "co-trang": "Cổ Trang",
      "tam-ly": "Tâm Lý",
      "chien-tranh": "Chiến Tranh",
      "khoa-hoc": "Khoa Học",
      "am-nhac": "Âm Nhạc",
      "hoc-duong": "Học Đường",
      "vo-thuat": "Võ Thuật",
      "vien-tuong": "Viễn Tưởng",
      "kinh-di": "Kinh Dị",
      "hinh-su": "Hình Sự",
      "the-thao": "Thể Thao",
      "chieu-rap": "Chiếu Rạp",
      "gia-dinh": "Gia Đình",
      "bi-an": "Bí Ẩn",
    };

    const categoryName = theloai[key];
    if (!categoryName) return res.status(404).send("Thể loại không hợp lệ");

    // 🧠 Check cache
    const cacheKey = `category-${key}-page-${page}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      // console.log("📦 Trả dữ liệu từ cache:", cacheKey);
      return res.render("client/pages/search/search", {
        film: cachedData.film,
        name: categoryName,
        leng: cachedData.leng,
        user: req.session.user,
        cached: true, // bạn có thể dùng để debug
      });
    }

    let film = [];
    let total = 0;

    if (categoryName === "Chiếu Rạp") {
      film = await getProductsPaginated(
        PhimLe,
        { chieurap: true },
        page,
        PAGE_SIZE
      );
      total = await countProducts(PhimLe, { chieurap: true });
    } else {
      console.log("Lấy phim theo thể loại:", categoryName);
      film = await getCombinedFilms(
        PhimLe,
        PhimBo,
        { category: categoryName },
        page,
        PAGE_SIZE
      );
      const countLe = await countProducts(PhimLe, { category: categoryName });
      const countBo = await countProducts(PhimBo, { category: categoryName });
      total = countLe + countBo;
    }

    if (!film.length) {
      return res.status(404).send("Không tìm thấy phim");
    }

    const leng = Math.ceil(total / PAGE_SIZE);

    // 💾 Save to cache
    cache.set(cacheKey, { film, leng });

    res.render("client/pages/search/search", {
      film,
      name: categoryName,
      leng,
      user: req.session.user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Lỗi server");
  }
};

module.exports.country = async (req, res) => {
  try {
    let key = req.params.country;
    const page = parseInt(req.params.num) || 1;
    const PAGE_SIZE = 20;
 
    let name;
    let countries = {
      "trung-quoc": "Trung Quốc",
      "viet-nam": "Việt Nam",
      "han-quoc": "Hàn Quốc",
      "nhat-ban": "Nhật Bản",
      "thai-lan": "Thái Lan",
      "au-mi": "Âu Mỹ",
    };
    if (key === "tong-hop") {
      let filmb = await getProducts(PhimBo, {});
      let filml = await getProducts(PhimLe, {});
      let film = [...filmb, ...filml];
      name = "TỔNG HỢP";
      res.render("client/pages/search/search", {
        film, // vì film là mảng, lấy phần tử đầu tiên
        user: req.session.user,
      });
      return;
    }
    let filmb = await getProducts(PhimBo, { country: countries[key] });
    let filml = await getProducts(PhimLe, { country: countries[key] });
    let film = [...filmb, ...filml];
    name = countries[key];
    if (filmb.length == 0 || filml.length == 0) {
      return res.status(500).send("Không tìm thấy phim");
    }

    res.render("client/pages/search/search", {
      film, // vì film là mảng, lấy phần tử đầu tiên
      name,
      user: req.session.user,
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports.year = async (req, res) => {
  try {
    let key = req.params.year;
    let year = parseInt(key);
    if (isNaN(year)) {
      return res.status(500).send("Không tìm thấy phim");
    }

    if (year === 2007) {
      let filmb = await getProducts(PhimBo, { year: { $lt: 2007 } });
      let filml = await getProducts(PhimLe, { year: { $lt: 2007 } });
      let film = [...filmb, ...filml];
      let name = "Sau 2007";
      res.render("client/pages/search/search", {
        film, // vì film là mảng, lấy phần tử đầu tiên
        name,
        user: req.session.user,
      });
      return;
    }

    let filmb = await getProducts(PhimBo, { year: year });
    let filml = await getProducts(PhimLe, { year: year });
    let film = [...filmb, ...filml];
    if (filmb.length == 0 || filml.length == 0) {
      return res.status(500).send("Không tìm thấy phim");
    }
    let name = "Năm " + year;
    res.render("client/pages/search/search", {
      film, // vì film là mảng, lấy phần tử đầu tiên
      name,
      user: req.session.user,
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports.phim = async (req, res) => {
  try {
    let id = req.params.id;
    let film;
    let name;
    if (id === "phimle") {
      film = await getProducts(PhimLe, {});
      name = "Lẻ";
    } else if (id === "phimbo") {
      film = await getProducts(PhimBo, {});
      name = "Bộ";
    }
    res.render("client/pages/search/search", {
      film, // vì film là mảng, lấy phần tử đầu tiên
      name,
      user: req.session.user,
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports.timkiem = async (req, res) => {
  try {
    let a = req.query.keyword;
    console.log(a);
    let name = a.split("-").join(" ");
    let film1 = await timPhimFuzzy(name, 40);
    // let film2 = await timPhimFuzzy2(name, 25);

    // let slugs = film1.map((item) => item.slug);
    // film2 = film2.filter((item) => !slugs.includes(item.slug));

    res.render("client/pages/search/search2", {
      film1, // vì film là mảng, lấy phần tử đầu tiên
      name,
      user: req.session.user,
    });
  } catch (err) {
    console.log(err);
  }
};

let a = async () => {
  try {
    let a = "anh";

    let name = a.split("-").join(" ");
    let film1 = await timPhimFuzzy(name, 40);
    // let film2 = await timPhimFuzzy2(name, 25);

    // let slugs = film1.map((item) => item.slug);
    // film2 = film2.filter((item) => !slugs.includes(item.slug));

    console.log(film1.length);
  } catch (err) {
    console.log(err);
  }
};

// a();
