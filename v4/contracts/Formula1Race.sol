// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

// Uncomment this line to use console.log
import "hardhat/console.sol";

import './Formula1Driver.sol';

contract Formula1Race {
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

    function claimPrize() external {
        require (winner != address(0), 'winner not set');

        // send ETH to the winner
        (bool success, ) = payable(winner).call{value: PRIZE}("");
        require (success, 'send failed');
        // BUG: reentrancy attack
        // if `winner` is a contract that on `receive` calls `claimPrice` 5 times, 
        // then this contract will send the PRIZE to the `winner` 5 times, which is not the expected behavior
        // Solution:
        // always follow the Checks-Effects-Interactions pattern
        // also, consider using OZ's ReentrancyGuard implementation
        
        winner = address(0);
    }

    // the contract can receive ETH, which will be used to pay the prizes
    receive() external payable {}
}
