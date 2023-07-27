const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

// location should be a simple string,
// such as "spain" or "kraków, poland"
async function getGeoData(location)
{
    const geoData = await geocoder.forwardGeocode(
        {
            query: location,
            limit: 1
        }
    ).send();
    console.log("Mapbox Forward Geocode has been called once.");
    return geoData
}

// returns a geometry, and if geoData didn't
// get a result, returns a 0,0 point
function getGeometry(geoData)
{
    if (geoData.body.features.length === 0)
    {
        console.log("No valid point was found. Setting to [0°E, 0°N]...");
        return {
            type: "Point",
            coordinates: [0.000000, 0.000000]
        }
    }
    else
    {
        return geoData.body.features[0].geometry;
    }
}

function convertLatLongToLongLat(latitude, longitude)
{
    console.log(`Should return [${longitude}°E/W, ${latitude}°N/S], as a geometry`);
    return {
        type: "Point",
        coordinates: [longitude, latitude]
    }
}

module.exports =
{
    getGeoData,
    getGeometry,
    convertLatLongToLongLat
};