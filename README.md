# RNS Resolver

[![npm version](https://badge.fury.io/js/%40rsksmart%2Frns-resolver.svg)](https://badge.fury.io/js/%40rsksmart%2Frns-resolver)

RIF Name Service public resolver.

- RSK Mainnet:
- RSK Testnet:

## Install

```
npm i @rsksmart/rns-resolver
```

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

## Data

- Public Resolver
  - [Docs](https://developers.rsk.co/rif/rns/architecture/RSKResolver/)
  - RSK Mainnet: [0x4efd25e3d348f8f25a14fb7655fba6f72edfe93a](https://explorer.rsk.co/address/0x4efd25e3d348f8f25a14fb7655fba6f72edfe93a)
  - RSK Testnet: [0x1e7ae43e3503efb886104ace36051ea72b301cdf](https://explorer.testnet.rsk.co/address/0x1e7ae43e3503efb886104ace36051ea72b301cdf)

- Multi Chain Resolver
  - [Docs](https://developers.rsk.co/rif/rns/architecture/MultiCryptoResolver/)
  - RSK Mainnet: [0x99a12be4C89CbF6CFD11d1F2c029904a7B644368](https://explorer.rsk.co/address/0x99a12be4C89CbF6CFD11d1F2c029904a7B644368)
  - RSK Testnet: [0x404308f2a2eec2cdc3cb53d7d295af11c903414e](https://explorer.testnet.rsk.co/address/0x404308f2a2eec2cdc3cb53d7d295af11c903414e)
