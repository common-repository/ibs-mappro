//line/route
//modified to do only onelevel of scrolling 
/*global define:false require:false */
(function (name, context, definition) {
    if (typeof module != 'undefined' && module.exports)
        module.exports = definition();
    else if (typeof define == 'function' && define.amd)
        define(definition);
    else
        context[name] = definition();
})('jquery-scrollto', this, function () {
    // Prepare
    var jQuery, $, ScrollTo;
    jQuery = $ = window.jQuery || require('jquery');
    // Fix scrolling animations on html/body on safari
    $.propHooks.scrollTop = $.propHooks.scrollLeft = {
        get: function (elem, prop) {
            var result = null;
            if (elem.tagName === 'HTML' || elem.tagName === 'BODY') {
                if (prop === 'scrollLeft') {
                    result = window.scrollX;
                } else if (prop === 'scrollTop') {
                    result = window.scrollY;
                }
            }
            if (result == null) {
                result = elem[prop];
            }
            return result;
        }
    };
    $.Tween.propHooks.scrollTop = $.Tween.propHooks.scrollLeft = {
        get: function (tween) {
            return $.propHooks.scrollTop.get(tween.elem, tween.prop);
        },
        set: function (tween) {
            // Our safari fix
            if (tween.elem.tagName === 'HTML' || tween.elem.tagName === 'BODY') {
                // Defaults
                tween.options.bodyScrollLeft = (tween.options.bodyScrollLeft || window.scrollX);
                tween.options.bodyScrollTop = (tween.options.bodyScrollTop || window.scrollY);

                // Apply
                if (tween.prop === 'scrollLeft') {
                    tween.options.bodyScrollLeft = Math.round(tween.now);
                }
                else if (tween.prop === 'scrollTop') {
                    tween.options.bodyScrollTop = Math.round(tween.now);
                }

                // Apply
                window.scrollTo(tween.options.bodyScrollLeft, tween.options.bodyScrollTop);
            }
            // jQuery's IE8 Fix
            else if (tween.elem.nodeType && tween.elem.parentNode) {
                tween.elem[ tween.prop ] = tween.now;
            }
        }
    };

    // jQuery ScrollTo
    ScrollTo = {
        // Configuration
        config: {
            duration: 400,
            easing: 'swing',
            callback: undefined,
            durationMode: 'each',
            offsetTop: 0,
            offsetLeft: 0
        },
        // Set Configuration
        configure: function (options) {
            $.extend(ScrollTo.config, options || {});
            return this;
        },
        scroll: function (collections, config) {
            var collection,
                    $container,
                    container,
                    $target,
                    $inline,
                    position,
                    containerTagName,
                    containerScrollTop,
                    containerScrollLeft,
                    containerScrollTopEnd,
                    containerScrollLeftEnd,
                    startOffsetTop,
                    targetOffsetTop,
                    targetOffsetTopAdjusted,
                    startOffsetLeft,
                    targetOffsetLeft,
                    targetOffsetLeftAdjusted,
                    scrollOptions,
                    callback;
            collection = collections.pop();
            $container = collection.$container;
            $target = collection.$target;
            containerTagName = $container.prop('tagName');
            $inline = $('<span/>').css({
                'position': 'absolute',
                'top': '0px',
                'left': '0px'
            });
            position = $container.css('position');
            $container.css({position: 'relative'});
            $inline.appendTo($container);
            startOffsetTop = $inline.offset().top;
            targetOffsetTop = $target.offset().top;
            targetOffsetTopAdjusted = targetOffsetTop - startOffsetTop - parseInt(config.offsetTop, 10);
            startOffsetLeft = $inline.offset().left;
            targetOffsetLeft = $target.offset().left;
            targetOffsetLeftAdjusted = targetOffsetLeft - startOffsetLeft - parseInt(config.offsetLeft, 10);
            containerScrollTop = $container.prop('scrollTop');
            containerScrollLeft = $container.prop('scrollLeft');
            $inline.remove();
            $container.css({position: position});
            scrollOptions = {};
            callback = function (event) {
                if (collections.length === 0) {
                    if (typeof config.callback === 'function') {
                        config.callback();
                    }
                }
                else {
                    ScrollTo.scroll(collections, config);
                }
                return true;
            };
            if (config.onlyIfOutside) {
                containerScrollTopEnd = containerScrollTop + $container.height();
                containerScrollLeftEnd = containerScrollLeft + $container.width();
                if (containerScrollTop < targetOffsetTopAdjusted && targetOffsetTopAdjusted < containerScrollTopEnd) {
                    targetOffsetTopAdjusted = containerScrollTop;
                }
                if (containerScrollLeft < targetOffsetLeftAdjusted && targetOffsetLeftAdjusted < containerScrollLeftEnd) {
                    targetOffsetLeftAdjusted = containerScrollLeft;
                }
            }
            if (targetOffsetTopAdjusted !== containerScrollTop) {
                scrollOptions.scrollTop = targetOffsetTopAdjusted;
            }
            if (targetOffsetLeftAdjusted !== containerScrollLeft) {
                scrollOptions.scrollLeft = targetOffsetLeftAdjusted;
            }
            if ($container.prop('scrollHeight') === $container.width()) {
                delete scrollOptions.scrollTop;
            }
            if ($container.prop('scrollWidth') === $container.width()) {
                delete scrollOptions.scrollLeft;
            }
            if (scrollOptions.scrollTop != null || scrollOptions.scrollLeft != null) {
                $container.animate(scrollOptions, {
                    duration: config.duration,
                    easing: config.easing,
                    complete: callback
                });
            }
            else {
                callback();
            }
            return true;
        },
        fn: function (options) {
            var collections, config, $container, container;
            collections = [];
            var $target = $(this);
            if ($target.length === 0) {
                return this;
            }
            config = $.extend({}, ScrollTo.config, options);
            $container = $target.parent();
            container = $container.get(0);
            var containerScrollTop;
            var containerScrollLeft;
            containerScrollTop = $container.css('overflow-y') !== 'visible' && container.scrollHeight !== container.clientHeight;
            containerScrollLeft = $container.css('overflow-x') !== 'visible' && container.scrollWidth !== container.clientWidth;
            if (containerScrollTop || containerScrollLeft) {
                collections.push({
                    '$container': $container,
                    '$target': $target
                });
                $target = $container;
            }
            $container = $container.parent();
            container = $container.get(0);
            collections.push({
                '$container': $('html'),
                '$target': $target
            });
            if (config.durationMode === 'all') {
                config.duration /= collections.length;
            }
            ScrollTo.scroll(collections, config);
            return this;
        }
    };
    $.ScrollTo = $.ScrollTo || ScrollTo;
    $.fn.ScrollTo = $.fn.ScrollTo || ScrollTo.fn;
    return ScrollTo;
});