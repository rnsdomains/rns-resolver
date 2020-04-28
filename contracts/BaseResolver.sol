pragma solidity ^0.5.0;

import "@rsksmart/rns-registry/contracts/AbstractRNS.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/introspection/ERC165.sol";

/**
 * @title BaseResolver
 * @dev This contract brings together the necessary components of a resolver. It has
 * the rns registry to verify the domain owner and an interface to add supported
 * interfaces over time.
 */
contract BaseResolver is ERC165 {
    AbstractRNS public rns;

    /// @notice Initializes the contract.
    /// @dev Replace the usage of a constructor.
    /// @param _rns the RNS Registry address.
    function initialize(AbstractRNS _rns) initializer external {
        ERC165.initialize();

        rns = _rns;
    }

    /// @notice Gets the current owner of a domain
    /// @param node The node to query the owner for
    /// @return The owner of the domain
    function rnsOwner(bytes32 node) external view returns(address) {
        return rns.owner(node);
    }
}
