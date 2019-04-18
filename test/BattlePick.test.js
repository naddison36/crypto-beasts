const BattleContract = artifacts.require('BattlePick')
const cards = require('../scratch/extensions/cards')

let battleContract
let firstPlayer

contract('Battle with player pick', async accounts => {

    const player1 = accounts[1]
    const player2 = accounts[2]

    console.log(`Player 1 and 2 addresses ${player1} ${player2}`)

    before(async () => {
        battleContract = await BattleContract.deployed()
    })

    it('Validate players in deployed contract', async () => {
        assert.equal(await battleContract.player1.call(), player1)
        assert.equal(await battleContract.player2.call(), player2)
    })

    it('Player 1 picks their cards', async () => {
        desiredCards = [1, 3, 5, 7, 8]
        let result = await battleContract.pickPayerCards(desiredCards, { from: player1 })

        console.log(`Player 1 picked cards results: ${JSON.stringify(result)}`)
        
        assert.equal(result.tx.length, 66)

        assert.equal(await battleContract.getPlayersCurrentCardNumber(player1), 0)

        const firstCard = await battleContract.getPlayerCurrentCard(player1)
        console.log(`Card id of first card ${firstCard.cardId}, typeof ${typeof firstCard.cardId}`)
        assert.equal(firstCard.cardId, 1)

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
        assert.equal(firstCard.cardId, 0)
    })

    it('Player 2 can not pick again', async () => {


        // assert.throws(battleContract.pickPayerCards(desiredCards, { from: player2 }), /Player has already picked their cards/)
        try {
            desiredCards = [11, 13, 15, 17, 18]
            await battleContract.pickPayerCards(desiredCards, { from: player2 })
        }
        catch (err) {
            assert.instanceOf(err, Error)
            assert.include(err.message, 'Player has already picked their cards')
        }
    })

    it('First player tries special attack with not enough mana', async() => {

        try {
            await battleContract.turn(2, { from: firstPlayer })
        }
        catch (err) {
            assert.instanceOf(err, Error)
            assert.include(err.message, 'Not enough mana')
        }
    })

    it('First player\'s first move is attack', async() => {

        await battleContract.turn(0, { from: firstPlayer })

        assert.equal(await battleContract.playersTurn.call(), secondPlayer)

        const firstPlayerDeck = await battleContract.getPlayerDeck(firstPlayer)
        const secondPlayerDeck = await battleContract.getPlayerDeck(secondPlayer)

        assert.equal(firstPlayerDeck.currentCard, '0')
        assert.equal(firstPlayerDeck.playerCards[0].health, '900')
        assert.equal(firstPlayerDeck.playerCards[0].defence, '200')
        assert.equal(firstPlayerDeck.playerCards[0].mana, '8')  // 7 + 1
        assert.equal(firstPlayerDeck.playerCards[0].attack, '70')
        assert.equal(firstPlayerDeck.playerCards[0].specialAttack, '120')

        assert.equal(secondPlayerDeck.currentCard, '0')
        assert.equal(secondPlayerDeck.playerCards[0].health, '950')
        assert.equal(secondPlayerDeck.playerCards[0].defence, '320') // 390 - 70
        assert.equal(secondPlayerDeck.playerCards[0].mana, '7')
        assert.equal(secondPlayerDeck.playerCards[0].attack, '80')
        assert.equal(secondPlayerDeck.playerCards[0].specialAttack, '140')
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

    it('Second player\'s first move is special attack', async() => {

        await battleContract.turn(1, { from: secondPlayer })

        assert.equal(await battleContract.playersTurn.call(), firstPlayer)

        const firstPlayerDeck = await battleContract.getPlayerDeck(firstPlayer)
        const secondPlayerDeck = await battleContract.getPlayerDeck(secondPlayer)

        assert.equal(firstPlayerDeck.currentCard, '0')
        assert.equal(firstPlayerDeck.playerCards[0].health, '900')
        assert.equal(firstPlayerDeck.playerCards[0].defence, '60') // 200 - 140
        assert.equal(firstPlayerDeck.playerCards[0].mana, '8')
        assert.equal(firstPlayerDeck.playerCards[0].attack, '70')
        assert.equal(firstPlayerDeck.playerCards[0].specialAttack, '120')

        assert.equal(secondPlayerDeck.currentCard, '0')
        assert.equal(secondPlayerDeck.playerCards[0].health, '950')
        assert.equal(secondPlayerDeck.playerCards[0].defence, '320')
        assert.equal(secondPlayerDeck.playerCards[0].mana, '7')
        assert.equal(secondPlayerDeck.playerCards[0].attack, '80')
        assert.equal(secondPlayerDeck.playerCards[0].specialAttack, '140')
    })

    it('First player\'s second move is an attack', async() => {

        await battleContract.turn(0, { from: firstPlayer })

        assert.equal(await battleContract.playersTurn.call(), secondPlayer)

        const firstPlayerDeck = await battleContract.getPlayerDeck(firstPlayer)
        const secondPlayerDeck = await battleContract.getPlayerDeck(secondPlayer)

        assert.equal(firstPlayerDeck.currentCard, '0')
        assert.equal(firstPlayerDeck.playerCards[0].health, '900')
        assert.equal(firstPlayerDeck.playerCards[0].defence, '60')
        assert.equal(firstPlayerDeck.playerCards[0].mana, '9')  // 8 + 1
        assert.equal(firstPlayerDeck.playerCards[0].attack, '70')
        assert.equal(firstPlayerDeck.playerCards[0].specialAttack, '120')

        assert.equal(secondPlayerDeck.currentCard, '0')
        assert.equal(secondPlayerDeck.playerCards[0].health, '950')
        assert.equal(secondPlayerDeck.playerCards[0].defence, '250') // 320 - 70
        assert.equal(secondPlayerDeck.playerCards[0].mana, '7')
        assert.equal(secondPlayerDeck.playerCards[0].attack, '80')
        assert.equal(secondPlayerDeck.playerCards[0].specialAttack, '140')
    })

    it('Second player\'s second move is special attack', async() => {

        await battleContract.turn(1, { from: secondPlayer })

        assert.equal(await battleContract.playersTurn.call(), firstPlayer)

        const firstPlayerDeck = await battleContract.getPlayerDeck(firstPlayer)
        const secondPlayerDeck = await battleContract.getPlayerDeck(secondPlayer)

        assert.equal(firstPlayerDeck.currentCard, '0')
        assert.equal(firstPlayerDeck.playerCards[0].health, '820')  // 900 - 80
        assert.equal(firstPlayerDeck.playerCards[0].defence, '0')  // 60 - 140 = 80 remaining
        assert.equal(firstPlayerDeck.playerCards[0].mana, '9')
        assert.equal(firstPlayerDeck.playerCards[0].attack, '70')
        assert.equal(firstPlayerDeck.playerCards[0].specialAttack, '120')

        assert.equal(secondPlayerDeck.currentCard, '0')
        assert.equal(secondPlayerDeck.playerCards[0].health, '950')
        assert.equal(secondPlayerDeck.playerCards[0].defence, '250')
        assert.equal(secondPlayerDeck.playerCards[0].mana, '7')
        assert.equal(secondPlayerDeck.playerCards[0].attack, '80')
        assert.equal(secondPlayerDeck.playerCards[0].specialAttack, '140')
    })

    it('First player\'s third move is an ability', async() => {

        await battleContract.turn(2, { from: firstPlayer })

        assert.equal(await battleContract.playersTurn.call(), secondPlayer)

        const firstPlayerDeck = await battleContract.getPlayerDeck(firstPlayer)
        const secondPlayerDeck = await battleContract.getPlayerDeck(secondPlayer)

        assert.equal(firstPlayerDeck.currentCard, '0')
        assert.equal(firstPlayerDeck.playerCards[0].health, '820')
        assert.equal(firstPlayerDeck.playerCards[0].defence, '0')
        assert.equal(firstPlayerDeck.playerCards[0].mana, '0')  // 9 + 1 - 10
        assert.equal(firstPlayerDeck.playerCards[0].attack, '80')   // 70 + 10
        assert.equal(firstPlayerDeck.playerCards[0].specialAttack, '130')   // 120 + 10

        assert.equal(secondPlayerDeck.currentCard, '0')
        assert.equal(secondPlayerDeck.playerCards[0].health, '575') // 950 - 375
        assert.equal(secondPlayerDeck.playerCards[0].defence, '250')
        assert.equal(secondPlayerDeck.playerCards[0].mana, '7')
        assert.equal(secondPlayerDeck.playerCards[0].attack, '80')
        assert.equal(secondPlayerDeck.playerCards[0].specialAttack, '140')
    })

    it('Second player\'s third move is special attack', async() => {

        await battleContract.turn(1, { from: secondPlayer })

        assert.equal(await battleContract.playersTurn.call(), firstPlayer)

        const firstPlayerDeck = await battleContract.getPlayerDeck(firstPlayer)
        const secondPlayerDeck = await battleContract.getPlayerDeck(secondPlayer)

        assert.equal(firstPlayerDeck.currentCard, '0')
        assert.equal(firstPlayerDeck.playerCards[0].health, '680')  // 820 - 140
        assert.equal(firstPlayerDeck.playerCards[0].defence, '0')
        assert.equal(firstPlayerDeck.playerCards[0].mana, '0')
        assert.equal(firstPlayerDeck.playerCards[0].attack, '80')
        assert.equal(firstPlayerDeck.playerCards[0].specialAttack, '130')

        assert.equal(secondPlayerDeck.currentCard, '0')
        assert.equal(secondPlayerDeck.playerCards[0].health, '575')
        assert.equal(secondPlayerDeck.playerCards[0].defence, '250')
        assert.equal(secondPlayerDeck.playerCards[0].mana, '7')
        assert.equal(secondPlayerDeck.playerCards[0].attack, '80')
        assert.equal(secondPlayerDeck.playerCards[0].specialAttack, '140')
    })

    it('Round 4', async() => {
        await battleContract.turn(1, { from: firstPlayer })
        const secondPlayerDeck = await battleContract.getPlayerDeck(secondPlayer)
        assert.equal(secondPlayerDeck.playerCards[0].defence, '120') // 250 - 130

        await battleContract.turn(1, { from: secondPlayer })
        const firstPlayerDeck = await battleContract.getPlayerDeck(firstPlayer)
        assert.equal(firstPlayerDeck.playerCards[0].mana, '0')
        assert.equal(firstPlayerDeck.playerCards[0].health, '540')  // 680 - 140
    })

    it('Round 5', async() => {
        await battleContract.turn(1, { from: firstPlayer })
        const secondPlayerDeck = await battleContract.getPlayerDeck(secondPlayer)
        assert.equal(secondPlayerDeck.playerCards[0].defence, '0') // 120 - 130 = 10 remainder
        assert.equal(secondPlayerDeck.playerCards[0].health, '565') // 575 - 10

        await battleContract.turn(1, { from: secondPlayer })
        const firstPlayerDeck = await battleContract.getPlayerDeck(firstPlayer)
        assert.equal(firstPlayerDeck.playerCards[0].health, '400')  // 540 - 140
    })

    it('Round 6', async() => {
        await battleContract.turn(1, { from: firstPlayer })
        const secondPlayerDeck = await battleContract.getPlayerDeck(secondPlayer)
        assert.equal(secondPlayerDeck.playerCards[0].defence, '0')
        assert.equal(secondPlayerDeck.playerCards[0].health, '435') // 565 - 130

        await battleContract.turn(1, { from: secondPlayer })
        const firstPlayerDeck = await battleContract.getPlayerDeck(firstPlayer)
        assert.equal(firstPlayerDeck.playerCards[0].health, '260')  // 400 - 140
    })

    it('Round 7', async() => {
        await battleContract.turn(1, { from: firstPlayer })
        const secondPlayerDeck = await battleContract.getPlayerDeck(secondPlayer)
        assert.equal(secondPlayerDeck.playerCards[0].defence, '0')
        assert.equal(secondPlayerDeck.playerCards[0].health, '305') // 435 - 130
        assert.equal(secondPlayerDeck.currentCard, '0')

        await battleContract.turn(1, { from: secondPlayer })
        const firstPlayerDeck = await battleContract.getPlayerDeck(firstPlayer)
        assert.equal(firstPlayerDeck.playerCards[0].health, '120')  // 260 - 140
        assert.equal(firstPlayerDeck.currentCard, '0')

        assert.equal(firstPlayerDeck.playerCards[1].cardId, '3')
        assert.equal(firstPlayerDeck.playerCards[1].health, '850')
        assert.equal(firstPlayerDeck.playerCards[1].defence, '200')
        assert.equal(firstPlayerDeck.playerCards[1].mana, '7')
        assert.equal(firstPlayerDeck.playerCards[1].attack, '70')
        assert.equal(firstPlayerDeck.playerCards[1].specialAttack, '120')
    })

    it('Round 8', async() => {
        await battleContract.turn(1, { from: firstPlayer })
        const secondPlayerDeck = await battleContract.getPlayerDeck(secondPlayer)
        assert.equal(secondPlayerDeck.playerCards[0].defence, '0')
        assert.equal(secondPlayerDeck.playerCards[0].health, '175') // 305 - 130
        assert.equal(secondPlayerDeck.currentCard, '0')

        await battleContract.turn(1, { from: secondPlayer })
        const firstPlayerDeck = await battleContract.getPlayerDeck(firstPlayer)
        assert.equal(firstPlayerDeck.playerCards[0].health, '0')  // 120 - 140, remainder 20
        assert.equal(firstPlayerDeck.playerCards[1].defence, '180') // 200 - 20   
        assert.equal(firstPlayerDeck.currentCard, '1')
    })

    it('Round 9', async() => {
        await battleContract.turn(1, { from: firstPlayer })
        const secondPlayerDeck = await battleContract.getPlayerDeck(secondPlayer)
        assert.equal(secondPlayerDeck.playerCards[0].defence, '0')
        assert.equal(secondPlayerDeck.playerCards[0].health, '55') // 175 - 120
        assert.equal(secondPlayerDeck.currentCard, '0')

        assert.equal(secondPlayerDeck.playerCards[1].cardId, '2')
        assert.equal(secondPlayerDeck.playerCards[1].health, '900')
        assert.equal(secondPlayerDeck.playerCards[1].defence, '200')
        assert.equal(secondPlayerDeck.playerCards[1].mana, '5')
        assert.equal(secondPlayerDeck.playerCards[1].attack, '70')
        assert.equal(secondPlayerDeck.playerCards[1].specialAttack, '120')

        await battleContract.turn(1, { from: secondPlayer })
        const firstPlayerDeck = await battleContract.getPlayerDeck(firstPlayer)
        assert.equal(firstPlayerDeck.playerCards[1].defence, '40') // 180 - 140
        assert.equal(firstPlayerDeck.playerCards[1].health, '850')
        assert.equal(firstPlayerDeck.currentCard, '1')
    })

    it('Round 10', async() => {
        await battleContract.turn(1, { from: firstPlayer })
        let secondPlayerDeck = await battleContract.getPlayerDeck(secondPlayer)
        assert.equal(secondPlayerDeck.playerCards[0].defence, '0')
        assert.equal(secondPlayerDeck.playerCards[0].health, '0') // 55 - 120, remainder 65
        assert.equal(secondPlayerDeck.playerCards[1].defence, '135')  // 200 - 65
        assert.equal(secondPlayerDeck.playerCards[1].mana, '5')
        assert.equal(secondPlayerDeck.currentCard, '1')

        await battleContract.turn(0, { from: secondPlayer })
        const firstPlayerDeck = await battleContract.getPlayerDeck(firstPlayer)
        assert.equal(firstPlayerDeck.playerCards[1].defence, '0')  // 40 - 70 = -30
        assert.equal(firstPlayerDeck.playerCards[1].health, '820')  // 850 - 30
        assert.equal(firstPlayerDeck.currentCard, '1')

        secondPlayerDeck = await battleContract.getPlayerDeck(secondPlayer)
        assert.equal(secondPlayerDeck.playerCards[1].mana, '6') // 5 + 1
    })

    it('Round 11', async() => {
        await battleContract.turn(2, { from: firstPlayer })
        let secondPlayerDeck = await battleContract.getPlayerDeck(secondPlayer)
        assert.equal(secondPlayerDeck.playerCards[1].health, '750') // 900 - 150

        let firstPlayerDeck = await battleContract.getPlayerDeck(firstPlayer)
        assert.equal(firstPlayerDeck.playerCards[1].mana, '3')  // 7 + 1 - 5

        await battleContract.turn(0, { from: secondPlayer })
        firstPlayerDeck = await battleContract.getPlayerDeck(firstPlayer)
        assert.equal(firstPlayerDeck.playerCards[1].health, '750')  // 820 - 70

        secondPlayerDeck = await battleContract.getPlayerDeck(secondPlayer)
        assert.equal(secondPlayerDeck.playerCards[1].mana, '7') // 6 + 1
    })
})
