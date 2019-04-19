const Web3 = require('web3')
const { Client, CryptoUtils, LocalAddress, LoomProvider } = require('loom-js')

var log = require('minilog')('cryptoBeasts')

const cards = require('../cards')
// const regEx = require('../regEx')
const BattleContract = require('../contracts/BattleRandom.json')
const CardsContract = require('../contracts/Cards.json')

const clientConfig = [
    'default',
    'ws://127.0.0.1:46658/websocket',
    'ws://127.0.0.1:46658/queryws',
]
const network = 13654820909954

class Battle {

    constructor(myPlayerPrivateKeyBase64, battleContractAddress) {

        let myPlayerPrivateKey

        if (!myPlayerPrivateKeyBase64) {
            log.debug(`No private key passed for my player so generating one`)
            myPlayerPrivateKey = CryptoUtils.generatePrivateKey()
        }
        else {
            myPlayerPrivateKey = CryptoUtils.B64ToUint8Array(myPlayerPrivateKeyBase64)
        }

        const myPlayerPublicKey = CryptoUtils.publicKeyFromPrivateKey(myPlayerPrivateKey)
        this.myPlayer = LocalAddress.fromPublicKey(myPlayerPublicKey).toString()
        log.info(`My player address ${this.myPlayer}`)

        log.debug(`About to connect to local Loom`)

        const client = new Client(...clientConfig)  

        const loomProvider = new LoomProvider(client, myPlayerPrivateKey)
        const web3 = new Web3(loomProvider)

        if (!battleContractAddress) {
            battleContractAddress = BattleContract.networks[network].address
        }
    
        this.contract = new web3.eth.Contract(BattleContract.abi, battleContractAddress, {from: this.myPlayer})

        log.debug(`Battle contract address is ${this.contract.options.address}`)
    }

    deploy(opponentPlayer) {

        return new Promise((resolve, reject) => {
            log.debug(`About to deploy battle contract with player 1 ${this.myPlayer}, player 2 ${opponentPlayer} and cards contract address ${CardsContract.networks[network].address}`)

            this.contract.deploy({
                data: BattleContract.bytecode,
                arguments: [this.myPlayer, opponentPlayer, CardsContract.networks[network].address],
            })
            .send({
                from: this.myPlayer,
            })
            .catch(err => {
                reject(new Error(`Failed to deploy Battle contract. ${err.message}`))
            })
            .then(contract => {
                this.contract = contract

                log.info(`Deployed Battle contract address ${this.contract.options.address}`)
    
                resolve(this.contract.options.address)
            })
        })
    }

    getCard(cardId) {
        return this.contract.methods.cards(cardId).call()
    }

    getPlayerDeck(player) {

        return new Promise((resolve, reject) => {

            this.contract.methods.getPlayerDeck(player).call()
            .then(returnedDeck => {
                if (returnedDeck.playerCards.length === 0) {
                    return reject(Error(`Failed to get player deck for ${player}. They probably have not picked their cards yet`))
                }
    
                function parsePlayerCard(returnedPlayerCard) {
                    return {
                        cardId: parseInt(returnedPlayerCard[0]),
                        health: parseInt(returnedPlayerCard[1]),
                        defence: parseInt(returnedPlayerCard[2]),
                        mana: parseInt(returnedPlayerCard[3]),
                        attack: parseInt(returnedPlayerCard[4]),
                        specialAttack: parseInt(returnedPlayerCard[5]),
                    }
                }
    
                resolve({
                    playerCards: [
                        parsePlayerCard(returnedDeck.playerCards[0]),
                        parsePlayerCard(returnedDeck.playerCards[1]),
                        parsePlayerCard(returnedDeck.playerCards[2]),
                    ],
                    currentCard: parseInt(returnedDeck[1])
                })
            })
            .catch(err => {
                reject(`Failed to get player deck for ${player}. Error: ${err.message}`)
            })
        })
    }

    getPlayer1() {
        return this.contract.methods.player1().call()
    }

    getPlayer2() {
        return this.contract.methods.player2().call()
    }

    getWinningPlayer() {
        return this.contract.methods.winningPlayer().call()
    }

    pickPayerCards(desiredCards) {

        return new Promise((resolve, reject) => {
            log.debug(`About to call pickPayerCards with arg ${JSON.stringify(desiredCards)}, signed by ${this.myPlayer}`)

            this.contract.methods
            .pickPayerCards(desiredCards)
            .send({from: this.myPlayer})
            .then(tx => {
                const pickedCardsStr = tx.events.PickPayerCards.returnValues.pickedCards
                const pickedCardsInt = pickedCardsStr.map(x => parseInt(x))
        
                log.debug(`Player ${this.myPlayer} picked cards ${JSON.stringify(pickedCardsInt)}`)
        
                resolve(pickedCardsInt)
            })
            .catch(err => {
                reject(`Failed to pick player cards for ${this.myPlayer}`)
            })
        })
    }

    turn(move) {

        return new Promise((resolve, reject) => {
            log.debug(`About to move ${move}, signed by ${this.myPlayer}`)

            this.contract.methods
            .turn(move)
            .send({from: this.myPlayer})
            .then(tx => {
                const turnEvent = tx.events.PickPayerCards.returnValues.Turn

                log.info(`Got turn event for player ${this.myPlayer}  ${JSON.stringify(turnEvent)}`)
    
                resolve(pickedCardsInt)
            })
            .catch(err => {
                reject(`Failed to move ${move} for player ${this.myPlayer}`)
            })
        })
    }
}

module.exports = Battle