// scripts/debug-contract.js
const { ethers } = require("hardhat");

async function main() {
  try {
    const contract = await ethers.getContractAt(
      "LicenseRegistry", 
      "0x5FbDB2315678afecb367f032d93F642f64180aa3"
    );
    
    console.log("🔍 CONTRACT DEBUGGING");
    console.log("=====================");
    
    // Get the contract's bytecode to verify it's the right one
    const code = await ethers.provider.getCode("0x5FbDB2315678afecb367f032d93F642f64180aa3");
    console.log("✅ Contract exists at address");
    console.log("   Bytecode length:", code.length);
    
    // List ALL fragments with full details
    console.log("\n📋 COMPLETE FUNCTION SIGNATURES:");
    const fragments = contract.interface.fragments;
    fragments.forEach(f => {
      if (f.type === 'function') {
        console.log(`\n   Function: ${f.name}`);
        console.log(`   Signature: ${f.format()}`);
        console.log(`   Inputs: ${f.inputs.map(i => i.type + ' ' + i.name).join(', ')}`);
        if (f.outputs) {
          console.log(`   Outputs: ${f.outputs.map(o => o.type).join(', ')}`);
        }
      }
    });
    
    // Try to call a simple function first
    console.log("\n🔧 TESTING BASIC FUNCTIONS:");
    
    // Test rtsaAuthority
    try {
      const rtsa = await contract.rtsaAuthority();
      console.log("✅ rtsaAuthority() works:", rtsa);
    } catch (e) {
      console.log("❌ rtsaAuthority() failed:", e.message);
    }
    
    // Let's see what happens when we try to call issueLicense with different patterns
    console.log("\n🔧 TESTING issueLicense VARIATIONS:");
    
    const hash = ethers.keccak256(ethers.toUtf8Bytes("TEST123_2024"));
    console.log("   Hash:", hash);
    
    // Try to encode the function call manually to see what the contract expects
    try {
      // Method 1: Try to get function selector
      const iface = contract.interface;
      const functionName = "issueLicense";
      const fragment = iface.getFunction(functionName);
      console.log(`   ✅ Found function: ${fragment.format()}`);
      
      // Encode data to see what it looks like
      const encoded = iface.encodeFunctionData(functionName, ["TEST 123", 2024, hash]);
      console.log("   ✅ Can encode function data");
      
    } catch (e) {
      console.log(`   ❌ Error with ${functionName}:`, e.message);
    }
    
    // Alternative: Try to call using a different approach
    console.log("\n🔧 TRYING ALTERNATIVE CALL METHOD:");
    
    try {
      // Get the contract factory to redeploy and check
      const factory = await ethers.getContractFactory("LicenseRegistry");
      const bytecode = factory.bytecode;
      console.log("   Factory bytecode length:", bytecode.length);
      
      // Compare with deployed bytecode
      const deployedCode = await ethers.provider.getCode("0x5FbDB2315678afecb367f032d93F642f64180aa3");
      console.log("   Deployed bytecode length:", deployedCode.length);
      
      if (bytecode.length === deployedCode.length) {
        console.log("   ✅ Contract matches current source!");
      } else {
        console.log("   ⚠️ Contract might be from different source");
      }
      
    } catch (e) {
      console.log("   ❌ Factory error:", e.message);
    }
    
  } catch (error) {
    console.error("❌ Fatal error:", error);
  }
}

main();