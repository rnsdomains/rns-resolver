pragma solidity ^0.5.0;

import "@rsksmart/rns-registry/contracts/AbstractRNS.sol";
import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "./RSKAddrResolver.sol";
import "@ensdomains/resolver/contracts/profiles/ContentHashResolver.sol";
import "@ensdomains/resolver/contracts/profiles/ABIResolver.sol";
import "@ensdomains/resolver/contracts/profiles/PubkeyResolver.sol";
import "@ensdomains/resolver/contracts/profiles/TextResolver.sol";
import "@ensdomains/resolver/contracts/profiles/InterfaceResolver.sol";

/**
 * @title ResolverV1
 * @dev A public resolver implementation. This implementation can
 * be as an openzeppelin/upgrades v2.8 proxy contract implementation.
 * Source: https://github.com/ensdomains/resolvers/blob/9c3ed5377501d77738089c81c2a0b141878048f9/contracts/PublicResolver.sol
 */
contract ResolverV1 is Initializable, RSKAddrResolver, ContentHashResolver, ABIResolver, PubkeyResolver, TextResolver, InterfaceResolver {
    AbstractRNS public rns;

    /**
     * A mapping of authorisations. An address that is authorised for a name
     * may make any changes to the name that the owner could, but may not update
     * the set of authorisations.
     * (node, owner, caller) => isAuthorised
     */
    mapping(bytes32=>mapping(address=>mapping(address=>bool))) public authorisations;

    event AuthorisationChanged(bytes32 indexed node, address indexed owner, address indexed target, bool isAuthorised);

    /**
     * @notice Initializes the contract.
     * @dev Replace the usage of a constructor.
     * @param _rns the RNS Registry address.
     */
    function initialize(AbstractRNS _rns) initializer external {
        rns = _rns;
    }

    /**
     * @dev Sets or clears an authorisation.
     * Authorisations are specific to the caller. Any account can set an authorisation
     * for any name, but the authorisation that is checked will be that of the
     * current owner of a name. Thus, transferring a name effectively clears any
     * existing authorisations, and new authorisations can be set in advance of
     * an ownership transfer if desired.
     *
     * @param node The name to change the authorisation on.
     * @param target The address that is to be authorised or deauthorised.
     * @param isAuthorised True if the address should be authorised, or false if it should be deauthorised.
     */
    function setAuthorisation(bytes32 node, address target, bool isAuthorised) external {
        authorisations[node][msg.sender][target] = isAuthorised;
        emit AuthorisationChanged(node, msg.sender, target, isAuthorised);
    }

    function isAuthorised(bytes32 node) internal view returns(bool) {
        address owner = rns.owner(node);
        return owner == msg.sender || authorisations[node][owner][msg.sender];
    }
}
