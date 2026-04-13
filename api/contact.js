const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { name, email, budget, message } = req.body;

        if (!name || !email || !budget) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Configure Nodemailer Transporter
        // Note: EMAIL_USER and EMAIL_PASS must be set in Vercel Environment Variables
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, // e.g., admin@digitaldustak.com
                pass: process.env.EMAIL_PASS  // Google App Password
            }
        });

        const mailOptions = {
            from: `"${name}" <${process.env.EMAIL_USER}>`, // Recommended by Gmail to avoid spam flags
            to: process.env.EMAIL_USER,
            replyTo: email,
            subject: `🚀 New Strategy Call Request: ${name}`,
            text: `
New submission from digitaldustak.com

👤 Name: ${name}
📧 Email: ${email}
💰 Monthly Budget: ${budget}
💬 Message: ${message || 'No specific message provided.'}
            `,
            html: `
                <div style="font-family: sans-serif; padding: 20px; color: #333; line-height: 1.6;">
                    <h2 style="color: #f57c2c;">🚀 New Strategy Call Request</h2>
                    <p>You have a new lead from the Digital Dustak website.</p>
                    <hr style="border: 0; border-top: 1px solid #eee;">
                    <p><strong>👤 Name:</strong> ${name}</p>
                    <p><strong>📧 Email:</strong> <a href="mailto:${email}">${email}</a></p>
                    <p><strong>💰 Monthly Budget:</strong> ${budget}</p>
                    <p><strong>💬 Message:</strong></p>
                    <blockquote style="background: #f9f9f9; border-left: 4px solid #f57c2c; padding: 10px 15px; margin: 0;">
                        ${message || 'No specific message provided.'}
                    </blockquote>
                    <hr style="border: 0; border-top: 1px solid #eee;">
                    <p style="font-size: 0.9rem; color: #777;">Digital Dustak Dashboard submission.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({ message: "Success" });

    } catch (error) {
        console.error("Contact API Error:", error);
        return res.status(500).json({ 
            error: "Failed to send email", 
            details: error.message,
            hint: "Check if EMAIL_USER and EMAIL_PASS are correct in Vercel settings and if a Google App Password is being used."
        });
    }
};
