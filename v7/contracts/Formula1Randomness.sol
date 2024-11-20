// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

import '@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol';
import '@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol';


contract Formula1Randomness is VRFConsumerBaseV2Plus {
    uint256 public randomResult;
    uint256 public subId;

    constructor(address _vrfCoordinator, uint256 _subId) VRFConsumerBaseV2Plus(_vrfCoordinator) {
        subId = _subId;
    }

    function fulfillRandomWords(uint256 requestId, uint256[] calldata randomWords) internal override {
        randomResult = randomWords[0];
    }

    function newRandomRequest(bytes32 _keyHash) external {
        uint256 requestID = s_vrfCoordinator.requestRandomWords(VRFV2PlusClient.RandomWordsRequest({
            keyHash: _keyHash, // 0x00b81b5a830cb0a4009fbd8904de511e28631e62ce5ad231373d3cdad373ccab,
            subId: subId,
            requestConfirmations: 4,
            callbackGasLimit: 2000000,
            numWords: 1,
            extraArgs: VRFV2PlusClient._argsToBytes(VRFV2PlusClient.ExtraArgsV1({nativePayment: true})) // new parameter
        }));
    }

    function getRandomNumber() external returns(uint256) {
        uint256 random = randomResult;
        // We use it only once
        randomResult = 0;
        return random;
    }

}
