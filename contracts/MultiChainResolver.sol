pragma solidity ^0.5.0;

import "@rsksmart/rns-registry/contracts/AbstractRNS.sol";
import "./AbstractPublicResolver.sol";
import "./AbstractMultiChainResolver.sol";
import "./AddressUtil.sol";

contract MultiChainResolver is AbstractMultiChainResolver {
    AbstractRNS rns;
    AbstractPublicResolver publicResolver;

    AddressUtil addressHelper;

    mapping (bytes32 => bytes32) contents;
    mapping (bytes32 => mapping (bytes8 => ChainAddress)) chainAddresses;

    bytes4 constant ADDR_SIGN = 0x3b3b57de;
    bytes4 constant CONTENT_SIGN = 0x2dff6941;
    bytes4 constant CHAIN_ADDR_SIGN = 0x8be4b5f6;

    bytes4 constant RSK_CHAIN_ID = 0x80000089;

    event ContentChanged (bytes32 node, bytes32 content);
    event ChainMetadataChanged (bytes32 node, bytes4 chain, bytes32 metadata);

    struct ChainAddress {
        bytes32 metadata;
        string addr;
    }

    modifier onlyOwner (bytes32 node) {
        require(rns.owner(node) == msg.sender);
        _;
    }

    constructor (AbstractRNS _rns, AbstractPublicResolver _publicResolver) public {
        rns = _rns;
        publicResolver = _publicResolver;
        addressHelper = new AddressUtil();
    }

    function () external {
        revert();
    }

    function supportsInterface (bytes4 interfaceId) public view returns (bool) {
        return ((interfaceId == ADDR_SIGN) || (interfaceId == CONTENT_SIGN) || interfaceId == (CHAIN_ADDR_SIGN));
    }

    function addr (bytes32 node) public view returns (address) {
        string memory _addr = chainAddresses[node][RSK_CHAIN_ID].addr;

        if (bytes(_addr).length > 0) {
            return addressHelper.stringToAddress(_addr);
        }

        return publicResolver.addr(node);
    }

    function setAddr (bytes32 node, address addrValue) public onlyOwner(node) {
        chainAddresses[node][RSK_CHAIN_ID].addr = addressHelper.addressToString(addrValue);
        emit AddrChanged(node, addrValue);
    }

    function content (bytes32 node) public view returns (bytes32) {
        bytes32 _content = contents[node];

        if (_content != 0) {
            return _content;
        }

        return publicResolver.content(node);
    }

    function setContent (bytes32 node, bytes32 contentValue) public onlyOwner(node) {
        contents[node] = contentValue;
        emit ContentChanged(node, contentValue);
    }

    function chainAddr (bytes32 node, bytes4 chain) public view returns (string memory) {
        return chainAddresses[node][chain].addr;
    }

    function setChainAddr (bytes32 node, bytes4 chain, string memory addrValue) public onlyOwner(node) {
        chainAddresses[node][chain].addr = addrValue;
        if (chain == RSK_CHAIN_ID) {
            address _addr = addressHelper.stringToAddress(addrValue);
            emit AddrChanged(node, _addr);
        } else {
            emit ChainAddrChanged(node, chain, addrValue);
        }
    }

    function chainMetadata (bytes32 node, bytes4 chain) public view returns (bytes32) {
        return chainAddresses[node][chain].metadata;
    }

    function setChainMetadata (bytes32 node, bytes4 chain, bytes32 metadataValue) public onlyOwner(node) {
        chainAddresses[node][chain].metadata = metadataValue;
        emit ChainMetadataChanged(node, chain, metadataValue);
    }

    function chainAddrAndMetadata (bytes32 node, bytes4 chain) public view returns (string memory, bytes32) {
        ChainAddress storage chainAddress = chainAddresses[node][chain];
        return (chainAddress.addr, chainAddress.metadata);
    }

    function setChainAddrWithMetadata (bytes32 node, bytes4 chain, string memory addrValue, bytes32 metadataValue) public onlyOwner(node) {
        setChainAddr(node, chain, addrValue);
        setChainMetadata(node, chain, metadataValue);
    }
}
