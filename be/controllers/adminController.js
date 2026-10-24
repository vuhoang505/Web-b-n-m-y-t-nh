const User = require("../models/userModel");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// --- CẤU HÌNH MULTER (Nơi lưu ảnh) ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = "public/uploads/avatars"; // Đường dẫn thư mục lưu
    // Tạo thư mục nếu chưa có
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Đổi tên file: admin-thoigian-random.png
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "admin-" + uniqueSuffix + path.extname(file.originalname));
  },
});

// Bộ lọc chỉ cho phép file ảnh
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ được upload file ảnh!"), false);
  }
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
  fileFilter: fileFilter 
});

// Export middleware để dùng trong Router
exports.uploadAvatarMiddleware = upload.single("avatar");

// --- 1. CONTROLLER: LẤY THÔNG TIN (Code cũ của bạn) ---
exports.getAdminProfile = async (req, res, next) => {
  try {
    const admin = await User.findOne({ role: "admin" });

    if (!admin) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy admin!",
      });
    }

    // Logic tính toán ngày tháng server (dùng để render lần đầu)
    const createdAt = admin.createdAt;
    const createdAtVN = new Date(createdAt.getTime() + 7 * 60 * 60 * 1000); 

    const now = new Date();
    const diff = now.getTime() - createdAt.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    const daysActive = `${days} ngày ${hours} giờ ${minutes} phút ${seconds} giây`;

    // Render view
    res.render("partials/profile", {
      title: "Thông tin Admin",
      admin,
      // Gửi thêm biến này để script JS ở Frontend sử dụng
      createdAtISO: admin.createdAt ? admin.createdAt.toISOString() : new Date().toISOString(),
      createdAtVN: createdAtVN.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }),
      daysActive,
      user: admin, 
    });

  } catch (err) {
    console.error("❌ Lỗi:", err);
    res.status(500).send("Lỗi server");
  }
};

// --- 2. CONTROLLER: CẬP NHẬT AVATAR (Code Mới) ---
// TRONG FILE: controllers/adminController.js

exports.updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Vui lòng chọn file ảnh!" });
    }

    // --- SỬA ĐOẠN NÀY ---
    // Không dùng path.join vì nó có thể tạo ra dấu '\' trên Windows gây lỗi URL
    // Hãy nối chuỗi thủ công để đảm bảo luôn là dấu '/'
    const avatarUrl = `/uploads/avatars/${req.file.filename}`; 

    // Cập nhật vào Database...
    // (Giữ nguyên code update DB của bạn)
    // Cập nhật vào Database
    // Lưu ý: Tìm admin theo ID của session (nếu có login) hoặc tìm role: admin
    // Ở đây tôi dùng logic giống hàm getAdminProfile của bạn
    const updatedAdmin = await User.findOneAndUpdate(
      { role: "admin" }, 
      { avatar: avatarUrl },
      { new: true } // Trả về dữ liệu mới sau khi update
    );

    if (!updatedAdmin) {
      return res.status(404).json({ message: "Không tìm thấy Admin để cập nhật" });
    }

    console.log("✅ Đã cập nhật Avatar:", avatarUrl);

    // Trả về JSON để Frontend (file EJS) nhận biết
    return res.status(200).json({
      success: true,
      filePath: avatarUrl,
      message: "Cập nhật thành công!"
    });

  } catch (err) {
    console.error("❌ Lỗi upload avatar:", err);
    return res.status(500).json({ message: "Lỗi server khi lưu ảnh" });
  }
};