const winston = require('winston');
require('winston-daily-rotate-file');

const infoTransport = new winston.transports.DailyRotateFile({
    filename: 'logs/info-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    level: 'info',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
});

const errorTransport = new winston.transports.DailyRotateFile({
    filename: 'logs/error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
});

const debugTransport = new winston.transports.DailyRotateFile({
    filename: 'logs/debug-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    level: 'debug',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
});

const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({level, message, timestamp}) => {
            return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
        })
    ),
    transports: [
        infoTransport,
        errorTransport,
        debugTransport,
        new winston.transports.Console(),
    ],
});

module.exports = logger;
