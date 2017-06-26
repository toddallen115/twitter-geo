var express = require('express');
var http = require('http');

var path = require('path');
var bodyParser = require('body-parser');

// // //

var d3 = require("d3");
var jsdom = require("jsdom");
var objectToJSON = require("object-to-json");
var fs = require('fs-extra');

// var document = jsdom.jsdom();
// var svg = d3.select(document.body).append("svg");

var app = express();
// // //

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// // // //

var Twitter = require('twitter');

var client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

// // // // // //


app.get('/', function(req, res){
  res.render('form');
});

app.post('/', function(req, res){
  var wordsObj = {};
  var filteredWords = {};
  var hashtags = {};

  var JSONobj = {
    name: "test",
    children: []
  };
  
  client.get(`https://api.twitter.com/1.1/search/tweets.json?q=%23${req.body.hashtag}&geocode=${req.body.latitude}%2C${req.body.longitude}%2C${req.body.radius}mi&count=100`,
      function(err, tweets, response){

        tweets.statuses.forEach(function(tweet){
          var wordArr = tweet.text.split(" ");

          wordArr.forEach(function(word){
            if(wordsObj[word]){
              wordsObj[word]++;
            }else{
              wordsObj[word] = 1;
            }
          });
        });
        for(var key in wordsObj){ //filter results
          if(key[0] === '#'){
            hashtags[key] = wordsObj[key];
          }else if(wordsObj[key] !== 1){
            filteredWords[key] = wordsObj[key];
          }
        };

        for(var key in filteredWords){
          var obj = {};
          obj.name = key;
          obj.size = filteredWords[key];
          JSONobj.children.push(obj);
        };

        //console.log(JSONobj);
        var jsonData = JSON.stringify(JSONobj);
        //res.render('data')
        //empty data directory
        fs.emptyDir('./public/data')
        .then(() => { //recreate data file
          fs.ensureFile('./public/data/test.json')
          .then(() => { //write json to data file
            fs.writeJsonSync('./public/data/test.json', JSONobj)
            // .then(() => { //in cb, render data hbs
              res.render('data')
            // })
          })
        })



      });
    })


// // // // // // // // // // // // // // // // //
var port = process.env.PORT || '3000';

var server = http.createServer(app);

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

function onError(error){
  console.log(error);
}

function onListening(){
  console.log("Listening on port " + port);
}


////////////////////////////////////////////////////////////////////////////////////////
