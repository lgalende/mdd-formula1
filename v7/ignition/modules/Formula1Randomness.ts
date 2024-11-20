import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("Formula1Randomness", (m) => {
    const f1Randomness = m.contract("Formula1Randomness", ["0xd5D517aBE5cF79B7e95eC98dB0f0277788aFF634", "33192846711853546250426075408766245189347997099197050502095162600236716337352"]);
    return { f1Randomness };
});
