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

        this.client = new Client(...clientConfig)

        const setupMiddlewareFn = function(client, privateKey) {
            const publicKey = CryptoUtils.publicKeyFromPrivateKey(privateKey)
            return [
                // new CachedNonceTxMiddleware(publicKey, client),
                new SpeculativeNonceTxMiddleware(publicKey, client),
                new SignedTxMiddleware(privateKey)]
          }
          
        // this.client.txMiddleware = [
        //     new CachedNonceTxMiddleware(publicKey, this.client),
        //     // new SpeculativeNonceTxMiddleware(publicKey, this.client),
        //     new SignedTxMiddleware(privateKey)
        //   ]

        this.loomProvider = new LoomProvider(this.client, privateKey, setupMiddlewareFn)
        const web3 = new Web3(this.loomProvider)

        this.contract = new web3.eth.Contract(
            TestingContract.abi,
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

    addAccount(privateKeyBase64) {
        
        let privateKey
        if (!privateKeyBase64) {
            log.debug(`No private key passed so generating one`)
            privateKey = CryptoUtils.generatePrivateKey()
        }
        else {
            privateKey = CryptoUtils.B64ToUint8Array(privateKeyBase64)
        }

        this.loomProvider.addAccounts([privateKey])

        const publicKey = CryptoUtils.publicKeyFromPrivateKey(privateKey)
        const account = LocalAddress.fromPublicKey(publicKey).toString()

        log.info(`Added new account ${account}`)

        return account
    }

    testTx(sender) {
        return new Promise((resolve, reject) => {

            let sendOptions = {}
            if (sender) {
                sendOptions = {from: sender}
            }

            log.debug(`About to testTx`)

            this.contract.methods
            .testTx()
            .send(sendOptions)
            .then(tx => {
                resolve(tx)
            })
            .catch(err => {
                const error = new Error(`Failed testTx. Error: ${err.message}`)
                log.error(error.message)
                reject(error)
            })
        })
    }

    setFail(failFlag, sender) {
        return new Promise((resolve, reject) => {

            let sendOptions = {}
            if (sender) {
                sendOptions = {from: sender}
            }

            log.debug(`About to set fail flag to ${failFlag}`)

            this.contract.methods
            .setFail(failFlag)
            .send(sendOptions)
            .then(tx => {
                resolve(tx)
            })
            .catch(err => {
                const error = new Error(`Fail to set fail flag. Error: ${err.message}`)
                log.error(error.message)
                reject(error)
            })
        })
    }

    fail() {
        return this.contract.methods.fail().call()
    }
}

module.exports = Testing
