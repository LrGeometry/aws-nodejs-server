async function shortenURL(req,res,next){

    const { BitlyClient } = require('bitly');
    const bitly = new BitlyClient('d0431aa5959bc5e4fcc007d3d13efdf3cbb73e71', {});
     
    let result;
    try {
      result = await bitly.shorten(req.body.longURL);
    } catch(e) {
      throw e;
    }
    
    res.send(result);
}

module.exports = {
    shortenURL: shortenURL
}