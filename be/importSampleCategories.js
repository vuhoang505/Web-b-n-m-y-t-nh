const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Category = require("./models/categoryModel");
const categories = require("./sampleData/categories");

dotenv.config({ path: "./config.env" });

mongoose.connect(process.env.DATABASE.replace("<PASSWORD>", process.env.DATABASE_PASSWORD))
  .then(() => console.log("✅ Đã kết nối MongoDB"));

const importData = async () => {
  try {
    await Category.deleteMany();
    await Category.insertMany(categories);
    console.log("✅ Đã import category mẫu thành công!");
    process.exit();
  } catch (err) {
    console.error("❌ Lỗi:", err);
    process.exit(1);
  }
};

importData();
