const express = require("express");
const sql = require("mssql");
const nodemailer = require("nodemailer");
const cors = require("cors");
const app = express();
app.use(express.json()); // Middleware để parse JSON request body
app.use(cors({ origin: "*" }));

let config = require("../../../config/AdminDatabase");

// Hàm tạo số ngẫu nhiên 4 chữ số
function generateRandomFourDigitNumber() {
  return Math.floor(1000 + Math.random() * 9000);
}

// Hàm kiểm tra xem code đã tồn tại trong SQL chưa
async function TestCheckCodes(codes) {
  try {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("codes", sql.NVarChar, String(codes))
      .query("SELECT * FROM codes WHERE code = @codes");

    // Nếu code đã tồn tại, tạo lại code mới và kiểm tra lại
    await sql.close();
    while (result.recordset.length > 0) {
      codes = generateRandomFourDigitNumber();
      return await TestCheckCodes(codes);
    }

    return codes;
  } catch (err) {
    console.log(err);
    return null; // Trả về null nếu có lỗi
  }
}

let mail = (app) => {
  // API lấy email và kiểm tra mã
  app.post("/checkCode", async (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(500).json({ message: "Lỗi thiếu mail!" });
    }

    let codes = generateRandomFourDigitNumber();

    try {
      // Kiểm tra xem code có tồn tại hay chưa
      let verifiedCode = await TestCheckCodes(codes);

      if (!verifiedCode) {
        return res.status(500).json({ message: "Lỗi tạo code!" });
      }

      const pool = await sql.connect(config);
      await pool
        .request()
        .input("email", sql.VarChar, email)
        .input("codes", sql.NVarChar, String(verifiedCode))
        .query(
          "DELETE FROM codes WHERE email = @email and expiry_time < GETDATE();"
        );
      await pool
        .request()
        .input("email", sql.VarChar, email)
        .input("codes", sql.NVarChar, String(verifiedCode))
        .query(
          "DELETE FROM codes WHERE email = @email and expiry_time > GETDATE();"
        );
      await pool
        .request()
        .input("email", sql.VarChar, email)
        .input("codes", sql.NVarChar, String(verifiedCode))
        .query("INSERT INTO codes (email, code) VALUES (@email, @codes)");

      return res.json({ message: "Insert success!" });
      await sql.close();
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Lỗi server!" });
    }
  });

  // API gửi email
  app.post("/sendMail", async (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Thiếu email!" });
    }

    try {
      const pool = await sql.connect(config);
      const result = await pool
        .request()
        .input("email", sql.VarChar, email)
        .query(
          "SELECT code FROM codes WHERE email = @email AND expiry_time > GETDATE()"
        );
      await sql.close();
      let codes = result.recordset[0]?.code;

      let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "tranvangiabao96206@gmail.com",
          pass: "qrlc liuk lhxv yows",
        },
      });
      let mailOptions = {
        from: "tranvangiabao96206@gmail.com",
        to: email,
        subject: "Mã xác nhận của bạn",
        html: `
          <div
      style="
        max-width: 600px;
        margin: auto;
        background: #fff;
        border-radius: 8px;
        overflow: hidden;
        font-family: Arial, sans-serif;
      "
    >
      <div
        style="
          background: #0073e6;
          color: #fff;
          padding: 20px;
          text-align: center;
        "
      >
        <h1>Mã xác nhận</h1>
      </div>
      <div style="padding: 30px 20px; color: #333">
        <h2>Xin chào, ${email}</h2>
        <p>
          Cảm ơn bạn đã tin tưởng sử dùng trang Web của chúng tôi. Dưới đây là
          thông tin mã xác nhận của bạn:
        </p>
      </div>
      <div
        style="font-size: 20px; color: #888; text-align: center; padding: 20px"
      >
        Vui lòng không chia sẻ mã cho bất kỳ ai: <strong>${codes}</strong>
      </div>
    </div>

  `,
      };

      let info = await transporter.sendMail(mailOptions);
      console.log("Email sent: " + info.response);
      return res.json({ message: "Email đã gửi thành công!" });
    } catch (error) {
      console.error("Lỗi gửi email:", error);
      return res.status(500).json({ message: "Lỗi gửi email!" });
    }
  });

  app.post("/selectCode", async (req, res) => {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ message: "Thiếu email hoặc code!" });
    }
    try {
      const pool = await sql.connect(config);
      const result = await pool
        .request()
        .input("email", sql.VarChar, email)
        .input("codes", sql.NVarChar, code)
        .query("SELECT * FROM codes WHERE email = @email AND code = @codes");
      if (!result.recordset[0]?.code) {
        return res
          .status(400)
          .json({ message: "Mã xác nhận hoặc gmail đúng vui lòng nhập lại" });
      }

      return res.json({ message: "Insert success!", code });
      await sql.close();
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Lỗi server!", error: error.message });
    }
  });
};

module.exports = mail;
