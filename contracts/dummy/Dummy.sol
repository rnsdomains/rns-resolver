pragma solidity ^0.5.0;

import "../ResolverV1.sol";
import "@openzeppelin/contracts/introspection/IERC165.sol";

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

contract TruthyERC165 is IERC165 {
    function supportsInterface(bytes4 interfaceId) external view returns (bool) {
        return true;
    }
}

contract FalsyERC165 is IERC165 {
    function supportsInterface(bytes4 interfaceId) external view returns (bool) {
        return false;
    }
}
