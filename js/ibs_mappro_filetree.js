// jQuery File Tree Plugin
//
// Version 1.01
//
// Cory S.N. LaViska
// A Beautiful Site (http://abeautifulsite.net/)
// 24 March 2008
//
// Visit http://abeautifulsite.net/notebook.php?article=58 for more information
//
// Usage: $('.fileTreeDemo').fileTree( options, callback )
//
// Options:  root           - root folder to display; default = /
//           script         - location of the serverside AJAX file to use; default = jqueryFileTree.php
//           folderEvent    - event to trigger expand/collapse; default = click
//           expandSpeed    - default = 500 (ms); use -1 for no animation
//           collapseSpeed  - default = 500 (ms); use -1 for no animation
//           expandEasing   - easing function to use on expand (optional)
//           collapseEasing - easing function to use on collapse (optional)
//           multiFolder    - whether or not to limit the browser to one subfolder at a time
//           loadMessage    - Message to display while initial tree loads (can be HTML)
//
// History:
//
// 1.01 - updated to work with foreign characters in directory/file names (12 April 2008)
// 1.00 - released (24 March 2008)
//
// TERMS OF USE
// 
// This plugin is dual-licensed under the GNU General Public License and the MIT License and
// is copyright 2008 A Beautiful Site, LLC. 
// 
//modified to support multiple selections
//
if (jQuery)
    (function($) {

        $.extend($.fn, {
            fileTree: function(o, h, j) {
                // Defaults
                if (!o)
                    var o = {};
                if (o.root == undefined)
                    o.root = '/';
                if (o.script == undefined)
                    o.script = 'jqueryFileTree.php';
                if (o.folderEvent == undefined)
                    o.folderEvent = 'click';
                if (o.expandSpeed == undefined)
                    o.expandSpeed = 0;//500;
                if (o.collapseSpeed == undefined)
                    o.collapseSpeed = 0;//500;
                if (o.expandEasing == undefined)
                    o.expandEasing = null;
                if (o.collapseEasing == undefined)
                    o.collapseEasing = null;
                if (o.multiFolder == undefined)
                    o.multiFolder = true;
                if (o.loadMessage == undefined)
                    o.loadMessage = 'Loading...';

                $(this).each(function() {

                    function showTree(c, t) {
                        $(c).addClass('wait');
                        $(".jqueryFileTree.start").remove();
                        if (typeof o.script == "function") {
                            data = o.script(t, function(data) {
                                $(c).find('.start').html('');
                                $(c).removeClass('wait').append(data);
                                if (o.root == t)
                                    $(c).find('UL:hidden').show();
                                else
                                    $(c).find('UL:hidden').slideDown({
                                        duration: o.expandSpeed,
                                        easing: o.expandEasing
                                    });
                                bindTree(c);
                            });
                        } else {
                            $.post(o.script, {
                                dir: t
                            }, function(data) {
                                $(c).find('.start').html('');
                                $(c).removeClass('wait').append(data);
                                if (o.root == t)
                                    $(c).find('UL:hidden').show();
                                else
                                    $(c).find('UL:hidden').slideDown({
                                        duration: o.expandSpeed,
                                        easing: o.expandEasing
                                    });
                                bindTree(c);
                            });
                        }
                    }

                    function bindTree(t) {
                        $(t).find('LI A').bind(o.folderEvent, function(event) {
                            if ($(this).parent().hasClass('directory')) {
                                if ($(this).parent().hasClass('collapsed')) {
                                    // Expand
                                    if (!o.multiFolder) {
                                        $(this).parent().parent().find('UL').slideUp({
                                            duration: o.collapseSpeed,
                                            easing: o.collapseEasing
                                        });
                                        $(this).parent().parent().find('LI.directory').removeClass('expanded').addClass('collapsed');
                                    }
                                    $(this).parent().find('UL').remove(); // cleanup
                                    if (typeof o.script == 'function') {
                                        showTree($(this).parent(), $(this).attr('rel'));
                                    } else {
                                        showTree($(this).parent(), escape($(this).attr('rel').match(/.*\//)));
                                    }
                                    $(this).parent().removeClass('collapsed').addClass('expanded');
                                    try {
                                        j($(this).attr('rel'));
                                    } catch (err) {
                                        alert(err)
                                    }
                                } else {
                                    // Collapse
                                    $(this).parent().find('UL').slideUp({
                                        duration: o.collapseSpeed,
                                        easing: o.collapseEasing
                                    });
                                    $(this).parent().removeClass('expanded').addClass('collapsed');
                                }
                            } else {
                                if (event.shiftKey) {
                                    var first = false;
                                    var found = false;
                                    var rel = $(this).attr('rel');
                                    $(this).parent().parent().find('A').each(function(n) {
                                        if (!found || !first) {
                                            if ($(this).attr('rel') === rel) {
                                                found = true;
                                            } else {
                                                if ($(this).hasClass('selected') && !first) {
                                                    first = true;
                                                }
                                            }
                                            if (first || found) {
                                                $(this).addClass('selected');
                                            }
                                        } else {
                                            $(this).removeClass('selected');
                                        }
                                    });
                                } else {
                                    if (event.ctrlKey) {
                                        $(this).toggleClass('selected');
                                    } else {
                                        var has = $(this).hasClass('selected');
                                        $(this).parent().parent().find('A').removeClass('selected');
                                        if (false === has) {
                                            $(this).addClass('selected');
                                        }
                                    }
                                }
                                h($(this).attr('rel'));
                            }
                            return false;
                        });
                        // Prevent A from triggering the # on non-click events
                        if (o.folderEvent.toLowerCase != 'click')
                            $(t).find('LI A').bind('click', function() {
                                return false;
                            });
                    }
                    // Loading message
                    $(this).html('<ul class="jqueryFileTree start"><li class="wait">' + o.loadMessage + '<li></ul>');
                    // Get the initial file list
                    showTree($(this), escape(o.root));
                });
            }
        });

    })(jQuery);