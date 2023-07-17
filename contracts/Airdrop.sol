// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Airdrop is Ownable {
    uint256 public fee;

    constructor(uint256 initFree) {
        fee = initFree;
    }

    function airdrop(
        address _tokenAddress,
        address[] memory _recipients,
        uint256[] memory _quantities
    ) external payable {
        require(_recipients.length == _quantities.length, "Invalid input");
        require(msg.value == fee, "Insufficient fee");

        for (uint256 i = 0; i < _recipients.length; i++) {
            IERC20(_tokenAddress).transferFrom(
                msg.sender,
                _recipients[i],
                _quantities[i]
            );
        }
    }

    function updateFee(uint256 newFee) external onlyOwner {
        fee = newFee;
    }
}
