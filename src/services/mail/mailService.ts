import nodemailer, { Transporter } from 'nodemailer';
import config from '../../config';
import logger from '../../utils/core/logger';
import fs from 'fs';
import path from 'path';

interface EmailTemplate {
    subject: string;
    text: string;
    html: string;
}

interface ReplacementsMap {
    [key: string]: string | number;
}


function loadEmailTemplates(): Record<string, EmailTemplate> {
    const possiblePaths = [
        path.resolve(__dirname, '../../templates/emailTemplates.json'),
        path.resolve(__dirname, '../../../templates/emailTemplates.json'),
        path.resolve(process.cwd(), 'templates/emailTemplates.json'),
    ];

    for (const templatePath of possiblePaths) {
        if (fs.existsSync(templatePath)) {
            try {
                const content = fs.readFileSync(templatePath, 'utf-8');
                return JSON.parse(content);
            } catch (e) {
                logger.error(`❌ Failed to parse emailTemplates.json at ${templatePath}:`, e);
            }
        }
    }

    logger.error('❌ emailTemplates.json not found in any known path.');
    return {};
}

const emailTemplates: Record<string, EmailTemplate> = loadEmailTemplates();


const transporter: Transporter = nodemailer.createTransport({
    host: config.email.host,
    port: Number(config.email.port),
    secure: config.email.secure , // Ensure correct type
    auth: config.email.auth,
});


function populateTemplate(
    template: EmailTemplate,
    replacements: ReplacementsMap
): { populatedText: string; populatedHtml: string } {
    let populatedText = template.text;
    let populatedHtml = template.html;

    for (const key in replacements) {
        const value = String(replacements[key]);
        const regex = new RegExp(`{{${key}}}`, 'g');
        populatedText = populatedText.replace(regex, value);
        populatedHtml = populatedHtml.replace(regex, value);
    }

    return { populatedText, populatedHtml };
}


export async function sendEmail(templateName: string, replacements: ReplacementsMap): Promise<void> {
    const template = emailTemplates[templateName];

    if (!template) {
        logger.error(`❌ No email template found for "${templateName}"`);
        return;
    }

    const { populatedText, populatedHtml } = populateTemplate(template, replacements);
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

        logger.info(`✅ Email sent: ${subject}`);
    } catch (error: any) {
        logger.error(`❌ Failed to send email: ${error.message}`);
    }
}
