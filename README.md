# Crypto Beasts

A Blockchain-based card game that uses [Scratch](https://scratch.mit.edu/) for the UI and [Loom](https://loomx.io/) for the Ethereum smart contracts.

# Scratch

## Prerequisite 

The following software must be installed before running the installation steps
- [Git](https://git-scm.com/downloads)
- [Node.js](https://nodejs.org/en/download/)

## Installation

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
npm install web3
npm link
cd ../scratch-gui
npm link scratch-vm

# link crypto beasts to the scratch vm extensions
cd ../scratch-vm/src/extensions
ln -s ../../../crypto-beasts/scratch/extensions ./custom
# Link the extension to Truffle's Battle contract information
cd ../../../crypto-beasts/scratch/extensions/cryptoBeastsLoom/
ln -s ../../../build/contracts/Battle.json ./Battle.json

# Copy modified scratch vm and gui files into the dependent packages
cd ../../
cp gui/index.jsx ../../scratch-gui/src/lib/libraries/extensions/index.jsx
cp vm/extension-manager.js ../../scratch-vm/src/extension-support/extension-manager.js
# cp vm/webpack.config.js ../../scratch-vm/src/extension-support/webpack.config.js

# start the Scratch React App
cd ../../scratch-gui
npm start
```

After the server starts, Scratch should be available at [http://localhost:8601](http://localhost:8601) 

## Customization

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

# Scratch files

* [Game without Loom](./scratch/Crypto Beasts.sb3)
* [Hackathon presentation](./scratch/Crypto Beasts Presentation.sb3)

## Useful links
* [How to Develop Your Own Block for Scratch 3.0](https://medium.com/@hiroyuki.osaki/how-to-develop-your-own-block-for-scratch-3-0-1b5892026421) matches what has been done for this project.
* The [Scratch 3.0 Extensions Specification](https://github.com/LLK/scratch-vm/wiki/Scratch-3.0-Extensions-Specification) is now out of date and does not work.
* The unofficial Scratch 3 wiki is also now out of date. It covers how to install Scratch 3.0 on your local machine and develop an extension. See [Testing your Extensions](https://github.com/kyleplo/scratch-three-extension-docs/wiki/Testing-your-Extensions) and [Scratch GUI Getting Started](https://github.com/LLK/scratch-gui/wiki/Getting-Started) for more details.

# Loom

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

The [./truffle-config.js](./truffle-config.js) file has the Truffle config to deploy the contracts to a local Loom chain. The simply compile the contracts, run `truffle compile`. To compile and deploy the contracts to a local Loom node, run
```
truffle deploy --reset --network loom_dapp_chain --skip-dry-run
```

This assume Truffle has been installed globally with
```
truffle install -g
```

To run the tests against Ganache, which is a much faster JS implementation of an Ethereum node, run
```
truffle test
```

To run the tests against a local Loom node. Note test that check the revert reason will fail as Loom does not include the revert reason in the transaction receipt.
```
truffle test --network loom_dapp_chain
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