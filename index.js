/*
    Convert CSV to JSON:
       csv2json foo.csv out.json
       Edit the JSON_PATH in this file to point to your json file.
       Run this with:
           node index.js > output.geojson
*/

var request = require('request');
var csv2json = require('csv2json');
var queue = require('d3-queue').queue;
var fs = require('fs');
var path = require('path');
var turfCentroid = require('turf-centroid');
var argv = require('minimist')(process.argv.slice(2));
var JSON_PATH = argv._[0];
var outFile = argv._[1];
var API_BASE = 'https://jzvqzn73ca.execute-api.us-east-1.amazonaws.com/api/feature/';

var data = require(path.join(__dirname, JSON_PATH));

var q = queue(3);
data.forEach(function(d) {
    q.defer(fetchLocation, d);
});

q.awaitAll(function(err, results) {
    var features = [];
    results.forEach(function(i) {
        if (i.lat && i.lon) {
            var feature = {
                'type': 'Feature',
                'geometry': {
                    'type': 'Point',
                    'coordinates': [i.lon, i.lat]
                },
                'properties': i
            };
            features.push(feature);
        }
    });
    var geojson = JSON.stringify({
        'type': 'FeatureCollection',
        'features': features
    }, null, 2);
    fs.writeFileSync(path.join(__dirname, outFile), geojson);
});

function fetchLocation(row, callback) {
    if (!row.osm_id || !row.osm_type) return callback(null, row);
    var osm = {
        'type': row.osm_type,
        'id': row.osm_id
    };
    var url = API_BASE + osm.type + '/' + osm.id;
    request(url, function(err, response) {
        if (err) throw err;
        var lat, lon;
        var geojson = JSON.parse(response.body);
        if (!geojson.properties || !geojson.geometry) {
            return callback(null, row);
            console.error('ERROR', row);
        }
        if (osm.type === 'node') {
            lon = geojson.geometry.coordinates[0];
            lat = geojson.geometry.coordinates[1];
        } else if (osm.type === 'way' || osm.type === 'relation') {
            var fc = {
                'type': 'FeatureCollection',
                'features': [geojson]
            };
            try {
                var centroid = turfCentroid(fc);
            } catch (e) {
                console.error('ERROR', geojson);
                console.error('ERROR', JSON.stringify(row, null, 2));
                return callback(null, row);
            }
            lon = centroid.geometry.coordinates[0];
            lat = centroid.geometry.coordinates[1];
        }
        row.lon = lon;
        row.lat = lat;
        return callback(null, row);
    });
}
