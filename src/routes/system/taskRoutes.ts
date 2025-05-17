import express from 'express';
import {CronManager} from '../../utils/system/cronUtil';
import logger from '../../utils/core/logger';

const router = express.Router();


router.post('/clear', (req, res) => {
    logger.info('Clearing all tasks...');
    CronManager.clearAll();
    res.json({success: true, message: 'All tasks have been cleared.'});
});

router.get('/list', (req, res) => {
    const tasks = CronManager.list();
    res.json({success: true, tasks});
});

router.post('/start/:name', (req, res) => {
    const {name} = req.params;
    CronManager.start(name);
    res.json({success: true, message: `Task ${name} started.`});
});

router.post('/pause/:name', (req, res) => {
    const {name} = req.params;
    CronManager.pause(name);
    res.json({success: true, message: `Task ${name} stopped.`});
});

export default router;
