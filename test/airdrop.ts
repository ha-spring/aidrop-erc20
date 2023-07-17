// test/Airdrop.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Airdrop", function () {
  let airdropContract;
  let tokenContract;
  let owner;
  let recipient1;
  let recipient2;

  const fee = ethers.parseEther("1"); // Set the fee amount to 1 Ether

  before(async function () {
    [owner, recipient1, recipient2] = await ethers.getSigners();

    const Airdrop = await ethers.getContractFactory("Airdrop");
    airdropContract = await Airdrop.deploy(fee);

    const ERC20Token = await ethers.getContractFactory("Token"); // Replace with your ERC20 token contract
    tokenContract = await ERC20Token.deploy();

    // Mint some tokens to the owner for testing
    const tokenSupply = ethers.parseEther("1000");
    await tokenContract.mint(owner.address, tokenSupply);
  });

  it("should perform airdrop correctly", async function () {
    // Set up the recipients and quantities
    const recipients = [recipient1.address, recipient2.address];
    const quantities = [
      ethers.parseEther("100"),
      ethers.parseEther("200"),
    ];

    // Approve the airdrop contract to spend tokens on behalf of the owner
    await tokenContract.connect(owner).approve(airdropContract.target, ethers.parseEther("300"));

    // Perform the airdrop
    await airdropContract.airdrop(tokenContract.target, recipients, quantities, { value: fee });

    // Check the recipient balances
    expect(await tokenContract.balanceOf(recipient1.address)).to.equal(quantities[0]);
    expect(await tokenContract.balanceOf(recipient2.address)).to.equal(quantities[1]);
  });

  it("should revert when invalid input is provided", async function () {
    const recipients = [recipient1.address, recipient2.address];
    const quantities = [ethers.parseEther("100")];

    // Attempt to perform the airdrop with invalid input
    await expect(
      airdropContract.airdrop(tokenContract.target, recipients, quantities, { value: fee })
    ).to.be.revertedWith("Invalid input");
  });

  it("should revert when insufficient fee is sent", async function () {
    const recipients = [recipient1.address, recipient2.address];
    const quantities = [
      ethers.parseEther("100"),
      ethers.parseEther("200"),
    ];

    // Attempt to perform the airdrop with insufficient fee
    await expect(
      airdropContract.airdrop(tokenContract.target, recipients, quantities, { value: 0 })
    ).to.be.revertedWith("Insufficient fee");
  });

  it("should revert when sender has insufficient balance", async function () {
    const recipients = [recipient1.address];
    const quantities = [ethers.parseEther("1000")];

    // Attempt to perform the airdrop with insufficient balance
    await expect(
      airdropContract.airdrop(tokenContract.target, recipients, quantities, { value: fee })
    ).to.be.revertedWith("Insufficient balance");
  });

  it("should revert when sender has insufficient allowance", async function () {
    const recipients = [recipient1.address];
    const quantities = [ethers.parseEther("100")];

    // Reduce the owner's allowance for the airdrop contract
    await tokenContract.connect(owner).approve(airdropContract.target, 0);

    // Attempt to perform the airdrop with insufficient allowance
    await expect(
      airdropContract.airdrop(tokenContract.target, recipients, quantities, { value: fee })
    ).to.be.revertedWith("Insufficient allowance");
  });
  
  it("should update the fee", async function () {
    //const newFee = ethers.utils.parseEther("0.2");
    const newFee = ethers.parseEther("2");

    // Ensure the current fee is 0.1 ETH
    expect(await airdropContract.fee()).to.equal(fee);

    // Update the fee
    await airdropContract.updateFee(newFee);

    // Ensure the fee has been updated
    expect(await airdropContract.fee()).to.equal(newFee);
  });
});

