const formatMessage = require('format-message')

const ArgumentType = require('../../../extension-support/argument-type')
const BlockType = require('../../../extension-support/block-type')
const log = require('../../../util/log')

const cards = require('./cards').cards
const regEx = require('./regEx')

// For testing
const playerAddresses = ['0x48118F98aD3aceF72Bc33D42C0E2fa3B16751d38', '0xFf33Eb72e6184E5102Fb9938Ff360c131835861D']

class Scratch3CryptoBeastsBlocks {

    constructor(runtimeProxy) {
        this.runtime = runtimeProxy

        // player addresses are the properties
        this.playerCards = {}
        this.playersCurrentCard = {}

        this.whenChallengedFlag = false
        // Address of the challenger
        this.challengedBy = undefined

        this.whenChallengedAcceptedFlag = false
        this.challengeAcceptedBy = undefined
    }

    getInfo() {

        return {
            // Required: the machine-readable name of this extension.
            // Will be used as the extension's namespace.
            id: 'cryptoBeasts',

            // Optional: the human-readable name of this extension as string.
            // This and any other string to be displayed in the Scratch UI may either be
            // a string or a call to `formatMessage` a plain string will not be
            // translated whereas a call to `formatMessage` will connect the string
            // to the translation map (see below). The `formatMessage` call is
            // similar to `formatMessage` from `react-intl` in form, but will actually
            // call some extension support code to do its magic. For example, we will
            // internally namespace the messages such that two extensions could have
            // messages with the same ID without colliding.
            // See also: https://github.com/yahoo/react-intl/wiki/API#formatmessage
            // name: 'Crypto Beasts',
            name: formatMessage({
                id: 'cryptoBeasts.categoryName',
                default: 'Crypto Beasts',
                description: 'Crypto Beasts extension',
            }),

            // Optional: URI for a block icon, to display at the edge of each block for this
            // extension. Data URI OK.
            // TODO: what file types are OK? All web images? Just PNG?
            // blockIconURI: 'data:image/pngbase64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAFCAAAAACyOJm3AAAAFklEQVQYV2P4DwMMEMgAI/+DEUIMBgAEWB7i7uidhAAAAABJRU5ErkJggg==',

            // Optional: URI for an icon to be displayed in the blocks category menu.
            // If not present, the menu will display the block icon, if one is present.
            // Otherwise, the category menu shows its default filled circle.
            // Data URI OK.
            // TODO: what file types are OK? All web images? Just PNG?
            // menuIconURI: 'data:image/pngbase64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAFCAAAAACyOJm3AAAAFklEQVQYV2P4DwMMEMgAI/+DEUIMBgAEWB7i7uidhAAAAABJRU5ErkJggg==',

            // Optional: Link to documentation content for this extension.
            // If not present, offer no link.
            docsURI: 'https://github.com/naddison36/loom-scratch-tcg',

            // Required: the list of blocks implemented by this extension,
            // in the order intended for display.
            blocks: [
                {
                    // Required: the machine-readable name of this operation.
                    // This will appear in project JSON.
                    opcode: 'playerMove',

                    // Required: the kind of block we're defining, from a predefined list:
                    // 'command' - a normal command block, like "move {} steps"
                    // 'reporter' - returns a value, like "direction"
                    // 'Boolean' - same as 'reporter' but returns a Boolean value
                    // 'hat' - starts a stack if its value is truthy
                    // 'conditional' - control flow, like "if {}" or "if {} else {}"
                    // A 'conditional' block may return the one-based index of a branch to
                    // run, or it may return zero/falsy to run no branch.
                    // 'loop' - control flow, like "repeat {} {}" or "forever {}"
                    // A 'loop' block is like a conditional block with two differences:
                    // - the block is assumed to have exactly one child branch, and
                    // - each time a child branch finishes, the loop block is called again.
                    blockType: BlockType.COMMAND,

                    // Required for conditional blocks, ignored for others: the number of
                    // child branches this block controls. An "if" or "repeat" block would
                    // specify a branch count of 1 an "if-else" block would specify a
                    // branch count of 2.
                    // TODO: should we support dynamic branch count for "switch"-likes?
                    branchCount: 0,

                    // Optional, default false: whether or not this block ends a stack.
                    // The "forever" and "stop all" blocks would specify true here.
                    terminal: false,

                    // Optional, default false: whether or not to block all threads while
                    // this block is busy. This is for things like the "touching color"
                    // block in compatibility mode, and is only needed if the VM runs in a
                    // worker. We might even consider omitting it from extension docs...
                    blockAllThreads: false,

                    // Required: the human-readable text on this block, including argument
                    // placeholders. Argument placeholders should be in [MACRO_CASE] and
                    // must be [ENCLOSED_WITHIN_SQUARE_BRACKETS].
                    text: formatMessage({
                        id: 'cryptoBeasts.playerMove',
                        default: 'Player [PLAYER] makes move [MOVE]',
                        description: 'Player makes a move when it is their turn',
                    }),

                    // Required: describe each argument.
                    // Argument order may change during translation, so arguments are
                    // identified by their placeholder name. In those situations where
                    // arguments must be ordered or assigned an ordinal, such as interaction
                    // with Scratch Blocks, arguments are ordered as they are in the default
                    // translation (probably English).
                    arguments: {
                        // Required: the ID of the argument, which will be the name in the
                        // args object passed to the implementation function.
                        MOVE: {
                            // Required: type of the argument / shape of the block input
                            type: ArgumentType.NUMBER,
                            menu: 'move',
                            // Optional: the default value of the argument
                            defaultValue: 1,
                        },
                        PLAYER: {
                            type: ArgumentType.STRING,
                            // TODO populate with MetaMask address
                            defaultValue: 'Player address',
                        }
                    },

                    // Optional: list of target types for which this block should appear.
                    // If absent, assume it applies to all builtin targets -- that is:
                    // ['sprite', 'stage']
                    filter: ['sprite', 'stage']
                },
                {
                    opcode: 'getCardProperty',
                    text: formatMessage({
                        id: 'cryptoBeasts.getCardProperty',
                        default: '[CARD_PROPERTY] of card [CARD_ID]',
                        description: 'get a property of a card',
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        CARD_PROPERTY: {
                            type: ArgumentType.STRING,
                            menu: 'cardProperty',
                            defaultValue: 'name'
                        },
                        CARD_ID: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        }
                    }
                },
                {
                    opcode: 'getPlayerCardProperty',
                    text: formatMessage({
                        id: 'cryptoBeasts.getPlayerCardProperty',
                        default: '[CARD_PROPERTY] of deck card [DECK_ID] for player [PLAYER] ',
                        description: 'get a property of a card',
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        CARD_PROPERTY: {
                            type: ArgumentType.STRING,
                            menu: 'cardProperty',
                            defaultValue: 'name'
                        },
                        DECK_ID: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        },
                        PLAYER: {
                            type: ArgumentType.STRING,
                            defaultValue: 'Player address',
                        },
                    }
                },
                {
                    opcode: 'getPlayersCurrentCard',
                    text: formatMessage({
                        id: 'cryptoBeasts.getPlayersCurrentCard',
                        default: 'current card of [PLAYER] ',
                        description: 'get current card of player',
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        PLAYER: {
                            type: ArgumentType.STRING,
                            defaultValue: 'Player address',
                        },
                    }
                },
                {
                    opcode: 'getPlayerAddress',
                    text: formatMessage({
                        id: 'cryptoBeasts.getPlayerAddress',
                        default: 'address of player [PLAYER_NUMBER]',
                        description: 'get the Ethereum address of a test player',
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        PLAYER_NUMBER: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1,
                        },
                    }
                },
                {
                    opcode: 'countCards',
                    text: formatMessage({
                        id: 'cryptoBeasts.countCards',
                        default: 'Number of cards',
                        description: 'Counts the number of cards',
                    }),
                    blockType: BlockType.REPORTER,
                },
                {
                    opcode: 'challengedByPlayer',
                    text: formatMessage({
                        id: 'cryptoBeasts.challengedByPlayer',
                        default: 'Challenger',
                        description: 'Player that has challenged the current player to battle',
                    }),
                    blockType: BlockType.REPORTER,
                },
                {
                    opcode: 'challengeAcceptedByPlayer',
                    text: formatMessage({
                        id: 'cryptoBeasts.challengeAcceptedByPlayer',
                        default: 'Challenge Acceptor',
                        description: 'Player that has accepted the challenge to battle',
                    }),
                    blockType: BlockType.REPORTER,
                },
                {
                    opcode: 'challengeAll',
                    text: formatMessage({
                        id: 'cryptoBeasts.challengeAll',
                        default: 'Player [PLAYER] challenges anyone to a battle',
                        description: 'Notifies anyone not in a battle that you are challenging them to a battle',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PLAYER: {
                            type: ArgumentType.STRING,
                            defaultValue: 'Player address',
                        },
                    }
                },
                {
                    opcode: 'challengePlayer',
                    text: formatMessage({
                        id: 'cryptoBeasts.challengePlayer',
                        default: 'Challenge player [PLAYER] to a battle',
                        description: 'Challenges a player to a battle',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PLAYER: {
                            type: ArgumentType.STRING,
                            defaultValue: 'Player address',
                        },
                    }
                },
                {
                    opcode: 'acceptChallenge',
                    text: formatMessage({
                        id: 'cryptoBeasts.acceptChallenge',
                        default: 'Accept challenge from player [PLAYER]',
                        description: 'Accept the challenges to battle from a player',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PLAYER: {
                            type: ArgumentType.STRING,
                            defaultValue: 'Player address',
                        },
                    }
                },
                {
                    opcode: 'whenPlayersTurn',
                    text: formatMessage({
                        id: 'cryptoBeasts.whenPlayersTurn',
                        default: 'When my turn',
                        description: 'Fires when current player\'s turn',
                    }),
                    blockType: BlockType.HAT,
                },
                {
                    opcode: 'whenChallenged',
                    text: formatMessage({
                        id: 'cryptoBeasts.whenChallenged',
                        default: 'When challenged by another player',
                        description: 'Fires when someone has challenged the current player',
                    }),
                    blockType: BlockType.HAT,
                },
                {
                    opcode: 'whenChallengedAccepted',
                    text: formatMessage({
                        id: 'cryptoBeasts.whenChallengedAccepted',
                        default: 'When challenge accepted by another player',
                        description: 'Fires when someone has accepted the current player\'s challenge',
                    }),
                    blockType: BlockType.HAT,
                },
                {
                    opcode: 'loadCards',
                    text: formatMessage({
                        id: 'cryptoBeasts.loadCards',
                        default: 'Loads cards from the Blockchain',
                        description: 'Loads all the cards into this extension from the Blockchain cards contract',
                    }),
                    blockType: BlockType.COMMAND,
                },
                {
                    opcode: 'pickCards',
                    text: formatMessage({
                        id: 'cryptoBeasts.pickCards',
                        default: 'Player [PLAYER] picks cards [CARD_1], [CARD_2], [CARD_3], [CARD_4] and [CARD_5]',
                        description: 'Player picks cards for their deck',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PLAYER: {type: ArgumentType.STRING, defaultValue: 'Player address'},
                        CARD_1: {type: ArgumentType.STRING, defaultValue: 1},
                        CARD_2: {type: ArgumentType.STRING, defaultValue: 2},
                        CARD_3: {type: ArgumentType.STRING, defaultValue: 3},
                        CARD_4: {type: ArgumentType.STRING, defaultValue: 4},
                        CARD_5: {type: ArgumentType.STRING, defaultValue: 5},
                    }
                },
            ],

            // Optional: define extension-specific menus here.
            menus: {
                // Required: an identifier for this menu, unique within this extension.
                move: [
                    // Static menu: list items which should appear in the menu.
                    {
                        // Required: the value of the menu item when it is chosen.
                        value: 1,

                        // Optional: the human-readable label for this item.
                        // Use `value` as the text if this is absent.
                        text: formatMessage({
                            id: 'cryptoBeasts.menu.move.attack',
                            default: 'Attack',
                            description: 'Attack move',
                        })
                    },
                    {
                        value: 2,
                        text: formatMessage({
                            id: 'cryptoBeasts.menu.move.specialAttack',
                            default: 'Special Attack',
                            description: 'Special attack move',
                        })
                    },
                    {
                        value: 3,
                        text: formatMessage({
                            id: 'cryptoBeasts.menu.move.ability',
                            default: 'Ability',
                            description: 'Use ability',
                        })
                    },
                ],

                cardProperty: [
                    {text: 'Name', value: 'name'},
                    {text: 'Ability', value: 'ability'},
                    {text: 'Speed', value: 'speed'},
                    {text: 'Attack', value: 'attack'},
                    {text: 'Special Attack', value: 'specialAttack'},
                    {text: 'Health', value: 'health'},
                    {text: 'Defence', value: 'defence'},
                    {text: 'Mana', value: 'mana'},
                ],
            }
        }
    }

    playerMove(args, util) {

        return new Promise((resolve, reject) => {
            // TODO call challenge function on the Battle contract

            if (!args.PLAYER || !args.PLAYER.match(regEx.ethereumAddress)) {
                const error = new TypeError(`Invalid PLAYER argument ${args.PLAYER} for the accept challenge command. Must be a 40 char hexadecimal with a 0x prefix`)
                return reject(error)
            }

            log.debug(`Player ${args.PLAYER} did move ${args.MOVE} for their turn`)

            // Run for some time even when no motor is connected
            setTimeout(resolve, 1000)
        })
    }

    getCardProperty(args) {

        if (args.CARD_ID < 0 || args.CARD_ID >= cards.length) {
            return log.error(`Invalid card id ${args.CARD_ID}. Must be a positive integer and less than ${cards.length}`)
        }

        if (!args.CARD_PROPERTY) {
            log.error(`Invalid card property ${args.CARD_PROPERTY}`)
            return
        }

        if (!cards[args.CARD_ID][args.CARD_PROPERTY]) {
            return log.error(`Failed to find card property ${args.CARD_PROPERTY} for card ${args.CARD_ID}`)
        }

        const cardPropertyValue = cards[args.CARD_ID][args.CARD_PROPERTY]

        log.debug(`got ${cardPropertyValue} for property ${args.CARD_PROPERTY}, card id ${args.CARD_ID}`)
        return cardPropertyValue
    }

    getPlayerCardProperty(args) {

        if (args.DECK_ID < 0 || args.DECK_ID >= cards.length) {
            return log.error(`Invalid deck id ${args.DECK_ID}. Must be a positive integer and less than ${3}`)
        }

        if (!args.PLAYER || !args.PLAYER.match(regEx.ethereumAddress)) {
            const error = new TypeError(`Invalid PLAYER argument ${args.PLAYER} for the accept challenge command. Must be a 40 char hexadecimal with a 0x prefix`)
            return reject(error)
        }

        if (!this.playerCards[args.PLAYER]) {
            
            const error = new TypeError(`Could not find player cards for ${args.PLAYER}`)
            return reject(error)
        }

        if (!this.playerCards[args.PLAYER][args.DECK_ID]) {
            
            const error = new TypeError(`Could not find deck card ${args.DECK_ID} for player ${args.PLAYER}`)
            return reject(error)
        }

        if (!this.playerCards[args.PLAYER][args.DECK_ID][args.CARD_PROPERTY]) {
            
                const error = new TypeError(`Could not find property ${args.CARD_PROPERTY} for deck card ${args.DECK_ID} for player ${args.PLAYER}`)
            return reject(error)
        }

        const cardPropertyValue = this.playerCards[args.PLAYER][args.DECK_ID][args.CARD_PROPERTY]

        log.debug(`got ${cardPropertyValue} for property ${args.CARD_PROPERTY}, deck id ${args.DECK_ID}, player ${args.PLAYER}`)

        return cardPropertyValue
    }

    countCards() {
        return cards.length
    }

    getPlayerAddress(args) {

        if (!Number.isInteger(args.PLAYER_NUMBER) && args.PLAYER_NUMBER < 0) {
            return log.error(`Invalid PLAYER_NUMBER argument ${args.PLAYER_NUMBER} for get player address. Must be a positive integer`)
        }

        if (args.PLAYER_NUMBER >= playerAddresses.length) {
            return log.error(`Failed to get address for player number ${args.PLAYER_NUMBER}. Only ${playerAddresses.length} test players exist. The player number must be less than ${playerAddresses.lengt}`)
        }

        return playerAddresses[args.PLAYER_NUMBER]
    }

    challengeAll(args) {
        return new Promise((resolve, reject) => {

            if (!args.PLAYER || !args.PLAYER.match(regEx.ethereumAddress)) {
                const error = new TypeError(`Invalid PLAYER argument ${args.PLAYER} for the challenge all command. Must be a 40 char hexadecimal with a 0x prefix`)
                return reject(error)
            }

            log.debug(`About to challenge all players`)

            // Just simulate for now
            setTimeout(() => {

                if (args.PLAYER != playerAddresses[0]) {
                    this.challengeAcceptedBy = playerAddresses[0]
                } else {
                    this.challengeAcceptedBy = playerAddresses[1]
                }

                this.whenChallengedAcceptedFlag = true

                resolve
            }, 10000)
        })
    }

    challengePlayer(args) {
        return new Promise((resolve, reject) => {

            if (!args.PLAYER || !args.PLAYER.match(regEx.ethereumAddress)) {
                const error = new TypeError(`Invalid PLAYER argument ${args.PLAYER} for the accept challenge command. Must be a 40 char hexadecimal with a 0x prefix`)
                return reject(error)
            }

            log.debug(`About to challenge player ${args.PLAYER}`)

            // Run for some time even when no motor is connected
            setTimeout(resolve, 1000)
        })
    }

    acceptChallenge(args) {
        return new Promise((resolve, reject) => {
            // TODO call challenge function on the Battle contract

            if (!args.PLAYER || !args.PLAYER.match(regEx.ethereumAddress)) {
                const error = new TypeError(`Invalid PLAYER argument ${args.PLAYER} for the accept challenge command. Must be a 40 char hexadecimal with a 0x prefix`)
                return reject(error)
            }

            log.debug(`About to accept challenge from player ${args.PLAYER}`)

            // TODO call accept challenge function on the Battle contract
            // TODO Get playersTurn from the emitted event

            // TODO Just simulate the contract calls for now
            setTimeout(() => {

                this.challengeAcceptor = args.PLAYER

                // just set the turn to the challenge acceptor for now
                this.playersTurn = args.PLAYER

                resolve
            }, 5000)
        })
    }

    challengedByPlayer() {
        return this.challengedBy
    }

    challengeAcceptedByPlayer() {
        return this.challengeAcceptedBy
    }

    whenPlayersTurn() {
        return false
    }

    whenChallenged() {
        if (this.whenChallengedFlag) {

            log.info(`Challenged by player ${this.challenger}`)

            this.whenChallengedFlag = false
            return true
        }
        
        return false
    }

    whenChallengedAccepted() {
        if (this.whenChallengedAcceptedFlag) {

            log.info(`Challenge accepted by player ${this.challengedAcceptedBy}`)

            this.whenChallengedAcceptedFlag = false
            return true
        }
        
        return false
    }

    pickCards(args) {
        return new Promise((resolve, reject) => {
            // TODO call pickCards function on the Battle contract

            if (!args.PLAYER || !args.PLAYER.match(regEx.ethereumAddress)) {
                const error = new TypeError(`Invalid PLAYER argument ${args.PLAYER} for the pick cards command. Must be a 40 char hexadecimal with a 0x prefix`)
                return reject(error)
            }

            if (this.playerCards[args.PLAYER]) {
                const error = new Error(`PLAYER ${args.PLAYER} has already picked cards`)
                return reject(error)
            }

            log.debug(`Player ${args.PLAYER} picks cards ${JSON.stringify(args)}`)

            // clone the cards into player cards
            this.playerCards[args.PLAYER] = [
                {...cards[args.CARD_1]},
                {...cards[args.CARD_2]},
                {...cards[args.CARD_3]},
            ]

            this.playersCurrentCard[args.PLAYER] = 0

            // Run for some time even when no motor is connected
            setTimeout(resolve, 200)
        })
    }

    getPlayersCurrentCard(args) {

        if (!args.PLAYER || !args.PLAYER.match(regEx.ethereumAddress)) {
            return log.error(`Invalid PLAYER argument ${args.PLAYER} for the pick cards command. Must be a 40 char hexadecimal with a 0x prefix`)
        }

        if (!this.playersCurrentCard.hasOwnProperty(args.PLAYER)) {
            return log.error(`Failed to find current card of player ${args.PLAYER}. The player needs to pick cards first.`)
        }

        const playerCard = this.playersCurrentCard[args.PLAYER]

        log.debug(`Current card of player ${args.PLAYER} is ${playerCard}`)

        return playerCard
    }

    loadCards() {
        return new Promise(resolve => {

            log.debug(`About to load cards from the Blockchain cards contract`)

            // Run for some time even when no motor is connected
            setTimeout(resolve, 200)
        })
    }

    /**
     * Formats menus into a format suitable for block menus, and loading previously
     * saved projects:
     * [
     *   {
     *    text: label,
     *    value: index
     *   },
     *   {
     *    text: label,
     *    value: index
     *   },
     *   etc...
     * ]
     *
     * @param {array} menu - a menu to format.
     * @return {object} - a formatted menu as an object.
     * @private
     */
    _formatMenu (menu) {
        const m = []
        for (let i = 0; i < menu.length; i++) {
            const obj = {}
            obj.text = menu[i]
            obj.value = i.toString()
            m.push(obj)
        }
        return m
    }
}
module.exports = Scratch3CryptoBeastsBlocks