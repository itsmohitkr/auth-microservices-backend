const crypto = require("crypto"); // To generate the API key
const nodemailer = require("nodemailer"); // For sending emails
const service = require("./api.service"); // Service layer for database operations

async function create(req, res, next) {
  try {
    const { name, app_name, email } = req.body;

    if (!name || !app_name || !email) {
      return next({
        status: 400,
        message: "User Name, App name and email are required.",
      });
    }

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

    // Set up email transporter using nodemailer
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
      subject: "Your API Key for " + app_name,
      text: `Hello ${name},\n\nYour API Key for ${app_name} has been generated successfully.\n\nAPI Key: ${apiKey}\n\nPlease keep this key secure and do not share it publicly.\n\nThank you for using our services!\n\nBest Regards,\nThe Team`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
          <h2 style="color: #4CAF50;">Hello, ${name}!</h2>
          <p>
            We are pleased to inform you that your API key for the application <strong>${app_name}</strong> has been generated successfully.
          </p>
          <div style="background-color: #f8f9fa; padding: 15px; border: 1px solid #ddd; margin: 20px 0;">
            <strong>API Key:</strong> 
            <p style="font-size: 1.2em; color: #333;"><code>${apiKey}</code></p>
          </div>
          <p>
            Please make sure to <strong>keep this key secure</strong> and do not share it publicly. If you believe this key has been compromised, you can regenerate a new one via your account settings.
          </p>
          <p>Thank you for using our services!</p>
          <br>
          <p>Best Regards,</p>
          <p><strong>The Team</strong></p>
          <hr>
          <p style="font-size: 0.9em; color: #999;">
            If you have any questions, feel free to <a href="mailto:support@company.com">contact our support team</a>.
          </p>
        </div>
      `,
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
