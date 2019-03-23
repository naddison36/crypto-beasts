pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import "./Cards.sol";

contract PlayerCards is Cards {

    struct PlayerCard {
        uint cardId;
        address player;

        uint16 health;
        uint16 defence;
        uint16 mana;
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

    function _createPlayerCard(uint cardId) internal returns(PlayerCard memory) {
        
        return PlayerCard(
            cardId,
            msg.sender,
            cards[cardId].initHealth,
            cards[cardId].initDefence,
            cards[cardId].initMana
        );
    }

    function getPayerCards(uint[5] memory desiredCards) public returns(PlayerCard[] memory) {

        PlayerCard[] memory playerCards;

        // pick one of the 5
        uint firstCardPicked = _randomNumber(5);
        playerCards[0] = _createPlayerCard(desiredCards[firstCardPicked]);

        // 40% chance picking one of the remaining 4 cards. If not, get a random card
        // then just pick a random card
        uint secondCardPicked = _randomNumber(10);
        if (secondCardPicked == firstCardPicked ||
            secondCardPicked > 4) {
            uint secondCardId = _randomNumber(cards.length - 1);
            playerCards[1] = _createPlayerCard(secondCardId);
        }
        else {
            playerCards[2] = _createPlayerCard(desiredCards[secondCardPicked]);
        }

        uint thirdCardId = _randomNumber(cards.length - 1);
        playerCards[2] = _createPlayerCard(thirdCardId);

        return playerCards;
    }
}