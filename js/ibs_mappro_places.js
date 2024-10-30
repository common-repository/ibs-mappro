(function ($) {
    IBS_MAPPRO.prototype.searchPlaces = function (mappro) {
        var places = mappro.searchBox.getPlaces();
        if (places.length > 0) {
            mappro.foundPlaces.forEach(function (arg) {
                arg.marker.setMap(null);
            });
            mappro.foundPlaces = [];

            for (var i in places) {
                var marker = new google.maps.Marker({
                    map: mappro.googlemap,
                    title: places[i].name,
                    position: places[i].geometry.location,
                    icon: {
                        url: 'http://maps.gstatic.com/mapfiles/circle.png',
                        anchor: new google.maps.Point(16, 16),
                        scaledSize: new google.maps.Size(16, 23)
                    }
                });
                marker.index = i;
                var arg = {
                    place: places[i],
                    marker: marker
                }
                mappro.foundPlaces.push(arg);
                google.maps.event.addListener(marker, 'click', function (event) {
                    var arg = mappro.foundPlaces[parseInt(this.index)];
                    var index = parseInt(this.index);
                    mappro.placesService.getDetails(arg.place, function (result, status) {
                        if (status === google.maps.places.PlacesServiceStatus.OK) {
                            mappro.foundPlaces[index].details = result;
                            var search_info = mappro.html.map.find('.ibs-search-info');
                            search_info.find('.ibs-search-info-name').text(result.name);
                            search_info.find('.ibs-search-info-address').text(result.formatted_address);
                            search_info.find('.ibs-search-info-phone').text(result.formatted_phone_number);
                            search_info.find('.ibs-search-info-desc').html(result.html_attributions);
                            search_info.find('.ibs-search-info-web').attr({href: result.url});
                            search_info.find('.ibs-search-info-mark').attr({rel: index});
                            search_info = search_info.clone();
                            search_info.show();
                            mappro.infowindow.setContent(search_info[0]);
                            mappro.infowindow.open(mappro.googlemap, arg.marker);
                        } else {
                            console.error(status);
                        }

                    });
                });
                if (1 == 1) {
                    var bounds = new google.maps.LatLngBounds();
                    if (places[i].geometry.viewport) {
                        bounds.union(places[i].geometry.viewport);
                    } else {
                        bounds.extend(places[i].geometry.location);
                    }
                    mappro.googlemap.fitBounds(bounds);
                }
            }
        }
    }
})(jQuery);

