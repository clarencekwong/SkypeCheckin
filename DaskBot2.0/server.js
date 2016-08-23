'use strict';

const request = require('superagent');
const restify = require('restify');
const skype = require('skype-sdk');

const CommandProcessor = require('./command-processor');
const config = require('./config');
const PusherClient = require('./pusher-client.js');

const botService = new skype.BotService({
    messaging: {
        botId: config.BOT_ID,
        serverUrl : "https://apis.skype.com",
        requestTimeout : 15000,
        appId: config.APP_ID,
        appSecret: config.APP_SECRET,
    }
});

const messageEditedPattern = new RegExp(/Edited previous message:.*\<.*\/\>/)

function processCommand(data, successHandler, errorHandler) {
  if (data.content.startsWith('%')) {
    CommandProcessor.handleCommand(data, successHandler, errorHandler);
  }
  else {    
    // New sentiment analysis service by AlchemyAPI
    if (process.env.NODE_ENV === 'production') {
      if (data.content.trim().split(/\s+/).length > 2 && !messageEditedPattern.exec(data.content)) {
        request
        .get(`http://gateway-a.watsonplatform.net/calls/text/TextGetTextSentiment?apikey=${config.ALCHEMY_API_KEY}&text=${data.content}&outputMode=json`)
        .end(function(err, res) {
          if (!err) {
            if (parseFloat(res.body.docSentiment.score) <= -0.70 && res.body.docSentiment.type === 'negative') {
              successHandler(`Hey ${data.from}, Are you feeling negative?`);
            }
            else if (parseFloat(res.body.docSentiment.score) >= 0.70 && res.body.docSentiment.type === 'positive') {
              successHandler(`Hey ${data.from}, Why are you so positive?`);
            }
          }
        })
      }
    }

    /*
    // Old Sentiment analysis service. Uses https://market.mashape.com/vivekn/sentiment-3
    request
    .post('https://community-sentiment.p.mashape.com/text/')
    .set('X-Mashape-Key', config.MASHAPE_KEY)
    .send( `txt=${data.content}`)
    .end(function(err, res) {
      if (!err) {
        if (parseInt(res.body.result.confidence) >= 75 && res.body.result.sentiment === 'Negative') {
          successHandler(`Hey ${data.from}, Are you angry/sad? (confidence ${res.body.result.confidence})`);
        }
        else if (parseInt(res.body.result.confidence) >= 75 && res.body.result.sentiment === 'Positive') {
          successHandler(`Hey ${data.from}, Why are you so positive? (confidence ${res.body.result.confidence})`);
        }
      }
    })
    */
  }
}

function handleMessage(bot, data) {
  processCommand(data,
    function(res) {
      bot.reply(" >> " + encodeEntities(res));
    },
    function(err) {
      bot.reply(" >> " + encodeEntities(err));
    }
  );
}

function encodeEntities(msg) {
  const encodeEntitiesMap = [
        ['&', '&amp;'],
    ];
    for (let i = 0; i < encodeEntitiesMap.length; i++) {
      msg = msg.replace(encodeEntitiesMap[i][0], encodeEntitiesMap[i][1]);
    }
    return msg;
}

function decodeEntities(msg) {
  const decodeEntitiesMap = [
        ['&apos;', '\''],
        ['&amp;', '&'],
        ['&lt;', '<'],
        ['&gt;', '>']
    ];
  
  for (let i = 0; i < decodeEntitiesMap.length; i++) {
    msg = msg.replace(decodeEntitiesMap[i][0], decodeEntitiesMap[i][1]);
  }
  return msg;
}

botService.on('contactAdded', (bot, data) => {
    bot.reply(`Hello ${data.fromDisplayName}! I am Daskbot 2.0`, true);
});

botService.on('message', (bot, data) => {
  const chat_id = config.BOT_ID === data.to ? data.from : data.to;
  bot._replyTo = chat_id;
  data.content = decodeEntities(data.content);
  handleMessage(bot, data);
});

// Start pusher client subscriptions.
PusherClient(botService);

const server = restify.createServer();
server.use(skype.verifySkypeCert());
server.post('/v1/chat', skype.messagingHandler(botService));
const port = process.env.PORT || 9000;
server.listen(port);
console.log('Listening for incoming requests on port ' + port);
