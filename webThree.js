var Web3 = require('web3');
web3 = new Web3('http://localhost:7545'); // my own blockchain
let address = '0x4e1ee41cbb566f97da638bb43e520a1cdab9b0c9'
let ABI = [
	{
		"constant": false,
		"inputs": [
			{
				"name": "_name",
				"type": "string"
			},
			{
				"name": "_description",
				"type": "string"
			},
			{
				"name": "_manufacturer",
				"type": "string"
			},
			{
				"name": "_createdOn",
				"type": "uint256"
			},
			{
				"name": "_owner",
				"type": "address"
			}
		],
		"name": "_createAsset",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_to",
				"type": "address"
			},
			{
				"name": "_origin",
				"type": "string"
			},
			{
				"name": "_destination",
				"type": "string"
			},
			{
				"name": "_startDate",
				"type": "uint256"
			},
			{
				"name": "_error",
				"type": "bool"
			}
		],
		"name": "_startTransaction",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "receiver",
				"type": "address"
			}
		],
		"name": "addRecipient",
		"outputs": [
			{
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"name": "",
				"type": "uint256"
			},
			{
				"indexed": false,
				"name": "",
				"type": "string"
			},
			{
				"indexed": false,
				"name": "",
				"type": "string"
			}
		],
		"name": "NewTransactionCreated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"name": "",
				"type": "uint256"
			},
			{
				"indexed": false,
				"name": "",
				"type": "string"
			},
			{
				"indexed": false,
				"name": "",
				"type": "string"
			}
		],
		"name": "NewAssetCreate",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_num",
				"type": "uint256"
			}
		],
		"name": "show",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "id",
				"type": "uint256"
			}
		],
		"name": "_getAsset",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			},
			{
				"name": "",
				"type": "string"
			},
			{
				"name": "",
				"type": "string"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "id",
				"type": "uint256"
			}
		],
		"name": "_getTransaction",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			},
			{
				"name": "",
				"type": "string"
			},
			{
				"name": "",
				"type": "string"
			},
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	}
]
let CreateAsset = new web3.eth.Contract(ABI, address)//instantiating

function show(req, res, next){
  CreateAsset.methods.show(sdf).call()
    .then(results => {
    console.log(results, 'chance results')
    res.send(results)
  })
    .catch(err => {console.log(err)})
}

function getLatestBlock(req, res, next) {
  web3.eth.getBlock("latest", (err, block) => {
    if (err) return;
    res.send(block)
  })
}

module.exports = {
  getLatestBlock: getLatestBlock
}
