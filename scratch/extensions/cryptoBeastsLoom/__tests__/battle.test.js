
const { CryptoUtils } = require('loom-js')

const BattleRandom = require('../BattleRandom')
// const regEx = require('../../regEx')

var log = require('minilog').enable()

// For testing
const playerKeys = [
    {
        private: 'GW2bUAzSIU+6vxHGWNTR8lej8xO1l83j9z6Ymkan/5BDP54ZI2SPdLYobPl5DNiDYvKmwZm+Y4xGlZ83W3Katg==',
        address: '0xc312d8b4BC313Dc6E8bacbB7d9222F96614d2C12',
    },
    {
        private: 'yni6McaSX/H3c4YSwwUyucsaFtDudrO4rWl0xHDx90FIO0nOXfSibeIptmRthiS4EcDYFHOlgCUcYEq2Cen3mQ==',
        address: '0xA4AAf6C3762E1635Fb4D3e6Fd606D3Fe62830B5D',
    },
    {
        private: 'qH5oDAPUi2pEu5vGCPoRmbuRk4IhWl4dFA0dpnc2Fo+bGAHYnBPuzmTYBgTYHiV/hcrwOPCFAObdIbXId7831g==',
        address: '0x9F66b280e22eB0D92cbDF04d89463c9a0F72fa61',
    },
]

describe('Battle with random pick', () => {

    let battle
    let myPlayerDeck
    let opponentDeck

    beforeAll(() => {
        myPlayerBattle = new BattleRandom(playerKeys[1].private)
    })

    test('Connect', () => {
        expect(myPlayerBattle.contract).toBeDefined()
    })

    test('deploy', async () => {
        const contractAddress = await myPlayerBattle.deploy(playerKeys[2].address)

        console.log(`Deployed contract address is ${contractAddress}`)
        // expect(contractAddress).toMatch(regEx.ethereumAddress)
        expect(contractAddress).toMatch(/^0x([A-Fa-f0-9]{40})$/)

        opponentBattle = new BattleRandom(playerKeys[2].private, contractAddress)
    })

    test('get player 1', async() => {
        const result = await myPlayerBattle.getPlayer1()

        console.log(`Player 1: ${result}`)

        expect(result).toEqual(playerKeys[1].address)
    })

    test('get player 2', async() => {
        const result = await myPlayerBattle.getPlayer2()

        console.log(`Player 2: ${result}`)

        expect(result).toEqual(playerKeys[2].address)
    })

    // test('test first player deck before pick', async () => {
    //     expect.assertions(1)

    //     try {
    //         await myPlayerBattle.getPlayerDeck(playerKeys[1].address)
    //     }
    //     catch (err) {
    //         expect(err).toBeInstanceOf(Error)
    //     }
    // })

    test('my player picks cards', async () => {

        const desiredCards = [1, 3, 5, 6, 8]
        console.log(`About to pick cards ${JSON.stringify(desiredCards)} for my player`)

        const playerDeck = await myPlayerBattle.pickPayerCards(desiredCards)

        console.log(`My player deck: ${JSON.stringify(playerDeck, null, 2)}`)

        expect(playerDeck).toBeDefined()
        expect(playerDeck).toHaveLength(3)
        expect(playerDeck[0]).toBeGreaterThanOrEqual(0)
        expect(playerDeck[1]).toBeGreaterThanOrEqual(0)
        expect(playerDeck[2]).toBeGreaterThanOrEqual(0)

        myPlayerDeck = playerDeck
    })

    test('test first player deck after pick', async () => {
        const playerDeck = await myPlayerBattle.getPlayerDeck(playerKeys[1].address)

        console.log(`Deck of player 1: ${JSON.stringify(playerDeck, null, 2)}`)

        expect(playerDeck).toBeDefined()
        expect(playerDeck.currentCard).toEqual(0)
        expect(playerDeck.playerCards).toHaveLength(3)
        expect(playerDeck.playerCards[0].cardId).toEqual(myPlayerDeck[0])
        expect(playerDeck.playerCards[1].cardId).toEqual(myPlayerDeck[1])
        expect(playerDeck.playerCards[2].cardId).toEqual(myPlayerDeck[2])
    })

    test('opponent player picks cards', async () => {

        const desiredCards = [0, 2, 4, 10, 11]
        console.log(`About to pick cards ${JSON.stringify(desiredCards)} for my player`)

        const playerDeck = await opponentBattle.pickPayerCards(desiredCards)

        console.log(`My player deck: ${JSON.stringify(playerDeck, null, 2)}`)

        expect(playerDeck).toBeDefined()
        expect(playerDeck).toHaveLength(3)
        expect(playerDeck[0]).toBeGreaterThanOrEqual(0)
        expect(playerDeck[1]).toBeGreaterThanOrEqual(0)
        expect(playerDeck[2]).toBeGreaterThanOrEqual(0)

        opponentDeck = playerDeck
    })

    // test('First turn', async () => {
    //     const result = await myPlayerBattle.turn(1)

    //     expect(result).toBeDefined()
    // })

    test('wait', (done) => {
        setTimeout(done, 1000)
    })
})