const express = require('express');
const {success, error} = require('./utils/httpResponse');
const monitorService = require('./services/monitorService');
const {restartNode, startNode, stopNode} = require('./services/restartService');

const logger = require('./utils/logger');
const config = require('./config');
const {clearAll} = require('./utils/cronUtil');
const app = express();
const PORT = config.port;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('QNG Monitor!');
});


const server = app.listen(PORT, () => {
    logger.info(`Server is running on http://localhost:${PORT}`);
    console.log(`Server is running on http://localhost:${PORT}`);
});

app.use((err, req, res, next) => {
    logger.error(`Unhandled error: ${err.message}`);
    res.status(500).json({success: false, message: 'Internal Server Error'});
});


app.get('/status', async (req, res) => {
    try {
        const status = await monitorService.getNodeStatus();
        success(res, status);
    } catch (err) {
        logger.error(`Error fetching status: ${err.message}`);
        error(res, 'Failed to fetch node status');
    }
});
app.post('/node/restart', async (req, res) => {
    try {
        await restartNode();
        success(res, 'Qitmeer node restarted successfully.');
    } catch (err) {
        logger.error(`Error restarting node: ${err.message}`);
        error(res, 'Failed to restart Qitmeer node');
    }
});
app.post('/node/start', async (req, res) => {
    try {
        await startNode();
        success(res, 'Qitmeer node start successfully.');
    } catch (err) {
        logger.error(`Error start node: ${err.message}`);
        error(res, 'Failed to start Qitmeer node');
    }
});

app.post('/node/stop', async (req, res) => {
    try {
        await stopNode();
        success(res, 'Qitmeer node stop successfully.');
    } catch (err) {
        logger.error(`Error stop node: ${err.message}`);
        error(res, 'Failed to stop Qitmeer node');
    }
});


app.post('/monitor', async (req, res) => {
    try {
        await monitorService.monitor();
        success(res, 'Monitor task triggered');
    } catch (err) {
        logger.error(`Error triggering monitor: ${err.message}`);
        error(res, 'Failed to trigger monitor');
    }
});

app.post('/tasks/clear', (req, res) => {
    clearAll();
    res.json({success: true, message: 'All tasks have been cleared.'});
});

function gracefulShutdown(signal) {
    logger.info(`Received ${signal}. Closing server...`);
    console.log(`Received ${signal}. Closing server...`);
    server.close(() => {
        logger.info('Server has been stopped gracefully.');
        console.log('Server has been stopped gracefully.');
        process.exit(0);
    });
}


process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);


module.exports = app;
