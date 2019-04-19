# Crypto Beasts

A Blockchain-based game that uses [Scratch](https://scratch.mit.edu/) for the UI and [Loom](https://loomx.io/) for the Ethereum smart contracts.

# Scratch

## Scratch files

* [Game without Loom](./scratch/CryptoBeasts.sb3)
* [Hackathon presentation](./scratch/CryptoBeastsPresentation.sb3)

## Scratch 3.0 Extension Development

### Prerequisite 

The following software must be installed before running the installation steps
- [Git](https://git-scm.com/downloads)
- [Node.js](https://nodejs.org/en/download/)

### Installation

The following will install this [crypto-beasts](https://github.com/naddison36/crypto-beasts) repository and the Scratch repositories [scratch-gui](https://github.com/LLK/scratch-gui) and [scratch-vm](https://github.com/LLK/scratch-vm). This will allow Scratch with the custom extensions to be run locally.
```bash
mkdir scratch
cd scratch
git clone https://github.com/naddison36/crypto-beasts.git
cd crypto-beasts
npm install

# install Loom locally
mkdir loom
cd loom
wget https://private.delegatecall.com/loom/osx/stable/loom
chmod +x loom
./loom genkey -a public_key -k private_key
./loom genkey -a player1_pub_key -k player1_priv_key
./loom genkey -a player2_pub_key -k player2_priv_key

# start Loom locally
./loom init
./loom run

# install the scratch gui and vm packages
cd ../..
git clone https://github.com/LLK/scratch-gui.git
cd scratch-gui
npm install
cd ..
git clone https://github.com/LLK/scratch-vm.git
cd scratch-vm
npm install
npm install loom-js
npm install web3@1.0.0-beta.34
npm link
cd ../scratch-gui
npm link scratch-vm

# link crypto beasts to the scratch vm extensions
cd ../scratch-vm/src/extensions
ln -s ../../../crypto-beasts/scratch/extensions ./custom
# Link the extension to Truffle's deployed contract information
cd ../../../crypto-beasts/scratch/extensions/
ln -s ../../build/contracts contracts

# Copy modified scratch vm and gui files into the dependent packages
cd ../../
cp gui/index.jsx ../../scratch-gui/src/lib/libraries/extensions/index.jsx
cp vm/extension-manager.js ../../scratch-vm/src/extension-support/extension-manager.js
cp gui/webpack.config.js ../../scratch-gui/webpack.config.js

# start the Scratch React App
cd ../../scratch-gui
npm start
```

After the server starts, Scratch should be available at [http://localhost:8601](http://localhost:8601) 

### Customization

The following steps are done in the above but a listed here for anyone who wants to write their own Scratch extension.

New extensions are registered in the scratch-gui project in the `src/lib/libraries/extensions/index.jsx` file. Add this to the `extensions` array
```js
{
    name: (
        <FormattedMessage
            defaultMessage="Crypto Beasts"
            description="Name for the 'Crypto Beasts' extension"
            id="gui.extension.cryptoBeasts.name"
        />
    ),
    extensionId: 'cryptoBeasts',
    collaborator: 'Nick Addison, Baxter Addison, Liam Ryan, Zac Isterling, Oliver Ackerman',
    description: (
        <FormattedMessage
            defaultMessage="Crypto Beasts Trading Card Game"
            description="Battle your friends in a Blockchain-based card game"
            id="gui.extension.cryptoBeasts.description"
        />
    ),
    featured: true,
    disabled: false,
    internetConnectionRequired: true
},
```

The JavaScript in the extension file needs to be loaded via the `src/extension-support/extension-manager.js` file in the `scratch-vm` package. Add the following function property to the `builtinExtensions` object in the `src/extension-support/extension-manager.js` file
```
cryptoBeasts: () => require('../extensions/custom/custom/cryptoBeasts'),
```

The `loom-js` package needs the following webpack config added to the scratch-gui package
```
node: {
    fs: 'empty',
    child_process: 'empty',
}
```

## Useful Scratch 3.0 links
* [How to Develop Your Own Block for Scratch 3.0](https://medium.com/@hiroyuki.osaki/how-to-develop-your-own-block-for-scratch-3-0-1b5892026421) matches what has been done for this project.
* The [Scratch 3.0 Extensions Specification](https://github.com/LLK/scratch-vm/wiki/Scratch-3.0-Extensions-Specification) is now out of date and does not work.
* The unofficial Scratch 3 wiki is also now out of date. It covers how to install Scratch 3.0 on your local machine and develop an extension. See [Testing your Extensions](https://github.com/kyleplo/scratch-three-extension-docs/wiki/Testing-your-Extensions) and [Scratch GUI Getting Started](https://github.com/LLK/scratch-gui/wiki/Getting-Started) for more details.

# Loom

Loom Network’s DPoS sidechains allow for truly scalable blockchain games and DApps with the security of Ethereum mainnet. Like EOS on Ethereum.

## Installation

Following the [Loom OSX basic install instructions](https://loomx.io/developers/docs/en/basic-install-osx.html). Note loom was installed under the loom folder to keep it separated from all the other code in the repo.

```
mkdir loom
cd loom
wget https://private.delegatecall.com/loom/osx/stable/loom
chmod +x loom
./loom init
./loom run
```

## Generate keys
```
./loom genkey -a public_key -k private_key
./loom genkey -a player1_pub_key -k player1_priv_key
./loom genkey -a player2_pub_key -k player2_priv_key
```

The first private key is used for deploying the Battle contracts and becomes `accounts[0]` in the Loom web3 provider.

For the Edcon Hackathon, the following addresses were used, which become `accounts[1]` and `accounts[2]` in the Loom web3 provider.
* Player 1: `0xA4aaF6C3762E1635FB4d3e6Fd606d3Fe62830B5d`
* Player 2: `0x9F66B280e22EB0D92CbDF04d89463c9a0F72Fa61`

## Contract compile and deploy

[Truffle](https://truffleframework.com/) is used to compile and deploy the contracts.

[truffle-flattener](https://www.npmjs.com/package/truffle-flattener) is used to flattern the Solidity contracts.

```
truffle-flattener Battle
```

### Local loom

The following assume Truffle has been installed globally with
```
truffle install -g
```

The [./truffle-config.js](./truffle-config.js) file has the Truffle config to deploy the contracts to a local Loom chain. To simply compile the contracts, run `truffle compile`. To compile and deploy the contracts to a local Loom node, run
```
truffle deploy --reset --network loom_dapp_chain
```

To deploy a new Battle contract and not the cards contract which also needs all the cards loaded, run the following. This runs the third migration which deploys the battle contract.
```
truffle deploy --reset -f 3 --network loom_dapp_chain
```

To deploy to the Loom testnet
```
truffle deploy --reset --network extdev_plasma_us1
```

To run the tests against Ganache, which is a much faster JS implementation of an Ethereum node, run
```
truffle test
```

To run the tests against a local Loom node. Note test that check the revert reason will fail as Loom does not include the revert reason in the transaction receipt.
```
truffle test --network loom_dapp_chain
```

Deploy to the Loom dev testnet
```
truffle test --network extdev_plasma_us1
```

Deploy to the Ropsten network
```
truffle deploy --reset --network ropsten
```

## Useful Loom links

* [Loom website](https://loomx.io)
* [Loom SDK](https://loomx.io/developers/)
* [Everything You Need to Know About Loom Network, All in One Place ](https://medium.com/loom-network/everything-you-need-to-know-about-loom-network-all-in-one-place-updated-regularly-64742bd839fe)
* [Web3, LoomProvider and Truffle](https://loomx.io/developers/docs/en/web3js-loom-provider-truffle.html)

# Jest test

There is a mixture of Truffle and [Jest](https://jestjs.io/) tests in this repo. Jest is used to test the JavaScript classes that abstract smart contracts. For exmaple, [scratch/extensions/cryptoBeastsLoom/__tests__/battle.test.js](./scratch/extensions/cryptoBeastsLoom/__tests__/battle.test.js).

`npm run test` will run the Jest tests. This runs from the test script in the package.json
```
./node_modules/.bin/jest test --forceExit --detectOpenHandles --runInBand
```

# Docker

This [Dockerfile](./Dockerfile) will add the [Crypto Beasts extension](./scratch/extensions/cryptoBeasts/index.js) as a built in extension, build the Scratch 3.0 react app and copy it into a nginx image. This can then be deployed to a cloud provider. I'm using Heroku, but others like AWS, Azure and GCP will also work.

`npm run buildWebImage` will build the Docker image which runs
```
docker build -t registry.heroku.com/crypto-beasts-prod/web:latest --target web .
```

`npm run bashWebImage` will shell into the build image which runs
```
docker run -it registry.heroku.com/crypto-beasts-prod/web:latest sh
```

`npm run runWebImage` will run the Scratch 3.0 react app locally
```
runWebImage": "docker run -p 8601:8601 -e PORT=8601 registry.heroku.com/crypto-beasts-prod/web:latest
```

This project is deploying to Heroku hence the `registry.heroku.com/crypto-beasts-prod` image names. These will need to be changed if deploying to other cloud based Container Registries.

# Continuous Integration

[CicleCi](https://circleci.com/) is used for CI. The config file is [.circleci/config.yml](.circleci/config.yml).