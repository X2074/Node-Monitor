const logger = require('../utils/logger');
const { compareNodeStatus } = require('./nodeService');
const { restartNode } = require('./restartService');
const { sendEmail } = require('./mailService');

// 手动触发监控任务
async function monitor() {
    try {
        const { isHeightSynced, isStateRootMatching, localNode, chainListNode } = await compareNodeStatus();

        // 检查高度同步
        if (!isHeightSynced) {
            const message = `Node out of sync. Local height: ${localNode.height}, Chainlist height: ${chainListNode.height}. Attempting to restart. \n节点不同步。 本地高度: ${localNode.height}, 链上高度: ${chainListNode.height}。 正在尝试重启。`;
            logger.warn(message);
            await restartNode();
        }

        // 检查状态根同步
        if (!isStateRootMatching) {
            const message = `State root mismatch detected. Local stateroot: ${localNode.stateroot}, Chainlist stateroot: ${chainListNode.stateroot} \n状态根不匹配。 本地状态根: ${localNode.stateroot}, 链上状态根: ${chainListNode.stateroot}`;
            logger.error(message);
            await sendEmail('State Root Mismatch Alert - 状态根不匹配警告', message);
        }

        // 检查 UTXO 和 EVM 层的同步状态
        if (localNode.utxoHeight === chainListNode.utxoHeight && localNode.evmHeight < chainListNode.evmHeight) {
            const message = `UTXO layer is synced, but EVM layer is lagging. \nUTXO 层已同步，但 EVM 层滞后。 本地 EVM 高度: ${localNode.evmHeight}, 链上 EVM 高度: ${chainListNode.evmHeight}.`;
            logger.warn(message);
            await sendEmail('EVM Layer Lagging Alert - EVM 层滞后警告', message);
        }

        if (localNode.utxoHeight === chainListNode.utxoHeight && chainListNode.evmHeight === localNode.evmHeight && localNode.utxoHeight !== localNode.evmHeight) {
            const message = `EVM layer transactions may be missing. UTXO and EVM heights are inconsistent. Local UTXO height: ${localNode.utxoHeight}, Local EVM height: ${localNode.evmHeight}. \nEVM 层交易可能缺失。UTXO 和 EVM 高度不一致。 本地 UTXO 高度: ${localNode.utxoHeight}, 本地 EVM 高度: ${localNode.evmHeight}`;
            logger.warn(message);
            await sendEmail('EVM Transaction Missing Alert - EVM 交易缺失警告', message);
        }

        // 正常同步状态
        logger.info('Node is in sync and running correctly. \n节点已同步，运行正常。');
    } catch (error) {
        const errorMessage = `Monitor task failed: ${error.message} \n监控任务失败: ${error.message}`;
        logger.error(errorMessage);
        throw error;
    }
}

module.exports = { monitor };
