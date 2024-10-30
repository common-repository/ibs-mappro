(function ($) {
    IBS_MAPPRO.prototype.htmlGen = function (mappro) {
        this.options.args.div.addClass('ibsm ibs-site-main')
                .append($('<div>').html('<span class="ibs-site-title"></span> <span class="ibs-site-tagline" ></span>').addClass('ibs-site-header'))
                .append($('<div>').css({clear: 'both'}));
        this.html.site_main = this.options.args.div;
        this.html.site_main.find('.ibs-site-title').html(this.options.args.title);
        this.html.site_main.find('.ibs-site-tagline').html(this.options.args.tag);
        this.html.site_main
                .append($('<div>').addClass('ibs-page')
                        .append($('<div>').addClass('ibs-container')));
        this.html.page = this.html.site_main.find('.ibs-page');
        this.html.page.height(this.html.site_main.height() - this.html.site_main.find('.ibs-site-header').height());
        this.html.container = this.html.page.find('.ibs-container');
        this.html.container
                .append($('<div>').addClass('ibs-list').resizable({containment: "parent", 'minWidth': 100})
                        .append($('<div>').addClass('ibs-list-tabs ibs-menu-bar')
                                .append($('<ul>')
                                        .append($('<li>').addClass('ibs-img-left ibs-list-tab ibs-list-left').hide().css('margin', '0px')
                                                .append($('<a>').attr({href: '#', rel: 'list-left', title: 'panel to right'}).text('')))
                                        .append($('<li>').addClass('ibs-img-line ibs-list-tab')
                                                .append($('<a>').attr({href: '#', rel: 'list-seg', title: 'route list'}).text('')))
                                        .append($('<li>').addClass('ibs-img-marker ibs-list-tab')
                                                .append($('<a>').attr({href: '#', rel: 'list-poi', title: 'points of interest'}).text('')))
                                        .append($('<li>').addClass('ibs-img-waypoint ibs-list-tab')
                                                .append($('<a>').attr({href: '#', rel: 'list-wps', title: 'waypoints'}).text('')))
                                        .append($('<li>').addClass('ibs-img-right ibs-list-tab ibs-list-right').css('margin', '0px')
                                                .append($('<a>').attr({href: '#', rel: 'list-right', title: 'panel to right'}).text('')))))
                        .append($('<div>').addClass('ibs-list-poi')
                                .append($('<div>').addClass('ibs-list-div')
                                        .append($('<ul>').addClass("ibs-placemark-list ibs-controls")
                                                )))
                        .append($('<div>').addClass('ibs-list-seg').hide()
                                .append($('<div>').addClass('ibs-list-div')
                                        .append($('<ul>').addClass("ibs-segment-list ibs-controls"))))
                        .append($('<div>').addClass('ibs-list-wps').hide()
                                .append($('<div>').addClass('ibs-list-div')
                                        .append($('<ul>').addClass("ibs-waypoint-list ibs-controls")
                                                )))

                        .append($('<div>').addClass('ibs-list-tab-directions').hide()
                                .append($('<div>').addClass('ibs-list-div')
                                        .append($('<div>').addClass('ibs-direction-list controls'))))
                        .append($('<div>').addClass('ibs-list-tab-files').hide()
                                .append($('<div>').addClass('ibs-list-div')
                                        .append($('<ul>').addClass("ibs-file-list ibs-controls")))));
        this.html.container
                .append($('<div>').addClass('ibs-app')
                        .append($('<div>').addClass('ibs-map ibs-mappro-map').css({height: this.options.height})
                                .append($('<div>').attr({id: 'map-div-' + mappro.options.args.sn}).addClass('ibs-map-div')))
                        )
                .append($('<div>').addClass('ibs-directions-panel').hide());

        this.html.list = this.html.container.find('.ibs-list');
        this.html.list_tabs = this.html.list.find('.ibs-list-tabs');
        this.html.placemark_list = this.html.list.find('.ibs-placemark-list');
        this.html.waypoint_list = this.html.list.find('.ibs-waypoint-list');
        this.html.segment_list = this.html.list.find('.ibs-segment-list');
        this.html.file_list = this.html.list.find('.ibs-file-list');
        this.html.directions_list = this.html.list.find('.ibs-directions-list');
        this.html.app = this.html.container.find('.ibs-app');
        this.html.map = this.html.app.find('.ibs-map');
        this.html.map_div = this.html.app.find('.ibs-map-div');
        if (!this.options.args.admin && !this.options.args.list) {
            this.html.list.hide();
        }
        if (this.options.args.admin || this.options.args.elevation) {
            this.html.site_main
                    .after($('<div>').addClass('ibs-map-data').attr({id: 'ibs-mappro-data-panel-' + this.options.args.sn})
                            .append($('<span>').addClass('ibs-box-span')
                                    .append($('<span>').addClass('ibs-data-segment'))
                                    .append($('<span>').addClass('ibs-data-distance'))
                                    .append($('<span>').addClass('ibs-data-gain'))
                                    )
                            .append($('<div>').addClass('ibs-map-data-chart').html('<div style="text-align:center"><span style="font-weight:100"> Elevation profile</span></div>')));
            this.html.map_data = $('#ibs-mappro-data-panel-' + this.options.args.sn);
            this.html.map_data_chart = this.html.map_data.find('.ibs-map-data-chart');
            this.html.map_data.width(this.html.site_main.width());
            this.html.map_data.position().left = this.html.site_main.position().left;
            var lm = this.html.site_main.css('margin-left')  === '0px' ? 'auto' : this.html.site_main.css('margin-left');
            var rm = this.html.site_main.css('margin-right')  === '0px' ? 'auto' : this.html.site_main.css('margin-right');
            if (lm === rm)
            this.html.map_data.css({'margin-left': lm, 'margin-right': rm, 'float': this.html.site_main.css('float')});
        }
        this.setFileExtension = function () {
            return $('<div>')
                    .append($('<div>').addClass('ibs-section-header').html('file type'))
                    .append($('<div>')
                            .append($('<label>').text('*.kml'))
                            .append($('<input>').addClass('ibs-file-kml').attr({'type': 'radio', 'value': 'kml', 'name': 'file_ext'}))
                            .append($('<label>').text('*.kmz'))
                            .append($('<input>').addClass('ibs-file-kmz').attr({'type': 'radio', 'value': 'kmz', 'name': 'file_ext'}))
                            .append($('<label>').text('*.gpx'))
                            .append($('<input>').addClass('ibs-file-gpx').attr({'type': 'radio', 'value': 'gpx', 'name': "file_ext"})))
                    .append($('<div>').addClass('ibs-file-ext-span')
                            .append($('<div>').addClass('ibs-section-header').text('gpx content'))
                            .append($('<label>').text('tracks'))
                            .append($('<input>').addClass('ibs-gpx_tracks').attr({type: "checkbox", title: "output tracks "}))
                            .append($('<label>').text('routes'))
                            .append($('<input>').addClass('ibs-gpx_routes').attr({type: "checkbox", title: "output routes "}))
                            .append($('<label>').text('waypoints'))
                            .append($('<input>').addClass('ibs-gpx_waypoints').attr({type: "checkbox", title: "output waypoints"}))
                            .append($('<label>').text('poi'))
                            .append($('<input>').addClass('ibs-gpx_placemarks').attr({type: "checkbox", title: "output placemarks"}))
                            )
                    .append($('<div>').addClass('ibs-section-header').text('include'))
                    .append($('<div>').addClass('ibs-file-list-div'))

        };

        this.setLineAttr = function (selectId) {
            return $('<div>')
                    .append($('<div>').addClass('ibs-section-header').html('line attributes'))
                    .append($('<div>').addClass('ibs-line-attr')
                            .append($('<label>').text('opacity'))
                            .append($('<input>').addClass('ibs-opacity-val').attr({'type': 'number', 'value': '.5', 'max': '1.0', 'min': '0.1', 'step': '0.1'}))
                            .append($('<label>').text('width'))
                            .append($('<input>').addClass('ibs-width-val').attr({'type': 'number', 'value': '5', 'max': '15', 'min': '1', 'step': '1'}))
                            .append($('<select>').addClass(selectId + ' colorpicker-select')));

        };
        this.html.container
                .append($('<div>').addClass('ibs-dialogs'))
        this.html.dialogs = this.html.container.find('.ibs-dialogs');
        this.html.dialogs
                .append($('<div>').addClass('ibs-placemark-dialog').attr({'title': 'Placemark'}).hide()
                        .append($('<div>').addClass('ibs-dialog-header')
                                .append($('<div>').addClass('ibs-section-header').html('Name'))
                                .append($('<div>')
                                        .append(($('<input>').addClass('ibs-placemark-dialog-name view-disable').attr({'type': 'text', 'size': 32, 'value': ''}))))
                                .append($('<div>')
                                        .append($('<div>')
                                                .append($('<div class="placemark-selected-div">')
                                                        .append($('<img>').addClass('ibs-placemark-selected-icon').attr({'src': '', 'height': '32', 'width': '32', 'title': 'current icon'}).css('vertical-align', 'middle'))
                                                        .append($('<span style="font-weight:bold; margin-left:10px">').text('Current Icon')))
                                                .append($('<div>').addClass('ibs-icon-libraries').css({'font-size': '10px'})
                                                        .append($('<div>').addClass('ibs-lib-select')
                                                                .append($('<label>').text('icon libraries '))
                                                                .append($('<select>').addClass('ibs-icon-lib-select')
                                                                        .append($('<option>').addClass('ibs-icon-lib').attr({value: ''}))
                                                                        ))
                                                        .append($('<div>').addClass('ibs-icon-library-list'))
                                                        )

                                                )))
                        .append($('<div>').addClass('ibs-edit-ck-div')
                                .append($('<textarea>').addClass('ibs-placemark-dialog-desc view-hide').attr({'rows': 5, 'cols': 32})))
                        .append($('<input>').addClass('ibs-placemark-dialog-pid').attr({'type': 'hidden', 'value': ''})));

        this.html.placemark_dialog = this.html.dialogs.find('.ibs-placemark-dialog');
        this.html.icon_libraries = this.html.dialogs.find('.ibs-icon-libraries');
        this.html.icon_lib_select = this.html.dialogs.find('.ibs-icon-lib-select');
        this.html.icon_library_list = this.html.dialogs.find('.ibs-icon-library-list');
        this.html.dialogs
                .append($('<div>').addClass('ibs-waypoint-dialog').hide().attr({'title': 'Waypoint'})
                        .append($('<div>').addClass('ibs-dialog-header')
                                .append($('<div>')
                                        .append($('<input>').addClass('ibs-waypoint-dialog-name').attr({'type': 'text', 'size': '32', 'value': ''}))))
                        .append($('<div>').addClass('ibs-edit-ck-div')
                                .append($('<textarea>').addClass('ibs-waypoint-dialog-desc').css({'margin-top': '25px'}).attr({'rows': '5', 'cols': '32'})))
                        .append($('<input>').addClass('ibs-waypoint-dialog-pid').attr({'type': 'hidden', 'value': ''})));

        this.html.waypoint_dialog = this.html.dialogs.find('.ibs-waypoint-dialog');

        this.html.dialogs
                .append($('<div>').addClass('ibs-segment-dialog').attr('title', 'Segment').hide()
                        .append($('<div>').addClass('ibs-dialog-header')
                                .append($('<div>').addClass('ibs-section-header').html('Name'))
                                .append($('<div>')
                                        .append($('<input>').addClass('ibs-segment-dialog-name').attr({'type': 'text', 'value': ''})))
                                .append(this.setLineAttr('ibs-segment-dialog-color-select'))
                                .append($('<div>').addClass('ibs-section-header').html('Statistics'))
                                .append($('<span>').addClass('ibs-segment-dialog-stats')))
                        .append($('<div>').addClass('ibs-edit-ck-div').css({clear: 'both'})
                                .append($('<textarea>').addClass('ibs-segment-dialog-desc view-hide').attr({'rows': '2', 'cols': '50'})))
                        .append($('<input>').addClass('ibs-segment-dialog-sid').attr({'type': 'hidden', 'value': '0'})));

        this.html.segment_dialog = this.html.dialogs.find('.ibs-segment-dialog');

        this.html.dialogs
                .append($('<div>').addClass('ibs-save-dialog').attr({'title': 'Save'}).hide()
                        .append($('<div>').addClass('ibs-dialog-header')
                                .append($('<div>').addClass('ibs-section-header').text('target folder '))
                                .append($('<div>').addClass('ibs-mapfolder-browser JQueryFTD '))
                                .append($('<div>').addClass('ibs-section-header').text('save As'))
                                .append($('<div>')
                                        .append($('<label>').text('folder'))
                                        .append($('<input>').addClass('ibs-save-dir').attr({'type': 'text', 'size': '20', 'value': ''}))
                                        .append($('<label>').text('name'))
                                        .append($('<input>').addClass('ibs-save-name').attr({'type': 'text', 'size': '20', 'value': ''}))
                                        )
                                .append(this.setFileExtension())

                                )
                        .append($('<div>').addClass('ibs-edit-ck-div').css('width', '100%')
                                .append($('<textarea>').addClass('ibs-save-desc').attr({'rows': '10', 'cols': '50'}))
                                ));

        this.html.save_dialog = this.html.dialogs.find('.ibs-save-dialog');

        this.html.dialogs
                .append($('<div>').addClass('ibs-clear-dialog').attr({'title': 'Remove'}).hide()
                        .append($('<div>').addClass('ibs-dialog-header')
                                .append($('<div>').addClass('ibs-section-header').text('include'))
                                .append($('<div>').addClass('ibs-file-list-div'))));

        this.html.clear_dialog = this.html.dialogs.find('.ibs-clear-dialog');

        this.html.dialogs
                .append($('<div>').addClass('ibs-download-dialog').attr({'title': 'Download'}).hide()
                        .append($('<div>').addClass('ibs-dialog-header')
                                .append($('<div>').addClass('ibs-section-header').text('save As'))
                                .append($('<div>')
                                        .append($('<label>').text('name'))
                                        .append($('<input>').addClass('ibs-save-name').attr({'type': 'text', 'size': '20', 'value': ''}))
                                        )
                                .append(this.setFileExtension())
                                )
                        .append($('<div>').addClass('ibs-edit-ck-div').css('width', '100%')
                                .append($('<textarea>').addClass('ibs-save-desc').attr({'rows': '10', 'cols': '50'}))
                                ));

        this.html.download_dialog = this.html.dialogs.find('.ibs-download-dialog');

        this.html.dialogs
                .append($('<div>').addClass('ibs-file-dialog').attr({'title': 'Map settings'}).hide()
                        .append($('<div>').addClass('ibs-dialog-header')
                                .append($('<div>').addClass('ibs-section-header').html('File Name'))
                                .append($('<input>').addClass('ibs-file-name').css('margin', '5px').attr({'type': 'text', 'size': '30', 'value': ''}))
                                .append(this.setFileExtension())
                                .append($('<div>').addClass('ibs-section-header').html('Statistics'))
                                .append($('<ul>').addClass('ibs-stat-list ct-help-list'))
                                .append(this.setLineAttr('ibs-file-dialog-color-select')))
                        .append($('<div>').addClass('ibs-edit-ck-div').css({'width': '100%', clear: 'both'})
                                .append($('<textarea>').addClass('ibs-file-desc').attr({'rows': '3', 'cols': '50'}))
                                ));

        this.html.file_dialog = this.html.dialogs.find('.ibs-file-dialog');

        this.html.file_dialog.find('.ibs-line-attr')
                .append($('<div>').css('float', 'right')
                        .append($('<button>').addClass('ibs-reset-lines').attr({'title': 'reset all lines to these attributes'}).text('Reset lines').css({'margin-left': '15px'})));

        this.html.dialogs
                .append($('<div>').addClass('ibs-cuesheet-dialog').attr({'title': 'Cuesheet'}).hide()
                        .append($('<div>').addClass('ibs-dialog-header')
                                .append($('<div>').addClass('ibs-cuesheet'))));

        this.html.cuesheet_dialog = this.html.dialogs.find('.ibs-cuesheet-dialog');

        this.html.dialogs
                .append($('<div>').addClass('ibs-browse-dialog').attr('title', 'Browse maps').hide()
                        .append($('<div>').addClass('ibs-dialog-header')
                                .append($('<div>').addClass('ibs-section-header').html('Map Folders'))
                                .append($('<div>').addClass('ibs-map-browser-div')
                                        .append($('<div>').addClass('ibs-map-browser JQueryFTD')))));

        this.html.browse_dialog = this.html.dialogs.find('.ibs-browse-dialog');

        this.html.map
                .append($('<div>').addClass('ibs-segment-cm-line ibs-context-menu').hide()
                        .append($('<ul>').addClass('ibs-cm-list')
                                .append($('<li>')
                                        .append($('<a>').addClass('ibs-cm-line-action').attr({'href': '#', 'rel': 'split', 'title': 'split line here'}).html('Split')))
                                .append($('<li>').addClass('ibs-img_placemark')
                                        .append($('<a>').addClass('ibs-cm-line-action').attr({'href': '#', 'rel': 'waypoint', 'title': 'add waypoint'}).html('Waypoint')))
                                .append($('<li>').addClass('ibs-img_line-edit')
                                        .append($('<a>').addClass('ibs-cm-line-action').attr({'href': '#', rel: 'line-edit', title: 'segment line editing'}).html('Line-edit')))
                                .append($('<li>')
                                        .append($('<a>').addClass('ibs-cm-line-action').attr({'href': '#', 'rel': 'close'}).html('Close')))));

        this.html.segment_cm_line = this.html.map.find('.ibs-segment-cm-line');

        this.html.map
                .append($('<div>').addClass('ibs-segment-cm-edit ibs-context-menu').hide()
                        .append($('<ul>').addClass('ibs-cm-list')
                                .append($('<li>')
                                        .append($('<a>').addClass('ibs-cm-edit-action').attr({'href': '#', 'rel': 'clear'}).html('Clear')))
                                .append($('<li>')
                                        .append($('<a>').addClass('ibs-cm-edit-action').attr({'href': '#', 'rel': 'delete'}).html('Delete point')))
                                .append($('<li>')
                                        .append($('<a>').addClass('ibs-cm-edit-action').attr({'href': '#', 'rel': 'split'}).html('Split')))
                                .append($('<li>')
                                        .append($('<hr/>')))
                                .append($('<li>')
                                        .append($('<a>').addClass('ibs-cm-edit-action').attr({'href': '#', 'rel': 'close'}).html('Close')))));

        this.html.segment_cm_edit = this.html.map.find('.ibs-segment-cm-edit');
        this.html.map
                .append($('<div>').attr({'title': 'Prompt'}).addClass('ibs-prompt-dialog').hide()
                        .append($('<p>')
                                .append($('<img>').attr('src', this.siteUrl() + 'image/question-mark.png').css({'float': 'left', 'margin-right': '5px'}))
                                .append($('<span>').addClass('ibs-message').css({'float': 'left', 'margin-right': '5px'}).html(''))
                                .append($('<input>').addClass('ibs-answer').attr({'type': 'text', 'size': '30', 'value': ''}))));
        this.html.prompt_dialog = this.html.map.find('.ibs-prompt-dialog');

        this.html.map
                .append($('<div style="width:200px;">').addClass('ibs-placemark-cm-info ibs-context-menu').hide()
                        .append($('<div>').addClass('ibs-placemark-cm-name'))
                        .append($('<div>').addClass('ibs-placemark-cm-desc')))
                .append($('<div>').addClass('ibs-distance-info').hide())
                .append($('<div>').addClass('ibs-pend-info').hide())
        this.html.map
                .append($('<div style="width:200px;max-height:400px; overflow:hidden">').addClass('ibs-segment-cm-info ibs-context-menu').hide()
                        .append($('<div>').addClass('ibs-segment-cm-name'))
                        .append($('<div>').addClass('ibs-segment-cm-desc')));

        this.html.placemark_cm_info = this.html.map.find('.ibs-placemark-cm-info');
        this.html.segment_cm_info = this.html.map.find('.ibs-segment-cm-info');
        this.html.pend_info = this.html.map.find('.ibs-pend-info');
        this.html.distance_info = this.html.map.find('.ibs-distance-info');
        this.html.map
                .append($('<div>').addClass('ibs-action-menu ibs-custom-control ibs-pac-controls')
                        .append($('<div>')
                                .append($('<a>').addClass('ibs-menu-select').text('content').attr({menu: 'action', title: 'map content', href: "#"}).text('content'))
                                .append($('<ul>').addClass('ibs-action-list ibs-menu-list ibs-menu-controls')
                                        .append($('<li>').addClass('ibs-img-browse ibs-icon')
                                                .append($('<a>').addClass('ibs-action-item').attr({action: 'browse', href: '#', title: 'map library'}).text('map library')))
                                        .append($('<li>').addClass('ibs-img-upload ibs-icon')
                                                .append($('<a>').addClass('ibs-action-item').attr({action: 'upload', href: '#', title: 'upload from desktop"'}).text('upload')))
                                        .append($('<li>').addClass('ibs-img-download ibs-icon')
                                                .append($('<a>').addClass('ibs-action-item').attr({action: 'download', href: '#', title: 'download to desktop'}).text('download')))
                                        .append($('<li>').addClass('ibs-img-save ibs-icon')
                                                .append($('<a>').addClass('ibs-action-item').attr({action: 'save', href: '#', title: 'save map'}).text('save')))
                                        .append($('<li>').addClass('ibs-img-focus ibs-icon')
                                                .append($('<a>').addClass('ibs-action-item').attr({action: 'focus', href: '#', title: 'focus map'}).text('focus')))
                                        .append($('<li>').addClass('ibs-img-edit ibs-icon')
                                                .append($('<a>').addClass('ibs-action-item').attr({action: 'edit', href: '#', title: 'edit map settings and info'}).text('edit')))
                                        .append($('<li>').addClass('ibs-img-delete ibs-icon')
                                                .append($('<a>').addClass('ibs-action-item').attr({action: 'clear', href: '#', title: 'selective removal'}).text('remove')))
                                        .append($('<li>').addClass('ibs-img-sort ibs-icon')
                                                .append($('<a>').addClass('ibs-action-item').attr({action: 'sort', href: '#', title: 'sort poi list by map position'}).text('sort')))
                                        .append($('<li>').addClass('ibs-img-flip ibs-icon')
                                                .append($('<a>').addClass('ibs-action-item').attr({action: 'flip', href: '#', title: 'reverse travel direction of all route'}).text('reverse')))
                                        .append($('<li>').addClass('ibs-img-close ibs-icon')
                                                .append($('<a>').addClass('ibs-action-item').attr({action: 'close', href: '#', title: 'close menuy'}).text('close')))
                                        )));
        this.html.action_menu = this.html.map.find('.ibs-action-menu');
        if (!this.options.args.wpadmin) {
            this.html.action_menu.find('[action=save]').parent().remove();
        }
        this.html.action_menu.hide();
        this.html.map
                .append($('<div>').addClass('ibs-manage-menu ibs-custom-control ibs-pac-controls')
                        .append($('<div>')
                                .append($('<a>').addClass('ibs-menu-select').text('manage').attr({menu: 'manage', title: 'management menu', href: "#"}))
                                .append($('<ul>').addClass('ibs-manage-list ibs-menu-list ibs-menu-controls')
                                        .append($('<li>').addClass('ibs-img-gears ibs-icon')
                                                .append($('<a>').addClass('ibs-manage-item').attr({action: 'remove', href: '#', title: 'remove from files from library'}).html('<span>remove</span>')))
                                        .append($('<li>').addClass('ibs-img-gears ibs-icon')
                                                .append($('<a>').addClass('ibs-manage-item').attr({action: 'upload', href: '#', title: 'upload files to library'}).html('<span>upload</span>')))
                                        .append($('<li>').addClass('ibs-img-gears ibs-icon')
                                                .append($('<a>').addClass('ibs-manage-item').attr({action: 'icons', href: '#', title: 'manage icon library'}).html('<span>icons</span>')))
                                        .append($('<li>').addClass('ibs-img-gears ibs-icon')
                                                .append($('<a>').addClass('ibs-manage-item').attr({action: 'tracks', href: '#', title: 'manage marker tracking'}).html('<span>tracking</span>')))
                                        .append($('<li>').addClass('ibs-checkbox')
                                                .append($('<label>')
                                                        .append($('<input>').addClass('ibs-control-item').attr({type: 'checkbox', action: 'debug', href: '#'})
                                                                .prop('checked', mappro.options.args.debug === 'on'))
                                                        .append($('<span>').text('debug').attr({title: 'debug use non-minified javascript'}))))

                                        .append($('<li>').addClass('ibs-img-close ibs-icon')
                                                .append($('<a>').addClass('ibs-manage-item').attr({action: 'close', href: '#', title: 'close menu'}).text('close')))

                                        )));
        this.html.manage_menu = this.html.map.find('.ibs-manage-menu');
        this.html.manage_menu.hide();
        this.html.map
                .append($('<div>').addClass('ibs-control-menu ibs-custom-control ibs-pac-controls')
                        .append($('<div>')
                                .append($('<a>').addClass('ibs-menu-select').text('display').attr({menu: 'control', title: 'display controls', href: "#"}))
                                .append($('<ul>').addClass('ibs-control-list ibs-menu-list ibs-menu-controls')
                                        .append($('<li>').addClass('ibs-checkbox')
                                                .append($('<label>')
                                                        .append($('<input>').addClass('ibs-control-item').attr({type: 'checkbox', action: 'distance', href: '#'}))
                                                        .append($('<span>').text('distance').attr({title: 'show distance flag'}))))
                                        .append($('<li>').addClass('ibs-checkbox')
                                                .append($('<label>')
                                                        .append($('<input>').addClass('ibs-control-item').attr({type: 'checkbox', action: 'placemarks', href: '#'}))
                                                        .append($('<span>').text('placemarks').attr({title: 'show placemarks'}))))
                                        .append($('<li>').addClass('ibs-checkbox')
                                                .append($('<label>')
                                                        .append($('<input>').addClass('ibs-control-item').attr({type: 'checkbox', action: 'waypoints', href: '#'}))
                                                        .append($('<span>').text('waypoints').attr({title: 'show waypoints'}))))
                                        .append($('<li>').addClass('ibs-checkbox')
                                                .append($('<label>')
                                                        .append($('<input>').addClass('ibs-control-item').attr({type: 'checkbox', action: 'markermanager', href: '#'}))
                                                        .append($('<span>').text('marker mgr').attr({title: 'use marker manager'}))))
                                        .append($('<li>').addClass('ibs-checkbox')
                                                .append($('<label>')
                                                        .append($('<input>').addClass('ibs-control-item').attr({type: 'checkbox', action: 'bike-layer', href: '#'}))
                                                        .append($('<span>').text('bicycle layer').attr({title: 'show bicycle layer'}))))
                                        .append($('<li>').addClass('ibs-checkbox')
                                                .append($('<label>')
                                                        .append($('<input>').addClass('ibs-control-item').attr({type: 'checkbox', action: 'traffic-layer', href: '#'}))
                                                        .append($('<span>').text('traffic layer').attr({title: 'show traffic layer'}))))
                                        .append($('<li>').addClass('ibs-checkbox')
                                                .append($('<label>')
                                                        .append($('<input>').addClass('ibs-control-item').attr({type: 'checkbox', action: 'transit-layer', href: '#'}))
                                                        .append($('<span>').text('transit layer').attr({title: 'show transit layer'}))))
                                        .append($('<li>').addClass('ibs-img-close ibs-icon')
                                                .append($('<a>').addClass('ibs-control-item').attr({action: 'close', href: '#', title: 'close menu'}).text('close')))
                                        )));
        this.html.control_menu = this.html.map.find('.ibs-control-menu');
        this.html.control_menu.hide();
        this.html.control_menu.find('[action=markermanager]').prop('checked', this.options.markerManager.set);
        this.html.map
                .append($('<div>').addClass('ibs-draw-menu ibs-custom-control ibs-pac-controls')
                        .append($('<div>')
                                .append($('<a>').addClass('ibs-menu-select').text('drawing').attr({menu: 'draw', title: 'draw menu', href: "#"}))
                                .append($('<ul>').addClass('ibs-draw-list ibs-menu-list ibs-menu-controls')
                                        .append($('<li>').addClass('ibs-img-line ibs-icon')
                                                .append($('<a>').addClass('ibs-draw-item').attr({action: 'draw-line', href: '#', title: 'add route'}).text('add route')))
                                        .append($('<li>').addClass('ibs-img-marker ibs-icon')
                                                .append($('<a>').addClass('ibs-draw-item').attr({action: 'add-poi', href: '#', title: 'add place of interest"'}).text('add poi')))
                                        .append($('<li>').addClass('ibs-checkbox')
                                                .append($('<label>')
                                                        .append($('<input>').addClass('ibs-draw-item').attr({type: 'checkbox', action: 'followroad', href: '#', title: 'follow road'}))
                                                        .append($('<span>').text('follow road'))))
                                        .append($('<li>').addClass('ibs-checkbox')
                                                .append($('<label>')
                                                        .append($('<input>').addClass('ibs-draw-item').attr({type: 'checkbox', action: 'avoidhighways', href: '#', title: 'avoid highways'}))
                                                        .append($('<span>').text('avoid hwys'))))
                                        .append($('<li>').addClass('ibs-radio')
                                                .append($('<label>')
                                                        .append($('<input>').addClass('ibs-draw-item').attr({type: 'radio', name: 'travelmode', value: 'DRIVING', href: '#', title: 'travel mode driving'}))
                                                        .append($('<span>').text('driving'))))
                                        .append($('<li>').addClass('ibs-radio')
                                                .append($('<label>')
                                                        .append($('<input>').addClass('ibs-draw-item').attr({type: 'radio', name: 'travelmode', value: 'BICYCLING', href: '#', title: 'travel mode bicycling'}))
                                                        .append($('<span>').text('bicycling'))))
                                        .append($('<li>').addClass('ibs-radio')
                                                .append($('<label>')
                                                        .append($('<input>').addClass('ibs-draw-item').attr({type: 'radio', name: 'travelmode', value: 'WALKING', href: '#', title: 'travel mode walking'}))
                                                        .append($('<span>').text('walking'))))
                                        .append($('<li>').addClass('ibs-radio')
                                                .append($('<label>')
                                                        .append($('<input>').addClass('ibs-draw-item').attr({type: 'radio', name: 'travelmode', value: 'TRANSIT', href: '#', title: 'travel mode transit'}))
                                                        .append($('<span>').text('transit'))))
                                        .append($('<li>').addClass('ibs-img-close ibs-icon')
                                                .append($('<a>').addClass('ibs-draw-item').attr({action: 'close', href: '#', title: 'close menuy'}).text('close')))

                                        )));
        this.html.draw_menu = this.html.map.find('.ibs-draw-menu');
        this.html.draw_menu.hide();
        this.html.draw_menu.find('[action=followroad]').prop('checked', this.options.followRoad);
        this.html.draw_menu.find('[action=avoidhighways]').prop('checked', this.options.avoidHighways);
        this.html.draw_menu.find('[value=DRIVING]').prop('checked', this.options.travelMode === 'DRIVING');
        this.html.draw_menu.find('[value=BICYCLING]').prop('checked', this.options.travelMode === 'BICYCLING');
        this.html.draw_menu.find('[value=WALKING]').prop('checked', this.options.travelMode === 'WALKING');
        this.html.draw_menu.find('[value=TRANSIT]').prop('checked', this.options.travelMode === 'TRANSIT');
        this.html.map
                .append($('<div>').addClass('ibs-route-menu ibs-pac-controls')
                        .append($('<div>')
                                .append($('<ul>').addClass('ibs-route-list ibs-menu-list ibs-menu-controls')
                                        .append($('<li>').addClass('ibs-img-extend ibs-icon')
                                                .append($('<a>').addClass('ibs-route-item').attr({action: 'extend', href: '#', title: 'extend route'}).text('extend')))
                                        .append($('<li>').addClass('ibs-img-undo ibs-icon')
                                                .append($('<a>').addClass('ibs-route-item').attr({action: 'undo', href: '#', title: 'undo last action"'}).text('undo')))
                                        .append($('<li>').addClass('ibs-img-refresh')
                                                .append($('<a>').addClass('ibs-route-item').attr({action: 'rebuild', href: '#', title: 'rebuild route'}).text('rebuild')))
                                        .append($('<li>').addClass('ibs-img-focus ibs-icon')
                                                .append($('<a>').addClass('ibs-route-item').attr({action: 'focus', href: '#', title: 'focus on route'}).text('focus')))

                                        .append($('<li>').addClass('ibs-img-cue ibs-icon')
                                                .append($('<a>').addClass('ibs-route-item').attr({action: 'cuesheet', href: '#', title: 'cuesheet'}).text('cuesheet')))

                                        .append($('<li>').addClass('ibs-img-cue ibs-icon')
                                                .append($('<a>').addClass('ibs-route-item').attr({action: 'directions', href: '#', title: 'directions'}).text('directions')))

                                        .append($('<li>').addClass('ibs-img-chart ibs-icon')
                                                .append($('<a>').addClass('ibs-route-item').attr({action: 'elevation', href: '#', title: 'route elevation profile'}).text('elevation')))
                                        .append($('<li>').addClass('ibs-img-append ibs-icon')
                                                .append($('<a>').addClass('ibs-route-item').attr({action: 'append', href: '#', title: 'append to nearest route'}).text('append')))
                                        .append($('<li>').addClass('ibs-img-flip ibs-icon')
                                                .append($('<a>').addClass('ibs-route-item').attr({action: 'flip', href: '#', title: 'reverse travel direction of all route'}).text('reverse')))
                                        .append($('<li>').addClass('ibs-img-thin ibs-icon')
                                                .append($('<a>').addClass('ibs-route-item').attr({action: 'thin', href: '#', title: 'thin the number of map points'}).text('thin')))
                                        .append($('<li>').addClass('ibs-img-close ibs-icon')
                                                .append($('<a>').addClass('ibs-route-item').attr({action: 'close', href: '#', title: 'close menu'}).text('close')))
                                        )));
        this.html.route_menu = this.html.map.find('.ibs-route-menu');
        this.html.route_menu.hide();
        this.html.map
                .append($('<div>').addClass('ibs-search-box')
                        .append($('<div>').addClass('ibs-custom-control').css('width', 'auto')
                                .append($('<div>').addClass('ibs-menu-bar')
                                        .append('<input class="ibs-pac-input" type="text" placeholder="search box" value=""/> '))));
        this.html.search_box = this.html.map.find('.ibs-search-box');
        this.html.map
                .append($('<div>').addClass('ibs-search-info ibs-info-node').hide()
                        .append($('<div>')
                                .append($('<div>')
                                        .append($('<div>').addClass('ibs-search-info-name'))
                                        .append($('<hr>'))
                                        .append($('<div>').addClass('ibs-search-info-content')
                                                .append($('<div>').addClass('ibs-search-info-address'))
                                                .append($('<div>').addClass('ibs-search-info-phone'))
                                                .append($('<div>').addClass('ibs-search-info-desc'))
                                                .append($('<div>')
                                                        .append($('<a>').addClass('ibs-search-info-web').attr({href: "#", target: "_blank"}).text('website'))))
                                        .append($('<hr>'))
                                        .append($('<div>').addClass('ibs-search-info-menu ibs-admin-only')
                                                .append($('<a>').addClass('ibs-search-info-mark').text('placemark this')
                                                        )))));
        this.html.search_info = this.html.map.find('.ibs-search-info');
        if (this.options.args.admin) {
            this.html.map
                    .append($('<div>').addClass('ibs-segment-infowindow ibs-info-node').hide()
                            .append($('<span>').addClass('ibs-info-name').text('segment name'))
                            .append($('<div>').addClass('ibs-info-desc').text('segment description'))
                            .append($('<div>')
                                    .append($('<a>').addClass('ibs-info-modify-segment').attr({rel: '', action: 'edit'}).text('edit'))
                                    .append($('<a>').addClass('ibs-info-modify-segment').css({'margin-left': '10px'}).attr({rel: '', action: 'remove'}).text('remove'))
                                    .append($('<a>').addClass('ibs-info-modify-segment').css({'margin-left': '10px'}).attr({rel: '', action: 'more', href: '#'}).text('more...'))
                                    ));
            this.html.map
                    .append($('<div>').addClass('ibs-placemark-infowindow ibs-info-node').hide()
                            .append($('<span>').addClass('ibs-info-name'))
                            .append($('<div>').addClass('ibs-info-desc'))
                            .append($('<div>').addClass('ibs-admin-only')
                                    .append($('<a>').addClass('ibs-info-modify-placemark').attr({rel: '', action: 'edit'}).text('edit'))
                                    .append($('<a>').addClass('ibs-info-modify-placemark').css({'margin-left': '10px'}).attr({rel: '', action: 'remove'}).text('remove'))
                                    ));
        } else {
            this.html.map
                    .append($('<div>').addClass('ibs-segment-infowindow ibs-info-node').hide()
                            .append($('<span>').addClass('ibs-info-name').text('segment name'))
                            .append($('<div>').addClass('ibs-info-desc').text('segment description'))
                            .append($('<div>').addClass('ibs-segment-infowindow-links')
                                    .append($('<a>').addClass('ibs-info-modify-segment ibs-show-cuesheet').attr({title: 'show cuesheet', href: '#'}).text('cuesheet'))
                                    ));

            if (this.options.args.elevation) {
                this.html.map.find('.ibs-segment-infowindow-links')
                        .append($('<span>').css({width:'10px', display:'inline-block'}))
                        .append($('<a>').addClass('ibs-info-modify-segment ibs-show-profile ibs-elevation-only')
                                .attr({title: 'show elevation profile', href: '#'}).text('elevation'));
            }
            this.html.map
                    .append($('<div>').addClass('ibs-placemark-infowindow ibs-info-node').hide()
                            .append($('<span>').addClass('ibs-info-name'))
                            .append($('<div>').addClass('ibs-info-desc')));
        }
//initialize
        this.html.file_dialog.find('.ibs-file-dialog-color-select').colorpicker({
            size: 20,
            label: 'Color ',
            hide: true
        });
        this.html.segment_dialog.find('.ibs-segment-dialog-color-select').colorpicker({
            size: 20,
            label: 'Color ',
            hide: true
        });
        this.html.dialogs.find('.ibs-cp-cancel').attr('src', this.options.args.url + 'image/x.png');
        this.html.file_dialog.find('.ibs-reset-lines').button({
            text: true,
            label: 'Set Lines',
            icons: {
                primary: 'ui-icon-arrowreturnthick-1-e'
            }
        });
        $('.ibs-colorpicker-trigger').attr({'title': 'click to change color'});
        $('[title]').each(function (index, item) {
            $(item).qtip(
                    {
                        surpress: true,
                        position: {my: 'top left',
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
                            delay: 250, event: 'mouseout mouseleave'

                        }
                    }
            );
        });

        $.getJSON(this.options.args.ajax, {
            action: 'ibs_mappro_index',
            func: 'dirs',
            nonce: this.options.args.nonce,
            dir: this.options.args.libpath + 'icons'
        })
                .done(function (data) {
                    for (var i in data) {
                        mappro.html.icon_lib_select
                                .append($('<option>').addClass('ibs-icon-lib').attr({value: data[i]}).text(data[i]));
                    }
                })
    };
})(jQuery);