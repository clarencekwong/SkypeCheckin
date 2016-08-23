# python skype.py [-r]
# -*- coding: utf-8 -*-

import argparse
import Skype4Py
import time

from datetime import datetime

from modules.answer_ball import get_8_ball_answer
from modules.hearthstone import get_card_description
from modules.help import get_help_messages
from modules.motd import get_message, update_message
from modules.twitch import get_streamers, add_streamer, remove_streamer, get_all_live
from modules.task_thread import TaskThread
from modules.weather import get_temperature

class SkypeBot():
    def __init__(self, periodic):
        self.skypeClient = Skype4Py.Skype()
        self.skypeClient.OnMessageStatus = self.command_callback
        self.skypeClient.Attach()
        self.power = True
        self.live_streamers = []
        self.counter = 0

        self.commands = {
            '8ball': self.handle_8_ball,
            'addstreamer': self.handle_add_streamer,
            'code': self.handle_code,
            'csgo': self.handle_csgo,
            'help': self.handle_help,
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
            'weather': self.handle_weather,
            'wubwub': self.handle_wubwub
        }

        if periodic:
            task = TaskThread(self.check_streamers_continuously)
            # Run every minute
            task.set_interval(60)
            task.run()

    def handle_8_ball(self, chat, content):
        self.send_message(chat, " >> " + get_8_ball_answer() + ".")

    def handle_add_streamer(self, chat, content):
        tokenized = content.split()
        if tokenized:
            resp, resp_message, display_name = add_streamer(tokenized[0])
            if resp:
                self.send_message(chat, " >> " + display_name + " added to list.")
            else:
                self.send_message(chat, " >> " + resp_message)
        else:
            self.send_message(chat, " >> Invalid format.  %addstreamer [streamer_channel]")

    def handle_code(self, chat, content):
        self.send_message(chat, " >> It's time to CODE.")

    def handle_csgo(self, chat, content):
        for i in range(4):
            self.send_message(chat, "GOGOGOGOGOGGO")

    def handle_help(self, chat, content):
        for help_message in get_help_messages():
            self.send_message(chat, help_message)

    def handle_hscard(self, chat, content):
        description = get_card_description(content)
        if description:
            self.send_message(chat, " >> [HSCard] " + description)
        else:
            self.send_message(chat, " >> [HSCard] Cannot be found!  Please try again!")

    def handle_kawkaw(self, chat, content):
        for i in range(4):
            self.send_message(chat, "KAW AWH KAW AWH KAW AWH")

    def handle_live(self, chat, content):
        all_live = get_all_live()
        if not all_live:
            self.send_message(chat, "No streamers are up! D:")
        else:
            for streamer in all_live:
                self.send_message(chat, "{}'s stream is up!  http://www.twitch.tv/{}"
                                        .format(streamer['display_name'], streamer['name']))

    def handle_message(self, chat, content):
        if content:
            new_message = content.encode('utf_8')
            if new_message:
                self.send_message(chat, " >> Today's message is: {}".format(update_message(new_message)))
        else:
            self.send_message(chat, " >> Today's message is: " + get_message())

    def handle_power(self, chat, content):
        if content.lower() == 'start':
            self.power = True
            self.send_message(chat, " >> Hello World! I am back online!")
        elif content.lower() == 'stop':
            self.power = False
            self.send_message(chat, " >> Goodbye. Zzz")

    def handle_premade(self, chat, content):
        self.send_message(chat, " >> Kaw Kaw KAW, calling all early birds")

    def handle_remove_streamer(self, chat, content):
        tokenized = content.split()
        if tokenized:
            resp = remove_streamer(tokenized[0])
            if resp:
                self.send_message(chat, " >> " + tokenized[0] + " removed from the list.")
            else:
                self.send_message(chat, " >> " + tokenized[0] + " was not on the list.")
        else:
            self.send_message(chat, " >> invalid format.  %removestreamer [streamer_channel]")

    def handle_streamers(self, chat, content):
        if not content:
            self.send_message(chat, " >> " + ", ".join(item['display_name']
                                                       for item in sorted(get_streamers(),
                                                                          key=lambda x: x['name'])))

    def handle_time(self, chat, content):
        self.send_message(chat, " >> " + datetime.now().strftime("%Y-%m-%d %H:%M %Z"))

    def handle_trigger(self, chat, content):
        self.send_message(chat, " >> [Trigger] " + content)

    def handle_weather(self, chat, content):
        location = content.split(",")
        if len(location) == 2:
            self.send_message(chat, get_temperature(location[0].strip(), location[1].strip()))
        else:
            self.send_message(chat, " >> Invalid format.  %weather [city],[country]")

    def handle_wubwub(self, chat, content):
        for i in range(4):
            self.send_message(chat, "WUBWUBWUBWUB")

    def send_message(self, chat, msg):
        if not args.test:
            chat.SendMessage(msg)
        else:
            print(msg)

    def check_streamers_continuously(self):
        if self.power:
            all_live = get_all_live()
            new_streamers = [stream for stream in all_live if stream not in self.live_streamers]
            for streamer in sorted(new_streamers, key=lambda x: x['name']):
                for chat in set(self.skypeClient.BookmarkedChats):
                    self.send_message(chat, "{}'s stream is now online! - http://www.twitch.tv/{}"
                                            .format(streamer['display_name'], streamer['name']))
            self.live_streamers = list(all_live)

    def start(self):
        while True:
            pass

    def handle_command(self, chat, command, message):
        command_handler = self.commands.get(command)
        if not command_handler:
            self.send_message(chat, " >> Invalid command. type in %help for assistance.")
        else:
            command_handler(chat, message.strip())

    def command_callback(self, Message, Status):
        chat = Message.Chat
        print(Message.Body)
        if (chat in set(self.skypeClient.BookmarkedChats)) and (Status == "RECEIVED"):
            message = Message.Body
            tokenized = message.split()
            print(Message.FromHandle)
            #if Message.FromHandle
            if Message.FromHandle != 'live:biscuitsbot':
                self.send_message(chat, "#bottlecaps - Not a bot")
            """
            if tokenized[0].startswith("#"):
                command = message.split()[0][1:].lower()
                print(command)
                if (command == 'explore' or command == 'bottlecaps'):
                    self.send_message(chat, "#" + command)
                    if (command == 'explore'):
                        self.counter += 1
                        if self.counter % 4 == 0:
                            self.send_message(chat, "#buy stimpack")
                            self.send_message(chat, "#heal")
            """
                            
            """
            if tokenized[0].startswith("%"):
                command = message.split()[0][1:].lower()
                self.handle_command(chat, command, message[len(tokenized[0]):])
            """

parser = argparse.ArgumentParser()
parser.add_argument('-r', dest='periodic', action='store_true')
parser.add_argument('-t', dest='test', action='store_true')
args = parser.parse_args()

if args.test:
    print("Testing mode!")

# Create an instance of the Skype class.
SkypeBot(periodic=args.periodic).start()
