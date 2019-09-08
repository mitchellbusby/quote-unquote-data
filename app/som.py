import os

import numpy
import minisom

normalisation = numpy.array([1.75737120e+02, 3.04404448e+05, 1.23669645e+06, 4.79486957e+02,
                 2.29390100e+06, 1.61616659e+01, 3.35020527e+06, 2.59328397e+05,
                 4.79121435e+04, 7.28746693e+04, 1.54229751e+06])


weights = numpy.loadtxt(os.path.dirname(os.path.realpath(__file__)) + '/data/som_weights.txt').reshape((25, 25, len(normalisation)))
som = minisom.MiniSom(25, 25, len(normalisation))
som._weights = weights

def get_winner(region):
    feature_names = [
        'rental_rate',
        'median_rent',
        'income',
        'religious',
        'population',
        'unemployment'
    ]

    rows_and_columns = []
    features = [region[feature] for feature in feature_names]
    for zone_type in "RCIWP":
        features.append(region['zoning'].get(zone_type, 0))
    rows_and_columns.append(numpy.nan_to_num(features))
    features = rows_and_columns / normalisation
    return som.winner(features[0])
