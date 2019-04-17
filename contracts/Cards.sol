pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";
import {CryptoBeastsTypes} from "./CryptoBeastsTypes.sol";

contract Cards is Ownable, CryptoBeastsTypes {

    event NewCard(uint cardId, Card card);

    Card[] public cards;

    function createCard(Card memory card) public
        onlyOwner()
    {
        uint cardId = cards.push(card) - 1;
        emit NewCard(cardId, card);
    }

    function cardCount() public returns (uint) {
        return cards.length;
    }

    function getCard(uint index) public returns (Card memory) {
        return cards[index];
    }
}
