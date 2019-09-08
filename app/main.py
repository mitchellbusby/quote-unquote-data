from functools import lru_cache
import math
import json
import random
import numpy
import os

from flask import Flask, render_template, jsonify, request
import sklearn.preprocessing
import pandas

import generate
import som

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
        regions = json.load(regions_file)
    with open(os.path.dirname(os.path.realpath(__file__)) + '/data/suburb_boundaries.json') as bounds_file:
        boundaries = json.load(bounds_file)
    indexed_boundaries = {suburb['properties']['LC_PLY_PID']: suburb for suburb in boundaries['features']}
    return [{
        **region,
        'geometry': indexed_boundaries[region['id']]['geometry']['coordinates'][0],
        'areas': [area for area in generate.sa1s if area['sa2'] in region['sa1']]
        } for region in regions]


@lru_cache()
def get_sa2_regions():
    with open(os.path.dirname(os.path.realpath(__file__)) + '/data/sa2_regions.json') as regions_file:
        return {v['sa2']: v for v in json.load(regions_file)}

@lru_cache()
def get_som_winners():
    with open(os.path.dirname(os.path.realpath(__file__)) + '/data/id_to_winner_som.json') as similarities_file:
        return json.load(similarities_file)

@app.route('/')
def index():
    # Hosts the main part of the application
    return render_template('index.html')

@app.route('/api/region')
def region_get():
    region = generate.sample_suburb()
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
    return math.sqrt(sum((x1 - x2)**2 for x1, x2 in zip(b, a)))

def get_features(models, scaler=None):
    feature_names = [
        'rental_rate',
        'median_rent',
        'income',
        'religious',
        'population',
        'unemployment'
    ]

    rows_and_columns = []
    for region in models:
        features = [region[feature] for feature in feature_names]
        for zone_type in "RCIWP":
            features.append(region['zoning'].get(zone_type, 0))
        features.extend(region['businesses'])
        rows_and_columns.append(numpy.nan_to_num(features))

    if not scaler:
        scaler = sklearn.preprocessing.StandardScaler()
        features = scaler.fit_transform(rows_and_columns)
    else:
        features = scaler.transform(rows_and_columns)
    return features, scaler


def get_similar_regions(model):
    regions = get_regions()
    features, scaler = get_features(regions)
    this_features, _ = get_features([model], scaler)
    distances = numpy.sqrt(numpy.sum((this_features - features) ** 2, axis=1))
    distances /= distances.max()
    series = pandas.Series(distances)
    scores = series.rank(method="dense", ascending=1).astype(int).values / len(distances)
    results = []
    for r, d in zip(regions, scores):
        results.append({'region': r['id'], 'score': d})
    return sorted(results, key=lambda x: x['score'])


def shift_tile(tile, dx, dy):
    tile['coordinates']['x'] += dx
    tile['coordinates']['y'] += dy
    return tile

def shift_tiles(tiles, dx, dy):
    return [shift_tile(t, dx, dy) for t in tiles]

def geo_mean(iterable):
    a = numpy.array(iterable)
    return a.prod() ** (1.0 / len(a))

def tiles_from_region(region):
    random_state = numpy.random.RandomState(seed=int(region['id']))

    sa1s = region['areas']

    sa1_tiles = [tiles_from_sa1_region(sa1, random_state=random_state) for sa1 in sa1s]
    # Put a SA1 in the middle of the map.
    the_map = sa1_tiles.pop()
    # Repeatedly add SA1 regions.
    occupied_offsets = {(0, 0)}
    occupied_offset_list = list(occupied_offsets)
    while sa1_tiles:
        tiles = sa1_tiles.pop()
        # Add this grid of 5 x 5 tiles to a neighbour of an occupied offset.
        # Choose an occupied offset...
        while True:
            offset = occupied_offset_list[random_state.randint(len(occupied_offset_list))]
            # Then find a neighbour that isn't occupied.
            neighbours = [(0, 1), (1, 0), (-1, 0), (0, -1)]
            random_state.shuffle(neighbours)
            for dx, dy in neighbours:
                test_offset = (offset[0] + dx, offset[1] + dy)
                if test_offset not in occupied_offsets:
                    # All good!
                    the_map.extend(shift_tiles(tiles, test_offset[0] * 5, test_offset[1] * 5))
                    occupied_offset_list.append(test_offset)
                    occupied_offsets.add(test_offset)
                    break
            else:
                # This offset didn't work!
                occupied_offset_list.remove(offset)
                continue
            # This offset worked!
            break

    # Centre the map.
    tile_xs = [t['coordinates']['x'] for t in the_map]
    tile_ys = [t['coordinates']['y'] for t in the_map]
    mean_xs = numpy.mean(tile_xs)
    mean_ys = numpy.mean(tile_ys)
    the_map = shift_tiles(the_map, -mean_xs, -mean_ys)
    tile_xs = [t['coordinates']['x'] for t in the_map]
    tile_ys = [t['coordinates']['y'] for t in the_map]

    return the_map


def tiles_from_sa1_region(region, random_state=numpy.random):
    grid_size = 5

    # Allocate zones
    zones = []
    region_zoning = {k: v for k, v in region['zoning'].items() if k != 'U'}
    normalisation = sum(region_zoning.values())
    for zone, proportion in region_zoning.items():
        # r, c, u, i, p, w
        cell_value = int(round((proportion / normalisation) * grid_size ** 2))
        zones.extend([zone] * cell_value)
    while len(zones) < grid_size ** 2:
        zones.append('U')
    zones = zones[:grid_size ** 2]  # hax
    random_state.shuffle(zones)
    assert len(zones) == grid_size ** 2
    zones = numpy.reshape(zones, (grid_size, grid_size))

    # Allocate population to residential areas
    pop_grid = random_state.uniform(size=(grid_size, grid_size))
    pop_grid[zones != 'R'] = 0
    pop_grid /= pop_grid.sum() or 1
    pop_grid *= region['population']

    # Allocate businesses to commercial areas.
    # Just allocate employees as population.
    n_employees = numpy.sum(region['businesses'] * numpy.array([1, 3, 10, 100, 200]))
    n_commercial = numpy.sum(zones == 'C')
    business_pops = random_state.uniform(size=(n_commercial,))
    business_pops /= business_pops.sum()
    business_pops *= n_employees / n_commercial
    pop_grid[zones == 'C'] = business_pops
    # # If we have five or less, we can make our histogram.
    # if n_commercial == 0:
    #     pass
    # elif n_commercial <= 5:
    #     n_employees = region['businesses'] * numpy.array([1, 3, 6, 9, 12])
    #     n_employees_ = n_employees[:n_commercial]
    #     n_employees_[-1] += n_employees[n_commercial:].sum()
    #     n_employees /= sum(n_employees) / pop_grid.max() / 2
    #     pop_grid[zones == 'C'] = n_employees_
    # elif n_commercial > 5:
    #     normalisation = sum(region['businesses'] * numpy.array([1, 3, 6, 9, 12]))
    #     for proportion in region['businesses'] * numpy.array([1, 3, 6, 9, 12]:
    #         cell_value =


    # Generate tiles in [0, 5] x [0, 5].
    tiles = []
    for y in range(grid_size):
        for x in range(grid_size):
            tile = {**region}
            tile['coordinates'] = {
                "x": x - grid_size,
                "y": y - grid_size,
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
