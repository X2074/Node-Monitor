require('dotenv').config();  // 加载 .env 文件中的环境变量

module.exports = {
    port: process.env.PORT,  // 默认端口号
    cronSchedule: '*/1 * * * *',  // 每分钟执行一次任务
    email: {
        host: process.env.EMAIL_HOST,  // 从 .env 文件加载，如果没有则使用默认值
        port: process.env.EMAIL_PORT,  // 从 .env 文件加载，如果没有则使用默认值
        secure: process.env.EMAIL_PORT === '465',  // 判断端口号来设置是否使用加密
        auth: {
            user: process.env.EMAIL_USER,  // 从 .env 文件加载，如果没有则使用默认值
            pass: process.env.EMAIL_PASS,  // 从 .env 文件加载，如果没有则使用默认值
        },
        recipients: ['liuren34@outlook.com'],  // 收件人地址
    },
    nodeUrl: process.env.NODE_URL,  // 从 .env 文件加载节点地址
    chainlistApi: process.env.CHAINLIST_API,  // 从 .env 文件加载链表节点 API 地址
    syncThreshold: parseInt(process.env.SYNC_THRESHOLD, 10) || 10,  // 从 .env 文件加载同步阈值，默认 10
};
