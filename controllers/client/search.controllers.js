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

module.exports.timkiem = async (req, res) => {
  try {
    let a = req.query.keyword;
    console.log(a);
    let name = a.split("-").join(" ");
    let film1 = await timPhimFuzzy(name, 40);

    res.render("client/pages/search/SearchNotFound", {
      film1, // vì film là mảng, lấy phần tử đầu tiên
      name,
      user: req.session.user,
    });
  } catch (err) {
    console.log(err);
  }
};
