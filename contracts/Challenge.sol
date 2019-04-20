
pragma solidity ^0.5.0;

contract Challenge {

    mapping (address => bool) public challenges;

    address[] public challengeQueue;

    event Challenge(address challenger);
    event Cancel(address challenger);
    event Accept(address challenger, address acceptor);

    function anyone() public {
        // can not already have issued a challenge
        require(!challenges[msg.sender], 'Already challenging');

        if (challengeQueue.length > 0) {
            // TODO currently FILO. Ideally should be FIFO
            address challenger = challengeQueue[challengeQueue.length - 1];
            challengeQueue.pop();
            challenges[challenger] = false;

            emit Accept(challenger, msg.sender);
        }
        else {
            challengeQueue.push(msg.sender);
            challenges[msg.sender] = true;

            emit Challenge(msg.sender);
        }
    }

    function isChallenging(address challenger) public view returns (bool) {
        return challenges[challenger];
    }
}