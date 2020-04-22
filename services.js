const os = require('os');
const csv = require('csv-parser');
const readline = require('readline');
const fs = require('fs');
const GoogleMapsAPI = require('googlemaps');
const publicConfig = {
    key: process.env.GOOGLE_API_KEY,
    stagger_time:       1000,
    encode_polylines:   false,
    secure:             true
};
const gmAPI = new GoogleMapsAPI(publicConfig);

async function build_new_line(cep, googlemapsdata) {
    let lat = googlemapsdata['lat'];
    let lng = googlemapsdata['lng'];
    return cep+', '+ lat+', '+lng;
}

async function write_new_csv_line(writable, newline) {
    writable.write(newline+os.EOL);
    return writable;
}

const getAddress = address => {
    return new Promise((resolve, reject) => {
        gmAPI.geocode({address: address, region:'BR'}, (err, data) => {
            if (data.status === 'OK') {
                resolve(data.results[0].geometry.location);
            } else {
                reject(data.status);
            }
        });
    });
};

async function convert_csv_with_cep_to_latitude_longitude(ceps, callback) {
    try {
        let NEW_FILE_PATH = 'cep_lat_long.csv';
        let writable = fs.createWriteStream(NEW_FILE_PATH);
        const readable = fs.createReadStream(ceps.path).pipe(csv());
        for await (const line of readable) {
            let cep = line['cep'];
            let location = await getAddress(cep);
            let newline = await build_new_line(cep, location);
            await write_new_csv_line(writable, newline);
        }
        return callback(NEW_FILE_PATH)
    } catch(err) {
        console.warn(err);
    }
}
module.exports = {
    convert_csv_with_cep_to_latitude_longitude,
};