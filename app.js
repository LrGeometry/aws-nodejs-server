require('dotenv').load();
var express = require ('express')
var app = express()
var fs = require('fs')
var axios = require ('axios')
const body_parser = require('body-parser');
const importEnv = require('import-env');
const port = process.env.PORT || 8000;
var db = require('./queries');

app.use(body_parser.urlencoded({extended: false}));

app.set('view engine', 'hbs');
app.use(express.static('public'));



app.get('/', function(req, res){
  response = '';
  res.render('index.hbs', {'response':response});
});


app.get('/api/puppies', db.getAllPuppies);
app.get('/api/puppies/:id', db.getSinglePuppy);
app.post('/api/puppies', db.createPuppy);
// app.put('/api/puppies/:id', db.updatePuppy);
// app.delete('/api/puppies/:id', db.removePuppy);


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
