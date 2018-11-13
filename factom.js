//Required modules
const { FactomCli, Entry, Chain } = require("factom");
var FCT_NODE = process.env.FCT_NODE;
var FCT_PUB_SIG = process.env.FCT_PUB_SIG;


const testChainId = '7b11a72cd69d3083e4d20137bb569423923a55696017b36f46222e9f83964679';

/// Instantiating Factom
// Default factomd connection to localhost:8088
// and walletd connection to localhost:8089


const cli = new FactomCli({
    factomd: {
        host: FCT_NODE // AWS-Node not quite synched as of 10/4/19:27 CST
    },
    walletd: {
        host: FCT_NODE
    }
});



//Chains and Entries

////     Starting with adding entries to the existing chain.
////    Asset Registration will create a unique chain for the asset

function createChain(chainName) {
    const firstEntry = Entry.builder()
        // .extId('6d79206578742069642031') // If no encoding parameter is passed as 2nd argument, 'hex' is used
        .extId('first herc chain from server', 'utf8') // Explicit the encoding. Or you can pass directly a Buffer
        .extId('Can have as many of these as we want', 'utf8')
        .extId(Date.now().toString())
        .content('The remote Herc chain creation', 'utf8')
        .build();

    const chain = new Chain(firstEntry);
    cli.add(chain, FCT_PUB_SIG)
        .then(console.log)
        .catch(console.error);

}


// Add an entry, may need to turn this into async, tests will decide.
function createEntry(req, res, next) {
  var token = req.headers['authorization'];
  if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
  firebase.auth().signInWithCustomToken(token)
  .then(user_login => {
    var data = JSON.parse(Object.keys(req.body))
    var extIdString = data.assetInfo;
    var chainId = data.chainId
    var hash = data.hash
    var hashString = JSON.stringify(hash)
    console.log(hashString)

    const myEntry = Entry.builder()
        .chainId(chainId)
        .extId(Date.now().toString())
        .extId(extIdString, 'utf8')
        .content(hashString, 'utf8')
        .build();

    cli.add(myEntry, FCT_PUB_SIG)
        .then(console.log)
        .catch(console.error);
      })
};



// Get a Single Entry
function getEntry(entryHash) {
    cli.getEntry(entryHash).then(
        entry =>
            console.log(entry)
    )
}


// Get All the Entries
function getAllEntries(chainId_Or_firstEntryHash) {
    cli.getAllEntriesOfChain(chainId_Or_firstEntryHash).then(
        entries =>
            console.log("get all entries, chainID:", chainId_Or_firstEntryHash, "entries:", entries)
    )
}

// FactomCli exposes the method
// rewindChainWhile(chainId, function predicate(entry) {}
//  function body(entry) {})



// Iterating a long chain entry by entry
async function iterateChain(chainId) {
    await cli.rewindChainWhile(chainId,
        () => true,
        entry => console.log(entry)// Process entry
    )
}

// Searching an entry in a chain
async function searchChain(entryHash, searchParam) {
    let search = true, found;
    await cli.rewindChainWhile(entryHash,
        () => search,
        function (entry) {
            if (entry.extId[0].toString() === searchParam) {
                search = false;
                found = entry;
            }
        });


}

module.exports = {

    createChain: createChain,
    createEntry: createEntry,
    getEntry: getEntry,
    getAllEntries: getAllEntries,
    iterateChain: iterateChain,
    searchChain: searchChain,


};
