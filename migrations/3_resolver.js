const RNS = artifacts.require('RNS');
const ProxyFactory = artifacts.require('ProxyFactory');
const ProxyAdmin = artifacts.require('ProxyAdmin');
const ResolverV1 = artifacts.require('ResolverV1');

const assert = require('assert');

const { encodeCall } = require('@openzeppelin/upgrades');

const RNS_TESTNET_MULTI_SIG = '0xb576cc74fa1c43dce3238b75aa56126a7fe835ab';
const RNS_MULTI_SIG = '0x39e00d2616e792f50ddd33bbe46e8bf55eadebee';

module.exports = (deployer, network, accounts) => {
  if(network !== 'test') {
    deployer.then(async () => {
      if (network === 'develop') {
        const rns = await deployer.deploy(RNS);
        this.rnsAddress = rns.address;
      } else if (network === 'testnet') {
        this.rnsAddress = '0x7d284aaac6e925aad802a53c0c69efe3764597b8';
      } else if (network === 'mainnet') {
        this.rnsAddress = '0xcb868aeabd31e2b66f74e9a55cf064abb31a4ad5';
      }

      const proxyFactory = await deployer.deploy(ProxyFactory);
      const proxyAdmin = await deployer.deploy(ProxyAdmin);
      const resolverV1 = await deployer.deploy(ResolverV1);

      const salt = '16';
      const data = encodeCall('initialize', ['address'], [this.rnsAddress]);
      await proxyFactory.deploy(salt, resolverV1.address, proxyAdmin.address, data);

      if (network === 'testnet') {
        await proxyAdmin.transferOwnership(RNS_TESTNET_MULTI_SIG);
      } else if (network === 'mainnet') {
        await proxyAdmin.transferOwnership(RNS_MULTI_SIG);
      }

      const deploymentAddress = await proxyFactory.getDeploymentAddress(salt, accounts[0]);
      const implementationAddress = await proxyAdmin.getProxyImplementation(deploymentAddress);

      assert.equal(implementationAddress, resolverV1.address);

      const owner = await proxyAdmin.owner().then(r => r.toLowerCase());

      if (network === 'testnet') {
        assert.equal(owner, RNS_TESTNET_MULTI_SIG);
      } else if (network === 'mainnet') {
        assert.equal(owner, RNS_MULTI_SIG);
      }

      console.log('Proxy factory: ' + proxyFactory.address);
      console.log('Proxy admin: ' + proxyAdmin.address);
      console.log('Resolver implementation: ' + resolverV1.address);
      console.log('-------------');
      console.log('Resulting proxy deployment address: ' + deploymentAddress);
      console.log('Resulting querying implementation address: ' + implementationAddress);
    });
  }
};
