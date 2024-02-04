const express = require("express");
const IssueModal = require("../../models/Issue.model");
const jwt = require("jsonwebtoken");
const app = express.Router();

app.post("/new", async (req, res) => {
  try {
    const { user, img, description, location } = req.body;
    const token = req.cookies?.token;
    if (!token)
      return res
        .status(403)
        .json({ ok: false, message: "User not authorized" });
    const { id } = jwt.decode(token);
    await IssueModal.create({
      user: id,
      img,
      description,
      adminApproved: false,
      location,
    });
    return res
      .status(200)
      .json({ ok: true, message: "Issue craeted successfully." });
  } catch (e) {
    return res.status(400).json({ ok: false, message: e.message });
  }
});

app.get("/", async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token)
      return res
        .status(403)
        .json({ ok: false, message: "User not authorized" });
    const { id } = jwt.decode(token);
    const Issues = await IssueModal.find({ user: id });
    return res.status(200).json({ ok: true, data: Issues });
  } catch (e) {
    return res.status(400).json({ ok: false, message: e.message });
  }
});

module.exports = app;
