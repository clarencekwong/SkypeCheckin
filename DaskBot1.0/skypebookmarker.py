import Skype4Py
import argparse

parser = argparse.ArgumentParser()
parser.add_argument('--name', dest='name', default="Ryan Ly")
args = parser.parse_args()

skypeClient = Skype4Py.Skype()
skypeClient.Attach()

for chat in skypeClient.BookmarkedChats:
    chat.Unbookmark()
    print("{} unbookmarked".format(chat))

for chat in skypeClient.Chats:
    for member in chat._GetActiveMembers():
        if member._GetFullName() == args.name:
            chat.Bookmark()
            break

for chat in skypeClient.BookmarkedChats:
    print("{} bookmarked".format(chat))