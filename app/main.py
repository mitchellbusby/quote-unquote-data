from functools import lru_cache
import math
import json
import random
import numpy
import os

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
    with open(os.path.dirname(os.path.realpath(__file__)) + '/data/sa2_regions.json') as regions_file:
        return json.load(regions_file)

@app.route('/')
def index():
    # Hosts the main part of the application
    return render_template('index.html')

@app.route('/api/region')
def region_get():
    regions = get_regions()
    region = random.choice(regions)
    tiles = tiles_from_region(region)
    return jsonify({
        'tiles': tiles,
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
    normalised = [{**x, 'score': distance(vec, (x['pop'], x['income']))} for x in normalised]
    return sorted(normalised, key=lambda x: x['score'])


def tiles_from_region(region):
    pop_grid = numpy.random.uniform(size=(4, 4))

    pop_grid /= pop_grid.sum()

    pop_grid *= region['population']

    zones = []

    for zone, proportion in region['zoning'].items():
        # r, c, u, i, p, w
        cell_value = round((proportion / 10000) * 16)
        zones.extend([zone] * cell_value)

    while len(zones) < 16:
        zones.append('U')


    assert len(zones) == 16, str((len(zones), region['zoning'], sum(region['zoning'].values())))

    zones = numpy.reshape(zones, (4, 4))

    tiles = []

    for y in range(4):
        for x in range(4):
            tile = {**region}
            tile['coordinates'] = {
                "x": x,
                "y": y,
            }

            tile['population'] = pop_grid[y, x]
            tile['zone'] = zones[y, x]
            tiles.append(tile)
    return tiles

if __name__ == "__main__":
    app.run(
        '0.0.0.0',
        debug=True,
        port=int(os.environ.get('PORT', 5000))
    )
