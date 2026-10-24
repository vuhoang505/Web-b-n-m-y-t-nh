const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController'); // Đường dẫn tới file controller bên trên

// Route GET: Xem hồ sơ
router.get('/profile', adminController.getAdminProfile);

// Route POST: Upload Avatar
// uploadAvatarMiddleware: Xử lý file trước
// updateAvatar: Xử lý lưu vào DB sau
router.post('/update-avatar', adminController.uploadAvatarMiddleware, adminController.updateAvatar);

module.exports = router;