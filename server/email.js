const axios = require('axios');
require('dotenv').config();

const sendEmail = async (recipientEmail, subject, content) => {
    try {
        const response = await axios.post(
            'https://api.brevo.com/v3/smtp/email',
            {
                sender: { name: "Your App", email: "no-reply@brevo.com" },
                to: [{ email: recipientEmail }],
               // subject: "Verify Your Email",
               // htmlContent: `<p>Your verification code: <b>${verificationCode}</b></p>`
                subject: subject,
                htmlContent: "<p>${content}</p>"
            },
            {
                headers: { "api-key": process.env.BREVO_API_KEY, "Content-Type": "application/json" }
            }
        );
        console.log("Email sent successfully:", response.data);
    } catch (error) {
        console.error("Error sending email:", error.response ? error.response.data : error.message);
    }
};

module.exports = sendEmail;
