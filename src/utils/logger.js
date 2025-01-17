const winston = require('winston');
require('winston-daily-rotate-file');

// 创建不同日志级别的文件传输器
const infoTransport = new winston.transports.DailyRotateFile({
    filename: 'logs/info-%DATE%.log',  // Info 日志文件名
    datePattern: 'YYYY-MM-DD',
    level: 'info',  // 只记录 info 级别的日志
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
});

const errorTransport = new winston.transports.DailyRotateFile({
    filename: 'logs/error-%DATE%.log',  // Error 日志文件名
    datePattern: 'YYYY-MM-DD',
    level: 'error',  // 只记录 error 级别的日志
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
});

const debugTransport = new winston.transports.DailyRotateFile({
    filename: 'logs/debug-%DATE%.log',  // Debug 日志文件名
    datePattern: 'YYYY-MM-DD',
    level: 'debug',  // 只记录 debug 级别的日志
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
});

// 创建日志记录器
const logger = winston.createLogger({
    level: 'debug',  // 默认日志级别为 debug，捕获所有级别的日志
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ level, message, timestamp }) => {
            return `[${timestamp}] ${level.toUpperCase()}: ${message}`;  // 日志格式
        })
    ),
    transports: [
        infoTransport,    // Info 级别日志
        errorTransport,   // Error 级别日志
        debugTransport,   // Debug 级别日志
        new winston.transports.Console(),  // 控制台输出日志
    ],
});

module.exports = logger;
