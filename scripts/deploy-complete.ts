import { ethers, run, network } from "hardhat";
import * as fs from "fs";

async function main() {
  console.log("\n🚀 Deploying Zambia Vehicle License System");
  console.log("=============================================");
  console.log(`📡 Network: ${network.name}`);
  console.log(`🔑 Deployer: ${(await ethers.getSigners())[0].address}`);
  
  // Deploy contract
  console.log("\n📝 Deploying LicenseRegistry...");
  const LicenseRegistry = await ethers.getContractFactory("LicenseRegistry");
  const contract = await LicenseRegistry.deploy();
  await contract.waitForDeployment();
  
  const contractAddress = await contract.getAddress();
  console.log(`✅ Contract deployed to: ${contractAddress}`);
  
  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    chainId: network.config.chainId,
    contractAddress: contractAddress,
    deployer: (await ethers.getSigners())[0].address,
    deployedAt: new Date().toISOString(),
    rtsaAuthority: (await ethers.getSigners())[0].address
  };
  
  // Create deployments folder if it doesn't exist
  if (!fs.existsSync("deployments")) {
    fs.mkdirSync("deployments");
  }
  
  fs.writeFileSync(
    `deployments/${network.name}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  // Create frontend config
  const frontendConfig = {
    contractAddress: contractAddress,
    network: network.name,
    chainId: network.config.chainId,
    rpcUrl: network.name === "localhost" ? "http://127.0.0.1:8545" : "",
    explorerUrl: network.name === "sepolia" ? "https://sepolia.etherscan.io" : ""
  };
  
  fs.writeFileSync("frontend-config.json", JSON.stringify(frontendConfig, null, 2));
  
  console.log("\n📁 Deployment files saved:");
  console.log(`   - deployments/${network.name}.json`);
  console.log(`   - frontend-config.json`);
  
  // Deploy summary
  console.log("\n📋 DEPLOYMENT SUMMARY");
  console.log("=".repeat(50));
  console.log(`Contract: LicenseRegistry`);
  console.log(`Address: ${contractAddress}`);
  console.log(`Network: ${network.name}`);
  console.log(`Chain ID: ${network.config.chainId}`);
  console.log(`RTSA Authority: ${deploymentInfo.rtsaAuthority}`);
  console.log("=".repeat(50));
  
  // Optional: Verify on Etherscan for testnet
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("\n⏳ Waiting for block confirmations...");
    await contract.deploymentTransaction()?.wait(6);
    
    console.log("🔍 Verifying contract on Etherscan...");
    try {
      await run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("✅ Contract verified!");
    } catch (verifyError) {
      // Type-safe error handling
      if (verifyError instanceof Error) {
        console.log("⚠️ Verification pending:", verifyError.message);
      } else {
        console.log("⚠️ Verification pending - unknown error occurred");
      }
    }
  }
}

main().catch((error) => {
  if (error instanceof Error) {
    console.error("❌ Deployment failed:", error.message);
  } else {
    console.error("❌ Deployment failed with unknown error");
  }
  process.exitCode = 1;
});