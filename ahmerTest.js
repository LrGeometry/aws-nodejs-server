
var Web3 = require('web3');
web3 = new Web3(process.env.INFURA_MAIN)

let aString = "23123";
console.log(aString);
let aConversion = parseInt(aString);
console.log(aConversion);
let convertedStr =  web3.utils.randomHex(aConversion);

console.log(convertedStr);