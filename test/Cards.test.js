const CardsContract = artifacts.require('Cards')
const cards = require('../scratch/extensions/cards')

let cardsContract

contract('Cards', async accounts => {

    before(async () => {
        cardsContract = await CardsContract.deployed()
    })

    it('First card using default getter', async () => {
        let card = await cardsContract.cards.call(0)
        console.log(`First case name: ${card.name}`)
        assert.equal(card.name, 'Donald Trump')
        assert.equal(card.initHealth, 950)
        assert.equal(card.initDefence, 390)
        assert.equal(card.initMana, 7)
        assert.equal(card.speed, 70)
        assert.equal(card.attack, 80)
        assert.equal(card.specialAttack, 140)
        assert.equal(card.ability.name, 'Build Wall')
        assert.equal(card.ability.manaCost, 8)
        assert.equal(card.ability.opponent.defence, 50)
        assert.equal(card.ability.player.defence, 250)
    })

    it('First card using explicit getter', async () => {
        let card = await cardsContract.getCard.call(0)
        console.log(`First case name: ${card.name}`)
        assert.equal(card.name, 'Donald Trump')
        assert.equal(card.initHealth, 950)
    })
})
