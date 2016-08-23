SkypeCheckin
==============

Install guide:
--------------

1. Get 32-bit Python 2.X (Since Skype is a 32-bit application.) 
2. Get pip and run `pip install -r "requirements.txt"`
3. Run Skype
4. Set up aws-cli, `https://aws.amazon.com/cli/`
5. `aws configure` and enter secret id/secret keys provided (If you want access to the DynamoDB I'm currently using, contact `ryan@ryanly.ca`)
6. If you do not have any DynamoDB SkypeCheckin tables, run `python create_tables.py`
7. Run `python skypebookmarker --name {name}` to set bookmarked chats that contain that name. ({name} should be a full name. Eg `John Doe`).  It can be set to your own name if you want it to be activated in everychat
8. Run `python skype.py` (`-r` flag is option. `-r` stands for continuous task) or run `python run_skype_continuous.py` for it to restart on crashes. (Also sends an SNS publish to the ARN endpoint specified) 
9. Have fun!

Todo:
------------
- Hide my api keys for mashape (I do not care enough at the moment)
- Add stateful features (activity/game)

Commands
--------------

{hearthstonecardname} - Gets information about the Hearthstone Card. Eg. {fireball}.

%8ball [question] - Need an answer? Consult 8Ball.

%addstreamer [streamer's channel] - Adds a streamer to the list of watched streamers.

%live - Gets the livestreamers.

%message [optional message]- Shows/Modifies the message of the day.

%removestreamer [streamer's channel] - Removes a streamer to the list of watched streamers.

%startbot - Turns the bot back on if it was off.

%stopbot Turns off bot until %startbot is called again",

%streamers - Gives a list of streamers currently being polled.

%time - Gets the current time(To be formatted)

%trigger [message] - Outputs [Trigger] {message}.

%weather [city],[country] - Gets the weather for a city in a country.

