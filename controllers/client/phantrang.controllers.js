const { PhimLe, PhimBo } = require("../../models/products.model.js");
const { connectdtb } = require("../../config/database.js");
const NodeCache = require("node-cache");

connectdtb();
const cache = new NodeCache({ stdTTL: 300 }); // Cache 5 phút

async function getProductsPaginated(model, query, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  return await model.find(query).skip(skip).limit(limit).exec();
}

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
      console.log("📦 Trả dữ liệu từ cache:", cacheKey);
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
      const countLe = await PhimLe.find({ category: categoryName });
      const countBo = await PhimBo.find({ category: categoryName });
      total = Math.max(countLe.length, countBo.length);
    }

    if (!film.length) {
      return res.status(404).send("Không tìm thấy phim");
    }

    const leng = Math.ceil(total / PAGE_SIZE) + 1;
    // console.log(total, PAGE_SIZE, leng);

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
    let a = req.params.num;
    let page = parseInt(a);
    let PAGE_SIZE = 20;
    let countries = {
      "trung-quoc": "Trung Quốc",
      "viet-nam": "Việt Nam",
      "han-quoc": "Hàn Quốc",
      "nhat-ban": "Nhật Bản",
      "thai-lan": "Thái Lan",
      "au-mi": "Âu Mỹ",
      "tong-hop": "Tổng Hợp",
    };

    let total = 0;
    let film = [];
    let name = countries[key];

    // 🧠 Check cache
    const cacheKey = `country-${key}-page-${page}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      console.log("📦 Trả dữ liệu từ cache:", cacheKey);
      return res.render("client/pages/search/search", {
        film: cachedData.film,
        name: cachedData.name,
        leng: cachedData.leng,
        user: req.session.user,
      });
    }

    if (name === "Tổng Hợp") {
      film = await getCombinedFilms(PhimLe, PhimBo, {}, page, PAGE_SIZE);
      total =
        (await countProducts(PhimLe, {})) + (await countProducts(PhimBo, {}));
    } else {
      film = await getCombinedFilms(
        PhimLe,
        PhimBo,
        { country: name },
        page,
        PAGE_SIZE
      );
      const countLe = await PhimLe.find({ country: name });
      const countBo = await PhimBo.find({ country: name });
      total = Math.max(countLe.length, countBo.length);
    }

    // 💾 Save to cache
    let leng = Math.ceil(total / PAGE_SIZE) + 1;
    cache.set(cacheKey, { film, leng });
    res.render("client/pages/search/search", {
      film, // vì film là mảng, lấy phần tử đầu tiên
      name,
      leng,
      user: req.session.user,
    });
  } catch (err) {
    console.log(err);
  }
};
module.exports.year = async (req, res) => {
  try {
    let key = req.params.year;
    let s1 = parseInt(key);
    let num = req.params.num;
    let page = parseInt(num);
    let PAGE_SIZE = 20;
    let total = 0;
    let name;
    if (isNaN(s1)) {
      return res.status(404).send("Không tìm thấy phim");
    }
    let film = [];

    const cacheKey = `year-${s1}-page-${page}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      console.log("📦 Trả dữ liệu từ cache:", cacheKey);
      return res.render("client/pages/search/search", {
        film: cachedData.film,
        name: cachedData.name,
        leng: cachedData.leng,
        user: req.session.user,
        cached: true, // bạn có thể dùng để debug
      });
    }

    if (s1 === 2007) {
      film = await getCombinedFilms(
        PhimLe,
        PhimBo,
        { year: s1 },
        page,
        PAGE_SIZE
      );

      name = "Sau 2007";
    } else {
      film = await getCombinedFilms(
        PhimLe,
        PhimBo,
        { year: s1 },
        page,
        PAGE_SIZE
      );
      name = "Năm " + s1;
    }

    let file = await countProducts(PhimLe, { year: s1 });
    let fibo = await countProducts(PhimBo, { year: s1 });
    let leng = Math.ceil(Math.max(file, fibo) / PAGE_SIZE) + 1;
    cache.set(cacheKey, { film, name, leng });
    res.render("client/pages/search/search", {
      film,
      name,
      leng,
      user: req.session.user,
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports.phim = async (req, res) => {
  try {
    let id = req.params.id;
    let page = parseInt(req.params.num);
    let PAGE_SIZE = 20;
    if (isNaN(page)) {
      return res.status(404).send("Không tìm thấy phim");
    }
    let film = [];
    let leng = 0;
    let name, filml, filmb;

    if (id === "phimle") {
      let file = await countProducts(PhimLe, {});
      // console.log(file);

      film = await getProductsPaginated(PhimLe, {}, page, PAGE_SIZE);
      name = "Lẻ";
      leng = file;
    } else if (id === "phimbo") {
      let fibo = await countProducts(PhimBo, {});
      film = await getProductsPaginated(PhimBo, {}, page, PAGE_SIZE);
      name = "Bộ";
      leng = fibo;
    }

    leng = Math.ceil(leng / PAGE_SIZE) + 1;
    console.log(leng);

    res.render("client/pages/search/search", {
      film,
      name,
      leng,
      user: req.session.user,
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports.chieurap = async (req, res) => {
  try {
  } catch (err) {
    console.log(err);
  }
};
let a = async () => {
  try {
    let filml, filmb, leng;
    filml = await taomang(PhimBo, { slug: "nguoi-hung-yeu-duoi" });

    console.log(filml);
  } catch (err) {
    console.log(err);
  }
};
// a();
