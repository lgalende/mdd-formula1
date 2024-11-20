import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import Formula1Race from './Formula1Race';
import { IgnitionModuleBuilder } from '@nomicfoundation/ignition-core';
import Formula1Randomness from "./Formula1Randomness";


/**
 * This module upgrades the proxy to a new version of the Formula1Race contract.
 */
const upgradeModule = buildModule('UpgradeModule', (m: IgnitionModuleBuilder) => {
  // Make sure we're using the account that owns the ProxyAdmin contract.
  const proxyAdminOwner = m.getAccount(0);


  const { proxyAdmin, proxy } = m.useModule(Formula1Race);

  // This is the new version of the Formula1Race contract that we want to upgrade to.
  const formula1Race = m.contract('Formula1RaceV3');

  // Upgrade the proxy to the new version of the Formula1Race contract.
  // This function also accepts a data parameter, which accepts encoded function call data.
  // We pass the encoded function call data we created above to the `upgradeAndCall` function
  // so that the `setName` function is called on the new implementation contract after the upgrade.
  const upgradeCall = m.call(proxyAdmin, 'upgradeAndCall', [proxy, formula1Race, '0x'], {
    from: proxyAdminOwner,
  });

  // Return the proxy and proxy admin so that they can be used by other modules.
  return { proxyAdmin, proxy };
});

/**
 * This is the final module that will be run.
 *
 * It takes the proxy from the previous module and uses it to create a local contract instance
 * for the Formula1Race contract. This allows us to interact with the Formula1Race contract via the proxy.
 */
export const Formula1RaceUpgradeV3 = buildModule('Formula1RaceUpgradeV3', (m) => {
  // Get the proxy from the previous module.
  const { proxy, proxyAdmin } = m.useModule(upgradeModule);
  const { f1Randomness } = m.useModule(Formula1Randomness);

  // Create a local contract instance for the Formula1Race contract.
  // This line tells Hardhat Ignition to use the Formula1Race ABI for the contract at the proxy address.
  // This allows us to call functions on the Formula1Race contract via the proxy.
  const formula1Race = m.contractAt('Formula1RaceV3', proxy);

  m.call(formula1Race, 'setRandomness', [f1Randomness]);

  // Return the contract instance so that it can be used by other modules or in tests.
  return { formula1Race, proxy, proxyAdmin };
});

export default Formula1RaceUpgradeV3;
