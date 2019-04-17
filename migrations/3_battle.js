const Battle = artifacts.require("./Battle.sol")
const Cards = artifacts.require("./Cards.sol")

module.exports = function(deployer, network, accounts) {

  deployer.then(async () => {

    console.log(`About to deploy Battle contract with player 1 and 2 addresses: ${accounts[1]}, ${accounts[2]}\nCards contract address ${Cards.address}`)
    await deployer.deploy(Battle, accounts[1], accounts[2], Cards.address, {from: accounts[0]})
    const battleContract = await Battle.deployed()

    console.log(`Battle contract address: ${battleContract.address}`)
  })
  .catch((err) => {
    console.log(`Error: ${err}`)
  })
};
