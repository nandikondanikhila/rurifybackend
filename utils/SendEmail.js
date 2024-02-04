
require("dotenv").config();


console.log(user, paasword);


Object.keys(replacements).forEach((placeholder) => {
  const regex = new RegExp(`{{${placeholder}}}`, "g");
  htmlContent = htmlContent.replace(regex, replacements[placeholder]);
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "karthikalakunta21@gmail.com",
    pass: paasword,
  },
});

// Email details
const mailOptions = {
  from: "karthikalakunta21@gmail.com",
  to: recipientEmail,
  subject: "Subject of the email",
  html: htmlContent,
};

// Send email
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error("Error sending email:", error.message);
  } else {
    console.log("Email sent:", info.response);
  }
});
