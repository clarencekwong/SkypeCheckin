import httplib2, json
import boto3
import threading

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('streamers')

STREAM_ENDPOINT = 'https://api.twitch.tv/kraken/streams/'
USERS_ENDPOINT = 'https://api.twitch.tv/kraken/users/'

def add_streamer(streamer):
    for item in table.scan()['Items']:
        if item['name'] == streamer.lower():
            return False, "Channel already on list.", ""
    try:
        resp, content = httplib2.Http().request(USERS_ENDPOINT + streamer.lower(), "GET")
        content_object = content.decode('utf-8')
        data = json.loads(content_object)
        if "error" not in data:
            if 'bio' in data:
                del data['bio']
            if 'logo' in data:
                del data['logo']
            data['stream'] = STREAM_ENDPOINT + data['name']
            table.put_item(Item=data)
            return True, "Success", data['display_name']
        else:
            return False, "Channel does not exist.", ""
    except:
        return False, "Internal error.", ""


def remove_streamer(streamer):
    for item in table.scan()['Items']:
        if item['name'] == streamer.lower():
            table.delete_item(Key={'_id': item['_id']})
            return True
    return False

def get_streamers():
    return table.scan()['Items']

def get_all_live():
    threads = []
    results = []
    for streamer in get_streamers(): # Create a new thread for each api call
        thread = threading.Thread(target=query_streamer, args=[streamer, results])
        thread.start()
        threads.append(thread)
    for thread in threads:
        thread.join()

    return sorted(results, key=lambda x: x['name'])

def query_streamer(streamer, results):
    try:
        resp, content = httplib2.Http().request(streamer['stream'], "GET")
        content_object = content.decode('utf-8')
        data = json.loads(content_object)
        if data['stream']:
            results.append(streamer)
    except:
        print('There was an error querying Twitch.tv for {} - {}'.format(streamer['display_name'], streamer['stream']))
