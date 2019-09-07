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
app.config['TEMPLATES_AUTO_RELOAD'] = True

@lru_cache()
def get_sa2_regions():
    with open(os.path.dirname(os.path.realpath(__file__)) + '/data/sa2_regions.json') as regions_file:
        return {v['sa2']: v for v in json.load(regions_file)}

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
    return math.sqrt(sum((x1 - x2)**2 for x1, x2 in zip(b, a)))

def get_similar_regions(model):
    regions = get_regions()
    ## Sum (get the sums of the different metrics)
    ## TODO: religious, rental_rate, unemployment, median rent
    metrics = [
        'population',
        'income',
        # We commented out unemployment because it doesn't normalise well yet...oops
        # 'unemployment',
        'median_rent'
    ]
    # k: metric name, v: sum

    sums = {metric: sum(region[metric] for region in regions) or 1 for metric in metrics}


    ## Weight the things + create vectors (region.metric / sum)
    normalised = [dict(
        region=region,
        vector=[
            region[metric] / sums[metric] for metric in metrics
        ])
        for region in regions
    ]

    ## Create a vector for the current region (model/sum)
    base_vector = [model[metric] / sums[metric] for metric in metrics]
    # vec = model['population'] / sums['population'], model['income'] / sums['income']

    ## Then add then to a list and pairwise (with the model) apply the distance fn
    normalised = [{'region': x['region']['id'], 'score': distance(base_vector, x['vector'])} for x in normalised]
    score_max = max(x['score'] for x in normalised)
    normalised = [{**x, 'score': x['score']/score_max} for x in normalised]

    ## Then sort the list by them
    return sorted(normalised, key=lambda x: x['score'])


def shift_tile(tile, dx, dy):
    tile['coordinates']['x'] += dx
    tile['coordinates']['y'] += dy
    return tile

def shift_tiles(tiles, dx, dy):
    return [shift_tile(t, dx, dy) for t in tiles]

def tiles_from_region(region):
    random_state = numpy.random.RandomState(seed=int(region['id']))
    sa1_regions = get_sa2_regions()
    sa1s = [sa1_regions[sa1] for sa1 in region['sa1']]
    sa1_tiles = [tiles_from_sa1_region(sa1, random_state=random_state) for sa1 in sa1s]
    # Put a SA1 in the middle of the map.
    the_map = sa1_tiles.pop()
    # Repeatedly add SA1 regions.
    full_offsets = {}
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

    return the_map


def tiles_from_sa1_region(region, random_state=numpy.random):
    grid_size = 5

    # Allocate zones
    zones = []
    region_zoning = {k: v for k, v in region['zoning'].items() if k != 'U'}
    normalisation = sum(region_zoning.values())
    for zone, proportion in region_zoning.items():
        # r, c, u, i, p, w
        cell_value = round((proportion / normalisation) * grid_size ** 2)
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
