const mongoose = require("mongoose");
require("dotenv").config();

const URL = process.env.MONGO_DB_URL;
const dbconnect = async () => {
  try {
    await mongoose.connect(URL);
  } catch (err) {
    console.log(err);
  }
};

module.exports = dbconnect;
