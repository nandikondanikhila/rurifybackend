const mongoose = require("mongoose");

const IssueSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  img: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  adminApproved: {
    type: Boolean,
    required: true,
  },
  rewards: {
    type: String,
  },
  volunteer: {
    type: String,
  },
});

const IssueModel = mongoose.model("issues", IssueSchema);

module.exports = IssueModel;
