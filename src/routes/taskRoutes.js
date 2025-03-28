const express = require('express');
const {clearAll, start, pause, list} = require('../utils/cronUtil');
const logger = require('../utils/logger');

const router = express.Router();


router.post('/clear', (req, res) => {
    logger.info('Clearing all tasks...');
    clearAll();
    res.json({success: true, message: 'All tasks have been cleared.'});
});

router.get('/list', (req, res) => {
    const tasks = list();
    res.json({success: true, tasks});
});

router.post('/start/:name', (req, res) => {
    const {name} = req.params;
    start(name);
    res.json({success: true, message: `Task ${name} started.`});
});

router.post('/pause/:name', (req, res) => {
    const {name} = req.params;
    pause(name);
    res.json({success: true, message: `Task ${name} stopped.`});
});

module.exports = router;
