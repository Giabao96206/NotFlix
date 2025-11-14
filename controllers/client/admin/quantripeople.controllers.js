const {
  PhimLe,
  PhimBo,
  PhimVienTuong,
} = require("../../../models/products.model");
const { connectdtb } = require("../../../config/database.js");
connectdtb();
const sql = require("mssql");
let config = require("../../../config/AdminDatabase");

module.exports.quantripeople = async (req, res) => {
  try {
    let admin = {};
    let users = {};
    let pool = await sql.connect(config);
    let responeadmin = await pool
      .request()
      .query("SELECT * FROM users WHERE role = 'admin' ");
    admin = responeadmin.recordset;
    let responeuser = await pool
      .request()
      .query("SELECT * FROM users WHERE role = 'user' ");
    users = responeuser.recordset;
    res.render("client/pages/admin/quantripeople", {
      admin,
      users,
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
