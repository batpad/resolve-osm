# resolve-osm
Silly small package that takes a CSV file with `node_osm_id` or `way_osm_id` references to OpenStreetMap features and returns a valid GeoJSON.

## Usage
Convert your CSV to a JSON

`csv2json foo.csv out.json`

Edit the [path to your json file](https://github.com/batpad/resolve-osm/blob/master/index.js#L15)

Run the script

` node index.js > output.geojson`
