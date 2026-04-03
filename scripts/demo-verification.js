// scripts/demo-verification-fixed.js
const { ethers } = require("hardhat");

async function main() {
  try {
    const contract = await ethers.getContractAt(
      "LicenseRegistry", 
      "0x5FbDB2315678afecb367f032d93F642f64180aa3"
    );
    
    console.log("🧪 STUDENT 1: Smart Contract Verification Demo");
    console.log("==============================================");
    
    // Get RTSA authority
    const rtsa = await contract.rtsaAuthority();
    console.log("✅ Connected to contract");
    console.log("   RTSA Authority:", rtsa);
    console.log("   Your address:", (await ethers.getSigners())[0].address);
    
    // Create license hash
    const hash = ethers.keccak256(ethers.toUtf8Bytes("DEMO123_2024"));
    console.log("\n📝 Generated hash:", hash);
    
    // Issue license with ALL required parameters
    console.log("\n📤 Issuing license with full details...");
    const tx = await contract.issueLicense(
      "DEMO 123",           // vehicleNumber
      2024,                 // year
      hash,                 // licenseHash
      "RTAX-2024-001",      // roadTaxReference
      "INS-2024-001",       // insuranceReference
      "FIT-2024-001",       // fitnessReference
      365,                  // validityDays (1 year)
      "QR-DEMO123-2024"     // metadata for QR code
    );
    await tx.wait();
    console.log("✅ License issued successfully!");
    console.log("   Transaction hash:", tx.hash);
    
    // Verify the license
    console.log("\n📋 Verifying license...");
    const result = await contract.verifyLicense(hash);
    
    // Parse the 8 return values
    const vehicleNumber = result[0];
    const year = result[1];
    const isValid = result[2];
    const isRevoked = result[3];
    const isExpired = result[4];
    const issuedTime = result[5];
    const expiryDate = result[6];
    const metadata = result[7];
    
    console.log("\n📋 Verification Result:");
    console.log(`   Vehicle: ${vehicleNumber}`);
    console.log(`   Year: ${year}`);
    console.log(`   Status: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
    console.log(`   Revoked: ${isRevoked ? 'Yes' : 'No'}`);
    console.log(`   Expired: ${isExpired ? 'Yes' : 'No'}`);
    console.log(`   Issued: ${new Date(Number(issuedTime)*1000).toLocaleString()}`);
    console.log(`   Expires: ${new Date(Number(expiryDate)*1000).toLocaleString()}`);
    console.log(`   Metadata: ${metadata}`);
    
    // Show audit trail
    console.log("\n🔍 Immutable Audit Trail:");
    console.log(`   - License issuance recorded on blockchain`);
    console.log(`   - Timestamp: ${new Date().toISOString()}`);
    console.log(`   - Block: ${await ethers.provider.getBlockNumber()}`);
    console.log(`   - Transaction: ${tx.hash}`);
    
    // Test revocation
    console.log("\n📤 Testing revocation...");
    const revokeTx = await contract.revokeLicense(hash, "Suspected fraud");
    await revokeTx.wait();
    console.log("✅ License revoked!");
    
    // Verify again after revocation
    const resultAfter = await contract.verifyLicense(hash);
    console.log("\n📋 Verification Result After Revocation:");
    console.log(`   Status: ${resultAfter[2] ? '✅ VALID' : '❌ INVALID'}`);
    console.log(`   Revoked: ${resultAfter[3] ? 'Yes' : 'No'}`);
    
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    if (error.error && error.error.message) {
      console.error("   Details:", error.error.message);
    }
  }
}

main();