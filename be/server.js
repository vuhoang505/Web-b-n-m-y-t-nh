// server.js
const fs = require("fs");
console.log("📁 Kiểm tra file tồn tại:", fs.existsSync(__dirname + "/config.env"));

console.log("📂 Đường dẫn đang chạy:", __dirname);

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = require("./app");

dotenv.config({ path: __dirname + "/config.env" });

console.log("JWT_SECRET =", process.env.JWT_SECRET);
console.log("📄 File .env đã load:", process.env.JWT_SECRET);



mongoose.set("strictQuery", true);

console.log("🟡 Đang thử kết nối MongoDB...");

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

// Kết nối MongoDB
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Kết nối MongoDB thành công!"))
  .catch((err) => {
    console.error("❌ Lỗi kết nối MongoDB:", err.message);
  });

// Khởi động server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`🚀 App đang chạy tại http://localhost:${port}`);
});
