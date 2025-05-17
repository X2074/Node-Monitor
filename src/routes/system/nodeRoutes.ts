import express from 'express';
import {restartNode, startNode, stopNode} from '../../utils/system/restart';
import {handleNodeAction} from '../../utils/core/action';

const router = express.Router();

router.post('/restart', (req,
                         res) =>
    handleNodeAction(restartNode, 'Qitmeer node restarted successfully.', 'Failed to restart Qitmeer node', res));
router.post('/start', (req, res) => handleNodeAction(startNode, 'Qitmeer node start successfully.', 'Failed to start Qitmeer node', res));
router.post('/stop', (req, res) => handleNodeAction(stopNode, 'Qitmeer node stop successfully.', 'Failed to stop Qitmeer node', res));

export default router;
