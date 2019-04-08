const BattleContract = artifacts.require('Battle')
const cards = require('../scratch/extensions/cryptoBeasts/cards')

let battleContract
let firstPlayer

contract('Battle', async accounts => {

    const player1 = accounts[0]
    const player2 = accounts[1]

    before(async () => {
        battleContract = await BattleContract.deployed()
    })

    it('Validate deployed contract', async () => {
        assert.equal(await battleContract.player1.call(), player1)
        assert.equal(await battleContract.player2.call(), player2)
    })

    it('First card', async () => {
        let card = await battleContract.cards.call(0)
        console.log(`First case name: ${card.name}`)
        assert.equal(card.name, 'Donald Trump')
        assert.equal(card.initHealth, 950)
    })

    it('Player 1 picks their cards', async () => {
        desiredCards = [1, 3, 5, 7, 8]
        let result = await battleContract.pickPayerCards(desiredCards, { from: player1 })

        console.log(`Player 1 picked cards results: ${JSON.stringify(result)}`)
        
        assert.equal(result.tx.length, 66)

        assert.equal(await battleContract.getPlayersCurrentCardNumber(player1), 0)

        const firstCard = await battleContract.getPlayerCurrentCard(player1)
        console.log(`Card id of first card ${firstCard.cardId}, typeof ${typeof firstCard.cardId}`)
        assert.isTrue(desiredCards.includes(parseInt(firstCard.cardId)))

        assert.isFalse(await battleContract.cardsPicked.call())
    })

    it('Player 1 can not pick again', async () => {
        try {
            desiredCards = [11, 13, 15, 17, 18]
            await battleContract.pickPayerCards(desiredCards, { from: player1 })
        }
        catch (err) {
            assert.instanceOf(err, Error)
            assert.include(err.message, 'Player has already picked their cards')
        }
    })

    it('Player 2 picks their cards', async () => {
        desiredCards = [0, 2, 3, 5, 9]
        let result = await battleContract.pickPayerCards(desiredCards, { from: player2 })

        console.log(`Player 2 picked cards results: ${JSON.stringify(result)}`)

        assert.equal(result.tx.length, 66)

        assert.equal(await battleContract.getPlayersCurrentCardNumber(player2), 0)
        assert.isTrue(await battleContract.cardsPicked.call())

        // playersTurn is either player1 or player2
        firstPlayer = await battleContract.playersTurn.call()
        if (firstPlayer === player1) {
            secondPlayer = player2
        }
        else if  (firstPlayer === player2) {
            secondPlayer = player1
        }
        else {
            assert.fail(`first player ${firstPlayer} is not ${player1} or ${player2}`)
        }
        console.log(`First player: ${firstPlayer}`)
        assert.isTrue([player1, player2].includes(firstPlayer))

        const firstCard = await battleContract.getPlayerCurrentCard(player2)
        assert.isTrue(desiredCards.includes(parseInt(firstCard.cardId)))
    })

    it('Player 2 can not pick again', async () => {
        try {
            desiredCards = [11, 13, 15, 17, 18]
            await battleContract.pickPayerCards(desiredCards, { from: player2 })
        }
        catch (err) {
            assert.instanceOf(err, Error)
            assert.include(err.message, 'Player has already picked their cards')
        }
    })

    it('First player\'s first move is attack', async() => {

        const preAttackCard = await battleContract.getPlayerCurrentCard(firstPlayer)
        const preDefenceCard = await battleContract.getPlayerCurrentCard(secondPlayer)

        await battleContract.turn(0, { from: firstPlayer })

        assert.equal(await battleContract.playersTurn.call(), secondPlayer)

        // defence player's defence has gone down
        const postAttackCard = await battleContract.getPlayerCurrentCard(firstPlayer)
        const postDefenceCard = await battleContract.getPlayerCurrentCard(secondPlayer)

        const attackAmount = parseInt(preAttackCard.attack)
        validateAttack(attackAmount, preDefenceCard, postDefenceCard)

        // attacker mana has gone up
        assert.equal(parseInt(postAttackCard.mana), parseInt(preAttackCard.mana) + 1)
    })

    it('First player can not move again', async() => {

        try {
            await battleContract.turn(0, { from: firstPlayer })
        }
        catch (err) {
            assert.instanceOf(err, Error)
            assert.include(err.message, 'Not your turn')
        }

    })

    it('Second player\'s first move is attack', async() => {

        const preAttackCard = await battleContract.getPlayerCurrentCard(secondPlayer)
        const preDefenceCard = await battleContract.getPlayerCurrentCard(firstPlayer)

        await battleContract.turn(0, { from: secondPlayer })

        assert.equal(await battleContract.playersTurn.call(), firstPlayer)

        // defence player's defence has gone down
        const postAttackCard = await battleContract.getPlayerCurrentCard(secondPlayer)
        const postDefenceCard = await battleContract.getPlayerCurrentCard(firstPlayer)

        const attackAmount = parseInt(preAttackCard.attack)
        validateAttack(attackAmount, preDefenceCard, postDefenceCard)

        // attacker mana has gone up
        assert.equal(parseInt(postAttackCard.mana), parseInt(preAttackCard.mana) + 1)
    })

    it('First player\'s second move is special attack', async() => {

        const preAttackCard = await battleContract.getPlayerCurrentCard(firstPlayer)
        const preDefenceCard = await battleContract.getPlayerCurrentCard(secondPlayer)

        await battleContract.turn(1, { from: firstPlayer })

        assert.equal(await battleContract.playersTurn.call(), secondPlayer)

        // defence player's defence has gone down
        const postAttackCard = await battleContract.getPlayerCurrentCard(firstPlayer)
        const postDefenceCard = await battleContract.getPlayerCurrentCard(secondPlayer)

        const attackAmount = parseInt(preAttackCard.specialAttack)
        validateAttack(attackAmount, preDefenceCard, postDefenceCard)

        // attacker mana has not changed
        assert.equal(postAttackCard.mana, preAttackCard.mana)
    })

    it('Second player\'s second move is ability', async() => {

        const preAttackCard = await battleContract.getPlayerCurrentCard(secondPlayer)
        const preDefenceCard = await battleContract.getPlayerCurrentCard(firstPlayer)

        await battleContract.turn(2, { from: secondPlayer })

        assert.equal(await battleContract.playersTurn.call(), firstPlayer)

        // defence player's defence has gone down
        const postAttackCard = await battleContract.getPlayerCurrentCard(secondPlayer)
        const postDefenceCard = await battleContract.getPlayerCurrentCard(firstPlayer)

        // const attackAmount = parseInt(preAttackCard.specialAttack)
        // validateAttack(attackAmount, preDefenceCard, postDefenceCard)

        assert.equal(await battleContract.playersTurn.call(), firstPlayer)

        // attacker mana is plus 1 less the ability mana cost
        const newMana = parseInt(preAttackCard.mana) + 1 - parseInt(cards[parseInt(preAttackCard.cardId)].ability.mana)
        if (newMana >= 0) {
            assert.equal(parseInt(postAttackCard.mana), parseInt(preAttackCard.mana) + 1 - parseInt(cards[parseInt(preAttackCard.cardId)].ability.mana))
        }
        else {
            assert.equal(parseInt(postAttackCard.mana), 0)
        }
    })
})

function validateAttack(attackAmount, preDefenceCard, postDefenceCard) {
    if (parseInt(preDefenceCard.defence) < attackAmount) {
        assert.equal(parseInt(postDefenceCard.defence), 0)
        const remainingAttack = attackAmount - parseInt(postDefenceCard.defence)
        assert.equal(parseInt(postDefenceCard.health), parseInt(preDefenceCard.health) - remainingAttack)
    }
    else {
        assert.equal(parseInt(postDefenceCard.defence), parseInt(preDefenceCard.defence) - attackAmount)
    }
}