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
