require('dotenv').config();


function getChainType() {
    const args = process.argv.slice(1);
    const chainArg = args.find(arg => arg.startsWith('--chain='));
    if (chainArg) {
        const chainType = chainArg.split('=')[1];
        if (['mainnet', 'testnet'].includes(chainType)) {
            return chainType;
        }
        console.warn(`Invalid chain type "${chainType}" specified. Falling back to environment or default.`);
    }
    return process.env.CHAIN_TYPE || 'mainnet';
}

const chainType = getChainType();

const CHAIN_LIST_API = chainType === 'mainnet'
    ? process.env.CHAINLIST_MAINNET_URL
    : process.env.CHAINLIST_TESTNET_URL;

module.exports = {
    port: process.env.PORT,
    qitmeer: {
        username: process.env.QITMEER_USERNAME,
        password: process.env.QITMEER_PASSWORD,
    },
    cheerioTaskCron: process.env.CHEERIO_TASK_CRON || "*/15 * * * *",
    monitorTaskCron: process.env.MONITOR_TASK_CRON || "*/15 * * * *",
    email: {
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        recipients: process.env.EMAIL_RECIPIENTS
            ? process.env.EMAIL_RECIPIENTS.split(',').map(email => email.trim())
            : [],
    },
    SERVER_IP: process.env.SERVER_IP,
    SCRIPTS_DIR: process.env.SCRIPTS_DIR,
    NODE_URL: process.env.NODE_URL,
    CHAIN_LIST_API: CHAIN_LIST_API,
    MAX_HISTORY: parseInt(process.env.MAX_HISTORY, 10) || 5,
    SYNC_THRESHOLD_PERCENT: parseFloat(process.env.SYNC_THRESHOLD_PERCENT) || 0.95,
    SYNC_RATE_THRESHOLD: parseFloat(process.env.SYNC_RATE_THRESHOLD) || 0.95,
    JUMP_THRESHOLD: parseInt(process.env.JUMP_THRESHOLD, 10) || 5000,
    STUCK_THRESHOLD: parseInt(process.env.STUCK_THRESHOLD, 10) || 3,
    HEIGHT_DIFF_THRESHOLD: parseInt(process.env.HEIGHT_DIFF_THRESHOLD, 10) || 10,
    MAX_RESTART_ATTEMPTS: parseInt(process.env.MAX_RESTART_ATTEMPTS, 10) || 2,
};
