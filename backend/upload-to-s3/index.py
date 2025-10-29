import json
import os
import base64
import boto3
from typing import Dict, Any
import uuid

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для загрузки файлов в S3 хранилище
    Args: event с httpMethod, body с base64 файлом, fileName
    Returns: HTTP response с URL загруженного файла
    '''
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Метод не поддерживается'}, ensure_ascii=False),
            'isBase64Encoded': False
        }
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        file_base64 = body_data.get('file', '')
        file_name = body_data.get('fileName', '')
        
        if not file_base64 or not file_name:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Файл и имя файла обязательны'}, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        aws_access_key = os.environ.get('AWS_ACCESS_KEY_ID')
        aws_secret_key = os.environ.get('AWS_SECRET_ACCESS_KEY')
        bucket_name = os.environ.get('S3_BUCKET_NAME', 'pedagogical-forum-files')
        region = os.environ.get('AWS_REGION', 'ru-central1')
        
        file_content = base64.b64decode(file_base64)
        
        unique_id = str(uuid.uuid4())[:8]
        file_ext = file_name.split('.')[-1]
        s3_key = f'articles/{unique_id}_{file_name}'
        
        s3_client = boto3.client(
            's3',
            endpoint_url='https://storage.yandexcloud.net',
            aws_access_key_id=aws_access_key,
            aws_secret_access_key=aws_secret_key,
            region_name=region
        )
        
        s3_client.put_object(
            Bucket=bucket_name,
            Key=s3_key,
            Body=file_content,
            ContentType=get_content_type(file_ext)
        )
        
        file_url = f'https://storage.yandexcloud.net/{bucket_name}/{s3_key}'
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'url': file_url,
                'fileName': file_name,
                'key': s3_key
            }, ensure_ascii=False),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': f'Ошибка загрузки файла: {str(e)}'}, ensure_ascii=False),
            'isBase64Encoded': False
        }

def get_content_type(file_ext: str) -> str:
    """Определяет Content-Type по расширению файла"""
    content_types = {
        'pdf': 'application/pdf',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'txt': 'text/plain',
        'rtf': 'application/rtf',
        'odt': 'application/vnd.oasis.opendocument.text'
    }
    return content_types.get(file_ext.lower(), 'application/octet-stream')
