const fs = require("fs");
require("@nomiclabs/hardhat-waffle");

const privateKey = fs.readFileSync(".secret").toString().trim();

module.exports = {
  networks: {
    hardhat: {
      chainId: 1337,
      // throwOnTransactionFailures: true,
      // throwOnCallFailures: true,
      allowUnlimitedContractSize: true,
      gasLimit: 5000000,
      // blockGasLimit: 0x1fffffffffffff,
    },
  },
  solidity: "0.8.17",
};
