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

const CHAINLIST_API = chainType === 'mainnet'
    ? process.env.CHAINLIST_MAINNET_URL
    : process.env.CHAINLIST_TESTNET_URL;

module.exports = {
    port: process.env.PORT,
    qitmeer: {
        username: process.env.QITMEER_USERNAME,
        password: process.env.QITMEER_PASSWORD,
    },
    cheerioTaskCron: process.env.CHEERIO_TASK_CRON || "*/1 * * * *",
    monitorTaskCron: process.env.MONITOR_TASK_CRON || "*/1 * * * *",
    cacheTTL: parseInt(process.env.CACHE_TTL, 10) || 1800,
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
    SCRIPTS_DIR:process.env.SCRIPTS_DIR,
    NODE_URL: process.env.NODE_URL,
    chainlistApi: CHAINLIST_API,
    syncThreshold: parseInt(process.env.SYNC_THRESHOLD, 10) || 10,
};
