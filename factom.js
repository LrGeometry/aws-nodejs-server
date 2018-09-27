var { Entry, Chain, FactomCli } = require ('factom');
var cli = new FactomCli()

function factomAddChain() {
  const firstEntry = Entry.builder()
    .extId('6d79206578742069642031') // If no encoding parameter is passed as 2nd argument, 'hex' is used
    // .extId('my ext id 1', 'utf8') // Explicit the encoding. Or you can pass directly a Buffer
    .content('Initial content')
    .build();

  const chain = new Chain(firstEntry);
  cli.add(chain, 'Es32PjobTxPTd73dohEFRegMFRLv3X5WZ4FXEwNN8kE2pMDfeMym');
}

module.exports = {
  factomAddChain: factomAddChain
};
