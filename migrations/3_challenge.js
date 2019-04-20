const Challenge = artifacts.require("./Challenge.sol")

module.exports = function(deployer, network, accounts) {

  deployer.then(async () => {

    console.log(`About to deploy Challenge contract`)
    await deployer.deploy(Challenge, {from: accounts[0]})
    const challengeContract = await Challenge.deployed()

    console.log(`Challenge contract address: ${challengeContract.address}`)

  })
  .catch((err) => {
    console.log(`Error: ${err}`)
  })
};
