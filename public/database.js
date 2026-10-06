// ============================================
// RTSA VEHICLE LICENSE DATABASE
// Stores test license data for presentation
// ============================================

const LicenseDatabase = {
    // Test QR Codes and their associated license data
    licenses: {
        // VALID LICENSES (Current year 2026)
        "ZQ123": {  // UPPERCASE for consistent lookup
            qrCode: "ZQ123",
            hash: "0x8a3f2e1d4c5b6a7e8f9d0c1b2a3e4f5d6c7b8a9e0f1d2c3b4a5e6f7d8c9b0a1e",
            vehicleNumber: "ABL 1234",
            ownerName: "Japhet lwandanda Ndondji",
            year: 2026,
            roadTaxRef: "RTAX-2026-001",
            insuranceRef: "INS-2026-001",
            fitnessRef: "FIT-2026-001",
            status: "VALID",
            issuedDate: "2026-01-15",
            expiryDate: "2027-01-14"
        },
        "ZQ456": {
            qrCode: "ZQ456",
            hash: "0x9b4a3f2e1d5c6b7a8e9f0d1c2b3a4e5f6d7c8b9a0e1f2d3c4b5a6e7f8d9c0b1a",
            vehicleNumber: "BCM 5678",
            ownerName: "Mwali Katongo",
            year: 2026,
            roadTaxRef: "RTAX-2026-002",
            insuranceRef: "INS-2026-002",
            fitnessRef: "FIT-2026-002",
            status: "VALID",
            issuedDate: "2026-02-20",
            expiryDate: "2027-02-19"
        },
        "ZQ789": {
            qrCode: "ZQ789",
            hash: "0x1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c",
            vehicleNumber: "LUS 9012",
            ownerName: "Muyembwe Kabwe",
            year: 2026,
            roadTaxRef: "RTAX-2026-003",
            insuranceRef: "INS-2026-003",
            fitnessRef: "FIT-2026-003",
            status: "VALID",
            issuedDate: "2026-03-10",
            expiryDate: "2027-03-09"
        },

        // EXPIRED LICENSES (Year 2025 or earlier - will show EXPIRED)
        "EXP001": {
            qrCode: "EXP001",
            hash: "0x4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f",
            vehicleNumber: "EXP 1234",
            ownerName: "Emmanuel Phiri",
            year: 2024,  // Expired (2024 < 2026)
            roadTaxRef: "RTAX-2024-001",
            insuranceRef: "INS-2024-001",
            fitnessRef: "FIT-2024-001",
            status: "EXPIRED",
            issuedDate: "2024-01-01",
            expiryDate: "2025-01-01"
        },
        "EXP002": {
            qrCode: "EXP002",
            hash: "0x5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a",
            vehicleNumber: "EXP 5678",
            ownerName: "Expired Test",
            year: 2023,
            roadTaxRef: "RTAX-2023-002",
            insuranceRef: "INS-2023-002",
            fitnessRef: "FIT-2023-002",
            status: "EXPIRED",
            issuedDate: "2023-06-15",
            expiryDate: "2024-06-14"
        },
        "EXP003": {
            qrCode: "EXP003",
            hash: "0x6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b",
            vehicleNumber: "EXP 9012",
            ownerName: "Outdated License",
            year: 2022,
            roadTaxRef: "RTAX-2022-003",
            insuranceRef: "INS-2022-003",
            fitnessRef: "FIT-2022-003",
            status: "EXPIRED",
            issuedDate: "2022-03-20",
            expiryDate: "2023-03-19"
        }
    },

    // Helper function to get license by QR code (case insensitive)
    getLicenseByQRCode: function(qrCode) {
        const upperQR = qrCode.toUpperCase();
        const license = this.licenses[upperQR];
        if (license) {
            return { ...license, found: true };
        }
        return { found: false, qrCode: qrCode };
    },

    // Helper function to get license by hash
    getLicenseByHash: function(hash) {
        for (const [key, value] of Object.entries(this.licenses)) {
            if (value.hash.toLowerCase() === hash.toLowerCase()) {
                return { ...value, found: true, qrCode: key };
            }
        }
        return { found: false };
    },

    // Check if license is expired
    isExpired: function(license) {
        const currentYear = new Date().getFullYear();
        return license.year < currentYear;
    },

    // Check if license is valid
    isValid: function(license) {
        return !this.isExpired(license) && license.status === "VALID";
    },

    // Get all QR codes for testing
    getAllQRCodes: function() {
        return Object.keys(this.licenses);
    },

    // Add a new license (for issuance)
    addLicense: function(qrCode, licenseData) {
        this.licenses[qrCode.toUpperCase()] = {
            qrCode: qrCode.toUpperCase(),
            ...licenseData
        };
    },

    // Revoke a license
    revokeLicense: function(qrCode) {
        const upperQR = qrCode.toUpperCase();
        if (this.licenses[upperQR]) {
            this.licenses[upperQR].status = "REVOKED";
            return true;
        }
        return false;
    }
};

// Export for use in HTML files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LicenseDatabase;
}