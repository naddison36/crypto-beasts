pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import {PlayerCards} from "./PlayerCards.sol";
import {MathUtils} from "./MathUtils.sol";

contract Battle is PlayerCards {

    enum Move {
        Attack,
        SpecialAttack,
        Ability
    }

    uint16 constant turnDefenceIncrease = 30;

    address public winningPlayer;

    event Turn(Move move, uint attachCardId, PlayerCard defenceCard, address nextPlayer);
    event EndGame(address winningPlayer);
    
    constructor(address _player1, address _player2) public
        PlayerCards(_player1, _player2)
    {}

    function turn(Move move) public {
        require(playersTurn == msg.sender, "Not your turn");

        // Assume playersTurn == player1 as Solidity does not allow uninitialized storage pointers
        PlayerCard storage attackCard = playerDecks[player1].playerCards[playerDecks[player1].currentCard];
        PlayerCard storage defenceCard = playerDecks[player2].playerCards[playerDecks[player2].currentCard];
        PlayerDeck storage defenceDeck = playerDecks[player2];
        address nextPlayer = player2;
        // if (playersTurn == player1) {
        //     attackCard = player1Cards[currentCardPlayer1];
        //     defenceCard = player2Cards[currentCardPlayer2];
        //     nextPlayer = player2;
        // } else 
        if (playersTurn == player2) {
            attackCard = playerDecks[player2].playerCards[playerDecks[player2].currentCard];
            defenceCard = playerDecks[player1].playerCards[playerDecks[player1].currentCard];
            defenceDeck = playerDecks[player1];
            nextPlayer = player1;
        } else if (playersTurn != player1) {
            revert('players turn does not equal either player');
        }

        // move logic
        uint16 attackAmount;
        uint16 remainingAttackAmount;
        if (move == Move.Attack) {
            attackAmount = attackCard.attack;
            attackCard.mana = attackCard.mana + 1;
        } else if (move == Move.SpecialAttack) {
            attackAmount = attackCard.specialAttack;

            require(attackCard.mana > 0);
            attackCard.mana = attackCard.mana - 1;
        } else if (move == Move.Ability) {
            uint16 remainder = 0;

            // reduce opponents current card
            // (defenceCard.health, remainder) = MathUtils.subToZero(defenceCard.health, remainingAttackAmount);

            // boost your current card
        }

        // attack the defence and then health of the opponent
        attack(attackAmount, defenceCard, defenceDeck);

        // increase attackers defence
        attackCard.defence = attackCard.defence + turnDefenceIncrease;
        
        playersTurn = nextPlayer;

        emit Turn(move, attackCard.cardId, defenceCard, nextPlayer);
    }

    // Attacked the defence and then health of the opponent
    function attack(uint16 attackAmount, PlayerCard storage defenceCard, PlayerDeck storage defenceDeck) internal {
        uint16 remainingAttackAmount;

        if (defenceCard.defence > 0) {
            (defenceCard.defence, remainingAttackAmount) = MathUtils.subToZero(defenceCard.defence, attackAmount);

            if (remainingAttackAmount > 0) {
                (defenceCard.health, remainingAttackAmount) = MathUtils.subToZero(defenceCard.health, remainingAttackAmount);

                if (remainingAttackAmount > 0) {
                    defenceDeck.currentCard++;
                    if (defenceDeck.currentCard > defenceDeck.playerCards.length) {
                        endGame(msg.sender);
                    }
                    attack(remainingAttackAmount, defenceDeck.playerCards[defenceDeck.currentCard], defenceDeck);
                }
            }
        } else {

            (defenceCard.health, remainingAttackAmount) = MathUtils.subToZero(defenceCard.health, attackAmount);

            if (remainingAttackAmount > 0) {
                defenceDeck.currentCard++;
                if (defenceDeck.currentCard > defenceDeck.playerCards.length) {
                    endGame(msg.sender);
                }
                attack(remainingAttackAmount, defenceDeck.playerCards[defenceDeck.currentCard], defenceDeck);
            }
        }
    }

    function endGame(address _winningPlayer) public {
        winningPlayer = _winningPlayer;
        playersTurn = address(0);

        emit EndGame(winningPlayer);
    }
}