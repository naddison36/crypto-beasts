
pragma solidity ^0.5.0;

contract Challenge {

    address public challenger = address(0);

    event Challenge(address challenger);
    event Cancel(address challenger);
    event Accept(address challenger, address acceptor);

    function challenge() public {
        // have already issued a challenge
        require(challenger != msg.sender, 'Already challenging');

        if (challenger == address(0)) {
            challenger = msg.sender;
            emit Challenge(msg.sender);
        }
        else {
            emit Accept(challenger, msg.sender);
            challenger = address(0);
        }
    }

    function cancel() public {
        require(challenger == msg.sender);
        
        emit Cancel(msg.sender);
    }
}