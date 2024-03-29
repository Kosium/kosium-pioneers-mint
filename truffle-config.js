const HDWalletProvider = require("@truffle/hdwallet-provider");

const MNEMONIC = process.env.MNEMONIC.replace(/["]+/g, '');
const NODE_API_KEY = process.env.INFURA_KEY || process.env.ALCHEMY_KEY;
const isInfura = !!process.env.INFURA_KEY;

const needsNodeAPI =
  process.env.npm_config_argv &&
  (process.env.npm_config_argv.includes("rinkeby") ||
    process.env.npm_config_argv.includes("live"));

if ((!MNEMONIC || !NODE_API_KEY) && needsNodeAPI) {
  console.error("Please set a mnemonic and ALCHEMY_KEY or INFURA_KEY.");
  process.exit(0);
}

const rinkebyNodeUrl = isInfura
  ? "https://rinkeby.infura.io/v3/" + NODE_API_KEY
  : "wss://eth-rinkeby.alchemyapi.io/v2/" + NODE_API_KEY;

const mainnetNodeUrl = isInfura
  ? "https://mainnet.infura.io/v3/" + NODE_API_KEY
  : "https://eth-mainnet.alchemyapi.io/v2/" + NODE_API_KEY;

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 7545,
      gas: 5000000,
      network_id: "*", // Match any network id
    },
    rinkeby: {
      networkCheckTimeout: 60000,
      provider: function () {
        return new HDWalletProvider({mnemonic: {phrase: MNEMONIC}, providerOrUrl: rinkebyNodeUrl});
      },
      gas: 10000000,
      network_id: 4,
      from: "0x7390ceF3391A2E2079D74E8fFd8EFEF478e1b793"
    },
    live: {
      network_id: 1,
      provider: function () {
        return new HDWalletProvider({mnemonic: {phrase: MNEMONIC}, providerOrUrl: mainnetNodeUrl});
      },
      gas: 4000000,
      gasPrice: 170000000000,
      from: "0x62bb848ec84D08d55Ea70a19118300bae6658F18"
    },
  },
  mocha: {
    reporter: "eth-gas-reporter",
    reporterOptions: {
      currency: "USD",
      gasPrice: 2,
    },
  },
  compilers: {
    solc: {
      version: "^0.8.0",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200   // Optimize for how many times you intend to run the code
        },
      },
    },
  },
  plugins: [
    'truffle-plugin-verify'
  ],
  api_keys: {
    etherscan: 'MRHH7KANDYHIGY4EZQDTR447KAFDPED1PZ'
  }
};
