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

const CHAIN_ID = chainType === 'mainnet'
    ? process.env.MAINNET_CHAIN_ID
    : process.env.TESTNET_CHAIN_ID;

const CHAIN_DATA = {
    BASE: process.env.CHAIN_DATA_BASE || 'https://raw.githubusercontent.com/ethereum-lists/chains/master/_data/chains/',
    FORMAT: process.env.CHAIN_DATA_FORMAT || 'eip155-{chainId}.json',
    CHAIN_ID,
    NETWORK: {
        USE_PROXY: process.env.USE_PROXY === 'true',
        PROXY_URL: process.env.PROXY_URL || 'http://127.0.0.1:7890'
    }
};


module.exports = {
    port: process.env.PORT,
    qitmeer: {
        username: process.env.QITMEER_USERNAME,
        password: process.env.QITMEER_PASSWORD,
    },
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
    CHAIN_DATA,
    SERVER_IP: process.env.SERVER_IP,
    START_SCRIPT: process.env.START_SCRIPT || 'start.sh',
    STOP_SCRIPT: process.env.STOP_SCRIPT || 'stop.sh',
    SCRIPTS_DIR: process.env.SCRIPTS_DIR,
    NODE_URL: process.env.NODE_URL,
    MAX_HISTORY: parseInt(process.env.MAX_HISTORY, 10) || 5,
    SYNC_THRESHOLD_PERCENT: parseFloat(process.env.SYNC_THRESHOLD_PERCENT) || 0.95,
    SYNC_RATE_THRESHOLD: parseFloat(process.env.SYNC_RATE_THRESHOLD) || 0.95,
    JUMP_THRESHOLD: parseInt(process.env.JUMP_THRESHOLD, 10) || 5000,
    STUCK_THRESHOLD: parseInt(process.env.STUCK_THRESHOLD, 10) || 3,
    HEIGHT_DIFF_THRESHOLD: parseInt(process.env.HEIGHT_DIFF_THRESHOLD, 10) || 10,
    MAX_RESTART_ATTEMPTS: parseInt(process.env.MAX_RESTART_ATTEMPTS, 10) || 2,
    NODE_PROCESS_NAME: process.env.NODE_PROCESS_NAME || 'qng',
    BLOCK_RATE_THRESHOLD: parseFloat(process.env.BLOCK_RATE_THRESHOLD) || 0.8, // Default 0.8
    RESTART_THRESHOLD_MINUTES: parseInt(process.env.RESTART_THRESHOLD_MINUTES, 10) || 5, // Default 5 minutes
    BLOCK_LAG_CHECK: process.env.BLOCK_LAG_CHECK || true,
};
