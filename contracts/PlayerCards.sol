pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import {Cards} from "./Cards.sol";

contract PlayerCards is Cards {

    struct PlayerCard {
        uint cardId;

        uint16 health;
        uint16 defence;
        uint16 mana;

        uint16 attack;
        uint16 specialAttack;
    }

    struct PlayerDeck {
        PlayerCard[] playerCards;
        uint8 currentCard;
    }

    address public player1;
    address public player2;
    mapping (address => PlayerDeck) public playerDecks;
    bool public cardsPicked;
    address public playersTurn;

    constructor(address _player1, address _player2) public {
        player1 = _player1;
        player2 = _player2;
    }

    function _randomNumber(uint numberOfPicks, uint8 pickNumber) private view returns (uint) {

        uint rand = uint(
            keccak256(
                abi.encodePacked(
                    pickNumber,
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
            health: cards[cardId].initHealth,
            defence: cards[cardId].initDefence,
            mana: cards[cardId].initMana,
            attack: cards[cardId].attack,
            specialAttack: cards[cardId].specialAttack
        }));
    }

    function getPlayerCurrentCard(address player) public view returns (PlayerCard memory) {

        uint8 deckNumber = playerDecks[player].currentCard;

        return playerDecks[player].playerCards[deckNumber];
    }

    function getPlayersCurrentCardNumber(address player) public view returns (uint8) {
        return playerDecks[player].currentCard;
    }

    function pickPayerCards(uint[5] memory desiredCards) public {

        PlayerCard[] storage playerCards = playerDecks[msg.sender].playerCards;
        require(playerCards.length == 0, 'Player has already picked their cards');

        if (player1 == msg.sender) {
            if (playerDecks[player2].playerCards.length > 0) {
                cardsPicked = true;
            }
        }
        else if (player2 == msg.sender) {
            if (playerDecks[player1].playerCards.length > 0) {
                cardsPicked = true;
            }
        } else {
            revert('Transaction sender must be player 1 or 2');
        }

        uint[3] memory pickedCardNumbers = [uint(0), 0, 0];

        // pick one of the 5
        uint randomPick1 = _randomNumber(5, 1);
        _setPlayerCard(playerCards, desiredCards[randomPick1]);
        pickedCardNumbers[0] = playerCards[0].cardId;

        // 40% chance picking one of the remaining 4 cards. If not, get a random card
        // then just pick a random card
        uint randomPick2 = _randomNumber(10, 2);
        // if picked the same card as before, or not the first 5 desgined cards
        if (randomPick1 == randomPick2 ||
            randomPick2 > 4) {
            randomPick2 = _randomNumber(cards.length - 1, 2);
            // pick any card
            _setPlayerCard(playerCards, randomPick2);
        }
        else {
            // Pick from the desired cards
            _setPlayerCard(playerCards, desiredCards[randomPick2]);
        }

        pickedCardNumbers[1] = playerCards[1].cardId;

        uint randomPick3 = _randomNumber(cards.length - 1, 3);
        _setPlayerCard(playerCards, randomPick3);

        pickedCardNumbers[2] = playerCards[2].cardId;

        emit PickPayerCards(desiredCards, pickedCardNumbers);

        if (cardsPicked) {
            startBattle();
        }
    }

    event PickPayerCards(uint[5] desiredCards, uint[3] pickedCards);

    function startBattle() internal {
        require(cardsPicked, 'Both players have to have picked their cards');

        uint16 player1MaxSpeed = calcMaxSpeed(playerDecks[player1].playerCards);
        uint16 player2MaxSpeed = calcMaxSpeed(playerDecks[player2].playerCards);

        if (player1MaxSpeed >= player2MaxSpeed) {
            playersTurn = player1;
        }
        else {
            playersTurn = player2;
        }
    }

    function calcMaxSpeed(PlayerCard[] memory playerCards) public returns (uint16) {

        uint16 maxSpeed = 0;

        for (uint i=0; i<playerCards.length; i++) {

            uint16 cardSpeed = cards[playerCards[i].cardId].speed;

            if (cardSpeed > maxSpeed) {
                maxSpeed = cardSpeed;
            }
        }

        return maxSpeed;
    }
}