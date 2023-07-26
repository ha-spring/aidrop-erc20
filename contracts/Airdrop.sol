// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Airdrop is Ownable {
    uint256 public fee;
    address public feesReceiver;

    constructor(uint256 initFee, address initFeesReceiver) {
        fee = initFee;
        feesReceiver = initFeesReceiver;
    }

    function airdrop(
        address _tokenAddress,
        address[] memory _recipients,
        uint256[] memory _quantities
    ) external payable {
        require(_recipients.length == _quantities.length, "Invalid input");
        require(msg.value == fee, "Insufficient fee");

        for (uint256 i = 0; i < _recipients.length; i++) {
            require(
                IERC20(_tokenAddress).balanceOf(msg.sender) >= _quantities[i],
                "Insufficient balance"
            );
            require(
                IERC20(_tokenAddress).allowance(msg.sender, address(this)) >=
                    _quantities[i],
                "Insufficient allowance"
            );

            IERC20(_tokenAddress).transferFrom(
                msg.sender,
                _recipients[i],
                _quantities[i]
            );
        }

        payable(feesReceiver).transfer(fee);

        if (msg.value > fee) {
            payable(msg.sender).transfer(msg.value - fee);
        }
    }

    function updateFee(uint256 newFee) external onlyOwner {
        fee = newFee;
    }

    function setFeesReceiver(address receiver) external onlyOwner {
        require(receiver != address(0), "Invalid receiver address");
        feesReceiver = receiver;
    }
}
