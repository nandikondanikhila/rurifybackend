const express = require("express");
const AdminModel = require("../../models/admin.model");
const UserModel = require("../../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const IssueModel = require("../../models/Issue.model");
const app = express.Router();
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

require("dotenv").config();

app.get("/valid", async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token)
      return res
        .status(403)
        .json({ ok: false, message: "User not authorized" });
    const { id, email } = jwt.decode(token);
    const admin = await AdminModel.findOne({ _id: id, email });
    if (!admin) {
      return res
        .status(403)
        .json({ ok: false, message: "User not authorized" });
    }
    return res.status(200).json({ ok: true, message: "valid Admin" });
  } catch (e) {
    return res.status(400).json({ ok: false, message: e.message });
  }
});

app.post("/signin", async (req, res) => {
  let { password, email } = req.body;
  try {
    let admin = await AdminModel.findOne({ email });
    if (!admin)
      return res.status(404).json({ ok: false, message: "Admin not found" });
    const matchPassword = bcrypt.compareSync(password, admin.password);
    if (!matchPassword) {
      return res
        .status(400)
        .json({ ok: false, message: "Please enter correct password" });
    }
    const jwtSecret = process.env.JWT_SECRECT;
    const token = jwt.sign(
      { email: admin.email, id: admin._id, role: "admin" },
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

app.get("/approve/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await UserModel.findOne({ _id: id }).select("name email");

    if (!user) {
      return res.status(404).json({ ok: false, message: "User Not Found" });
    }

    const userPassword = `${user.name}@${Math.floor(
      Math.random() * 50 + 1
    )}@123`;

    const saltRounds = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync(userPassword, saltRounds);

    await UserModel.updateOne(
      { _id: id },
      { $set: { adminApproved: true, password: hashPassword } }
    );

    const emailTemplatePath = path.join(__dirname, "emailTemplate.html");
    let htmlContent = fs.readFileSync(emailTemplatePath, "utf-8");

    const replacements = {
      RECIPIENT_NAME: user.name,
      RECIPIENT_EMAIL: user.email,
      RECIPIENT_PASSWORD: userPassword,
    };

    Object.keys(replacements).forEach((placeholder) => {
      const regex = new RegExp(`{{${placeholder}}}`, "g");
      htmlContent = htmlContent.replace(regex, replacements[placeholder]);
    });

    const USER_EMAIL = process.env.USER_EMAIL;
    const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: USER_EMAIL,
        pass: EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: USER_EMAIL,
      to: user.email,
      subject: "Credentials to login the Rurify Portal",
      html: htmlContent,
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error.message);

        return res.status(500).json({
          ok: false,
          message: "Error sending email",
          error: error.message,
        });
      } else {
        console.log("Email sent:", info.response);

        return res
          .status(200)
          .json({ ok: true, message: "User approved successfully" });
      }
    });
  } catch (e) {
    return res.status(400).json({ ok: false, message: e.message });
  }
});

app.patch("/approve-issue/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { volunteer } = req.body;
    await IssueModel.updateOne(
      { _id: id },
      {
        $set: {
          adminApproved: true,
          rewards: `${Math.floor(Math.random() * 100) + 1}`,
          volunteer: volunteer,
        },
      }
    );
    return res
      .status(200)
      .json({ ok: false, message: "Issue approved successfully" });
  } catch (e) {
    return res.status(400).json({ ok: false, message: e.message });
  }
});

app.get("/issues", async (req, res) => {
  try {
    const Issues = await IssueModel.find().populate({
      path: "user",
      select: "name",
    });
    return res.status(200).json({ ok: true, data: Issues });
  } catch (e) {
    return res.status(400).json({ ok: false, message: e.message });
  }
});

app.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    let admin = await AdminModel.findOne({ _id: id });
    if (admin.email) {
      return res.status(200).send(admin);
    } else {
      res.status(403).send("Admin not found");
    }
  } catch (e) {
    res.status(404).send(e.message);
  }
});

module.exports = app;
