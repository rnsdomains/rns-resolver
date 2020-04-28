const { encodeCall } = require('@openzeppelin/upgrades');
const { expect } = require('chai');
const { expectRevert } = require('@openzeppelin/test-helpers');

const RNS = artifacts.require('RNS');
const ProxyFactory = artifacts.require('ProxyFactory');
const ProxyAdmin = artifacts.require('ProxyAdmin');
const ResolverV1 = artifacts.require('ResolverV1');
const DummyVersion = artifacts.require('DummyVersion');

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

    it('should allow to query rns owner', async () => {
      const rootOwner = await this.proxy.rnsOwner('0x00');

      expect(rootOwner).to.eq(accounts[0]);
    })

    it('should support eip165 interface id', async () => {
      const supportsEIP165 = await this.proxy.supportsInterface('0x01ffc9a7');

      expect(supportsEIP165).to.be.true;
    });

    it('should not support 0xffffffff interface id', async () => {
      const supportsEIP165 = await this.proxy.supportsInterface('0xffffffff');

      expect(supportsEIP165).to.be.false;
    });
  });
});
