pragma solidity ^0.5.2;

library MathUtils {

    /**
     * @dev Subtracts two unsigned integers, if subtrahend is greater than minuend, then return 0
     */
    function subToZero(uint16 a, uint16 b) internal pure returns (uint16, uint16) {
        if(b > a) {
            return (0, b - a);
        }
        return (a - b, 0);
    }
}