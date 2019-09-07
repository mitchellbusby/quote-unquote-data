from functools import lru_cache
import math
import json
import random

from flask import Flask, render_template, jsonify, request

app = Flask(
    __name__,
    static_url_path='',
    static_folder='static/dist',
    template_folder='templates',
)

app.config['TEMPLATES_AUTO_RELOAD'] = True

@lru_cache()
def get_regions():
    with open('data/sa2_regions.json') as regions_file:
        return json.load(regions_file)

@app.route('/')
def index():
    # Hosts the main part of the application
    return render_template('index.html')

@app.route('/api/region')
def region_get():
    with open('data/sa2_regions.json') as regions_file:
        regions = json.load(regions_file)
    region = random.choice(regions)
    return jsonify({
        'tiles': [region],
        'model': region,
    })

@app.route('/api/similar', methods=["POST"])
def similarities_get():
    model = request.json
    similar = get_similar_regions(model)
    return jsonify(similar)

def distance(a, b):
    x1, y1 = a
    x2, y2 = b
    return math.sqrt((x2 - x1)**2 + (y2 - y1)**2)

def get_similar_regions(model):
    regions = get_regions()
    pop_min = min(region['population'] for region in regions)
    pop_max = max(region['population'] for region in regions)
    income_min = min(region['income'] for region in regions)
    income_max = max(region['income'] for region in regions)
    normalised = [dict(
        region=region,
        pop=(region['population'] - pop_min) / (pop_max - pop_min),
        income=(region['income'] - income_min) / (income_max - income_min))
        for region in regions
    ]
    vec = (model['population'] - pop_min) / (pop_max - pop_min), (model['income'] - income_min) / (income_max - income_min)
    return sorted(normalised, key=lambda x: distance(vec, (x['pop'], x['income'])))


if __name__ == "__main__":
<<<<<<< HEAD
    app.run()
=======
    app.run(debug=True)
>>>>>>> d013f0abd5365b6b6bf4101438d28b18f7d7a7a5
