const jwt = require("jsonwebtoken");
const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const factory = require("./handlerFactory");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
const googleRedirect = (user, res) => {
  const token = signToken(user._id);
  console.log(token);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
  console.log(cookieOptions);
  res.cookie("jwt", token, cookieOptions);
  res.locals.user = user;

  return res.redirect("/");
};
exports.errorPage = (req, res, next) => {
  if (res.locals.user == undefined) {
    return res.redirect("/login");
  }
  if (res.locals.user.role != "admin") {
    return res.redirect("/error");
  }
  next();
};
exports.alreadyLoggedIn = (req, res, next) => {
  if (res.locals.user != undefined && res.locals.user.role == "admin")
    return res.redirect("/");
  next();
};
exports.googleLogin = catchAsync(async (req, res) => {
  const { email_verified, name, email, picture } = req.user;
  if (email_verified) {
    // 1) Check if user exists
    const user = await User.findOne({ email });
    // 2) Check if user exist
    if (user.role == "admin") {
      googleRedirect(user, res);
    }
    // 3) If user does not exist, create one
    else {
      // const password = email + process.env.JWT_SECRET;
      // const newUser = await User.create({
      //   email,
      //   password,
      //   name,
      //   avatar: picture,
      // });
      // googleRedirect(newUser, res);
      return res.redirect("/login");
    }
  }
});
