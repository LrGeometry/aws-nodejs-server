const importEnv = require('import-env');
var Web3 = require('web3');
// web3 = new Web3('http://localhost:7545'); // my own blockchain
web3 = new Web3(process.env.INFURA_MAIN)
let address = '0x79c3a0ea58be241a9f5e16c4fb73a7bd19e035d7'; // ACF contract addr
let ABI = [{"constant": false,"inputs": [{"name": "_address","type": "address"},{"name": "_origOrgName","type": "string"},{"name": "_recipOrgName","type": "string"},{"name": "_hercId","type": "uint256"},{"name": "_origTransFctHash","type": "uint256"},{"name": "_recipTransFctHash","type": "uint256"}],"name": "addValidatedTransaction","outputs": [],"payable": false,"stateMutability": "nonpayable","type": "function"},{"constant": false,"inputs": [{"name": "_address","type": "address"},{"name": "_transCost","type": "uint256"},{"name": "_orgName","type": "string"},{"name": "_hercId","type": "uint256"},{"name": "_originator","type": "string"}],"name": "newOrigTrans","outputs": [],"payable": true,"stateMutability": "payable","type": "function"},{"constant": false,"inputs": [{"name": "_address","type": "address"},{"name": "_origOrgName","type": "string"},{"name": "_recipOrgName","type": "string"},{"name": "_hercId","type": "uint256"},{"name": "_origTransFctHash","type": "uint256"},{"name": "_recipTransFctHash","type": "uint256"},{"name": "_transCost","type": "uint256"}],"name": "newRecipTrans","outputs": [],"payable": true,"stateMutability": "payable","type": "function"},{"constant": false,"inputs": [{"name": "_orgName","type": "string"},{"name": "_address","type": "address"},{"name": "_hercId","type": "uint256"},{"name": "_fctHash","type": "uint256"}],"name": "registerNewAsset","outputs": [],"payable": true,"stateMutability": "payable","type": "function"},{"constant": false,"inputs": [{"name": "newOwner","type": "address"}],"name": "transferOwnership","outputs": [],"payable": false,"stateMutability": "nonpayable","type": "function"},{"anonymous": false,"inputs": [{"indexed": true,"name": "from","type": "address"},{"indexed": true,"name": "to","type": "address"},{"indexed": false,"name": "value","type": "uint256"}],"name": "Transfer","type": "event"},{"anonymous": false,"inputs": [{"indexed": false,"name": "_organizationName","type": "string"},{"indexed": false,"name": "_hercId","type": "uint256"}],"name": "NewAssetRegistered","type": "event"},{"anonymous": false,"inputs": [{"indexed": false,"name": "_organizationName","type": "string"},{"indexed": false,"name": "_originator","type": "string"},{"indexed": false,"name": "_hercId","type": "uint256"}],"name": "TransactionOriginated","type": "event"},{"anonymous": false,"inputs": [{"indexed": false,"name": "_recipOrgName","type": "string"},{"indexed": false,"name": "_receiving","type": "string"},{"indexed": false,"name": "_origOrgName","type": "string"},{"indexed": false,"name": "_hercId","type": "uint256"}],"name": "ReceivedTransaction","type": "event"},{"anonymous": false,"inputs": [{"indexed": false,"name": "_validated","type": "string"},{"indexed": false,"name": "_origOrgName","type": "string"},{"indexed": false,"name": "_recipOrgName","type": "string"},{"indexed": false,"name": "_hercId","type": "uint256"}],"name": "ValidTransaction","type": "event"},{"anonymous": false,"inputs": [{"indexed": true,"name": "previousOwner","type": "address"},{"indexed": true,"name": "newOwner","type": "address"}],"name": "OwnershipTransferred","type": "event"},{"constant": true,"inputs": [{"name": "","type": "uint256"}],"name": "assetAccounts","outputs": [{"name": "","type": "address"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "countAssets","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "countOriginTrans","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "countRecipientTrans","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "countValidatedTrans","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "getAllOriginTrans","outputs": [{"name": "","type": "address[]"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "getAllRecipientTrans","outputs": [{"name": "","type": "address[]"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "getAllValidatedTrans","outputs": [{"name": "","type": "address[]"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [{"name": "_address","type": "address"}],"name": "getAsset","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "getAssets","outputs": [{"name": "","type": "address[]"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [{"name": "_address","type": "address"}],"name": "getSingleOriginTrans","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [{"name": "_address","type": "address"}],"name": "getSingleRecipientTrans","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [{"name": "_address","type": "address"}],"name": "getSingleValidatedTrans","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "hercContract","outputs": [{"name": "","type": "address"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [{"name": "","type": "uint256"}],"name": "origTransAccounts","outputs": [{"name": "","type": "address"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "owner","outputs": [{"name": "","type": "address"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [{"name": "","type": "uint256"}],"name": "recipTransAccounts","outputs": [{"name": "","type": "address"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "user","outputs": [{"name": "","type": "address"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [{"name": "","type": "uint256"}],"name": "validatedTransAccounts","outputs": [{"name": "","type": "address"}],"payable": false,"stateMutability": "view","type": "function"}]
let ACF = new web3.eth.Contract(ABI, address)//instantiating

function getAccounts(req, res, next) {
  let accounts = web3.eth.getAccounts().then(accounts => {
    res.send(accounts)
  })
  .catch( err => { console.log(err) })
}

/**
1) do a get request for client payload containing (what information?) 
    at (what address? localhost:8000/????).
2) presuming it's only a string, utilize hex function to 
    convert string and write it to the ACF contract.
 */
function getHex(req, res, next) {
  let stringPayload = obj.location;
  let convertedStr =  web3.utils.randomHex(stringPayload.toString());
  ACF.methods.owner().call()
    .then(results => {
      res.send(results)
  })
    .catch(err => {console.log(err)})
}

// 0x1a2a618f83e89efbd9c9c120ab38c1c2ec9c4e76 herc creator - logan
// 0x1864a4327931f04b7fb489be97667fce1b23223e receiver - stack
function balanceOf(req, res, next) {
  web3.eth.getBalance("0x942fe152331e6ca69656ee4feaeb8241829a978a").call()
    .then(results => {
    res.send(results)
  })
    .catch(err => {console.log(err)})
}

function addValidatedTransaction(req, res, next) {
// TODO: add variables
  ACF.methods.addValidatedTransaction().call()
    .then(results => {
      res.send(results)
  })
    .catch(err => {console.log(err)})
}

function assetAccounts(req, res, next) {
  // TODO: add variables
  ACF.methods.countAssets().call()
    .then(results => {
      res.send(results)
  })
    .catch(err => {console.log(err)})
}

function countAssets(req, res, next) {
  ACF.methods.countAssets().call()
    .then(results => {
      res.send(results)
  })
    .catch(err => {console.log(err)})
}

function countOriginTrans(req, res, next) {
  ACF.methods.countOriginTrans().call()
    .then(results => {
      res.send(results)
  })
    .catch(err => {console.log(err)})
}

function countRecipientTrans(req, res, next) {
  ACF.methods.countRecipientTrans().call()
    .then(results => {
      res.send(results)
  })
    .catch(err => {console.log(err)})
}

function countValidatedTrans(req, res, next) {
  ACF.methods.countValidatedTrans().call()
    .then(results => {
      res.send(results)
  })
    .catch(err => {console.log(err)})
}

function getAllOriginTrans(req, res, next) {
  ACF.methods.getAllOriginTrans().call()
    .then(results => {
      // should return an array of addresses
      res.send(results)
  })
    .catch(err => {console.log(err)})
}

function getAllRecipientTrans(req, res, next) {
  ACF.methods.getAllRecipientTrans().call()
    .then(results => {
      // should return an array of addresses
      res.send(results)
  })
    .catch(err => {console.log(err)})
}

function getAllValidatedTrans(req, res, next) {
  ACF.methods.getAllValidatedTrans().call()
    .then(results => {
      // should return array of address
      res.send(results)
  })
    .catch(err => {console.log(err)})
}

function getAsset(req, res, next) {
  let address = '0x942fe152331e6ca69656ee4feaeb8241829a978a'
  ACF.methods.getAsset(address).call()
    .then(results => {
      // should return a single hercId
      res.send(results)
  })
    .catch(err => {console.log(err)})
}

function getAssets(req, res, next) {
  ACF.methods.getAssets().call()
  // should return array of address
    .then(results => {
    res.send(results)
  })
    .catch(err => {console.log(err)})
}

function getSingleOriginTrans(req, res, next) {
  let address = '0x942fe152331e6ca69656ee4feaeb8241829a978a'
  ACF.methods.getSingleOriginTrans(address).call()
    .then(results => {
      // should return single hercId
      res.send(results)
  })
    .catch(err => {console.log(err)})
}

function getSingleRecipientTrans(req, res, next) {
  let address = '0x942fe152331e6ca69656ee4feaeb8241829a978a'
  ACF.methods.getSingleRecipientTrans(address).call()
    .then(results => {
      // should return single hercId
      res.send(results)
  })
    .catch(err => {console.log(err)})
}

function getSingleValidatedTrans(req, res, next) {
  let address = '0x942fe152331e6ca69656ee4feaeb8241829a978a'
  ACF.methods.getSingleValidatedTrans(address).call()
    .then(results => {
      res.send(results)
  })
    .catch(err => {console.log(err)})
}

function hercContract(req, res, next) {
  ACF.methods.hercContract().call()
    .then(results => {
      res.send(results)
  })
    .catch(err => {console.log(err)})
}

function newOrigTrans(req, res, next) {
  // TODO add variables
  // NOTE doesnt return anything
  ACF.methods.newOrigTrans().call()
    .then(results => {
      res.send(results)
  })
    .catch(err => {console.log(err)})
}

function newRecipTrans(req, res, next) {
  // TODO add variables
  // NOTE doesnt return anything
  ACF.methods.newRecipTrans().call()
    .then(results => {
      res.send(results)
  })
    .catch(err => {console.log(err)})
}

function origTransAccounts(req, res, next) {
  // TODO add variable
  ACF.methods.origTransAccounts().call()
    .then(results => {
      res.send(results)
  })
    .catch(err => {console.log(err)})
}

function owner(req, res, next) {
  ACF.methods.owner().call()
    .then(results => {
      res.send(results)
  })
    .catch(err => {console.log(err)})
}


function recipTransAccounts(req, res, next) {
  // TODO add variable
  ACF.methods.recipTransAccounts().call()
    .then(results => {
      res.send(results)
  })
    .catch(err => {console.log(err)})
}

function registerNewAsset(req, res, next) {
  // NOTE: doesnt return anything
  // TODO: add variables
  ACF.methods.registerNewAsset('megatron', '0x942fe152331e6ca69656ee4feaeb8241829a978a', 12, 334).call()
    .then(results => {
    res.send(results)
  })
    .catch(err => {console.log(err)})
}

function validatedTransAccounts(req, res, next) {
  // TODO add variable
  ACF.methods.validatedTransAccounts().call()
    .then(results => {
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
  getLatestBlock: getLatestBlock,
  balanceOf: balanceOf,
  getAccounts: getAccounts,
  registerNewAsset: registerNewAsset,
  getAssets:getAssets,
  countAssets: countAssets
}
