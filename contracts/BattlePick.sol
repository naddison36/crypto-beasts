pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import {PlayerCardsPick} from "./PlayerCardsPick.sol";
import {Cards} from "./Cards.sol";
import {MathUtils} from "./MathUtils.sol";

contract BattlePick is PlayerCardsPick {

    enum Move {
        Attack,
        SpecialAttack,
        Ability
    }

    uint16 constant turnDefenceIncrease = 30;

    address public winningPlayer;

    event Turn(Move move, uint attachCardId, PlayerCard playerDefenceCard, address nextPlayer);
    event EndGame(address winningPlayer);
    
    constructor(address _player1, address _player2, address cardsAddress) public
        PlayerCardsPick(_player1, _player2, cardsAddress)
    {}

    function turn(Move move) public {
        require(playersTurn == msg.sender, "Not your turn");

        // Assume playersTurn == player1 as Solidity does not allow uninitialized storage pointers
        PlayerCard storage playerAttackCard = playerDecks[player1].playerCards[playerDecks[player1].currentCard];
        PlayerCard storage playerDefenceCard = playerDecks[player2].playerCards[playerDecks[player2].currentCard];
        PlayerDeck storage defenceDeck = playerDecks[player2];
        address nextPlayer = player2;
        // if (playersTurn == player1) {
        //     playerAttackCard = player1Cards[currentCardPlayer1];
        //     playerDefenceCard = player2Cards[currentCardPlayer2];
        //     nextPlayer = player2;
        // } else 
        if (playersTurn == player2) {
            playerAttackCard = playerDecks[player2].playerCards[playerDecks[player2].currentCard];
            playerDefenceCard = playerDecks[player1].playerCards[playerDecks[player1].currentCard];
            defenceDeck = playerDecks[player1];
            nextPlayer = player1;
        } else if (playersTurn != player1) {
            revert('players turn does not equal either player');
        }

        // move logic
        uint16 remainingAttackAmount;
        if (move == Move.Attack) {
            playerAttackCard.mana = playerAttackCard.mana + 1;

            // attack the defence and then health of the opponent
            attack(playerAttackCard.attack, playerDefenceCard, defenceDeck);
        } else if (move == Move.SpecialAttack) {

            // attack the defence and then health of the opponent
            attack(playerAttackCard.specialAttack, playerDefenceCard, defenceDeck);

        } else if (move == Move.Ability) {

            Card memory attackCard = cardsContract.getCard(playerAttackCard.cardId);

            require(playerAttackCard.mana + 1 >= attackCard.ability.manaCost, 'Not enough mana');

            uint16 remainder = 0;
            (playerAttackCard.mana, remainder) = MathUtils.subToZero(playerAttackCard.mana + 1, attackCard.ability.manaCost);

            Cards.CardProperties memory opponentAbility = attackCard.ability.opponent;
            Cards.CardProperties memory playerAbility = attackCard.ability.player;

            // reduce opponents current card
            (playerDefenceCard.health, remainder) = MathUtils.subToZero(playerDefenceCard.health, opponentAbility.health);
            (playerDefenceCard.defence, remainder) = MathUtils.subToZero(playerDefenceCard.defence, opponentAbility.defence);
            (playerDefenceCard.mana, remainder) = MathUtils.subToZero(playerDefenceCard.mana, opponentAbility.mana);
            (playerDefenceCard.attack, remainder) = MathUtils.subToZero(playerDefenceCard.attack, opponentAbility.attack);
            (playerDefenceCard.specialAttack, remainder) = MathUtils.subToZero(playerDefenceCard.specialAttack, opponentAbility.specialAttack);

            // if opponent health went to zero
            if (playerDefenceCard.health == 0) {
                // if last card in defence deck
                if  (defenceDeck.currentCard == defenceDeck.playerCards.length - 1) {
                    endGame(msg.sender);
                } else {
                    defenceDeck.currentCard++;
                }
            }

            // boost your current card
            playerAttackCard.health = playerAttackCard.health + playerAbility.health;
            playerAttackCard.defence = playerAttackCard.defence + playerAbility.defence;
            playerAttackCard.mana = playerAttackCard.mana + playerAbility.mana;
            playerAttackCard.attack = playerAttackCard.attack + playerAbility.attack;
            playerAttackCard.specialAttack = playerAttackCard.specialAttack + playerAbility.specialAttack;
        }
        else {
            revert('Invalid move');
        }
        
        playersTurn = nextPlayer;

        emit Turn(move, playerAttackCard.cardId, playerDefenceCard, nextPlayer);
    }

    // Attacked the defence and then health of the opponent
    function attack(uint16 attackAmount, PlayerCard storage playerDefenceCard, PlayerDeck storage defenceDeck) internal {
        uint16 remainingAttackAmount;

        if (playerDefenceCard.defence > 0) {
            (playerDefenceCard.defence, remainingAttackAmount) = MathUtils.subToZero(playerDefenceCard.defence, attackAmount);

            if (remainingAttackAmount > 0) {
                (playerDefenceCard.health, remainingAttackAmount) = MathUtils.subToZero(playerDefenceCard.health, remainingAttackAmount);

                if (remainingAttackAmount > 0) {
                    defenceDeck.currentCard++;
                    if (defenceDeck.currentCard > defenceDeck.playerCards.length) {
                        endGame(msg.sender);
                    }
                    attack(remainingAttackAmount, defenceDeck.playerCards[defenceDeck.currentCard], defenceDeck);
                }
            }
        } else {

            (playerDefenceCard.health, remainingAttackAmount) = MathUtils.subToZero(playerDefenceCard.health, attackAmount);

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