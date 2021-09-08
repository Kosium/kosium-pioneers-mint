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

// const rinkebyNodeUrl = isInfura
//   ? "https://rinkeby.infura.io/v3/" + NODE_API_KEY
//   : "https://eth-rinkeby.alchemyapi.io/v2/" + NODE_API_KEY;
  const rinkebyNodeUrl = isInfura
    ? "https://rinkeby.infura.io/v3/" + NODE_API_KEY
    : "wss://eth-rinkeby.alchemyapi.io/v2/" + NODE_API_KEY;

const mainnetNodeUrl = isInfura
  ? "https://mainnet.infura.io/v3/" + NODE_API_KEY
  : "https://eth-mainnet.alchemyapi.io/v2/" + NODE_API_KEY;

console.log('rinkeby node url: ', rinkebyNodeUrl);


const bip39 = require("bip39");
// const hdkey = require('ethereumjs-wallet/hdkey');
const hdkey = require('E:\\a_Repos\\mythical-weapons\\node_modules\\ethereumjs-wallet\\dist\\hdkey.js');
// console.log('hdkey: ', hdkey.default);
const wallet_hdpath="m/44'/60'/0'/0/";
var addresses = [];
var address_index = 0;
var num_addresses = 1;

var getAddr = async function(){
  for (let i = address_index; i < address_index + num_addresses; i++){
    var buff = await bip39.mnemonicToSeed(MNEMONIC);
    const wallet = hdkey.default.fromMasterSeed(buff).derivePath(wallet_hdpath + i).getWallet();
    const addr = '0x' + wallet.getAddress().toString('hex');
    addresses.push(addr);
    // this.wallets[addr] = wallet;
  }
  console.log('ALL ADDRESSES: ', addresses);
}

getAddr();


  






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
      gas: 5000000,
      gasPrice: 5000000000,
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
          runs: 20   // Optimize for how many times you intend to run the code
        },
      },
    },
  },
  plugins: [
    'truffle-plugin-verify'
  ],
  api_keys: {
    etherscan: 'ETHERSCAN_API_KEY_FOR_VERIFICATION'
  }
};
