import base64
import csv
import io
import ipaddress
import json
import os
import socket
import urllib.parse
import urllib.request

import psycopg2


def _is_safe_public_url(url: str) -> bool:
    '''Проверяет, что URL ведёт на публичный http(s)-адрес (защита от SSRF).'''
    try:
        parsed = urllib.parse.urlparse(url)
    except ValueError:
        return False
    if parsed.scheme not in ('http', 'https') or not parsed.hostname:
        return False
    try:
        infos = socket.getaddrinfo(parsed.hostname, None)
    except socket.gaierror:
        return False
    for info in infos:
        ip = ipaddress.ip_address(info[4][0])
        if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved or ip.is_multicast:
            return False
    return True


def handler(event: dict, context) -> dict:
    '''
    Business: API для сайта-визитки — приём заявок из формы обратной связи и работа с отзывами.
    Args: event с httpMethod, body (JSON), queryStringParameters; context с request_id.
    Returns: HTTP-ответ с JSON-данными.
    '''
    method: str = event.get('httpMethod', 'GET')

    cors = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
    }

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors, 'body': ''}

    params = event.get('queryStringParameters') or {}
    action = params.get('action', '')

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    conn.autocommit = True
    cur = conn.cursor()

    try:
        # Отправка заявки из формы обратной связи
        if method == 'POST' and action == 'contact':
            data = json.loads(event.get('body') or '{}')
            cur.execute(
                "INSERT INTO contacts (name, email, phone, message) VALUES (%s, %s, %s, %s)",
                (data.get('name', ''), data.get('email', ''), data.get('phone', ''), data.get('message', '')),
            )
            return {
                'statusCode': 200,
                'headers': {**cors, 'Content-Type': 'application/json'},
                'body': json.dumps({'status': 'ok', 'message': 'Спасибо за обращение!'}, ensure_ascii=False),
                'isBase64Encoded': False,
            }

        # Добавление нового отзыва
        if method == 'POST' and action == 'reviews':
            data = json.loads(event.get('body') or '{}')
            cur.execute(
                "INSERT INTO reviews (name, text) VALUES (%s, %s)",
                (data.get('name', ''), data.get('text', '')),
            )
            return {
                'statusCode': 200,
                'headers': {**cors, 'Content-Type': 'application/json'},
                'body': json.dumps({'status': 'ok'}, ensure_ascii=False),
                'isBase64Encoded': False,
            }

        # Получение списка отзывов
        if method == 'GET' and action == 'reviews':
            cur.execute("SELECT id, name, text, to_char(created_at, 'YYYY-MM-DD') FROM reviews ORDER BY id DESC")
            rows = cur.fetchall()
            reviews = [{'id': r[0], 'name': r[1], 'text': r[2], 'date': r[3]} for r in rows]
            return {
                'statusCode': 200,
                'headers': {**cors, 'Content-Type': 'application/json'},
                'body': json.dumps(reviews, ensure_ascii=False),
                'isBase64Encoded': False,
            }

        # Прокси изображения по ссылке (с защитой от SSRF)
        if method == 'GET' and action == 'image-proxy':
            target = params.get('url', '')
            if not _is_safe_public_url(target):
                return {
                    'statusCode': 400,
                    'headers': {**cors, 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'Недопустимый URL'}, ensure_ascii=False),
                    'isBase64Encoded': False,
                }
            req = urllib.request.Request(target, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=10) as resp:
                image_bytes = resp.read(5 * 1024 * 1024)
            return {
                'statusCode': 200,
                'headers': {**cors, 'Content-Type': 'image/png'},
                'body': base64.b64encode(image_bytes).decode('utf-8'),
                'isBase64Encoded': True,
            }

        # Экспорт всех заявок в CSV (разделитель — точка с запятой)
        if method == 'GET' and action == 'export':
            cur.execute("SELECT name, email, phone, message FROM contacts ORDER BY id")
            rows = cur.fetchall()
            output = io.StringIO()
            writer = csv.writer(output, delimiter=';')
            writer.writerow(['name', 'email', 'phone', 'message'])
            writer.writerows(rows)
            return {
                'statusCode': 200,
                'headers': {
                    **cors,
                    'Content-Type': 'text/csv; charset=utf-8',
                    'Content-Disposition': 'attachment; filename="contacts.csv"',
                },
                'body': output.getvalue(),
                'isBase64Encoded': False,
            }

        return {
            'statusCode': 400,
            'headers': {**cors, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Unknown action'}, ensure_ascii=False),
            'isBase64Encoded': False,
        }
    finally:
        cur.close()
        conn.close()