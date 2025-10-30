import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для управления методической копилкой материалов
    Args: event с httpMethod (GET/POST/OPTIONS), body для POST запросов
    Returns: HTTP response с материалами или статусом операции
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
            cursor.execute('''
                SELECT id, title, description, author, file_type, downloads
                FROM materials 
                ORDER BY created_at DESC
            ''')
            
            rows = cursor.fetchall()
            materials = [
                {
                    'id': row[0],
                    'title': row[1],
                    'description': row[2],
                    'author': row[3],
                    'type': row[4],
                    'downloads': row[5]
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
                'body': json.dumps({'materials': materials}, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            title = body_data.get('title', '')
            description = body_data.get('description', '')
            author = body_data.get('author', 'Аноним')
            category = body_data.get('category', 'Общее')
            file_type = body_data.get('file_type', 'PDF')
            
            if not title:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Название материала обязательно'}, ensure_ascii=False),
                    'isBase64Encoded': False
                }
            
            cursor.execute('''
                INSERT INTO materials (title, description, author, file_type, category, downloads) 
                VALUES (%s, %s, %s, %s, %s, 0) 
                RETURNING id, title, description, author, file_type, downloads
            ''', (title, description, author, file_type, category))
            
            conn.commit()
            row = cursor.fetchone()
            
            new_material = {
                'id': row[0],
                'title': row[1],
                'description': row[2],
                'author': row[3],
                'type': row[4],
                'downloads': row[5]
            }
            
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'material': new_material}, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            params = event.get('queryStringParameters') or {}
            material_id = params.get('id')
            
            if not material_id:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'ID материала обязателен'}, ensure_ascii=False),
                    'isBase64Encoded': False
                }
            
            cursor.execute('DELETE FROM materials WHERE id = %s RETURNING id', (material_id,))
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
                    'body': json.dumps({'error': 'Материал не найден'}, ensure_ascii=False),
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