from functools import lru_cache
import math
import json
import random
import numpy
import os

from flask import Flask, render_template, jsonify, request
import sklearn.preprocessing

app = Flask(
    __name__,
    static_url_path='',
    static_folder='static/dist',
    template_folder='templates',
)

app.config['TEMPLATES_AUTO_RELOAD'] = True

@lru_cache()
def get_regions():
    with open(os.path.dirname(os.path.realpath(__file__)) + '/data/suburb_regions.json') as regions_file:
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

@app.route('/api/regions')
def regions_get():
    return jsonify({region['id']: region for region in get_regions()})

@app.route('/api/tiles', methods=["POST"])
def tiles_get():
    return jsonify(tiles_from_region(request.json))

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

    pop_sum = sum(region['population'] for region in regions)
    income_sum = sum(region['income'] for region in regions)
    normalised = [dict(
        region=region,
        pop=region['population'] / pop_sum,
        income=region['income'] / income_sum)
        for region in regions
    ]
    vec = model['population'] / pop_sum, model['income'] / income_sum
    normalised = [{'region': x['region']['id'], 'score': distance(vec, (x['pop'], x['income']))} for x in normalised]
    return sorted(normalised, key=lambda x: x['score'])


def tiles_from_region(region):
    grid_size = 10

    # Allocate zones

    zones = []
    region_zoning = {k:v for k, v in region['zoning'].items() if k != 'U'}
    normalisation = sum(region_zoning.values())
    for zone, proportion in region_zoning.items():
        # r, c, u, i, p, w
        cell_value = round((proportion / normalisation) * grid_size ** 2)
        zones.extend([zone] * cell_value)

    while len(zones) < grid_size ** 2:
        zones.append('U')
    print('Generated zones:', zones)

    zones = zones[:grid_size ** 2]  # hax
    numpy.random.shuffle(zones)

    assert len(zones) == grid_size ** 2

    zones = numpy.reshape(zones, (grid_size, grid_size))

    # Allocate population to residential areas

    pop_grid = numpy.random.uniform(size=(grid_size, grid_size))
    pop_grid[zones != 'R'] = 0
    pop_grid /= pop_grid.sum()
    pop_grid *= region['population']

    tiles = []

    for y in range(grid_size):
        for x in range(grid_size):
            tile = {**region}
            tile['coordinates'] = {
                "x": x - grid_size / 2,
                "y": y - grid_size / 2,
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
