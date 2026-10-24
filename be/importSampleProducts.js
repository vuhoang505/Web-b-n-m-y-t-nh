const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("./models/productModel");
const Brand = require("./models/brandModel");
const Category = require("./models/categoryModel");
const products = require("./sampleData/products");

dotenv.config({ path: "./config.env" });

mongoose.connect(process.env.DATABASE.replace("<PASSWORD>", process.env.DATABASE_PASSWORD))
  .then(() => console.log("✅ Đã kết nối MongoDB"));

const importData = async () => {
  try {
    await Product.deleteMany();

    // 🔹 Lấy danh sách brand & category từ DB
    const brands = await Brand.find();
    const categories = await Category.find();

    // 🔹 Map tên thành ObjectId tương ứng
    const formattedProducts = products.map((p) => ({
      ...p,
      brand: brands.find((b) => b.name === p.brand)?._id,
      category: categories.find((c) => c.name === p.category)?._id,
    }));

    await Product.insertMany(formattedProducts);

    console.log("✅ Đã import product mẫu thành công!");
    process.exit();
  } catch (err) {
    console.error("❌ Lỗi:", err);
    process.exit(1);
  }
};

importData();
