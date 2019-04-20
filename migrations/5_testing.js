const Testing = artifacts.require("./Testing.sol")

module.exports = function(deployer, network, accounts) {

  deployer.then(async () => {

    console.log(`About to deploy Testing contract`)
    await deployer.deploy(Testing, {from: accounts[0]})
    const testingContract = await Testing.deployed()

    console.log(`Testing contract address: ${testingContract.address}`)
  })
  .catch((err) => {
    console.log(`Error: ${err}`)
  })
};
