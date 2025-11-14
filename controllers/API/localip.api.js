const express = require("express");
const app = express();
const sql = require("mssql");
const cors = require("cors");
app.use(express.json()); // Bắt buộc để đọc JSON từ body
app.use(cors());
cors({ origin: "*" });
const os = require("os"); // Đảm bảo đã require 'os' module
const networkInterfaces = os.networkInterfaces();
function getLocalIP() {
  const networkInterfaces = os.networkInterfaces();
  for (const interfaceName in networkInterfaces) {
    for (const iface of networkInterfaces[interfaceName]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost";
}

let config = require("../../config/AdminDatabase");

let local = (app) => {
  app.post("/api/getip", async (req, res) => {
    const { ipadress, kindo, vido } = req.body;
    if (!ipadress || !kindo || !vido) {
      return res.status(400).json({ message: "No IP address provided" });
    }

    try {
      const pool = await sql.connect(config);
      const check = await pool
        .request()
        .input("kinhdo", sql.VarChar, kindo)
        .input("vido", sql.VarChar, vido)
        .query(
          `SELECT COUNT(*) as count FROM ip_address WHERE kinhdo = @kinhdo AND vido = @vido`
        );
      if (check.recordset[0].count > 0) {
        console.log("IP đã tồn tại trong database");
        return;
      }
      const result = await pool
        .request()
        .input("ip_main", sql.VarChar, ipadress)
        .input("kinhdo", sql.VarChar, kindo)
        .input("vido", sql.VarChar, vido)
        .query(
          "INSERT INTO ip_address (ip_main, kinhdo, vido) VALUES (@ip_main, @kinhdo, @vido)"
        );

      if (result.rowsAffected[0] > 0) {
        console.log("IP đã được thêm");
        return res
          .status(200)
          .json({ message: "IP address inserted successfully" });
      } else {
        return res.status(500).json({ message: "Failed to insert IP address" });
        console.log("Failed to insert IP address");
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Error" });
      console.log("Error");
    }
  });
};

module.exports = local;

// let dd = async () => {
//   const localIP = getLocalIP();
//   const pool = await sql.connect(config);
//   const result = await pool
//     .request()
//     .query(
//       "SELECT COUNT(*) as count FROM ip_address WHERE ip_network = '192.168.25.107'"
//     );
//   console.log(localIP);
// };
// dd();
