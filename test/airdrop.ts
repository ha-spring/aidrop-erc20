// test/Airdrop.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Airdrop", function () {
  let airdropContract;
  let tokenContract;
  let owner;
  let recipient1;
  let recipient2;
  let feesReceiver1;
  let feesReceiver2;

  const fee = ethers.parseEther("1");

  before(async function () {
    [owner, recipient1, recipient2, feesReceiver1, feesReceiver2] =
      await ethers.getSigners();

    const Airdrop = await ethers.getContractFactory("Airdrop");
    airdropContract = await Airdrop.deploy(fee, feesReceiver1.address);

    const ERC20Token = await ethers.getContractFactory("Token");
    tokenContract = await ERC20Token.deploy();

    const tokenSupply = ethers.parseEther("1000");
    await tokenContract.mint(owner.address, tokenSupply);
  });

  it("should perform airdrop correctly", async function () {
    const recipients = [recipient1.address, recipient2.address];
    const quantities = [ethers.parseEther("100"), ethers.parseEther("200")];

    await tokenContract
      .connect(owner)
      .approve(airdropContract.target, ethers.parseEther("300"));

    await airdropContract.airdrop(
      tokenContract.target,
      recipients,
      quantities,
      { value: fee },
    );

    expect(await tokenContract.balanceOf(recipient1.address)).to.equal(
      quantities[0],
    );
    expect(await tokenContract.balanceOf(recipient2.address)).to.equal(
      quantities[1],
    );
    expect(await ethers.provider.getBalance(feesReceiver1.address)).to.equal(
      "10001000000000000000000",
    );
  });

  it("should revert when invalid input is provided", async function () {
    const recipients = [recipient1.address, recipient2.address];
    const quantities = [ethers.parseEther("100")];

    await expect(
      airdropContract.airdrop(tokenContract.target, recipients, quantities, {
        value: fee,
      }),
    ).to.be.revertedWith("Invalid input");
    expect(await ethers.provider.getBalance(feesReceiver1.address)).to.equal(
      "10001000000000000000000",
    );
  });

  it("should revert when insufficient fee is sent", async function () {
    const recipients = [recipient1.address, recipient2.address];
    const quantities = [ethers.parseEther("100"), ethers.parseEther("200")];

    await expect(
      airdropContract.airdrop(tokenContract.target, recipients, quantities, {
        value: 0,
      }),
    ).to.be.revertedWith("Insufficient fee");
    expect(await ethers.provider.getBalance(feesReceiver1.address)).to.equal(
      "10001000000000000000000",
    );
  });

  it("should revert when sender has insufficient balance", async function () {
    const recipients = [recipient1.address];
    const quantities = [ethers.parseEther("1000")];

    await expect(
      airdropContract.airdrop(tokenContract.target, recipients, quantities, {
        value: fee,
      }),
    ).to.be.revertedWith("Insufficient balance");
    expect(await ethers.provider.getBalance(feesReceiver1.address)).to.equal(
      "10001000000000000000000",
    );
  });

  it("should revert when sender has insufficient allowance", async function () {
    const recipients = [recipient1.address];
    const quantities = [ethers.parseEther("100")];

    await tokenContract.connect(owner).approve(airdropContract.target, 0);

    await expect(
      airdropContract.airdrop(tokenContract.target, recipients, quantities, {
        value: fee,
      }),
    ).to.be.revertedWith("Insufficient allowance");
    expect(await ethers.provider.getBalance(feesReceiver1.address)).to.equal(
      "10001000000000000000000",
    );
  });

  it("should update the fee", async function () {
    const newFee = ethers.parseEther("2");

    expect(await airdropContract.fee()).to.equal(fee);

    await airdropContract.updateFee(newFee);

    expect(await airdropContract.fee()).to.equal(newFee);

    const recipients = [recipient1.address, recipient2.address];
    const quantities = [ethers.parseEther("100"), ethers.parseEther("200")];

    await tokenContract
      .connect(owner)
      .approve(airdropContract.target, ethers.parseEther("300"));

    await airdropContract.airdrop(
      tokenContract.target,
      recipients,
      quantities,
      { value: newFee },
    );

    expect(await tokenContract.balanceOf(recipient1.address)).to.equal(
      ethers.parseEther("200"),
    );
    expect(await tokenContract.balanceOf(recipient2.address)).to.equal(
      ethers.parseEther("400"),
    );
    expect(await ethers.provider.getBalance(feesReceiver1.address)).to.equal(
      "10003000000000000000000",
    );
  });

  it("should update the fee receiver", async function () {
    await airdropContract.setFeesReceiver(feesReceiver2.address);

    expect(await airdropContract.feesReceiver()).to.equal(
      feesReceiver2.address,
    );

    const recipients = [recipient1.address, recipient2.address];
    const quantities = [ethers.parseEther("100"), ethers.parseEther("200")];

    await tokenContract
      .connect(owner)
      .approve(airdropContract.target, ethers.parseEther("300"));

    const fees = await airdropContract.fee();

    await airdropContract.airdrop(
      tokenContract.target,
      recipients,
      quantities,
      { value: fees },
    );

    expect(await ethers.provider.getBalance(feesReceiver1.address)).to.equal(
      "10003000000000000000000",
    );

    expect(await ethers.provider.getBalance(feesReceiver2.address)).to.equal(
      "10002000000000000000000",
    );
  });
});
