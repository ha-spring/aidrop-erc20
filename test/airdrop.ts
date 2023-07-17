const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Airdrop", function () {
  let airdrop;
  let token;
  let owner;
  let recipient1;
  let recipient2;

  // const FEE_AMOUNT = ethers.utils.parseEther("0.1");
  const FEE_AMOUNT = 1000000000;

  beforeEach(async function () {
    const Airdrop = await ethers.getContractFactory("Airdrop");
    airdrop = await Airdrop.deploy(FEE_AMOUNT);

    const Token = await ethers.getContractFactory("Token"); // Assuming you have a separate token contract
    token = await Token.deploy();

    [owner, recipient1, recipient2] = await ethers.getSigners();
  });

  it("should airdrop tokens to recipients", async function () {
    // Mint tokens to the owner
    await token.mint(owner.address, 1000);

    // Approve the Airdrop contract to spend tokens on behalf of the owner
    await token.connect(owner).approve(airdrop.target, 1000);

    // Perform the airdrop
    await airdrop
      .connect(owner)
      .airdrop(
        token.target,
        [recipient1.address, recipient2.address],
        [100, 200],
        { value: FEE_AMOUNT },
      );

    // Check the token balances of recipients
    expect(await token.balanceOf(recipient1.address)).to.equal(100);
    expect(await token.balanceOf(recipient2.address)).to.equal(200);
  });

  it("should update the fee", async function () {
    //const newFee = ethers.utils.parseEther("0.2");
    const newFee = 20000000000;

    // Ensure the current fee is 0.1 ETH
    expect(await airdrop.fee()).to.equal(FEE_AMOUNT);

    // Update the fee
    await airdrop.updateFee(newFee);

    // Ensure the fee has been updated
    expect(await airdrop.fee()).to.equal(newFee);
  });
});
