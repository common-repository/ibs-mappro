(function ($) {
    $.fn.extend({
        colorpicker: function (options, data) {
            var html =
                    '<option value="#8B008B">DarkMagenta</option>' +
                    '<option value="#008000">Green</option>' +
                    '<option value="#D3D3D3">LightGray</option>' +
                    '<option value="#00008B">DarkBlue</option>' +
                    '<option value="#FFF380">Gold</option>' +
                    '<option value="#FFFF00">Yellow</option>' +
                    '<option value="#A9A9A9">DarkGray</option>' +
                    '<option value="#008B8B">DarkCyan</option>' +
                    '<option value="#FF0000">Red</option>' +
                    '<option value="#0000FF">Blue</option>' +
                    '<option value="#FF00FF">Magenta</option>' +
                    '<option value="#8B0000">DarkRed</option>' +
                    '<option value="#006400">DarkGreen</option>' +
                    '<option value="#00FFFF">Cyan</option>' +
                    '<option value="#000000">Black</option>';

            //Settings list and the default values
            var defaults = {
                label: '',
                size: 20,
                count: 6,
                hide: true
            };
            if (typeof options !== 'undefined' && typeof options === 'string') {
                switch (options) {
                    case 'stroke':
                        if (typeof data === 'undefined') {
                            return {
                                color: rgb2hex($(this).find('.ibs-colorpicker-trigger').css('background-color')),
                                opacity: parseFloat($(this).find('.ibs-colorpicker-trigger').css('opacity')).toFixed(3),
                                weight: parseInt($(this).find('.ibs-colorpicker-trigger').height() - 2)
                            };
                        }
                        $(this).find('.ibs-opacity-val').val(parseFloat(data.opacity).toFixed(1));
                        $(this).find('.ibs-width-val').val(parseInt(data.weight));
                        var list = $(this).find('.ibs-colorpicker-select');
                        var strokeColor = data.color.toLowerCase();
                        $.each(list, function (index, item) {
                            if (item.value.toLowerCase() === strokeColor) {
                                $(item).attr('selected', true);
                            } else {
                                $(item).removeAttr('selected');
                            }
                        });
                        var h = $(this).find('.ibs-colorpicker-trigger-div').height();
                        var v = parseInt(data.weight) + 2;
                        var p = (h - v) / 2;
                        $(this).find('.ibs-colorpicker-trigger').css({opacity: data.opacity, 'background-color': data.color, 'height': v + 'px', 'margin-top': p + 'px', 'margin-bottom': p + 'px'});
                        break;
                    case 'opacity':
                        var val = data;
                        $(this).find('.ibs-colorpicker-trigger').css('opacity', val);
                        break;
                    case 'weight':
                        var h = $(this).find('.ibs-colorpicker-trigger-div').height();
                        var v = parseInt(data)+ 2;
                        var p = (h - v) / 2;
                        $(this).find('.ibs-colorpicker-trigger').css('height', v + 'px');
                        $(this).find('.ibs-colorpicker-trigger').css('margin-top', p + 'px');
                        $(this).find('.ibs-colorpicker-trigger').css('margin-bottom', p + 'px');
                        break;
                }
                return;
            }

            var options = $.extend(defaults, options);
            var obj;
            var colors = {};

            var wrap = $('<div>').addClass('ibs-colorpicker-wrap');
            var label = $('<div>').addClass('ibs-colorpicker-label');
            var trigger_div = $('<div>').addClass('ibs-colorpicker-trigger-div').css({'background-color': '#ffffff', float: 'left', height: '20px'})
            var trigger = $('<div>').addClass('ibs-colorpicker-trigger');
            trigger_div.append(trigger);
            var picker = $('<div>').addClass('ibs-colorpicker-picker').width((options.size + 4) * options.count);
            var info = $('<div>').addClass('ibs-colorpicker-picker-info');
            var exit = $('<div>').addClass('ibs-cp-exit').css('float', 'right')
                    .append($('<img>').addClass('ibs-cp-cancel'));
            var clear = $('<div style="clear:both;"></div>');

            return this.each(function () {
                obj = this;
                $(obj).html(html);
                //build an array of colors
                $(obj).children('option').each(function (i, elm) {
                    colors[i] = {};
                    colors[i].color = $(elm).text();
                    colors[i].value = $(elm).val();
                });
                create_wrap();
                if (options.label != '')
                    create_label();
                create_trigger();
                create_picker();
                wrap.append(label);
                wrap.append(trigger_div);
                wrap.append(picker);
                wrap.append(clear);
                $(obj).after(wrap);
                if (options.hide)
                    $(obj).css({
                        position: 'absolute',
                        left: -10000
                    });
            });


            function create_wrap() {
                wrap.mouseleave(function () {
                    // picker.fadeOut('slow');
                });
            }

            function create_label() {
                label.text(options.label);
                label.click(function () {
                    trigger.click()
                });
            }

            function create_trigger() {
                trigger.click(function () {
                    var offset = $(this).position();
                    var top = offset.top;
                    var left = offset.left + $(this).width() + 5;
                    $(picker).css({
                        'top': top,
                        'left': left
                    }).fadeIn('slow');
                    $(picker).find('.ibs-colorpicker-picker-span:first').trigger('mouseover');
                    $(picker).find('.ibs-colorpicker-picker-span.active').trigger('mouseover');
                    ;
                });
            }

            function create_picker() {
                picker.append(exit);
                picker.append(info);

                for (var i in colors) {
                    picker.append('<span class="ibs-colorpicker-picker-span ' +
                            (colors[i].color == $(obj).children(":selected").text() ? ' active' : '') + '" rel="' + colors[i].value + '" style="background-color: ' + colors[i].color + '; width: ' + options.size + 'px; height: ' + options.size + 'px;"><div class="cpind"></div></span>');
                }
                trigger.css('background-color', $(obj).children(":selected").text());
                info.text($(obj).children(":selected").attr('rel'));
                $(picker).on('mouseover', '.ibs-colorpicker-picker-span', {}, function () {
                    var color = $(this).attr('rel')
                    var cname = $(obj).find('option[value="' + color + '"]').text();
                    if (cname) {
                        var cname = cname.replace(/Dark/, 'Dark ').replace(/Light/, 'Light');
                    } else {
                        cname = color;
                    }
                    info.text(cname);
                    //info.text($(this).attr('rel'));
                }, function () {
                    info.text(picker.children('.ibs-colorpicker-picker-span.ibs-active').attr('rel'));
                });
                $(picker).on('click', '.ibs-colorpicker-picker-span', {}, function () {
                    info.text($(this).attr('rel'));
                    $(obj).val($(this).attr('rel'));
                    $(obj).change();
                    picker.children('.ibs-colorpicker-picker-span.active').removeClass('ibs-active');
                    $(this).addClass('ibs-active');
                    trigger.css('background-color', $(this).css('background-color'));
                    picker.fadeOut('slow')
                });
                $(picker).on('click', '.ibs-cp-exit', {}, function (event) {
                    picker.fadeOut('slow')
                })
                $(obj).after(picker);
            }
        }
    });
})(jQuery);