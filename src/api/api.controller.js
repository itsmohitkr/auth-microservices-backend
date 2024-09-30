const crypto = require("crypto"); // To generate the API key
const nodemailer = require("nodemailer"); // For sending emails
const service = require("./api.service"); // Service layer for database operations

async function create(req, res, next) {
  try {
    const catchError = [];
      const { name, app_name, email } = req.body; 
    
    if (!name || !app_name || !email) {
      return next({
        status: 400,
        message: "User Name, App name and email are required.",
      });
    }

    // Check if the application already exists for the given email
    const existingApplication = await service.read(email);
    if (existingApplication) {
      return next({
        status: 400,
        message: "Application already exists for this email.",
      });
    }

    // Generate a unique API key using crypto
    const apiKey = crypto.randomBytes(20).toString("hex");

      const newApplication = await service.create({
        name,
      app_name,
      email,
      api_key: apiKey,
    });

    const transporter = nodemailer.createTransport({
      service: "Gmail", 
      auth: {
        user: process.env.EMAIL_USERNAME, 
        pass: process.env.EMAIL_PASSWORD, 
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USERNAME, // Sender address
      to: email, // Recipient email
      subject: "Your API Key",
      text: `Hello,

      Your API Key for ${app_name} has been generated successfully.

      API Key: ${apiKey}

      Please keep this key secure and do not share it publicly.

      Thank you for using our services!

      Best Regards,
      The Team`,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      data: newApplication,
      message: `API key generated and sent to ${email}`,
    });
  } catch (error) {
    console.error(error);
    return next({
      status: 500,
      message: "An internal server error occurred. Please try again later.",
    });
  }
}

module.exports = {
  create,
};
