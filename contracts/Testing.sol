
contract Testing {

    bool public fail = false;

    function testTx() public {
        require(fail == false, 'Tx set to fail');
    }

    function setFail(bool _fail) public {
        fail = _fail;
    }
}
