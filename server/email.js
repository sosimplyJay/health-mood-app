const axios = require('axios');
require('dotenv').config();

/**
 * Sends an email using the Brevo (formerly Sendinblue) API
 * 
 * @param {string} recipientEmail - The recipient's email address
 * @param {string} subject - The email subject
 * @param {string} content - The HTML content of the email
 * @returns {Promise} - Resolves when email is sent
 */
const sendEmail = async (recipientEmail, subject, content) => {
    try {
        // FIXED: The template literal wasn't working correctly in the original code
        // The htmlContent string was using quotes instead of backticks,
        // which prevented the variable from being interpolated
        
        const response = await axios.post(
            'https://api.brevo.com/v3/smtp/email',
            {
                sender: { name: "Your App", email: "no-reply@brevo.com" },
                to: [{ email: recipientEmail }],
                subject: subject,
                // FIXED: Changed from "<p>${content}</p>" to use backticks
                htmlContent: `<p>${content}</p>` 
            },
            {
                headers: { 
                    "api-key": process.env.BREVO_API_KEY, 
                    "Content-Type": "application/json" 
                }
            }
        );
        console.log("Email sent successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error sending email:", 
            error.response ? error.response.data : error.message);
        throw error; // Re-throw for better error handling in calling functions
    }
};

/**
 * Creates an enhanced email for verification with better styling
 * 
 * @param {string} email - The recipient's email address
 * @param {string} verificationCode - The verification code to send
 * @returns {Promise} - Resolves when email is sent
 */
const sendVerificationEmail = async (email, verificationCode) => {
    // Create a prettier HTML template with styling
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 10px;">
            <h2 style="color: #ff4d94; text-align: center;">Email Verification</h2>
            <p>Thank you for registering! To complete your registration, please use the verification code below:</p>
            
            <div style="background-color: #fff0f7; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; border: 2px dashed #ff99c8;">
                <h1 style="color: #5a1a5b; letter-spacing: 5px; margin: 0;">${verificationCode}</h1>
            </div>
            
            <p>This code will expire in 24 hours.</p>
            <p>If you did not request this verification, please disregard this email.</p>
            
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999; text-align: center;">
                <p>This is an automated message, please do not reply.</p>
            </div>
        </div>
    `;
    
    return sendEmail(email, "Verify Your Email", htmlContent);
};

// Export both the basic sendEmail function and the enhanced sendVerificationEmail function
module.exports = sendEmail;
// Optional enhancement to export the verification email function as well
// module.exports = { sendEmail, sendVerificationEmail };