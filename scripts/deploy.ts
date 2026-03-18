import { ethers } from "hardhat";

async function main() {

  const LicenseRegistry = await ethers.getContractFactory("LicenseRegistry");

  const contract = await LicenseRegistry.deploy();

  await contract.waitForDeployment();

  console.log("LicenseRegistry deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});