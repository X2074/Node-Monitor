import dotenv from 'dotenv';

dotenv.config();

type ChainType = 'mainnet' | 'testnet';

function getChainType(): ChainType {
    const args = process.argv.slice(1);
    const chainArg = args.find(arg => arg.startsWith('--chain='));
    if (chainArg) {
        const chainType = chainArg.split('=')[1] as ChainType;
        if (chainType === 'mainnet' || chainType === 'testnet') {
            return chainType;
        }
        console.warn(`Invalid chain type "${chainType}" specified. Falling back to environment or default.`);
    }
    return (process.env.CHAIN_TYPE as ChainType) || 'mainnet';
}

const chainType = getChainType();

const CHAIN_ID = (() => {
    const id = chainType === 'mainnet'
        ? process.env.MAINNET_CHAIN_ID
        : process.env.TESTNET_CHAIN_ID;

    if (!id) {
        throw new Error(`[config.ts] Missing ${chainType.toUpperCase()}_CHAIN_ID in environment variables.`);
    }

    return id;
})();

interface ChainData {
    BASE: string;
    FORMAT: string;
    CHAIN_ID: string;
    NETWORK: {
        USE_PROXY: boolean;
        PROXY_URL: string;
    };
}

const CHAIN_DATA: ChainData = {
    BASE: process.env.CHAIN_DATA_BASE || 'https://raw.githubusercontent.com/ethereum-lists/chains/master/_data/chains/',
    FORMAT: process.env.CHAIN_DATA_FORMAT || 'eip155-{chainId}.json',
    CHAIN_ID,
    NETWORK: {
        USE_PROXY: process.env.USE_PROXY === 'true',
        PROXY_URL: process.env.PROXY_URL || 'http://127.0.0.1:7890',
    }
};

export interface AppConfig {
    port?: string;
    qitmeer: {
        username: string;
        password: string;
    };
    NETWORK_TIMEOUT: number;
    monitorTaskCron: string;
    weeklyReportCron: string;
    email: {
        host?: string;
        port?: string;
        secure: boolean;
        auth: {
            user?: string;
            pass?: string;
        };
        recipients: string[];
    };
    CHAIN_DATA: ChainData;
    SERVER_IP?: string;
    START_SCRIPT: string;
    STOP_SCRIPT: string;
    SCRIPTS_DIR?: string;
    NODE_URL: string;
    MAX_HISTORY: number;
    SYNC_THRESHOLD_PERCENT: number;
    SYNC_RATE_THRESHOLD: number;
    JUMP_THRESHOLD: number;
    STUCK_THRESHOLD: number;
    HEIGHT_DIFF_THRESHOLD: number;
    MAX_RESTART_ATTEMPTS: number;
    MAX_WAIT_ATTEMPTS: number;
    NODE_PROCESS_NAME: string;
    BLOCK_RATE_THRESHOLD: number;
    RESTART_THRESHOLD_MINUTES: number;
    BLOCK_LAG_CHECK: boolean;
    ACCESS_ALLOW_IPS: string;
    ACCESS_USERNAME: string;
    ACCESS_PASSWORD: string;
}

const NODE_URL = process.env.NODE_URL;
if (!NODE_URL) {
    throw new Error('[config.ts] NODE_URL is required but not set in environment variables.');
}

const config: AppConfig = {
    port: process.env.PORT,
    qitmeer: {
        username: process.env.QITMEER_USERNAME ?? '',
        password: process.env.QITMEER_PASSWORD ?? '',
    },
    monitorTaskCron: process.env.MONITOR_TASK_CRON || "*/15 * * * *",
    weeklyReportCron: process.env.WEEKLY_REPORT_CRON || '0 9 * * 1',
    email: {
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        recipients: process.env.EMAIL_RECIPIENTS
            ? process.env.EMAIL_RECIPIENTS.split(',').map(email => email.trim())
            : [],
    },
    NETWORK_TIMEOUT: parseInt(process.env.NETWORK_TIMEOUT || '5000', 10),
    CHAIN_DATA,
    SERVER_IP: process.env.SERVER_IP,
    START_SCRIPT: process.env.START_SCRIPT || 'start.sh',
    STOP_SCRIPT: process.env.STOP_SCRIPT || 'stop.sh',
    SCRIPTS_DIR: process.env.SCRIPTS_DIR,
    NODE_URL,
    MAX_HISTORY: parseInt(process.env.MAX_HISTORY || '5', 10),
    SYNC_THRESHOLD_PERCENT: parseFloat(process.env.SYNC_THRESHOLD_PERCENT || '0.95'),
    SYNC_RATE_THRESHOLD: parseFloat(process.env.SYNC_RATE_THRESHOLD || '0.95'),
    JUMP_THRESHOLD: parseInt(process.env.JUMP_THRESHOLD || '5000', 10),
    STUCK_THRESHOLD: parseInt(process.env.STUCK_THRESHOLD || '3', 10),
    HEIGHT_DIFF_THRESHOLD: parseInt(process.env.HEIGHT_DIFF_THRESHOLD || '10', 10),
    MAX_RESTART_ATTEMPTS: parseInt(process.env.MAX_RESTART_ATTEMPTS || '2', 10),
    MAX_WAIT_ATTEMPTS: parseInt(process.env.MAX_WAIT_ATTEMPTS || '5', 10),
    NODE_PROCESS_NAME: process.env.NODE_PROCESS_NAME || 'qng',
    BLOCK_RATE_THRESHOLD: parseFloat(process.env.BLOCK_RATE_THRESHOLD || '0.8'),
    RESTART_THRESHOLD_MINUTES: parseInt(process.env.RESTART_THRESHOLD_MINUTES || '5', 10),
    BLOCK_LAG_CHECK: process.env.BLOCK_LAG_CHECK !== 'false',
    ACCESS_ALLOW_IPS: process.env.ACCESS_ALLOW_IPS || '127.0.0.1,::1,::ffff:127.0.0.1',
    ACCESS_USERNAME: process.env.ACCESS_USERNAME || '',
    ACCESS_PASSWORD: process.env.ACCESS_PASSWORD || '',
};

export default config;
