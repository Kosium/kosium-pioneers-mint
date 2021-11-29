const web3 = require("web3");
const NFT_CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS;
const OWNER_ADDRESS = process.env.OWNER_ADDRESS;

if (!MNEMONIC || !OWNER_ADDRESS) {
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
        name: "numberOfTokens",
        type: "uint256",
      },
    ],
    name: "mintPresalePioneer",
    outputs: [],
    payable: true,
    stateMutability: "payable",
    type: "function",
  },
];

async function main() {

  const web3Instance = new web3(provider);

  if (NFT_CONTRACT_ADDRESS) {
    const nftContract = new web3Instance.eth.Contract(
      NFT_ABI,
      NFT_CONTRACT_ADDRESS,
      { gasLimit: "300000" }
    );

    let numToMint = 1;
    // Pioneers issued directly to the owner.
    console.log('Minting ', numToMint, ' Pioneers. Please wait for confirmation.');
    const result = await nftContract.methods
      .mintPresalePioneer(numToMint)
      .send({ from: OWNER_ADDRESS, value: numToMint * 60000000000000000 });
    console.log("Minted presale pioneer. Transaction: " + result.transactionHash);
  } else {
    console.error(
      "Add NFT_CONTRACT_ADDRESS or FACTORY_CONTRACT_ADDRESS to the environment variables"
    );
  }
}

main();
