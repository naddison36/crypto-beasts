const BattleContract = artifacts.require('Battle')

let battleContract

contract('Pick cards test', async accounts => {

    before(async () => {
        battleContract = await BattleContract.deployed()
    })

    it('First card', async () => {
        let card = await battleContract.cards.call(0)
        console.log(`First case name: ${card.name}`)
        assert.equal(card.name, 'Donald Trump')
        assert.equal(card.initHealth, 950)
    })

    it('Player 1 picks their cards', async () => {
        desiredCards = [1, 3, 5, 7, 8]
        let result = await battleContract.pickPayerCards(desiredCards, { from: accounts[0] })

        assert.equal(result.tx.length, 66)
        assert.equal(await battleContract.currentCardPlayer1.call(), 0)
        assert.isFalse(await battleContract.cardsPicked.call())

        const firstCard = await battleContract.player1Cards.call(0)
        console.log(`Card id of first card ${firstCard.cardId} ${typeof firstCard.cardId}`)
        assert.isTrue(desiredCards.includes(firstCard.cardId.toNumber()))

        console.log(`Player 1 picked cards results: ${JSON.stringify(result)}`)
    })

    it('Player 1 can not pick again', async () => {
        try {
            desiredCards = [11, 13, 15, 17, 18]
            await battleContract.pickPayerCards(desiredCards, { from: accounts[0] })
        }
        catch (err) {
            assert.instanceOf(err, Error)
            assert.include(err.message, 'Player 1 has already picked their card')
        }
    })

    it('Player 2 picks their cards', async () => {
        desiredCards = [0, 2, 3, 5, 9]
        let result = await battleContract.pickPayerCards(desiredCards, { from: accounts[1] })

        assert.equal(result.tx.length, 66)
        assert.equal(await battleContract.currentCardPlayer2.call(), 0)
        assert.isTrue(await battleContract.cardsPicked.call())

        const firstCard = await battleContract.player2Cards.call(0)
        assert.isTrue(desiredCards.includes(firstCard.cardId.toNumber()))

        console.log(`Player 2 picked cards results: ${JSON.stringify(result)}`)
    })

    it('Player 2 can not pick again', async () => {
        try {
            desiredCards = [11, 13, 15, 17, 18]
            await battleContract.pickPayerCards(desiredCards, { from: accounts[1] })
        }
        catch (err) {
            assert.instanceOf(err, Error)
            assert.include(err.message, 'Player 2 has already picked their card')
        }
    })
})