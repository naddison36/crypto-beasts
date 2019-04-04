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
    }

    address player1;
    address player2;
    uint8 currenctCardPlayer1 = 0;
    uint8 currenctCardPlayer2 = 0;
    PlayerCard[] public player1Cards;
    PlayerCard[] public player2Cards;
    bool cardsPicked;

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

    function _setPlayerCard(PlayerCard storage playerCard, uint cardId) internal {
        
        playerCard.cardId = cardId;
        playerCard.player = msg.sender;
        playerCard.health = cards[cardId].initHealth;
        playerCard.defence = cards[cardId].initDefence;
        playerCard.mana = cards[cardId].initMana;
    }

    function pickPayerCards(address player, uint[5] memory desiredCards) public returns(bool) {

        PlayerCard[] storage playerCards = player1Cards;
        if (player1 == address(0)) {
            player1 = player;
        } else if (player2 == address(0)) {
            require(player1 != player, 'Player 1 and 2 are the same');
            player2 = player;
            playerCards = player2Cards;
            cardsPicked = true;
        }
        else {
            revert('Cards for both players already picked');
        }

        // pick one of the 5
        uint firstCardPicked = _randomNumber(5);
        _setPlayerCard(playerCards[0], desiredCards[firstCardPicked]);

        // 40% chance picking one of the remaining 4 cards. If not, get a random card
        // then just pick a random card
        uint secondCardPicked = _randomNumber(10);
        if (secondCardPicked == firstCardPicked ||
            secondCardPicked > 4) {
            uint secondCardId = _randomNumber(cards.length - 1);
            _setPlayerCard(playerCards[1], secondCardId);
        }
        else {
            _setPlayerCard(playerCards[2], desiredCards[secondCardPicked]);
        }

        uint thirdCardId = _randomNumber(cards.length - 1);
        _setPlayerCard(playerCards[2], thirdCardId);

        return true;
    }
}