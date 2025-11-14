const sql = require("mssql");
let config = require("../../config/AdminDatabase");
let fetchAPI = require("../../helpers/FetchAPI");
async function getProducts(model, query) {
  const products = await model.find(query);
  return products;
}

module.exports.tuphim = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect("/products");
    }
    const email = req.session.user.email;

    let pool = await sql.connect(config);
    let respone = await pool
      .request()
      .input("email", sql.VarChar, email)
      .query("SELECT movie_slug FROM watchlist WHERE user_email = @email");
    let phim = [];

    if (respone.recordset.length > 0) {
      let movieList = respone.recordset.map((item) => item.movie_slug);
      phim = await Promise.all(
        movieList.map((item) => fetchAPI(`https://phimapi.com/phim/${item}`))
      );
    }
    // Lấy phim theo slug
    // const film = await fetchAPI(`https://phimapi.com/phim/${movieId}`);
    // if (film.movie === "") {
    //   return res.render("client/pages/Error/Nofilm", {
    //     user: req.session.user,
    //   });
    // }
    // Lấy thêm danh sách phim bộ để render bên cạnh
    let math = Math.floor(Math.random() * 20) + 1;
    const phimbo = await fetchAPI(
      `https://phimapi.com/v1/api/danh-sach/phim-bo?page=${math}&limit=25`
    );

    res.render("client/pages/search/tuphim", {
      user: req.session.user,
      phim,
      phimbo,
    });
  } catch (err) {
    console.error("Lỗi server:", err);
    res.status(500).send("Lỗi server");
  }
};
