const fs = require('fs');

const addresses = require('./addresses');

const addrResolverBuild = require('./build/contracts/PublicResolver');

const addrResolverData = {
  abi: addrResolverBuild.abi,
  bytecode: addrResolverBuild.bytecode,
  address: {
    rskMainnet: addresses.AddrResolver.rskMainnet,
    rskTestnet: addresses.AddrResolver.rskTestnet,
  },
};

fs.writeFileSync('./AddrResolverData.json', JSON.stringify(addrResolverData));

const chainAddrResolverBuild = require('./build/contracts/MultiChainResolver');

const chainAddrResolverData = {
  abi: chainAddrResolverBuild.abi,
  bytecode: chainAddrResolverBuild.bytecode,
  address: {
    rskMainnet: addresses.ChainAddrResolver.rskMainnet,
    rskTestnet: addresses.ChainAddrResolver.rskTestnet,
  },
};

fs.writeFileSync('./ChainAddrResolverData.json', JSON.stringify(chainAddrResolverData));

const resolverV1Build = require('./build/contracts/ResolverV1');

const resolverV1BuildData = {
  abi: resolverV1Build.abi,
  bytecode: resolverV1Build.bytecode,
  address: {
    rskMainnet: addresses.ResolverV1.rskMainnet,
    rskTestnet: addresses.ResolverV1.rskTestnet,
  },
};

fs.writeFileSync('./ResolverV1Data.json', JSON.stringify(resolverV1BuildData));

const proxyAdminBuild = require('./build/contracts/ProxyAdmin');

const proxyAdminBuildData = {
  abi: proxyAdminBuild.abi,
  bytecode: proxyAdminBuild.bytecode,
  address: {
    rskMainnet: addresses.ProxyFactory.rskMainnet,
    rskTestnet: addresses.ProxyFactory.rskTestnet,
  },
};

fs.writeFileSync('./ProxyAdminData.json', JSON.stringify(proxyAdminBuildData));

const proxyFactoryBuild = require('./build/contracts/ProxyFactory');

const proxyFactoryBuildData = {
  abi: proxyFactoryBuild.abi,
  bytecode: proxyFactoryBuild.bytecode,
  address: {
    rskMainnet: addresses.ProxyAdmin.rskMainnet,
    rskTestnet: addresses.ProxyAdmin.rskTestnet,
  },
};

fs.writeFileSync('./ProxyFactoryData.json', JSON.stringify(proxyFactoryBuildData));