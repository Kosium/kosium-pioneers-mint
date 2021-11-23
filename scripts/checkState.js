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
    constant: false,
    inputs: [
        {
            name: 'tokenId',
            type: 'uint256'
        }
    ],
    name: "tokenURI",
    outputs: [
        {
            name: '',
            type: 'string'
        }
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
    ],
    name: "totalSupply",
    outputs: [
        {
            name: '',
            type: 'uint256'
        }
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
        {
            name: "owner",
            type: 'address'
        },
        {
            name: 'index',
            type: 'uint256'
        }
    ],
    name: "tokenOfOwnerByIndex",
    outputs: [
        {
            name: '',
            type: 'uint256'
        }
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
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
      { gasLimit: "1000000" }
    );

    const result = await nftContract.methods
      .saleIsActive
      .call().call();
    //   .send({ from: OWNER_ADDRESS});
    console.log("Sale is active = " + result);
    // console.log("Minted presale pioneer. Result: " + JSON.stringify(result, null, 0));
    
    const result2 = await nftContract.methods
      .presaleIsActive
      .call().call();
    console.log("Presale is active = " + result2);
    
    // const result3 = await nftContract.methods
    //   .tokenURI(3)
    //   .call({ from: OWNER_ADDRESS });
    // console.log("Token 0 uri = " + result3);
    
    const result4 = await nftContract.methods
      .totalSupply()
      .call({ from: OWNER_ADDRESS });
    console.log("Total supply = " + result4);
    
    // const result5 = await nftContract.methods
    //   .tokenOfOwnerByIndex(OWNER_ADDRESS, 5)
    //   .call({ from: OWNER_ADDRESS });
    // console.log("tokenId 6th token owned by me indexed = " + result5);
  } else {
    console.error(
      "Add NFT_CONTRACT_ADDRESS or FACTORY_CONTRACT_ADDRESS to the environment variables"
    );
  }
}

main();
