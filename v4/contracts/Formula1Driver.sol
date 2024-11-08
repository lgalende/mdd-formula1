// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC721/ERC721.sol';

import '@openzeppelin/contracts/access/Ownable.sol';

contract Formula1Driver is Ownable, ERC721 {
    uint256 public constant NFTS_PER_USER = 5;
    uint256 public constant NFT_PRICE = 2 * 10**18; // 2 tokens, must be in token decimals (18 in this case)

    uint256 public totalSupply; // initialized in 0
    address public immutable f1Token; // reference to the ERC20

    mapping (address => bool) public whitelist; // default value is false

    // the modifier could receive the user as param, if needed
    modifier onlyWhitelisted() {
        require (whitelist[msg.sender], 'user not allowed');
        _; // execute the rest of the calling function
        // we could add some code here too, if needed
    }

    constructor(address _owner, address _f1Token) Ownable(_owner) ERC721('Formula1Driver', 'FAST') {
        f1Token = _f1Token;
    }

    function mint(uint256 quantity) external onlyWhitelisted() {
        // require (isUserWhitelisted(msg.sender));
        // we implemented a modifier instead of the above

        require (balanceOf(msg.sender) + quantity <= NFTS_PER_USER, 'a user cannot have more than 5 NFTs');

        // Read totalSupply from storage only once
        uint256 _totalSupply = totalSupply; // copy storage variable in memory => memory is cheaper

        // Read f1Token from storage only once (if we make it immutable, this isn't a problem then)
        // Write f1Token balances only once
        IERC20(f1Token).transferFrom(msg.sender, owner(), NFT_PRICE * quantity);

        for (uint256 i = 0; i < quantity; i++) {
            _mint(msg.sender, _totalSupply);
            _totalSupply++;
        }

        // Write totalSupply to storage only once
        totalSupply = _totalSupply;
    }

    // onlyOwner modifier requires `msg.sender == owner`
    function whitelistUser(address user) external onlyOwner {
        whitelist[user] = true;
    }

    function blacklistUser(address user) external onlyOwner {
        whitelist[user] = false;
    }

    function isUserWhitelisted(address user) public view returns (bool) {
        return whitelist[user];
    } 
}
