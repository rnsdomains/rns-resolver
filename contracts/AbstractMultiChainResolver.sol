pragma solidity ^0.5.0;

import "./AbstractAddrResolver.sol";

contract AbstractMultiChainResolver is AbstractAddrResolver {
    function chainAddr(bytes32 node, bytes4 chain) public view returns (string memory);
    function setChainAddr(bytes32 node, bytes4 chain, string memory addrValue) public;

    event ChainAddrChanged(bytes32 indexed node, bytes4 chain, string addr);
}
