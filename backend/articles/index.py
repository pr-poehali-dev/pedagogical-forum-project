import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для работы со статьями по ассоциативной методике
    Args: event с httpMethod (GET/POST/OPTIONS), body для POST, queryStringParameters для фильтрации
    Returns: HTTP response со списком статей или новой статьёй
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
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
            
            article_id = params.get('id')
            
            if article_id:
                cursor.execute('''
                    SELECT id, title, excerpt, content, author, category,
                           TO_CHAR(created_at, 'DD Month YYYY') as date,
                           file_url, file_name, file_type
                    FROM articles 
                    WHERE id = %s
                ''', (article_id,))
                row = cursor.fetchone()
                if row:
                    article = {
                        'id': row[0],
                        'title': row[1],
                        'excerpt': row[2],
                        'content': row[3],
                        'author': row[4],
                        'category': row[5],
                        'date': row[6],
                        'file_url': row[7],
                        'file_name': row[8],
                        'file_type': row[9]
                    }
                    cursor.close()
                    conn.close()
                    return {
                        'statusCode': 200,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({'article': article}, ensure_ascii=False),
                        'isBase64Encoded': False
                    }
            
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
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            title = body_data.get('title', '')
            excerpt = body_data.get('excerpt', '')
            content = body_data.get('content', '')
            author = body_data.get('author', 'Аноним')
            category = body_data.get('category', 'Общее')
            file_url = body_data.get('file_url')
            file_name = body_data.get('file_name')
            file_type = body_data.get('file_type')
            
            if not title:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Название статьи обязательно'}, ensure_ascii=False),
                    'isBase64Encoded': False
                }
            
            cursor.execute('''
                INSERT INTO articles (title, excerpt, content, author, category, file_url, file_name, file_type) 
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s) 
                RETURNING id, title, excerpt, author, category, TO_CHAR(created_at, 'DD Month YYYY') as date
            ''', (title, excerpt, content, author, category, file_url, file_name, file_type))
            
            conn.commit()
            row = cursor.fetchone()
            
            new_article = {
                'id': row[0],
                'title': row[1],
                'excerpt': row[2],
                'author': row[3],
                'category': row[4],
                'date': row[5]
            }
            
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'article': new_article}, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            params = event.get('queryStringParameters') or {}
            article_id = params.get('id')
            
            if not article_id:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'ID статьи обязателен'}, ensure_ascii=False),
                    'isBase64Encoded': False
                }
            
            cursor.execute('DELETE FROM articles WHERE id = %s RETURNING id', (article_id,))
            deleted = cursor.fetchone()
            conn.commit()
            cursor.close()
            conn.close()
            
            if deleted:
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'success': True, 'id': deleted[0]}, ensure_ascii=False),
                    'isBase64Encoded': False
                }
            else:
                return {
                    'statusCode': 404,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Статья не найдена'}, ensure_ascii=False),
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