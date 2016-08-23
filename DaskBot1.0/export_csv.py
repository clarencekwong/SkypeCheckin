import argparse
import boto3
import datetime
import time
from boto3.dynamodb.conditions import Key

parser = argparse.ArgumentParser()
parser.add_argument('-c', dest='chat')
args = parser.parse_args()

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('log_messages')

# TODO: Make this more generic
start_month = 1
end_month = 4
for month in range(start_month, end_month):
    # Local Time GMT-5
    start_time = datetime.datetime(2016, month, 01, 0, 0)
    end_time = datetime.datetime(2016, month+1, 01, 0, 0)
    start_time_epoch = int(time.mktime(start_time.timetuple()))
    end_time_epoch = int(time.mktime(end_time.timetuple()))

    result = sorted(list(table.query(
                            KeyConditionExpression=Key('chat').eq(args.chat) & Key('date').between(start_time_epoch, end_time_epoch),
                            ScanIndexForward=False)['Items']),
                    key=lambda x: x['date'])

    for log in result:
        print("{},{},{},{}".format(log['chat'], datetime.datetime.fromtimestamp(log['date']), log['handler'], log['message'].encode('utf-8').replace(",", '[COMMA]').replace("\n", '').replace('\r', '')))
