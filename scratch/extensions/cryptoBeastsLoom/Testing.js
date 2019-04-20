const Web3 = require('web3')
const { CachedNonceTxMiddleware, SpeculativeNonceTxMiddleware, SignedTxMiddleware,
    Client, CryptoUtils, LocalAddress, LoomProvider } = require('loom-js')

var log = require('minilog')('cryptoBeasts')

const TestingContract = require('../contracts/Testing.json')

const clientConfig = [
    'default',
    'ws://127.0.0.1:46658/websocket',
    'ws://127.0.0.1:46658/queryws',
]
const network = 13654820909954

class Testing {

    constructor(privateKeyBase64) {

        let privateKey
        if (!privateKeyBase64) {
            log.debug(`No private key passed so generating one`)
            privateKey = CryptoUtils.generatePrivateKey()
        }
        else {
            privateKey = CryptoUtils.B64ToUint8Array(privateKeyBase64)
        }

        const publicKey = CryptoUtils.publicKeyFromPrivateKey(privateKey)
        const address = LocalAddress.fromPublicKey(publicKey).toString()

        log.debug(`About to connect to local Loom`)

        const client = new Client(...clientConfig)
        client.txMiddleware = [
            new CachedNonceTxMiddleware(publicKey, client),
            // new SpeculativeNonceTxMiddleware(publicKey, client),
            new SignedTxMiddleware(privateKey)
          ]

        this.loomProvider = new LoomProvider(client, privateKey)
        const web3 = new Web3(this.loomProvider)

        this.contract = new web3.eth.Contract(
            TestingContract.abi,
            TestingContract.networks[network].address,
            {from: address})

        log.debug(`Testing contract address is ${this.contract.options.address}`)
    }

    deploy() {

        return new Promise((resolve, reject) => {

            this.contract.deploy({
                data: TestingContract.bytecode,
            })
            .send()
            .catch(err => {
                reject(new Error(`Failed to deploy Testing contract. ${err.message}`))
            })
            .then(contract => {
                this.contract = contract

                log.info(`Deployed Testing contract address ${this.contract.options.address}`)
    
                resolve(this.contract.options.address)
            })
        })
    }

    addAccount(newAccountPrivateKeyBase64) {
        const newAccountPrivateKey = CryptoUtils.B64ToUint8Array(newAccountPrivateKeyBase64)
        this.loomProvider.addAccounts([newAccountPrivateKey])
    }

    msgSender() {
        return this.contract.methods.msgSender().call()
    }

    failRequire() {

        return new Promise((resolve, reject) => {
            
            log.debug(`About to failRequire`)

            this.contract.methods
            .failRequire()
            .send()
            .then(tx => {
                resolve()
            })
            .catch(err => {
                const error = new Error(`Fail require. Error: ${err.message}`)
                log.error(error.message)
                reject(error)
            })
        })
    }

    increment() {
        return new Promise((resolve, reject) => {
            
            log.debug(`About to increment`)

            this.contract.methods
            .increment()
            .send()
            .then(tx => {
                resolve(parseInt(tx.events.Increment.returnValues.counter))
            })
            .catch(err => {
                const error = new Error(`Fail increment. Error: ${err.message}`)
                log.error(error.message)
                reject(error)
            })
        })
    }

    toggleFail() {
        return new Promise((resolve, reject) => {
            
            log.debug(`About to toggleFail`)

            this.contract.methods
            .toggleFail()
            .send()
            .then(tx => {
                resolve()
            })
            .catch(err => {
                const error = new Error(`Fail toggleFail. Error: ${err.message}`)
                log.error(error.message)
                reject(error)
            })
        })
    }
}

module.exports = Testing