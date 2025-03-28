const express = require('express');
const nodeRoutes = require('./routes/nodeRoutes');
const baseRoutes = require('./routes/baseRoutes');
const taskRoutes = require('./routes/taskRoutes');
const emailRoutes = require('./routes/emailRoutes');
const logger = require('./utils/logger');
const config = require('./config');
const app = express();


app.use(express.json());
app.use((err, req, res) => {
    logger.error(`Unhandled error: ${err.message}\n${err.stack}`);
    res.status(500).json({success: false, message: 'Internal Server Error'});
});

app.use('/', baseRoutes);
app.use('/node', nodeRoutes);
app.use('/tasks', taskRoutes);
app.use('/email', emailRoutes);


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
