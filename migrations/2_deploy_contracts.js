const Pioneer = artifacts.require("./KosiumPioneer.sol");

// If you want to hardcode what deploys, comment out process.env.X and use
// true/false;
const DEPLOY_PIONEERS = process.env.DEPLOY_PIONEERS;
const MAX_PIONEERS = process.env.MAX_PIONEERS;

module.exports = async (deployer, network, addresses) => {
  if (DEPLOY_PIONEERS) {
    await deployer.deploy(Pioneer, MAX_PIONEERS, {gas: 5000000});
  }  
};
