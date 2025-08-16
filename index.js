import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import connectDB from "./config/connectDb.js";
import userRouter from "./route/user.route.js";
import categoryRouter from "./route/category.route.js";
import productRouter from "./route/product.route.js";
import cartRouter from "./route/cart.route.js";
import myListRouter from "./route/mylist.route.js";
import addressRouter from "./route/address.route.js";
import homeSlidesRouter from "./route/homeSlides.route.js";
import bannerV1Router from "./route/bannerV1.route.js";
import bannerList2Router from "./route/bannerList2.route.js";
import blogRouter from "./route/blog.route.js";
import orderRouter from "./route/order.route.js";
import logoRouter from "./route/logo.route.js";
import vendorRouter from "./route/vendor.route.js";
import brandRouter from "./route/brand.route.js";
import tagRouter from "./route/tag.route.js";
import labelRouter from "./route/label.route.js";
import bankRouter from "./route/bank.route.js";
import withdrawalRouter from "./route/withdrawal.route.js";
import adminRouter from "./route/admin.route.js";
import couponRouter from "./route/coupon.route.js";
import searchRouter from "./route/search.route.js";
import siteSettingRouter from "./route/siteSetting.route.js";
import shippingRouter from "./route/shipping.route.js";
import reportRouter from "./route/report.route.js";
import serviceZoneRouter from "./route/serviceZone.route.js";
import deliveryBoyRouter from "./route/deliveryBoy.route.js";
import currencyRouter from "./route/currencyExchange.js";

const app = express();
// app.use(cors());
// app.options("*", cors());
const allowedOrigins = [
  "https://soouqna.com",
  "https://admin.soouqna.com",
  "https://seller.soouqna.com",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:4173",
  "https://www.soouqna.com",
  "https://delivery.soouqna.com",
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());
app.use(cookieParser());
// app.use(morgan())
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    hsts: {
      maxAge: 31536000, // 1 year in seconds
      includeSubDomains: true,
      preload: true,
    },
  })
);
app.disable("x-powered-by"); // Also hide Express info in headers

app.get("/", (request, response) => {
  ///server to client
  response.json({
    message: "Server is running " + process.env.PORT,
  });
});

app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/category", categoryRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/myList", myListRouter);
app.use("/api/address", addressRouter);
app.use("/api/homeSlides", homeSlidesRouter);
app.use("/api/bannerV1", bannerV1Router);
app.use("/api/bannerList2", bannerList2Router);
app.use("/api/blog", blogRouter);
app.use("/api/order", orderRouter);
app.use("/api/logo", logoRouter);
app.use("/api/vendor", vendorRouter);
app.use("/api/tags", tagRouter);
app.use("/api/labels", labelRouter);
app.use("/api/brands", brandRouter);
app.use("/api/bank", bankRouter);
app.use("/api/withdrawal", withdrawalRouter);
app.use("/api/coupons", couponRouter);
app.use("/api/search", searchRouter);
app.use("/api/site-settings", siteSettingRouter);
app.use("/api/shipping-cost", shippingRouter);
app.use("/api/report", reportRouter);
app.use("/api/service-zones", serviceZoneRouter);
app.use("/api/deliveryboy", deliveryBoyRouter);
app.use("/api/currency-rates", currencyRouter);

connectDB().then(() => {
  app.listen(process.env.PORT, () => {
    console.log("Server is running", process.env.PORT);
  });
});
