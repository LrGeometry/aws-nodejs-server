
var Web3 = require('web3');
web3 = new Web3(process.env.INFURA_MAIN)

let aString = "23123";
console.log(aString);

let ABI = [{"name": "_origOrgName","type": "string"},{"name": "_recipOrgName","type": "string"},{"name": "_hercId","type": "uint256"},{"name": "_origTransFctHash","type": "uint256"},{"name": "_recipTransFctHash","type": "uint256"}]
let strA = JSON.stringify(ABI);

let convertedStr =  web3.utils.toHex(strA);

console.log(convertedStr);

var str = web3.utils.toHex({test: 'test'});
console.log(str); // '0x7b2274657374223a2274657374227d'

