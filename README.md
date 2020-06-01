<p align="middle">
    <img src="https://www.rifos.org/assets/img/logo.svg" alt="logo" height="100" >
</p>
<h3 align="middle"><code>rns-resolver</code></h3>
<p align="middle">
    RNS Resolver
</p>
<p align="middle">
    <a href="https://circleci.com/gh/rnsdomains/rns-resolver">
        <img src="https://circleci.com/gh/rnsdomains/rns-resolver.svg?style=svg" alt="CircleCI" />
    </a>
    <a href="https://badge.fury.io/js/%40rsksmart%2Frns-resolver">
        <img src="https://badge.fury.io/js/%40rsksmart%2Frns-resolver.svg" alt="npm" />
    </a>
    <a href="https://developers.rsk.co/rif/rns/architecture/Resolver/">
      <img src="https://img.shields.io/badge/-docs-brightgreen" alt="docs" />
    </a>
    <a href="https://developers.rsk.co/rif/rns/specs/resolvers/">
      <img src="https://img.shields.io/badge/-specs-lightgrey" alt="specs" />
    </a>
</p>

```
npm i @rsksmart/rns-resolver
```

Deployments:

- RSK Mainnet: [0xD87f8121D44F3717d4bAdC50b24E50044f86D64B](https://explorer.rsk.co/address/0xd87f8121d44f3717d4badc50b24e50044f86d64b)
- RSK Testnet: [0x25C289ccCFFf700c6a38722F4913924fE504De0e](https://explorer.testnet.rsk.co/address/0x25c289cccfff700c6a38722f4913924fe504de0e)

## Features

Supported resolution protocols:

- Contract addresses - [EIP-137](https://eips.ethereum.org/EIPS/eip-137#resolver-specification)
- Multicoin addresses - [EIP-2304](https://eips.ethereum.org/EIPS/eip-2304)
- Contenthash - [EIP-1577](https://eips.ethereum.org/EIPS/eip-1577)
- Contract ABI - [EIP-205](https://eips.ethereum.org/EIPS/eip-205)
- SECP256k1 public keys - [EIP-619](https://github.com/ethereum/EIPs/pull/619)
- Text records - [EIP-634](https://eips.ethereum.org/EIPS/eip-634)
- Interface discovery - [EIP-1844](https://eips.ethereum.org/EIPS/eip-1844)

Architecture:

- Upgradeable contracts using OpenZeppelin Upgrades [OpenZeppelin Upgrades](https://docs.openzeppelin.com/upgrades/2.8/).
- Use `setAuthorisation` to enable others set your records.
- Use `multicall` to perform multiple operations in one call/transaction.

## Usage

```solidity
pragma solidity ^0.5.0;

import "@rsksmart/rns-registry/contracts/AbstractRNS.sol";
import "@rsksmart/rns-resolver/contracts/RSKAddrResolver.sol";

contract RNSTransfer {
  AbstractRNS rns;

  constructor(AbstractRNS _rns) public {
    rns = _rns;
  }

  function transfer(bytes32 node) public {
    address resolver = RSKAddrResolver(rns.resolver(node));
    address addr = resolver.addr(node);

    addr.transfer(msg.value);
  }
}
```

```js
const Web3 = require('web3');
const ResolverData = require('@rsksmart/rns-resolver/ResolverData.json');

const web3 = new Web3('https://public-node.rsk.co')
const Resolver = new web3.eth.Contract(ResolverData.abi, ResolverData.address.rskMainnet);
```

## Types

There are TypeScript typing definitions of the contracts published together with the original contracts.
Supported contract's libraries are:

* `web3` version 1.* - `web3-v1-contracts`
* `web3` version 2.* - `web3-v2-contracts`
* `truffle` - `truffle-contracts`
* `ethers` - `ethers-contracts`

You can use them as follow:

```typescript
import Web3 from 'web3'
import AddrResolver from '@rsksmart/rns-resolver/types/web3-v1-contracts/ResolverV1.d.ts'
import ResolverData from '@rsksmart/rns-resolver/ResolverData.json'

const web3 = new Web3('https://public-node.rsk.co')
const resolver = new web3.eth.Contract(ResolverData.abi, ResolverData.address.rskMainnet) as AddrResolver
```

Replace `web3-v1-contracts` with the proper library version.

---

Legacy contracts:

## Usage

```solidity
pragma solidity ^0.5.0;

import "@rsksmart/rns-registry/contracts/legacy/AbstractRNS.sol";
import "@rsksmart/rns-resolver/contracts/legacy/AbstractAddrResolver.sol";

contract RNSTransfer {
  AbstractRNS rns;

  constructor(AbstractRNS _rns) public {
    rns = _rns;
  }

  function transfer(bytes32 node) public {
    address resolver = AbstractAddrResolver(rns.resolver(node));
    address addr = resolver.addr(node);

    addr.transfer(msg.value);
  }
}
```

```js
const Web3 = require('web3');
const AddrResolverData = require('@rsksmart/rns-resolver/AddrResolverData.json');

const web3 = new Web3('https://public-node.rsk.co')
const AddrResolver = new web3.eth.Contract(AddrResolverData.abi, AddrResolverData.address.rskMainnet);
```

## Types

```typescript
import Web3 from 'web3'
import AddrResolver from '@rsksmart/rns-resolver/types/web3-v1-contracts/AddrResolverData.d.ts'
import AddrResolverData from '@rsksmart/rns-resolver/AddrResolverData.json'

const web3 = new Web3('https://public-node.rsk.co')
const resolver = new web3.eth.Contract(AddrResolverData.abi, AddrResolverData.address.rskMainnet) as AddrResolver
```

Replace `web3-v1-contracts` with the proper library version.

## Old deployments

- Public Resolver
  - [Docs](https://developers.rsk.co/rif/rns/architecture/RSKResolver/)
  - RSK Mainnet: [0x4efd25e3d348f8f25a14fb7655fba6f72edfe93a](https://explorer.rsk.co/address/0x4efd25e3d348f8f25a14fb7655fba6f72edfe93a)
  - RSK Testnet: [0x1e7ae43e3503efb886104ace36051ea72b301cdf](https://explorer.testnet.rsk.co/address/0x1e7ae43e3503efb886104ace36051ea72b301cdf)

- Multi Chain Resolver
  - [Docs](https://developers.rsk.co/rif/rns/architecture/MultiCryptoResolver/)
  - RSK Mainnet: [0x99a12be4C89CbF6CFD11d1F2c029904a7B644368](https://explorer.rsk.co/address/0x99a12be4C89CbF6CFD11d1F2c029904a7B644368)
  - RSK Testnet: [0x404308f2a2eec2cdc3cb53d7d295af11c903414e](https://explorer.testnet.rsk.co/address/0x404308f2a2eec2cdc3cb53d7d295af11c903414e)
