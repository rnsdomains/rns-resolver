const { encodeCall } = require('@openzeppelin/upgrades');
const { expect } = require('chai');
const { expectRevert, constants } = require('@openzeppelin/test-helpers');
const namehash = require('eth-ens-namehash');

const RNS = artifacts.require('RNS');
const ProxyFactory = artifacts.require('ProxyFactory');
const ProxyAdmin = artifacts.require('ProxyAdmin');
const ResolverV1 = artifacts.require('ResolverV1');
const DummyVersion = artifacts.require('DummyVersion');

/**
 * Most of the tests were copied from
 * https://github.com/ensdomains/resolvers/blob/9c3ed5377501d77738089c81c2a0b141878048f9/test/TestPublicResolver.js
 */
contract('Resolver V1', async (accounts) => {
  beforeEach(async () => {
    this.rns = await RNS.new();
    this.proxyFactory = await ProxyFactory.new();
    this.proxyAdmin = await ProxyAdmin.new();
    this.resolverV1 = await ResolverV1.new();

    const salt = '16';
    const data = encodeCall('initialize', ['address'], [this.rns.address]);
    await this.proxyFactory.deploy(salt, this.resolverV1.address, this.proxyAdmin.address, data);

    this.resolverAddress = await this.proxyFactory.getDeploymentAddress(salt, accounts[0]);
    this.proxy = await ResolverV1.at(this.resolverAddress);

    await this.rns.setSubnodeOwner('0x00', web3.utils.sha3('rsk'), accounts[0]);
    this.node = namehash.hash('rsk');
  });

  describe('upgrades', async () => {
    it('should use given implementation', async () => {
      const implAddress = await this.proxyAdmin.getProxyImplementation(this.resolverAddress);

      expect(implAddress).to.eq(this.resolverV1.address);
    });

    it('should not allow not owner to upgrade', async () => {
      const dummyVersion = await DummyVersion.new();

      const data = encodeCall('initialize', ['address','uint'], [this.rns.address, 10]);
      await expectRevert.unspecified(
        this.proxyAdmin.upgradeAndCall(this.resolverAddress, dummyVersion.address, data, { from: accounts[1] })
      );

      const implAddress = await this.proxyAdmin.getProxyImplementation(this.resolverAddress);

      expect(implAddress).to.eq(this.resolverV1.address);
    });

    it('should allow owner to upgrade', async () => {
      const dummyVersion = await DummyVersion.new();

      await this.proxyAdmin.upgradeAndCall(this.resolverAddress, dummyVersion.address, encodeCall('initialize', [], []));

      const implAddress = await this.proxyAdmin.getProxyImplementation(this.resolverAddress);
      expect(implAddress).to.eq(dummyVersion.address);

      const proxy = await DummyVersion.at(this.resolverAddress);

      const supportsSetVInterface = await proxy.supportsInterface(web3.eth.abi.encodeFunctionSignature('setV(uint256)'));
      expect(supportsSetVInterface).to.be.true;

      const newV = web3.utils.toBN('10');
      await proxy.setV(newV);
      const v = await proxy.v();
      expect(v).to.be.bignumber.eq(newV);
    });
  });

  describe('initialize', async () => {
    it('should store rns address', async () => {
      const rns = await this.proxy.rns();

      expect(rns).to.eq(this.rns.address);
    });
  });

  describe('fallback function', async () => {
    it('forbids calls to the fallback function with 0 value', async () => {
      await expectRevert.unspecified(
        web3.eth.sendTransaction({
          from: accounts[0],
          to: this.proxy.address,
          gas: 3000000
        })
      );
    });

    it('forbids calls to the fallback function with 1 value', async () => {
      await expectRevert.unspecified(
        web3.eth.sendTransaction({
          from: accounts[0],
          to: this.proxy.address,
          gas: 3000000,
          value: 1
        })
      );
    });
  });

  describe('erc165', async () => {
    it('supports erc165 interface', async () => {
        expect(await this.proxy.supportsInterface(web3.eth.abi.encodeFunctionSignature('supportsInterface(bytes4)'))).to.be.true;
    });

    it('does not support 0xffffffff interface', async () => {
        expect(await this.proxy.supportsInterface('0xffffffff')).to.be.false;
    });

    it('does not support a random interface', async () => {
        expect(await this.proxy.supportsInterface(web3.eth.abi.encodeFunctionSignature('random(bytes4)'))).to.be.false;
    });
  });

  const behavesLikeRecord = (getter, setter, args, [value1, value2], eventChecker) => {
    describe('behaves like a record', () => {
      it('permits setting the record by the owner', async () => {
        const tx = await this.proxy.methods[setter](this.node, ...args, value1, { from: accounts[0] });
        expect(await this.proxy.methods[getter](this.node, ...args)).to.eq(value1);

        eventChecker(tx, value1);
      });

      it('can overwrite previously set record', async () => {
        await this.proxy.methods[setter](this.node, ...args, value1, { from: accounts[0] });

        const tx = await this.proxy.methods[setter](this.node, ...args, value2, { from: accounts[0] });

        expect(await this.proxy.methods[getter](this.node, ...args)).to.eq(value2);
        eventChecker(tx, value2);
      });

      it('can overwrite to same record', async () => {
        await this.proxy.methods[setter](this.node, ...args, value1, { from: accounts[0] });

        const tx = await this.proxy.methods[setter](this.node, ...args, value1, { from: accounts[0] });

        expect(await this.proxy.methods[getter](this.node, ...args)).to.eq(value1);
        eventChecker(tx, value1);
      });

      it('forbids setting record by non-owners', async () => {
        await expectRevert.unspecified(
          this.proxy.methods[setter](this.node, ...args, value1, { from: accounts[1] })
        );
      });

      it('forbids overwriting previously set record by non-owners', async () => {
        await this.proxy.methods[setter](this.node, ...args, value1, { from: accounts[0] });

        await expectRevert.unspecified(
          this.proxy.methods[setter](this.node, ...args, value2, { from: accounts[1] })
        );
      });

      it('forbids overwriting to same record by non-owners', async () => {
        await this.proxy.methods[setter](this.node, ...args, value1, { from: accounts[0] });

        await expectRevert.unspecified(
          this.proxy.methods[setter](this.node, ...args, value1, { from: accounts[1] })
        );
      });
    });
  }

  const hasNonexistentSignal = (getter, args, nonexistentValue) => {
    it('has zero value for nonexistent domains', async () => {
      expect(await this.proxy.methods[getter](this.node, ...args)).to.eq(nonexistentValue);
    });
  }

  const interfaceIsSupported = (signature) => {
    it('interface is supported via erc165', async () => {
      expect(await this.proxy.supportsInterface(web3.eth.abi.encodeFunctionSignature(signature))).to.be.true;
    });
  }

  const shouldCheckAuthorization = (getter, setter, args, value) => {
    describe('should check authorisation', () => {
      it('permits authorisations to be set', async () => {
        await this.proxy.setAuthorisation(this.node, accounts[1], true, { from: accounts[0] });
        expect(await this.proxy.authorisations(this.node, accounts[0], accounts[1])).to.be.true;

        await this.proxy.methods[setter](this.node, ...args, value, { from: accounts[1] });
        expect(await this.proxy.methods[getter](this.node, ...args)).to.eq(value);
      });

      it('permits authorisations to be cleared', async () => {
        await this.proxy.setAuthorisation(this.node, accounts[1], true, { from: accounts[0] });

        await this.proxy.setAuthorisation(this.node, accounts[1], false, { from: accounts[0] });
        expect(await this.proxy.authorisations(this.node, accounts[0], accounts[1])).to.be.false;

        await expectRevert.unspecified(this.proxy.methods[setter](this.node, ...args, value, { from: accounts[1] }));
      });

      it('permits authorised users to make changes', async () => {
        await this.proxy.setAuthorisation(this.node, accounts[1], true, { from: accounts[0] });
        await this.proxy.methods[setter](this.node, ...args, value, { from: accounts[1] });
        expect(await this.proxy.methods[getter](this.node, ...args)).to.eq(value);
      });

      it('permits non-owners to set authorisations', async () => {
        await this.proxy.setAuthorisation(this.node, accounts[2], true, { from: accounts[1] });

        // The authorisation should have no effect, because accounts[1] is not the owner.
        await expectRevert.unspecified(
          this.proxy.methods[setter](this.node, ...args, value, { from: accounts[2] })
        );
      });

      it('checks the authorisation for the current owner', async () => {
        await this.proxy.setAuthorisation(this.node, accounts[2], true, { from: accounts[1] });
        await this.rns.setOwner(this.node, accounts[1], {from: accounts[0]});

        await this.proxy.methods[setter](this.node, ...args, value, { from: accounts[2] });
        expect(await this.proxy.methods[getter](this.node, ...args)).to.eq(value);
      });

      it('checks the authorisation for the previous owner', async () => {
        await this.proxy.setAuthorisation(this.node, accounts[2], true, { from: accounts[0] });
        await this.proxy.methods[setter](this.node, ...args, value, { from: accounts[2] });

        await this.rns.setOwner(this.node, accounts[1], { from: accounts[0] });
        expect(await this.proxy.methods[getter](this.node, ...args)).to.eq(value);
        await expectRevert.unspecified(this.proxy.methods[setter](this.node, ...args, value, { from: accounts[2] }));
        expect(await this.proxy.methods[getter](this.node, ...args)).to.eq(value);
      });
    });
  };

  describe('addr', async () => {
    const getter = 'addr(bytes32)';
    const setter = 'setAddr(bytes32,address)';
    const values = [accounts[3], accounts[4]];

    behavesLikeRecord(getter, setter, [], values, (tx, value) => {
      expect(tx.logs.length).to.eq(2);
      expect(tx.logs[0].event).to.eq('AddressChanged');
      expect(tx.logs[0].args.node).to.eq(this.node);
      expect(tx.logs[0].args.newAddress).to.eq(value.toLowerCase());
      expect(tx.logs[0].args.coinType).to.be.bignumber.eq(web3.utils.toBN(137));
      expect(tx.logs[1].event).to.eq('AddrChanged');
      expect(tx.logs[1].args.node).to.eq(this.node);
      expect(tx.logs[1].args.a).to.eq(value);
    });

    hasNonexistentSignal(getter, [], constants.ZERO_ADDRESS);

    interfaceIsSupported(getter);

    shouldCheckAuthorization(getter, setter, [], values[0]);
  });

  describe('addr with coin', () => {
    const getter = 'addr(bytes32,uint256)';
    const setter = 'setAddr(bytes32,uint256,bytes)';
    const values = [accounts[3].toLowerCase(), accounts[4].toLowerCase()];

    behavesLikeRecord(getter, setter, [123], values, (tx, value) => {
      expect(tx.logs.length).to.eq(1);
      expect(tx.logs[0].event).to.eq('AddressChanged');
      expect(tx.logs[0].args.node).to.eq(this.node);
      expect(tx.logs[0].args.coinType).to.be.bignumber.eq(web3.utils.toBN(123));
      expect(tx.logs[0].args.newAddress).to.eq(value.toLowerCase());
    });

    interfaceIsSupported(getter);

    hasNonexistentSignal(getter, [123], null);

    shouldCheckAuthorization(getter, setter, [123], values[0]);
  });

  describe('in particular for rsk addr', async () => {
    it('returns RSK address for coin type 137', async () => {
      await this.proxy.methods['setAddr(bytes32,address)'](this.node, accounts[1], {from: accounts[0]});
      expect(await this.proxy.methods['addr(bytes32,uint256)'](this.node, 137)).to.eq(accounts[1].toLowerCase());
    });

    it('setting coin type 137 updates RSK address and emits AddrChanged', async () => {
      var tx = await this.proxy.methods['setAddr(bytes32,uint256,bytes)'](this.node, 137, accounts[2], {from: accounts[0]});
      expect(tx.logs.length).to.eq(2);
      expect(tx.logs[0].event).to.eq('AddressChanged');
      expect(tx.logs[0].args.node).to.eq(this.node);
      expect(tx.logs[0].args.newAddress).to.eq(accounts[2].toLowerCase());
      expect(tx.logs[0].args.coinType).to.be.bignumber.eq(web3.utils.toBN(137));
      expect(tx.logs[1].event).to.eq('AddrChanged');
      expect(tx.logs[1].args.node).to.eq(this.node);
      expect(tx.logs[1].args.a).to.eq(accounts[2]);
      expect(await this.proxy.methods['addr(bytes32)'](this.node)).to.eq(accounts[2]);
    });
  });

  describe('contenthash', () => {
    const getter = 'contenthash(bytes32)';
    const setter = 'setContenthash(bytes32,bytes)';
    const values = ['0x0011223344', '0x5566778899aa'];

    behavesLikeRecord(getter, setter, [], values, (tx, value) => {
      expect(tx.logs.length).to.eq(1);
      expect(tx.logs[0].event).to.eq('ContenthashChanged');
      expect(tx.logs[0].args.node).to.eq(this.node);
      expect(tx.logs[0].args.hash).to.eq(value);
    });

    hasNonexistentSignal(getter, [], null);

    interfaceIsSupported(getter);

    shouldCheckAuthorization(getter, setter, [], values[0]);
  });
});
