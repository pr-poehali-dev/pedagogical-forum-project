import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для получения статей по ассоциативной методике
    Args: event с httpMethod (GET/OPTIONS), queryStringParameters для фильтрации
    Returns: HTTP response со списком статей
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
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
            params = event.get('queryStringParameters') or {}
            category = params.get('category')
            
            if category and category != 'all':
                cursor.execute('''
                    SELECT id, title, excerpt, author, category,
                           TO_CHAR(created_at, 'DD Month YYYY') as date
                    FROM articles 
                    WHERE category = %s
                    ORDER BY created_at DESC
                ''', (category,))
            else:
                cursor.execute('''
                    SELECT id, title, excerpt, author, category,
                           TO_CHAR(created_at, 'DD Month YYYY') as date
                    FROM articles 
                    ORDER BY created_at DESC
                ''')
            
            rows = cursor.fetchall()
            articles = [
                {
                    'id': row[0],
                    'title': row[1],
                    'excerpt': row[2],
                    'author': row[3],
                    'category': row[4],
                    'date': row[5]
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
                'body': json.dumps({'articles': articles}, ensure_ascii=False),
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
