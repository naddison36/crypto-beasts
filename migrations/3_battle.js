const BattlePick = artifacts.require("./BattlePick.sol")
const BattleRandom = artifacts.require("./BattleRandom.sol")
const Cards = artifacts.require("./Cards.sol")

module.exports = function(deployer, network, accounts) {

  deployer.then(async () => {

    console.log(`About to deploy Battle with player pick contract with player 1 and 2 addresses: ${accounts[1]}, ${accounts[2]}\nCards contract address ${Cards.address}`)
    await deployer.deploy(BattlePick, accounts[1], accounts[2], Cards.address, {from: accounts[0]})
    const battlePickContract = await BattlePick.deployed()

    console.log(`Battle with player pick contract address: ${battlePickContract.address}`)

    console.log(`About to deploy Battle with random player pick contract with player 1 and 2 addresses: ${accounts[1]}, ${accounts[2]}\nCards contract address ${Cards.address}`)
    await deployer.deploy(BattleRandom, accounts[1], accounts[2], Cards.address, {from: accounts[0]})
    const battleRandomContract = await BattleRandom.deployed()

    console.log(`Battle with random player pick contract address: ${battleRandomContract.address}`)
  })
  .catch((err) => {
    console.log(`Error: ${err}`)
  })
};
