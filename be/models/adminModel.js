const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Vui lòng nhập tên admin!"],
  },
  email: {
    type: String,
    required: [true, "Vui lòng nhập email!"],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, "Vui lòng nhập mật khẩu!"],
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    default: "admin",
  },
});

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;
