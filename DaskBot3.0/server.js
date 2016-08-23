const restify = require('restify');
const builder = require('botbuilder');
const config = require('./config');
const CommandProcessor = require('./command-processor');
const PusherClient = require('./pusher-client.js');

const server = restify.createServer();

server.listen(3798, function () {
  console.log('%s listening to %s', server.name, server.url); 
});
  
const connector = new builder.ChatConnector({
  appId: config.APP_ID,
  appPassword: config.APP_SECRET
});
const bot = new builder.UniversalBot(connector);

// Start pusher client subscriptions.
PusherClient(bot);

server.post('/api/messages', connector.listen());

//=========================================================
// Activity Events
//=========================================================

bot.on('conversationUpdate', function (message) {
   // Check for group conversations
  if (message.address.conversation.isGroup) {
    // Send a hello message when bot is added
    if (message.membersAdded) {
      message.membersAdded.forEach(function (identity) {
        if (identity.id === message.address.bot.id) {
          var reply = new builder.Message()
              .address(message.address)
              .text("Hello everyone!");
          bot.send(reply);
        }
      });
    }

    // Send a goodbye message when bot is removed
    if (message.membersRemoved) {
      message.membersRemoved.forEach(function (identity) {
        if (identity.id === message.address.bot.id) {
          var reply = new builder.Message()
            .address(message.address)
            .text("Goodbye!");
          bot.send(reply);
        }
      });
    }
  }
});

bot.on('contactRelationUpdate', function (message) {
  if (message.action === 'add') {
    var name = message.user ? message.user.name : null;
    var reply = new builder.Message()
        .address(message.address)
        .text("Hello %s... Thanks for adding me!", name || 'there');
    bot.send(reply);
  } else {
    // delete their data
  }
});

bot.on('typing', function (message) {
  // User is typing
  console.log(message);
});

//=========================================================
// Bots Dialogs
//=========================================================

function newLinesToBreaks(msg) {
  return msg.replace(/(^\s+|\s+$)/g,'').replace(/\n/g, '<br/>');
}

function removeMention(msg) {
  return msg.replace(/\<at.*\<\/at\> /, '');
}

function handleMessage(session) {
  CommandProcessor.handleCommand(
    session.message,
    function(res) {
      session.send("-> " + newLinesToBreaks(res));
    },
    function(err) {
      session.send("-> " + newLinesToBreaks(err));
    }
  );
}

bot.dialog('/', [
  function (session) {
    handleMessage(session);
  }
]);
