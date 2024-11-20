### Add VRF

https://docs.chain.link/vrf
https://docs.chain.link/vrf/v2-5/overview/subscription

Modify the race to receive the random number from another function to
receive the random number from another smart contract

To deploy the v3 we deletes the upgradev2 script and wipe the future from
deployment directory running

https://hardhat.org/ignition/docs/guides/error-handling#wiping-a-previous-execution
```shell
hardhat ignition wipe chain-8453 UpgradeModule#ProxyModule~ProxyAdmin.upgradeAndCall
```
