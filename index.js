var express = require('express');
var router = express.Router();
var http = require('http');

var path = require('path');
var bodyParser = require('body-parser');

// // //

var d3 = require("d3");
var jsdom = require("jsdom");

// var document = jsdom.jsdom();
// var svg = d3.select(document.body).append("svg");

// // //

router.set('views', path.join(__dirname, 'views'));
router.set('view engine', 'hbs');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

// // // //

var Twitter = require('twitter');

var client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

// // // // // //
var wordsObj = {};
var filteredWords = {};
var hashtags = {};

router.get('/', function(req, res){
  client.get('https://api.twitter.com/1.1/search/tweets.json?q=%23Traffic&geocode=45.5209273%2C-122.6802017%2C10mi&count=100',
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

        console.log(wordsObj);
        console.log(hashtags);
        console.log(filteredWords);
      });

});


// // // // // // // // // // // // // // // // //
var port = process.env.PORT || '3000';

var server = http.createServer(router);

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
