const { encodeCall } = require('@openzeppelin/upgrades');
const { expect } = require('chai');
const { expectRevert } = require('@openzeppelin/test-helpers');
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
    it('supports standard interfaces', async () => {
        expect(await this.proxy.supportsInterface(web3.eth.abi.encodeFunctionSignature('supportsInterface(bytes4)'))).to.be.true;
        expect(await this.proxy.supportsInterface(web3.eth.abi.encodeFunctionSignature('addr(bytes32)'))).to.be.true;
        expect(await this.proxy.supportsInterface(web3.eth.abi.encodeFunctionSignature('addr(bytes32,uint256)'))).to.be.true;
    });

    it('does not support 0xffffffff interface', async () => {
        expect(await this.proxy.supportsInterface('0xffffffff')).to.be.false;
    });

    it('does not support a random interface', async () => {
        expect(await this.proxy.supportsInterface(web3.eth.abi.encodeFunctionSignature('random(bytes4)'))).to.be.false;
    });
  });

  describe('authorisations', async () => {
    it('permits authorisations to be set', async () => {
      await this.proxy.setAuthorisation(this.node, accounts[1], true, {from: accounts[0]});
      assert.equal(await this.proxy.authorisations(this.node, accounts[0], accounts[1]), true);
    });

    it('permits authorised users to make changes', async () => {
      await this.proxy.setAuthorisation(this.node, accounts[1], true, {from: accounts[0]});
      assert.equal(await this.proxy.authorisations(this.node, await this.rns.owner(this.node), accounts[1]), true);
      await this.proxy.methods['setAddr(bytes32,address)'](this.node, accounts[1], {from: accounts[1]});
      assert.equal(await this.proxy.addr(this.node), accounts[1]);
    });

    it('permits authorisations to be cleared', async () => {
      await this.proxy.setAuthorisation(this.node, accounts[1], false, {from: accounts[0]});
      await expectRevert.unspecified(this.proxy.methods['setAddr(bytes32,address)'](this.node, accounts[0], {from: accounts[1]}));
    });

    it('permits non-owners to set authorisations', async () => {
      await this.proxy.setAuthorisation(this.node, accounts[2], true, {from: accounts[1]});

      // The authorisation should have no effect, because accounts[1] is not the owner.
      await expectRevert.unspecified(
        this.proxy.methods['setAddr(bytes32,address)'](this.node, accounts[0], {from: accounts[2]})
      );
    });

    it('checks the authorisation for the current owner', async () => {
      await this.proxy.setAuthorisation(this.node, accounts[2], true, {from: accounts[1]});
      await this.rns.setOwner(this.node, accounts[1], {from: accounts[0]});

      await this.proxy.methods['setAddr(bytes32,address)'](this.node, accounts[0], {from: accounts[2]});
      assert.equal(await this.proxy.addr(this.node), accounts[0]);
    });
  });

  // Source: https://github.com/ensdomains/resolvers/blob/9c3ed5377501d77738089c81c2a0b141878048f9/test/TestPublicResolver.js#L63
  describe('addr', async () => {
    it('permits setting address by owner', async () => {
      var tx = await this.proxy.methods['setAddr(bytes32,address)'](this.node, accounts[1], {from: accounts[0]});
      assert.equal(tx.logs.length, 2);
      assert.equal(tx.logs[0].event, "AddressChanged");
      assert.equal(tx.logs[0].args.node, this.node);
      assert.equal(tx.logs[0].args.newAddress, accounts[1].toLowerCase());
      assert.equal(tx.logs[1].event, "AddrChanged");
      assert.equal(tx.logs[1].args.node, this.node);
      assert.equal(tx.logs[1].args.a, accounts[1]);
      assert.equal(await this.proxy.methods['addr(bytes32)'](this.node), accounts[1]);
    });

    it('can overwrite previously set address', async () => {
      await this.proxy.methods['setAddr(bytes32,address)'](this.node, accounts[1], {from: accounts[0]});
      assert.equal(await this.proxy.methods['addr(bytes32)'](this.node), accounts[1]);

      await this.proxy.methods['setAddr(bytes32,address)'](this.node, accounts[0], {from: accounts[0]});
      assert.equal(await this.proxy.methods['addr(bytes32)'](this.node), accounts[0]);
    });

    it('can overwrite to same address', async () => {
      await this.proxy.methods['setAddr(bytes32,address)'](this.node, accounts[1], {from: accounts[0]});
      assert.equal(await this.proxy.methods['addr(bytes32)'](this.node), accounts[1]);

      await this.proxy.methods['setAddr(bytes32,address)'](this.node, accounts[1], {from: accounts[0]});
      assert.equal(await this.proxy.methods['addr(bytes32)'](this.node), accounts[1]);
    });

    it('forbids setting new address by non-owners', async () => {
      await expectRevert.unspecified(
          this.proxy.methods['setAddr(bytes32,address)'](this.node, accounts[1], {from: accounts[1]})
      );
    });

    it('forbids writing same address by non-owners', async () => {
      await this.proxy.methods['setAddr(bytes32,address)'](this.node, accounts[1], {from: accounts[0]});

      await expectRevert.unspecified(
          this.proxy.methods['setAddr(bytes32,address)'](this.node, accounts[1], {from: accounts[1]})
      );
    });

    it('forbids overwriting existing address by non-owners', async () => {
      await this.proxy.methods['setAddr(bytes32,address)'](this.node, accounts[1], {from: accounts[0]});

      await expectRevert.unspecified(
          this.proxy.methods['setAddr(bytes32,address)'](this.node, accounts[0], {from: accounts[1]})
      );
    });

    it('returns zero when fetching nonexistent addresses', async () => {
      assert.equal(await this.proxy.methods['addr(bytes32)'](this.node), '0x0000000000000000000000000000000000000000');
    });

    it('permits setting and retrieving addresses for other coin types', async () => {
      await this.proxy.methods['setAddr(bytes32,uint256,bytes)'](this.node, 123, accounts[1], {from: accounts[0]});
      assert.equal(await this.proxy.methods['addr(bytes32,uint256)'](this.node, 123), accounts[1].toLowerCase());
    });

    it('returns RSK address for coin type 137', async () => {
      var tx = await this.proxy.methods['setAddr(bytes32,address)'](this.node, accounts[1], {from: accounts[0]});
      assert.equal(tx.logs.length, 2);
      assert.equal(tx.logs[0].event, "AddressChanged");
      assert.equal(tx.logs[0].args.node, this.node);
      assert.equal(tx.logs[0].args.newAddress, accounts[1].toLowerCase());
      assert.equal(tx.logs[1].event, "AddrChanged");
      assert.equal(tx.logs[1].args.node, this.node);
      assert.equal(tx.logs[1].args.a, accounts[1]);
      assert.equal(await this.proxy.methods['addr(bytes32,uint256)'](this.node, 137), accounts[1].toLowerCase());
    });

    it('setting coin type 137 updates RSK address', async () => {
      var tx = await this.proxy.methods['setAddr(bytes32,uint256,bytes)'](this.node, 137, accounts[2], {from: accounts[0]});
      assert.equal(tx.logs.length, 2);
      assert.equal(tx.logs[0].event, "AddressChanged");
      assert.equal(tx.logs[0].args.node, this.node);
      assert.equal(tx.logs[0].args.newAddress, accounts[2].toLowerCase());
      assert.equal(tx.logs[1].event, "AddrChanged");
      assert.equal(tx.logs[1].args.node, this.node);
      assert.equal(tx.logs[1].args.a, accounts[2]);
      assert.equal(await this.proxy.methods['addr(bytes32)'](this.node), accounts[2]);
    });
  });
});
