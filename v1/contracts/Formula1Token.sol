// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract Formula1Token is ERC20 {
    uint256 public constant PRICE = 0.001 ether; // 0.001 ETH
    uint256 public constant MINT_AMOUNT = 10 * 10 ** 18; // 10 tokens

    constructor() ERC20("Formula1", "F1") { }

    // With the payable modifier, this fn can receive ether
    function mint(address user) external payable {
        require (msg.value == PRICE, 'invalid ether amount');
        _mint(user, MINT_AMOUNT);
    }

    // Now the ether received in the `mint` can be withdrawn from the contract
    function withdraw(address to) external {
        // BUG: missing access control
        bool success = payable(to).send(address(this).balance);
        require (success, 'send failed');
    }
}
