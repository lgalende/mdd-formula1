// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract Formula1Token is ERC20 {
    uint256 public constant PRICE = 0.001 ether; // 0.001 ETH
    uint256 public constant MINT_AMOUNT = 10 * 10 ** 18; // 10 tokens
    address public immutable owner; // use immutable for variables set during construction that can't be changed, to save gas when using it later on

    constructor(address _owner) ERC20("Formula1", "F1") {
        // TODO: use OZ Ownable instead (will use it in the NFT contract)
        owner = _owner;
    }

    // With the payable modifier, this fn can receive ether
    function mint(address user) external payable {
        require (msg.value == PRICE, 'invalid ether amount');
        _mint(user, MINT_AMOUNT);
    }

    // Now the ether received in the `mint` can be withdrawn from the contract
    function withdraw(address to) external {
        // owner  ->   ContractA     ->    Formula1Token
        //   -    |  origin: owner   |  origin: owner     => authorized
        //   -    |  sender: owner   |  sender: ContractA => unauthorized

        // NEVER use tx.origin for validations, use msg.sender instead
        // BUG: require (tx.origin == owner, 'unauthorized');
        require (msg.sender == owner, 'unauthorized');
        bool success = payable(to).send(address(this).balance);
        require (success, 'send failed');
    }
}
