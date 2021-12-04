const HDWalletProvider = require("@truffle/hdwallet-provider");
const web3 = require("web3");
const MNEMONIC = process.env.MNEMONIC.replace(/["]+/g, '');;
const NODE_API_KEY = process.env.INFURA_KEY || process.env.ALCHEMY_KEY;
const isInfura = !!process.env.INFURA_KEY;
const NFT_CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS;
const OWNER_ADDRESS = process.env.OWNER_ADDRESS;
const NETWORK = process.env.NETWORK;

if (!MNEMONIC || !NODE_API_KEY || !OWNER_ADDRESS || !NETWORK) {
  console.error(
    "Please set a mnemonic, Alchemy/Infura key, owner, network, and contract address."
  );
  return;
}

const NFT_ABI = [
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "earlyAdopterAddresses",
        "type": "address[]"
      }
    ],
    "name": "whitelistAddressForPresale",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
];

//can read from csv later
let addressesToWhiteList = ['0x444569AE8A0324b9B32b3aBdDDb98CcB13036Dd4', '0x7dFBdEE007AcdbcC299b7D79d851b7A36aDDc909'];

async function main() {
  const network =
    NETWORK === "mainnet" || NETWORK === "live" ? "mainnet" : "rinkeby";
    const provider = new HDWalletProvider({
      mnemonic: {phrase: MNEMONIC}, 
      providerOrUrl: isInfura
      ? "https://" + network + ".infura.io/v3/" + NODE_API_KEY
      : "https://eth-" + network + ".alchemyapi.io/v2/" + NODE_API_KEY
    });
  const web3Instance = new web3(provider);

  let gasLimit = 100000;
  if (NFT_CONTRACT_ADDRESS) {
    const nftContract = new web3Instance.eth.Contract(
      NFT_ABI,
      NFT_CONTRACT_ADDRESS,
      { 
        gasLimit: gasLimit,
        gasPrice: '110000000000'
      }
    );

    console.log('Whitelisting Addresses. Please wait for confirmation. network: ', NETWORK);
    const result = await nftContract.methods
      .whitelistAddressForPresale(addressesToWhiteList)
      .send({ from: OWNER_ADDRESS });
    console.log("Addresses whitelisted. Transaction: " + JSON.stringify(result));//.transactionHash);

    } else {
        console.error(
        "Add NFT_CONTRACT_ADDRESS or FACTORY_CONTRACT_ADDRESS to the environment variables"
        );
    }
}

main();
