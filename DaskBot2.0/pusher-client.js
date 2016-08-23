'use strict';

const Pusher = require('pusher-client');
const request = require('superagent');

const config = require('./config');

const PusherClient = function(botService) {
  const pusher = new Pusher(config.PUSHER_KEY, {
    encrypted: true
  });
  
  const channelMotd = pusher.subscribe('motd');
  const channelStreamer = pusher.subscribe('streamer');
  const channelCsgo = pusher.subscribe('csgo');
  
  function broadcastSkype(successMessage, errorMessage) {
    request
    .get(config.API_ENDPOINT + 'skype')
    .end(function(err, res) {
      if (!err) {
        const result = res.body.result;
        for (let i = 0; i < result.length; i++) {
          botService.send(result[i], successMessage);
        }
      }
      else {
        console.log(errorMessage);
      }
    });
  }

  channelMotd.bind('motd_update', function(data) {
    broadcastSkype(` >> Today's message is: ${data.result.message}`,
                   'Error on grabbing list of subscribers. [motd_update]');
  });
  
  channelStreamer.bind('streamer_added', function(data) {
    broadcastSkype(` >> ${data.result_added.display_name} added to streamer list!`,
                   'Error on grabbing list of subscribers. [streamer_online]');
  })
  .bind('streamer_removed', function(data) {
    broadcastSkype(` >> ${data.result_removed.display_name} removed from streamer list!`,
                   'Error on grabbing list of subscribers. [streamer_online]');
  })
  .bind('streamer_online', function(data) {
    broadcastSkype(` >> ${data.result.display_name} is online! - https://www.twitch.tv/${data.result.name}`,
                   'Error on grabbing list of subscribers. [streamer_online]');
  })
  .bind('streamer_offline', function(data) {
    broadcastSkype(` >> ${data.result.display_name} went offline.`,
                   'Error on grabbing list of subscribers. [streamer_offline]');
  });
  
  channelCsgo.bind('open_lobby', function(data) {
    let game = data.result.gameextrainfo ? data.result.gameextrainfo + ' ' : ''
    broadcastSkype(` >> Come join ${data.result.personaname}'s ${game}lobby! ${config.API_ENDPOINT}steam/join-game?id=${data.result.steamid}`,
                   'Error on grabbing list of subscribers. [open_lobby]');
  })
}

module.exports = PusherClient
