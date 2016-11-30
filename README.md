# resolve-osm
Silly small package that takes a CSV file with `node_osm_id` or `way_osm_id` references to OpenStreetMap features and returns a valid GeoJSON.

## Usage
Convert your CSV to a JSON

`csv2json foo.csv out.json`

Run the script

`node index.js <input_file.json> <output.geojson>`
