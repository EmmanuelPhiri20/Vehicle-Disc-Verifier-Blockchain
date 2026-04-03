import { ethers } from 'ethers';

// Contract details from Student 1
const CONTRACT_ADDRESS = "0x5fbdb2315678afecb367f032d93f642f64180aa3";
const CONTRACT_ABI = [ /* Paste full ABI from artifacts */ ];

class WalletService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.currentAccount = null;
  }

  // Connect to MetaMask
  async connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
      try {
        // Request account access
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        
        // Create provider
        this.provider = new ethers.BrowserProvider(window.ethereum);
        this.signer = await this.provider.getSigner();
        this.currentAccount = accounts[0];
        
        // Initialize contract
        this.contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          CONTRACT_ABI,
          this.signer
        );
        
        console.log("Wallet connected:", this.currentAccount);
        return { success: true, account: this.currentAccount };
        
      } catch (error) {
        console.error("Connection failed:", error);
        return { success: false, error: error.message };
      }
    } else {
      return { success: false, error: "MetaMask not installed" };
    }
  }

  // Get current network
  async getNetwork() {
    if (this.provider) {
      const network = await this.provider.getNetwork();
      return {
        chainId: network.chainId,
        name: network.name
      };
    }
    return null;
  }

  // Check if connected account is RTSA authority
  async isRTSA() {
    if (this.contract) {
      const rtsaAddress = await this.contract.rtsaAuthority();
      return this.currentAccount.toLowerCase() === rtsaAddress.toLowerCase();
    }
    return false;
  }
}

export default new WalletService();