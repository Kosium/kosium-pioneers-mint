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
          "internalType": "uint256",
          "name": "maxToPresale",
          "type": "uint256"
        }
      ],
      "name": "setPresaleLimit",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
];

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
      { gasLimit: "100000",
        gasPrice: '100000000000'
      }
    );

    let limit = 1000;
    console.log('setting presale limit to', limit, ' on network ', NETWORK);
    const result = await nftContract.methods
      .setPresaleLimit(limit)
      .send({ from: OWNER_ADDRESS });
    //   .send({ from: OWNER_ADDRESS});
    console.log("Result = " + JSON.stringify(result));
  } else {
    console.error(
      "Add NFT_CONTRACT_ADDRESS or FACTORY_CONTRACT_ADDRESS to the environment variables"
    );
  }
}

main();
