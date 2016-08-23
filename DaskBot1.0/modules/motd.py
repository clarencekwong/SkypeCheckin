import boto3
from datetime import datetime

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('skypecheckin')

def get_message():
    return table.get_item(Key={'type':'message'})['Item']['value'].encode('utf-8')

def update_message(message):
    try:
        table.put_item(Item={'type':'message', 'value': message, 'date': datetime.now().strftime("%Y-%m-%d %H:%M %Z")})
        return get_message().decode('utf-8')
    except:
        return 'ERROR, UPDATE FAILED.'
    