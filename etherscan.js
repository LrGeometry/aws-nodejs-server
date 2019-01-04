var qs = require('querystring')
var request = require('request')
var ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
console.log(ETHERSCAN_API_KEY, 'etherscan api key')
/*
Get Ether Balance for a single Address

https://api.etherscan.io/api?module=account&action=balance&address=0xddbd2b932c763ba5b1b7ae3b362eac3e8d40121a&tag=latest&apikey=YourApiKeyToken

*/
var body = {
  module: 'account',
  action: 'balance',
  address: '0xddbd2b932c763ba5b1b7ae3b362eac3e8d40121a',
  apikey: ETHERSCAN_API_KEY
}
var req_data = qs.parse(body)
console.log(body,'body')
console.log(req_data, 'qs parsed body')

// request.post({
//   proxy: FIXIE_URL,
//   url: 'https://web.idologylive.com/api/idliveq-answers.svc',
//   form: data
// }, function(error, response, body){
//   console.log(body)
// });
//
//
// request
//   .get('http://google.com/img.png')
//   .on('response', function(response) {
//     console.log(response.statusCode) // 200
//     console.log(response.headers['content-type']) // 'image/png'
//   })
//   .pipe(request.put('http://mysite.com/img.png'))
