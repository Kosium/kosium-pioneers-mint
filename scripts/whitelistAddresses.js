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
    constant: false,
    inputs: [
        {
          name: "earlyAdopterAddress",
          type: "address[]",
        },
    ],
    name: "whitelistAddressForPresale",
    outputs: [],
    payable: true,
    stateMutability: "nonpayable",
    type: "function",
  },
];

//can read from csv later
// let addressesToWhiteList = ['0x7390ceF3391A2E2079D74E8fFd8EFEF478e1b793'];
let addressesToWhiteList = ['0x444569AE8A0324b9B32b3aBdDDb98CcB13036Dd4'];//mizuri.eth

// let addressToWhiteList = '0xf82d87ba0b79c200FfC8a9D1e4f0E360198d0Ec9';
// let addressToWhiteList = '0xf0a674B465D5262dAB09485825EB1AEcd3C8d356';

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

  if (NFT_CONTRACT_ADDRESS) {
    const nftContract = new web3Instance.eth.Contract(
      NFT_ABI,
      NFT_CONTRACT_ADDRESS,
      { gasLimit: "1000000" }
    );

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
