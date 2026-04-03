class StatusManager {
  constructor() {
    this.cache = new Map();
    this.subscribers = new Map();
  }

  // Subscribe to license status updates
  subscribeToLicense(licenseHash, callback) {
    if (!this.subscribers.has(licenseHash)) {
      this.subscribers.set(licenseHash, []);
    }
    this.subscribers.get(licenseHash).push(callback);
    
    // Return unsubscribe function
    return () => {
      const subs = this.subscribers.get(licenseHash);
      const index = subs.indexOf(callback);
      if (index > -1) subs.splice(index, 1);
    };
  }

  // Notify subscribers of status change
  notifySubscribers(licenseHash, status) {
    const subs = this.subscribers.get(licenseHash);
    if (subs) {
      subs.forEach(callback => callback(status));
    }
  }

  // Get license status with caching
  async getStatus(licenseHash, licenseService, forceRefresh = false) {
    // Check cache
    if (!forceRefresh && this.cache.has(licenseHash)) {
      const cached = this.cache.get(licenseHash);
      // Cache for 30 seconds
      if (Date.now() - cached.timestamp < 30000) {
        return cached.data;
      }
    }
    
    // Fetch from contract
    const status = await licenseService.verifyLicense(licenseHash);
    
    // Update cache
    this.cache.set(licenseHash, {
      data: status,
      timestamp: Date.now()
    });
    
    return status;
  }

  // Format status for UI display
  formatStatusForDisplay(status) {
    if (!status.exists) {
      return {
        status: 'NOT_FOUND',
        color: 'gray',
        icon: '❓',
        message: 'License not found in registry'
      };
    }
    
    if (status.isRevoked) {
      return {
        status: 'REVOKED',
        color: 'red',
        icon: '❌',
        message: 'License has been revoked'
      };
    }
    
    if (status.isExpired) {
      return {
        status: 'EXPIRED',
        color: 'orange',
        icon: '⚠️',
        message: 'License has expired'
      };
    }
    
    if (status.isValid) {
      return {
        status: 'VALID',
        color: 'green',
        icon: '✅',
        message: 'License is valid and active'
      };
    }
    
    return {
      status: 'UNKNOWN',
      color: 'gray',
      icon: '❓',
      message: 'Unable to determine license status'
    };
  }

  // Get summary statistics
  async getStatistics(licenseService) {
    // This would need to aggregate from events or a separate indexer
    // For now, return placeholder structure
    return {
      totalIssued: 0,    // Would need event counting
      activeLicenses: 0,
      revokedLicenses: 0,
      expiredLicenses: 0
    };
  }
}

export default new StatusManager();