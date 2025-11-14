const {
  PhimLe,
  PhimBo,
  PhimVienTuong,
} = require("../../models/products.model");
const { connectdtb } = require("../../config/database.js");
let fetchAPI = require("../../helpers/FetchAPI");
connectdtb();

async function getProducts(model, query) {
  const products = await model.find(query);
  return products;
}

module.exports.index = async (req, res) => {
  try {
    let b = Math.floor(Math.random() * 100) + 5;
    const [
      data,
      phimle,
      hanhdong,
      hinhsu,
      kinhdi,
      haihuoc,
      phimbo,
      hanquoc,
      trungquoc,
      aumi,
      vietnam,
      phimbofull,
      FilmNew,
      year2024,
      year2023,
      year2022,
      year2021,
      vietnamle,
      vietnambo,
    ] = await Promise.all([
      fetchAPI(`https://phimapi.com/danh-sach/phim-moi-cap-nhat-v3?page=1`),
      getProducts(PhimLe, { chieurap: false }),
      getProducts(PhimLe, { category: "Hành Động" }),
      getProducts(PhimLe, { category: "Hình Sự" }),
      getProducts(PhimLe, { category: "Kinh Dị" }),
      getProducts(PhimLe, { category: "Hài Hước" }),
      getProducts(PhimBo),
      getProducts(PhimBo, { country: "Hàn Quốc" }),
      getProducts(PhimBo, { country: "Trung Quốc" }),
      getProducts(PhimBo, { country: "Âu Mỹ" }),
      getProducts(PhimBo, { country: "Việt Nam" }),
      getProducts(PhimBo, {}),
      fetchAPI(`https://phimapi.com/danh-sach/phim-moi-cap-nhat-v3?page=${b}`),
      getProducts(PhimLe, { chieurap: true, year: 2024 }),
      getProducts(PhimLe, { chieurap: true, year: 2023 }),
      getProducts(PhimLe, { chieurap: true, year: 2022 }),
      getProducts(PhimLe, { chieurap: true, year: 2021 }),
      getProducts(PhimLe, { country: "Việt Nam" }),
      getProducts(PhimBo, { country: "Việt Nam" }),
    ]);

    const categories = { hanhdong, hinhsu, kinhdi, haihuoc };
    const countries = { hanquoc, trungquoc, aumi, vietnam, phimbofull };
    const years = { year2024, year2023, year2022, year2021 };
    const phimviet = { vietnamle, vietnambo };

    res.render("client/pages/products/products", {
      titlePage: "Danh sách sản phẩm",
      products: data,
      phimle,
      categories,
      countries,
      phimbo,
      FilmNew,
      years,
      phimviet,
      user: req.session.user,
    });
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu:", error);
    res.status(500).send("Đã xảy ra lỗi khi tải dữ liệu");
    return res.render("client/pages/Error/404", {});
  }
};
