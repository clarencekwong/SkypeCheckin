# python skype.py [-r]
# -*- coding: utf-8 -*-

import argparse
import time
import zerorpc

from datetime import datetime

from modules.answer_ball import get_8_ball_answer
from modules.hearthstone import get_card_description
from modules.help import get_help_messages
from modules.motd import get_message, update_message
from modules.twitch import get_streamers, add_streamer, remove_streamer, get_all_live
from modules.task_thread import TaskThread
from modules.weather import get_temperature
from modules.history import get_log_messages, put_log_message, query_log_messages_frequency

class SkypeBot():
    def __init__(self, periodic):
        #self.skypeClient = Skype4Py.Skype()
        #self.skypeClient.OnMessageStatus = self.command_callback
        #self.skypeClient.Attach()
        #self.user_handle = self.skypeClient.User().Handle
        
        self.power = True
        self.live_streamers = []

        self.commands = {
            '8ball': self.handle_8_ball,
            'addstreamer': self.handle_add_streamer,
            'code': self.handle_code,
            'csgo': self.handle_csgo,
            'help': self.handle_help,
            #'history': self.handle_history,
            #'frequency': self.handle_frequency,
            'hscard': self.handle_hscard,
            'kawkaw': self.handle_kawkaw,
            'live': self.handle_live,
            'message': self.handle_message,
            'power': self.handle_power,
            'premade': self.handle_premade,
            'removestreamer': self.handle_remove_streamer,
            'streamers': self.handle_streamers,
            'time': self.handle_time,
            'trigger': self.handle_trigger,
            'watchtogether': self.handle_watch_together,
            'weather': self.handle_weather,
            'wubwub': self.handle_wubwub
        }
        """
        if periodic:
            task = TaskThread(self.check_streamers_continuously)
            # Run every minute
            task.set_interval(60)
            task.run()
        """

    def handle_8_ball(self, chat, content):
        return self.send_message(chat, " >> " + get_8_ball_answer() + ".")

    def handle_add_streamer(self, chat, content):
        tokenized = content.split()
        if tokenized:
            resp, resp_message, display_name = add_streamer(tokenized[0])
            if resp:
                return self.send_message(chat, " >> " + display_name + " added to list.")
            else:
                return self.send_message(chat, " >> " + resp_message)
        else:
            return self.send_message(chat, " >> Invalid format.  %addstreamer [streamer_channel]")

    def handle_code(self, chat, content):
        return self.send_message(chat, " >> It's time to CODE.")

    def handle_csgo(self, chat, content):
        messages = []
        for i in range(4):
            messages.append("GOGOGOGOGOGGO")
        return self.send_message(chat, messages)

    def handle_frequency(self, chat, content):
        result, response, last_key = query_log_messages_frequency(chat.Name, content)
        start = datetime.fromtimestamp(last_key['date']) if last_key else "the beginning"
        returned_results = response[-5:] if len(response) > 4 else response
        if result:
            return self.send_message(chat, " >> [History] Query returned {} messages from {}, Showing {}".format(len(response), start, len(returned_results) ))
            messages = []
            for message in returned_results:
                date = datetime.fromtimestamp(message['date'])
                messages.append(" >>> [{}] {}: {}".format(date, message['handler'], message['message'].encode('utf-8')))
            return self.send_message(chat, messages)
        else:
            return self.send_message(chat, " >>> [History] Error...")

    def handle_help(self, chat, content):
        return self.send_message(chat, get_help_messages())

    def handle_history(self, chat, content):
        result, response = get_log_messages(chat.Name, content)
        if result:
            return self.send_message(chat, " >> [History] Retreived {} messages".format(len(response)))
            for message in response:
                date = datetime.fromtimestamp(message['date'])
                return self.send_message(chat, " >>> [{}] {}: {}".format(date, message['handler'], message['message'].encode('utf-8')))
        else:
            return self.send_message(chat, " >>> [History] Error...")

    def handle_hscard(self, chat, content):
        description = get_card_description(content)
        if description:
            return self.send_message(chat, " >> [HSCard] " + description)
        else:
            return self.send_message(chat, " >> [HSCard] Cannot be found!  Please try again!")

    def handle_kawkaw(self, chat, content):
        messages = []
        for i in range(4):
            messages.append("KAW AWH KAW AWH KAW AWH")
        return self.send_message(chat, messages)

    def handle_live(self, chat, content):
        all_live = get_all_live()
        if not all_live:
            return self.send_message(chat, "No streamers are up! D:")
        else:
            messages = []
            for streamer in all_live:
                messages.append("{}'s stream is up!  http://www.twitch.tv/{}"
                                .format(streamer['display_name'], streamer['name']))
            return self.send_message(chat, messages)

    def handle_message(self, chat, content):
        if content:
            new_message = content.encode('utf_8')
            if new_message:
                return self.send_message(chat, " >> Today's message is: {}".format(update_message(new_message)))
        else:
            return self.send_message(chat, " >> Today's message is: " + get_message())

    def handle_power(self, chat, content):
        if content.lower() == 'start':
            self.power = True
            return self.send_message(chat, " >> Hello World! I am back online!")
        elif content.lower() == 'stop':
            self.power = False
            return self.send_message(chat, " >> Goodbye. Zzz")

    def handle_premade(self, chat, content):
        return self.send_message(chat, " >> Kaw Kaw KAW, calling all early birds")

    def handle_remove_streamer(self, chat, content):
        tokenized = content.split()
        if tokenized:
            resp = remove_streamer(tokenized[0])
            if resp:
                return self.send_message(chat, " >> " + tokenized[0] + " removed from the list.")
            else:
                return self.send_message(chat, " >> " + tokenized[0] + " was not on the list.")
        else:
            return self.send_message(chat, " >> invalid format.  %removestreamer [streamer_channel]")

    def handle_streamers(self, chat, content):
        if not content:
            return self.send_message(chat, " >> " + ", ".join(item['display_name']
                                                       for item in sorted(get_streamers(),
                                                                          key=lambda x: x['name'])))

    def handle_time(self, chat, content):
        return self.send_message(chat, " >> " + datetime.now().strftime("%Y-%m-%d %H:%M %Z"))

    def handle_trigger(self, chat, content):
        return self.send_message(chat, " >> [Trigger] " + content)

    def handle_watch_together(self, chat, content):
        return self.send_message(chat, " >> https://instasync.com/r/Windask")

    def handle_weather(self, chat, content):
        location = content.split(",")
        if len(location) == 2:
            return self.send_message(chat, get_temperature(location[0].strip(), location[1].strip()))
        else:
            return self.send_message(chat, " >> Invalid format.  %weather [city],[country]")

    def handle_wubwub(self, chat, content):
        messages = []
        for i in range(4):
            messages.append("WUBWUBWUBWUB")
        return self.send_message(chat, messages)

    def send_message(self, chat, msg):
        if type(msg) is list:
            return msg
        else: 
            return [msg];
        #if not args.test:
        #    chat.SendMessage(msg)
        #else:
    """
    def check_streamers_continuously(self):
        if self.power:
            all_live = get_all_live()
            new_streamers = [stream for stream in all_live if stream not in self.live_streamers]
            for streamer in sorted(new_streamers, key=lambda x: x['name']):
                for chat in set(self.skypeClient.BookmarkedChats):
                    return self.send_message(chat, "{}'s stream is now online! - http://www.twitch.tv/{}"
                                            .format(streamer['display_name'], streamer['name']))
            self.live_streamers = list(all_live)
    """
    
    def start(self):
        while True:
            time.sleep(0.2)

    def log_message(self, Message):
        # TODO: Logging
        if Message.Sender.Handle != self.user_handle:
            put_log_message(Message)

    def handle_command(self, chat, command, message):
        print(chat)
        print(command)
        print(message)
        command_handler = self.commands.get(command)
        if not command_handler:
            return self.send_message(chat, " >> Invalid command. type in %help for assistance.")
        else:
            return command_handler(chat, message.strip())

    def command_callback(self, message):
        tokenized = message.split()
        if tokenized[0].startswith("%"):
            command = message.split()[0][1:].lower()
            return self.handle_command(None, command, message[len(tokenized[0]):])

parser = argparse.ArgumentParser()
parser.add_argument('-r', dest='periodic', action='store_true')
parser.add_argument('-t', dest='test', action='store_true')
args = parser.parse_args()

if args.test:
    print("Testing mode!")

# Create an instance of the Skype class.
#SkypeBot(periodic=args.periodic)

s = zerorpc.Server(SkypeBot(periodic=args.periodic))
s.bind("tcp://0.0.0.0:4242")
s.run()
        
