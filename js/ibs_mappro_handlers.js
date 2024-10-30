(function ($) {
    IBS_MAPPRO.prototype.setHandlers = function (mappro) {
        this.html.icon_lib_select.on('change', '', {}, function (event) {
            $('.ibs-map-icon').qtip("destroy", true);
            mappro.html.icon_library_list.empty()
            $.getJSON(mappro.options.args.ajax,
                    {
                        action: 'ibs_mappro_index',
                        func: 'icons',
                        nonce: mappro.options.args.nonce,
                        lib: mappro.options.args.libpath + 'icons/' + mappro.html.icon_lib_select.val()
                    })
                    .done(function (data) {

                        for (var i in data) {
                            mappro.html.icon_library_list
                                    .append('<img class="ibs-map-icon" src="' + data[i].url + '" title="' + data[i].name + '" width="32" height="32" />');
                        }
                        $('.ibs-map-icon').qtip(
                                {
                                    surpress: true,
                                    position: {
                                        my: 'top left',
                                        at: 'bottom right'
                                    },
                                    style: {
                                        classes: mappro.options.qtip.style + ' ' + mappro.options.qtip.rounded + mappro.options.qtip.shadow
                                    },
                                    show: {
                                        event: 'mouseover'
                                    },
                                    hide: {
                                        fixed: true,
                                        delay: 250,
                                        event: 'mouseout mouseleave'

                                    }
                                }

                        );
                    });
        });
        mappro.html.list_tabs.on('click', '.ibs-list-tab a', function (event) {
            event.preventDefault();
            mappro.html.list_tabs.find('.ibs-list-tab a').removeClass('selected');
            var i = $(this).attr('rel');
            switch (i) {
                case "list-left":
                    mappro.html.list_tabs.find('.ibs-list-right').show();
                    mappro.html.list_tabs.find('.ibs-list-left').hide();
                    mappro.html.list.css({float: 'left'})
                    break;
                case "list-right":
                    mappro.html.list_tabs.find('.ibs-list-right').hide();
                    mappro.html.list_tabs.find('.ibs-list-left').show();
                    mappro.html.list.css({float: 'right'})
                    break;
                case 'list-poi':
                    $(this).addClass('selected');
                    mappro.html.list.find('.ibs-list-seg').hide();
                    mappro.html.list.find('.ibs-list-wps').hide();
                    mappro.html.list.find('.ibs-list-poi').show();
                    break;
                case 'list-seg':
                    $(this).addClass('selected');
                    mappro.html.list.find('.ibs-list-poi').hide();
                    mappro.html.list.find('.ibs-list-wps').hide();
                    mappro.html.list.find('.ibs-list-seg').show();
                    break;
                case 'list-wps':
                    $(this).addClass('selected');
                    mappro.html.list.find('.ibs-list-poi').hide();
                    mappro.html.list.find('.ibs-list-seg').hide();
                    mappro.html.list.find('.ibs-list-wps').show();
                    break;
                default:
            }
        });
        mappro.html.search_box.on('keypress', '', {}, function (event) {
            var code = (event.keyCode ? event.keyCode : event.which);
            if (code === 13) {
                if (mappro.html.search_box.find('.ibs-pac-input').val() === '') {
                    mappro.foundPlaces.forEach(function (arg) {
                        arg.marker.setMap(null);
                    });
                }
            }
        });
        mappro.html.page
                .append($('<div>').hide()
                        .append($('<ul>').addClass('ibs-upload-list'))
                        .append($('<div>').addClass('ibs-upload-button').html('Browse'))
                        );
        mappro.html.upload_list = mappro.html.page.find('.ibs-upload-list');
        mappro.html.upload_button = mappro.html.page.find('.ibs-upload-button');
        this.uploader = mappro.html.upload_button.fineUploader({
            listElement: mappro.html.upload_list,
            request: {
                endpoint: this.options.args.url + 'lib/server/endpoint.php',
                params: {'dir': mappro.options.args.libpath + 'uploads/'}

            },
            debug: false
        })
        this.uploadCount = 0;
        this.uploader.on('submit', '', {}, function () {
            this.uploadCount++;
        });
        this.uploader.on('complete', '', {}, function (event, id, fileName, responseJSON) {
            mappro.uploadCount--;
            var ext = getExtension(fileName).toLowerCase();
            if (ext === 'kml' || ext === 'kmz' || ext === 'gpx') {
                var dir = mappro.options.args.liburl + 'uploads/' + fileName;
                mappro.file.importFile(dir);
            }
        });
        this.upload = function () {
            mappro.html.upload_list.empty();
            var a = mappro.html.upload_button;
            var b = a.find('input[qq-button-id]');
            var c = a.find('input')
            c.trigger('click');
        };
        $.widget("ui.dialog", $.ui.dialog, {
            _allowInteraction: function (event) {
                return !!$(event.target).closest(".cke_dialog").length || this._super(event);
            }
        });
        $(window).resize($.proxy(function (ev) {
            this.sizeHtml();
        }, this));

        window.onbeforeunload = $.proxy(function (e) {
            var ans = this.isDirty();
            if (ans)
                return ans;
            else
                return;

        }, this);
        this.html.map.on('click', '.ibs-menu-select', {}, function (event) {
            event.preventDefault();
            var menu = $(this).attr('menu');
            var target = null;

            if (menu !== 'action') {
                mappro.html.action_menu.find('.ibs-action-list').hide();
            } else {
                target = mappro.html.action_menu.find('.ibs-action-list')
            }
            if (menu !== 'control') {
                mappro.html.control_menu.find('.ibs-control-list').hide();
            } else {
                target = mappro.html.control_menu.find('.ibs-control-list')
            }
            if (menu !== 'draw') {
                mappro.html.draw_menu.find('.ibs-draw-list').hide();
            } else {
                target = mappro.html.draw_menu.find('.ibs-draw-list')
            }
            if (menu !== 'manage') {
                mappro.html.manage_menu.find('.ibs-manage-list').hide();
            } else {
                target = mappro.html.manage_menu.find('.ibs-manage-list')
            }
            if (target) {
                if (target.is(':visible')) {
                    target.hide();
                } else {
                    target.show();
                }
            }
            ;
        });
        this.html.control_menu.on('click', '.ibs-control-item', {}, function (event) {
            var action = $(this).attr('action');
            if (action === 'close') {
                event.preventDefault();
                mappro.html.control_menu.find('.ibs-control-list').hide();
            }
        });
        this.html.control_menu.on('change', '.ibs-control-item', {}, function (event) {
            event.preventDefault();
            var action = $(this).attr('action');
            var checked = $(this).is(':checked');
            switch (action) {
                case 'distance':
                    mappro.options.distance = checked;
                    break;
                case 'bike-layer':
                    mappro.setBikeLayer(checked);
                    break;
                case 'traffic-layer':
                    mappro.setTrafficLayer(checked);
                    break;
                case 'transit-layer':
                    mappro.setTransitLayer(checked);
                    break;
                case 'placemarks':
                    mappro.file.placemarkVisible(checked);
                    break;
                case 'waypoints':
                    mappro.file.waypointVisible(checked);
                    break;
                case 'markermanager':
                    mappro.options.markerManager.set = checked;
                    mappro.file.manageMarkers();
                    break;
                default:
                    this.html.control_menu.find('.ibs-control-list').hide();
            }
        });
        this.html.action_menu.on('click', '.ibs-action-item', {}, function (event) {
            event.preventDefault();
            var action = $(this).attr('action');
            mappro.html.action_menu.find('.ibs-action-list').hide();
            switch (action) {
                case 'browse':
                    mappro.browseDialog();
                    break;
                case 'upload':
                    mappro.upload();
                    break;
                case 'download':
                    mappro.file.downloadDialog();
                    break;
                case 'save':
                    mappro.file.saveDialog();
                    break;
                case 'focus':
                    mappro.file.focus();
                    break;
                case 'edit':
                    mappro.file.fileDialog();
                    break;
                case 'flip':
                    mappro.file.flip();
                    break;
                case 'sort':
                    mappro.file.pendSort();
                    break;
                case 'clear':
                    mappro.clear();
                    break;
            }
        });
        this.html.draw_menu.on('click', 'a.ibs-draw-item', {}, function (event) {
            event.preventDefault();
            mappro.html.draw_menu.find('.ibs-draw-list').hide();
            var action = $(this).attr('action');
            switch (action) {
                case 'draw-line':
                    mappro.file.pendSegment();
                    break;
                case 'add-poi':
                    mappro.file.pendPlacemark();
                    break;
            }
        });
        this.html.draw_menu.on('change', 'input[type=checkbox]', {}, function (event) {
            event.preventDefault();
            var action = $(this).attr('action');
            var checked = $(this).is(':checked');
            switch (action) {
                case 'followroad':
                    mappro.options.followRoad = checked;
                    break;
                case 'avoidhighways':
                    mappro.options.avoidHighways = checked;
                    break;
                default:
                    mappro.html.draw_menu.find('.ibs-draw-list').hide();
            }
        });
        this.html.draw_menu.on('change', 'input[type=radio]', {}, function (event) {
            event.preventDefault();
            mappro.options.travelMode = $(this).val();
        });
        this.html.manage_menu.on('change', 'input.ibs-control-item', {}, function (event) {
            var action = $(this).attr('action');
            mappro.options.args.debug = $(this).is(':checked') ? 'on' : 'off'
            switch (action) {
                case 'debug':
                    var a = {
                        action: 'ibs_mappro_index',
                        nonce: mappro.options.args.nonce,
                        func: 'set_debug',
                        debug: $(this).is(':checked') ? 'on' : 'off'
                    }
                    $.get(mappro.options.args.ajax, a).done(function (data, status) {
                        if (status === 'success' && data.indexOf('error') === -1) {

                        } else {
                            alert(data);
                        }
                    });
                    break;
                default:
            }
        });
        this.html.manage_menu.on('click', 'a.ibs-manage-item', {}, function (event) {
            event.preventDefault();
            mappro.html.manage_menu.find('.ibs-manage-list').hide();
            var action = $(this).attr('action');
            switch (action) {
                case 'tracks':
                    new TracksDialog(mappro);
                    break;
                case 'remove':
                    new CleanLibraryDialog(mappro.options.args);
                    break;
                case 'upload':
                    new UploadLibraryDialog(mappro.options.args);
                    break;
                case 'icons':
                    new IconLibraryDialog(mappro.options.args);
                    break;
                default:
                    mappro.html.manage_menu.find('.ibs-manage-list').hide();
            }
        });
        this.html.route_menu.on('click', '.ibs-route-item', {}, function (event) {
            event.preventDefault();
            mappro.html.route_menu.hide();
            var rel = $(this).attr('rel');
            var segment = mappro.file.segments[rel];
            var action = $(this).attr('action');
            switch (action) {
                case 'extend':
                    segment.extend();
                    break;
                case 'append':
                    segment.append();
                    break;
                case 'focus':
                    segment.focus();
                    break;
                case 'ledit':
                    segment.lineEdit();
                    break;
                case 'flip':
                    segment.flip();
                    break;
                case 'rebuild':
                    segment.rebuild();
                    break;
                case 'thin':
                    segment.thin();
                    break;
                case 'undo':
                    segment.undo();
                    break;
                case 'directions':
                    segment.cuesheetDirections();
                    break;
                case 'elevation':
                    segment.elevation();
                    break;
                case 'cuesheet':
                    segment.cuesheetWaypoints();
                    break;

            }

        });
        mappro.html.placemark_dialog.on('click', '.ibs-map-icon', {}, function (event) {
            event.preventDefault();
            mappro.html.placemark_dialog.find('.ibs-placemark-selected-icon').attr('src', $(this).attr('src'));
        });
        this.html.map.on('click', '.ibs-show-profile', {}, function (event) {
            event.preventDefault();
            var rel = $(this).attr('rel');
            mappro.file.segments[rel].elevation();
        });
        this.html.map.on('click', '.ibs-show-cuesheet', {}, function (event) {
            event.preventDefault();
            var rel = $(this).attr('rel');
            mappro.file.segments[rel].cuesheetWaypoints();
        });
        this.html.map.on('click', '.ibs-info-modify-placemark', {}, function (event) {
            event.preventDefault();
            mappro.infowindow.close();
            var rel = $(this).attr('rel');
            var action = $(this).attr('action');
            switch (action) {
                case 'edit' :
                    mappro.file.placemarks[rel].placemarkDialog();
                    break;
                case 'remove' :
                    mappro.file.placemarks[rel].remove();
                    break;
            }
        });
        this.html.map.on('click', '.ibs-info-modify-segment', {}, function (event) {
            event.preventDefault();
            mappro.infowindow.close();
            var rel = $(this).attr('rel');
            var action = $(this).attr('action');
            switch (action) {
                case 'edit' :
                    mappro.file.segments[rel].segmentDialog();
                    break;
                case 'remove' :
                    mappro.file.segments[rel].remove();
                    break;
                case 'more':
                    var menu = mappro.html.route_menu;
                    mappro.setMenuXY(menu, mappro.infowindow.getPosition());
                    menu.find('.ibs-route-item').attr('rel', rel);
                    menu.show();

                    break;
            }
        });

        mappro.html.map.on('click', '.ibs-search-info-mark', {}, function (event) {
            event.preventDefault();
            var rel = $(this).attr('rel');
            var arg = mappro.foundPlaces[rel];
            var desc = '<div>' + arg.details.formatted_address + '</div>'
                    + '<div>' + arg.details.formatted_phone_number + '</div>'
                    + '<div>' + arg.details.html_attributions + '</div>'
                    + '<div><a href="' + arg.details.url + '" target="_blank" >website</a></div>';
            mappro.infowindow.close();
            mappro.file.addPlacemark({
                name: arg.place.name,
                desc: desc,
                url: null,
                symbol: null,
                position: arg.marker.getPosition(),
                visible: true
            })
        });
        //-----------------------header buttons------------------------------------------------------
        mappro.html.prompt_dialog.on('keypress', '.ibs-answer', {}, function (event) {
            var code = (event.keyCode ? event.keyCode : event.which);
            if (code === 13) {
                event.preventDefault();
                var dialog = mappro.html.prompt_dialog;
                var buttons = dialog.dialog('option', 'buttons');
                buttons['Ok'].apply(dialog);
            }
        });

        //placemark waypoint
        mappro.html.list.on('click', '.ibs-placemark-item-image', {}, function (event) {
            event.preventDefault();
            event.stopPropagation();
            mappro.file.placemarkFilter(this);
        });
        mappro.html.list.on('click', '.ibs-placemark-item-name', {}, function (event) {
            event.preventDefault();
            event.stopPropagation();
            var placemark = mappro.file.placemarks[$(this).attr('rel')];
            if (placemark) {
                mappro.html.placemark_cm_info.hide();
                mappro.infowindow.close();
                mappro.file.selectPlacemark(this, event);
                if (1 == 1 || $(this).hasClass('selected')) {
                    placemark.open();
                } else {
                    mappro.infowindow.close();
                }
            }
        });

        mappro.html.list.on('mouseover', '.ibs-placemark-item-name', {}, function (event) {
            var rel = $(this).attr('rel');
            var placemark = mappro.file.placemarks[rel];
            if (placemark) {
                placemark.marker.setVisible(true);
                mappro.html.placemark_cm_info.find('.ibs-placemark-cm-desc').text($('<div>').html(placemark.options.desc).text());//strip html
                mappro.html.placemark_cm_info.find('.ibs-placemark-cm-name').text(placemark.options.name);
                mappro.setMenuXY(mappro.html.placemark_cm_info, placemark.marker.getPosition());
                mappro.html.placemark_cm_info.show();
            }
        });

        mappro.html.list.on('mouseout', '.ibs-placemark-item-name', {}, function (event) {
            var placemark = mappro.file.placemarks[$(this).attr('rel')];
            if (placemark) {
                var visible = mappro.file.visiblePlacemark || $(this).hasClass('selected') ? true : false;
                placemark.marker.setVisible(visible);
                mappro.html.placemark_cm_info.hide();
            }
        });

        //segment

        mappro.html.segment_list.on('click', 'a.ibs-segment-item-name', {}, function (event) {
            event.preventDefault();
            event.stopPropagation();
            var segment = mappro.file.segments[$(this).attr('rel')];
            if (segment) {
                mappro.html.segment_cm_info.hide();
                mappro.infowindow.close();
                mappro.file.selectSegment(this, event);
                if ($(this).hasClass('selected')) {
                    segment.open();
                } else {
                    mappro.infowindow.close();
                }
            }
        });
        mappro.html.segment_list.on('mouseover', 'a.ibs-segment-item-name', {}, function (event) {
            var rel = $(this).attr('rel');
            var file = mappro.file;
            var segment = file.segments[rel];
            if (segment) {
                mappro.html.segment_cm_info.find('.ibs-segment-cm-desc').html(segment.options.desc);
                mappro.html.segment_cm_info.find('.ibs-segment-cm-name').html(segment.options.name);
                mappro.setMenuXY(mappro.html.segment_cm_info, segment.marker.getPosition());
                mappro.html.segment_cm_info.show();
                google.maps.event.trigger(segment.marker, 'mouseover');
            }
        });
        mappro.html.segment_list.on('mouseout', 'a.ibs-segment-item-name', {}, function (event) {
            var rel = $(this).attr('rel');
            var file = mappro.file;
            var segment = file.segments[rel];
            if (segment) {
                mappro.html.segment_cm_info.hide();
                google.maps.event.trigger(segment.marker, 'mouseout');
            }
        });

        mappro.html.list.mousedown(function (e) {
            // e.stopPropagation();
        });

        mappro.html.segment_cm_edit.on('click', '.ibs-cm-edit-action', {}, function (event) {
            event.preventDefault();
            var segment = $(this).data().segment;
            mappro.html.segment_cm_edit.hide()
            var action = $(this).attr('rel');
            switch (action) {
                case 'clear':
                    if (segment) {
                        segment.stopEditing();
                    }
                    break;
                case 'delete':
                    var point = parseInt($(this).data('index'));
                    if (segment) {
                        segment.removePoint(point);
                    }
                    break;
                case 'split':
                    if (segment) {
                        var index = parseInt($(this).data('index'));
                        segment.split(index);
                    }
                    break;
            }
        });

        mappro.html.segment_cm_line.on('click', '.ibs-cm-line-action', {}, function (event) {
            event.preventDefault();
            var segment = $(this).data().segment;
            mappro.html.segment_cm_line.hide();
            var action = $(this).attr('rel');
            switch (action) {
                case 'line-edit':
                    segment.lineEdit();
                    break;
                case 'waypoint':
                    if (segment) {
                        var index = parseInt($(this).data('point'));
                        segment.waypoint(index);
                    }
                    break;
                case 'split':
                    if (segment) {
                        var index = parseInt($(this).data('point'));
                        segment.split(index);
                    }
                    break;
            }
        });
        mappro.html.segment_dialog.find('.ibs-opacity-val').spinner({'spin': function (event, ui) {
                mappro.html.segment_dialog.colorpicker('opacity', ui.value);
            }
        });
        mappro.html.segment_dialog.find('.ibs-opacity-val').on('change', function (event) {
            mappro.html.segment_dialog.colorpicker('opacity', $(this).val());
        });
        mappro.html.segment_dialog.find('.ibs-width-val').spinner({'spin': function (event, ui) {
                mappro.html.segment_dialog.colorpicker('weight', ui.value);
            }
        });
        mappro.html.segment_dialog.find('.ibs-width-val').on('change', function () {
            mappro.html.segment_dialog.colorpicker('weight', $(this).val());
        });

        mappro.html.file_dialog.find('.ibs-opacity-val').spinner({'spin': function (event, ui) {
                mappro.html.file_dialog.colorpicker('opacity', ui.value);
            }
        });

        mappro.html.file_dialog.find('.ibs-opacity-val').on('change', function () {
            mappro.html.file_dialog.colorpicker('opacity', ui.value);
        });
        mappro.html.file_dialog.find('.ibs-width-val').spinner({'spin': function (event, ui) {
                mappro.html.file_dialog.colorpicker('weight', ui.value);
            }});
        mappro.html.file_dialog.find('.ibs-width-val').on('change', function () {
            mappro.html.file_dialog.colorpicker('weight', $(this).val());
        });
        mappro.html.file_dialog.on('keypress', '.ibs-file-settings-name', {}, function (event) {
            var code = (event.keyCode ? event.keyCode : event.which);
            if (code === 13) {
                event.preventDefault();
                var dialog = mappro.html.file_dialog;
                var buttons = dialog.dialog('option', 'buttons');
                buttons['Update'].apply(dialog);
            }
        });

        mappro.html.file_dialog.on('change', '.ibs-file-name', {}, function (event) {
            mappro.html.file_dialog.find('input[name=file_settings_ext]:radio').trigger('change');
        });

        mappro.html.file_dialog.on('change', 'input[name=file_ext]:radio', {}, function (event) {
            var ext = mappro.html.file_dialog.find('input[name=file_ext]:checked').val();
            var name = mappro.html.file_dialog.find('.ibs-file-name').val();
            if (name.length < 3) {
                name += '*';
            }
            name = getFilename(name) + '.' + ext;
            mappro.html.file_dialog.find('.ibs-file-name').val(name);
        });//$('.jquery_ckeditor').ckeditor().editor;
        mappro.html.file_dialog.on('click', '.ibs-reset-lines', {}, function (event) {
            var stroke = mappro.html.file_dialog.colorpicker('stroke');
            for (var sid in mappro.file.segments) {
                var seg = mappro.file.segments[sid];
                mappro.file.segments[sid].options.stroke = stroke;
                mappro.file.segments[sid].line.setOptions({strokeColor: stroke.color, strokeWeight: stroke.weight, strokeOpacity: stroke.opacity})
            }
            mappro.file.setDirty(true);
        });
        mappro.html.save_dialog.on('keypress', '.ibs-save-name', {}, function (event) {
            var code = (event.keyCode ? event.keyCode : event.which);
            if (code === 13) {
                event.preventDefault();
                var dialog = mappro.html.save_dialog;
                var buttons = dialog.dialog('option', 'buttons');
                buttons['Save'].apply(dialog);
            }
        });

        mappro.html.save_dialog.on('change', '.ibs-save-name', {}, function (event) {
            mappro.html.save_dialog.find('input[name="file_ext"]:radio').trigger('change');
        });
        mappro.html.save_dialog.on('change', '.ibs-save-dir', {}, function (event) {
            var dir = mappro.html.save_dialog.find('.ibs-save-dir').val();
            var dir = dir + '/';
            dir = dir.replace('//', '/');
            mappro.html.save_dialog.find('.ibs-save-dir').val(dir);
        });

        mappro.html.save_dialog.on('change', 'input[name="file_ext"]:radio', {}, function (event) {
            var ext = mappro.html.save_dialog.find('input[name="file_ext"]:checked').val();
            var name = mappro.html.save_dialog.find('.ibs-save-name').val();
            if (name.length === 0) {
                name += '*';
            }
            name = getFilename(name) + '.' + ext;
            mappro.html.save_dialog.find('.ibs-save-name').val(name);
        });

        mappro.html.download_dialog.on('change', 'input[name="file_ext"]:radio', {}, function (event) {
            var ext = mappro.html.download_dialog.find('input[name="file_ext"]:checked').val();
            var name = mappro.html.download_dialog.find('.ibs-save-name').val();
            if (name.length === 0) {
                name += '*';
            }
            name = getFilename(name) + '.' + ext;
            mappro.html.download_dialog.find('.ibs-save-name').val(name);
        });
        mappro.html.file_dialog.find('.ibs-reset-lines').button({
            text: true,
            label: 'Set Lines',
            icons: {
                primary: 'ui-icon-arrowreturnthick-1-e'
            }
        });
        this.html.action_menu.find('.ibs-menu-select').trigger('click');
        this.resetSize = function () {
            this.sizeHtml();
        }
        this.sizeHtml = function () {
            if (this.googlemap) {
                google.maps.event.trigger(this.googlemap, 'resize');
            }
        };
    }
})(jQuery);