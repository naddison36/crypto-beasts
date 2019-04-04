const Cards = artifacts.require("./Cards.sol");
const PlayerCards = artifacts.require("./PlayerCards.sol");
const Battle = artifacts.require("./Battle.sol");

const player1 = '0x48118F98aD3aceF72Bc33D42C0E2fa3B16751d38'
const player2 = '0xFf33Eb72e6184E5102Fb9938Ff360c131835861D'

module.exports = function(deployer) {
  // deployer.deploy(Cards);
  // deployer.deploy(PlayerCards, player1, player2);
  deployer.deploy(Battle, player1, player2);
};
