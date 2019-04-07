pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import {Cards} from "./Cards.sol";

contract PlayerCards is Cards {

    struct PlayerCard {
        uint cardId;
        address player;

        uint16 health;
        uint16 defence;
        uint16 mana;

        uint16 attack;
        uint16 specialAttack;
    }

    address public player1;
    address public player2;
    uint8 public currentCardPlayer1 = 0;
    uint8 public currentCardPlayer2 = 0;
    PlayerCard[] public player1Cards;
    PlayerCard[] public player2Cards;
    bool public cardsPicked;

    constructor(address _player1, address _player2) public {
        player1 = _player1;
        player2 = _player2;
    }

    function _randomNumber(uint numberOfPicks) private view returns (uint) {

        uint rand = uint(
            keccak256(
                abi.encodePacked(
                    blockhash(block.number - 1),
                    msg.sender,
                    cards.length
                )
            )
        );
        return rand % numberOfPicks;
    }

    function _setPlayerCard(PlayerCard[] storage playerCards, uint cardId) internal {

        playerCards.push( PlayerCard({
            cardId: cardId,
            player: msg.sender,
            health: cards[cardId].initHealth,
            defence: cards[cardId].initDefence,
            mana: cards[cardId].initMana,
            attack: cards[cardId].attack,
            specialAttack: cards[cardId].specialAttack
        }));
    }

    function pickPayerCards(uint[5] memory desiredCards) public {

        PlayerCard[] storage playerCards = player1Cards;
        if (player1 == msg.sender) {
            require(player1Cards.length == 0, 'Player 1 has already picked their cards');
            if (player2Cards.length > 0) {
                cardsPicked = true;
            }
        }
        else if (player2 == msg.sender) {
            require(player2Cards.length == 0, 'Player 2 has already picked their cards');
            playerCards = player2Cards;
            if (player1Cards.length > 0) {
                cardsPicked = true;
            }
        } else {
            revert('Transaction sender must be player 1 or 2');
        }

        uint[3] memory pickedCardNumbers = [uint(0), 0, 0];

        // pick one of the 5
        pickedCardNumbers[0] = _randomNumber(5);
        _setPlayerCard(playerCards, desiredCards[pickedCardNumbers[0]]);

        // 40% chance picking one of the remaining 4 cards. If not, get a random card
        // then just pick a random card
        pickedCardNumbers[1] = _randomNumber(10);
        // if picked the same card as before, or not the first 5 desgined cards
        if (pickedCardNumbers[1] == pickedCardNumbers[0] ||
            pickedCardNumbers[1] > 4) {
            pickedCardNumbers[1] = _randomNumber(cards.length - 1);
            // _setPlayerCard(playerCards[1], pickedCardNumbers[1]);
        }
        else {
            // _setPlayerCard(playerCards[1], desiredCards[pickedCardNumbers[1]]);
        }

        pickedCardNumbers[2] = _randomNumber(cards.length - 1);
        // _setPlayerCard(playerCards[2], thirdCardId);

        emit PickPayerCards(desiredCards, pickedCardNumbers);
    }

    event PickPayerCards(uint[5] desiredCards, uint[3] pickedCards);
}