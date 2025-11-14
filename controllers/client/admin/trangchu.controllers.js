const {
  PhimLe,
  PhimBo,
  PhimVienTuong,
} = require("../../../models/products.model");
const { connectdtb } = require("../../../config/database.js");

// Connect SQL Server
const sql = require("mssql");
const { get } = require("http");
let config = require("../../../config/AdminDatabase");
connectdtb();

async function getFilmCountsByYear(year) {
  const genres = [
    "Hài Hước",
    "Tình Cảm",
    "Kinh Dị",
    "Khoa Học",
    "Hành Động",
    "Hình Sự",
    "Tâm Lý",
    "Cổ Trang",
    "Chiến Tranh",
    "Võ Thuật",
    "Âm Nhạc",
  ];

  const counts = {};

  for (let genre of genres) {
    const count = await PhimBo.countDocuments({ category: genre, year });
    counts[genre] = count;
  }

  return { genres, counts };
}

async function getUsers() {
  try {
    let pool = await sql.connect(config);
    let respone = await pool.request().query("SELECT * FROM users ");
    return respone.recordset.length;
  } catch (error) {
    console.log(error);
  }
}

// Hàm Insert MongoDB
async function getProducts(model, query) {
  const products = await model.find(query);
  return products;
}

// Hàm lấy dtb
async function getFilm() {
  let phimbo = await getProducts(PhimBo, {});
  let phimle = await getProducts(PhimLe, {});
  let phimvientuong = await getProducts(PhimVienTuong, {});
  let Phim = [...phimbo, ...phimle, ...phimvientuong];
  return Phim.length;
}

module.exports.trangchu = async (req, res) => {
  try {
    let users = await getUsers();
    let film = await getFilm();
    let mang = {};
    for (let year = 2011; year <= 2025; year++) {
      const { genres, counts } = await getFilmCountsByYear(year);
      mang[year] = { counts };
    }
    res.render("client/pages/admin/trangchu", {
      mang,
      users,
      film,
    });
  } catch (error) {
    console.log(error);
  }
};

let a = async () => {
  let mang = {};
  for (let year = 2011; year <= 2025; year++) {
    const { genres, counts } = await getFilmCountsByYear(year);
    mang[year] = { counts };
  }
  console.log(mang);
};

// a();
// getUsers();
