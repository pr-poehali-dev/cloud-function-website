import json
import os
import psycopg2


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

        return {
            'statusCode': 400,
            'headers': {**cors, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Unknown action'}, ensure_ascii=False),
            'isBase64Encoded': False,
        }
    finally:
        cur.close()
        conn.close()
