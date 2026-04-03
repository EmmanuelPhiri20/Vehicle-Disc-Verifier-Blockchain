import { ethers } from 'ethers';
import walletService from '../wallet/connect';

class LicenseService {
  constructor() {
    this.contract = null;
  }

  setContract(contract) {
    this.contract = contract;
  }

  // Generate unique license hash
  generateLicenseHash(vehicleNumber, year) {
    const timestamp = Date.now();
    const input = `${vehicleNumber}_${year}_${timestamp}`;
    return ethers.keccak256(ethers.toUtf8Bytes(input));
  }

  // Issue new license (RTSA only)
  async issueLicense(licenseData) {
    try {
      // Check if user is authorized
      const isRTSA = await walletService.isRTSA();
      if (!isRTSA) {
        throw new Error("Only RTSA officers can issue licenses");
      }

      // Generate hash
      const licenseHash = this.generateLicenseHash(
        licenseData.vehicleNumber,
        licenseData.year
      );

      // Prepare transaction
      const tx = await this.contract.issueLicense(
        licenseData.vehicleNumber,
        licenseData.year,
        licenseHash,
        licenseData.roadTaxReference,
        licenseData.insuranceReference,
        licenseData.fitnessReference,
        licenseData.validityDays || 365,
        JSON.stringify({
          vehicle: licenseData.vehicleNumber,
          owner: licenseData.ownerName,
          issued: new Date().toISOString(),
          qrData: licenseHash
        })
      );

      // Wait for confirmation
      const receipt = await tx.wait();
      
      return {
        success: true,
        transactionHash: receipt.hash,
        licenseHash: licenseHash,
        blockNumber: receipt.blockNumber
      };

    } catch (error) {
      console.error("License issuance failed:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Revoke license (RTSA only)
  async revokeLicense(licenseHash, reason) {
    try {
      const isRTSA = await walletService.isRTSA();
      if (!isRTSA) {
        throw new Error("Only RTSA officers can revoke licenses");
      }

      const tx = await this.contract.revokeLicense(licenseHash, reason);
      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: receipt.hash,
        reason: reason
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Verify license (public - no wallet needed)
  async verifyLicense(licenseHash) {
    try {
      const result = await this.contract.verifyLicense(licenseHash);
      
      // Check if license exists
      if (result[0] === '') {
        return {
          exists: false,
          message: "License not found"
        };
      }

      return {
        exists: true,
        vehicleNumber: result[0],
        year: Number(result[1]),
        isValid: result[2],
        isRevoked: result[3],
        isExpired: result[4],
        issuedTime: new Date(Number(result[5]) * 1000),
        expiryDate: new Date(Number(result[6]) * 1000),
        metadata: JSON.parse(result[7] || '{}')
      };

    } catch (error) {
      return {
        exists: false,
        error: error.message
      };
    }
  }

  // Get vehicle license history
  async getVehicleHistory(vehicleNumber) {
    try {
      const hashes = await this.contract.getVehicleLicenses(vehicleNumber);
      const history = [];
      
      for (const hash of hashes) {
        const details = await this.verifyLicense(hash);
        history.push({
          hash,
          ...details
        });
      }
      
      return {
        success: true,
        vehicleNumber,
        licenses: history,
        count: history.length
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Listen for real-time events
  setupEventListeners(callbacks) {
    if (!this.contract) return;

    // Listen for new licenses
    this.contract.on("LicenseIssued", (licenseHash, vehicleNumber, year, expiryDate) => {
      if (callbacks.onLicenseIssued) {
        callbacks.onLicenseIssued({
          licenseHash,
          vehicleNumber,
          year: Number(year),
          expiryDate: new Date(Number(expiryDate) * 1000)
        });
      }
    });

    // Listen for revocations
    this.contract.on("LicenseRevoked", (licenseHash, reason) => {
      if (callbacks.onLicenseRevoked) {
        callbacks.onLicenseRevoked({
          licenseHash,
          reason
        });
      }
    });

    // Listen for officer changes
    this.contract.on("OfficerAuthorized", (officer) => {
      if (callbacks.onOfficerAuthorized) {
        callbacks.onOfficerAuthorized({ officer });
      }
    });
  }
}

export default new LicenseService();