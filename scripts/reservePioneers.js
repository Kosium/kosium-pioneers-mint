const HDWalletProvider = require("@truffle/hdwallet-provider");
const web3 = require("web3");
const MNEMONIC = process.env.MNEMONIC.replace(/["]+/g, '');;
const NODE_API_KEY = process.env.INFURA_KEY || process.env.ALCHEMY_KEY;
const isInfura = !!process.env.INFURA_KEY;
const NFT_CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS;
const OWNER_ADDRESS = process.env.OWNER_ADDRESS;
const NETWORK = process.env.NETWORK;
const MINT_TO_ADDRESS = process.env.MINT_TO_ADDRESS;

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
        "internalType": "address",
        "name": "_to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "numberToReserve",
        "type": "uint256"
      }
    ],
    "name": "reservePioneers",
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

  let numToReserve = 1;
  let gasLimit = 150000 + 10000 * numToReserve;
  let addressToReserveTo = '';//OWNER_ADDRESS;//prm

  if (NFT_CONTRACT_ADDRESS) {
    const nftContract = new web3Instance.eth.Contract(
      NFT_ABI,
      NFT_CONTRACT_ADDRESS,
      { 
        gasLimit: gasLimit,
        // gasPrice: '100000000000'
      }
    );

    console.log('Minting to' , addressToReserveTo + ' Please wait for confirmation. Network: ', NETWORK);
    const result = await nftContract.methods
      .reservePioneers(addressToReserveTo, numToReserve)
      .send({ from: OWNER_ADDRESS});
    console.log("Minted pioneer. Transaction: " + JSON.stringify(result));//.transactionHash);
  } else {
    console.error(
      "Add NFT_CONTRACT_ADDRESS or FACTORY_CONTRACT_ADDRESS to the environment variables"
    );
  }
}

main();
