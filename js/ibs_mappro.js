function IBS_MAPPRO(args) {//version 2.1
    this.run(args);
}
(function ($) {
    IBS_MAPPRO.prototype.run = function (args) {
        var mappro = this;
        var sn = args.sn;
        this.options = {
            args: {
                streetview: false,
                maptype: false,
                zoom: false,
                scroll: false,
                drag: false,
                admin: true,
                controls: false,
                list: false,
                markerManager: false,
                search: false,
                elevation: false,
                ajax: null,
                url: null,
                path: null,
                liburl: null,
                libpath: null,
                nonce: null,
                sn: 1,
                title: 'TWACA',
                tag: '',
                div: $('body'),
                maps: null,
                debug: 'off'
            },
            distance: false,
            metric: false,
            address: '',
            url: '',
            markerManager: {'set': false, 'maxZoom': 18, 'gridSize': 50},
            stroke: {color: '#000fff', weight: 5, opacity: 0.3},
            followRoad: true,
            travelMode: "DRIVING",
            avoidHighways: false,
            gpx: {routes: false, tracks: true, waypoints: true, placemarks: true},
            qtip: {style: 'qtip-bootstrap', rounded: false, shadow: false}
        };
        this.html = {};
        $.extend(this.options.args, args);
        this.googlemap = null;
        this.garmin_symbols = null;
        this.files = {};
        this.fileId = 1000;
        this.kml = new KML();
        this.gpx = new GPX();
        this.foundPlaces = [];
        this.siteRoot = function () {
            return this.options.args.path;
        };
        this.siteUrl = function () {
            return this.options.args.url;
        };
        this.click = function (event) {
            var sid = click_target.sid;
            var pid = click_target.pid;
            click_target = {
                pid: null,
                sid: null
            };
            this.setCursor('pointer');
            if (sid) {
                var segment = this.file.segments[sid];
                segment.pend = 'extend';
                segment.click(event);
            }
            if (pid) {
                var placemark = this.file.placemarks[pid];
                placemark.click(event);
            }
            this.file.click(event);
        };
        var click_target = {
            pid: null,
            sid: null
        };
        this.setClick = function (target) {
            if (!target) {
                this.file.pendReset();
                click_target = {
                    pid: null,
                    sid: null
                };
                this.setCursor('pointer');
                return false;
            } else {
                click_target = target;
                this.setCursor('crosshair');
                return true;
            }
        };
        this.getClick = function () {
            return click_target;
        };
        this.setCursor = function (cursor) {
            this.googlemap.setOptions({
                draggableCursor: cursor
            });
        };
        this.fitBounds = function () {
            var bounds = new google.maps.LatLngBounds();
            this.file.getBounds(bounds);
            this.googlemap.fitBounds(bounds);
            this.file.refresh();
        };
        this.setBikeLayer = function (bool) {
            if (this.bicycleLayer) {
                if (bool) {
                    this.bicycleLayer.setMap(this.googlemap);
                } else {
                    this.bicycleLayer.setMap(null);
                }
            }
        };
        this.setTrafficLayer = function (bool) {
            if (this.trafficLayer) {
                if (bool) {
                    this.trafficLayer.setMap(this.googlemap);
                } else {
                    this.trafficLayer.setMap(null);
                }
            }
        };
        this.setTransitLayer = function (bool) {
            if (this.transitLayer) {
                if (bool) {
                    this.transitLayer.setMap(this.googlemap);
                } else {
                    this.transitLayer.setMap(null);
                }
            }
        };
        this.setMenuXY = function (item, latlng, bx, by) {
            if (typeof bx === 'undefined')
                bx = 0;
            if (typeof by === 'undefined')
                by = 0;
            var mapWidth = this.html.map_div.width();
            var mapHeight = this.html.map_div.height();
            var menuWidth = item.width();
            var menuHeight = item.height();
            var clickedPosition = this.getCanvasXY(latlng);
            var left = clickedPosition.x + bx;
            var top = clickedPosition.y + by;
            left = mapWidth - left < menuWidth ? left - menuWidth : left;
            top = mapHeight - top < menuHeight ? top - menuHeight : top;
            item.css({'left': left, 'top': top, 'position': 'absolute'});
        };
        this.getCanvasXY = function (latlng) {
            var scale = Math.pow(2, this.googlemap.getZoom());
            var nw = new google.maps.LatLng(
                    this.googlemap.getBounds().getNorthEast().lat(),
                    this.googlemap.getBounds().getSouthWest().lng()
                    );
            var worldCoordinateNW = this.googlemap.getProjection().fromLatLngToPoint(nw);
            var worldCoordinate = this.googlemap.getProjection().fromLatLngToPoint(latlng);
            var latlngOffset = new google.maps.Point(
                    Math.floor((worldCoordinate.x - worldCoordinateNW.x) * scale),
                    Math.floor((worldCoordinate.y - worldCoordinateNW.y) * scale)
                    );
            return latlngOffset;
        };
        this.measure1 = function () {
            return this.options.metric ? '(m)' : '(f)';
        };
        this.measure2 = function () {
            return this.options.metric ? ' km' : ' mi';
        };
        this.convertMeters1 = function (meters) {
            return this.options.metric ? meters.toFixed(2) : (meters * 3.2808399).toFixed(2);
        };
        this.convertMeters2 = function (meters) {
            return this.options.metric ? (meters / 1000).toFixed(2) : (meters / 1609.344).toFixed(2);
        };
        this.getCkeditorConfig = function () {
            return {
                toolbarStartupExpanded: true,
                extraPlugins: 'filebrowser,imageuploader,image2,print,table',
                disableNativeSpellChecker: false,
                browserContextMenuOnCtrl: true,
                removePlugins: 'scayt',
                removeDialogTabs: 'link:upload;image2:Upload',
                height: 200,
                contentsCss: this.siteUrl() + '/css/map.css',
                resize_enabled: true,
                filebrowserBrowseUrl: this.options.args.ajax + '?action=ibs_mappro_index&func=file&nonce=' + this.options.args.nonce,
                filebrowserImageBrowseUrl: this.options.args.path + 'js/ckeditor/plugins/imageuploader/imgbrowser.php/',
                toolbar:
                        [
                            ['Source', 'Undo', 'Redo', '-', 'SelectAll', 'RemoveFormat'],
                            ['Bold', 'Italic', 'Underline', 'Strike'],
                            ['Link', 'Unlink', 'Image'],
                            ['TextColor', 'BGColor', 'Print', 'Table']
                        ]
            };
        };
        this.removeFile = function () {
            this.setClick();
            delete this.file;
            this.html.placemark_list.empty();
            this.html.waypoint_list.empty();
            this.html.segment_list.empty();
            this.html.file_list.empty();
            this.setFile();
        };
        this.clear = function (options) {
            this.file.clearDialog();
        };
        this.isDirty = function () {
            if (this.file && this.file.dirty) {
                return 'Changes have not been saved.';
            }
            return null;
        };
        this.findLocation = function () {
        };
        this.showPend = function (latlng) {
            var pend_info = this.html.pend_info;
            pend_info.hide();
            var target = this.getClick();
            var ppend = this.file.pend;
            if (target.sid) {
                ppend = this.file.segments[target.sid].pend;
            }
            switch (ppend) {
                case 'placemark' :
                    pend_info.text('Set marker');
                    this.html.list.find('.placemark-list-name').removeClass('img-marker').addClass('img-marker-hot');
                    break;
                case 'segment' :
                    pend_info.text('Start route');
                    this.html.list.find('.segment-list-name').removeClass('img-line').addClass('img-line-hot');
                    break;
                case 'sort' :
                    pend_info.text('Set sort origin');
                    break;
                case 'extend' :
                    pend_info.text('Extend route');
                    break;
                default :
                    this.html.list.find('.placemark-list-name').removeClass('img-marker-hot').addClass('img-marker');
                    this.html.list.find('.segment-list-name').removeClass('img-line-hot').addClass('img-line');
                    return;
            }
            this.setMenuXY(pend_info, latlng, 0, -40);
            pend_info.show();
        }

        this.reset = function () {
            this.setClick();
            spin(false);
            for (var sid in this.file.segments) {
                this.file.segments[sid].stopEditing();
                this.file.segments[sid].cuesheetKill();
            }
            this.elevationSegment = null;
            this.sizeHtml();
        };
        this.stats = function (list, distance, segments, placemarks) {
            var pm = padLeftStr(placemarks.toString(), 3, ' ') + ' placemarks.';
            var sm = padLeftStr(segments.toString(), 3, ' ') + ' segments.';
            $(list).html('')
                    .append($('<div>').addClass('stats')
                            .append($('<img>').attr('src', this.siteUrl() + 'image/gears.png'))
                            .append($('<span>').html(this.convertMeters2(distance) + this.measure2())))
                    .append($('<div>').addClass('stats').addClass(segments ? '' : 'hide')
                            .append($('<img>').attr('src', this.siteUrl() + 'image/line.png'))
                            .append($('<span>').html(sm)))
                    .append($('<div>').addClass('stats').addClass(placemarks ? '' : 'hide')
                            .append($('<img>').attr('src', this.siteUrl() + 'image/marker.png'))
                            .append($('<span>').html(pm)));
        }
        this.alert = function (message) {
            var dd = jQuery('<div>').attr({'id': 'alert-dialog', 'title': 'Alert'}).css({'background-color': 'Tomato', 'color': 'white'})
                    .append(jQuery('<p>')
                            .append(jQuery('<img>').attr('src', this.siteUrl() + 'image/alert-white.png').css({'float': 'left', 'margin-right': '5px'}))
                            .append(jQuery('<span>').html(message)));
            jQuery(dd).dialog({
                autoOpen: true,
                modal: true,
                buttons: {
                    Ok: function () {
                        jQuery(this).dialog("close");
                    }
                },
                close: function () {
                    jQuery(this).dialog('destroy');
                }
            });
        };
        this.confirm = function (message, callback) {
            var dd = jQuery('<div>').attr({'id': 'alert-dialog', 'title': 'Confirm'}).css({'background-color': 'Tomato', 'color': 'white'})
                    .append(jQuery('<p>')
                            .append(jQuery('<img>').attr('src', this.siteUrl() + 'image/alert-white.png').css({'float': 'left', 'margin-right': '5px'}))
                            .append(jQuery('<span>').html(message)));
            jQuery(dd).dialog({
                autoOpen: true,
                modal: true,
                buttons: {
                    Ok: function () {
                        jQuery(this).dialog("close");
                        callback(true);
                    },
                    Cancel: function () {
                        jQuery(this).dialog("close");
                        callback(false);
                    }
                },
                close: function () {
                    jQuery(this).dialog('destroy');
                }
            });
        }
        this.prompt = function (message, callback) {
            var dialog = mappro.html.prompt_dialog;
            dialog.dialog({
                autoOpen: true,
                modal: true,
                buttons: {
                    Ok: function () {
                        dialog.dialog("close");
                        if (typeof callback === 'function') {
                            callback(dialog.find('.answer').val());
                        }
                    },
                    Cancel: function () {
                        dialog.dialog("close");
                        if (typeof callback === 'function') {
                            callback(null);
                        }
                    },
                },
                close: function () {
                    dialog.dialog('destroy');
                }
            });
        }
        this.notice = function (message) {
            var dd = jQuery('<div>').attr({'id': 'notice-dialog', 'title': 'Notice'}).css({'background-color': 'white', 'color': 'black'})
                    .append(jQuery('<p>')
                            .append(jQuery('<img>').attr('src', this.siteUrl() + 'image/info.png').css({'float': 'left', 'margin-right': '5px'}))
                            .append(jQuery('<span>').html(message)));
            jQuery(dd).dialog({
                autoOpen: true,
                modal: false,
                show: {
                    effect: "blind",
                    duration: 1000
                },
                hide: {
                    effect: "blind",
                    duration: 1000
                },
                open: function () {
                    var noticeInterval = window.setInterval(function () {
                        try {
                            jQuery(dd).dialog('close');
                        } catch (err) {

                        }
                        window.clearInterval(noticeInterval);
                    }, 2500);
                },
                close: function () {
                    jQuery(this).dialog('destroy');
                }
            });
        }
        this.setIcons = function () {
            this.imageSegmentEnd = new google.maps.MarkerImage(
                    this.siteUrl() + "image/blue_box.png",
                    new google.maps.Size(16, 16),
                    new google.maps.Point(0, 0),
                    new google.maps.Point(8, 8)
                    );
            this.imagePlacemark = new google.maps.MarkerImage(
                    this.siteUrl() + 'image/blue.png', //url
                    new google.maps.Size(32, 32),
                    new google.maps.Point(0, 0),
                    new google.maps.Point(16, 33),
                    new google.maps.Size(32, 32)
                    );
            this.imageDistancePointer = new google.maps.MarkerImage(
                    this.siteUrl() + 'image/crosshair-black.png', //url
                    new google.maps.Size(16, 16), //size
                    new google.maps.Point(0, 0), //origin
                    new google.maps.Point(8, 8)//anchor
                    );
            this.imageBlueMarker = new google.maps.MarkerImage(
                    this.siteUrl() + 'image/blue.png', //url
                    new google.maps.Size(32, 32),
                    new google.maps.Point(0, 0),
                    new google.maps.Point(16, 33),
                    new google.maps.Size(32, 32)
                    );
            this.imageRedMarker = new google.maps.MarkerImage(
                    this.siteUrl() + 'image/pink.png', //url
                    new google.maps.Size(32, 32),
                    new google.maps.Point(0, 0),
                    new google.maps.Point(16, 33),
                    new google.maps.Size(32, 32)
                    );
            this.imageLineActive = new google.maps.MarkerImage(
                    this.siteUrl() + "image/redCircle.png",
                    new google.maps.Size(16, 16),
                    new google.maps.Point(0, 0),
                    new google.maps.Point(8, 8)
                    );
            this.imageLineNormal = new google.maps.MarkerImage(
                    this.siteUrl() + "image/blue_box.png",
                    new google.maps.Size(16, 16),
                    new google.maps.Point(0, 0),
                    new google.maps.Point(8, 8)
                    );
            this.imageWaypointNormal = new google.maps.MarkerImage(
                    this.siteUrl() + "image/waypoint.png",
                    new google.maps.Size(32, 32),
                    new google.maps.Point(0, 0),
                    new google.maps.Point(15, 25)
                    );
            this.imageNormal = new google.maps.MarkerImage(
                    this.siteUrl() + "image/square.png",
                    new google.maps.Size(11, 11),
                    new google.maps.Point(0, 0),
                    new google.maps.Point(6, 6)
                    );
            this.imageHover = new google.maps.MarkerImage(
                    this.siteUrl() + "image/square_over.png",
                    new google.maps.Size(11, 11),
                    new google.maps.Point(0, 0),
                    new google.maps.Point(6, 6)
                    );
            this.imageNormalMidpoint = new google.maps.MarkerImage(
                    this.siteUrl() + "image/square_transparent.png",
                    new google.maps.Size(11, 11),
                    new google.maps.Point(0, 0),
                    new google.maps.Point(6, 6)
                    );
            $.getJSON(this.options.args.ajax,
                    {
                        action: 'ibs_mappro_index',
                        func: 'icons',
                        lib: this.options.args.libpath + 'icons/garmin/',
                        nonce: this.options.args.nonce
                    })
                    .done(function (data) {
                        mappro.garmin_symbols = data;
                    });
        };
        this.getIcon16 = function (url) {
            return new google.maps.MarkerImage(
                    url,
                    new google.maps.Size(16, 16),
                    new google.maps.Point(0, 0),
                    new google.maps.Point(8, 8)
                    );
        }
        this.getIcon32 = function (url) {
            return new google.maps.MarkerImage(
                    url,
                    new google.maps.Size(32, 37),
                    new google.maps.Point(0, 0),
                    new google.maps.Point(16, 37)
                    );
        }
        this.getIcon = function (url) {
            if (url.indexOf('-lv') !== -1) {
                return this.getIcon16(url);
            } else {
                return this.getIcon32(url)
            }
        };
        this.getSymbol = function (url) {
            for (var i = 0; i < this.garmin_symbols.length; i++) {
                if (url === this.garmin_symbols[i].url) {
                    return this.garmin_symbols[i].name;
                }
            }
            if (getFilename(url) === 'icon61') {//backwards compatibility
                return 'Waypoint';
            }
            return initialCaps(getFilename(url).replace('-', ' ').replace('_', ' '));
        };
        this.getUrlFromSymbol = function (symbol) {
            if (symbol === 'Waypoint') {
                return  mappro.options.args.url + "image/waypoint.png";
            }
            var result = this.imagePlacemark.url;
            if (symbol !== '') {
                symbol = symbol.toLowerCase()
                var ss = symbol.split(' ');
                if (ss.length > 1) {
                    ss[1] = ss[1].replace('(', '').replace(')', '');
                    symbol = ss[0] + '-' + ss[1];
                }

                for (var i = 0; i < this.garmin_symbols.length; i++) {
                    if (symbol === this.garmin_symbols[i].name) {
                        return this.garmin_symbols[i].url;
                    }
                }
            }
            return result;
        };
        this.setFile = function () {
            this.file = new File(this,
                    {
                        url: '',
                        stroke: this.options.stroke,
                        filename: this.options.filename,
                        gpx: this.options.gpx,
                    }
            );
        }
        this.setMap = function () {
            for (var i in this.options.map_types) {
                if (this.options.map_types[i].set) {
                    this.options.mapTypeControlOptions.mapTypeIds.push(this.options.map_types[i].type);
                }
            }
            var mapTypeIds = [];
            for (var type in google.maps.MapTypeId) {
                mapTypeIds.push(google.maps.MapTypeId[type]);
            }
            mapTypeIds.push("OSM");
            mapTypeIds.push("OSMCYCLE");
            mapTypeIds.push("OSMPUBLIC");
            mapTypeIds.push("OSMLANDSCAPE");
            mapTypeIds.push("OSMOUTDOORS");
            var map_options = {
                center: new google.maps.LatLng(37.09024, -95.712891),
                disableDefaultUI: false,
                disableDoubleClickZoom: true,
                draggable: this.options.args.drag,
                draggableCursor: 'auto',
                draggingCursor: 'auto',
                heading: 0,
                keyboardShortcuts: true,
                mapTypeControl: this.options.args.maptype,
                mapTypeControlOptions: {
                    mapTypeIds: mapTypeIds,
                    position: google.maps.ControlPosition.TOP_RIGHT,
                    style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
                },
                mapTypeId: this.options.mapTypeId,
                scrollwheel: this.options.args.admin || this.options.args.scroll,
                streetViewControl: this.options.args.streetview,
                streetViewControlOptions: {position: google.maps.ControlPosition.TOP_LEFT},
                scaleControl: false,
                zoom: 7,
                zoomControl: this.options.args.zoom,
                zoomControlOptions: {position: google.maps.ControlPosition.TOP_LEFT, style: google.maps.ZoomControlStyle.SMALL}
            };
            this.googlemap = new google.maps.Map($('#map-div-' + this.options.args.sn)[0], map_options);
            var mapTypes = [
                {set: 'on', name: 'OSM street', type: 'OSM', 'size': {'x': 256, 'y': 256}, 'zoom': 18, 'url': 'http://tile.openstreetmap.org/'},
                {set: 'on', name: 'OSM Cycle', type: 'OSMCYCLE', 'size': {'x': 256, 'y': 256}, 'zoom': 18, 'url': 'http://tile.thunderforest.com/cycle/'},
                {set: 'on', name: 'OSM Transport', type: 'OSMTRANSPORT', 'size': {'x': 256, 'y': 256}, 'zoom': 18, 'url': 'http://tile.thunderforest.com/transport/'},
                {set: 'on', name: 'OSM Landscape', type: 'OSMLANDSCAPE', 'size': {'x': 256, 'y': 256}, 'zoom': 18, 'url': 'http://tile.thunderforest.com/landscape/'},
                {set: 'on', name: 'OSM Outdoors', type: 'OSMOUTDOORS', 'size': {'x': 256, 'y': 256}, 'zoom': 18, 'url': 'http://tile.thunderforest.com/outdoors/'}
            ]

            for (var i in mapTypes) {
                var opt = mapTypes[i];
                if (opt.set) {
                    var imt = new google.maps.ImageMapType(
                            {
                                getTileUrl: function (coord, zoom) {
                                    return this.url + zoom + "/" + coord.x + "/" + coord.y + ".png";
                                },
                                tileSize: new google.maps.Size(parseInt(opt.size.x), parseInt(opt.size.y)),
                                name: opt.name,
                                maxZoom: parseInt(opt.maxZoom),
                                url: opt.url
                            })

                    this.googlemap.mapTypes.set(opt.type, imt);
                }
            }

            this.bicycleLayer = new google.maps.BicyclingLayer();
            this.trafficLayer = new google.maps.TrafficLayer();
            this.transitLayer = new google.maps.TransitLayer();
            this.directionsService = new google.maps.DirectionsService();
            this.geocoder = new google.maps.Geocoder();
            this.placesService = new google.maps.places.PlacesService(mappro.googlemap);
            if (this.options.args.admin) {
                mappro.googlemap.controls[google.maps.ControlPosition.TOP_LEFT].push(this.html.action_menu[0]);
                mappro.googlemap.controls[google.maps.ControlPosition.TOP_LEFT].push(this.html.draw_menu[0]);
                this.html.action_menu.show();
                this.html.draw_menu.show();
            }
            if (this.options.args.admin || this.options.args.controls) {
                mappro.googlemap.controls[google.maps.ControlPosition.TOP_LEFT].push(this.html.control_menu[0]);
                this.html.control_menu.show();
            }
            if (typeof this.options.args.wpadmin !== 'undefined' || this.options.args.wpadmin === true) {
                mappro.googlemap.controls[google.maps.ControlPosition.TOP_LEFT].push(this.html.manage_menu[0]);
                this.html.manage_menu.show();
            }
            if (mappro.options.args.admin || mappro.options.args.search) {
                this.searchBox = new google.maps.places.SearchBox(mappro.html.search_box.find('.ibs-pac-input')[0]);
                this.searchBox.setBounds(mappro.googlemap.getBounds());
                mappro.googlemap.controls[google.maps.ControlPosition.TOP_LEFT].push(mappro.html.search_box[0]);
                mappro.googlemap.addListener('bounds_changed', function () {
                    mappro.searchBox.setBounds(mappro.googlemap.getBounds());
                });
                this.searchBox.addListener('places_changed', function () {
                    mappro.searchPlaces(mappro);
                });
            }
            this.infowindow = new google.maps.InfoWindow({
                content: ''
            });
            this.searchmarker = new google.maps.Marker({
                position: new google.maps.LatLng(37.09024, -95.712891),
                map: this.googlemap,
                visible: false,
                title: 'search marker',
                icon: this.imageRedMarker
            });
        }
        this.postGoogleLoad = function () {
            this.setFile();
            google.maps.event.addListener(this.searchmarker, 'click', function (event) {
                this.setVisible(false);
            });
            google.maps.event.addListener(this.googlemap, "click", $.proxy(function (event) {
                this.click(event);
            }, this));
            google.maps.event.addListener(this.googlemap, "rightclick", $.proxy(function (event) {
                this.setClick();
            }, this));
            google.maps.event.addListener(this.googlemap, "mousemove", $.proxy(function (event) {
                this.showPend(event.latLng)
            }, this));
            google.maps.event.addListener(this.googlemap, "drag", function (event) {
                try {
                    if (typeof mappro.html.route_menu === 'object' && mappro.html.route_menu.is(':visible')) {
                        var rel = mappro.html.route_menu.find('.ibs-route-item').first().attr('rel');
                        var pos = mappro.file.segments[rel].marker.getPosition();
                        mappro.setMenuXY(mappro.html.route_menu, pos);
                    }
                } catch (err) {

                }
            });
            if (this.options.args.maps) {
                this.options.args.maps = this.options.args.maps.replace('%maps%;', mappro.options.args.liburl + 'maps/');
            }
            if (isUrl(this.options.args.maps)) {
                this.file.importFile(this.options.args.maps);
            } else {
                if (this.options.address !== '') {
                    this.geocoder.geocode({
                        'address': this.options.address
                    }, $.proxy(function (results, status) {
                        if (status === google.maps.GeocoderStatus.OK) {
                            var lat = results[0].geometry.location.lat();
                            var lng = results[0].geometry.location.lng();
                            lng = parseFloat(lng);
                            lat = parseFloat(lat);
                            if (typeof lat === 'number' && typeof lng === 'number') {
                                var latlng = new google.maps.LatLng(lat, lng);
                                this.googlemap.setCenter(latlng);
                            }
                        }
                    }, this));
                }
            }
            google.maps.event.addListenerOnce(mappro.googlemap, 'tilesloaded', function () {
                google.maps.event.addListenerOnce(mappro.googlemap, 'tilesloaded', function () {
                    google.maps.event.trigger(mappro.googlemap, 'resize');
                });
            });
            google.maps.event.addListenerOnce(mappro.googlemap, 'zoom_changed', function () {
                setTimeout(function () {
                    var cnt = mappro.googlemap.getCenter();
                    cnt.e += 0.000001;
                    mappro.googlemap.panTo(cnt);
                    cnt.e -= 0.000001;
                    mappro.googlemap.panTo(cnt);
                    var next = parseInt(mappro.options.args.sn) + 1;
                    $('#ibs-map-' + next + '-trigger').trigger('click');
                }, 400);
            });
        };
        this.initMap = function () {
            this.htmlGen(this);
            if (!this.options.args.admin) {
                this.html.page.find('.ibs-admin-only').hide();
            }
            this.setHandlers(this);
            this.sizeHtml();
            this.setIcons();
            this.setMap();
            google.maps.event.addListenerOnce(this.googlemap, "idle", $.proxy(function (event) {
                this.postGoogleLoad();
            }, this));
        };
        if (args.sn === '1') {
            $('#ibs-map-' + args.sn + '-trigger').remove();
            this.initMap();
            mappro.html.list.find('a[rel="list-poi"]').click();
        } else {
            $('#ibs-map-' + args.sn + '-trigger').click($.proxy(function () {
                $('#ibs-map-' + args.sn + '-trigger').remove();
                this.initMap();
                mappro.html.list.find('a[rel="list-poi"]').click();
            }, this))
        }
        this.browseDialog = function () {
            var dialog = this.html.browse_dialog;
            dialog.dialog({
                autoOpen: true,
                width: 600,
                modal: true,
                buttons: {
                    Select: $.proxy(function () {
                        var files = ''
                        dialog.find('a.selected').each(function () {
                            path = $(this).attr('rel');
                            files += $(this).text() + ';';
                        })
                        if (files !== '') {
                            path = path.replace(mappro.options.args.libpath, mappro.options.args.liburl);
                            var uriinfo = purl(path);
                            var path = uriinfo.data.attr.base + uriinfo.data.attr.directory;
                            files = path + files.slice(0, files.length - 1);
                            this.file.importFile(files);
                        }
                        dialog.dialog('close');
                    }, this),
                    Close: function () {
                        $(this).dialog('close');
                    }
                },
                close: function () {
                    $(this).dialog('destroy');
                },
                open: $.proxy(function () {
                    if (mappro.options.args.admin) {
                        var dir = mappro.options.args.libpath + 'maps/';
                    } else {
                        dir = mappro.options.args.libpath + 'maps/ACA';
                    }
                    dialog.find('.ibs-map-browser').fileTree({
                        root: dir,
                        script: mappro.options.args.ajax + '?action=ibs_mappro_index&func=folders&type=map&nonce=' + mappro.options.args.nonce,
                        folderEvent: 'click',
                        expandSpeed: 0,
                        collapseSpeed: 0,
                        multiFolder: false
                    }, function (file) {
                    }, function (dir) {
                    }
                    );
                }, this)
            });
        };
    };
})(jQuery);