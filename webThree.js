////// THIS WILL BE THE HOME OF THE CONTRACT STUFF /////////
var Web3 = require('web3');
web3 = new Web3(process.env.INFURA_ROPSTEN);

function getLatestBlock(req, res, next) {
  web3.eth.getBlock("latest", (err, block) => {
    if (err) return;
    console.log(block, "chance block")
    res.send(block)
  })
}

module.exports = {
  getLatestBlock: getLatestBlock
}
