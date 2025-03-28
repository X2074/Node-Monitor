class BlockHeightHistory {
    constructor(maxHistory) {
        this.maxHistory = maxHistory;
        this.heightHistory = [];
        this.chainHeightHistory = [];
    }

    // Update local and chain height history
    updateHistory(localHeight, chainHeight) {
        // Record the local node height
        this.heightHistory.push(localHeight);
        if (this.heightHistory.length > this.maxHistory) {
            this.heightHistory.shift();
        }

        // Record the chain height
        this.chainHeightHistory.push(chainHeight);
        if (this.chainHeightHistory.length > this.maxHistory) {
            this.chainHeightHistory.shift();
        }
    }

    // Get the recent local height history
    getHeightHistory() {
        return this.heightHistory;
    }

    // Get the recent chain height history
    getChainHeightHistory() {
        return this.chainHeightHistory;
    }

    // Calculate the sync rate
    calculateSyncRate() {
        if (this.heightHistory.length < 2 || this.chainHeightHistory.length < 2) {
            return {localSyncRate: 0, chainSyncRate: 0};
        }

        const localSyncRate = (this.heightHistory[this.heightHistory.length - 1] - this.heightHistory[0]) / (this.maxHistory - 1);
        const chainSyncRate = (this.chainHeightHistory[this.chainHeightHistory.length - 1] - this.chainHeightHistory[0]) / (this.maxHistory - 1);
        return {localSyncRate, chainSyncRate};
    }
}

module.exports = BlockHeightHistory;
