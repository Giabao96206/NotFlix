const sql = require("mssql");
const config = require("../../config/AdminDatabase");
module.exports.message = async (req, res) => {
  let email = req.params.users;
  if (!email) {
    return res.status(400).send("Email không tồn tại hoặc không hợp lệ");
  }
  if (!req.session.user) {
    return res.redirect("/login");
  }
  try {
    let pool = await sql.connect(config);
    let result = await pool
      .request()
      .input("email", sql.VarChar, email)
      .query(
        "SELECT users.username, users.about_me, users.url_image, users.background_image, users.email FROM users WHERE email = @email"
      );
    if (result.recordset.length === 0) {
      return res.status(404).send("Không tìm thấy người dùng với email này");
    }
    res.render("client/pages/message/message", {
      user: req.session.user,
      receiver: result.recordset[0],
    });
  } catch (err) {
    console.error("Lỗi khi truy cập :", err);
    return res.status(500).send("Lỗi server");
  }
};
