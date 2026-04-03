class TransactionHandler {
  constructor() {
    this.pendingTransactions = new Map();
    this.transactionHistory = [];
  }

  // Track pending transaction
  addPendingTransaction(txHash, details) {
    this.pendingTransactions.set(txHash, {
      ...details,
      status: 'pending',
      timestamp: new Date(),
      hash: txHash
    });
    
    this.startPolling(txHash);
    return txHash;
  }

  // Poll for transaction confirmation
  async startPolling(txHash) {
    const provider = window.ethereum ? 
      new ethers.BrowserProvider(window.ethereum) : null;
    
    if (!provider) return;

    const checkInterval = setInterval(async () => {
      try {
        const receipt = await provider.getTransactionReceipt(txHash);
        
        if (receipt) {
          // Transaction confirmed
          const tx = this.pendingTransactions.get(txHash);
          if (tx) {
            tx.status = receipt.status === 1 ? 'confirmed' : 'failed';
            tx.blockNumber = receipt.blockNumber;
            tx.gasUsed = receipt.gasUsed.toString();
            
            // Move to history
            this.transactionHistory.push(tx);
            this.pendingTransactions.delete(txHash);
            
            clearInterval(checkInterval);
          }
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 2000); // Check every 2 seconds
  }

  // Get transaction status
  getTransactionStatus(txHash) {
    // Check pending
    const pending = this.pendingTransactions.get(txHash);
    if (pending) return pending;
    
    // Check history
    const history = this.transactionHistory.find(tx => tx.hash === txHash);
    return history || null;
  }

  // Get all transaction history
  getTransactionHistory() {
    return [...this.transactionHistory].reverse();
  }

  // Get pending transactions
  getPendingTransactions() {
    return Array.from(this.pendingTransactions.values());
  }

  // Format gas cost for display
  formatGasCost(gasUsed, gasPrice) {
    const cost = BigInt(gasUsed) * BigInt(gasPrice);
    return ethers.formatEther(cost);
  }
}

export default new TransactionHandler();