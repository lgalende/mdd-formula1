### Install OpenZepellin Upgreadable

First install the contracts so we can extend Formula1Race with 
Initializable and change the implementation of ReentrancyGuard to
ReentrancyGuardUpgradeable
https://docs.openzeppelin.com/contracts/5.x/upgradeable

Use the plugin to change the tests to deploy the contract as a proxy
https://docs.openzeppelin.com/upgrades-plugins/1.x/hardhat-upgrades

### Deployment script with Hardhat

The deployments scripts are in ingition/modules
Don't forget to add the Proxies.sol to import the proxies

https://hardhat.org/ignition/docs/getting-started#overview

Added two scripts to deploy to deploy to Sepolia

``` shell
yarn deploy:sepolia
// To upgrade to the new version
yarn upgradeV2:sepolia 
// To verify the contract
yarn verify:base
```
