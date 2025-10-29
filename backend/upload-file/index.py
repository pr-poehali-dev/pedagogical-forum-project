import json
import os
import base64
import mimetypes
from typing import Dict, Any
import PyPDF2
import docx
import io

def extract_text_from_pdf(file_content: bytes) -> str:
    """Extract text from PDF file"""
    pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
    text = ""
    for page in pdf_reader.pages:
        text += page.extract_text() + "\n"
    return text

def extract_text_from_docx(file_content: bytes) -> str:
    """Extract text from DOCX file"""
    doc = docx.Document(io.BytesIO(file_content))
    text = ""
    for paragraph in doc.paragraphs:
        text += paragraph.text + "\n"
    return text

def extract_text_from_txt(file_content: bytes) -> str:
    """Extract text from TXT/RTF file"""
    try:
        return file_content.decode('utf-8')
    except:
        return file_content.decode('cp1251')

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для загрузки и обработки файлов статей
    Args: event с httpMethod, body с base64 файлом, fileName и fileType
    Returns: HTTP response с извлечённым текстом
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
        file_type = body_data.get('fileType', '')
        
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
        
        file_content = base64.b64decode(file_base64)
        
        extracted_text = ""
        file_ext = file_name.lower().split('.')[-1]
        
        if file_ext == 'pdf':
            extracted_text = extract_text_from_pdf(file_content)
        elif file_ext in ['docx', 'doc']:
            extracted_text = extract_text_from_docx(file_content)
        elif file_ext in ['txt', 'rtf', 'odt']:
            extracted_text = extract_text_from_txt(file_content)
        else:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': f'Неподдерживаемый формат: {file_ext}'}, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'text': extracted_text,
                'fileName': file_name,
                'fileType': file_ext
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
            'body': json.dumps({'error': f'Ошибка обработки файла: {str(e)}'}, ensure_ascii=False),
            'isBase64Encoded': False
        }
