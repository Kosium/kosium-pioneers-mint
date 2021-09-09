const Pioneer = artifacts.require("./KosiumPioneer.sol");

// If you want to hardcode what deploys, comment out process.env.X and use
// true/false;
const DEPLOY_PIONEERS = process.env.DEPLOY_PIONEERS;

module.exports = async (deployer, network, addresses) => {
  // OpenSea proxy registry addresses for rinkeby and mainnet.
  let proxyRegistryAddress = "";
  if (network === 'rinkeby') {
    proxyRegistryAddress = "0xf57b2c51ded3a29e6891aba85459d600256cf317";
  } else {
    proxyRegistryAddress = "0xa5409ec958c83c3f309868babaca7c86dcb077c1";
  }

  if (DEPLOY_PIONEERS) {
    await deployer.deploy(Pioneer, proxyRegistryAddress, {gas: 5000000});
  }  
};
