const {
  PhimLe,
  PhimBo,
  PhimVienTuong,
} = require("../../../models/products.model.js");
const { connectdtb } = require("../../../config/database.js");
connectdtb();

async function getProducts(model, query) {
  const products = await model.find(query);
  return products;
}
module.exports.phim = async (req, res) => {
  let phimbo = await getProducts(PhimBo, {});
  let phimle = await getProducts(PhimLe, {});
  let phimvientuong = await getProducts(PhimVienTuong, {});
  let Phim = [...phimbo, ...phimle, ...phimvientuong];
  res.render("client/pages/admin/quantriphim", {
    Phim,
  });
};
