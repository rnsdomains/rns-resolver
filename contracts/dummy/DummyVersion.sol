pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import "../ResolverV1.sol";

contract DummyVersion is ResolverV1 {
    uint public v;

    event Log();

    function initialize() public {
        emit Log();
    }

    function setV(uint _v) public {
        v = _v;
    }

    function supportsInterface(bytes4 interfaceID) public pure returns(bool) {
        return interfaceID == this.setV.selector || super.supportsInterface(interfaceID);
    }
}
