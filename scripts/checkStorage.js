const web3 = require("web3");
const NODE_API_KEY = process.env.INFURA_KEY || process.env.ALCHEMY_KEY;
const isInfura = !!process.env.INFURA_KEY;
const NFT_CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS;
const OWNER_ADDRESS = process.env.OWNER_ADDRESS;
const NETWORK = process.env.NETWORK;

if (!NODE_API_KEY || !OWNER_ADDRESS || !NETWORK) {
  console.error(
    "Please set a mnemonic, Alchemy/Infura key, owner, network, and contract address."
  );
  return;
}
let NFT_ABI = {};

async function main() {
    const network = NETWORK === "mainnet" || NETWORK === "live" ? "mainnet" : "rinkeby";
    let providerOrUrl = isInfura
      ? "https://" + network + ".infura.io/v3/" + NODE_API_KEY
      : "https://eth-" + network + ".alchemyapi.io/v2/" + NODE_API_KEY
      
    const web3Instance = new web3(providerOrUrl);
  
    if (NFT_CONTRACT_ADDRESS) {      
        for (let i = 0; i < 5; ++i){
            let variableIndex = 2;
            let tokenId = i;
            let newKey = web3.utils.soliditySha3({type:"uint", value:tokenId}, {type:"uint", value:variableIndex});
            let storage = await web3Instance.eth.getStorageAt(NFT_CONTRACT_ADDRESS, newKey);
            let address = storage.substring(26);
            console.log(address);
        }
    }
}


main();