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

// Ropsten testing only
const HDWalletProvider = require("truffle-hdwallet-provider")
// has address 0x6DEd9aCA0B2754C1ce4600A8A39860CaaEAa66c1
const ropstenKeys = [
  'D89E31BC833CF02FA12132A127B59E72D99491862A004DB155FE302B21A33321',
  'B25A9AC97EBFAB1EC0D00667855C56DE01DBA7ABDC34D3E14AB3C38751E8C224',
  '63B169012C9B625A3FB81CCBF70E8DB86B316B78EAA14E24A58355D8428CD5BF'
] // private keys

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
    },
    ropsten:  {
      provider: () => {
        return new HDWalletProvider(ropstenKeys, "https://ropsten.infura.io/v3/227f03449d6f42808041ee845ec18467", 0, 3)
      },
      network_id: 3,
      skipDryRun: true,
    },
  },
  compilers: {
    solc: {
      version: "0.5.2"
    }
  }
}