
function ShortcodeDialog(args) {
    this.run(args);
}
(function ($) {
    ShortcodeDialog.prototype.run = function (args) {
        var dialog =
                $('<div>').addClass('ibs-shortcode-dialog').attr({title: 'Insert IBS Mappro Shortcode'}).hide()
                .append($('<div>').addClass('ibs-dialog-header ibs-shortcode-div')
                        .append($('<div>').addClass('ibs-section-header').html('Select from map library'))
                        .append($('<div>').addClass('ibs-shortcode-browser-div')
                                .append($('<div>').addClass('ibs-shortcode-browser JQueryFTD')))
                        .append($('<div>').addClass('ibs-section-header').html('Options'))
                        .append($('<div>')
                                .append($('<label>').text('mode'))
                                .append($('<label>').text('post/page'))
                                .append($('<input>').addClass('ibs-shortcode-option ibs-shortcode-radio').attr({name: 'admin', type: 'radio', value: 'off', title: 'for inserting standard map into post or page'}).prop('checked', true))
                                .append($('<label>').text('admin'))
                                .append($('<input>').addClass('ibs-shortcode-option ibs-shortcode-radio').attr({name: 'admin', type: 'radio', value: 'on', title: 'insert admin map into a secure page'})))
                        .append($('<div>')
                                .append($('<label>').text('with'))
                                .append($('<label>').text('list'))
                                .append($('<input>').addClass('ibs-shortcode-option ibs-shortcode-ckb').attr({name: 'list', type: 'checkbox', value: 'on', title: 'add poi, seg, and wps list to map'}))
                                .append($('<label>').text('controls'))
                                .append($('<input>').addClass('ibs-shortcode-option ibs-shortcode-ckb').attr({name: 'controls', type: 'checkbox', value: 'on', title: 'add display controls for map'}))
                                .append($('<label>').text('search'))
                                .append($('<input>').addClass('ibs-shortcode-option ibs-shortcode-ckb').attr({name: 'search', type: 'checkbox', value: 'on', title: 'add search box to map'}))
                                .append($('<label>').text('elevation'))
                                .append($('<input>').addClass('ibs-shortcode-option ibs-shortcode-ckb').attr({name: 'elevation', type: 'checkbox', value: 'on', title: 'add elevation display panel'})))

                        .append($('<div>')
                                .append($('<label>').text('controls'))
                                .append($('<label>').text('daggable'))
                                .append($('<input>').addClass('ibs-shortcode-option ibs-shortcode-ckb').attr({name: 'drag', type: 'checkbox', value: 'on', title: 'map draggable'}))
                                .append($('<label>').text('maps'))
                                .append($('<input>').addClass('ibs-shortcode-option ibs-shortcode-ckb').attr({name: 'maptype', type: 'checkbox', value: 'on', title: 'map types dropdown list'}))
                                .append($('<label>').text('scroll'))
                                .append($('<input>').addClass('ibs-shortcode-option ibs-shortcode-ckb').attr({name: 'scroll', type: 'checkbox', value: 'on', title: 'scrollwheel zooms'}))
                                .append($('<label>').text('st.view'))
                                .append($('<input>').addClass('ibs-shortcode-option ibs-shortcode-ckb').attr({name: 'streetview', type: 'checkbox', value: 'on', title: 'streetview control'}))
                                .append($('<label>').text('zoom'))
                                .append($('<input>').addClass('ibs-shortcode-option ibs-shortcode-ckb').attr({name: 'zoom', type: 'checkbox', value: 'on', title: 'zoom control'})))

                        .append($('<div>')
                                .append($('<label>').text('mrkr-mgr'))
                                .append($('<input>').addClass('ibs-shortcode-option ibs-shortcode-ckb').attr({name: 'markerManager', type: 'checkbox', value: 'on', title: 'activate the marker manager'})))
                        .append($('<div>')
                                .append($('<label>').text('title'))
                                .append($('<input>').addClass('ibs-shortcode-option ibs-shortcode-txt').attr({name: 'title', type: 'text', value: ''})))
                        .append($('<div>')
                                .append($('<label>').text('tag'))
                                .append($('<input>').addClass('ibs-shortcode-option ibs-shortcode-txt').attr({name: 'tag', type: 'text', value: ''})))
                        .append($('<div>')
                                .append($('<label>').text('width'))
                                .append($('<input>').addClass('ibs-shortcode-option ibs-shortcode-num').attr({name: 'width', type: 'number', value: '550', min: '100'}))
                                .append($('<label>').text('height'))
                                .append($('<input>').addClass('ibs-shortcode-option ibs-shortcode-num').attr({name: 'height', type: 'number', value: '550', min: '100'}))
                                .append($('<label>').text('align'))
                                .append($('<select>').attr({name: 'align'}).addClass('shortcode-option')
                                        .append($('<option>').attr({value: 'left'}).text('left').prop('selected', true))
                                        .append($('<option>').attr({value: 'center'}).text('center'))
                                        .append($('<option>').attr({value: 'right'}).text('right'))))
                        .append($('<div>').addClass('ibs-section-header').text('Map url(s)'))
                        .append($('<input>').addClass('ibs-shortcode-url ibs-shortcode-option').attr({name: 'maps', type: 'text', value: ''}).css('width', '100%'))
                        .append($('<div>').addClass('ibs-section-header').text('Shortcode'))
                        .append($('<textarea>').attr({cols: '100', rows: '5', name: 'maps', wrap: 'soft'}).addClass('ibs-shortcode-result'))
                        .append($('<div>').hide()
                                .append($('<div class="ibs-upload-button" >').html('Browse'))
                                .append($('<input class="ibs-upload-target-directory" >').attr({type: "text", size: "75", value: "/"}))
                                .append($('<ul class="ibs-upload-list" >').addClass(' ibs-file-list'))));

        var uploader = dialog.find('.ibs-upload-button').fineUploader({
            listElement: dialog.find('.ibs-upload-list'),
            request: {
                endpoint: args.url + 'lib/server/endpoint.php',
                params: {multiples: false, dir: args.libpath + 'uploads/'}
            },
            debug: false
        });
        uploader.on('complete', '', {}, function (event, id, fileName, responseJSON) {
            var url = args.liburl + 'uploads/' + fileName;
            dialog.find('.ibs-shortcode-url').val(url);
            dialog.find('.ibs-shortcode-url').trigger('change');
        });
        dialog.dialog({
            autoOpen: true,
            modal: true,
            width: '500',
            buttons: {
                Upload: function () {
                    var a = dialog.find('.ibs-upload-button');
                    var b = a.find('input[qq-button-id]');
                    var c = a.find('input');
                    c.trigger('click');
                },
                Finish: function () {
                    if (wp) {
                        wp.media.editor.insert(dialog.find('textarea').val());
                        dialog.dialog('close');
                    }
                },
                Cancel: function () {
                    dialog.dialog('close');
                }
            },
            close: function () {
                dialog.dialog('destroy');
            },
            open: function () {
                var dir = args.libpath + 'maps/';
                dialog.find('.ibs-shortcode-browser').fileTree({
                    root: dir,
                    script: args.ajax + '?action=ibs_mappro_index&func=folders&type=map&nonce=' + args.nonce,
                    folderEvent: 'click',
                    expandSpeed: 0,
                    collapseSpeed: 0,
                    multiFolder: false
                }, function (file) {
                    var ff = ['%maps%'];
                    dialog.find('.ibs-shortcode-browser').find('a.selected').each(function () {
                        var f = $(this).attr('rel');
                        var u = f.replace(args.libpath + 'maps/', '')
                        ff.push(u);
                    })
                    if (ff.length === 1) {
                        dialog.find('.ibs-shortcode-url').val('');
                    } else {
                        dialog.find('.ibs-shortcode-url').val(ff.join(';'));
                    }
                    dialog.find('.ibs-shortcode-url').trigger('change');

                },
                        function (dir) {
                            //
                        }
                );
                dialog.on('change', '.ibs-shortcode-option', {}, function () {
                    var result = '[ibs-mappro ';
                    if (dialog.find('input[name=admin]:checked').val() === 'on') {
                        result += 'admin="on" ';
                        dialog.find('.ibs-shortcode-ckb').prop('checked', false).prop('disabled', true).prop('checked',true);
                    } else {
                        dialog.find('.ibs-shortcode-ckb').prop('disabled', false)
                    }
                    dialog.find('select').each(function (index, item) {
                        if ($(item).val() !== '') {
                            result += $(item).attr('name') + '="' + $(item).val() + '" ';
                        }
                    });
                    dialog.find('input[type="text"].ibs-shortcode-option').each(function (index, item) {
                        if ($(item).val() !== '' ){
                            result += $(item).attr('name') + '="' + $(item).val() + '" ';
                        }
                    });
                    dialog.find('input[type="number"]').each(function (index, item) {
                        if ($(item).val() !== '') {
                            result += $(item).attr('name') + '="' + $(item).val() + '" ';
                        }
                    });
                    dialog.find('input[type="checkbox"]').each(function (index, item) {
                        if ($(item).is(':checked')) {
                            result += $(item).attr('name') + '="' + $(item).val() + '" ';
                        }
                    });

                    dialog.find('.ibs-shortcode-result').val(result + ']');

                });
            }
        });
    }
})(jQuery);
function TrackingDialog(args) {
    this.run(args);
}
(function ($) {
    TrackingDialog.prototype.run = function (args) {
        var dialog =
                $('<div>').addClass('ibs-shortcode-dialog').attr({title: 'Insert IBS Mappro Tracking'}).hide()
                .append($('<div>').addClass('ibs-dialog-header ibs-shortcode-div')
                        .append($('<div>').addClass('ibs-section-header').html('Current tracked names'))
                        .append($('<div>').addClass('ibs-shortcode-select-div')
                                .append($('<select>').addClass('ibs-shortcode-select')
                                        .append($('<option value=""></option>'))))
                        .append($('<div>').addClass('ibs-section-header').html('Track'))
                        .append($('<div>')
                                .append($('<label>').text('id'))
                                .append($('<input>').addClass('ibs-shortcode-option ibs-shortcode-text').attr({name: 'id', type: 'text', value: '', title: 'marker name'})))
                        .append($('<div>')
                                .append($('<label>').text('where'))
                                .append($('<input>').addClass('ibs-shortcode-option ibs-shortcode-text').attr({name: 'where', type: 'text', value: '', title: 'where marker is'})))
                        .append($('<div>')
                                .append($('<label>').text('msg'))
                                .append($('<input>').addClass('ibs-shortcode-option ibs-shortcode-text').attr({name: 'msg', type: 'text', value: '', title: 'message'})))
                        .append($('<div>').addClass('ibs-section-header').text('Shortcode'))
                        .append($('<textarea>').attr({cols: '100', rows: '5', name: 'maps', wrap: 'soft'}).addClass('ibs-shortcode-result'))
                        );
        dialog.dialog({
            autoOpen: true,
            modal: true,
            width: '500',
            buttons: {
                Finish: function () {
                    if (wp) {
                        wp.media.editor.insert(dialog.find('textarea').val());
                        dialog.dialog('close');
                    }
                },
                Cancel: function () {
                    dialog.dialog('close');
                }
            },
            close: function () {
                dialog.dialog('destroy');
            },
            open: function () {
                $.getJSON(args.ajax, {
                    action: 'ibs_mappro_index',
                    func: 'tracking',
                    nonce: args.nonce
                }).done(function (data, status) {
                    for (var i in data) {
                        dialog.find('.ibs-shortcode-select')
                                .append($('<option>').attr({value: i, where: data[i].where, msg: data[i].msg}).text(i));
                    }
                });
                dialog.on('change', '.ibs-shortcode-select', {}, function () {
                    var id = dialog.find('select').val();
                    dialog.find('[name=id]').val(dialog.find('select').val());
                    dialog.find('[name=where]').val(dialog.find('[value="' + id + '"]').attr('where'));
                    dialog.find('[name=msg]').val(dialog.find('[value="' + id + '"]').attr('msg'));
                    dialog.find('.ibs-shortcode-option').trigger('change');
                });
                dialog.on('change', '.ibs-shortcode-option', {}, function () {
                    var result = '[ibs-track ';
                    dialog.find('input[type="text"]').each(function (index, item) {
                        if ($(item).val() !== '') {
                            result += $(item).attr('name') + '="' + $(item).val() + '" ';
                        }
                    });
                    dialog.find('.ibs-shortcode-result').val(result + ']');
                });
            }
        });
    }
})(jQuery);
