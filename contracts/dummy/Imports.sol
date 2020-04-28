pragma solidity ^0.5.0;

import "@openzeppelin/upgrades/contracts/upgradeability/ProxyFactory.sol";
import "@openzeppelin/upgrades/contracts/upgradeability/ProxyAdmin.sol";

contract Dummy {
    constructor() internal {
        revert("This contract is used to import dependencies. Do not use.");
    }
}
