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

    address playersTurn;
    address winningPlayer;

    event Turn(Move move, uint attachCardId, PlayerCard defenceCard, address nextPlayer);
    
    constructor(address _player1, address _player2) public
        PlayerCards(_player1, _player2)
    {}

    function startBattle() public {
        cardsPicked = true;

        // TODO work out who goes first. Will just set to player 1 for now
        // Get the card with the highest speed from each player
        // the player with the hihest speed does first
        playersTurn = player1;
    }

    function turn(Move move) public {
        require(playersTurn == msg.sender, "Not your turn");

        // Assume playersTurn == player1 as Solidity does not allow uninitialized storage pointers
        PlayerCard storage attackCard = player1Cards[currenctCardPlayer1];
        PlayerCard storage defenceCard = player2Cards[currenctCardPlayer2];
        address nextPlayer = player2;
        // if (playersTurn == player1) {
        //     attackCard = player1Cards[currenctCardPlayer1];
        //     defenceCard = player2Cards[currenctCardPlayer2];
        //     nextPlayer = player2;
        // } else 
        if (playersTurn == player2) {
            attackCard = player2Cards[currenctCardPlayer2];
            defenceCard = player1Cards[currenctCardPlayer1];
            nextPlayer = player1;
        } else if (playersTurn != player1) {
            revert('players turn does not equal either player');
        }

        // move logic
        uint16 attackAmount;
        if (move == Move.Attack) {
            attackAmount = attackCard.attack;
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