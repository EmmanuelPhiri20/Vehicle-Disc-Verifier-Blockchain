const { ethers } = require("hardhat");

async function main() {
  console.log("\n⛽ GAS OPTIMIZATION REPORT");
  console.log("=".repeat(50));
  
  const LicenseRegistry = await ethers.getContractFactory("LicenseRegistry");
  const contract = await LicenseRegistry.deploy();
  
  const tests = [
    { name: "Authorize Officer", fn: async () => {
      const [, officer] = await ethers.getSigners();
      return contract.authorizeOfficer(officer.address);
    }},
    { name: "Issue License", fn: async () => {
      const hash = ethers.keccak256(ethers.toUtf8Bytes(`TEST_${Date.now()}`));
      return contract.issueLicense(
        "TEST", 2024, hash,
        "TAX-001", "INS-001", "FIT-001", 365, '{}'
      );
    }},
    { name: "Revoke License", fn: async () => {
      const hash = ethers.keccak256(ethers.toUtf8Bytes(`REVOKE_${Date.now()}`));
      await contract.issueLicense(
        "REVOKE", 2024, hash,
        "TAX-001", "INS-001", "FIT-001", 365, '{}'
      );
      return contract.revokeLicense(hash, "Test");
    }}
  ];
  
  console.log("\n📊 Function Gas Costs:\n");
  
  for (const test of tests) {
    const tx = await test.fn();
    const receipt = await tx.wait();
    console.log(`   ${test.name}: ${receipt.gasUsed} gas`);
  }
  
  console.log("\n💡 Optimization Summary:");
  console.log("   ✅ Bytes32 used for hashes (32 bytes vs 64+ for strings)");
  console.log("   ✅ View functions for verification (0 gas for readers)");
  console.log("   ✅ Events for off-chain indexing");
  console.log("   ✅ Minimal storage in struct");
  console.log("   ✅ Recommended: Batch operations for multiple licenses");
}

main().catch(console.error);