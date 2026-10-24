const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Brand = require("./models/brandModel");
const brands = require("./sampleData/brands");

dotenv.config({ path: "./config.env" });

mongoose.connect(process.env.DATABASE.replace("<PASSWORD>", process.env.DATABASE_PASSWORD))
  .then(() => console.log("✅ Đã kết nối MongoDB"));

const importData = async () => {
  try {
    await Brand.deleteMany();
    await Brand.insertMany(brands);
    console.log("✅ Đã import brand mẫu thành công!");
    process.exit();
  } catch (err) {
    console.error("❌ Lỗi:", err);
    process.exit(1);
  }
};

importData();
