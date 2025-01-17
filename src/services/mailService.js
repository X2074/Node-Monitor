const nodemailer = require('nodemailer');
const config = require('../config');
const logger = require('../utils/logger');

const transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.secure,
    auth: config.email.auth,
});

async function sendEmail(subject, text, html = null) {
    try {
        await transporter.sendMail({
            from: config.email.auth.user,
            to: config.email.recipients.join(','),
            subject,
            text,
            html,
        });
        logger.info(`Email sent: ${subject}`);
    } catch (error) {
        logger.error(`Failed to send email: ${error.message}`);
    }
}

module.exports = { sendEmail };
