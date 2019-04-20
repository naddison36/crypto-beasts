const Testing = require('../Testing')

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

describe('Testing', () => {

    let testing

    beforeAll(() => {
        testing = new Testing(playerKeys[0].private)
    })

    test('Connect', () => {
        expect(testing.contract).toBeDefined()
    })

    test('deploy', async () => {
        const contractAddress = await testing.deploy()

        console.log(`Deployed contract address is ${contractAddress}`)
        expect(contractAddress).toMatch(/^0x([A-Fa-f0-9]{40})$/)
    })

    test('First toggle', async () => {
        await testing.toggleFail()
    })

    test('Second toggle', async () => {
        try {
            await testing.toggleFail()
        }
        catch (err) {
            expect(err).toBeInstanceOf(Error)
        }
    })

    test('Third toggle', async () => {
        await testing.toggleFail()
    })

    test('1st failed require', async () => {

        expect.assertions(1)

        try {
            await testing.failRequire()
        }
        catch (err) {
            expect(err).toBeInstanceOf(Error)
        }
    })

    test('Increment', async () => {

        const counter = await testing.increment()
        expect(counter).toEqual(1)
    })

    test('Increment', async () => {

        const counter = await testing.increment()
        expect(counter).toEqual(2)
    })
})