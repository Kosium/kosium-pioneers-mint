const HDWalletProvider = require("@truffle/hdwallet-provider");
const PRIVATEKEY = process.env.PRIVATEKEY;

const NETWORK = process.env.NETWORK;
const USEPRIVATEKEY = NETWORK === "mainnet" || NETWORK === "live";
const MNEMONIC = process.env.MNEMONIC.replace(/["]+/g, '');;
const NODE_API_KEY = process.env.INFURA_KEY || process.env.ALCHEMY_KEY;
const isInfura = !!process.env.INFURA_KEY;

let getProvider = function(){
    if (!MNEMONIC || !NODE_API_KEY || !NETWORK || !USEPRIVATEKEY) {
        throw "Please set a mnemonic, Alchemy/Infura key, network, and useprivatekey bool.";
        return null;
    }
  
    const network = NETWORK === "mainnet" || NETWORK === "live" ? "mainnet" : "rinkeby";
  
    let providerUrl = isInfura
    ? "https://" + network + ".infura.io/v3/" + NODE_API_KEY
    : "https://eth-" + network + ".alchemyapi.io/v2/" + NODE_API_KEY;
  
    const provider = USEPRIVATEKEY ? 
    new HDWalletProvider({
      mnemonic: {phrase: MNEMONIC}, 
      providerOrUrl: providerUrl
    })
    :
    new HDWalletProvider([PRIVATEKEY], providerUrl);
    return provider;
}

exports.getProvider = getProvider;