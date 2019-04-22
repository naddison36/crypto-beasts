const Challenge = require('../Challenge')
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

describe('Challenge', () => {

    let challenge

    beforeAll(() => {
        challenge = new Challenge(playerKeys[0].private)
    })

    afterAll(() => {
        challenge.client.disconnect()
    })

    test('Connect', () => {
        expect(challenge.contract).toBeDefined()
    })

    test('deploy', async () => {
        const contractAddress = await challenge.deploy()

        console.log(`Deployed contract address is ${contractAddress}`)
        // expect(contractAddress).toMatch(regEx.ethereumAddress)
        expect(contractAddress).toMatch(/^0x([A-Fa-f0-9]{40})$/)
    })

    test('Player 1 challenges anyone', async () => {

        expect(await challenge.challenger()).toEqual("0x0000000000000000000000000000000000000000")
        const challenger = await challenge.challenge()
        expect(challenger).toBeUndefined()
        expect(await challenge.challenger()).toEqual(playerKeys[0].address)
    })

    test('Player 1 challenges anyone again', async () => {

        expect.assertions(2)

        try {
            await challenge.challenge()
        }
        catch (err) {
            expect(err).toBeInstanceOf(Error)
            expect(await challenge.challenger()).toEqual(playerKeys[0].address)
        }
    })

    test('Player 2 challenges accepting by player 1\'s challenge', async () => {

        challenge.addAccount(playerKeys[1].private)

        const challenger = await challenge.challenge(playerKeys[1].address)

        expect(challenger).toEqual(playerKeys[0].address)
        expect(await challenge.challenger()).toEqual("0x0000000000000000000000000000000000000000")
    })

    test('Player 1 challenges anyone again', async () => {

        const challenger = await challenge.challenge()
        expect(challenger).toBeUndefined()
        expect(await challenge.challenger()).toEqual(playerKeys[0].address)
    })

    // test('Player 3 challenges anyone', async () => {

    //     challenge.addAccount(playerKeys[2].private)

    //     const challenger = await challenge.anyone(playerKeys[2].address)
        
    //     expect(challenger).toEqual(playerKeys[0].address)
    //     expect(await challenge.isChallenging(playerKeys[0].address)).toBeFalsy()
    //     expect(await challenge.isChallenging(playerKeys[2].address)).toBeFalsy()
    // })

    // test('Player 2 challenges anyone', async () => {
    //     expect(await challenge.isChallenging(playerKeys[1].address)).toBeFalsy()
    //     await challenge.anyone()
    //     expect(await challenge.isChallenging(playerKeys[1].address)).toBeTruthy()
    // })
})