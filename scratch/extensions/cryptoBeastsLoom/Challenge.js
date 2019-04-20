const Web3 = require('web3')
const { CachedNonceTxMiddleware, SpeculativeNonceTxMiddleware, SignedTxMiddleware,
    Client, CryptoUtils, LocalAddress, LoomProvider } = require('loom-js')

var log = require('minilog')('cryptoBeasts')

const ChallengeContract = require('../contracts/Challenge.json')

const clientConfig = [
    'default',
    'ws://127.0.0.1:46658/websocket',
    'ws://127.0.0.1:46658/queryws',
]
const network = 13654820909954

class Challenge {

    constructor(challengerPrivateKeyBase64) {

        let challengerPrivateKey
        if (!challengerPrivateKeyBase64) {
            log.debug(`No private key passed for challenger so generating one`)
            challengerPrivateKey = CryptoUtils.generatePrivateKey()
        }
        else {
            challengerPrivateKey = CryptoUtils.B64ToUint8Array(challengerPrivateKeyBase64)
        }

        const challengerPublicKey = CryptoUtils.publicKeyFromPrivateKey(challengerPrivateKey)
        this.challengerAddress = LocalAddress.fromPublicKey(challengerPublicKey).toString()

        log.debug(`About to connect to local Loom`)

        const client = new Client(...clientConfig)
        client.txMiddleware = [
            // new CachedNonceTxMiddleware(challengerPublicKey, client),
            new SpeculativeNonceTxMiddleware(challengerPublicKey, client),
            new SignedTxMiddleware(challengerPrivateKey)
          ]

        this.loomProvider = new LoomProvider(client, challengerPrivateKey)
        const web3 = new Web3(this.loomProvider)

        this.contract = new web3.eth.Contract(
            ChallengeContract.abi,
            ChallengeContract.networks[network].address,
            {from: this.challengerAddress})

        log.debug(`Challenge contract address is ${this.contract.options.address}`)
    }

    deploy() {

        return new Promise((resolve, reject) => {
            log.debug(`About to deploy challenge contract signed by challenger ${this.challengerAddress}`)

            this.contract.deploy({
                data: ChallengeContract.bytecode,
            })
            .send({from: this.challengerAddress})
            .catch(err => {
                reject(new Error(`Failed to deploy Challenge contract. ${err.message}`))
            })
            .then(contract => {
                this.contract = contract

                log.info(`Deployed Challenge contract address ${this.contract.options.address}`)
    
                resolve(this.contract.options.address)
            })
        })
    }

    addAccount(newAccountPrivateKeyBase64) {
        const newAccountPrivateKey = CryptoUtils.B64ToUint8Array(newAccountPrivateKeyBase64)
        this.loomProvider.addAccounts([newAccountPrivateKey])
    }

    isChallenging(challenger) {
        return this.contract.methods.challenges(challenger).call()
    }

    anyone(challenger) {

        return new Promise((resolve, reject) => {
            
            if (!challenger) {
                challenger = this.challengerAddress
            }

            log.debug(`About to challenge anyone using challenger ${challenger}`)

            this.contract.methods
            .anyone()
            .send({from: challenger})
            .then(tx => {
                log.debug(`Challenger anyone transaction ${tx}`)
        
                if (tx.events.Accept) {
                    resolve(tx.events.Accept.returnValues.challenger)
                }
                else {
                    resolve()
                }
            })
            .catch(err => {
                const error = new Error(`Failed to challenge anyone using challenger ${challenger}. Error: ${err.message}`)
                log.error(error.message)
                reject(error)
            })
        })
    }
}

module.exports = Challenge