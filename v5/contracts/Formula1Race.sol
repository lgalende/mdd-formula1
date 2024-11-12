// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

// Uncomment this line to use console.log
import "hardhat/console.sol";

import '@openzeppelin/contracts/utils/ReentrancyGuard.sol';

import './Formula1Driver.sol';

contract Formula1Race is ReentrancyGuard {
    uint256 public constant PRIZE = 0.001 ether; // 0.001 ETH

    address public f1Driver;
    address public winner;

    constructor(address _f1Driver) {
        f1Driver = _f1Driver;
    }

    function race() external {
        require(winner == address(0), 'previous race has not finished yet');

        uint256 numberOfDrivers = Formula1Driver(f1Driver).totalSupply();
        uint256 randomDriverId = block.timestamp % numberOfDrivers; // TODO: is this a good way to have randomness?
        
        console.log('numberOfDrivers: %d', numberOfDrivers);
        console.log('randomDriverId: %d', randomDriverId);
        
        winner = Formula1Driver(f1Driver).ownerOf(randomDriverId);
        console.log('winner: %s', winner);
    }

    // Security consideration 1: use OZ's ReentrancyGuard to be safe against reentrancy attacks
    function claimPrize() external nonReentrant {        
        // Security consideration 2: always follow the Checks-Effects-Interactions pattern

        // Checks
        // we don't have any here (`require(...)`)

        // Effects
        address _winner = winner;
        winner = address(0);

        // Interactions
        // send ETH to the winner
        (bool success, ) = payable(winner).call{value: PRIZE}("");
        require (success, 'send failed');
    }

    // the contract can receive ETH, which will be used to pay the prizes
    receive() external payable {}
}
