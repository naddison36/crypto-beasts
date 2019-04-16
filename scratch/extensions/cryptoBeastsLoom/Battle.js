const Web3 = require('web3')
const { Client, CryptoUtils, LoomProvider } = require('loom-js')

var log = require('minilog')('cryptoBeasts')

const cards = require('../cards')
// const regEx = require('../regEx')
const BattleABI = require('../Battle.json')
const network = 13654820909954

const clientConfig = [
    'default',
    'ws://127.0.0.1:46658/websocket',
    'ws://127.0.0.1:46658/queryws',
]

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

class Battle {

    constructor(myPlayerPrivateKey, oppositionPlayerPrivateKey) {

        // TODO validate the Base64 private keys

        // TODO derive the addresses from the private keys
        myPlayerPrivateKey = playerKeys[1].private
        oppositionPlayerPrivateKey = playerKeys[2].private
        this.myPlayer = playerKeys[1].address
        this.oppositionPlayer = playerKeys[2].address

        this.contractAddress = BattleABI.networks[network].address

        log.debug(`About to connect to local Loom`)

        const client = new Client(...clientConfig)  

        const loomProvider = new LoomProvider(client, CryptoUtils.B64ToUint8Array(playerKeys[0].private))
        loomProvider.addAccounts([
            CryptoUtils.B64ToUint8Array(myPlayerPrivateKey),
            CryptoUtils.B64ToUint8Array(oppositionPlayerPrivateKey)])
        const web3 = new Web3(loomProvider)
    
        this.contract = new web3.eth.Contract(BattleABI.abi, this.contractAddress, {from: this.myPlayer})

        log.debug(`Battle contract address is ${BattleABI.networks[network].address}`)
    }

    async deploy() {
        const contractInstance = await this.contract.deploy({
            data: BattleABI.deployedBytecode,
            arguments: [this.myPlayer, this.oppositionPlayer],
        }).send({
            from: playerKeys[0].address,
        })
        
        return contractInstance.options.address
    }

    async getCard(cardId) {
        return await this.contract.methods.cards(cardId).call()
    }

    async getPlayerDeck(player) {
        return await this.contract.methods.playerDecks(player).call()
    }

    async getPlayer1() {
        return await this.contract.methods.player1().call()
    }

    async getPlayer2() {
        return await this.contract.methods.player2().call()
    }

    async getWinningPlayer() {
        return await this.contract.methods.winningPlayer().call()
    }

    async pickPayerCards(desiredCards) {

        log.debug(`About to call pickPayerCards with arg ${JSON.stringify(desiredCards)}, signed by ${this.myPlayer}`)

        const tx = await this.contract.methods
        .pickPayerCards(desiredCards)
        .send({from: this.myPlayer})

        const pickedCardsStr = tx.events.PickPayerCards.returnValues.pickedCards
        const pickedCardsInt = pickedCardsStr.map(x => parseInt(x))

        log.info(`Got tx receipt for player ${this.myPlayer} picking cards ${JSON.stringify(pickedCardsInt)}`)

        return pickedCardsInt
    }

    async turn(move) {
        log.debug(`About to move ${move}, signed by ${this.myPlayer}`)

        const tx = await this.contract.methods
        .turn(move)
        .send({from: this.myPlayer})

        const turnEvent = tx.events.PickPayerCards.returnValues.Turn

        log.info(`Got turn event for player ${this.myPlayer}  ${JSON.stringify(turnEvent)}`)

        return pickedCardsInt
    }
}

module.exports = Battle