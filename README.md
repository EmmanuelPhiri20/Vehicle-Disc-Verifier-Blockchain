# 🚗 Zambia Vehicle License Disc Verification System (Blockchain)

A decentralized solution for the **Road Transport and Safety Agency (RTSA)** to issue and verify vehicle license discs using blockchain technology. This system eliminates fake discs by providing immutable, real-time verification for police during traffic stops.

---

## 📋 Project Overview

**Problem:** Fake vehicle license discs are common in Zambia. Police cannot easily verify authenticity during traffic stops.

**Solution:** RTSA issues license discs recorded on blockchain with unique cryptographic hashes. Police scan a QR code and instantly verify against the blockchain.

**Current Status:** ✅ Smart Contract Complete & Deployed

---

## 🎯 Team Roles & Responsibilities

### STUDENT 1 — Smart Contracts (Complete) 👨‍💻
**Role Lead: [Your Name]**

**Responsibilities:**
- ✅ Developed `LicenseRegistry.sol` smart contract
- ✅ Implemented cryptographic hash verification
- ✅ Created immutable audit trail with events
- ✅ Added access control (onlyRTSA modifier)
- ✅ Deployed contract to local blockchain
- ✅ Gas optimization implemented
- ✅ Comprehensive testing completed

**Deliverables:**
- Smart contract code
- Deployment scripts
- Test suites
- Contract documentation

---

### STUDENT 2 — User Interaction & Wallet Integration (In Progress) 👩‍💻
**Role Lead: [Student 2 Name]**

**Responsibilities:**
- Integrate MetaMask or similar wallet
- Handle transaction signing
- Implement record submission interface
- Create approval workflows
- Build status retrieval system
- Connect UI to blockchain

**Required Contract Details (See Section Below):**
- Contract address and ABI
- Function signatures for issuance
- Event listeners for real-time updates
- Wallet connection examples

---

### STUDENT 3 — Blockchain Tools & Infrastructure (In Progress) 👨‍💻
**Role Lead: [Student 3 Name]**

**Responsibilities:**
- Manage development environment
- Handle network configuration
- Set up testing workflows
- Configure deployment pipelines
- Monitor gas usage
- Ensure network stability

**Deliverables:**
- Hardhat configuration
- Network setup documentation
- Testing framework
- Deployment scripts

---

### STUDENT 4 — User Interface Development (In Progress) 👩‍💻
**Role Lead: [Student 4 Name]**

**Responsibilities:**
- Design RTSA issuance dashboard
- Create police verification interface
- Implement QR code generation
- Build public verification page
- Show license status and history
- Ensure mobile responsiveness

**Deliverables:**
- React/HTML/CSS interfaces
- QR code integration
- Wallet connection UI
- Status display components

---







**🔗 Smart Contract Details (For Students 2, 3 & 4)**

### 📍 Deployment Information

Network: Localhost (Hardhat)
Chain ID: 31337
RPC URL: http://127.0.0.1:8545/
Contract Name: LicenseRegistry
Contract Address: 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9
RTSA Authority: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
ABI Location: artifacts/contracts/LicenseRegistry.sol/LicenseRegistry.json









### ⚙️ Core Functions

#### For STUDENT 2 (Wallet Integration):

**1. Connect to Contract**
```javascript
// Using ethers.js v6
import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider('http://localhost:8545');
const contract = new ethers.Contract(
  '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
  contractABI,
  signer // or provider for read-only
);
```

----


**Issue License (RTSA Only)**

// Requires RTSA wallet with signing capability
async function issueLicense(vehicleNumber, year, roadTaxRef, insuranceRef, fitnessRef) {
  // Generate unique hash
  const hashInput = `${vehicleNumber}_${year}_${Date.now()}`;
  const licenseHash = ethers.keccak256(ethers.toUtf8Bytes(hashInput));
  
  // Call contract
  const tx = await contract.issueLicense(
    vehicleNumber,      // string: "ABL 1234"
    year,              // number: 2024
    licenseHash,       // bytes32: 0x...
    roadTaxRef,        // string: "RTAX-2024-001"
    insuranceRef,      // string: "INS-2024-001"
    fitnessRef,        // string: "FIT-2024-001"
    365,               // number: validity in days
    JSON.stringify({   // string: metadata for QR
      vehicle: vehicleNumber,
      issued: new Date().toISOString(),
      qrData: licenseHash
    })
  );
  
  await tx.wait();
  return licenseHash;
}


-----




**Revoke License (RTSA Only)**

async function revokeLicense(licenseHash, reason) {
  const tx = await contract.revokeLicense(licenseHash, reason);
  await tx.wait();
}

----





**Check License Status**

