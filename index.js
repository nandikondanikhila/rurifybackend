const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db.js");
const cookiParser = require("cookie-parser");
require("dotenv").config();

const userRoute = require("./routes/user/user.route.js");
const adminRoute = require("./routes/admin/admin.route.js");
const issuesRouter = require("./routes/issues/issue.route.js");

const app = express();
const PORT = process.env.PORT || 8080;
const corsOptions = {
  origin: 'https://rurifyui.vercel.app', 
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', 
  credentials: true, 
  exposedHeaders: ['Content-Length', 'Authorization'], 
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 86400, 
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookiParser());
app.get("/", (req, res) => {
  return res
    .status(200)
    .json({ ok: true, message: "Welcome to Rurify Application" });
});
app.get("/logout", (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).send({ ok: true, message: "Logout successful" });
  } catch (e) {
    return res.status(400).json({ ok: false, message: e.message });
  }
});
app.use("/user", userRoute);
app.use("/admin", adminRoute);
app.use("/issues", issuesRouter);

app.listen(PORT, async (req, res) => {
  try {
    await connectDB();
    console.log("Mongo DB conected successfully");
    console.log(`Server running on ${PORT}`);
  } catch (err) {
    console.log(err);
  }
});
