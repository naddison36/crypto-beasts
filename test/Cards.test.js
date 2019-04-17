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
    })

    it('First card using explicit getter', async () => {
        let card = await cardsContract.getCard.call(0)
        console.log(`First case name: ${card.name}`)
        assert.equal(card.name, 'Donald Trump')
        assert.equal(card.initHealth, 950)
    })
})
