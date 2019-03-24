const formatMessage = require('format-message');

const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const log = require('../../util/log');

const cardProperty = [
    'Name',
    'Ability',
    'Speed',
    'Attack',
    'Special',
    'Health',
    'Defence',
    'Mana']

class Scratch3CryptoBeastsBlocks {

    constructor(runtimeProxy) {
        this.runtime = runtimeProxy;
    }

    getInfo() {

        return {
            // Required: the machine-readable name of this extension.
            // Will be used as the extension's namespace.
            id: 'cryptoBeasts',

            // Optional: the human-readable name of this extension as string.
            // This and any other string to be displayed in the Scratch UI may either be
            // a string or a call to `formatMessage`; a plain string will not be
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
                description: 'Crypto Beasts extension'
            }),

            // Optional: URI for a block icon, to display at the edge of each block for this
            // extension. Data URI OK.
            // TODO: what file types are OK? All web images? Just PNG?
            // blockIconURI: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAFCAAAAACyOJm3AAAAFklEQVQYV2P4DwMMEMgAI/+DEUIMBgAEWB7i7uidhAAAAABJRU5ErkJggg==',

            // Optional: URI for an icon to be displayed in the blocks category menu.
            // If not present, the menu will display the block icon, if one is present.
            // Otherwise, the category menu shows its default filled circle.
            // Data URI OK.
            // TODO: what file types are OK? All web images? Just PNG?
            // menuIconURI: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAFCAAAAACyOJm3AAAAFklEQVQYV2P4DwMMEMgAI/+DEUIMBgAEWB7i7uidhAAAAABJRU5ErkJggg==',

            // Optional: Link to documentation content for this extension.
            // If not present, offer no link.
            docsURI: 'https://github.com/naddison36/loom-scratch-tcg',

            // Required: the list of blocks implemented by this extension,
            // in the order intended for display.
            blocks: [
                {
                    // Required: the machine-readable name of this operation.
                    // This will appear in project JSON.
                    opcode: 'turn', // becomes 'cryptoBeastsBlocks.myReporter'

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
                    // specify a branch count of 1; an "if-else" block would specify a
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
                        id: 'cryptoBeasts.turn',
                        default: 'Player [PLAYER] makes move [MOVE]',
                        description: 'Player has a turn by making a move'
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
                            default: 1
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
                        default: 'get [CARD_PROPERTY] for card [CARD_ID]',
                        description: 'get a property of a card'
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        CARD_PROPERTY: {
                            type: ArgumentType.STRING,
                            menu: 'cardProperty',
                            defaultValue: 'Name'
                        },
                        CARD_ID: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        }
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
                            description: 'Attack move'
                        })
                    },
                    {
                        value: 2,
                        text: formatMessage({
                            id: 'cryptoBeasts.menu.move.specialAttack',
                            default: 'Special Attack',
                            description: 'Special attack move'
                        })
                    },
                ],

                cardProperty: this._formatMenu(cardProperty),
            }
        }
    }

    turn (args, util) {
        // This message contains ICU placeholders, not Scratch placeholders
        const message = formatMessage({
            id: 'turn.result',
            default: 'Player move {MOVE}.',
            description: 'Player makes a move on their turn'
        });

        log.debug(`Player's ? turn is move ${JSON.stringify(args)}`);
    }

    getCardProperty(args) {

        log.debug(`get ${args.CARD_PROPERTY} for card with id ${args.CARD_ID}`);
        return `${rgs.CARD_PROPERTY} of card id ${args.CARD_ID}`;
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
        const m = [];
        for (let i = 0; i < menu.length; i++) {
            const obj = {};
            obj.text = menu[i];
            obj.value = i.toString();
            m.push(obj);
        }
        return m;
    }
}
module.exports = Scratch3CryptoBeastsBlocks;