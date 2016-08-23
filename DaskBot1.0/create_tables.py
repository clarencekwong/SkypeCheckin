import boto3

dynamodb = boto3.resource('dynamodb')

table = dynamodb.create_table(
    TableName='skypecheckin',
    KeySchema=[
        {
            'AttributeName': 'type',
            'KeyType': 'HASH'  #Partition key
        }
    ],
    AttributeDefinitions=[
        {
            'AttributeName': 'type',
            'AttributeType': 'S'
        }
    ],
    ProvisionedThroughput={
        'ReadCapacityUnits': 1,
        'WriteCapacityUnits': 1
    }
)

print("Table status:", table.table_status)

table = dynamodb.create_table(
    TableName='streamers',
    KeySchema=[
        {
            'AttributeName': '_id',
            'KeyType': 'HASH'  #Partition key
        }
    ],
    AttributeDefinitions=[
        {
            'AttributeName': '_id',
            'AttributeType': 'N'
        }
    ],
    ProvisionedThroughput={
        'ReadCapacityUnits': 5,
        'WriteCapacityUnits': 5
    }
)

print("Table status:", table.table_status)

table = dynamodb.create_table(
    TableName='log_messages',
    KeySchema=[
        {
            'AttributeName': 'chat',
            'KeyType': 'HASH'  #Partition key
        },
        {
            'AttributeName': 'date',
            'KeyType': 'RANGE'  #Sort key
        }
    ],
    AttributeDefinitions=[
        {
            'AttributeName': 'chat',
            'AttributeType': 'S'  #String
        },
        {
            'AttributeName': 'date',
            'AttributeType': 'N' #Number
        }
    ],
    ProvisionedThroughput={
        'ReadCapacityUnits': 5,
        'WriteCapacityUnits': 5
    }
)

print("Table status:", table.table_status)
