function Segment(mappro, args) {
    this.run(mappro, args);
}
(function ($) {
    Segment.prototype.run = function (mappro, args) {
        this.options = {
            fid: null,
            sid: null,
            path: [],
            stroke: {color: '#000fff', weight: 5, opacity: 0.3},
            name: null,
            desc: null,
            cuesheet: null
        };
        this.options = args;
        this.segmentItem = '.ibs-segment-item-name[rel="' + this.options.sid + '"]';
        this.selected = false;
        this.undoStack = [];
        this.points = [];
        this.markerManager = null;
        this.directionsRenderer = null;
        this.directionsService = null;
        this.editing = false;
        this.isActive = true; //shutdown events while doing directions rendering
        this.pend = null;
        this.click = function (event) {
            switch (this.pend) {
                case 'extend' :
                    this.addPoint(event.latLng);
                    if (false === mappro.html.list.find(this.segmentItem).hasClass('selected')) {
                        mappro.file.selectSegment(mappro.html.list.find(this.segmentItem)[0]);
                    }
                    mappro.setClick({
                        sid: this.options.sid
                    });
                    break;
            }
        };
        this.extend = function () {
            mappro.setClick({
                sid: this.options.sid,
                pid: null
            });
            this.pend = 'extend';
        };
        this.lineOptions = function () {
            return {
                'path': this.options.path,
                'strokeWeight': this.options.stroke.weight,
                'strokeColor': this.options.stroke.color,
                'strokeOpacity': this.options.stroke.opacity
            };
        };
        this.append = function () {
            mappro.file.append(this);
        }
        this.elevation = function () {
            mappro.elevation(mappro, this);
        }

        this.copy = function () {
            var result = {};
            for (var attr in this.options) {
                if (attr !== 'path') {
                    result[attr] = this.options[attr];
                }
            }
            result.latlngs = [];
            this.line.getPath().forEach(function (latlng) {
                result.latlngs.push({
                    lat: latlng.lat(0),
                    lng: latlng.lng()
                });
            });
            result.sid = this.options.sid;
            return result;
        };
        this.distanceTo = function (marker) {
            var d = 0;
            var target = marker.getPosition();
            var previous = this.points[0].getPosition();
            if (previous.equals(target)) {
                return 0.0;
            }
            for (var i = 1; i < this.points.length; i++) {
                var current = this.points[i].getPosition();
                d += distanceFrom(previous, current);
                previous = current;
                if (target.equals(current)) {
                    break;
                }
            }
            return (d);
        };
        this.nearestPoint = function (latlng) {
            var d = 0;
            var dd = null;
            var nearest = null;
            var index = 0;
            var total = 0;
            var path = this.line.getPath();
            path.forEach($.proxy(function (p, i) {
                d = distanceFrom(p, latlng);
                if (dd === null || d < dd) {
                    nearest = p;
                    index = i;
                    dd = d;
                }
            }, this));
            var previous = null;
            var current = null;
            for (var i = 0; i < path.getLength(); i++) {
                current = path.getAt(i);
                if (i > 0) {
                    total += distanceFrom(previous, current);
                }
                previous = current;
                if (current.equals(nearest)) {
                    total += dd;
                    break;
                }
            }
            return {
                latLng: nearest,
                index: index,
                distance: total
            };
        };
        this.distance = function () {
            return pathLength(this.line.getPath());
        };
        this.refresh = function () {
            var latlng = this.line.getPath().getAt(this.line.getPath().length - 1);
            this.marker.setPosition(latlng);
        };
        this.remove = function () {
            this.stopEditing();
            this.line.setMap(null);
            this.marker.setMap(null);
            this.distanceMarker.setMap(null);
            this.removeWaypoints();
            mappro.html.list.find(this.segmentItem).parent().remove();
            mappro.file.removeSegment(this.options.sid);
        };
        this._midPoint = function (pointA, pointB) {
            return new google.maps.LatLng(
                    pointB.lat() - (0.5 * (pointB.lat() - pointA.lat())),
                    pointB.lng() - (0.5 * (pointB.lng() - pointA.lng()))
                    );
        };
        this.midPoint = function (point, index) {
            var path = this.line.getPath();
            var pointA = path.getAt(point.index - 1);
            var pointB = path.getAt(point.index);
            var latlng = this._midPoint(pointA, pointB);
            var midpoint = new google.maps.Marker({
                position: latlng,
                map: mappro.googlemap,
                icon: mappro.imageNormalMidpoint,
                draggable: true,
                segment: this,
                index: index,
                point: point
            });
            google.maps.event.addListener(midpoint, "mouseover", function () {
                this.setIcon(mappro.imageNormal);
                var d = mappro.distanceTo(this.point) - distanceFrom(this.getPosition(), this.point.getPosition());
                this.title = mappro.convertMeters2(Math.round(100 * d) / 100) + mappro.measure2();
            });
            google.maps.event.addListener(midpoint, "mouseout", function () {
                this.setIcon(mappro.imageNormalMidpoint);
            });
            google.maps.event.addListener(midpoint, "dragend", function () {
                var latlng = this.getPosition();
                var index = this.point.index;
                var path = this.segment.line.getPath();
                path.insertAt(index, latlng);
                var point = this.segment.point(latlng, index);
                this.segment.points.splice(index, 0, point);
                for (var i in this.segment.points) {
                    this.segment.points[i].index = parseInt(i);
                }
                var pointA = latlng;
                var pointB = this.point.getPosition();
                this.setPosition(this.segment._midPoint(pointA, pointB));
            });
            return midpoint;
        };
        this.point = function (latlng, index) {
            var point = new google.maps.Marker({
                position: latlng,
                map: mappro.googlemap,
                icon: mappro.imageNormal,
                draggable: true,
                index: index,
                segment: this,
                midpoint: null
            });
            if (index > 0) {
                point.midpoint = this.midPoint(point, index);
            } else {
                point.midpoint = null;
            }
            google.maps.event.addListener(point, "mouseover", function (event) {
                this.setIcon(mappro.imageHover);
                var d = this.segment.distanceTo(this);
                this.setTitle(mappro.convertMeters2(Math.round(100 * d) / 100) + mappro.measure2());
            });
            google.maps.event.addListener(point, "mouseout", function () {
                this.setIcon(mappro.imageNormal);
            });
            google.maps.event.addListener(point, "drag", function () {
                var path = this.segment.line.getPath();
                path.setAt(this.index, this.getPosition());
                this.segment.refresh();
            });
            google.maps.event.addListener(point, "dragend", function () {
                var path = this.segment.line.getPath();
                path.setAt(this.index, this.getPosition());
                if (this.midpoint === null || this.index === 0) {
                    var left = this.segment.points[1];
                } else {
                    left = this;
                }
                if (this.segment.points.length >= 2) {
                    var pointA = path.getAt(left.index - 1);
                    var pointB = path.getAt(left.index);
                    left.midpoint.setPosition(midPoint(pointA, pointB));
                    var pos = parseInt(left.index) + 1;
                    if (pos < this.segment.points.length) {
                        var right = this.segment.points[pos];
                        pointA = path.getAt(right.index - 1);
                        pointB = path.getAt(right.index);
                        right.midpoint.setPosition(midPoint(pointA, pointB));
                    }
                }
                this.segment.refresh();
            });
            google.maps.event.addListener(point, "click", function (event) { //rightclick
                this.segment.contextMenuLineEdit(this.index);
            });
            return point;
        };
        this.followRoad = function (latlng) {
            var segment = this;
            var request = {
                avoidHighways: mappro.options.avoidHighways,
                origin: this.line.getPath().getAt(this.line.getPath().getLength() - 1),
                destination: latlng,
                travelMode: google.maps.DirectionsTravelMode[mappro.options.travelMode]
            };
            mappro.directionsService.route(request, function (response, status) {
                if (status === google.maps.DirectionsStatus.OK) {
                    for (var route in response.routes) {
                        for (latlng in response.routes[route].overview_path) {
                            segment.line.getPath().push(response.routes[route].overview_path[latlng]);
                        }
                    }
                }
                segment.refresh();
            });
        };
        this.addPoint = function (latlng) {
            this.save();
            this.stopEditing();
            if (mappro.options.followRoad) {
                this.followRoad(latlng);
            } else {
                this.line.getPath().push(latlng);
            }
            this.refresh();
            mappro.file.setDirty(true);
        };
        this.rebuild = function () {
            var path = this.line.getPath();
            this.save();
            var j = path.getLength();
            var first = path.getAt(0);
            var last = path.getAt(j - 1);
            this.stopEditing();
            this.line.setPath([first]);
            this.addPoint(last);
            this.undoStack.pop();
            mappro.infowindow.close();
        };
        this.waypoint = function (index) {
            var path = this.line.getPath();
            if (index >= 0 && path.getLength()) {
                options = {
                    'waypoint': true,
                    'position': path.getAt(index),
                    'draggable': false,
                    'symbol': 'Waypoint',
                    'url': '',
                    'visible': true,
                    'pid': null
                };
                mappro.file.addPlacemark(options);
            }
        };
        this.split = function (index) {
            var options = {
                path: [],
                strokeColor: this.line.strokeColor,
                strokeOpacity: this.line.strokeOpacity,
                strokeWeight: this.line.strokeWeight,
                name: this.options.name + '.',
                desc: this.options.desc
            };
            var path = this.line.getPath();
            if (index > 0 && path.getLength() > 1) {
                this.stopEditing();
                while (index <= path.getLength() - 1) {
                    options.path.push(path.getAt(index));
                    path.removeAt(index);
                }
                mappro.file.addSegment(options);
                this.refresh();
                mappro.file.setDirty(true);
                mappro.setClick(null);
            }
        };
        this.thin = function () {
            var path = this.line.getPath();
            this.save();
            var newline = [];
            var prev = null;
            path.forEach($.proxy(function (latlng, index) {
                if (prev) {
                    var d = distanceFrom(prev, latlng);
                    if (d > 300.0) {
                        newline.push(latlng);
                        prev = latlng;
                    }
                } else {
                    prev = latlng;
                }
            }, this));
            var dropped = path.getLength();
            dropped -= newline.length;
            this.line.setPath(newline);
            mappro.notice('dropped ' + dropped + ' points.');
            mappro.file.setDirty(true);
        };
        this.save = function () {
            var savepath = [];
            var path = this.line.getPath();
            path.forEach(function (latlng, index) {
                savepath.push(latlng);
            });
            this.undoStack.push(savepath);
        };
        this.undo = function () {
            if (this.undoStack.length) {
                this.stopEditing();
                var path = this.undoStack.pop();
                this.line.setPath(path);
                this.refresh();
            }
        };
        this.flip = function () {
            var path = this.line.getPath();
            this.save();
            var newpath = [];
            for (var j = path.getLength(); j > 0; j--) {
                newpath.push(path.pop());
            }
            this.line.setPath(newpath);
            this.refresh();
        };
        this.getBounds = function (bounds) {
            var path = this.line.getPath();
            path.forEach(function (point, index) {
                bounds.extend(point);
            });
        };
        this.focus = function () {
            var bounds = new google.maps.LatLngBounds();
            this.getBounds(bounds);
            mappro.googlemap.fitBounds(bounds);
        };
        this.manageMarkers = function () {
            if (this.markerManager) {
                this.markerManager.clearMarkers();
            }
            this.marker_cluster = [];
            for (var i in this.points) {
                this.marker_cluster.push(this.points[i]);
                if (this.points[i].midpoint) {
                    this.marker_cluster.push(this.points[i].midpoint);
                }
            }
            this.markerManager = new MarkerClusterer(mappro.googlemap, this.marker_cluster, {gridSize: 50});
        };
        this.stopEditing = function () {
            if (this.markerManager)
                this.markerManager.clearMarkers();
            for (var i in this.points) {
                this.points[i].setMap(null);
                if (this.points[i].midpoint !== null) {
                    this.points[i].midpoint.setMap(null);
                }
            }
            this.points.length = 0;
            this.editing = false;
        };
        this.lineEdit = function () {
            var segment = this;
            if (this.editing) {
                this.stopEditing();
            } else {
                if (this.points.length === 0) {
                    var path = this.line.getPath();
                    path.forEach(function (point, index) {
                        var marker = segment.point(point, index);
                        segment.points.push(marker);
                    });
                    this.manageMarkers();
                } else {
                    for (var i in this.points) {
                        this.points[i].setVisible(true);
                        if (this.points[i].midpoint !== null) {
                            this.points[i].midpoint.setVisible(true);
                        }
                    }
                }
                this.editing = true;
            }
        };
        this.open = function () {
            mappro.file.openInfo(this);
        };

        this.contextMenuLine = function (point) {
            var div = mappro.html.segment_cm_line;
            div.find('.ibs-cm-line-action').data({
                segment: this,
                point: point.index
            });
            mappro.setMenuXY(div, point.latLng);
            div.show();
        };
        this.contextMenuLineEdit = function (index) {
            var div = mappro.html.segment_cm_edit;
            div.find('.ibs-cm-edit-action').data({
                'segment': this,
                'index': index
            });
            mappro.setMenuXY(div, this.line.getPath().getAt(index));
            div.show();
        };
        this.contextMenuMarker = function (latlng) {
            var div = mappro.html.segment_cm_marker;
            div.find('.ibs-cm-marker-action').data({
                segment: this
            });
            mappro.setMenuXY(div, latlng);
            div.show();
        };
        this.removePoint = function (index) {
            if (this.points.length) {
                var marker = this.points[index];
                var path = this.line.getPath();
                if (path.getLength() > 1) {
                    this.save();
                    marker.setMap(null);
                    if (marker.midpoint !== null) {
                        marker.midpoint.setMap(null);
                    }
                    path.removeAt(index);
                    this.points.splice(index, 1);
                    for (var i in this.points) {
                        this.points[i].index = parseInt(i);
                    }
                    if (index < this.points.length && index > 0) {
                        var pointA = this.points[index - 1].getPosition();
                        var pointB = this.points[index].getPosition();
                        this.points[index].midmarker.setPosition(midPoint(pointA, pointB));
                    }
                    this.refresh();
                    this.parent.setDirty(true);
                }
            }

        };
        this.getDirRenderOptions = function (options) {
            var opt = {
                draggable: true, //boolean	allows the user to drag and modify the paths.
                map: null, //Map	Map on which to display the directions.
                markerOptions: {      //MarkerOptions	Options for the markers. All markers rendered by the DirectionsRenderer will use these options.

                },
                polylineOptions: {//	PolylineOptions	Options for the polylines.
                    strokeColor: '#ff0000',
                    strokeWeight: 3,
                    strokeOpacity: 1.0
                },
                preserveViewport: false, //boolean	By default, the input map is centered and zoomed to the bounding box of this set of directions. If this option is set to true, the viewport is left unchanged, unless the map's center and zoom were never set.
                suppressBicyclingLayer: false, //boolean	Suppress the rendering of the BicyclingLayer when bicycling directions are requested.
                suppressInfoWindows: true, //boolean	Suppress the rendering of info windows.
                suppressMarkers: false, //boolean	Suppress the rendering of markers.
                suppressPolylines: false       //boolean	Suppress the rendering of polylines.
            };
            for (var attr in options) {
                opt[attr] = options[attr];
            }
            return opt;
        };
        this.cuesheetKill = function () {
            if (this.directionsRenderer && this.directionsRenderer.getMap()) {
                this.directionsRenderer.setMap(null);
            }
        };
        this.metersToStr = function (meters, metric) {
            return {
                'd': Math.round10(metric ? (meters / 1000) : (meters / 1609.344), -1), //kilometers and miles
                'm': metric ? 'km' : 'mi',
            };
        }

        this.cueLine = function (params) {
            var acc = this.metersToStr(params.distance, params.metric);
            return '<div><label>' + acc.d + '  ' + acc.m + ' :: </label><span>' + params.instructions + '</span></div>';
        };
        this.cuesheetDirections = function () {
            var segment = this;
            if (this.directionsRenderer && this.directionsRenderer.getMap()) {
                this.cuesheetKill();
                return;
            }
            if (!this.directionsService) {
                this.directionsService = new google.maps.DirectionsService();
            }
            if (!this.directionsRenderer) {
                this.directionsRenderer = new google.maps.DirectionsRenderer(this.getDirRenderOptions({}));
                this.directionsRenderer.setPanel(mappro.html.cuesheet_dialog.find('.ibs-cuesheet')[0]);
                google.maps.event.addListener(this.directionsRenderer, "directions_changed", function () {
                });
            }
            var waypoints = [];
            var path = this.line.getPath();
            var first = path.getAt(0);
            var last = path.getAt(path.getLength() - 1);
            options = {
                origin: first,
                destination: last,
                travelMode: mappro.options.travelMode,
                transitOptions: {},
                unitSystem: mappro.options.metric ? google.maps.UnitSystem.METRIC : google.maps.UnitSystem.IMPERIAL,
                durationInTraffic: false,
                waypoints: waypoints,
                optimizeWaypoints: false,
                provideRouteAlternatives: false,
                avoidHighways: mappro.options.avoidHighways,
                avoidTolls: true
            }
            this.cuesheetDialog();
            this.directionsService.route(options, function (response, status) {
                if (status === google.maps.DirectionsStatus.OK) {
                    segment.directionsRenderer.setMap(mappro.googlemap);
                    segment.directionsRenderer.setDirections(response);
                } else {
                    segment.options.map.alert(status);
                }
            });
        };
        this.findWaypoints = function () {
            var waypoints = [];
            for (var pid in mappro.file.placemarks) {
                var wp = mappro.file.placemarks[pid];
                if (wp.options.symbol === 'Waypoint') {
                    var pos = wp.options.position;
                    var points = this.line.getPath().getArray();
                    for (var i = 0; i < points.length; i++) {
                        if (pos.equals(points[i])) {
                            waypoints.push({'pid': pid, 'latlng': pos, 'index': i});
                            break;
                        }
                    }
                }
            }
            waypoints.sort(function (a, b) {
                return a.index - b.index; //use path point index to order waypoints
            });
            return waypoints;
        };
        this.copyWaypoints = function (clipboard) {
            var waypoints = this.findWaypoints();
            for (var i = 0; i < waypoints.length; i++) {
                clipboard.push(mappro.file.placemarks[waypoints[i].pid].copy());
            }
        };
        this.removeWaypoints = function () {
            var waypoints = this.findWaypoints();
            for (var i = 0; i < waypoints.length; i++) {
                mappro.file.placemarks[waypoints[i].pid].remove();
            }
        };
        this.cueUpdateWaypoints = function (route) {
            var options = {
                url: '',
                symbol: 'Waypoint',
                name: null,
                desc: null,
                position: null,
                visible: true
            };
            var acc_distance = 0;
            var leg = null;
            var step_next = 0;
            for (var leg_index = 0; leg_index < route.legs.length; leg_index++) {
                leg = route.legs[leg_index];
                options.position = this.nearestPoint(leg.start_location).latLng;
                options.desc = 'Start - ' + leg.start_address;
                options.name = this.options.sid + ' 1000';
                mappro.file.addPlacemark(options);
                var params = {type: 'waypoint'};
                for (var step_index = 0; step_index < leg.steps.length; step_index++) {
                    var step = leg.steps[step_index];
                    params.distance = acc_distance;
                    params.step = step_next;
                    params.instructions = step.instructions;
                    options.desc = this.cueLine(params);
                    options.position = this.nearestPoint(step.start_location).latLng;
                    options.name = this.options.sid + ' ' + (step_index + 1001);
                    mappro.file.addPlacemark(options);
                    if (step.distance) {
                        step_next = step.distance.value;
                        acc_distance += step.distance.value;
                    }
                }
                params.distance = acc_distance;
                params.step = step_next;
                params.instructions = leg.end_address;
                options.desc = this.cueLine(params);
                options.position = this.nearestPoint(leg.end_location).latLng;
                options.name = this.options.sid + ' ' + (step_index + 1002);
                mappro.file.addPlacemark(options);
            }
        };
        this.cueUpdatePath = function () {
            if (this.directionsRenderer && this.directionsRenderer.getMap()) {
                this.removeWaypoints();
                var route = this.directionsRenderer.getDirections().routes[0];
                this.line.setPath(route.overview_path);
                this.cueUpdateWaypoints(route);
                this.options.cuesheet = mappro.html.cuesheet_dialog.find('.ibs-cuesheet').html();
                mappro.file.setDirty(true);
                this.refresh();
            }
        };
        this.edit = function () {
            this.segmentDialog();
        };
        this.segmentDialog = function () {
            var me = this;
            var dialog = mappro.html.segment_dialog;
            var config = mappro.getCkeditorConfig();
            dialog.find('.ibs-segment-dialog-sid').val(this.options.sid);
            dialog.find('.ibs-segment-dialog-desc').val(this.options.desc);
            dialog.find('.ibs-segment-dialog-name').val(this.options.name);
            dialog.colorpicker('stroke', this.options.stroke);
            dialog.find('.ibs-segment-dialog-stats').html(' miles=' + mappro.convertMeters2(this.distance()).toString() + ' points: ' + this.line.getPath().getLength());
            setCurrentColor(dialog);
            dialog.dialog({
                autoOpen: true,
                width: 600,
                modal: true,
                buttons: {
                    Update: $.proxy(function () {
                        var obj = dialog.find('.ibs-colorpicker-trigger');
                        this.options.stroke = dialog.colorpicker('stroke');
                        this.options.name = dialog.find('.ibs-segment-dialog-name').val();
                        this.options.desc = dialog.find('.ibs-segment-dialog-desc').val();
                        this.line.setOptions({
                            strokeColor: this.options.stroke.color,
                            strokeOpacity: this.options.stroke.opacity,
                            strokeWeight: this.options.stroke.weight
                        });
                        mappro.file.setDirty(true);
                        mappro.html.segment_list.find(this.segmentItem).html(this.options.name);
                        dialog.dialog('close');
                    }, this),
                    Close: function () {
                        $(this).dialog('close');
                    }
                },
                open: function () {
                    dialog.find('.ibs-segment-dialog-desc').ckeditor(config);
                    dialog.find('.ibs-segment-dialog-desc').ckeditor().resize('100%', '100%', false);
                    var editor = dialog.find('.ibs-segment-dialog-desc').ckeditor().editor;
                    editor.mappro = mappro;
                },
                close: function () {
                    dialog.find('.ibs-segment-dialog-desc').ckeditorGet().destroy();
                    $(this).dialog('destroy');
                },
                resize: function (ev) {
                    dialog.find('.ibs-segment-dialog-desc').ckeditor().resize('100%', '100%', false);
                }
            });
        };
        this.cuesheetDialog = function () {
            mappro.html.cuesheet_dialog.find('.ibs-cuesheet').empty();
            var dd = mappro.html.cuesheet_dialog;
            dd.dialog({
                autoOpen: true,
                draggable: true,
                position: {
                    my: "left top",
                    at: "left top",
                    of: mappro.html.page.find('.ibs-list')
                },
                width: 400,
                height: 400,
                modal: false,
                buttons: {
                    Print: function () {
                        dd.find('.ibs-cuesheet').print();
                    },
                    Finish: $.proxy(function () {
                        this.cueUpdatePath();
                        dd.dialog('close');
                    }, this),
                    Cancel: $.proxy(function () {
                        dd.dialog('close');
                    }, this)
                },
                open: function () {
                    this.isActive = false;
                },
                close: $.proxy(function () {
                    this.isActive = true;
                    if (this.directionsRenderer && this.directionsRenderer.getMap()) {
                        this.directionsRenderer.setMap(null);
                    }
                    this.cuesheetKill();
                }, this)
            });
        }
        this.setSegmentItem = function () {
            var rel = this.options.sid;
            var d = $('<div>').html(this.options.desc).contents().filter(function () {
                return !!$.trim(this.innerHTML || this.data);
            })
                    .first();
            var label = '<label>' + this.options.name + '</label>' + '<div>' + $(d).text().slice(0, 300) + '</div>';
            var item = $('<li>').addClass('ibs-segment-item').attr({'rel': rel})
                    .append($('<img>').addClass("ibs-segment-item-image").css({height: '18px'}).attr({'rel': rel, 'alt': "image", 'src': mappro.options.args.url + 'image/line.png'}))
                    .append($('<a>').addClass('ibs-segment-item-name name').attr({'rel': rel, 'href': "#", 'title': ""}).html(label)
                            );
            mappro.html.segment_list.append($(item));
        };
        this.setSegmentItem();
        this.line = new google.maps.Polyline(this.lineOptions());
        this.line.setMap(mappro.googlemap);
        this.line.segment = this;
        this.marker = new google.maps.Marker({
            position: this.options.path[0],
            map: mappro.googlemap,
            title: this.options.name,
            icon: mappro.imageSegmentEnd,
            segment: this
        });
        this.distanceMarker = new google.maps.Marker({
            position: this.options.path[0],
            map: mappro.googlemap,
            visible: false,
            icon: mappro.imageDistancePointer
        });
        google.maps.event.addListener(this.marker, 'click', $.proxy(function (event) {
            if (this.isActive) {
                mappro.html.list.find(this.segmentItem).trigger('click');
            }
        }, this));
        google.maps.event.addListener(this.line, 'mouseover', $.proxy(function (event) {
            if (!this.editing && this.isActive && mappro.options.distance) {
                if (!mappro.html.distance_info.is(':visible')) {
                    var nearest = this.nearestPoint(event.latLng);
                    var d = nearest.distance;
                    var distance = mappro.convertMeters2(d) + mappro.measure2();
                    this.distanceMarker.setPosition(nearest.latLng);
                    this.distanceMarker.index = nearest.index;
                    this.distanceMarker.setVisible(true);
                    this.distanceMarker.setTitle('');
                    mappro.html.distance_info.text(distance);
                    mappro.setMenuXY(mappro.html.distance_info, event.latLng, 0, -40);
                    mappro.html.distance_info.show();
                }
            }
        }, this));
        google.maps.event.addListener(this.line, 'mouseout', $.proxy(function (event) {
            var distance_info = mappro.html.distance_info;
            if (this.isActive) {
                var iid = setInterval($.proxy(function () {
                    clearInterval(iid);
                    distance_info.hide();
                    this.distanceMarker.setVisible(false);
                }, this), 1000)
            }
        }, this));
        google.maps.event.addListener(this.marker, 'mouseover', $.proxy(function (event) {
            if (this.isActive)
                this.line.setOptions({
                    strokeWeight: this.options.stroke.weight + 4
                });
        }, this));
        google.maps.event.addListener(this.marker, 'mouseout', $.proxy(function (event) {
            if (this.isActive) {
                this.line.setOptions({
                    strokeWeight: this.options.stroke.weight
                });
            }
        }, this));
        google.maps.event.addListener(this.marker, 'rightclick', $.proxy(function (event) {
            if (this.isActive) {
                if (mappro.options.args.admin && !mappro.html.route_menu.is(':visible')) {
                    var menu = mappro.html.route_menu;
                    mappro.setMenuXY(menu, this.marker.getPosition());
                    menu.find('.ibs-route-item').attr('rel', this.options.sid);
                    menu.show();
                }
            }
        }, this));

        google.maps.event.addListener(this.line, "click", $.proxy(function (event) { //rightclick
            if (this.isActive) {
                var nearest = this.nearestPoint(event.latLng);
                this.distanceMarker.setPosition(nearest.latLng);
                this.contextMenuLine(nearest);
            }
        }, this));


        this.refresh();

        Segment.prototype.cuesheetWaypoints = function () {
            this.cuesheetDialog();
            var path = this.line.getPath();
            var params = {
                metric: mappro.options.metric,
                header: 'Accumaltive',
                type: 'start',
                step: 0,
                distance: 0
            };
            var waypoints = this.findWaypoints();
            var list = $('<table>');
            for (var i = 0; i < waypoints.length; i++) {
                params.instructions = mappro.file.placemarks[waypoints[i].pid].options.desc;
                params.distance += params.step;
                params.step = 0;
                var a = waypoints[i].index;
                if (i < waypoints.length - 1) {
                    var b = params.instructions.indexOf(':') !== -1 ? ':' : null;
                    b = params.instructions.indexOf('::') !== -1 ? '::' : b;
                    if (b) {
                        var parts = params.instructions.split(b);
                        var line = '<tr><td style="width:100px; text-wrap:normal; text-align:right">' + parts[0] + '<td><td style="padding:5px; width:400px; text-wrap:normal;">' + parts[1] + '</td></tr>';
                        list.append(line);
                    } else {
                        var b = waypoints[i + 1].index;
                        while (1 === 1) {
                            if (a === b || a === path.length)
                                break;
                            try {
                                params.step += distanceFrom(path.getAt(a), path.getAt(a + 1));
                            } catch (err) {
                                params.step = 0;
                            }
                            a++;
                        }
                        if (params.instructions !== '') {
                            var acc = this.metersToStr(params.distance, params.metric);
                            var line = '<tr><td style="text-align:right">' + acc.d + '  ' + acc.m + '<td><td style="padding:5px; width:400px; text-wrap:normal;">' + params.instructions + '</td></tr>';
                            list.append(line);
                        }
                    }
                } else {
                    params.type = 'end';
                }

                params.type = 'step';
            }
            mappro.html.cuesheet_dialog.find('.ibs-cuesheet').empty();
            mappro.html.cuesheet_dialog.find('.ibs-cuesheet')
                    .append(list)
                    .prepend($('<div>').text(this.options.name));
            ;
        };
    }
})(jQuery);