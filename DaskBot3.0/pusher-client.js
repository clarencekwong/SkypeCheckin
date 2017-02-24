'use strict';

const Pusher = require('pusher-client');
const request = require('superagent');
const builder = require('botbuilder');

const config = require('./config');

const PusherClient = function(botService) {
  const pusher = new Pusher(config.PUSHER_KEY, {
    encrypted: true
  });
  
  const channelMotd = pusher.subscribe('motd');
  const channelStreamer = pusher.subscribe('streamer');
  const channelCsgo = pusher.subscribe('csgo');
  const channelPoint = pusher.subscribe('point');
  const channelPokeShuffle = pusher.subscribe('poke_shuffle');
  
  function broadcastSkype(successMessage, errorMessage) {
    request
    .get(config.API_ENDPOINT + 'skype2')
    .end(function(err, res) {
      if (!err) {
        let result = res.body.result;
        for (let i = 0; i < result.length; i++) {
          let reply = new builder.Message()
              .address(result[i])
              .text(successMessage);
          botService.send(reply);
        }
      }
      else {
        console.log(errorMessage);
      }
    });
  }

  botService.dialog('/points', [
    function (session, data) {
      let card = new builder.HeroCard(session)
                            .title("A pokemon has appeared!")
                            .text(`It's ${data.result.friendly_name} (${data.result.friendly_id}|${data.result.value})!`)
                            .images([
                              builder.CardImage.create(session, `https://s3.amazonaws.com/soulwalruspokemon/${('000' + data.result.friendly_id).substr(-3)}.png`)
                            ])
                            .buttons([
                              builder.CardAction.imBack(session, `catch ${data.result.id}`, "Catch It!")
                            ]);
     let msg = new builder.Message()
                   .attachments([card]);
     session.send(msg);
     session.endDialog();
    },
  ]);
  
  botService.dialog('/tourney_start', [
    function (session, data) {
      let card = new builder.HeroCard(session)
                            .title("A tourney has started! It ends in 8 hours.")
                            .text(`The prize is ${data.result.friendly_name}(${data.result.friendly_id}|${data.result.value})!`)
                            .images([
                              builder.CardImage.create(session, `https://s3.amazonaws.com/soulwalruspokemon/${('000' + data.result.friendly_id).substr(-3)}.png`)
                            ])
                            .buttons([
                              builder.CardAction.imBack(session, `tourney-status`, "Status!")
                            ]);
     let msg = new builder.Message()
                   .attachments([card]);
     session.send(msg);
     session.endDialog();
    },
  ]);


  function handlePointsSkype(data, dialog_name, successMessage, errorMessage) {
    request
    .get(config.API_ENDPOINT + 'skype2')
    .end(function(err, res) {
      if (!err) {
        let result = res.body.result;
        for (let i = 0; i < result.length; i++) {
          botService.beginDialog(result[i], dialog_name, data);
        }
      }
      else {
        console.log(errorMessage);
      }
    });
  }
  
  channelMotd.bind('motd_update', function(data) {
    broadcastSkype(`-> Today's message is: ${data.result.message}`,
                   'Error on grabbing list of subscribers. [motd_update]');
  });
  
  channelStreamer.bind('streamer_added', function(data) {
    broadcastSkype(`-> ${data.result_added.display_name} added to streamer list!`,
                   'Error on grabbing list of subscribers. [streamer_online]');
  })
  .bind('streamer_removed', function(data) {
    broadcastSkype(`-> ${data.result_removed.display_name} removed from streamer list!`,
                   'Error on grabbing list of subscribers. [streamer_online]');
  })
  .bind('streamer_online', function(data) {
    broadcastSkype(`-> ${data.result.display_name} is online! - https://www.twitch.tv/${data.result.name}`,
                   'Error on grabbing list of subscribers. [streamer_online]');
  })
  .bind('streamer_offline', function(data) {
    broadcastSkype(`-> ${data.result.display_name} went offline.`,
                   'Error on grabbing list of subscribers. [streamer_offline]');
  });
  
  channelCsgo.bind('open_lobby', function(data) {
    let game = data.result.gameextrainfo ? data.result.gameextrainfo + ' ' : ''
    broadcastSkype(`--> Come join ${data.result.personaname}'s ${game}lobby! ${config.API_ENDPOINT}steam/join-game?id=${data.result.steamid}`,
                   'Error on grabbing list of subscribers. [open_lobby]');
  })
  
  channelPoint.bind('point_created', function(data) {
    handlePointsSkype(data, '/points')
                      //`--> There is a point for grabs! Type 'take ${data.result.id}' to grab it before anyone else does!`,
                      //'Error on broadcasting point_created. [point_created]');
  })
  
  channelPokeShuffle.bind('tourney_start', function(data) {
    handlePointsSkype(data, '/tourney_start')
  })
  
  channelPokeShuffle.bind('tourney_end', function(data) {
    broadcastSkype(newLinesToBreaks(data.result),
                   'Error on broadcasting tourney_end. [tourney_end]');
  })
  
  channelPokeShuffle.bind('tourney_reminder', function(data) {
    broadcastSkype(newLinesToBreaks(data.result),
                   'Error on broadcasting tourney_reminder. [tourney_reminder]');
  })
}

function newLinesToBreaks(msg) {
  return msg.replace(/\n/g, '<br/>');
}

module.exports = PusherClient
