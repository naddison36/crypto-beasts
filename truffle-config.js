const { readFileSync } = require('fs')
const LoomTruffleProvider = require('loom-truffle-provider')
const { CryptoUtils } = require('loom-js')

// Read in the private keys from the filesystem
const privateKey = readFileSync('./loom/private_key', 'utf-8')
const player1PrivateKeyBase64 = readFileSync('./loom/player1_priv_key', 'utf-8')
const player2PrivateKeyBase64 = readFileSync('./loom/player2_priv_key', 'utf-8')
// convert the private keys in Base64 format to a binary Uint8Array
const player1PrivateKey = CryptoUtils.B64ToUint8Array(player1PrivateKeyBase64)
const player2PrivateKey = CryptoUtils.B64ToUint8Array(player2PrivateKeyBase64)

module.exports = {
  networks: {
    loom_dapp_chain: {
      provider: function() {
        const chainId    = 'default'
        const writeUrl   = 'http://127.0.0.1:46658/rpc'
        const readUrl    = 'http://127.0.0.1:46658/query'
        const loomTruffleProvider = new LoomTruffleProvider(chainId, writeUrl, readUrl, privateKey)
        const providerEngine = loomTruffleProvider.getProviderEngine()
        providerEngine.addAccounts([player1PrivateKey, player2PrivateKey])
        return loomTruffleProvider
      },
      network_id: '*'
    },
    extdev: {
      provider: function() {
        const chainId = 'extdev-plasma-us1';
        const writeUrl = 'http://extdev-plasma-us1.dappchains.com:80/rpc';
        const readUrl = 'http://extdev-plasma-us1.dappchains.com:80/query';
        return new LoomTruffleProvider(chainId, writeUrl, readUrl, privateKey)
      },
      network_id: 'extdev-plasma-us1'
    }
  },
  compilers: {
    solc: {
      version: "0.5.2"
    }
  }
}