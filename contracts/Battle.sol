pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import "./PlayerCards.sol";

contract Battle is PlayerCards {

    enum Move {
        Attack,
        SpecialAttack,
        Ability
    }

    uint16 constant turnDefenceIncrease = 50;

    address player1;
    address player2;
    uint8 currenctCardPlayer1 = 0;
    uint8 currenctCardPlayer2 = 0;
    address playersTurn;
    address winningPlayer;

    PlayerCard[] public player1Cards;
    PlayerCard[] public player2Cards;
    bool cardsPicked;

    event Turn(Move move, uint attachCardId, PlayerCard defenceCard, address nextPlayer);

    constructor(address _player1, address _player2) public {
        player1 = _player1;
        player2 = _player2;
    }

    function pickCards(uint[5] memory desiredCards) public {

        if (player1 == msg.sender) {
            require(player1Cards.length == 0, "Player 1 already picked deck");
            player1Cards = getPayerCards(desiredCards);

            if (player2Cards.length > 0) {
                _startBattle();
            }
        }
        else if (player2 == msg.sender) {
            require(player2Cards.length == 0, "Player 2 already picked deck");
            player2Cards = getPayerCards(desiredCards);

            if (player1Cards.length > 0) {
                _startBattle();
            }
        }
        else {
            revert("Not a player");
        }
    }
    
    function _startBattle() internal {
        cardsPicked = true;

        // TODO work out who goes first. Will just set to player 1 for now
        // Get the card with the highest speed from each player
        // the player with the hihest speed does first
        playersTurn = player1;
    }

    function turn(Move move) public {
        require(playersTurn == msg.sender);

        // Who is the next player's turn?
        PlayerCard attackCard;
        PlayerCard defenceCard;
        address nextPlayer;
        if (playersTurn == player1) {
            attackCard = player1Cards[currenctCardPlayer2];
            defenceCard = player2Cards[currenctCardPlayer2];
            nextPlayer = player2;
        } else if (playersTurn == player2) {
            attackCard = player2Cards[currenctCardPlayer1];
            defenceCard = player1Cards[currenctCardPlayer1];
            nextPlayer = player1;
        }

        // TODO move logic
        uint16 attackAmount;
        if (move == Move.Attack) {
            attackAmount = cards[attackCard.cardId].attacks;
        } else if (move == Move.SpecialAttack) {
            attackAmount = cards[attackCard.cardId].specialAttacks;
        }

        if (defenceCard.defence > 0) {
            if (defenceCard.defence > attackAmount) {
                defenceCard.defence = defenceCard.defence - attackAmount;
            }
            else {
                defenceCard.defence = 0;
                if (defenceCard.health > attackAmount) {
                    defenceCard.health = defenceCard.health - attackAmount;
                }
                else {
                    defenceCard.health = 0;
                    nextCard();
                }
            }
        } else {
            if (defenceCard.health > attackAmount) {
                    defenceCard.health = defenceCard.health - attackAmount;
                }
                else {
                    defenceCard.health = 0;
                    nextCard();
                }
        }

        // increase attackers defence
        attackCard.defence = attackCard.defence + turnDefenceIncrease;
        
        playersTurn = nextPlayer;

        emit Turn(move, attackCard.cardId, defenceCard, nextPlayer);
    }

    function nextCard() public {
        // if not next card the end the game
    }

    function endGame() public {

    }
}