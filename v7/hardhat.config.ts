import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades"

const config: HardhatUserConfig = {
  solidity: "0.8.27",
  gasReporter: {
    enabled: false,
  },
  networks: {
    base: {
      url: "https://base.llamarpc.com",
      accounts: ["ADD_ME"]
    }
  },

  etherscan: {
    apiKey: "ADD_ME"
  },
};

export default config;
