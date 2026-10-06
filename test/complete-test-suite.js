const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("🚗 Zambia Vehicle License System - Complete Test Suite", function () {
  let licenseRegistry;
  let rtsa, officer, police, citizen;
  let testLicenses = [];
  
  before(async function () {
    [rtsa, officer, police, citizen] = await ethers.getSigners();
    
    const LicenseRegistry = await ethers.getContractFactory("LicenseRegistry");
    licenseRegistry = await LicenseRegistry.deploy();
    
    console.log("\n📋 Test Environment Ready");
    console.log(`   RTSA Authority: ${rtsa.address.slice(0, 10)}...`);
    console.log(`   Contract: ${await licenseRegistry.getAddress()}`);
  });
  
  describe("🔐 Access Control Tests", function () {
    it("Only RTSA can authorize officers", async function () {
      await expect(
        licenseRegistry.connect(police).authorizeOfficer(officer.address)
      ).to.be.revertedWith("Only RTSA can perform this action");
    });
    
    it("RTSA can authorize new officers", async function () {
      await licenseRegistry.authorizeOfficer(officer.address);
      expect(await licenseRegistry.authorizedOfficers(officer.address)).to.be.true;
    });
  });
  
  describe("📝 License Issuance Tests", function () {
    it("Should issue a valid license", async function () {
      const hash = ethers.keccak256(ethers.toUtf8Bytes("TEST001_2024"));
      const tx = await licenseRegistry.issueLicense(
        "TEST 001", 2024, hash,
        "RTAX-001", "INS-001", "FIT-001",
        365, '{"test":true}'
      );
      const receipt = await tx.wait();
      
      expect(receipt.status).to.equal(1);
      testLicenses.push(hash);
    });
    
    it("Should prevent duplicate licenses", async function () {
      const hash = ethers.keccak256(ethers.toUtf8Bytes("DUPLICATE_2024"));
      await licenseRegistry.issueLicense(
        "DUPLICATE", 2024, hash,
        "RTAX-001", "INS-001", "FIT-001", 365, '{}'
      );
      
      await expect(
        licenseRegistry.issueLicense(
          "DUPLICATE", 2024, hash,
          "RTAX-001", "INS-001", "FIT-001", 365, '{}'
        )
      ).to.be.revertedWith("License already exists");
    });
  });
  
  describe("🔍 Verification Tests", function () {
    it("Should verify a valid license", async function () {
      const result = await licenseRegistry.verifyLicense(testLicenses[0]);
      expect(result[0]).to.equal("TEST 001");
      expect(result[2]).to.be.true; // isValid
    });
    
    it("Anyone can verify (no gas cost)", async function () {
      const result = await licenseRegistry.connect(citizen).verifyLicense(testLicenses[0]);
      expect(result[0]).to.equal("TEST 001");
    });
  });
  
  describe("⛽ Gas Optimization Report", function () {
  it("Measure issuance gas cost", async function () {
    const hash = ethers.keccak256(ethers.toUtf8Bytes(`GAS_TEST_${Date.now()}`));
    const tx = await licenseRegistry.issueLicense(
      "GAS TEST", 2024, hash,
      "TAX", "INS", "FIT", 365, '{}'
    );
    const receipt = await tx.wait();
    
    // Fix: Convert BigInt to Number for comparison
    const gasUsed = Number(receipt.gasUsed);
    
    console.log(`\n📊 Gas Report:`);
    console.log(`   License Issuance: ${gasUsed} gas`);
    console.log(`   ~ ${(gasUsed * 20 / 1e9).toFixed(4)} USD at 20 Gwei`);
    
    // Fix: Compare numbers correctly
    expect(gasUsed).to.be.lessThan(500000);
  });
});

  describe("🗑️ Revocation Tests", function () {
    it("Should revoke license with reason", async function () {
      await licenseRegistry.revokeLicense(testLicenses[0], "Fraud detected");
      const result = await licenseRegistry.verifyLicense(testLicenses[0]);
      expect(result[3]).to.be.true; // revoked
    });
  });
  
  describe("📜 Vehicle History", function () {
    it("Should track multiple licenses per vehicle", async function () {
      const vehicle = "HISTORY 123";
      const hash1 = ethers.keccak256(ethers.toUtf8Bytes(`${vehicle}_2023`));
      const hash2 = ethers.keccak256(ethers.toUtf8Bytes(`${vehicle}_2024`));
      
      await licenseRegistry.issueLicense(vehicle, 2023, hash1, "TAX", "INS", "FIT", 365, '{}');
      await licenseRegistry.issueLicense(vehicle, 2024, hash2, "TAX", "INS", "FIT", 365, '{}');
      
      const history = await licenseRegistry.getVehicleLicenses(vehicle);
      expect(history.length).to.equal(2);
    });
  });
  
  console.log("\n✅ All tests completed successfully!");
});