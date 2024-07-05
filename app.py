#!/usr/bin/env python

import argparse
import glob
import json
import os
import datetime

from flask import Flask, request, jsonify, render_template

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG = {
    'todo_dir': os.path.join(BASE_DIR, 'todo'),
}

app = Flask(__name__)

def cleanBody(body):
    """
    Only allow alphanumeric characters, spaces, and newlines
    """
    return ''.join([c for c in body if c.isalnum() or c.isspace() or c == '\n'])

def cleanFilePath(path):
    """
    Only allow alphanumeric characters, periods, and underscores
    """
    path.replace(' ', '-')
    date = datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%d')
    path = ''.join([c for c in path if c.isalnum() or c == '.' or c == '_']).lower()
    return f'{date}-{path}'

@app.route('/new', methods=['POST'])
def new_todo(request=request):
    print(request.json)
    todo_path = CONFIG['todo_dir']
    todo = cleanFilePath(request.json['todo'].strip())
    body = cleanBody(request.json['body'].strip())
    with open(f'{todo_path}/{todo}', 'w') as f:
        f.write(cleanBody(body))
    return jsonify({'status': 'ok'})

@app.route('/api', methods=['GET'])
def api_get():
    print('api')
    todo_path = CONFIG['todo_dir']
    todos = []
    for file in glob.glob(f'{todo_path}/*'):
        done = False
        if file.endswith('.done'):
            done = True
        with open(file) as f:
            todos.append({
                'id': os.path.basename(file),
                'content': f.read().strip(),
                'done': done,
            })

    return jsonify(todos)

@app.route('/api', methods=['POST'])
def api_post(request=request):
    todo_path = CONFIG['todo_dir']
    todo = request.json
    file = f'{todo_path}/{todo["id"]}'
    if not os.path.exists(file):
        return header, jsonify({'status': 'error', 'message': 'todo not found'})
    if not todo['id'].endswith('.done') and todo['done']:
        os.rename(f'{todo_path}/{todo["id"]}', f'{todo_path}/{todo["id"]}.done')

    if todo['id'].endswith('.done') and todo['done'] == False:
        os.rename(f'{todo_path}/{todo["id"]}', f'{todo_path}/{todo["id"][:-5]}')

    return jsonify({'status': 'ok'})

@app.route('/')
def index():
    print('index')
    return render_template('index.html')

if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('-p', '--port', type=int, default=5000)
    ap.add_argument('-d', '--debug', action='store_true')
    ap.add_argument('-c', '--config')
    args = ap.parse_args()
    if args.config:
        config = json.load(open(args.config))
        CONFIG.update(config)
    if not os.path.exists(CONFIG['todo_dir']):
        os.makedirs(CONFIG['todo_dir'])
    app.run(debug=args.debug, port=args.port)
