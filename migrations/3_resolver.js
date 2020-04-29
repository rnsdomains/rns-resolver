const RNS = artifacts.require('RNS');
const ProxyFactory = artifacts.require('ProxyFactory');
const ProxyAdmin = artifacts.require('ProxyAdmin');
const ResolverV1 = artifacts.require('ResolverV1');

const { encodeCall } = require('@openzeppelin/upgrades');

module.exports = (deployer, network, accounts) => {
  deployer.then(async () => {
    if (network === 'develop') {
      const rns = await deployer.deploy(RNS);
      const proxyFactory = await deployer.deploy(ProxyFactory);
      const proxyAdmin = await deployer.deploy(ProxyAdmin);
      const resolverV1 = await deployer.deploy(ResolverV1);

      const salt = '16';
      const data = encodeCall('initialize', ['address'], [rns.address]);
      await proxyFactory.deploy(salt, resolverV1.address, proxyAdmin.address, data);

      console.log('Proxy factory: ' + proxyFactory.address);
      console.log('Proxy admin: ' + proxyFactory.address);
      console.log('Resolver implementation: ' + proxyFactory.address);
      console.log('-------------');
      const deploymentAddress = await proxyFactory.getDeploymentAddress(salt, accounts[0]);
      console.log('Resulting proxy deployment address: ' + deploymentAddress);
      const implementationAddress = await proxyAdmin.getProxyImplementation(deploymentAddress);
      console.log('Resulting querying implementation address: ' + implementationAddress);
    }
  });
};
