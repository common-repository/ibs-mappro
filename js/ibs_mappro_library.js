function UploadLibraryDialog(args) {
    this.run(args);
}
(function ($) {
    UploadLibraryDialog.prototype.run = function (args) {
        var dialog = $('<div class="ibs-upload-dialog" >').attr('title', 'Upload Icons').hide()
                .append($('<div class="ibs-upload-browser" >'))
                .append($('<div>')
                        .append($('<span>')
                                .append($('<div>').addClass('ibs-section-header').html('Target'))
                                .append($('<div>')
                                        .append($('<input class="ibs-upload-target-directory" >').attr({type: "text", size: "75", value: "/"})))))
                .append($('<div>')
                        .append($('<span>')
                                .append($('<div>').addClass('ibs-section-header').css({'font-size': '.9em', 'padding-left': '5px'}).html('status'))
                                .append($('<div >').addClass('ibs-map-upload-div ibs-file-list-div').css('height', '100px')
                                        .append($('<ul class="ibs-upload-list" >').addClass(' ibs-file-list'))))
                        .append($('<div>').hide()
                                .append($('<div class="ibs-upload-button" >').html('Browse'))));
        var uploader = dialog.find('.ibs-upload-button').fineUploader({
            listElement: dialog.find('.ibs-upload-list'),
            request: {
                endpoint: args.url + 'lib/server/endpoint.php',
                params: {'dir': args.libpath}
            },
            debug: false
        });
        uploader.on('complete', '', {}, function (event, id, fileName, responseJSON) {

        });
        dialog.on('change', '.ibs-upload-target-directory', {}, function (event) {
            var root = args.libpath;
            var newdir = dialog.find('.ibs-upload-target-directory').val().replace(root, '');
            if (newdir.indexOf(root) === -1) {
                newdir = root + newdir;
            }
            if (newdir === root) {
                newdir = root + 'new/';
            }
            newdir = newdir + "/";
            newdir = newdir.replace('//', '/');
            var dir_file = newdir.replace(root, '');
            dialog.find('.ibs-upload-target-directory').val(dir_file).focus();
            uploader.fineUploader('setParams', {'dir': newdir});
        });
        dialog.dialog({
            autoOpen: true,
            width: 'auto',
            modal: true,
            buttons: {
                'Select Files': $.proxy(function () {
                    var a = dialog.find('.ibs-upload-button');
                    var b = a.find('input[qq-button-id]');
                    var c = a.find('input');
                    c.trigger('click');
                }, this),
                Clear: function () {
                    dialog.find('.ibs-upload-list').empty();
                },
                Close: function () {
                    dialog.dialog('close');
                }
            },
            close: function () {
                dialog.dialog('destroy');
            },
            open: function () {
                var initdir = args.libpath + 'icons/new/';
                dialog.find('.ibs-upload-target-directory').val('new/');
                uploader.fineUploader('setParams', {'dir': initdir});
                dialog.find('.ibs-upload-browser').fileTree({
                    root: args.libpath,
                    script: args.ajax + '?action=ibs_mappro_index&func=folders&type=dir&nonce=' + args.nonce,
                    folderEvent: 'click',
                    expandSpeed: 1000,
                    collapseSpeed: 1000,
                    multiFolder: false
                }, function (file) {
                    alert(file);
                }, function (dir) {
                    dialog.find('.ibs-upload-target-directory').val(dir);
                    dialog.find('.ibs-upload-target-directory').trigger('change');
                }
                );
            }
        });
    }
})(jQuery);
function CleanLibraryDialog(args) {
    this.run(args);
}
(function ($) {
    CleanLibraryDialog.prototype.run = function (args) {
        console.log(args.libpath);
        var dialog = $('<div class="ibs-clean-dialog" >').attr('title', 'Manage Folders').hide()
                .append($('<div class="ibs-clean-browser" >'))
                .append($('<div>')
                        .append($('<span>')
                                .append($('<div>').addClass('ibs-section-header').html('Target'))
                                .append($('<div>')
                                        .append($('<input class="ibs-clean-target-directory" >').attr({type: "text", size: "75", value: "/", disabled: true})))));
        dialog.find('.ibs-clean-target-directory').val('')
        dialog.dialog({
            autoOpen: true,
            width: 'auto',
            modal: true,
            buttons: {
                'Remove Files': function () {
                    var files = '';
                    dialog.find('.ibs-clean-browser').find('LI A.selected').each(function (index) {
                        files += $(this).attr('rel') + ';';
                    });
                    if (files.length > 0) {
                        $.get(args.ajax, {
                            action: 'ibs_mappro_index',
                            func: 'remove',
                            nonce: args.nonce,
                            type: 'files',
                            dir: args.libpath + dialog.find('.clean-target-directory').val(),
                            files: files
                        }).done(function () {
                            dialog.find('.clean-browser').find('LI A.selected').remove();
                        });
                    }
                },
                'Remove Folder': function () {
                    $.get(args.ajax, {
                        action: 'ibs_mappro_index',
                        func: 'remove',
                        nonce: args.nonce,
                        type: 'directory',
                        dir: args.libpath + dialog.find('.clean-target-directory').val()
                    }).done(function () {
                        dialog.find('.ibs-clean-browser').find('LI.expanded').remove();
                        dialog.find('.ibs-clean-target-directory').val().replace('/', '');
                    })
                },
                Close: function () {
                    dialog.dialog('close');
                }
            },
            close: function () {
                dialog.dialog('destroy');
            },
            open: function () {
                dialog.find('.ibs-clean-browser').fileTree({
                    root: args.libpath,
                    script: args.ajax + '?action=ibs_mappro_index&func=folders&type=all&nonce=' + args.nonce,
                    folderEvent: 'click',
                    expandSpeed: 0,
                    collapseSpeed: 0,
                    multiFolder: false
                }, function (file) {
                }, function (dir) {
                    dialog.find('.ibs-clean-target-directory').val(dir.replace(args.libpath, ''));
                }
                );
            }
        });
    }
})(jQuery);
function BrowseImagesDialog(args, editor, func) {
    this.run(args, editor, func);
}
(function ($) {
    BrowseImagesDialog.prototype.run = function (args, editor, func) {
        var dialog = $('<div>').addClass('ibs-browse-dialog').attr('title', 'Browse images').css({'z-index': '10050'}).hide()
                .append($('<div>').addClass('ibs-dialog-header')
                        .append($('<div>').addClass('ibs-section-header').text('preview'))
                        .append($('<div>').css({height: '200px', width: '400px', overflow: 'hidden'}).addClass('ibs-image-html')
                                .append($('<div>').addClass('ibs-image-frame').css({float: 'left'})
                                        .append($('<img>').attr({src: args.url + 'image/BigBend.png'}).css({height: '200px', width: 'auto'}).addClass('ibs-image-preview'))))
                        .append($('<div>').addClass('ibs-section-header').html('size').hide())
                        .append($('<div>').addClass('ibs-section-header').html('Image Libaray'))
                        .append($('<div>').addClass('ibs-image-browser-div').css({height: '150px', 'overflow-y': 'auto', 'overflow-x': 'hidden'})
                                .append($('<div>').addClass('ibs-image-browser JQueryFTD'))))
                .append($('<div>').hide()
                        .append($('<div class="ibs-upload-button" >').html('Browse'))
                        .append($('<input class="ibs-upload-target-directory" >').attr({type: "text", size: "75", value: "/"}))
                        .append($('<ul class="ibs-upload-list" >').addClass(' ibs-file-list')));
        var id = '#' + $(editor.mappro.options.args.div).attr('id');
        var uploader = dialog.find('.ibs-upload-button').fineUploader({
            listElement: dialog.find('.ibs-upload-list'),
            request: {
                endpoint: args.url + 'lib/server/endpoint.php',
                params: {'multiples:false, dir': args.libpath + 'images/'}
            },
            debug: false
        });
        uploader.on('complete', '', {}, function (event, id, fileName, responseJSON) {
            var url = currentDirectory.replace(args.libpath, args.liburl) + fileName;
            CKEDITOR.tools.callFunction(func, url);
            dialog.dialog('close');
        });
        var currentDirectory = args.libpath + 'images/';
        dialog.dialog({
            autoOpen: true,
            width: 'auto',
            modal: true,
            position: {my: 'left top', at: 'left top', of: id},
            buttons: {
                Upload: function () {
                    var a = dialog.find('.ibs-upload-button');
                    var b = a.find('input[qq-button-id]');
                    var c = a.find('input');
                    c.trigger('click');
                },
                Insert: function () {
                    var url = dialog.find('.ibs-image-preview').attr('src');
                    CKEDITOR.tools.callFunction(func, url);
                    dialog.dialog('close');
                },
                Close: function () {
                    $(this).dialog('close');
                }
            },
            close: function () {
                $(this).dialog('destroy');
            },
            open: function () {
                $('.ibs-browse-dialog').css({position: 'relative'})
                dialog.find('.ibs-image-browser').fileTree({
                    root: args.libpath + 'images/',
                    script: args.ajax + '?action=ibs_mappro_index&func=folders&type=img&nonce=' + args.nonce,
                    folderEvent: 'click',
                    expandSpeed: 0,
                    collapseSpeed: 0,
                    multiFolder: false
                }, function (file) {
                    dialog.find('.ibs-image-browser').find('LI A.selected').each(function (index) {
                        if (file !== $(this).attr('rel')) {
                            $(this).removeClass('selected');
                        } else {
                            var path = $(this).attr('rel');
                            url = path.replace(args.libpath, args.liburl);
                            dialog.find('.ibs-image-preview').attr('src', url);
                        }
                    });
                }, function (dir) {
                    var root = args.libpath + 'images/';
                    var newdir = dir.replace(root, '');
                    if (newdir.indexOf(root) === -1) {
                        newdir = root + newdir;
                    }
                    if (newdir === root) {
                        newdir = root + 'images/';
                    }
                    newdir = newdir + "/";
                    newdir = newdir.replace('//', '/');
                    currentDirectory = newdir;
                    uploader.fineUploader('setParams', {'dir': newdir});
                });
                dialog.find('.ibs-image-browser').on('mouseover', 'li.file a', {}, function (event) {
                    var url = $(this).attr('rel').replace(args.libpath, args.liburl);
                    dialog.find('.ibs-image-preview').attr('src', url);
                });
                dialog.find('.ibs-image-browser').on('mouseout', 'li.file a', {}, function (event) {
                    var a = dialog.find('a.selected').first();
                    if (a.length) {
                        var path = $(a).attr('rel');
                        url = path.replace(args.libpath, args.liburl);
                        dialog.find('.ibs-image-preview').attr('src', url);
                    } else {
                        dialog.find('.ibs-image-preview').attr('src', args.url + 'image/BigBend.png');
                    }
                });
            }
        });
    };
})(jQuery);
function IconLibraryDialog(args) {
    this.run(args);
}
(function ($) {
    IconLibraryDialog.prototype.run = function (args) {
        var dialog = $('<div class="ibs-icon-dialog" >').attr('title', 'Icon Library').hide()
                .append($('<div>').css({height: '100%', float: 'left'})
                        .append($('<label>').text('target '))
                        .append($('<select>').attr({id: 'target-select'})
                                .append($('<option>').attr({value: ''}).text(''))
                                .append($('<option>').attr({value: '%new%'}).text('new folder').prop('selected', true))
                                )
                        .append($('<div>').addClass('icon-add').attr({title: 'add icon'})
                                .append($('<input>').attr({id: 'icon-add-input', type: 'text', placeholder: "drop icon here to add."})))
                        .append($('<ul>').attr({id: 'target-file-list'}).addClass('icon-palette')))

                .append($('<div>').css({height: '100%', float: 'left'})
                        .append($('<label>').text('source '))
                        .append($('<select>').attr({id: 'source-select'})
                                .append($('<option>').attr({value: '', placeholder: 'select souce libary'})))

                        .append($('<ul>').attr({id: 'source-file-list'}).addClass('icon-palette'))

                        )
                .append($('<div>').hide()
                        .append($('<div class="ibs-upload-button" >').html('Browse'))
                        .append($('<input class="ibs-upload-target-directory" >').attr({type: "text", size: "75", value: "/"}))
                        .append($('<ul class="ibs-upload-list" >').addClass(' ibs-file-list')));
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
            add(url, 'copy')
        });
        dialog.dialog({
            autoOpen: true,
            width: 650,
            height: 810,
            resize: false,
            modal: true,
            buttons: {
                Upload: function () {
                    var a = dialog.find('.ibs-upload-button');
                    var b = a.find('input[qq-button-id]');
                    var c = a.find('input');
                    c.trigger('click');
                },
                Update: function () {
                    var lib = $('#target-select').val();
                    var stack = []
                    $('#target-file-list').find('li').each(function (index, item) {
                        var u = $(item).find('input.target-file-url').val();
                        var o = $(item).find('input.target-file-url').attr('rel')
                        var e = $(item).find('input.target-file-name').val();
                        var a = {func: '', url: u, org: o, name: e}
                        if ($(item).hasClass('remove')) {
                            a.func = 'remove'
                            stack.push(a);
                        } else {
                            if ($(item).hasClass('copy') && !$(item).hasClass('replace')) {
                                a.func = 'copy'
                                stack.push(a);
                            } else {
                                if ($(item).hasClass('replace')) {
                                    a.func = 'replace'
                                    stack.push(a);
                                } else {
                                    if ($(item).hasClass('rename')) {
                                        a.func = 'rename'
                                        stack.push(a);
                                    }
                                }
                            }
                        }
                    })
                    var lib = $('#target-select').val();
                    if (lib == '%new%') {
                        lib = prompt("Enter new Icon folder name", "custom")
                        if (lib !== '') {
                            $('#target-select').val(lib);
                            update();
                        }
                    } else {
                        update();
                    }

                    function update() {
                        var c = stack.pop();
                        var a = {
                            action: 'ibs_mappro_index',
                            nonce: args.nonce
                        }
                        console.log(c);
                        switch (c.func) {
                            case 'remove':
                                a.func = 'remove';
                                a.type = 'file';
                                a.filename = c.url.replace(args.liburl, args.libpath)
                                break;
                            case 'replace':
                            case 'copy':
                                a.func = 'copy';
                                a.source = c.url.replace(args.liburl, args.libpath);
                                if (typeof c.org == 'undefined' || c.org === '') {
                                    var x = getExtension(c.url);
                                    a.target = args.libpath + 'icons/' + lib + '/' + c.name + '.' + x;
                                } else {
                                    a.target = c.org.replace(args.liburl, args.libpath);
                                }
                                break;
                            case 'rename':
                                a.func = 'rename';
                                a.type = 'file';
                                a.oldname = c.url.replace(args.liburl, args.libpath);
                                var n = getFilename(a.oldname);
                                a.newname = a.oldname.replace(n, c.name);
                                break;
                        }
                        $.get(args.ajax, a).done(function (data, status) {
                            if (status === 'success' && data.indexOf('error') === -1) {
                                if (stack.length) {
                                    update();
                                } else {
                                    init();
                                }
                            } else {
                                alert(data);
                            }
                        });
                    }
                },
                Close: function () {
                    dialog.dialog('close');
                }
            },
            close: function () {
                dialog.dialog('destroy');
            },
            open: function () {
                init();
            }
        });
        function init() {
            $('#target-select').empty();
            $('#source-select').empty();
            $('#target-select')
                    .append($('<option>').attr({value: ''}).text(''))
                    .append($('<option>').attr({value: '%new%'}).text('new folder').prop('selected', true));
            $('#source-select')
                    .append($('<option>').attr({value: ''}).text(''));
            $.getJSON(args.ajax,
                    {'action': 'ibs_mappro_index',
                        func: 'dirs',
                        'dir': args.libpath + 'icons/',
                        nonce: args.nonce
                    }).done(function (data, status) {
                for (var i in data) {
                    $('#target-select')
                            .append($('<option>').attr({value: data[i]}).text(data[i]));
                    $('#source-select')
                            .append($('<option>').attr({value: data[i]}).text(data[i]));
                }
            });
            $('#target-select').trigger('change');
            $('#source-select').trigger('change');
        }
        $('#target-select').on('change', '', {}, function (even) {
            var target_lib = $('#target-select').val();
            $('#target-file-list').empty();
            if (target_lib !== '' && target_lib !== '%new%') {
                $.getJSON(args.ajax,
                        {'action': 'ibs_mappro_index',
                            func: 'icons',
                            'lib': args.libpath + 'icons/' + target_lib,
                            nonce: args.nonce,
                            cache: false
                        }).done(function (data, status) {
                    for (var i in data) {
                        add(data[i].url, 'library');
                    }
                });
            }
        });
        $('#source-select').on('change', '', {map: this}, function (event) {
            var source_lib = $('#source-select').val();
            $('#source-file-list').empty();
            if (source_lib !== '') {
                $('.map-icon').each(function (index, item) {
                    if ($(item).data("qtip")) {
                        $(item).qtip("destroy", true);
                        $(item).removeData("hasqtip");
                        $(item).removeAttr("data-hasqtip");
                    }
                });
                $.getJSON(args.ajax,
                        {'action': 'ibs_mappro_index',
                            func: 'icons',
                            'lib': args.libpath + 'icons/' + source_lib,
                            nonce: args.nonce
                        }).done(function (data, status) {
                    for (var i in data) {
                        $('#source-file-list')
                                .append('<img class="map-icon" src="' + data[i].url + '" title="' + data[i].name + '" width="32" height="32" />');
                    }
                    $('.map-icon').qtip();
                    $('.map-icon').draggable({
                        revert: true,
                        activeClass: "ui-state-highlight"
                    });
                    $('.map-icon').on('click', '', {}, function (event) {
                        add($(this).attr('src'), 'copy');
                    });
                });
            }
        });
        function add(url, classname) {
            var name = getFilename(url);
            var item = $('<input>').addClass('target-file-name').attr({'type': 'text', 'value': name});
            var bg = "background:url(%url) left top no-repeat; vertical-align:middle;".replace(/%url/, url);
            var final = $('<li>').addClass('target-file-item').attr({'style': bg}).addClass(classname)
                    .append($('<div>')
                            .append(item)
                            .append($('<a>').addClass('icon-delete').text(' ').attr({'href': '#', 'title': 'delete'})))
                    .append($('<input>').addClass('target-file-url').attr({'type': 'hidden', 'value': url}));
            if (classname === 'library') {
                $('#target-file-list').append($(final));
            } else {
                $('#target-file-list').prepend($(final));
            }

            $(item).droppable({
                accept: '.map-icon',
                addClasses: false,
                hoverClass: "ui-state-hover",
                drop: function (event, ui) {
                    var url = ui.draggable.attr('src');
                    $(this).val(getFilename(url));
                    var parent = $(this).parents('li')[0];
                    var org = $(parent).find('.target-file-url').val();
                    $(parent).find('.target-file-url').val(url).attr({rel: org});
                    var bg = "background:url(%url) left top no-repeat; vertical-align:middle;".replace(/%url/, ui.draggable.attr('src'))
                    $(parent).attr('style', bg).addClass('replace');
                }
            });
        }

        $('#icon-add-input').droppable({
            accept: '.map-icon',
            addClasses: false,
            hoverClass: "ui-state-hover",
            drop: function (event, ui) {
                var url = ui.draggable.attr('src');
                add(url, 'copy');
            }
        });
        $('#target-file-list').on('click', '.icon-delete', {}, function (event) {
            $(this).parents('li').eq(0).addClass('remove').hide();
        });
        $('#target-file-list').on('change', '.target-file-name', {}, function (event) {
            $(this).parents('li').eq(0).addClass('rename');
        });
    }
})(jQuery);
function TracksDialog(args) {
    this.run(args);
}
(function ($) {
    TracksDialog.prototype.run = function (mappro) {
        var dialog =
                $('<div>').addClass('ibs-tracking-dialog').attr({title: 'IBS Mappro Tracking'}).hide()
                .append($('<div>').addClass('ibs-dialog-header ibs-tracking-div')
                        .append($('<div>').addClass('ibs-section-header').html('Marker names tracked'))
                        .append($('<div>').addClass('ibs-tracking-select-div controls')
                                .append($('<ul>').addClass('ibs-controls').attr({id: 'tracking-list', title: 'tracking marker list'})
                                        .css({'max-height': '300px', 'overflow-y': 'auto', 'overflow-x': 'hidden'})))
                        .append($('<div>').addClass('ibs-section-header').html('Track'))
                        .append($('<div>')
                                .append($('<label>').html('<span>id</span>').addClass('ibs-first'))
                                .append($('<input>').addClass('tracking-edit').css({width: '350px'})
                                        .attr({id: 'item-id', name: 'id', type: 'text', value: '', title: 'marker name', placeholder: '(required) marker name to track'})
                                        .prop('disabled', true).css({'background-color': 'lightgray'}))
                                .append($('<a>').addClass('icon-delete').text(' ').attr({id: 'delete-tracking', href: '#', title: 'remove tracking'})))
                        .append($('<div>')
                                .append($('<label>').text('date').addClass('ibs-first'))
                                .append($('<input>').addClass('tracking-edit').css({width: '350px'})
                                        .attr({id: 'item-date', name: 'date', type: 'text', value: '', title: 'date last update', placeholder: 'date of last update'})
                                        .prop('disabled', true)
                                        .css({'background-color': '#cfd1cf'})))

                        .append($('<div>')
                                .append($('<label>').html('<span>where</span>').addClass('ibs-first'))
                                .append($('<input>').addClass('tracking-edit').css({width: '350px'})
                                        .attr({id: 'item-where', name: 'where', type: 'text', value: '', title: 'where marker is', placeholder: '(required) where marker is'})))
                        .append($('<div>')
                                .append($('<div>')
                                        .append($('<label>').text('msg')))
                                .append($('<textarea>').addClass('tracking-edit')
                                        .attr({id: 'item-msg', name: 'msg', cols: 50, rows: 3, value: '', title: 'message', placeholder: '(optional) marker message'})))
                        .append($('<div>').addClass('ibs-section-header').text('shortcode'))
                        .append($('<textarea>').attr({id: 'shortcode', cols: '50', rows: '3', name: 'maps', wrap: 'soft', title: 'post shortcode', placeholder: 'shortcode'}).addClass('ibs-tracking-result'))
                        );
        dialog.dialog({
            autoOpen: true,
            modal: true,
            width: '500',
            buttons: {
                Update: function () {
                    var stack = [];
                    $('.tracking-item').each(function (index, item) {
                        if ($(item).attr('name') !== '' && $(item).attr('name') !== '%new%') {
                            stack.push(JSON.parse($(item).attr('data')));
                        }
                    });
                    update();
                    function update() {
                        var a = {
                            action: 'ibs_mappro_index',
                            nonce: mappro.options.args.nonce,
                            func: 'set_track',
                            data: JSON.stringify(stack),
                        }
                        $.get(mappro.options.args.ajax, a).done(function (data, status) {
                            if (status === 'success' && data.indexOf('error') === -1) {
                                dialog.dialog('close');
                                mappro.file.tracking();
                            } else {
                                alert(data);
                            }
                        });
                    }
                },
                Close: function () {
                    dialog.dialog('close');
                },
                Cancel: function () {
                    dialog.dialog('close');
                }
            },
            close: function () {
                dialog.dialog('destroy');
            },
            open: function () {
                var newdata = {id: "%new%", where: "", msg: "", date: ""};
                var newmarker = $('<li>').addClass('tracking-item new').attr({name: '%new%', data: JSON.stringify(newdata)}).text('new marker')
                $('#tracking-list')
                        .append(newmarker.clone());
                $.getJSON(mappro.options.args.ajax, {
                    action: 'ibs_mappro_index',
                    func: 'tracking',
                    nonce: mappro.options.args.nonce
                }).done(function (data, status) {
                    for (var i in data) {
                        data[i].id = i;
                        $('#tracking-list')
                                .append($('<li>').addClass('tracking-item').attr({name: i, data: JSON.stringify(data[i])}).text(i));
                    }
                });
                $('#tracking-list').on('click', '.tracking-item', {}, function () {
                    event.preventDefault();
                    $('.tracking-item').removeClass('selected');
                    $(this).addClass('selected');
                    var datastr = $(this).attr('data');
                    var data = JSON.parse(datastr);
                    if (typeof data === 'object') {
                        $('#item-id').val(data.id)
                        $('#item-where').val(data.where);
                        $('#item-msg').val(data.msg);
                        $('#item-date').val(data.date);
                        if (data.id === '%new%') {
                            $('#item-id').val('').prop('disabled', false).css({'background-color': 'inherit'});
                        } else {
                            $('#item-id').prop('disabled', true).css({'background-color': '#cfd1cf'});
                            ;
                        }
                        var result = '[ibs-track '
                                + ' id="' + data.id + '"'
                                + ' where="' + data.where + '"'
                                + ' msg="' + data.msg + '"';
                        $('#shortcode').val(result + ']');
                    }
                });
                $('.tracking-edit').on('change', '', {}, function () {
                    var name = $(this).attr('name');
                    var target = $('li.tracking-item.selected');
                    var data = JSON.parse($(target).attr('data'));
                    var value = $(this).val()
                    switch (name) {
                        case 'id':
                            if ($(target).attr('name') === '%new%' && value !== '') {
                                var data = JSON.parse($(target).attr('data'));
                                data.id = value;
                                $(target).attr({name: value}).text(value);
                                $(this).prop('disabled', true).css({'background-color': 'silver'});
                                dialog.find('#tracking-list')
                                        .prepend(newmarker.clone());
                            }
                            break;
                        case 'where':
                            data.where = value;
                            break;
                        case 'msg':
                            data.msg = value;
                            break;
                    }
                    data.action = 'update';
                    $(target).attr({data: JSON.stringify(data)});
                    var result = '[ibs-track'
                            + ' id="' + data.id + '"'
                            + ' where="' + data.where + '"'
                            + ' msg="' + data.msg + '"';
                    $('#shortcode').val(result + ']');
                });
                $('#delete-tracking').on('click', '', {}, function (event) {
                    event.preventDefault();
                    $('li.tracking-item.selected').remove();
                    $('.tracking-item').first().trigger('click');
                });
            }
        });
        var qtip = {style: 'qtip-bootstrap', rounded: false, shadow: false};
        $('[title]').each(function (index, item) {
            $(item).qtip(
                    {
                        surpress: true,
                        position: {my: 'top left',
                            at: 'bottom right'
                        },
                        style: {
                            classes: qtip.style + ' ' + qtip.rounded + qtip.shadow
                        },
                        show: {
                            event: 'mouseover'
                        },
                        hide: {
                            fixed: true,
                            delay: 250, event: 'mouseout mouseleave'

                        }
                    });
        });
    }
})(jQuery);

