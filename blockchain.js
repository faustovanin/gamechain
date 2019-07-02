const Web3 = require('web3');
const web3 = new Web3();

const satoshi = "SatoshiNakamoto.JS";

class Transaction {
	constructor(_from, _to, _value, _ext) {
		this.from = _from;
		this.to = _to;
		this.value = _value;
		this.nonce = Date.now();
		this.extraData = _ext;
		this.feeTransaction = undefined;
	}
	hash() {
		return web3.utils.keccak256(JSON.stringify(this));
	}
}
class Block {
	constructor(_transactions, _miner, _previous) {
		this.previous = _previous;
		this.miner = _miner;
		this.transactions = _transactions;
		
		let reward = new Transaction(satoshi, this.miner, 12.5);
		reward.feeTransaction = new Transaction(satoshi, this.miner, 0);

		this.transactions.push(reward);

		if(!this.previous) {
			this.number = 0;
		}
		else {
			this.number = this.previous.number + 1;
			this.updateTransactionsFee();
		}
	}
	updateTransactionsFee() {
		for(let i in this.transactions) {
			this.transactions[i].feeTransaction.to = this.miner;
		}
	}
}
class Ledger {
	constructor(_creator, _proofChecker) {
		this.blocks = [];
		this.blocks.push(new Block([], _creator));
		this.creator = _creator;
		this.subscribers = [];
		if(typeof _proofChecker == 'function') {
			this.proofChecker = _proofChecker;
		}
		else {
			this.proofChecker = function(proof) {
				return true;
			}
		}
	}
	mineBlock(block, proof) {
		let minedTransactions = 0;
		for(let i in block.transactions) {
			if(this.getReceipt(block.transactions[i].hash())) {
				this.notify('invalidBlockSubmitted', block);
				return;
			}
		}
		if(this.proofChecker(proof) && block.number == this.getLastMinedBlock().number + 1) {
			this.blocks.push(block);
			this.notify('blockMined', block);
			return;
		}
		this.notify('invalidBlockSubmitted', block);
	}
	subscribe(obj) {
		this.subscribers.push(obj);
	}
	notify(event, params) {
		for(let i in this.subscribers) {
			let subscriber = this.subscribers[i];
			if(typeof subscriber[event] == 'function')
				subscriber[event](params);
		}
	}
	getBalance(account) {
		let balance = 0;
		for(let i in this.blocks) {
			let block = this.blocks[i];
			for(let j in block.transactions) {
				let tx = block.transactions[j];
				if(tx.to == account) {
					balance += tx.value;
				}
				if(tx.from == account) {
					balance -= tx.value;
				}
				if(tx.feeTransaction.to == account) {
					balance += tx.feeTransaction.value;
				}
				if(tx.feeTransaction.from == account) {
					balance -= tx.feeTransaction.value;
				}
			}
		}
		return balance;
	}
	getLastMinedBlock() {
		return this.blocks[this.blocks.length-1];
	}
	getReceipt(tx) {
		for(let i in this.blocks) {
			for(let j in this.blocks[i].transactions) {
				if(this.blocks[i].transactions[j].hash() == tx) {
					return {
						'blockNumber': this.blocks[i].number,
						'miner': this.blocks[i].miner,
						'confirmations': this.getLastMinedBlock().number - this.blocks[i].number,
						'transactionHash': tx,
						'transactionData': this.blocks[i].transactions[j]
					}
				}
			}
		}
	}
}
class Miner {
	constructor(_account) {
		this.account = _account;
	}
}
class Blockchain {
	constructor(_name, _owner, _pow) {
		this.name = _name;
		this.owner = _owner;
		this.pow = _pow;
		this.ledger = new Ledger(this.owner, this.pow.validate);
		this.ledger.subscribe(this);
		this.pool = [];
		this.miners = [];
		this.fee = 0.1;
	}
	addToPool(_tx) {
		if(_tx.value < 0) throw("Invalid transaction " + _tx.hash());
		let senderBalance = this.ledger.getBalance(_tx.from) - this.getCommitedBalance(_tx.from);
		if(senderBalance-_tx.value-this.fee < 0) 
			throw("Insufficient funds for transaction " + _tx.hash());
		_tx.feeTransaction = new Transaction(_tx.from, undefined, this.fee);
		this.pool.push(_tx);
	}
	addMiner(m) {
		this.miners.push(m);
		this.difficulty = this.miners.length;
	}
	removeMiner(m) {
		let pos = this.miners.indexOf(m);
		if(pos != -1)
			this.miners.splice(pos, 1);
		this.difficulty = this.miners.indexOf(m);
	}
	getFromPool(n) {
		let txs = [];
		let added = 0;
		for(let i in this.pool) {
			txs.push(this.pool[i]);
			++added;
			if(added == n) return txs;
		}
		return txs;
	}
	blockMined(block) {
		for(let i=this.pool.length-1; i>=0; i--) {
			let poolTx = this.pool[i];
			for(let j in block.transactions) {
				let blockTx = block.transactions[j];
				if(poolTx.hash() == blockTx.hash() || poolTx.hash() == blockTx.feeTransaction.hash()) {
					this.pool.splice(i, 1);
				}
			}
		}
	}
	getCommitedBalance(account) {
		let balance = 0;
		for(let i in this.pool) {
			if(this.pool[i].from == account)
				balance += this.pool[i].value;
		}
		return balance;
	}
}
class FruitPoW {
	validate(data) {
		let fruits = ['banana', 'apple', 'pineapple', 'pear', 'watermelon', 'strawberry'];
		return fruits.indexOf(data) != -1;
	}
}
class EventWathcher {
	blockMined(block) {
		console.log('[EVT] New Block Mined: ' + block.number);
		for(let i in block.transactions) {
			console.log('[EVT] Tx Hash: ' + block.transactions[i].hash())
		}
	}
	invalidBlockSubmitted(block) {
		console.error('[EVT] The following block was not mined because it is invalid');
		console.error(block);
	}
}


module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction;
module.exports.Block = Block;
module.exports.FruitPoW = FruitPoW;
module.exports.EventWathcher = EventWathcher;













// console.log(blockchain.pool.length);