async function checkLicense(licenseHash) {
  const result = await contract.verifyLicense(licenseHash);
  return {
    vehicleNumber: result[0],
    year: result[1],
    isValid: result[2],
    isRevoked: result[3],
    isExpired: result[4],
    issuedTime: new Date(Number(result[5]) * 1000),
    expiryDate: new Date(Number(result[6]) * 1000),
    metadata: result[7]
  };
}

----



**For STUDENT 4 (UI Development):**
Simple Verification (No Wallet Needed)

// Public verification - doesn't require wallet
const provider = new ethers.JsonRpcProvider('http://localhost:8545');
const contract = new ethers.Contract(address, abi, provider);

async function verifyLicense(licenseHash) {
  try {
    const result = await contract.verifyLicense(licenseHash);
    
    // Check if license exists
    if (result[0] === '') {
      return { exists: false };
    }
    
    return {
      exists: true,
      vehicle: result[0],
      year: result[1].toString(),
      valid: result[2],
      revoked: result[3],
      expired: result[4],
      issuedDate: new Date(Number(result[5]) * 1000).toLocaleDateString(),
      expiryDate: new Date(Number(result[6]) * 1000).toLocaleDateString()
    };
  } catch (error) {
    return { exists: false, error: error.message };
  }
}


----




**Quick Check Function**

async function isLicenseValid(licenseHash) {
  return await contract.isLicenseValid(licenseHash);
}


----





**Get Vehicle History**

async function getVehicleHistory(vehicleNumber) {
  const licenseHashes = await contract.getVehicleLicenses(vehicleNumber);
  const licenses = [];
  
  for (const hash of licenseHashes) {
    const details = await contract.verifyLicense(hash);
    licenses.push({
      hash,
      year: details[1],
      valid: details[2],
      issued: new Date(Number(details[5]) * 1000)
    });
  }
  
  return licenses;
}


----



**📡 Events (For Real-time UI Updates)**

// Listen for new licenses
contract.on("LicenseIssued", (licenseHash, vehicleNumber, year, expiryDate) => {
  console.log(`New license issued for ${vehicleNumber}`);
  // Update UI: show notification, refresh list
});

// Listen for revocations
contract.on("LicenseRevoked", (licenseHash, reason) => {
  console.log(`License revoked: ${reason}`);
  // Update UI: mark license as revoked
});

// Listen for officer changes
contract.on("OfficerAuthorized", (officer) => {
  console.log(`New RTSA officer: ${officer}`);
});

contract.on("OfficerDeauthorized", (officer) => {
  console.log(`Officer removed: ${officer}`);
});


----



 **Getting Started for All Team Members**
Prerequisites
- Node.js v18+
- Git
- MetaMask browser extension (for Student 2)
- Code editor (VS Code recommended)



**How to Clone & Run the Smart Contract from GitHub (Installation)**

# Clone the repository
git clone https://github.com/EmmanuelPhiri20/Vehicle-Disc-Verifier-Blockchain.git

# Navigate to project
cd Vehicle-Disc-Verifier-Blockchain

# Install dependencies
npm install

# Start local blockchain (Terminal 1)
npx hardhat node

# In new terminal, deploy contract (Terminal 2)
npx hardhat run scripts/deploy.ts --network localhost


-----




**Test Accounts (for development)**

RTSA Authority (Account #0)
Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

Test User (Account #1)
Address: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d


----


**Available Scripts**
Commands to Run or Test the Smart Contract!

# Compile contract
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to local network
npx hardhat run scripts/deploy.ts --network localhost

# Run demo verification
npx hardhat run scripts/demo-verification.js --network localhost

# Open console
npx hardhat console --network localhost

----





**Project Structure**

VehicleLicenseBlockchain/
│
├── contracts/
│   └── LicenseRegistry.sol      # Main smart contract
│
├── scripts/
│   ├── deploy.ts                 # Deployment script
│   ├── demo-verification-fixed.js # Working demo
│   └── debug-contract.js         # Debugging tool
│
├── test/
│   └── LicenseRegistry.test.js   # Test suite
│
├── artifacts/                     # Compiled contracts (generated)
├── typechain-types/               # TypeScript types (generated)
│
├── hardhat.config.ts              # Hardhat configuration
├── package.json                   # Dependencies
└── README.md                      # This file


 **Security Features**
- Access Control: Only RTSA authority can issue/revoke

- Immutable Records: All actions recorded on blockchain

- Hash Verification: Cryptographic proof of license authenticity

- Event Logging: Complete audit trail via events

- Expiry Validation: Automatic expiry checking



**Assignment Requirements Met**

✅ Real-world problem (Zambian license discs)
✅ Blockchain-based solution
✅ Cryptographic verification
✅ Immutable audit trail
✅ Smart contract (Student 1)
✅ Wallet integration ready (Student 2)
✅ Infrastructure setup (Student 3)
✅ UI development ready (Student 4)
✅ Gas optimization implemented
✅ Comprehensive testing
✅ Documentation complete


