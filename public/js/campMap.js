mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/outdoors-v12',
    center: campground.geometry.coordinates,
    zoom: 6
});

map.addControl(new mapboxgl.NavigationControl());

new mapboxgl.Marker()
    .setLngLat(campground.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
                <div style="text-align: center">
                <h5>${campground.title}</h5>
                <div>${campground.location}</div>
                <div>LatLong: ${campground.geometry.coordinates[1]}, ${campground.geometry.coordinates[0]}</div>
                </div>
                `
            )
    )
    .addTo(map);