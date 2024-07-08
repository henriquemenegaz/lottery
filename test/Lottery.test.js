// test/Lottery.test.js

const assert = require('assert');
const ganache = require('ganache');
const {Web3} = require('web3');
const web3 = new Web3(ganache.provider());
const { abi, bytecode } = require('../compile');

let lottery;
let accounts;

beforeEach(async () => {
  // Obtém as contas da blockchain local
  accounts = await web3.eth.getAccounts();

  // Implanta uma nova instância do contrato antes de cada teste
  lottery = await new web3.eth.Contract(abi)
    .deploy({ data: bytecode })
    .send({ from: accounts[0], gas: '1000000' });
});

describe('Lottery Contract', () => {
  it('deploys a contract', () => {
    assert.ok(lottery.options.address);
  });

  it('allows one account to enter', async () => {
    await lottery.methods.enter(1).send({
      from: accounts[0],
      value: web3.utils.toWei('1', 'gwei'),
    });

    const participants = await lottery.methods.getParticipants().call({
      from: accounts[0],
    });

    assert.strictEqual(participants[0], accounts[0]);
    assert.strictEqual(participants.length, 1);
  });

  it('allows multiple accounts to enter', async () => {
    await lottery.methods.enter(1).send({
      from: accounts[0],
      value: web3.utils.toWei('1', 'gwei'),
    });
    await lottery.methods.enter(1).send({
      from: accounts[1],
      value: web3.utils.toWei('1', 'gwei'),
    });
    await lottery.methods.enter(1).send({
      from: accounts[2],
      value: web3.utils.toWei('1', 'gwei'),
    });

    const participants = await lottery.methods.getParticipants().call({
      from: accounts[0],
    });

    assert.strictEqual(participants[0], accounts[0]);
    assert.strictEqual(participants[1], accounts[1]);
    assert.strictEqual(participants[2], accounts[2]);
    assert.strictEqual(participants.length, 3);
  });

  it('requires a minimum amount of ether to enter', async () => {
    try {
      await lottery.methods.enter(1).send({
        from: accounts[0],
        value: web3.utils.toWei('0.5', 'gwei'), // menos que 1 gwei
      });
      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  it('only manager can call pickWinner', async () => {
    try {
      await lottery.methods.pickWinner().send({
        from: accounts[1], // não é o manager
      });
      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  it('sends money to the winner and resets the players', async () => {
    await lottery.methods.enter(2).send({
      from: accounts[0],
      value: web3.utils.toWei('2', 'gwei'),
    });

    const initialBalance = await web3.eth.getBalance(accounts[0]);
    console.log(initialBalance);

    await lottery.methods.pickWinner().send({ from: accounts[0] });

    const finalBalance = await web3.eth.getBalance(accounts[0]);
    console.log(finalBalance);

    const difference = finalBalance - initialBalance;
    console.log(difference)
    // assert(difference > web3.utils.toWei('1.8', 'gwei'));

    const participants = await lottery.methods.getParticipants().call({
      from: accounts[0],
    });

    assert.strictEqual(participants.length, 0);
  });
});
