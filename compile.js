const path = require('path');
const fs = require('fs');
const solc = require('solc');

// Caminho para o arquivo do contrato
const lotteryPath = path.resolve(__dirname, 'contracts', 'Lottery.sol');
// Ler o conteúdo do arquivo
const source = fs.readFileSync(lotteryPath, 'utf8');

// Configuração do input para o compilador Solidity
const input = {
  language: 'Solidity',
  sources: {
    'Lottery.sol': {
      content: source,
    },
  },
  settings: {
    outputSelection: {
      '*': {
        '*': ['abi', 'evm.bytecode'],
      },
    },
  },
};


// Compilar o contrato
const output = JSON.parse(solc.compile(JSON.stringify(input)));

// Exportar a ABI e o bytecode do contrato
const abi = output.contracts['Lottery.sol'].Lottery.abi;
const bytecode = output.contracts['Lottery.sol'].Lottery.evm.bytecode.object;

module.exports = { abi, bytecode };