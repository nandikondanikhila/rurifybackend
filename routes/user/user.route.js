const express = require("express");
const User = require("../../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const app = express.Router();
require("dotenv").config();

app.post("/signup", async (req, res) => {
  let { name, email, phone, village } = req.body;
  try {
    let existinguser = await User.findOne({ email });
    if (existinguser) {
      return res
        .status(404)
        .json({ ok: false, message: "Email already in use" });
    }
    await User.create({
      name,
      email,
      phone,
      village,
      adminApproved: false,
    });

    return res
      .status(201)
      .json({ ok: true, message: "User created successfully" });
  } catch (e) {
    return res.status(404).json({ ok: false, message: e.message });
  }
});

app.post("/signin", async (req, res) => {
  let { password, email } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ ok: false, message: "User not found" });
    const matchPassword = bcrypt.compareSync(password, user.password);
    if (!matchPassword) {
      return res
        .status(400)
        .json({ ok: false, message: "Please enter correct password" });
    }
    const jwtSecret = process.env.JWT_SECRECT;
    const token = jwt.sign(
      { email: user.email, id: user._id, role: "user" },
      jwtSecret
    );
    res.cookie("token", token, {
      httpOnly: false,
      sameSite: "none",
      secure: true,
    });
    return res.status(200).json({ ok: true, message: "Signed successfully" });
  } catch (e) {
    res.status(404).send(e.message);
  }
});

app.get("/valid", async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token)
      return res
        .status(403)
        .json({ ok: false, message: "token not authorized" });
    const { id, email } = jwt.decode(token);
    const user = await User.findOne({ _id: id, email });
    if (!user) {
      return res
        .status(403)
        .json({ ok: false, message: "User not authorized" });
    }
    return res.status(200).json({ ok: true, message: "valid Admin" });
  } catch (e) {
    return res.status(400).json({ ok: false, message: e.message });
  }
});

app.get("/", async (req, res) => {
  const { limit, page } = req.query;
  try {
    if (limit && page) {
      let users = await User.find()
        .select("name email phone village adminApproved")
        .skip((page - 1) * limit)
        .limit(limit);

      return res.status(200).json({ ok: true, data: users });
    } else {
      let users = await User.find().select(
        "name email phone village adminApproved"
      );
      return res.status(200).json({ ok: true, data: users });
    }
  } catch {
    res.status(404).send(e.message);
  }
});

app.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const body = req.body;
  try {
    await User.updateOne({ _id: id }, { $set: body });
    return res
      .status(200)
      .json({ ok: true, message: "User Updared successfully" });
  } catch (e) {
    res.status(404).send(e.message);
  }
});

app.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    let user = await User.findOne({ _id: id });
    if (user.email) {
      return res.status(200).send(user);
    } else {
      res.status(403).send("user not found");
    }
  } catch (e) {
    res.status(404).send(e.message);
  }
});

app.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await User.deleteOne({ _id: id });
    return res
      .status(200)
      .json({ ok: true, message: "User deleted successfully" });
  } catch (e) {
    res.status(404).send(e.message);
  }
});

module.exports = app;
