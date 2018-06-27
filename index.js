var express = require ('express')
var app = express()
var fs = require('fs')
var axios = require ('axios')
const body_parser = require('body-parser');
const importEnv = require('import-env')
const port = process.env.PORT || 8000;

app.use(body_parser.urlencoded({extended: false}));

app.set('view engine', 'hbs');
app.use(express.static('public'));

app.get('/', function(req, res){
  matrix = 'hello' || '';
  distance = 'world' || '';
  res.render('index.hbs', {'matrix':matrix, 'distance': distance});
});

app.listen(port, function(){
  console.log('listening on port ' + port)
});
