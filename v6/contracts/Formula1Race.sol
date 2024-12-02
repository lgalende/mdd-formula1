// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

// Uncomment this line to use console.log
import "hardhat/console.sol";

import '@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol';
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import './Formula1Driver.sol';

contract Formula1Race is Initializable, ReentrancyGuardUpgradeable {
    uint256 public constant PRIZE = 0.001 ether; // 0.001 ETH

    address public f1Driver;
    address public winner;
    uint256 public counter;

    function initialize(address _f1Driver) public initializer {
        __ReentrancyGuard_init();
        f1Driver = _f1Driver;
    }

    function race() external {
        require(winner == address(0), 'previous race has not finished yet');

        uint256 numberOfDrivers = Formula1Driver(f1Driver).totalSupply();
        uint256 randomDriverId = block.timestamp % numberOfDrivers;

        console.log('numberOfDrivers: %d', numberOfDrivers);
        console.log('randomDriverId: %d', randomDriverId);

        winner = Formula1Driver(f1Driver).ownerOf(randomDriverId);
        counter++;
        console.log('winner: %s', winner);
    }

    // Security consideration 1: use OZ's ReentrancyGuard to be safe against reentrancy attacks
    function claimPrize() external nonReentrant {
        // Security consideration 2: always follow the Checks-Effects-Interactions pattern

        address _winner = winner;

        // Checks
        require (_winner != address(0), 'winner not set');

        // Effects
        winner = address(0);

        // Interactions
        // send ETH to the winner
        (bool success, ) = payable(_winner).call{value: PRIZE}("");
        require (success, 'send failed');
    }

    // the contract can receive ETH, which will be used to pay the prizes
    receive() external payable {}
}
