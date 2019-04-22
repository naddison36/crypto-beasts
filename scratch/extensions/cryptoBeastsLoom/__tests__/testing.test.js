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
    let testSender

    beforeAll(() => {
        testing = new Testing(playerKeys[0].private)
    })

    afterAll(() => {
        testing.client.disconnect()
    })

    test('Connect', () => {
        expect(testing.contract).toBeDefined()
    })

    test('deploy', async () => {
        const contractAddress = await testing.deploy()

        console.log(`Deployed contract address is ${contractAddress}`)
        expect(contractAddress).toMatch(/^0x([A-Fa-f0-9]{40})$/)

        expect(await testing.fail()).toBeFalsy();
    })

    test('Create test account', () => {
        testSender = testing.addAccount()
    })

    test('First tx success', async () => {
        // expect(await testing.client.getAccountNonceAsync({account: testSender})).toEqual(0)
        // expect(await testing.client.getNonceAsync(testSender)).toEqual(0)
        await testing.testTx(testSender)
        // expect(await testing.client.getAccountNonceAsync({account: testSender})).toEqual(1)
    })

    test('Set test tx to fail', async () => {
        await testing.setFail(true)
        expect(await testing.fail()).toBeTruthy();
    })

    test('Second tx to fail', async () => {

        expect.assertions(1)

        try {
            await testing.testTx(testSender)
        }
        catch (err) {
            expect(err).toBeInstanceOf(Error)
        }
    })

    test('Set test tx to succeed', async () => {
        await testing.setFail(false)
        expect(await testing.fail()).toBeFalsy();
    })

    // test('Third tx success', async () => {
    //     await testing.testTx(testSender)
    // })

    // test('Retry third tx success', async () => {
    //     await testing.testTx(testSender)
    // })
})