# Crypto Beasts

A Blockchain-based trading card game that uses Scratch for the UI and Loom for the Ethereum smart contracts.

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
ln -s ../../../crypto-beasts/scratch/extensions/cryptoBeasts ./scratch3_cryptoBeasts
```

Next, the new extension needs to be registered in the scratch-gui. Go to the `src/lib/libraries/extensions/index.jsx` file in the scratch-gui folder created above and add this to the extensions array
```js
{
    name: 'Crypto Beasts',
    extensionId: 'cryptoBeasts',
    collaborator: 'Edcon hack team',
    description: (
        <FormattedMessage
            defaultMessage="Crypto Beasts Trading Card Game"
            description="Battle your friends in a Blockchain-based trading card game"
            id="gui.extension.cryptoBeasts.description"
        />
    ),
    featured: true,
    disabled: false,
    bluetoothRequired: false,
    internetConnectionRequired: true
},
```

The JavaScript in the extension file needs to be loaded via the `src/extension-support/extension-manager.js` file in the `scratch-vm` repository. Add the following function property to the `builtinExtensions` object in the `src/extension-support/extension-manager.js` file
```
cryptoBeasts: () => require('../extensions/scratch3_cryptoBeasts'),
```

Finally, start the local Scratch server
```
cd ../../../scratch-gui
npm start
```

After the server starts, Scratch should be available at [http://localhost:8601](http://localhost:8601) 

## Useful links
* The [Scratch 3.0 Extensions Specification](https://github.com/LLK/scratch-vm/wiki/Scratch-3.0-Extensions-Specification) is now out of date and does not work.

* The unofficial Scratch 3 wiki is also now out of date. It covers how to install Scratch 3.0 on your local machine and develop an extension. See [Testing your Extensions](https://github.com/kyleplo/scratch-three-extension-docs/wiki/Testing-your-Extensions) and [Scratch GUI Getting Started](https://github.com/LLK/scratch-gui/wiki/Getting-Started) for more details.