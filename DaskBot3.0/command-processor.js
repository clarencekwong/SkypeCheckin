'use strict';

const request = require('superagent');

const config = require('./config');

const commandTable = {
  'subscribe': function(args, data, successHandler, errorHandler) {
    const address = data.address;
    request
    .post(config.API_ENDPOINT + 'skype2')
    .send( address )
    .end(function(err, res) {
      if (!err) {
        successHandler(`Convo: ${address.conversation.id} subscribed!`);
      }
      else {
        errorHandler(`Error: ${err.response.body.error}`);
      }
    });
  },
  'unsubscribe': function(args, data, successHandler, errorHandler) {
    const convo_id = data.address.conversation.id;
    request
    .del(config.API_ENDPOINT + 'skype2')
    .send({ convo_id: convo_id })
    .end(function(err, res) {
      if (!err) {
        successHandler(`${convo_id} unsubscribed.`);
      }
      else {
        errorHandler(`Error: ${err.response.body.error}`);
      }
    });
  },
  '8ball': function(args, data, successHandler, errorHandler) {
    request
    .get(config.API_ENDPOINT + 'eight_ball')
    .end(function(err, res) {
      if (!err) {
        successHandler(`${res.body.result.answer}. [${res.body.result.status}]`);
      }
      else {
        errorHandler(`Error: ${err.response.body.error}`);
      }
    });
  },
  'catch': function(args, data, successHandler, errorHandler) {
    var sendParams = data.address;
    sendParams.point_id = args[0];
    sendParams.point_secret = config.POINT_SECRET
    request
    .put(config.API_ENDPOINT + 'point')
    .send(sendParams)
    .end(function(err, res) {
      if (!err) {
        successHandler(`${res.body.result.user.name} successfully captured a ${res.body.result.friendly_name}! ${config.FRONTEND_DOMAIN}pokemon.`);
      }
      else {
        errorHandler(`Error: ${err.response.body.error}`);        
      }
      
    })
  },
  'tourney-status': function(args, data, successHandler, errorHandler) {
    var sendParams = data.address;
    sendParams.point_secret = config.POINT_SECRET
    request
    .get(config.API_ENDPOINT + 'poke-shuffle')
    .send(sendParams)
    .end(function(err, res) {
      if (!err) {
        let result = 'Current tourney entries:\n'
        for (let i = 0; i < res.body.result.length; i++) {
          let currentTrainer = res.body.result[i]
          result += `${currentTrainer.user_name}: ${currentTrainer.friendly_name}\n`;
        }
        result === '' ? successHandler('No tourney is on!') : successHandler(result);
      }
      else {
        errorHandler(`Error: ${err.response.body.error}`);        
      }
      
    })
  },
  'tourney-enter': function(args, data, successHandler, errorHandler) {
    var sendParams = data.address;
    sendParams.friendly_name = args[0];
    sendParams.point_secret = config.POINT_SECRET
    request
    .post(config.API_ENDPOINT + 'poke-shuffle')
    .send(sendParams)
    .end(function(err, res) {
      if (!err) {
        successHandler(res.body.result);
      }
      else {
        errorHandler(`Error: ${err.response.body.error}`);        
      }
      
    })
  },
  'tourney-leave': function(args, data, successHandler, errorHandler) {
    var sendParams = data.address;
    sendParams.point_secret = config.POINT_SECRET
    request
    .delete(config.API_ENDPOINT + 'poke-shuffle')
    .send(sendParams)
    .end(function(err, res) {
      if (!err) {
        successHandler(res.body.result);
      }
      else {
        errorHandler(`Error: ${err.response.body.error}`);        
      }
      
    })
  },
  'message': function(args, data, successHandler, errorHandler) {
    if (!args.length) {
      request
      .get(config.API_ENDPOINT + 'motd')
      .end(function(err, res) {
        if (!err) {
          successHandler(`Today's message is: ${res.body.result.message}`);
        }
        else {
          errorHandler(`Error: ${err.response.body.error}`);
        }
      });
    }
    else {
      request
      .patch(config.API_ENDPOINT + 'motd')
      .send({ submitted_by: data.from, message: args.join(" ") })
      .end(function(err, res) {
        if (!err) {
          // Broadcast should happen
        }
        else {
          errorHandler(`Error: ${err.response.body.error}`);
        }
      });
    }
  },
  'live': function(args, data, successHandler, errorHandler) {
    request
    .get(config.API_ENDPOINT + 'streamer/get-live')
    .end(function(err, res) {
      if (!err) {
        let result = '';
        for (let i = 0; i < res.body.result.length; i++) {
          let currentStreamer = res.body.result[i]
          result += `${currentStreamer.stream.channel.display_name} (Viewers: ${currentStreamer.stream.viewers}) - ${currentStreamer.stream.channel.url} \n`;
        }
        result === '' ? successHandler('No streamers are online!') : successHandler(result);
      }
      else {
        errorHandler(`Error: ${err.response.body.error}`);
      }
    });
  },
  'streamers': function(args, data, successHandler, errorHandler) {
    request
    .get(config.API_ENDPOINT + 'streamer')
    .end(function(err, res) {
      if (!err) {
        successHandler(res.body.result.sort().join(", "));
      }
      else {
        errorHandler(`Error: ${err.response.body.error}`);
      }
    });
  },
  'addstreamer': function(args, data, successHandler, errorHandler) {
    request
    .post(config.API_ENDPOINT + 'streamer')
    .send({ submitted_by: data.from, id: args[0] })
    .end(function(err, res) {
      if (!err) {
        // Broadcast should happen
        // successHandler(`${res.body.result.display_name} subscribed!`);
      }
      else {
        errorHandler(`Error: ${err.response.body.error}`);
      }
    });
  },
  'points': function(args, data, successHandler, errorHandler) {
    request
    .get(config.API_ENDPOINT + 'point')
    .end(function(err, res) {
      if (!err) {
        var resultObj = res.body.result;
        var resultString = 'Results:\n'
        for (var key in resultObj) {
          resultString += `${key}: ${resultObj[key]}\n`;
        }
        successHandler(resultString);
      }
      else {
        errorHandler(`Error: ${err.response.body.error}`);        
      }
      
    })
  },
  'removestreamer': function(args, data, successHandler, errorHandler) {
    request
    .del(config.API_ENDPOINT + 'streamer')
    .send({ submitted_by: data.from, id: args[0] })
    .end(function(err, res) {
      if (!err) {
        // Broadcast should happen
        // successHandler(`${res.body.result.display_name} subscribed!`);
      }
      else {
        errorHandler(`Error: ${err.response.body.error}`);
      }
    });
  },
  'hscard': function(args, data, successHandler, errorHandler) {
    request
    .get(config.API_ENDPOINT + 'hscard' + '/' + args.join(' '))
    .end(function(err, res) {
      if (!err) {
        const name = res.body.result.name ? `${res.body.result.name}` : ''
        const text = res.body.result.text ? res.body.result.text.replace('$', '').replace('#', '') : '';
        const img = res.body.result.imgGold ? `${res.body.result.imgGold}` : ''
        const mana = res.body.result.cost ? `${res.body.result.cost} Mana` : ''
        const stats = res.body.result.attack && res.body.result.health ? `${res.body.result.attack}/${res.body.result.health}` : ''
        successHandler(`${name} - ${text} - ${img} - ${mana} - ${stats}`);
      }
      else {
        errorHandler(`Error: ${err.response.body.error}`);
      }
    });
  },
  'help': function(args, data, successHandler, errorHandler) {
    successHandler(`List of commands:\n${Object.keys(commandTable).sort().join("\n")}`);
  },
  'csgo': function(args, data, successHandler, errorHandler) {
    successHandler('<b>GOGOGOGOGOGGO\nGOGOGOGOGOGGO\nGOGOGOGOGOGGO\nGOGOGOGOGOGGO</b>');
  },
  'kawkaw': function(args, data, successHandler, errorHandler) {
    successHandler('<b>KAW AWH KAW AWH KAW AWH\nKAW AWH KAW AWH KAW AWH\nKAW AWH KAW AWH KAW AWH\nKAW AWH KAW AWH KAW AWH</b>');
  },
  'wubwub': function(args, data, successHandler, errorHandler) {
    successHandler('<i>WUBWUBWUBWUB\nWUBWUBWUBWUB\nWUBWUBWUBWUB\nWUBWUBWUBWUB</i>');
  },
  'watchtogether': function(args, data, successHandler, errorHandler) {
    successHandler('https://www.reddit.com/r/instasync/comments/4nyxq1/wonder_what_happened_to_instasync_look_here');
  },
  'theclub': function(args, data, successHandler, errorHandler) {
    successHandler('http://www.soulwalrus.club');
  },
  'bot-train-t': function(args, data, successHandler, errorHandler) {
    request
    .get(config.API_ENDPOINT + 'csgo/bot-train-t')
    .end(function(err, res) {
      if (!err) {
        successHandler('\n' + res.body.result.join('\n'));
      }
      else {
        errorHandler(`Error: ${err.response.body.error}`);
      }
    });
  },
  'bot-train-ct': function(args, data, successHandler, errorHandler) {
    request
    .get(config.API_ENDPOINT + 'csgo/bot-train-ct')
    .end(function(err, res) {
      if (!err) {
        successHandler('\n' + res.body.result.join('\n'));
      }
      else {
        errorHandler(`Error: ${err.response.body.error}`);
      }
    });
  },
  'music': function(args, data, successHandler, errorHandler) {
    request
    .get(config.API_ENDPOINT + 'music?provider=' + args[0])
    .end(function(err, res) {
      if (!err) {
        if (res.body.result.type === 'SPOTIFY') {
          successHandler(`Give this a listen:\nApp: ${config.API_ENDPOINT}play-song?id=${res.body.result.id}\nWeb: ${res.body.result.link}\n<b>${res.body.result.name}</b> by ${res.body.result.artists.join(", ")}`);
        }
        else if (res.body.result.type === 'SOUNDCLOUD') {
          successHandler(`Give this a listen:\nWeb: ${res.body.result.link}\n<b>${res.body.result.name}</b> by ${res.body.result.artists.join(", ")}`);
        }
        else {
          errorHandler(`Error: Undefined error! Contact ryan@soulwalrus.club.`);
        }
      }
      else {
        errorHandler(`Error: ${err.response.body.error}`);
      }
    });
  }
}

function removeMention(msg) {
  return msg.replace(/\<at.*\<\/at\> /, '');
}

module.exports = {
  handleCommand: function(message, successHandler, errorHandler) {
    const parsed = removeMention(message.text).trim().split(/\s+/);
    const command = parsed[0];
    const args = parsed.splice(1);
    if (commandTable[command]) {
      commandTable[command](args, message, successHandler, errorHandler);
    }
    else {
      errorHandler(`Command <b>${command}</b> not supported. Send suggestions at ryan@soulwalrus.club. \n <b>help</b> for commands.`)
    }
  }
};
