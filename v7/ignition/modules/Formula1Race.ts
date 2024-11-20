import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import { IgnitionModuleBuilder } from '@nomicfoundation/ignition-core';
import Formula1Driver from "./Formula1Driver";

// This has been adapted from
// https://github.com/NomicFoundation/hardhat-ignition/blob/development/examples/upgradeable/ignition/modules/ProxyModule.js

/**
 * This is the first module that will be run. It deploys the proxy and the
 * proxy admin, and returns them so that they can be used by other modules.
 */
const proxyModule = buildModule('ProxyModule', (m: IgnitionModuleBuilder) => {
  const { f1Driver } = m.useModule(Formula1Driver);

  // This address is the owner of the ProxyAdmin contract,
  // so it will be the only account that can upgrade the proxy when needed.
  const proxyAdminOwner = m.getAccount(0);

  // This is our contract that will be proxied.
  // We will upgrade this contract with a new version later.
  const f1Race = m.contract('Formula1Race');

  const encodedFunctionCall = m.encodeFunctionCall(f1Race, 'initialize', [
    f1Driver,
  ]);

  // The TransparentUpgradeableProxy contract creates the ProxyAdmin within its constructor.
  // To read more about how this proxy is implemented, you can view the source code and comments here:
  // https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v5.0.1/contracts/proxy/transparent/TransparentUpgradeableProxy.sol
  const proxy = m.contract('TransparentUpgradeableProxy', [
    f1Race,
    proxyAdminOwner,
    encodedFunctionCall,
  ]);

  // We need to get the address of the ProxyAdmin contract that was created by the TransparentUpgradeableProxy
  // so that we can use it to upgrade the proxy later.
  const proxyAdminAddress = m.readEventArgument(proxy, 'AdminChanged', 'newAdmin');

  // Here we use m.contractAt(...) to create a contract instance for the ProxyAdmin that we can interact with later to upgrade the proxy.
  const proxyAdmin = m.contractAt('ProxyAdmin', proxyAdminAddress);

  // Return the proxy and proxy admin so that they can be used by other modules.
  return { proxy, proxyAdmin };
});

/**
 * This is the second module that will be run, and it is also the only module exported from this file.
 * It creates a contract instance for the Formula1Race contract using the proxy from the previous module.
 */
export const Formula1Race = buildModule('Formula1Race', (m) => {
  // Get the proxy and proxy admin from the previous module.
  const { proxy, proxyAdmin } = m.useModule(proxyModule);

  // Here we're using m.contractAt(...) a bit differently than we did above.
  // While we're still using it to create a contract instance, we're now telling Hardhat Ignition
  // to treat the contract at the proxy address as an instance of the Formula1Race contract.
  // This allows us to interact with the underlying Formula1Race contract via the proxy from within tests and scripts.
  const formula1Race = m.contractAt('Formula1Race', proxy);

  // Return the contract instance, along with the original proxy and proxyAdmin contracts
  // so that they can be used by other modules, or in tests and scripts.
  return { formula1Race, proxy, proxyAdmin };
});

export default Formula1Race;
