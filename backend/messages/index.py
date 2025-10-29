import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для управления сообщениями чата педагогов
    Args: event с httpMethod (GET/POST/OPTIONS), body для POST запросов
    Returns: HTTP response с сообщениями или статусом операции
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    db_url = os.environ.get('DATABASE_URL')
    
    try:
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()
        
        if method == 'GET':
            cursor.execute('''
                SELECT id, author, text, 
                       TO_CHAR(created_at, 'HH24:MI') as time,
                       created_at
                FROM messages 
                ORDER BY created_at ASC
            ''')
            
            rows = cursor.fetchall()
            messages = [
                {
                    'id': row[0],
                    'author': row[1],
                    'text': row[2],
                    'time': row[3]
                }
                for row in rows
            ]
            
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'messages': messages}, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            author = body_data.get('author', 'Аноним')
            text = body_data.get('text', '')
            
            if not text:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Текст сообщения обязателен'}, ensure_ascii=False),
                    'isBase64Encoded': False
                }
            
            cursor.execute('''
                INSERT INTO messages (author, text) 
                VALUES (%s, %s) 
                RETURNING id, author, text, TO_CHAR(created_at, 'HH24:MI') as time
            ''', (author, text))
            
            conn.commit()
            row = cursor.fetchone()
            
            new_message = {
                'id': row[0],
                'author': row[1],
                'text': row[2],
                'time': row[3]
            }
            
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'message': new_message}, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Метод не поддерживается'}, ensure_ascii=False),
                'isBase64Encoded': False
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)}, ensure_ascii=False),
            'isBase64Encoded': False
        }
