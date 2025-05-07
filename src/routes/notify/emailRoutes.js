const express = require('express');
const {sendEmail} = require('../../services/mail/mailService');
const router = express.Router();

router.post('/send-alert-email', async (req, res) => {
    const {templateName, replacements} = req.body;

    if (!templateName || !replacements) {
        return res.status(400).json({message: 'templateName and replacements are required'});
    }

    try {
        await sendEmail(templateName, replacements);
        return res.status(200).json({message: `${templateName} email sent successfully`});
    } catch (error) {
        return res.status(500).json({message: `Failed to send email: ${error.message}`});
    }
});

module.exports = router;
