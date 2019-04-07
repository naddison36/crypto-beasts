pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import {PlayerCards} from "./PlayerCards.sol";

contract Battle is PlayerCards {

    enum Move {
        Attack,
        SpecialAttack,
        Ability
    }

    uint16 constant turnDefenceIncrease = 30;

    address public winningPlayer;

    event Turn(Move move, uint attachCardId, PlayerCard defenceCard, address nextPlayer);
    
    constructor(address _player1, address _player2) public
        PlayerCards(_player1, _player2)
    {}

    function turn(Move move) public {
        require(playersTurn == msg.sender, "Not your turn");

        // Assume playersTurn == player1 as Solidity does not allow uninitialized storage pointers
        PlayerCard storage attackCard = playerDecks[player1].playerCards[playerDecks[player1].currentCard];
        PlayerCard storage defenceCard = playerDecks[player2].playerCards[playerDecks[player2].currentCard];
        address nextPlayer = player2;
        // if (playersTurn == player1) {
        //     attackCard = player1Cards[currentCardPlayer1];
        //     defenceCard = player2Cards[currentCardPlayer2];
        //     nextPlayer = player2;
        // } else 
        if (playersTurn == player2) {
            attackCard = playerDecks[player2].playerCards[playerDecks[player2].currentCard];
            defenceCard = playerDecks[player1].playerCards[playerDecks[player1].currentCard];
            nextPlayer = player1;
        } else if (playersTurn != player1) {
            revert('players turn does not equal either player');
        }

        // move logic
        uint16 attackAmount;
        if (move == Move.Attack) {
            attackAmount = attackCard.attack;
            attackCard.mana = attackCard.mana + 1;
        } else if (move == Move.SpecialAttack) {
            attackAmount = attackCard.specialAttack;

            require(attackCard.mana > 0);
            attackCard.mana = attackCard.mana - 1;
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
                    nextCard(attackAmount - defenceCard.health);
                }
            }
        } else {
            if (defenceCard.health > attackAmount) {
                    defenceCard.health = defenceCard.health - attackAmount;
                }
                else {
                    defenceCard.health = 0;
                    nextCard(attackAmount - defenceCard.health);
                }
        }

        // increase attackers defence
        attackCard.defence = attackCard.defence + turnDefenceIncrease;
        
        playersTurn = nextPlayer;

        emit Turn(move, attackCard.cardId, defenceCard, nextPlayer);
    }

    function nextCard(uint16 remainingAttachAmount) public {
        // if not next card the end the game
        return;
    }

    function endGame() public {
        return;
    }
}