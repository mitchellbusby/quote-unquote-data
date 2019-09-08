import json
import os
import uuid

import numpy
import sklearn.neighbors
import sklearn.preprocessing

with open(os.path.dirname(os.path.realpath(__file__)) + '/data/sa2_regions.json') as regions_file:
    sa1s = json.load(regions_file)

kde = sklearn.neighbors.KernelDensity()
scaler = sklearn.preprocessing.StandardScaler()
feature_names = [
    'rental_rate',
    'median_rent',
    'income',
    'religious',
    'population',
    'unemployment'
]

rows_and_columns = []
for region in sa1s:
    features = [region[feature] for feature in feature_names]
    assert len(region['businesses']) == 5
    features.extend(region['businesses'])
    for zone_type in "RCIWP":
        features.append(region['zoning'].get(zone_type, 0))
    rows_and_columns.append(numpy.nan_to_num(features))

features = scaler.fit_transform(rows_and_columns)
kde.fit(features)

def sample_sa1():
    sample = kde.sample()
    sample = scaler.inverse_transform(sample)
    sample[0, :][sample[0, :] < 0] = 0
    sa1 = dict(zip(feature_names, sample[0]))
    sa1['zoning'] = {}
    sample[0, -5:] = numpy.clip(sample[0, -5:], 0, 10000)
    sample[0, -5:] /= sample[0, -5:].sum()
    sample[0, -5:] *= 10000
    assert all(sample[0] >= 0)
    for zone_type, s in zip("RCIWP", sample[0, -5:]):
        sa1['zoning'][zone_type] = numpy.clip(s, 0, 10000)
    sa1['businesses'] = list(sample[0, -5-5:-5])
    assert len(sa1['businesses']) == 5, sa1['businesses']
    finance_pc = numpy.array([  1261.91,   1843.  , 100000.  ])
    sa1['income_level'] = int((sa1['income'] < finance_pc).argmax() + 1)
    return sa1

def sample_suburb(min_sa1s=1, max_sa1s=16):
    n_sa1s = numpy.random.randint(min_sa1s, max_sa1s + 1)
    sa1s = [sample_sa1() for _ in range(n_sa1s)]

    # Aggregate SA1s into a suburb.
    d = dict(
        id=numpy.random.randint(50000, 1000000),
        name='Random suburb',
    )
    meanable = 'religious', 'unemployment', 'rental_rate', 'median_rent', 'income'
    for m in meanable:
        d[m] = numpy.nanmean([c[m] for c in sa1s])
    d['income_level'] = int(round(numpy.nanmean([c['income_level'] for c in sa1s])))
    d['population'] = int(numpy.nansum([c['population'] for c in sa1s]))
    d['zoning'] = {k: 0 for k in 'RCIPWU'}
    d['businesses'] = list(numpy.mean([c['businesses']
                                         for c in sa1s], axis=0))
    for c in sa1s:
        for z in d['zoning']:
            d['zoning'][z] += c['zoning'].get(z, 0) / len(sa1s)
    return sa1s, d
