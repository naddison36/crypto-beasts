const Battle = artifacts.require("./Battle.sol")

const cards = require('../scratch/extensions/cryptoBeasts/cards')
console.log(`Number of cards ${cards.length}`)

const player1 = '0x48118F98aD3aceF72Bc33D42C0E2fa3B16751d38'
const player2 = '0xFf33Eb72e6184E5102Fb9938Ff360c131835861D'

module.exports = function(deployer) {

  deployer.then(async () => {

    await deployer.deploy(Battle, player1, player2)
    const battleContract = await Battle.deployed()

    console.log(`Battle contract address: ${battleContract.address}`)

    let cardNumber = 0
    for (const card of cards) {
      const result = await battleContract.createCard({
        ...card,
        initHealth: card.health,
        initDefence: card.defence,
        initMana: card.mana,
      })

      console.log(`Card number ${++cardNumber} tx hash: ${JSON.stringify(result.tx)}`)
    }

    
  })
  .catch((err) => {
    console.log(`Error: ${err}`)
  })
};
