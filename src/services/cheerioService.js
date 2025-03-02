const axios = require('axios');
const cron = require('node-cron');
const config = require('../config');
const cheerio = require('cheerio');
const {getBlockByNumber} = require('./nodeApiService');
const logger = require("../utils/logger");

async function getQitmeerRPCs() {
    try {
        const {data} = await axios.get(config.CHAIN_LIST_API);

        const $ = cheerio.load(data);

        const jsonData = JSON.parse($('#__NEXT_DATA__').html());

        const rpcUrls = jsonData.props.pageProps.chain.rpc.map(rpc => rpc.url);

        logger.info('Fetched RPC URLs:', rpcUrls);
        return rpcUrls;
    } catch (error) {
        logger.error('Error fetching RPCs from Chainlist:', error.message);
        return [];
    }
}




async function collectHeights() {
    const rpcUrls = await getQitmeerRPCs();
    let maxHeight = 0;
    let maxStateRoot = null;
    let maxBlockData = null;

    for (const rpcUrl of rpcUrls) {
        try {
            const chainListNode = await getBlockByNumber(rpcUrl);

            if (chainListNode) {
                const {height, stateroot, blockData} = chainListNode;
                logger.info(`RPC: ${rpcUrl} - Latest Block Height: ${height}, State Root: ${stateroot}`);
                if (height > maxHeight) {
                    maxHeight = height;
                    maxStateRoot = stateroot;
                    maxBlockData = blockData;
                }
            } else {
                logger.info(`Failed to fetch data for RPC: ${rpcUrl}`);
            }
        } catch (error) {
            logger.error(`Error fetching data for RPC: ${rpcUrl} - ${error.message}`);
        }
    }

    logger.info(`Max Height: ${maxHeight}, State Root: ${maxStateRoot}`);
    return {maxHeight, stateRoot: maxStateRoot, blockData: maxBlockData};
}


module.exports = {collectHeights};
