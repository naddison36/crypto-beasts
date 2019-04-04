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
cd ..
git clone https://github.com/LLK/scratch-gui.git
cd scratch-gui
npm install
cd ..
git clone https://github.com/LLK/scratch-vm.git
cd scratch-vm
npm install
npm link
cd ../scratch-gui
npm link scratch-vm
cd ../scratch-vm/src/extensions
ln -s ../../../crypto-beasts/scratch/extensions ./custom
```

Next, the new extension needs to be registered in the scratch-gui. Go to the `src/lib/libraries/extensions/index.jsx` file in the scratch-gui folder created above and add this to the extensions array
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

The JavaScript in the extension file needs to be loaded via the `src/extension-support/extension-manager.js` file in the `scratch-vm` repository. Add the following function property to the `builtinExtensions` object in the `src/extension-support/extension-manager.js` file
```
cryptoBeasts: () => require('../extensions/custom/custom/cryptoBeasts'),
```

Finally, start the local Scratch server
```
cd ../../../scratch-gui
npm start
```

After the server starts, Scratch should be available at [http://localhost:8601](http://localhost:8601) 

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
```

## Contract compile and deploy

[Truffle](https://truffleframework.com/) is used to compile and deploy the contracts.

### Local loom

The [./truffle-config.js](./truffle-config.js) file has the Truffle config to deploy the contracts to a local Loom chain. The simply compile, run `truffle compile`. To compile and deploy the contracts locally, run
```
truffle deploy --reset --network loom_dapp_chain
```

This assume Truffle has been installed globally with
```
truffle install -g
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