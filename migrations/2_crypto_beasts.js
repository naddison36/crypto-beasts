const Battle = artifacts.require("./Battle.sol")

const cards = require('../scratch/extensions/cryptoBeasts/cards')
console.log(`Number of cards ${cards.length}`)

module.exports = function(deployer, network, accounts) {

  deployer.then(async () => {

    await deployer.deploy(Battle, accounts[0], accounts[1])
    const battleContract = await Battle.deployed()

    console.log(`Battle contract address: ${battleContract.address}`)

    let cardNumber = 0
    for (const card of cards) {

      if (!card.ability) {
        card.ability = {}
      }
      if (!card.opponent) {
        card.ability.opponent = {}
      }
      if (!card.player) {
        card.ability.player = {}
      }

      const result = await battleContract.createCard({
        ...card,
        ability: {
          name: card.ability.name,
          opponent: {
            health: card.ability.opponent.health || 0,
            defence: card.ability.opponent.defence || 0,
            mana: card.ability.opponent.mana || 0,
            attack: card.ability.opponent.attack || 0,
            specialAttack: card.ability.opponent.specialAttack || 0,
          },
          player: {
            health: card.ability.player.health || 0,
            defence: card.ability.player.defence || 0,
            mana: card.ability.player.mana || 0,
            attack: card.ability.player.attack || 0,
            specialAttack: card.ability.player.specialAttack || 0,
          },
          manaCost: card.ability.mana,
        },
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
