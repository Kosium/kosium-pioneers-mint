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
    ],
    name: "saleIsActive",
    outputs: [
        {
            name: '',
            type: 'bool'
        }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
    ],
    name: "presaleIsActive",
    outputs: [
        {
            name: '',
            type: 'bool'
        }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "whitelistedPresaleAddresses",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "presaleBoughtCounts",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "numMinted",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "numReserved",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MAX_PIONEERS",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MAX_PRESALE_PIONEERS",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "PIONEERS_RESERVED",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "maxPioneerPurchase",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "maxPioneerPurchasePresale",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "baseURI",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "pioneerPrice",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
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
      { gasLimit: "100000" }
    );

    // console.log('checking saleIsActive on network ', NETWORK);
    const result = await nftContract.methods
      .saleIsActive
      .call().call();
    //   .send({ from: OWNER_ADDRESS});
    console.log("Sale is active = " + result);
    // console.log("Minted presale pioneer. Result: " + JSON.stringify(result, null, 0));
    
    // console.log('checking presaleIsActive on network ', NETWORK);
    const result2 = await nftContract.methods
      .presaleIsActive
      .call().call();
    console.log("Presale is active = " + result2);

    let whitelistCheckAddress = '0xBc783c550303d37AaD44a877dfb59cf6ffCd7A0C';
    // console.log('checking if I am whitelisted on network ', NETWORK);
    const result3 = await nftContract.methods
      .whitelistedPresaleAddresses(whitelistCheckAddress).call();
    console.log("This address", whitelistCheckAddress, " is whitelisted = " + result3);// JSON.stringify(result3, null, 4));
    
    let whitelistBoughtAddress = whitelistCheckAddress;//OWNER_ADDRESS;//'0x444569AE8A0324b9B32b3aBdDDb98CcB13036Dd4';
    // console.log('checking how many this address bought: ', whitelistBoughtAddress, ' on NETWORK', NETWORK);
    const result4 = await nftContract.methods
      .presaleBoughtCounts(whitelistBoughtAddress).call();
    console.log("This address", whitelistBoughtAddress, " bought = " + result4);// JSON.stringify(result3, null, 4));
    
    // console.log('checking numReserved on network ', NETWORK);
    const result5 = await nftContract.methods
      .numReserved
      .call().call();
    console.log("numReserved = " + result5);
    
    // console.log('checking numMinted on network ', NETWORK);
    const result6 = await nftContract.methods
      .numMinted
      .call().call();
    console.log("numMinted = " + result6);
    
    // console.log('checking MAX_PIONEERS on network ', NETWORK);
    const result7 = await nftContract.methods
      .MAX_PIONEERS
      .call().call();
    console.log("MAX_PIONEERS = " + result7);
    
    // console.log('checking MAX_PRESALE_PIONEERS on network ', NETWORK);
    const result8 = await nftContract.methods
      .MAX_PRESALE_PIONEERS
      .call().call();
    console.log("MAX_PRESALE_PIONEERS = " + result8);
    
    // console.log('checking PIONEERS_RESERVED on network ', NETWORK);
    const result9 = await nftContract.methods
      .PIONEERS_RESERVED
      .call().call();
    console.log("PIONEERS_RESERVED = " + result9);
    
    const result10 = await nftContract.methods
      .maxPioneerPurchase
      .call().call();
    console.log("maxPioneerPurchase = " + result10);
    
    const result11 = await nftContract.methods
      .maxPioneerPurchasePresale
      .call().call();
    console.log("maxPioneerPurchasePresale = " + result11);
    
    const result12 = await nftContract.methods
      .baseURI
      .call().call();
    console.log("baseURI = " + result12);
    
    const result13 = await nftContract.methods
      .pioneerPrice
      .call().call();
    console.log("pioneerPrice = " + result13);
    
  } else {
    console.error(
      "Add NFT_CONTRACT_ADDRESS or FACTORY_CONTRACT_ADDRESS to the environment variables"
    );
  }
}

main();
