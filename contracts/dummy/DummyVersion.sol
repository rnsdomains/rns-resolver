pragma solidity ^0.5.0;

import "../ResolverV1.sol";

contract DummyVersion is ResolverV1 {
    uint public v;

    function initialize() public {
        require(!supportsInterface(this.setV.selector));
        _registerInterface(this.setV.selector);
    }

    function setV(uint _v) public {
        v = _v;
    }
}
