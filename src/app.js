const express = require('express');
const baseRoutes = require('./routes/system/baseRoutes');
const nodeRoutes = require('./routes/system/nodeRoutes');
const taskRoutes = require('./routes/system/taskRoutes');
const emailRoutes = require('./routes/notify/emailRoutes');
const statusRoutes = require('./routes/monitor/statusRoutes');
const alertRoutes = require('./routes/monitor/alertRoutes');
const connectionRoutes = require('./routes/monitor/connectionRoutes');
const monitorRoutes = require('./routes/monitor/monitorRoutes');
const metaRoutes = require('./routes/monitor/metaRoutes');

const logger = require('./utils/core/logger');
const config = require('./config');
const {secureAccess} = require("./middleware/auth");
const app = express();
app.use(express.json());

app.use('/', [secureAccess(), baseRoutes]);
app.use('/node', [secureAccess(), nodeRoutes]);
app.use('/tasks', [secureAccess(), taskRoutes]);
app.use('/email', [secureAccess(), emailRoutes]);
app.use('/api/status', [secureAccess(), statusRoutes]);
app.use('/api/alerts', [secureAccess(), alertRoutes]);
app.use('/api/connections', [secureAccess(), connectionRoutes]);
app.use('/api/monitors', [secureAccess(), monitorRoutes]);
app.use('/api/meta', [secureAccess(), metaRoutes]);

const server = app.listen(config.port, () => {
    logger.info(`Server is running on http://localhost:${config.port}`);
    console.log(`Server is running on http://localhost:${config.port}`);
});

function gracefulShutdown(signal) {
    logger.info(`Received ${signal}. Closing server...`);
    server.close(() => {
        logger.info('Server has been stopped gracefully.');
        process.exit(0);
    });
}


process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);


module.exports = app;
