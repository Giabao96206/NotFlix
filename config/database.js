const mongoose = require("mongoose");

let add = "tranvangiabao96206_db_user";
let pass = "sQfevT3e3BQGxpiO";

const connectdtb = async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://tranvangiabao96206_db_user:${pass}@cluster0.l2gjlbd.mongodb.net/NotFlix`
    );
    console.log("Kết nối database thành công!");
  } catch (error) {
    console.log("Kết nối database thất bại!");
  }
};

module.exports = { connectdtb }; // ✅ Export dưới dạng object
