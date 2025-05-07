const nodemailer = require('nodemailer');
const config = require('../../config');
const logger = require('../../utils/core/logger');
const fs = require('fs');
const path = require('path');
const emailTemplates = JSON.parse(fs.readFileSync(path.join(__dirname, '../../templates', 'emailTemplates.json'), 'utf-8'));

const transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.secure,
    auth: config.email.auth,
});

function populateTemplate(template, replacements) {
    let populatedText = template.text;
    let populatedHtml = template.html;

    Object.keys(replacements).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        populatedText = populatedText.replace(regex, replacements[key]);
        populatedHtml = populatedHtml.replace(regex, replacements[key]);
    });

    return {populatedText, populatedHtml};
}


async function sendEmail(templateName, replacements) {
    const template = emailTemplates[templateName];

    if (!template) {
        logger.error(`No email template found for ${templateName}`);
        return;
    }

    const {populatedText, populatedHtml} = populateTemplate(template, replacements);

    const subject = `[${config.SERVER_IP}] ${template.subject}`;

    try {
        logger.warn(populatedText);

        await transporter.sendMail({
            from: config.email.auth.user,
            to: config.email.recipients.join(','),
            subject,
            text: populatedText,
            html: populatedHtml,
        });

        logger.info(`Email sent: ${subject}`);
    } catch (error) {
        logger.error(`Failed to send email: ${error.message}`);
    }
}

module.exports = {sendEmail};
