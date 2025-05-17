class BlockHeightHistory {
    private readonly maxHistory: number;
    private readonly heightHistory: number[];
    private readonly chainHeightHistory: number[];

    constructor(maxHistory: number) {
        this.maxHistory = maxHistory;
        this.heightHistory = [];
        this.chainHeightHistory = [];
    }

    /**
     * Add a new record of local and chain block heights.
     */
    updateHistory(localHeight: number, chainHeight: number): void {
        if (localHeight < 0 || chainHeight < 0) return;
        this.heightHistory.push(localHeight);
        if (this.heightHistory.length > this.maxHistory) {
            this.heightHistory.shift();
        }
        this.chainHeightHistory.push(chainHeight);
        if (this.chainHeightHistory.length > this.maxHistory) {
            this.chainHeightHistory.shift();
        }
    }

    /**
     * Get recent local block height history.
     */
    getHeightHistory(): number[] {
        return [...this.heightHistory];
    }

    /**
     *  Get recent chain block height history.
     */
    getChainHeightHistory(): number[] {
        return [...this.chainHeightHistory];
    }

    /**
     * Calculate sync rate between local and chain height
     * (average growth per step).
     */
    calculateSyncRate(): { localSyncRate: number; chainSyncRate: number } {
        if (this.heightHistory.length < 2 || this.chainHeightHistory.length < 2) {
            return {localSyncRate: 0, chainSyncRate: 0};
        }

        const localDiff = this.heightHistory[this.heightHistory.length - 1] - this.heightHistory[0];
        const chainDiff = this.chainHeightHistory[this.chainHeightHistory.length - 1] - this.chainHeightHistory[0];
        const steps = this.heightHistory.length - 1;

        return {
            localSyncRate: localDiff / steps,
            chainSyncRate: chainDiff / steps
        };
    }
}

export default BlockHeightHistory;
