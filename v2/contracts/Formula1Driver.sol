// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC721/ERC721.sol';

contract Formula1Driver is ERC721 {
    uint256 public constant NFTS_PER_USER = 5;
    uint256 public constant NFT_PRICE = 2 * 10**18; // 2 tokens, must be in token decimals (18 in this case)

    uint256 public totalSupply; // initialized in 0
    address public f1Token; // reference to the ERC20

    constructor(address _f1Token) ERC721('Formula1Driver', 'FAST') {
        f1Token = _f1Token;
    }

    function mint(uint256 quantity) external {
        // TODO: whitelisting
        require (balanceOf(msg.sender) + quantity <= NFTS_PER_USER, 'a user cannot have more than 5 NFTs');

        for (uint256 i = 0; i < quantity; i++) {
            IERC20(f1Token).transferFrom(msg.sender, address(this), NFT_PRICE);  // TODO: the tokens are locked up
            _mint(msg.sender, totalSupply); // reading totalSupply from storage => expensive
            totalSupply++; // totalSupply = totalSupply + 1 // writing totalSupply in storage, and also reading totalSupply from storage
        }
        // TODO: the above is inefficient
        // `totalSupply` and `f1Token` are storage variable
        // reading/writing from storage is expensive
        // the loop above is accessing storage multiple times
        // when performing the erc20 transfer we're writing to storage too
        // try to read from and write to storage as little as possible by saving storage variables in memory variables and using the latter
    }
}
