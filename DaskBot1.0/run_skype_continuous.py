import boto3
import subprocess
import time

client = boto3.client('sns')

while True:
    print('Starting skype.py -r')
    subprocess.call('python skype.py -r', shell=True)
    print(client.publish(
        TopicArn='arn:aws:sns:us-east-1:127113944482:dynamodb',
        Message='SkypeCheckin Crashed!',
        Subject='SkypeCheckin Crashed!',
        MessageStructure='string',
    ))
    print('SkypeCheckin Crashed! Restarting')
    time.sleep(1)
