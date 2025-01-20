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
    ? "https://chainlist.org/chain/813"
    : "https://chainlist.org/chain/8131";

module.exports = {
    port: process.env.PORT || 3000,
    cronSchedule: '*/1 * * * *',
    email: {
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        recipients: ['liuren34@outlook.com'],
    },
    nodeUrl: process.env.NODE_URL || 'http://127.0.0.1:18131',
    chainlistApi: CHAINLIST_API,
    syncThreshold: parseInt(process.env.SYNC_THRESHOLD, 10) || 10,
};
