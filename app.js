const Blockchain = require("./blockchain");
const PoW = require('./sudoku');

let blockchain = new Blockchain.Blockchain("OnePercent Blockchain", "Renan", new PoW.SudokuPoW());
blockchain.ledger.subscribe(new Blockchain.EventWathcher());
let txs = [
	new Blockchain.Transaction("Renan", "Andre", 2, "Temperatura do cilo: 22C"),
	new Blockchain.Transaction("Renan", "Shuree", 2, "Posição da Carga: lat: xyz, log: xyz"),
	new Blockchain.Transaction("Renan", "Juliano", 2, "Status do pedido: liberado para coleta"),
	new Blockchain.Transaction("Renan", "Fabio", 2, "Novo documento criado")
];
for(let i in txs) {
	let tx = txs[i];
	blockchain.addToPool(tx);
}

let solvedSudokuFausto = [
	[1, 4, 2, 3],
	[2, 3, 1, 4],
	[4, 1, 3, 2],
	[3, 2, 4, 2]
];

let solvedSudokuFabio = [
	[1, 4, 2, 3],
	[2, 3, 1, 4],
	[4, 1, 3, 2],
	[3, 2, 4, 1]
];

let b1 = new Blockchain.Block(blockchain.getFromPool(3), "Fausto", blockchain.ledger.getLastMinedBlock());
blockchain.ledger.mineBlock(b1, solvedSudokuFausto);

let b2 = new Blockchain.Block(blockchain.getFromPool(3), "Fabio", blockchain.ledger.getLastMinedBlock());
blockchain.ledger.mineBlock(b2, solvedSudokuFabio);

["Renan", "Andre", "Shuree", "Juliano", "Fabio", "Fausto"].forEach(function(item) {
	console.log(item + ': ' + blockchain.ledger.getBalance(item));
});

