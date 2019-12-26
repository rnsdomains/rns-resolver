pragma solidity ^0.5.0;

import "@openzeppelin/contracts/introspection/IERC165.sol";

contract AbstractAddrResolver is IERC165 {
    function addr(bytes32 node) public view returns (address ret);
    function setAddr(bytes32 node, address addrValue) public;

    event AddrChanged(bytes32 indexed node, address addr);
}
