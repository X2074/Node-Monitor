const express = require('express');
const {success, error} = require('./utils/httpResponse');
const monitorService = require('./services/monitorService');
const logger = require('./utils/logger');
const config = require('./config');
const {clearAll} = require('./utils/cronUtil');

const app = express();
const PORT = config.port; // 使用配置文件中的端口号

app.use(express.json());

// API 路由
app.get('/', (req, res) => {
    res.send('Qitmeer Monitor!');
});


// 启动服务
const server = app.listen(PORT, () => {
    logger.info(`Server is running on http://localhost:${PORT}`);
    console.log(`Server is running on http://localhost:${PORT}`); // 控制台输出
});

// 错误处理
app.use((err, req, res, next) => {
    logger.error(`Unhandled error: ${err.message}`);
    res.status(500).json({success: false, message: 'Internal Server Error'});
});


// 获取节点状态
app.get('/status', async (req, res) => {
    try {
        const status = await monitorService.getNodeStatus();
        success(res, status);
    } catch (err) {
        logger.error(`Error fetching status: ${err.message}`);
        error(res, 'Failed to fetch node status');
    }
});

// 手动触发监控任务
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

// 监听停止信号
function gracefulShutdown(signal) {
    logger.info(`Received ${signal}. Closing server...`);
    console.log(`Received ${signal}. Closing server...`);
    server.close(() => {
        logger.info('Server has been stopped gracefully.');
        console.log('Server has been stopped gracefully.');
        process.exit(0); // 正常退出
    });
}

// 捕获 SIGINT 和 SIGTERM 信号
process.on('SIGINT', gracefulShutdown); // Ctrl + C
process.on('SIGTERM', gracefulShutdown); // 系统终止信号


module.exports = app;
