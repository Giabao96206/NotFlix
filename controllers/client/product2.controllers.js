let fetchAPI = require("../../helpers/FetchAPI");

module.exports.index = async (req, res) => {
  try {
    // Fetch dữ liệu từ 2 nhóm API
    const [
      data,
      phimle,
      phimbo,
      hanhdong,
      hinhsu,
      kinhdi,
      haihuoc,
      hanquoc,
      trungquoc,
      aumi,
      FilmNew,
      year2024,
      year2023,
      year2022,
      year2021,
    ] = await Promise.all([
      fetchAPI("https://phimapi.com/danh-sach/phim-moi-cap-nhat-v3?page=2"),
      fetchAPI("https://phimapi.com/v1/api/danh-sach/phim-le?&limit=60"),
      fetchAPI("https://phimapi.com/v1/api/danh-sach/phim-bo?&limit=64"),
      fetchAPI(
        "https://phimapi.com/v1/api/danh-sach/phim-le?&category=hanh-dong&limit=64"
      ),
      fetchAPI(
        "https://phimapi.com/v1/api/danh-sach/phim-le?&category=hinh-su&limit=64"
      ),
      fetchAPI(
        "https://phimapi.com/v1/api/danh-sach/phim-le?&category=kinh-di&limit=64"
      ),
      fetchAPI(
        "https://phimapi.com/v1/api/danh-sach/phim-le?&category=hai-huoc&limit=64"
      ),
      fetchAPI(
        "https://phimapi.com/v1/api/danh-sach/phim-bo?&country=han-quoc&limit=64"
      ),
      fetchAPI(
        "https://phimapi.com/v1/api/danh-sach/phim-bo?&country=trung-quoc&limit=64"
      ),
      fetchAPI(
        "https://phimapi.com/v1/api/danh-sach/phim-bo?&country=au-mi&limit=64"
      ),
      fetchAPI("https://phimapi.com/danh-sach/phim-moi-cap-nhat-v3?page=1"),
      fetchAPI("https://phimapi.com/v1/api/nam/2024?page=1&limit=64"),
      fetchAPI("https://phimapi.com/v1/api/nam/2023?page=1&limit=64"),
      fetchAPI("https://phimapi.com/v1/api/nam/2022?page=1&limit=64"),
      fetchAPI("https://phimapi.com/v1/api/nam/2021?page=1&limit=64"),
    ]);

    // Tổ chức dữ liệu
    const categories = { hanhdong, hinhsu, kinhdi, haihuoc };
    const countries = { hanquoc, trungquoc, aumi };
    const years = { year2024, year2023, year2022, year2021 };

    // CHỈ render MỘT LẦN
    res.render("client/pages/products/products", {
      titlePage: "Danh sách sản phẩm",
      products: data,
      phimle,
      categories,
      countries,
      phimbo,
      FilmNew,
      years,
    });
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu:", error);
    res.status(500).send("Đã xảy ra lỗi khi tải dữ liệu");
  }
};
