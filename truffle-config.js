const HDWalletProvider = require('@truffle/hdwallet-provider');
const fs = require('fs')

let mnemonic;

try {
  mnemonic = fs.readFileSync(".secret").toString().trim();
} catch (_) {
  mnemonic = 'INVALID';
}

module.exports = {
  networks: {
    testnet: {
      provider: () => new HDWalletProvider(mnemonic, `http://localhost:4445`, 0, 1, true, `m/44'/37310'/0'/0/`),
      network_id: 31,
      gasPrice: 600000000,
    },
    mainnet: {
      provider: () => new HDWalletProvider(mnemonic, `https://public-node.rsk.co`, 0, 1, true, `m/44'/137'/0'/0/`),
      network_id: 30,
      gasPrice: 60000000,
    }
  }
}
