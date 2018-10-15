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

function createChain(req, res, next) {
    var cleanedObject = JSON.parse(Object.keys(req.body)[0])
    var ipfsHash = cleanedObject.ipfsHash
    var organizationName = cleanedObject.organizationName
    // console.log("2 Create Chain req.body: ", req.body)
    // console.log("2 ipfshash and organization name: ", ipfsHash, organizationName)

    const firstEntry = Entry.builder()
        // .extId('6d79206578742069642031') // If no encoding parameter is passed as 2nd argument, 'hex' is used
        .extId(organizationName, 'utf8')// Explicit the encoding. Or you can pass directly a Buffer
        // .extId(Date.now().toString()) // Can have as many of these as you want
        .content(ipfsHash, 'utf8')
        .build();

    const chain = new Chain(firstEntry);

    cli.add(chain, FCT_PUB_SIG)
        .then(response => {
          console.log("2 factom chainId: ", response.chainId)
          res.status(200)
            .json(response);
        })
        .catch(err => {console.log(err)});

}


// Add an entry, may need to turn this into async, tests will decide.
function createEntry(req, res, next) {
  // optional to make it a buffer, Factom likes buffers
  // const sigBuffer = new Buffer(identifyingInformation.hash);
    console.log(req.body, "0 fresh from client")
    var data = JSON.parse(Object.keys(req.body)) /* {hash: [{key: 'properties', hash: "Qmassj7ndZ3JyVUPrtSDHAGFGnt363CfE9RC21L5o2duXG"},
              {key: 'images', hash: "Qmassj7ndZ3JyVUPrtSDHAGFGnt363CfE9RC21L5o2duXG"}],
    chainId: "69cb1d318a61e49ce689af628fd2fe03c3541b696e1bc1e",
    assetInfo: "SampleAssetInfo"}'
    */

    var extIdString = data.assetInfo;
    var chainId = data.chainId
    var hash = data.hash // [ { key: 'images', hash: '4435f1ffdb915de7b8e04f29' }, { key: 'properties', hash: 'QmX4EzKBem4JEicrY2j2KoEF6iSnyy7y3A1NuM8C6j9JwM' } ]

    console.log(extIdString, chainId, hash, "1 fresh from client")

    const myEntry = Entry.builder()
        .chainId(chainId)
        .extId(Date.now().toString())
        .extId(extIdString, 'utf8')
        .content(hash, 'utf8')
        .build();

    cli.add(myEntry, FCT_PUB_SIG)
        .then(response => {
          console.log("Success entry in factom chain: ", response)
          /*
          { txId: 'c111f0d03a66db786a946be5e63f344a845371a106800c9a01d743d090b841bd',
            repeatedCommit: false,
            chainId: 'e55c0f97cdb944c45c1ad00c6784976bf697ae6faefc8a9c9f25076b2d80dd38',
            entryHash: '2447e75a189ccee7641811cef42b80fecea28385d709c711a327e30152ec0620' }
          */
          res.send(response.chainId)
        })
        .catch(err => { console.log(err) });

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