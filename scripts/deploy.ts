import { ethers } from "hardhat";

async function main() {
  const [owner, feesReceiver] = await ethers.getSigners();

  let fees = ethers.parseEther("0.00001");
  const airdrop = await ethers.deployContract("Airdrop", [fees, feesReceiver]);

  await airdrop.waitForDeployment();

  console.log(`Airdrop deployed to ${airdrop.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
