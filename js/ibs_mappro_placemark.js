function Placemark(mappro, args) {
    this.run(mappro, args);
}
(function ($) {
    Placemark.prototype.run = function (mappro, args) {
        this.options = {
            fid: null,
            pid: null,
            name: null,
            desc: null,
            url: null,
            symbol: null,
            position: null,
            visible: true
        };
        this.options = args;
        this.placemarkItem = '.ibs-placemark-item-name[rel="' + this.options.pid + '"]';
        this.placemarkImage = '.ibs-placemark-item-image[rel="' + this.options.pid + '"]';
        this.setName = function (name) {
            this.options.name = name;
            this.marker.setTitle(name);
            if (this.options.symbol === 'Waypoint') {
                mappro.html.waypoint_list.find(this.placemarkItem).text(name);
            } else {
                mappro.html.placemark_list.find(this.placemarkItem).text(name);
            }
        };
        this.setIcon = function () {
            this.marker.setMap(null);
            if (/(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/.test(this.options.url)) {
                this.options.symbol = mappro.getSymbol(this.options.url);
            } else {
                this.options.url = mappro.getUrlFromSymbol(this.options.symbol ? this.options.symbol : '');
            }
            this.marker.setIcon(mappro.getIcon(this.options.url));
            this.marker.setMap(mappro.googlemap);
            this.marker.setVisible(this.options.visible);
        };

        this.remove = function () {
            this.marker.unbind();
            this.marker.setMap(null);
            mappro.file.removePlacemark(this.options.pid);
        };
        this.open = function () {
            mappro.file.openInfo(this);
        };
        this.edit = function () {
            this.placemarkDialog();
        }
        this.placemarkDialog = function () {
            var dialog = null;
            var config = mappro.getCkeditorConfig();
            mappro.infowindow.close();
            if (this.options.symbol === 'Waypoint') { //waypoint
                dialog = mappro.html.waypoint_dialog;
                dialog.find('.ibs-waypoint-dialog-name').val(this.options.name);
                dialog.find('.ibs-waypoint-dialog-fid').val(this.options.fid);
                dialog.find('.ibs-waypoint-dialog-pid').val(this.options.pid);
                dialog.find('.ibs-waypoint-dialog-desc').val(this.options.desc);
                dialog.dialog({
                    autoOpen: true,
                    height: 'auto',
                    width: 600,
                    modal: true,
                    zIndex: 100,
                    buttons: {
                        Update: $.proxy(function () {
                            this.setName(dialog.find('.ibs-waypoint-dialog-name').val());

                            mappro.html.waypoint_list.find(this.placemarkItem).text(dialog.find('.ibs-waypoint-dialog-name').val());
                            this.options.desc = dialog.find('.ibs-waypoint-dialog-desc').val();
                            this.marker.setVisible(true);
                            dialog.dialog('close');
                            mappro.file.setDirty(true);
                        }, this),
                        Close: function () {
                            $(this).dialog('close');
                        }
                    },
                    close: function () {
                        dialog.find('.ibs-waypoint-dialog-desc').ckeditorGet().destroy();
                        $(this).dialog('destroy');
                    },
                    open: function () {
                        dialog.find('.ibs-waypoint-dialog-desc').ckeditor(config);
                        dialog.find('.ibs-waypoint-dialog-desc').ckeditor().resize('100%', '100%', false);
                        var editor = dialog.find('.ibs-waypoint-dialog-desc').ckeditor().editor;
                        editor.mappro = mappro;
                    },
                    resize: function (ev) {
                        dialog.find('.ibs-waypoint-dialog-desc').ckeditor().resize('100%', '100%', false);
                    }
                });
            } else {
                dialog = mappro.html.placemark_dialog;
                dialog.find('.ibs-placemark-selected-icon').attr('src', this.options.url);
                dialog.find('.ibs-placemark-dialog-name').val(this.options.name);
                dialog.find('.ibs-placemark-dialog-fid').val(this.options.fid);
                dialog.find('.ibs-placemark-dialog-pid').val(this.options.pid);
                dialog.find('.ibs-placemark-dialog-desc').val(this.options.desc);
                dialog.dialog({
                    autoOpen: true,
                    height: 'auto',
                    width: 600,
                    modal: true,
                    buttons: {
                        Update: $.proxy(function () {
                            this.setName(dialog.find('.ibs-placemark-dialog-name').val());
                            this.options.url = dialog.find('.ibs-placemark-selected-icon').attr('src');
                            mappro.html.list.find(this.placemarkImage).attr({src: this.options.url});
                            this.setIcon();
                            this.options.desc = dialog.find('.ibs-placemark-dialog-desc').val();
                            this.marker.setVisible(true);
                            dialog.dialog('close');
                            mappro.file.setDirty(true);
                        }, this),
                        Close: function () {
                            $(this).dialog('close');
                        }
                    },
                    close: function () {
                        dialog.find('.ibs-placemark-dialog-desc').ckeditorGet().destroy();
                        $(this).dialog('destroy');
                    },
                    open: function () {
                        dialog.find('.ibs-placemark-dialog-desc').ckeditor(config);
                        dialog.find('.ibs-placemark-dialog-desc').ckeditor().resize('100%', '100%', false);
                        var editor = dialog.find('.ibs-placemark-dialog-desc').ckeditor().editor;
                        editor.mappro = mappro;
                    },
                    resize: function (ev) {
                        dialog.find('.ibs-placemark-dialog-desc').ckeditor().resize('100%', '100%', false);
                    }
                });
            }
        };
        this.setPlacemarkItem = function () {
            var rel = this.options.pid;
            var d = $('<div>').html(this.options.desc).contents().filter(function () {
                return !!$.trim(this.innerHTML || this.data);
            })
                    .first();
            var label = '<label>' + this.options.name + '</label>' + '<div>' + $(d).text().slice(0, 300) + '</div>';
            var item = $('<li>').addClass('ibs-placemark-item-' + rel)
                    .append($('<img>').addClass("ibs-placemark-item-image").css({height: '18px'}).attr({'rel': rel, 'alt': "image", 'src': this.marker.icon.url}))
                    .append($('<a>').addClass('ibs-placemark-item-name name').attr({'rel': rel, 'href': "#", 'title': ""}).html(label)
                            );
            if (this.options.symbol === 'Waypoint') {
                mappro.html.waypoint_list.append($(item));
            } else {
                mappro.html.placemark_list.append($(item));
            }
        };
        this.marker = new google.maps.Marker({
            position: this.options.position,
            map: null,
            title: this.options.name,
            draggable: mappro.options.args.admin && this.options.symbol !== 'Waypoint',
            zIndex: 999,
            optimized: false,
            placemark: this,
            visible: false
        });
        this.setIcon();
        this.setPlacemarkItem();
        mappro.html.placemark_list.find('.ibs-placemark-item-image[pid=' + this.options.pid + ']').attr('src', this.marker.icon.url);
        mappro.html.waypoint_list.find('.ibs-placemark-item-image[pid=' + this.options.pid + ']').attr('src', this.marker.icon.url);

        google.maps.event.addListener(this.marker, 'click', $.proxy(function (event) {
            if (this.options.symbol === 'Waypoint') {
                mappro.html.waypoint_list.find(this.placemarkItem).trigger('click');
            } else {
                mappro.html.placemark_list.find(this.placemarkItem).trigger('click');
            }
        }, this));
        google.maps.event.addListener(this.marker, 'dragend', $.proxy(function (event) {
            this.options.position = this.marker.getPosition();
        }, this));
        google.maps.event.addListener(this.marker, 'mouseover', $.proxy(function (event) {
        }, this));
    }
})(jQuery);