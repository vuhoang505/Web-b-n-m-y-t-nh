const express = require("express");
const morgan = require("morgan");
const path = require("path");
const rateLimit = require("express-rate-limit");
// const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const engine = require("ejs-mate");

const AppError = require("./utils/appError");
// const globalErrorHandler = require("./controllers/errorController");
const productRouter = require("./routes/productRoutes");
const userRouter = require("./routes/userRoutes");
const categoryRouter = require("./routes/categoryRoutes");
const brandRouter = require("./routes/brandRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const orderRouter = require("./routes/orderRoutes");
const importRouter = require("./routes/importRoutes");
const commentRouter = require("./routes/commentRoutes");
const viewRouter = require("./routes/viewRoutes");
const transactionRouter = require("./routes/transactionRoutes");
const locationRouter = require("./routes/locationRoutes");
const app = express(); // <-- phải có dòng này TRƯỚC khi dùng app.use()

const adminRoutes = require("./routes/adminRoutes");
const session = require('express-session');

app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true,
}));

// Middleware, parser, static, v.v.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Định nghĩa các route
app.use("/admin", adminRoutes);

app.use(express.static(path.join(__dirname, 'public')));
// Render engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.engine("ejs", engine);
app.set("view engine", "ejs");
// Add headers before the routes are defined
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);
// Serving static files
// app.use(express.static(path.join(__dirname, "public")));
app.use(
  "/bootstrap",
  express.static(__dirname + "/node_modules/bootstrap/dist/")
);
app.use("/text", express.static(__dirname + "/node_modules/tinymce/"));
// 1) GLOBAL MIDDLEWARE
// Set security HTTP headers
// app.use(helmet());
app.use(cookieParser());

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api", limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: false }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: ["ratingsQuantity", "ratingsAverage", "price"],
  })
);

// Serving static files
app.use(express.static(`${__dirname}/views`));
app.use(express.static(`${__dirname}/public`));
app.use('/images', express.static(path.join(__dirname, 'public/images')));


// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

// 3) ROUTES
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/brands", brandRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/imports", importRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/payments", transactionRouter);
app.use("/api/v1/locations", locationRouter);
app.use("/", viewRouter);

// Trong app.js, ngay trên dòng app.all("*", ...)
app.get("/api/v1/test", (req, res) => {
  res.status(200).json({ message: "✅ FE đã kết nối BE thành công!" });
});


app.all("*", (req, res, next) => {
  // next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
  res.status(200).render("404");
});

app.use((err, req, res, next) => {
  // console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
});

module.exports = app;
