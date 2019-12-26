const RNS = artifacts.require('RNS');
const PublicResolver = artifacts.require('PublicResolver');
const MultiChainResolver = artifacts.require('MultiChainResolver');

module.exports = (deployer) => {
  let rns;

  deployer.deploy(RNS)
  .then(_rns => {
    rns = _rns;
    return deployer.deploy(PublicResolver, RNS.address)
  })
  .then(() => deployer.deploy(MultiChainResolver, RNS.address, PublicResolver.address))
  .then(() => rns.setDefaultResolver(MultiChainResolver.address));
}
