const {
  PhimLe,
  PhimBo,
  PhimVienTuong,
} = require("../../models/products.model");
const { connectdtb } = require("../../config/database.js");
connectdtb();

let fetchAPI = require("../../helpers/FetchAPI");

async function getProducts(model, query) {
  const products = await model.find(query);
  return products;
}

// module.exports.index = async (req, res) => {
//   let phimbo, film;
//   try {
//     (phimbo = await fetchAPI(
//       `https://phimapi.com/danh-sach/phim-moi-cap-nhat-v3?page=1`
//     )),
//       (film = await fetchAPI(`https://phimapi.com/phim/ngoi-truong-xac-song`));

//     res.render("client/pages/watchMovie/watchList", {
//       titlePage: "Trang xem phim",
//       phimbo,
//       film,
//     });
//   } catch (error) {
//     console.error("Lỗi khi gọi API:", error);
//   }
// };

module.exports.index = async (req, res) => {
  try {
    const movieId = req.params.id;
    console.log("movieId:", movieId); // Kiểm tra giá trị của movieId
    // Lấy phim theo slug
    const film = await fetchAPI(`https://phimapi.com/phim/${movieId}`);
    if (film.movie === "") {
      return res.render("client/pages/Error/404", {});
    }

    // Lấy thêm danh sách phim bộ để render bên cạnh
    const phimbo = await fetchAPI(
      "https://phimapi.com/v1/api/danh-sach/phim-bo?limit=20"
    );

    res.render("client/pages/watchMovie/xemphim", {
      film, // vì film là mảng, lấy phần tử đầu tiên
      phimbo,
      user: req.session.user,
    });
  } catch (err) {
    console.error("Lỗi server:", err);
    // res.status(500).send("Lỗi server");
    return res.render("client/pages/Error/404", {});
  }
};
