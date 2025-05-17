import express, {Express} from 'express';
import baseRoutes from './routes/system/baseRoutes';
import nodeRoutes from './routes/system/nodeRoutes';
import taskRoutes from './routes/system/taskRoutes';
import statusRoutes from './routes/monitor/statusRoutes';
import alertRoutes from './routes/monitor/alertRoutes';
import connectionRoutes from './routes/monitor/connectionRoutes';
import monitorRoutes from './routes/monitor/monitorRoutes';
import metaRoutes from './routes/monitor/metaRoutes';

import logger from './utils/core/logger';
import config from './config';
import {secureAccess} from './middleware/auth';

const app: Express = express();
app.use(express.json());

app.use('/', [secureAccess(), baseRoutes]);
app.use('/node', [secureAccess(), nodeRoutes]);
app.use('/tasks', [secureAccess(), taskRoutes]);
app.use('/api/status', [secureAccess(), statusRoutes]);
app.use('/api/alerts', [secureAccess(), alertRoutes]);
app.use('/api/connections', [secureAccess(), connectionRoutes]);
app.use('/api/monitors', [secureAccess(), monitorRoutes]);
app.use('/api/meta', [secureAccess(), metaRoutes]);

const server = app.listen(config.port, () => {
    logger.info(`Server is running on http://localhost:${config.port}`);
    console.log(`Server is running on http://localhost:${config.port}`);
});

function gracefulShutdown(signal: NodeJS.Signals): void {
    logger.info(`Received ${signal}. Closing server...`);
    server.close(() => {
        logger.info('Server has been stopped gracefully.');
        process.exit(0);
    });
}

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
