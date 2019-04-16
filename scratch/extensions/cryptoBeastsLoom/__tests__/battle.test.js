
const Battle = require('../Battle')

var log = require('minilog').enable()

const player1 = '0xA4AAf6C3762E1635Fb4D3e6Fd606D3Fe62830B5D'
const player2 = '0x9F66b280e22eB0D92cbDF04d89463c9a0F72fa61'

describe('Battle', () => {

    let battle

    beforeAll(() => {
        battle = new Battle(player1, player2)
    })

    test('Connect', () => {
        expect(battle.contract).toBeDefined()
    })

    // test('deploy', async () => {
    //     const contractAddress = await battle.deploy()

    //     console.log(`Deployed contract address is ${contractAddress}`)
    //     expect(contractAddress).toMatch(RegExp.ethereumAddress)
    // })

    test('get player 1', async() => {
        const result = await battle.getPlayer1()

        console.log(`Player 1: ${result}`)

        expect(result).toEqual(player1)
    })

    test('get player 2', async() => {
        const result = await battle.getPlayer2()

        console.log(`Player 2: ${result}`)

        expect(result).toEqual(player2)
    })

    test('get first card', async() => {
        const card = await battle.getCard(0)

        console.log(`Card 1: ${JSON.stringify(card, null, 2)}`)

        expect(card).toBeDefined()
        expect(card.name).toEqual('Donald Trump')
        expect(card.initHealth).toEqual("950")
    })

    test('get second card', async() => {
        const card = await battle.getCard(1)

        console.log(`Card 2: ${JSON.stringify(card, null, 2)}`)

        expect(card).toBeDefined()
        expect(card.name).toEqual('Electro')
        expect(card.initHealth).toEqual("900")
    })

    test('test first player empty deck', async () => {
        const deck = await battle.getPlayerDeck(player1)

        console.log(`Deck of player 1: ${JSON.stringify(deck, null, 2)}`)

        expect(deck).toBeDefined()
    })

    test('my player picks cards', async () => {

        const desiredCards = [1, 3, 5, 6, 8]
        console.log(`About to pick cards ${JSON.stringify(desiredCards)} for my player`)

        const playerDeck = await battle.pickPayerCards(desiredCards)

        console.log(`My player deck: ${JSON.stringify(playerDeck, null, 2)}`)

        expect(playerDeck).toBeDefined()
        expect(playerDeck).toHaveLength(3)
        expect(playerDeck[0]).toBeGreaterThanOrEqual(0)
        expect(playerDeck[1]).toBeGreaterThanOrEqual(0)
        expect(playerDeck[2]).toBeGreaterThanOrEqual(0)
    })

    test('wait', (done) => {
        setTimeout(done, 1000)
    })
})