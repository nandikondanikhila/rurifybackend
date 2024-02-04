const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
  },
  phone: {
    type: String,
    required: true,
  },
  village: {
    type: String,
    required: true,
  },
  adminApproved: {
    type: Boolean,
    required: false,
  },
});

const userModel = mongoose.model("user", userSchema);
module.exports = userModel;
