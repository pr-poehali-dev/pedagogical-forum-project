import json
import os
import base64
import mimetypes
from typing import Dict, Any, List
import PyPDF2
import docx
import io
from docx.oxml.table import CT_Tbl
from docx.oxml.text.paragraph import CT_P
from docx.table import _Cell, Table
from docx.text.paragraph import Paragraph

def extract_content_from_pdf(file_content: bytes) -> Dict[str, Any]:
    """Extract text and images from PDF file"""
    pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
    content = {
        'html': '',
        'images': []
    }
    
    text = ""
    for page in pdf_reader.pages:
        text += page.extract_text() + "\n\n"
    
    # Convert text to HTML paragraphs
    paragraphs = text.split('\n')
    html_parts = []
    for para in paragraphs:
        para = para.strip()
        if para:
            html_parts.append(f'<p>{para}</p>')
    
    content['html'] = '\n'.join(html_parts)
    return content

def extract_content_from_docx(file_content: bytes) -> Dict[str, Any]:
    """Extract text, tables and images from DOCX file"""
    doc = docx.Document(io.BytesIO(file_content))
    content = {
        'html': '',
        'images': []
    }
    
    html_parts = []
    
    # Process document body elements in order
    for element in doc.element.body:
        if isinstance(element, CT_P):
            # Paragraph
            paragraph = Paragraph(element, doc)
            text = paragraph.text.strip()
            if text:
                # Check if it's a heading
                if paragraph.style.name.startswith('Heading'):
                    level = paragraph.style.name.replace('Heading ', '')
                    try:
                        level = int(level)
                        html_parts.append(f'<h{min(level, 6)}>{text}</h{min(level, 6)}>')
                    except:
                        html_parts.append(f'<p><strong>{text}</strong></p>')
                else:
                    html_parts.append(f'<p>{text}</p>')
        
        elif isinstance(element, CT_Tbl):
            # Table
            table = Table(element, doc)
            html_parts.append('<table border="1" style="border-collapse: collapse; width: 100%; margin: 16px 0;">')
            
            for i, row in enumerate(table.rows):
                html_parts.append('<tr>')
                for cell in row.cells:
                    cell_text = cell.text.strip()
                    # First row as header
                    if i == 0:
                        html_parts.append(f'<th style="padding: 8px; background-color: #f0f0f0; border: 1px solid #ddd;">{cell_text}</th>')
                    else:
                        html_parts.append(f'<td style="padding: 8px; border: 1px solid #ddd;">{cell_text}</td>')
                html_parts.append('</tr>')
            
            html_parts.append('</table>')
    
    # Extract images
    for rel in doc.part.rels.values():
        if "image" in rel.target_ref:
            try:
                image_data = rel.target_part.blob
                image_base64 = base64.b64encode(image_data).decode('utf-8')
                content_type = rel.target_part.content_type
                content['images'].append({
                    'data': f'data:{content_type};base64,{image_base64}',
                    'type': content_type
                })
            except:
                pass
    
    content['html'] = '\n'.join(html_parts)
    return content

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
        
        result = {}
        if file_ext == 'pdf':
            result = extract_content_from_pdf(file_content)
        elif file_ext in ['docx', 'doc']:
            result = extract_content_from_docx(file_content)
        elif file_ext in ['txt', 'rtf', 'odt']:
            text = extract_text_from_txt(file_content)
            paragraphs = text.split('\n')
            html_parts = [f'<p>{p.strip()}</p>' for p in paragraphs if p.strip()]
            result = {
                'html': '\n'.join(html_parts),
                'images': []
            }
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
                'html': result.get('html', ''),
                'images': result.get('images', []),
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