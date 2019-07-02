class Node {
	constructor(m, p) {
		this.max = m;
		if(!p) {
			this.pool = [];
			let randMax = this.max;
			while(this.pool.length <= this.max-1) {
				let r = Math.floor(Math.random() * randMax) + 1;
				if(this.pool.indexOf(r) === -1) this.pool.push(r);
			}
		}
		else this.pool = p;
		this.value = this.pool.pop();	
		this.sub = undefined;
	}
	iterate() {
		let last = this.last();
		if(last.pool.length == 0) {
			this.pool.push(last.value);
			last = undefined;
			return;
		}
		last.sub = new Node(this.max, last.pool);
	}
	last() {
		let n = this;
		while(n.sub != undefined) n = n.sub;
		return n;
	}
	depth() {
		if(this.sub == undefined) return 0;
		return 1 + this.sub.depth();
	}
	resetPool() {
		this.pool = [];
		let nextVal = this.value;
		while(this.pool.length <= this.max-2) {
			if(--nextVal == 0) nextVal = this.max;
			this.pool.push(nextVal);
		}
	}
}
class Root {
	constructor(p, _size) {
		this.position = p;
		this.nodes = [];
		this.size = _size;
		this.dimmension = this.size*this.size;
	}
	populate() {
		let pool = [];
		while(pool.length <= this.dimmension-1) {
			let r = Math.floor(Math.random() * this.dimmension) + 1;
			if(pool.indexOf(r) === -1) pool.push(r);
		}
		for(let j=0; j<this.dimmension; j++) {
			this.nodes.push(new Node(this.dimmension, pool));
			this.nodes[j].position = j;
			this.nodes[j].root = this.position;
		}
	}
	iterate() {
		for(let l in this.nodes) {
			this.nodes[l].iterate();
		}
	}
	fitness() {
		let target = this.dimmension*this.dimmension;
		for(let i in this.nodes) {
			target -= this.dimmension - this.nodes[i].pool.length;
		}
		return target;
	}
}
class Sudoku {
	constructor(_size) {
		this.size = _size;
		this.dimmension = this.size*this.size;
		this.amount = this.size*this.dimmension;
		this.roots = [];
		this.popper = new Array(this.dimmension);
		this.sum = 0;
		this.cursor = new Array(this.dimmension);
		this.populate();
	}
	populate() {
		let validator = new Sudoku();
		let round = 1;
		do {
			//Create roots and nodes
			for(let i=0; i<this.dimmension; i++) {
				this.roots[i] = new Root(i, this.size);
				this.roots[i].populate();
				if(i%(this.size+1)!=0) {
					for(let j=0; j<this.dimmension; j++) {
						this.roots[i].nodes[j].resetPool();
					}
				}
			}

			//Validate through main diagonal
			for(let i=0; i<this.dimmension; i+=this.size+1) {
				console.log('Validating root ' + i);
				for(let j=0; j<this.dimmension; j++) {
					let valid = this.validate(this.roots[i].nodes[j]);
					console.log('[' + i + ', ' + j + ']: ' + valid);
				}
			}
			round++;
			this.print(0);
		} while(!validator.validate(this.map()))
		
	}
	validate(node, invalids) {
		if(!invalids) {
			invalids = this.validateNode(node);
		}
		if(invalids.values.length == 0) {
			return true;
		}

		let root = invalids.values.pop();
		this.roots[root].iterate();
		if(invalids.values.length == 0 && this.roots[root].fitness() == 0) {
			this.roots[root] = new Root(root, this.size);
			this.roots[root].populate();
		}

		if(invalids.values.length == 0)
			return this.validate(node);
		else return this.validate(node, invalids);
	}
	validateNode(node) {
		let invalids = {
			values: []
		};
		let neighbours = this.neighbours(node.root, node.position);
		for(let j in neighbours) {
			if(neighbours[j] != undefined && neighbours[j].last().value == node.value) {
				if(invalids.values.indexOf(neighbours[j].root) == -1)
					invalids.values.push(neighbours[j].root);
			}
		}
		return invalids;
	}
	neighbours(i, j) {
		let neighbours = [];
		let myRow = this.row(i, j);
		let myCol = this.col(i, j);

		for(let ii in this.roots) {
			for(let jj in this.roots[ii].nodes) {
				let row = this.row(ii, jj);
				let col = this.col(ii, jj);
				
				if( (myRow == row && myCol != col) || 
					(myCol == col && myRow != row) 
				) {
					if(this.roots[ii].nodes[jj] != undefined)
						neighbours.push(this.roots[ii].nodes[jj]);
				}
			}

		}
		return neighbours;
	}
	row(i, j) {
		return Math.floor(j*1/this.size)+(Math.floor(i/this.size)*this.size);
	}
	col(i, j) {
		return Math.round(j*1-(this.size*this.row(i,j)))+(i*this.size);
	}
	iterate(iCursor) {
		for(let j in this.roots) {
			let d1 = this.roots[j].nodes[iCursor].depth();
			let d2 = this.roots[this.cursor[iCursor]].nodes[iCursor].depth();
			if(d1 <= d2) {
				this.cursor[iCursor] = j;
			}
		}
	}
	map(hints) {
		let map = []
		hints = !hints ? this.dimmension*this.dimmension : hints;
		for(let i in this.roots) {
			for(let j in this.roots[i].nodes) {
				let row = Math.floor(j*1/this.size)+(Math.floor(i/this.size)*this.size);
				let col = Math.round(j*1-(this.size*row))+(i*this.size);

				if(map[row] == undefined) map[row] = [];
				if(this.roots[i].nodes[j] == undefined)
					map[row][col] = 0;
				else
					map[row][col] = this.roots[i].nodes[j].last().value;
			}
		}
		let tips = this.dimmension*this.dimmension-hints;
		while(tips) {
			let row = Math.floor(Math.random() * this.dimmension);
			let col = Math.floor(Math.random() * this.dimmension);
			if(map[row][col] != 0) {
				map[row][col] = 0;
				tips--;
			}
		}
		return map;
	}
	print(hints) {
		let m = this.map(hints);
		for(let row in m) {
			console.log(m[row]);
		}
	}
}
class SudokuPow {
	constructor() {

	}
	validate(map) {
		let size = Math.sqrt(map.length);
		let dimmension = size*size;
		//For all diagonal quadrants
		for(let i=0; i<dimmension; i+=(size+1)) {
			//Validate unique values in quadrant
			let quadrant = []
			for(let j=0; j<dimmension; j++) {
				let row = Math.floor(j*1/size)+(Math.floor(i/size)*size);
				let col = Math.round(j*1-(size*row))+(i*size);
				quadrant[ map[row][col]-1 ] = true;
			}
			if(quadrant.length != dimmension) {
				console.error('Repeating values within quadrant');
				console.log(quadrant);
				return false;
			}

			//Validate same row
			for(let j=0; j<dimmension; j++) {
				let row = Math.floor(j*1/size)+(Math.floor(i/size)*size);
				let col = Math.round(j*1-(size*row))+(i*size);
				let value = map[row][col]
				for(let k=0; k<dimmension; k++) {
					if(map[row][k] == value && k != col) {
						console.error('Repeating values in the same row');
						return false;
					}
				}
			}
			//Validate same col
			for(let j=0; j<dimmension; j++) {
				let row = Math.floor(j*1/size)+(Math.floor(i/size)*size);
				let col = Math.round(j*1-(size*row))+(i*size);
				let value = map[row][col]
				for(let k=0; k<dimmension; k++) {
					if(map[k][col] == value && k != row) {
						console.error('Repeating values in the same column');
						return false;
					}
				}
			}
		}
		return true;
	}
}

module.exports.sudoku = function() {
	//It is not optimized enough to support bigger games
	return new Sudoku(2);
}

module.exports.SudokuPoW = SudokuPow;
