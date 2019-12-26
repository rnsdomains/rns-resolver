const RNS = artifacts.require('RNS');
const PublicResolver = artifacts.require('PublicResolver');
const namehash = require('eth-ens-namehash').hash;

contract('PublicResolver', async (accounts) => {
  var rns, publicResolver;
  const hash = namehash('rsk');

  beforeEach(async () => {
    rns = await RNS.new();
    publicResolver = await PublicResolver.new(rns.address);
    await rns.setSubnodeOwner('0x00', web3.utils.sha3('rsk'), accounts[0]);
    await rns.setResolver(hash, publicResolver.address);
  });

  it('should store addr', async () => {
    const addr = '0x0000000000111111111122222222223333333333';
    await publicResolver.setAddr(hash, addr);

    const actualAddr = await publicResolver.addr(hash);

    assert.equal(actualAddr, addr);
  });

  it('should store content', async () => {
    const content = '0x0000000000111111111122222222223333333333444444444455555555556666';
    await publicResolver.setContent(hash, content);

    const actualContent = await publicResolver.content(hash);

    assert.equal(actualContent, content);
  });
});
