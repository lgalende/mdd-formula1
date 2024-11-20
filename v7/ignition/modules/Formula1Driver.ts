import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import Formula1Token from "./Formula1Token";

export default buildModule("Formula1Driver", (m) => {
    const {f1Token} = m.useModule(Formula1Token);
    const f1Driver = m.contract(
        "Formula1Driver",
        [m.getAccount(0), f1Token]
    );

    m.call(f1Driver, "whitelistUser", [m.getAccount(0)]);
    return { f1Driver, f1Token };
});
