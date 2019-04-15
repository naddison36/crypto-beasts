import React from 'react';
import {FormattedMessage} from 'react-intl';

import musicIconURL from './music/music.png';
import musicInsetIconURL from './music/music-small.svg';

import penIconURL from './pen/pen.png';
import penInsetIconURL from './pen/pen-small.svg';

export default [
    {
        name: (
            <FormattedMessage
                defaultMessage="Crypto Beasts on Loom"
                description="Name of extension"
                id="gui.extension.cryptoBeastsLoom.name"
            />
        ),
        extensionId: 'cryptoBeastsLoom',
        collaborator: 'Nick Addison, Baxter Addison, Liam Ryan, Zac Isterling, Oliver Ackerman',
        // iconURL: boostIconURL,
        // insetIconURL: boostInsetIconURL,
        description: (
            <FormattedMessage
                defaultMessage="Battle your friends in a Blockchain-based card game"
                description="Battle your friends in a Blockchain-based card game"
                id="gui.extension.cryptoBeastsLoom.description"
            />
        ),
        featured: true,
        disabled: false,
        bluetoothRequired: false,
        internetConnectionRequired: true
    },
    {
        name: (
            <FormattedMessage
                defaultMessage="Crypto Beasts using Web3"
                description="Name of extension"
                id="gui.extension.cryptoBeastsWeb3.name"
            />
        ),
        extensionId: 'cryptoBeastsWeb3',
        collaborator: 'Nick Addison, Baxter Addison, Liam Ryan, Zac Isterling, Oliver Ackerman',
        // iconURL: boostIconURL,
        // insetIconURL: boostInsetIconURL,
        description: (
            <FormattedMessage
                defaultMessage="Battle your friends in a Blockchain-based card game"
                description="Battle your friends in a Blockchain-based card game"
                id="gui.extension.cryptoBeastsWeb3.description"
            />
        ),
        featured: true,
        disabled: false,
        bluetoothRequired: false,
        internetConnectionRequired: true
    },
    {
        name: (
            <FormattedMessage
                defaultMessage="Crypto Beasts Simulator"
                description="Name of extension"
                id="gui.extension.cryptoBeastsSimulator.name"
            />
        ),
        extensionId: 'cryptoBeastsSimulator',
        collaborator: 'Nick Addison, Baxter Addison, Liam Ryan, Zac Isterling, Oliver Ackerman',
        // iconURL: boostIconURL,
        // insetIconURL: boostInsetIconURL,
        description: (
            <FormattedMessage
                defaultMessage="Battle your friends in a Blockchain-based card game"
                description="Battle your friends in a Blockchain-based card game"
                id="gui.extension.cryptoBeastsSimulator.description"
            />
        ),
        featured: true,
        disabled: false,
        bluetoothRequired: false,
        internetConnectionRequired: true
    },
    {
        name: (
            <FormattedMessage
                defaultMessage="ERC20 Token"
                description="Name of extension"
                id="gui.extension.erc20.name"
            />
        ),
        extensionId: 'erc20',
        collaborator: 'Nick Addison',
        // iconURL: boostIconURL,
        // insetIconURL: boostInsetIconURL,
        description: (
            <FormattedMessage
                defaultMessage="ERC20 Token"
                description="Description of extension"
                id="gui.extension.erc20.description"
            />
        ),
        featured: true,
        disabled: false,
        bluetoothRequired: false,
        internetConnectionRequired: true
    },
    {
        name: (
            <FormattedMessage
                defaultMessage="Music"
                description="Name for the 'Music' extension"
                id="gui.extension.music.name"
            />
        ),
        extensionId: 'music',
        iconURL: musicIconURL,
        insetIconURL: musicInsetIconURL,
        description: (
            <FormattedMessage
                defaultMessage="Play instruments and drums."
                description="Description for the 'Music' extension"
                id="gui.extension.music.description"
            />
        ),
        featured: false
    },
    {
        name: (
            <FormattedMessage
                defaultMessage="Pen"
                description="Name for the 'Pen' extension"
                id="gui.extension.pen.name"
            />
        ),
        extensionId: 'pen',
        iconURL: penIconURL,
        insetIconURL: penInsetIconURL,
        description: (
            <FormattedMessage
                defaultMessage="Draw with your sprites."
                description="Description for the 'Pen' extension"
                id="gui.extension.pen.description"
            />
        ),
        featured: false
    },
];
