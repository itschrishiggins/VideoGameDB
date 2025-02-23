# Lambda function created using Python. Allows single/batch uploads of JSON data and querying of DynamoDB table.
# When new items are added, it triggers an SNS email notification and also automatically adds game data to an S3 bucket.

# import json
# import boto3
# from botocore.exceptions import ClientError
# from decimal import Decimal

# dynamodb = boto3.resource('dynamodb')
# s3 = boto3.client('s3')
# sns = boto3.client('sns')


# def lambda_handler(event, context):
    # table = dynamodb.Table('GameTable')
    # operation = event['operation']

    # if operation == 'upload_single':
        # return upload_single(table, event['item'])
    # elif operation == 'upload_batch':
        # return upload_batch(table, event['items'])
    # elif operation == 'query':
        # return query(table, event['filter'])
    # elif operation == 'fetch_unique_values':
        # return fetch_unique_values(table, event['field'])
    # else:
        # return {'statusCode': 400, 'body': 'Invalid operation'}


# def upload_single(table, item):
    # if 'Game' not in item or 'Year' not in item:
        # return {'statusCode': 400, 'body': 'Invalid input'}

    # try:
        # table.put_item(Item=item)
        # s3.put_object(Bucket='game-names-bucket', Key=f"{item['Game']}.txt", Body=item['Game'])
        # sns.publish(TopicArn='arn:aws:sns:eu-west-1:317421968948:NewGameAdded',
                    # Message=f"New game added: {item['Game']}")
        # return {'statusCode': 200, 'body': 'Game added'}
    # except ClientError as e:
        # return {'statusCode': 400, 'body': str(e)}


# def upload_batch(table, items):
    # with table.batch_writer() as batch:
        # for item in items:
            # try:
                # batch.put_item(Item=item)
                # s3.put_object(Bucket='game-names-bucket', Key=f"{item['Game']}.txt", Body=item['Game'])
                # sns.publish(TopicArn='arn:aws:sns:eu-west-1:317421968948:NewGameAdded',
                            # Message=f"New game added: {item['Game']}")
            # except ClientError as e:
                # return {'statusCode': 400, 'body': str(e)}
    # return {'statusCode': 200, 'body': 'Batch upload successful'}


# def fetch_unique_values(table, field):
    # if field not in ['Year', 'Genre', 'Platform']:
        # return {'statusCode': 400, 'body': f'Invalid field: {field}'}

    # if field == 'Year':
        # response = table.scan(ProjectionExpression='#yr', ExpressionAttributeNames={'#yr': 'Year'})
    # else:
        # response = table.scan(ProjectionExpression=field)

    # items = response['Items']
    # unique_values = list(set(item[field] for item in items if field in item))

    # if field == 'Year':
        # unique_values = [int(value) for value in unique_values]

    # if field in ['Genre', 'Platform']:
        # unique_values.sort(key=str.lower)
    # else:
        # unique_values.sort()

    # return {'statusCode': 200, 'body': json.dumps(unique_values)}


# def decimal_to_json(obj):
    # if isinstance(obj, Decimal):
        # return int(obj) if obj % 1 == 0 else float(obj)
    # raise TypeError("Object is not JSON serializable")


# def query(table, filter):
    # filter_type = filter['type']
    # filter_value = filter['value']

    # if filter_type not in ['Platform', 'Genre', 'Year']:
        # return {'statusCode': 400, 'body': 'Invalid filter'}

    # response = table.query(
        # IndexName=filter_type,
        # KeyConditionExpression=f"#{filter_type[0]} = :value",
        # ExpressionAttributeValues={':value': filter_value},
        # ExpressionAttributeNames={f"#{filter_type[0]}": filter_type},
        # ScanIndexForward=True  # This parameter sorts the items in ascending order
    # )

    # return {'statusCode': 200, 'body': json.dumps(response['Items'], default=decimal_to_json)}