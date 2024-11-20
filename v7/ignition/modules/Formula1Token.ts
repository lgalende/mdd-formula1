import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("Formula1Token", (m) => {
    const f1Token = m.contract("Formula1Token", [m.getAccount(0)]);
    return { f1Token };
});
