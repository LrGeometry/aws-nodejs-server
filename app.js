require('dotenv').load();
var express = require ('express')
var app = express()
var fs = require('fs')
var axios = require ('axios')
const body_parser = require('body-parser');
const importEnv = require('import-env');

var DB = process.env.DATABASE_URL || "{database:'tasks'}"
const pgp = require('pg-promise')();
// var DB = process.env.DATABASE_URL
const db = pgp(DB);
const port = process.env.PORT || 8000;

db.connect()
    .then(obj => {
        obj.done(); // success, release the connection;
    })
    .catch(error => {
        console.log('ERROR:', error.message || error);
    });

app.use(body_parser.urlencoded({extended: false}));

app.set('view engine', 'hbs');
app.use(express.static('public'));


app.get('/', function(req, res){
  response = '';
  res.render('index.hbs', {'response':response});
});

app.get('/post/:slug', function (req, res) {
  // for links like /post/julie
  var slug = request.params.slug;
  response.send('Post About: ' + slug);
});

app.get('/hello', function (req, res) {
  //for links like /hello?name=julie
  var name = request.query.name || 'World';
  response.send('Hello ' + name);
});


app.listen(port, function(){
  console.log('listening on port ' + port)
});
