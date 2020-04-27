pragma solidity ^0.5.0;

import "./AbstractAddrResolver.sol";

contract AbstractPublicResolver is AbstractAddrResolver {
    function content(bytes32 node) public view returns (bytes32 ret);
    function setContent(bytes32 node, bytes32 hashValue) public;

    function has(bytes32 node, bytes32 kind) public view returns (bool);
}
