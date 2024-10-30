function File(mappro, args) {
    this.run(mappro, args);
}

(function ($) {
    File.prototype.run = function (mappro, args) {
        this.options = {
            filename: '(%un-named%).kml',
            name: null,
            desc: null,
            stroke: {color: '#000fff', weight: 5, opacity: 0.3},
            gpx: {routes: false, tracks: true, waypoints: true, placemarks: true},
            import_dir: null,
            import_files: []
        };
        for (var attr in args) {
            if (typeof args[attr] !== 'undefined') {
                this.options[attr] = args[attr];
            }
        }
        this.fileCount = 0;
        this.markerCluster = [];
        this.markerManager = null;
        this.visiblePlacemark = false;
        this.visibleWaypoint = false;
        this.dir = '/';
        this.filename = this.options.filename;
        this.options.name = this.filename;
        mappro.html.segment_list.sortable();
        mappro.html.segment_list.disableSelection();
        mappro.html.placemark_list.sortable();
        mappro.html.placemark_list.disableSelection();
        mappro.html.waypoint_list.sortable();
        mappro.html.waypoint_list.disableSelection();
        this.segments = {};
        this.placemarks = {};
        this.segmentId = 1000;
        this.placemarkId = 1000;
        this.fileId = 1000;
        this.removeFile = false;
        this.pend = null;
        this.included = [];
        this.newComponents = null;
        this.setDirty = function (bool) {
            this.dirty = bool;
        };
        this.checkMapname = function (filename, default_ext) {
            if (typeof filename === 'string' && filename.length > 3) {
                var ext = getExtension(filename);
                var name = getFilename(filename);
                if (/^[\w\s-()]{3,50}$/.test(name)) {
                    if (ext !== 'kml' || ext !== 'kmz' || ext !== 'gpx') {
                        ext = default_ext;
                    }
                    return name + '.' + ext;
                }
            }
            return false;
        };
        this.listSegments = function () {
            var list = [];
            var items = mappro.html.segment_list.find('li a.ibs-segment-item-name');
            $(items).each(function (index, item) {
                var rel = $(item).attr('rel');
                var fid = mappro.file.segments[rel].options.fid;
                if ($.inArray(fid, mappro.file.included) !== -1) {
                    list.push(rel);
                }
            });
            return list;
        };
        this.listPlacemarks = function () {
            var list = [];
            var items = mappro.html.placemark_list.find('li a.ibs-placemark-item-name');
            $(items).each(function (index, item) {
                var rel = $(item).attr('rel');
                var fid = mappro.file.placemarks[rel].options.fid;
                if ($.inArray(fid, mappro.file.included) !== -1) {
                    list.push(rel);
                }
            });
            var items = mappro.html.waypoint_list.find('li a.ibs-placemark-item-name');
            $(items).each(function (index, item) {
                var rel = $(item).attr('rel');
                var fid = mappro.file.placemarks[rel].options.fid;
                if ($.inArray(fid, mappro.file.included) !== -1) {
                    list.push(rel);
                }
            });
            return list;
        };
        this.sortSegments = function (event) {
            var latlng = event.latLng;
            var items = [];
            for (var ss in this.segments) {
                var item = {
                    distance: distanceFrom(latlng, this.segments[ss].marker.getPosition()),
                    sid: ss
                };
                items.push(item);
            }
            items.sort(function (a, b) {
                if (a.distance < b.distance) {
                    return -1;
                }
                if (a.distance > b.distance) {
                    return 1;
                }
                return 0;
            });
            var last = null;
            for (var i in items) {
                if (last) {
                    var target = '.' + last;
                    var subject = '.' + items[i].sid;
                    $(subject).insertAfter(target);
                }
                last = items[i].sid;
            }
        };
        this.sortPlacemarks = function (event) {
            var latlng = event.latLng;
            var items = [];
            for (var pp in this.placemarks) {
                var item = {
                    distance: distanceFrom(latlng, this.placemarks[pp].marker.getPosition()),
                    pid: pp
                };
                items.push(item);
            }
            items.sort(function (a, b) {
                if (a.distance < b.distance) {
                    return -1;
                }
                if (a.distance > b.distance) {
                    return 1;
                }
                return 0;
            });
            var last = null;
            for (var i in items) {
                if (last) {
                    var target = '.' + last;
                    var subject = '.' + items[i].pid;
                    $(subject).insertAfter(target);
                }
                last = items[i].pid;
            }
        };
        this._orderPlacemark = function (pid) {
            var d = null;
            var p = null;
            for (var pp in this.placemarks) {
                if (pp === pid) {
                    continue;
                }
                var dd = distanceFrom(this.placemarks[pid].marker.getPosition(), this.placemarks[pp].marker.getPosition());
                if (!d || dd < d) {
                    d = dd;
                    p = pp;
                }
            }
            if (p) {
                var target = '#' + p;
                var subject = '#' + pid;
                $(subject).insertAfter(target);
            }
        };
        this._add = function () {
            if (!this.newComponents) {
                this.fileId++;
                this.newComponents = this.fileId;
                this.setFileItem('(%new%).kml');
            }
        }
        this._addSegment = function (options) {
            var defaults = {
                fid: null,
                sid: null,
                path: [],
                stroke: {color: '#000fff', weight: 5, opacity: 0.3},
                name: null,
                desc: null
            };
            $.extend(defaults, options);
            options = defaults;
            for (var seg in this.segments) {
                if (this.segments[seg].options.name === options.name) {
                    this.segments[seg].line.setPath(options.path);
                    return;
                }
            }

            this.segmentId++;
            options.sid = "S" + this.segmentId.toString();
            if (!options.fid) {
                options.fid = 'F' + this.fileId;
            }
            if (!options.name) {
                options.name = options.sid + ' name';
            }
            this.segments[options.sid] = new Segment(mappro, options);
            return options.sid;
        };
        this.addSegment = function (options) {
            this._add();
            this.segments[this._addSegment(options)].extend();
            this.setDirty(true);
        };
        this._addPlacemark = function (options) {
            var defaults = {
                fid: null,
                pid: null,
                name: null,
                desc: null,
                url: null,
                symbol: null,
                position: null,
                visible: true
            };
            $.extend(defaults, options);
            options = defaults;
            this.placemarkId++;
            options.pid = "P" + this.placemarkId.toString();
            if (!options.fid) {
                options.fid = 'F' + this.fileId;
            }
            if (!options.name) {
                options.name = options.pid + ' name';
            }
            this.placemarks[options.pid] = new Placemark(mappro, options);
            if (this.placemarks[options.pid].options.symbol === 'Waypoint') {
                var show = $('#dropdown-controls-' + mappro.options.args.sn).find('.control-waypoints').is(':checked');
                this.placemarks[options.pid].marker.setVisible(show);
            } else {
                show = $('#dropdown-controls-' + mappro.options.args.sn).find('.control-placemarks').is(':checked');
                this.placemarks[options.pid].marker.setVisible(show);
            }
            return options.pid;
        };

        this.addPlacemark = function (options) {
            this._add();
            var pid = this._addPlacemark(options);
            this.placemarks[pid].marker.setVisible(true);
            this.setDirty(true);
            this._orderPlacemark(pid);
            return pid;
        };
        this.click = function (event) {
            if (this.pend) {
                switch (this.pend) {
                    case 'sort':
                        this.sortPlacemarks(event);
                        this.sortSegments(event);
                        break;
                    case  'placemark':
                        this.addPlacemark({
                            position: event.latLng
                        });
                        this.pendReset();
                        break;
                    case 'segment' :
                        this.addSegment({
                            path: [event.latLng],
                            strokeColor: this.options.stroke
                        });
                        break;
                }
                this.pend = null;
            }
        };

        this.pendReset = function () {
            mappro.html.pend_info.hide();
            for (var sid in this.segments) {
                this.segments[sid].pend = '';
            }
            this.pend = null;
        };
        this.pendSegment = function () {
            if (this.pend === 'segment') {
                mappro.setClick();
                mappro.html.pend_info.hide();
            } else {
                mappro.setClick({
                    sid: null,
                    pid: null
                });
                this.pend = 'segment';
                mappro.showPend(mappro.googlemap.getCenter());
            }
        };
        this.pendSort = function () {
            mappro.setClick({
                sid: null,
                pid: null
            });
            this.pend = 'sort';
            mappro.showPend(mappro.googlemap.getCenter());
        };
        this.pendPlacemark = function () {
            if (this.pend === 'placemark') {
                mappro.setClick();
            } else {
                mappro.setClick({
                    sid: null,
                    pid: null

                });
                this.pend = 'placemark';
                mappro.showPend(mappro.googlemap.getCenter());
            }
        };
        this.placemarkVisible = function (visible) {
            this.visiblePlacemark = visible;
            for (var pid in this.placemarks) {
                var wp = this.placemarks[pid];
                if (wp.options.symbol === 'Waypoint') {
                    wp.marker.setVisible($('#dropdown-controls-' + mappro.options.args.sn).find('.control-waypoints').is(':checked'));
                } else {
                    wp.marker.setVisible(visible);
                }
            }
        };
        this.waypointVisible = function (visible) {
            this.visibleWaypoint = visible;
            for (var pid in this.placemarks) {
                var wp = this.placemarks[pid];
                if (wp.options.symbol === 'Waypoint') {
                    wp.marker.setVisible(visible);
                }
            }
        };
        this.filteredUrl = null;
        this.placemarkFilter = function (item) {
            if (this.filteredUrl === null) {
                this.filteredUrl = $(item).attr('src');
                for (var i in this.placemarks) {
                    var url = this.placemarks[i].marker.icon.url;
                    if (url === this.filteredUrl) {
                        this.placemarks[i].marker.setVisible(true);
                    } else {
                        this.placemarks[i].marker.setVisible(false);
                    }
                }
            } else {
                if (this.filteredUrl === $(item).attr('src')) {
                    this.filteredUrl = null;
                    this.placemarkVisible(this.visiblePlacemark)
                } else {
                    this.filteredUrl = null;
                    this.placemarkFilter(item);
                }

            }
        };
        this.flip = function () {
            for (var sid in this.segments) {
                this.segments[sid].flip();
            }
        };
        this.distance = function () {
            var distance = 0;
            for (var sid in this.segments) {
                distance += this.segments[sid].distance();
            }
            return distance;
        };
        this.removePlacemark = function (pid) {
            if (!this.removeFile) {
                delete this.placemarks[pid];
                mappro.html.waypoint_list.find('.ibs-placemark-item-' + pid).remove();
                mappro.html.placemark_list.find('.ibs-placemark-item-' + pid).remove();
                this.setDirty(true);
            }
        };
        this.removePlacemarks = function () {
            for (var pid in this.placemarks) {
                this.placemarks[pid].remove();
            }
        };
        this.removeSegment = function (sid) {
            if (!this.removeFile) {
                delete this.segments[sid];
                this.setDirty(true);
                mappro.reset();
            }
        };
        this.removeSegments = function () {
            for (var sid in this.segments) {
                this.segments[sid].remove();
            }
        };
        this.remove = function () {
            this.removeFile = true;
            this.removePlacemarks();
            this.removeSegments();
            mappro.html.file_list.empty();
            if (this.markerManager) {
                this.markerManager.clearMarkers();
            }
            mappro.removeFile();
        };
        this.getBounds = function (bounds) {
            for (var sid in this.segments) {
                this.segments[sid].getBounds(bounds);
            }
            for (var pid in this.placemarks) {
                bounds.extend(this.placemarks[pid].marker.getPosition());
            }
        };
        this.refresh = function () {
            for (var sid in this.segments) {
                this.segments[sid].refresh();
            }
        };
        this.isPlacemark = function (latlng) {
            for (var pid in this.placemarks) {
                if (this.placemarks[pid].options.position.equals(latlng))
                    return pid;
            }
            return false;
        };
        this.append = function (segment) {
            if (Object.keys(this.segments).length > 1) {
                var target = null;
                var path = segment.line.getPath();
                var latlng = path.getAt(path.getLength() - 1);
                var d = 0;
                var b = 0;
                for (var sid in this.segments) {
                    if (sid === segment.sid) {
                        continue;
                    }
                    var test_path = this.segments[sid].line.getPath();
                    var test_latlng = test_path.getAt(0);
                    var b = distanceFrom(latlng, test_latlng);
                    if (target === null || d >= b) {
                        target = this.segments[sid];
                        d = b;
                    }
                }
                if (target) {
                    for (var i = path.getLength() - 1; i >= 0; i--) {
                        var point = path.getAt(i);
                        target.line.getPath().insertAt(0, point);
                    }
                    segment.remove();
                    target.refresh();
                } else {
                    alert('cannot append.')
                }
            }
        };
        this.focus = function () {
            var bounds = new google.maps.LatLngBounds();
            this.getBounds(bounds);
            if(bounds.isEmpty()){
                return;
            }
            mappro.googlemap.fitBounds(bounds);
        };
        this.getXml = function () {
            if (getExtension(this.filename) === 'gpx') {
                return mappro.gpx.writer(this);
            } else {
                return mappro.kml.writer(this);
            }
        };
        this.selectPlacemark = function (item, e) {
            var has = $(item).hasClass('selected');
            mappro.html.placemark_list.find('.ibs-placemark-item-name').removeClass('selected');
            mappro.html.waypoint_list.find('.ibs-placemark-item-name').removeClass('selected');
            if (false === has) {
                $(item).addClass('selected');
                $(item).parent().ScrollTo({onlyIfOutside: true});
                if ($(item).parent().parent().hasClass('ibs-placemark-list')) {
                    mappro.html.list.find('a[rel="list-poi"]').click();
                } else {
                    mappro.html.list.find('a[rel="list-wps"]').click();
                }
            }

        };
        this.selectSegmentCheck = function () {
            if (mappro.html.segment_list.find('.ibs-segment-item-name.selected').length > 0) {
                return true;
            } else {
                return false;
            }
        };
        this.selectSegment = function (item) {
            var has = $(item).hasClass('selected');
            mappro.html.segment_list.find('.ibs-segment-item-name').removeClass('selected');
            mappro.html.segment_list.find('.ibs-ct-list-div').hide();
            if (false === has) {
                $(item).addClass('selected');
                $(item).parent().find('.ibs-ct-list-div').show();
                $(item).parent().ScrollTo({onlyIfOutside: true});
                mappro.html.list.find('a[rel="list-seg"]').click();
            } else {
            }
        };
        this.manageMarkers = function () {
            if (this.markerManager) {
                this.markerManager.clearMarkers();
            }
            if (mappro.options.markerManager.set) {
                this.markerCluster = [];
                for (var pid in this.placemarks) {
                    this.markerCluster.push(this.placemarks[pid].marker);
                }
                this.markerManager = new MarkerClusterer(mappro.googlemap, this.markerCluster,
                        {
                            maxZoom: mappro.options.markerManager.maxZoom,
                            gridSize: mappro.options.gridsize
                        });
            } else {
                for (var pid in this.placemarks) {
                    this.placemarks[pid].marker.setMap(mappro.googlemap)
                }
            }
        }
        this.getOptions = function (dialog) {
            switch (getExtension(this.filename)) {
                case 'kml':
                    dialog.find('.ibs-file-kml').attr('checked', true);
                    break;
                case 'kmz':
                    dialog.find('.ibs-file-kmz').attr('checked', true);
                    break;
                case 'gpx':
                    dialog.find('.ibs-file-gpx').attr('checked', true);
                    break;
                default:
                    dialog.find('.ibs-file-kml').attr('checked', true);
            }
            dialog.find('.ibs-gpx_routes').attr('checked', this.options.gpx.routes);
            dialog.find('.ibs-gpx_tgracks').attr('checked', this.options.gpx.tracks);
            dialog.find('.ibs-gpx_waypoints').attr('checked', this.options.gpx.waypoints);
            dialog.find('.ibs-gpx_placemarks').attr('checked', this.options.gpx.placemarks);
            dialog.find('.ibs-file-list-div').empty()
                    .append(mappro.html.file_list.clone());
            dialog.find('.ibs-file-item-checkbox');
        }
        this.setOptions = function (dialog) {
            this.options.gpx.routes = dialog.find('.ibs-gpx_routes').is(':checked');
            this.options.gpx.tracks = dialog.find('.ibs-gpx_tracks').is(':checked');
            this.options.gpx.waypoints = dialog.find('.ibs-gpx_waypoints').is(':checked');
            this.options.gpx.placemarks = dialog.find('.ibs-gpx_placemarks').is(':checked');
            this.included = [];
            dialog.find('.ibs-file-item-checkbox').each(function (index, item) {
                if ($(item).is(':checked')) {
                    mappro.file.included.push($(item).attr('rel'));
                }

            })
        }
        this.saveDialog = function () {
            var dialog = mappro.html.save_dialog;
            var config = mappro.getCkeditorConfig();
            this.getOptions(dialog);
            dialog.find('.ibs-save-name').val(dialog.find('.ibs-name-of-file').first().text());
            dialog.find('.ibs-save-dir').val(dialog.find('.ibs-name-of-file').first().attr('rel'));
            dialog.find('.ibs-save-desc').val(this.options.desc);
            dialog.dialog({
                autoOpen: true,
                modal: true,
                width: 'auto',
                buttons: {
                    Save: $.proxy(function () {
                        if (this.checkMapname(dialog.find('.ibs-save-name').val())) {
                            this.options.desc = dialog.find('.ibs-save-desc').val();
                            this.dir = dialog.find('.ibs-save-dir').val();
                            this.filename = dialog.find('.ibs-save-name').val();
                            this.setOptions(dialog);
                            dialog.dialog('close');
                            var data = this.getXml();
                            if (data) {
                                $.post(mappro.options.args.ajax, {
                                    action: 'ibs_mappro_index',
                                    func: 'savexml',
                                    nonce: mappro.options.args.nonce,
                                    data: encodeURIComponent(data),
                                    filename: mappro.options.args.libpath + 'maps/' + this.dir + this.filename
                                })
                                        .done(function (data, status) {
                                            spin(false);
                                            if (status === 'success') {
                                                mappro.file.setDirty(false);
                                                mappro.notice('Save ' + mappro.file.filename + ' completed.');
                                            } else {
                                                mappro.alert('Save ' + mappro.file.filename + ' failed.');
                                            }
                                        });
                            } else {
                                mappro.alert('Error creating XML document.');
                            }
                        } else {
                            mappro.alert('invalid filename.\n Only "A-Z a-z 0-9 _ - space" characters are allowed\n 3 - 50 characters long.');
                        }

                    }, this),
                    Cancel: function () {
                        $(this).dialog('close');
                    }
                },
                open: function () {
                    dialog.find('.ibs-mapfolder-browser').fileTree({
                        root: mappro.options.args.libpath + 'maps/',
                        script: mappro.options.args.ajax + '?action=ibs_mappro_index&func=folders&type=dir&nonce=' + mappro.options.args.nonce + '',
                        folderEvent: 'click',
                        expandSpeed: 0,
                        collapseSpeed: 0,
                        multiFolder: false
                    }, function (file) {
                        alert(file);
                    }, function (dir) {
                        var arr = dir.split('/maps/');
                        dialog.find('.ibs-save-dir').val(arr[1]).trigger('change');
                    });
                    dialog.find('.ibs-save-desc').ckeditor(config).resize('100%', '100%', false);
                    dialog.on('click', '.ibs-name-of-file', {}, function () {
                        dialog.find('.ibs-save-name').val($(this).text());
                    });

                },
                close: function () {
                    dialog.find('.ibs-save-desc').ckeditorGet().destroy();
                    $(this).dialog('destroy');
                },
                resize: function (ev) {
                    dialog.find('.ibs-save-desc').ckeditor().resize('100%', '100%', false);
                }
            });
        };
        this.downloadDialog = function () {
            var dialog = mappro.html.download_dialog;
            var config = mappro.getCkeditorConfig();
            this.getOptions(dialog);
            dialog.find('.ibs-save-name').val(dialog.find('.ibs-file-list').first('.ibs-name-of-file').text());
            dialog.find('.ibs-save-desc').val(this.options.desc);
            dialog.dialog({
                autoOpen: true,
                modal: true,
                width: 'auto',
                buttons: {
                    Save: $.proxy(function () {
                        if (this.checkMapname(dialog.find('.ibs-save-name').val())) {
                            this.options.desc = dialog.find('.ibs-save-desc').val();
                            this.dir = dialog.find('.ibs-save-dir').val();
                            this.filename = dialog.find('.ibs-save-name').val();
                            this.setOptions(dialog);
                            dialog.dialog('close');
                            var data = this.getXml();
                            if (data) {
                                $.post(mappro.options.args.ajax, {
                                    action: 'ibs_mappro_index',
                                    func: 'savexml',
                                    nonce: mappro.options.args.nonce,
                                    data: encodeURIComponent(data),
                                    filename: mappro.options.args.libpath + 'downloads/' + this.filename
                                })
                                        .done(function (data, status) {
                                            spin(false);
                                            if (status === 'success') {
                                                mappro.file.setDirty(false);
                                                var data_url = $.trim(decodeURIComponent(data));
                                                var file_url = mappro.options.args.ajax + '?action=ibs_mappro_index&func=download&file=' + data_url + '&nonce=' + mappro.options.args.nonce;
                                                $.fileDownload(file_url, {
                                                    successCallback: $.proxy(function (url) {
                                                        mappro.notice('Download ' + getFilename(url) + ' completed.');
                                                        $.post(mappro.options.args.ajax, {
                                                            action: 'ibs_mappro_index',
                                                            func: 'remove',
                                                            nonce: mappro.options.args.nonce,
                                                            type: 'file',
                                                            filename: data_url.replace(mappro.options.args.liburl, mappro.options.args.libpath),
                                                            cache: false
                                                        });
                                                    }, this),
                                                    failCallback: function (html, url) {
                                                        mappro.alert('File download failed. ' + this.filename);
                                                    }
                                                });
                                            } else {
                                                mappro.alert('Download ' + this.filename + ' failed.');
                                            }
                                        });

                            } else {
                                mappro.alert('Error creating XML document.');
                            }
                        } else {
                            mappro.alert('invalid filename.\n Only "A-Z a-z 0-9 _ - space" characters are allowed\n 3 - 50 characters long.');
                        }

                    }, this),
                    Cancel: function () {
                        $(this).dialog('close');
                    }
                },
                open: function () {
                    dialog.find('.ibs-save-desc').ckeditor(config).resize('100%', '100%', false);
                },
                close: function () {
                    dialog.find('.ibs-save-desc').ckeditorGet().destroy();
                    dialog.dialog('destroy');
                },
                resize: function (ev) {
                    dialog.find('.ibs-save-desc').ckeditor().resize('100%', '100%', false);
                }
            });
        };
        this.fileDialog = function () {
            var dialog = mappro.html.file_dialog;
            this.getOptions(dialog);
            mappro.stats(dialog.find('.ibs-stat-list'), this.distance(), Object.keys(this.segments).length, Object.keys(this.placemarks).length);
            dialog.find('.ibs-file-name').val(this.filename);
            dialog.find('.ibs-file-desc').val(this.options.desc);
            var config = mappro.getCkeditorConfig()
            dialog.colorpicker('stroke', this.options.stroke);
            dialog.dialog({
                autoOpen: true,
                modal: true,
                width: 'auto',
                buttons: {
                    Update: $.proxy(function () {
                        this.setOptions(dialog)
                        this.options.stroke = dialog.colorpicker('stroke');
                        this.setDirty(this.dirty || dialog.find('.ibs-file-name').val() !== this.filename || dialog.find('.ibs-file-desc').val() !== this.options.desc);
                        this.filename = dialog.find('.ibs-file-name').val();
                        this.options.desc = dialog.find('.ibs-file-desc').val();
                        mappro.html.list.find('.ibs-list-filename').text(this.filename);
                        dialog.dialog('close');
                    }, this),
                    Close: function () {
                        $(this).dialog('close');
                    }
                },
                open: function () {
                    dialog.find('.ibs-file-desc').ckeditor(config);
                    dialog.find('.ibs-file-desc').ckeditor().resize('100%', '100%', false);
                    var editor = dialog.find('.ibs-file-desc').ckeditor().editor;
                    editor.mappro = mappro;
                    dialog.on('click', '.ibs-name-of-file', {}, function () {
                        dialog.find('.ibs-file-name').val($(this).text());
                    });
                },
                close: function () {
                    dialog.find('.ibs-file-desc').ckeditorGet().destroy();
                    $(this).dialog('destroy');
                },
                resize: function (ev) {
                    dialog.find('.ibs-file-desc').ckeditor().resize('100%', '100%', false);
                }
            });
        };
        this.clearDialog = function () {
            var dialog = mappro.html.clear_dialog;
            dialog.find('.ibs-file-list-div').empty()
                    .append(mappro.html.file_list.clone());
            dialog.find('.ibs-file-item-checkbox').prop('checked', false);
            dialog.dialog({
                autoOpen: true,
                modal: true,
                width: 'auto',
                buttons: {
                    All: function () {
                        mappro.file.remove();
                        dialog.dialog('close');
                    },
                    Selected: $.proxy(function () {
                        this.included = [];
                        dialog.find('.ibs-file-item-checkbox').each(function (index, item) {
                            if ($(item).is(':checked')) {
                                mappro.file.included.push($(item).attr('rel'));
                            }
                        })
                        var list = this.listPlacemarks();
                        for (var i in list) {
                            this.placemarks[list[i]].remove();
                        }
                        var list = this.listSegments();
                        for (var i in list) {
                            this.segments[list[i]].remove();
                        }
                        for (var i in this.included) {
                            if (this.included[i] !== 'F1000') {
                                mappro.html.file_list.find('.ibs-file-item-' + this.included[i]).remove();
                            }
                        }
                        dialog.dialog('close');
                    }, this),
                    Cancel: function () {
                        $(this).dialog('close');
                    }
                },
                open: function () {
                },
                close: function () {
                },
                resize: function (ev) {
                }
            });
        };
        this.openInfo = function (obj) {
            var info = '';
            var _type = '';
            if (typeof obj.options.sid === 'undefined') {
                var rel = obj.options.pid;
                _type = obj.options.symbol === 'waypoint' ? 'waypoint' : 'placemark';
            } else {
                rel = obj.options.sid;
                _type = 'segment';
            }
            switch (_type) {
                case 'segment':
                    info = mappro.html.map.find('.ibs-segment-infowindow');
                    info.find('.ibs-info-name').text(obj.options.name);
                    info.find('.ibs-info-desc').html(obj.options.desc);
                    info.find('.ibs-info-modify-segment').attr({rel: rel});
                    info = info.clone();
                    info.find('.ibs-info-modify-segment').addClass('selected');
                    info.show();
                    break;
                case 'waypoint' :
                case 'placemark' :
                    info = mappro.html.map.find('.ibs-placemark-infowindow');
                    info.find('.ibs-info-name').text(obj.options.name);
                    info.find('.ibs-info-desc').html(obj.options.desc);
                    info.find('.ibs-info-modify-placemark').attr({rel: rel});
                    info = info.clone();
                    info.find('.ibs-info-modify-placemark').addClass('selected');
                    info.show();
                    break;
            }
            mappro.infowindow.setContent(info[0]);
            mappro.infowindow.open(mappro.googlemap, obj.marker);
        };
        this.setFileItem = function (url) {
            var rel = 'F' + this.fileId;
            try {
                var info = purl(url);
                var dir = info.data.attr.base + info.data.attr.directory;
                var label = info.data.attr.file;
            } catch (err) {
                dir = '';
                label = url;
            }
            if (dir.indexOf(mappro.options.args.liburl + 'maps/') === -1) {
                var dir = '';
            } else {
                dir = dir.replace(mappro.options.args.liburl + 'maps/', '');
            }
            var item = $('<li>').addClass('file-item-' + rel)
                    .append($('<div>')
                            .append($('<input>').attr({type: 'checkbox', rel: rel}).addClass("ibs-file-item-checkbox").prop('checked', true))
                            .append($('<label>').html(label).addClass('ibs-name-of-file').attr({rel: dir})));
            mappro.html.file_list.append(item);
        }
        this.postLoad = function () {
            if (!mappro.options.args.list || !mappro.options.args.controls) {
                this.placemarkVisible(true);
            }
            mappro.options.markerManager.set = mappro.options.args.markerManager;
            this.dirty = false;
            mappro.setClick(null);
            this.manageMarkers();
            this.focus();
        };
        this._importFile = function () {
            if (this.options.import_files.length) {
                var url = this.options.import_dir + this.options.import_files.pop();
                $.post(mappro.options.args.ajax, {
                    action: 'ibs_mappro_index',
                    func: 'CORS',
                    nonce: mappro.options.args.nonce,
                    path: url,
                    cache: false
                })
                        .done(function (data, status) {
                            try {
                                if (status === 'success') {
                                    try {
                                        var xml = $.parseXML($.trim(data));
                                    } catch (err) {
                                        throw(err)
                                    }
                                    if ($(xml).find('kml').length > 0) {
                                        mappro.file.fileId++
                                        mappro.kml.reader(xml, mappro.file);
                                    } else {
                                        if ($(xml).find('gpx').length > 0) {
                                            mappro.file.fileId++
                                            mappro.gpx.reader(xml, mappro.file);
                                        } else {
                                            alert('invalid file contents');
                                            spin(false);
                                            return;
                                        }
                                    }
                                } else {
                                    throw(status);
                                }
                            } catch (err) {
                                alert('process map failed: ' + err);
                                spin(false);
                                return;
                            }
                            if (url.indexOf('/mappro/uploads/') !== -1) {
                                $.post(mappro.options.args.ajax, {
                                    action: 'ibs_mappro_index',
                                    func: 'remove',
                                    nonce: mappro.options.args.nonce,
                                    type: 'file',
                                    filename: url.replace(mappro.options.args.liburl, mappro.options.args.libpath),
                                    cache: false
                                });
                            }
                            mappro.file.setFileItem(url);
                            mappro.file.postLoad();
                            mappro.file._importFile();
                            spin(false);
                        });
            }
            this.tracking();
        };
        this.importFile = function (maps) {
            this.options.name = null;
            this.options.desc = null;
            spin(true);
            maps = maps.replace(/%maps%;/, mappro.options.libpah + 'maps/');
            var raw = maps.split(';');
            this.options.import_files = [];
            for (var i in raw) {
                if (raw[i] !== '') {
                    this.options.import_files.push(raw[i])
                }
            }
            var uriinfo = purl(this.options.import_files[0]);
            this.options.import_dir = uriinfo.data.attr.base + uriinfo.data.attr.directory;
            this.options.import_files[0] = uriinfo.data.attr.file;
            this._importFile();
        };
        File.prototype.getPids = function (data) {
            var track = data.pop();
            mappro.geocoder.geocode({
                'address': track.where
            }, function (results, status) {
                if (status === google.maps.GeocoderStatus.OK) {
                    var lat = results[0].geometry.location.lat();
                    var lng = results[0].geometry.location.lng();
                    lng = parseFloat(lng);
                    lat = parseFloat(lat);
                    if (typeof lat === 'number' && typeof lng === 'number') {
                        var latlng = new google.maps.LatLng(lat, lng);
                        mappro.file.placemarks[track.pid].options.position = latlng;
                        var desc = mappro.file.placemarks[track.pid].options.desc;
                        mappro.file.placemarks[track.pid].options.desc = track.date + '<br/>' + results[0].formatted_address + '<br/>' + track.msg + '<br/>';
                        mappro.file.placemarks[track.pid].marker.setPosition(latlng);
                        mappro.file.placemarks[track.pid].marker.setVisible(true);
                    }
                    if (data.length) {
                        mappro.file.getPids(data);
                    } else {
                        var bounds = new google.maps.LatLngBounds();
                        mappro.file.getBounds(bounds)
                        mappro.googlemap.fitBounds(bounds);
                    }
                }
            });
        };
        File.prototype.tracking = function () {
            var results = [];
            $.getJSON(mappro.options.args.ajax, {
                action: 'ibs_mappro_index',
                func: 'tracking',
                nonce: mappro.options.args.nonce
            }).done(function (data, status) {
                if (status === 'success') {
                    for (var pid in mappro.file.placemarks) {
                        var id = mappro.file.placemarks[pid].options.name;
                        if (typeof data[id] === 'object') {
                            data[id].pid = pid;
                            results.push(data[id]); //{pid:'pid', where:'address',msg:'',date:''}
                        }
                    }
                    if (results.length > 0) {
                        mappro.file.getPids(results);
                    }
                }
            });
        };
    };
})(jQuery);