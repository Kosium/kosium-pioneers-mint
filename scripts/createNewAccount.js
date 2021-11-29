const web3 = require("web3");
const HDWalletProvider = require("@truffle/hdwallet-provider");

const ENTROPY = process.env.ENTROPY;
const NODE_API_KEY = process.env.ALCHEMY_KEY;

async function main() {
    const providerURL = "https://eth-mainnet.alchemyapi.io/v2/" + NODE_API_KEY;
    // const provider = new HDWalletProvider({
    //     providerOrUrl: providerURL
    // });
    const web3Instance = new web3(providerURL);
    console.log(web3Instance.eth.accounts.create([ENTROPY]));
}
main();

