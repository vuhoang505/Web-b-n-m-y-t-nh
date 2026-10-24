const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Vui lòng cung cấp tên!"],
  },
  email: {
    type: String,
    required: [true, "Vui lòng cung cấp email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Vui lòng cung cấp mail chính xác"],
  },
    avatar: {
    type: String,
    default: "http://localhost:5000/images/anh.png",
  },

  role: {
    type: String,
    enum: ["user", "employee", "admin"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "Tài khoản cần có mật khẩu"],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Vui lòng nhập lại mật khẩu"],
    validate: {
      // This only works on CREATE and SAVE!!!
      validator: function (el) {
        return el === this.password;
      },
      message: "Nhập lại mật khẩu chưa đúng!",
    },
  },
  createdAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 60 * 60 * 1000),
  },
  daysActive: {
    type: String,
    default: "0 ngày 0 giờ 0 phút 0 giây",
  },

  address: [
    {
      name: String,
      phone: String,
      province: String,
      district: String,
      ward: String,
      detail: String,
      setDefault: {
        type: Boolean,
        default: false,
      },
    },
  ],
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  userVerifyToken: String,
  active: {
    type: String,
    enum: ["active", "verify", "ban"],
    default: "verify",
  },
  dateOfBirth: String,
  gender: String,
  phone: String,
  balance: {
    type: Number,
    default: 0,
  },
});
userSchema.index({'$**': 'text'});

userSchema.pre("save", async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified("password")) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

/* 🕒 Tính daysActive chính xác theo múi giờ Việt Nam */
userSchema.pre("save", function (next) {
  const now = new Date(Date.now() + 7 * 60 * 60 * 1000); // Giờ Việt Nam
  if (!this.createdAt) this.createdAt = now;

  const diff = now.getTime() - this.createdAt.getTime();

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  this.daysActive = `${days} ngày ${hours} giờ ${minutes} phút ${seconds} giây`;
  next();
});

/* 🧮 Auto cập nhật daysActive khi find */
userSchema.post(/^find/, async function (docs, next) {
  if (!Array.isArray(docs)) docs = [docs];

  const now = new Date(Date.now() + 7 * 60 * 60 * 1000); // Giờ Việt Nam

  for (const doc of docs) {
    if (doc && doc.createdAt) {
      const diff = now.getTime() - doc.createdAt.getTime();

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const newValue = `${days} ngày ${hours} giờ ${minutes} phút ${seconds} giây`;

      if (doc.daysActive !== newValue) {
        doc.daysActive = newValue;
        await doc.save({ validateBeforeSave: false });
      }
    }
  }

  next();
});

// ✅ Cập nhật daysActive mỗi khi lấy ra từ CSDL (dùng virtual)
userSchema.virtual("daysActiveRealtime").get(function () {
  if (!this.createdAt) return "0 ngày 0 giờ 0 phút 0 giây";

  const now = new Date();
  let diff = now.getTime() - this.createdAt.getTime();
  if (diff < 0) diff = 0;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return `${days} ngày ${hours} giờ ${minutes} phút ${seconds} giây`;
});

// userSchema.pre(/^find/, function (next) {
//   // this points to the current query
//   // this.find({ active: { $ne: "ban" } });
//   next();
// });

userSchema.post(/^find/, async function (docs, next) {
  if (!Array.isArray(docs)) docs = [docs];
  for (const doc of docs) {
    if (doc && doc.createdAt) {
      const diff = Date.now() - doc.createdAt.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      if (doc.daysActive !== days) {
        doc.daysActive = days;
        await doc.save({ validateBeforeSave: false });
      }
    }
  }
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  const result = await bcrypt.compare(candidatePassword, userPassword);
  return result;
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(3).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};
userSchema.methods.createVerifyToken = function () {
  const verifyToken = crypto.randomBytes(3).toString("hex");

  this.userVerifyToken = crypto
    .createHash("sha256")
    .update(verifyToken)
    .digest("hex");

  console.log({ verifyToken }, this.userVerifyToken);

  return verifyToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
