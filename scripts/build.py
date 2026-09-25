#!/usr/bin/env python3
"""Χτίζει τα δύο παραδοτέα από τα αρχεία του src/.

dist/nutriflow-artifact.html  – για δημοσίευση ως Claude Artifact (βάση δεδομένων μέσω window.claude)
dist/index.html               – αυτόνομο demo: ανοίγει σε οποιονδήποτε browser / GitHub Pages
"""
import json, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
src, dist = root / 'src', root / 'dist'
dist.mkdir(exist_ok=True)

shell = (src / 'shell.html').read_text(encoding='utf-8')
foods = (src / 'foods.json').read_text(encoding='utf-8').strip()
js = ''.join((src / f).read_text(encoding='utf-8') for f in ('core.js', 'views.js', 'app.js'))
app = shell + '<script>\n(function(){\n"use strict";\nconst FOODS = ' + foods + ';\n' + js + '\n})();\n</script>\n'

# Artifact: το skeleton (doctype/head/body) το προσθέτει ο Claude κατά τη δημοσίευση
(dist / 'nutriflow-artifact.html').write_text(app, encoding='utf-8')

# Standalone demo με ενσωματωμένα δεδομένα επίδειξης (οι αλλαγές δεν αποθηκεύονται)
data = json.loads((root / 'data' / 'demo' / 'demo-data.json').read_text(encoding='utf-8'))
runtime = (src / 'demo-runtime.js').read_text(encoding='utf-8').replace('__DEMO_DATA__', json.dumps(data, ensure_ascii=False))
page = ('<!doctype html><html lang="el"><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
        '<style>[hidden]{display:none!important}body{margin:0}</style>'
        '<script>' + runtime + '</script></head><body>' + app + '</body></html>')
(dist / 'index.html').write_text(page, encoding='utf-8')
print('dist/nutriflow-artifact.html', len(app) // 1024, 'KB')
print('dist/index.html', len(page) // 1024, 'KB')
