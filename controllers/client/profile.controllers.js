let config = require("../../config/AdminDatabase");

const sql = require("mssql");

module.exports.profile = async (req, res) => {
  const email = req.params.email;
  if (!email) {
    return res.status(400).send("Email không tồn tại hoặc không hợp lệ");
  }
  if (!req.session.user) {
    return res.redirect("/login");
  }
  try {
    // if (req.session.user.email !== email) {
    //   return res.status(403).send("Bạn không có quyền truy cập vào trang này");
    // }
    let pool = await sql.connect(config);
    let result = await pool
      .request()
      .input("email", sql.VarChar, email)
      .query(
        "SELECT users.username, users.about_me, users.url_image, users.background_image, users.email , users.address, users.linkfb, users.phone FROM users WHERE email = @email"
      );
    if (result.recordset.length === 0) {
      return res.status(404).send("Không tìm thấy người dùng với email này");
    }

    let moreFriend = await pool.request().input("email", sql.VarChar, email)
      .query(`
                    SELECT u.*
                    FROM users u
                    WHERE u.email != @email
                    AND u.email NOT IN (
                    SELECT f.friend_email
                    FROM friends f
                    WHERE f.user_email = @email  AND (f.status = 'accepted' OR f.status = 'pending')
                    UNION
                    SELECT f.user_email
                    FROM friends f
                    WHERE f.friend_email = @email  AND (f.status = 'accepted' OR f.status = 'pending')
                    ); `);
    if (moreFriend.recordset.length === 0) {
      return res.status(404).send("Có lỗi");
    }

    res.render("client/pages/search/profile", {
      user: req.session.user,
      profile: result.recordset[0],
      moreFriend: moreFriend.recordset,
    });
  } catch (err) {
    console.error("Lỗi khi truy cập profile:", err);
    return res.status(500).send("Lỗi server");
  }
};
