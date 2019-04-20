
contract Testing {

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