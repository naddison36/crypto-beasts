
contract Testing {

    uint256 counter = 1;

    event Increment(uint256 counter);
    
    function failRequire() public {
        require(false, 'Failed require');
    }

    function msgSender() public view returns (address) {
        return msg.sender;
    }

    function increment() public returns (uint256) {

        emit Increment(counter++);
    }

    bool fail = false;

    function toggleFail() public {
        if (fail) {
            revert('Fail transaction');
            fail = false;
        }
        else {
            fail = true;
        }
    }
}