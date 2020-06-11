pragma solidity ^0.5.0;

import "@ensdomains/resolver/contracts/profiles/AddrResolver.sol";

// Source: https://github.com/ensdomains/resolvers/blob/9c3ed5377501d77738089c81c2a0b141878048f9/contracts/profiles/AddrResolver.sol
contract RSKAddrResolver is AddrResolver {
    uint constant private COIN_TYPE_RSK = 137;

    /**
     * Sets the address associated with an RNS node.
     * @param node The node to update.
     * @param a The address to set.
     */
    function setAddr(bytes32 node, address a) external authorised(node) {
        bytes memory b = addressToBytes(a);
        emit AddressChanged(node, COIN_TYPE_RSK, b);
        emit AddrChanged(node, a);
        _addresses[node][COIN_TYPE_RSK] = b;
    }

    /**
     * Returns the address associated with an RNS node.
     * @param node The RNS node to query.
     * @return The associated address.
     */
    function addr(bytes32 node) public view returns (address payable) {
        bytes memory a = addr(node, COIN_TYPE_RSK);
        if (a.length == 0) {
            return address(0);
        }
        return bytesToAddress(a);
    }

    /**
     * Sets the coin address associated with an RNS node .
     * @param node The node to update.
     * @param coinType slip0044 coin type.
     * @param a The address to set.
     */
    function setAddr(bytes32 node, uint coinType, bytes memory a) public authorised(node) {
        emit AddressChanged(node, coinType, a);
        if(coinType == COIN_TYPE_RSK) {
            emit AddrChanged(node, bytesToAddress(a));
        }
        _addresses[node][coinType] = a;
    }
}
