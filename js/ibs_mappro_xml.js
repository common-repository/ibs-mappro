function XMLWriter(encoding, version) {
    if (encoding)
        this.encoding = encoding;
    if (version)
        this.version = version;
}
;
(function () {
//utility, you don't need it
    function clean(node) {
        var l = node.c.length;
        while (l--) {
            if (typeof node.c[l] == 'object')
                clean(node.c[l]);
        }
        node.n = node.a = node.c = null;
    }
    ;

//utility, you don't need it
    function format(node, indent, chr, buffer) {
        var
                xml = indent + '<' + node.n,
                nc = node.c.length,
                attr, child, i = 0;

        for (attr in node.a)
            xml += ' ' + attr + '="' + node.a[attr] + '"';

        xml += nc ? '>' : ' />';

        buffer.push(xml);

        if (nc) {
            do {
                child = node.c[i++];
                if (typeof child == 'string') {
                    if (nc == 1)//single text node
                        return buffer.push(buffer.pop() + child + '</' + node.n + '>');
                    else //regular text node
                        buffer.push(indent + chr + child);
                } else if (typeof child == 'object') //element node
                    format(child, indent + chr, chr, buffer);
            } while (i < nc);
            buffer.push(indent + '</' + node.n + '>');
        }
    }
    XMLWriter.prototype = {
        encoding: 'ISO-8859-1', // what is the encoding
        version: '1.0', //what xml version to use
        formatting: 'indented', //how to format the output (indented/none)  ?
        indentChar: ' ', //char to use for indent
        indentation: 2, //how many indentChar to add per level
        newLine: '\n', //character to separate nodes when formatting
        //start a new document, cleanup if we are reusing
        writeStartDocument: function (standalone) {
            this.close(); //cleanup
            this.stack = [];
            this.standalone = standalone;
        },
        //get back to the root
        writeEndDocument: function () {
            this.active = this.root;
            this.stack = [];
        },
        //set the text of the doctype
        writeDocType: function (dt) {
            this.doctype = dt;
        },
        //start a new node with this name, and an optional namespace
        writeStartElement: function (name, ns) {
            if (ns)//namespace
                name = ns + ':' + name;
            var node = {n: name, a: {}, c: []}; //(n)ame, (a)ttributes, (c)hildren

            if (this.active) {
                this.active.c.push(node);
                this.stack.push(this.active);
            } else
                this.root = node;
            this.active = node;
        },
        //go up one node, if we are in the root, ignore it
        writeEndElement: function () {
            this.active = this.stack.pop() || this.root;
        },
        //add an attribute to the active node
        writeAttributeString: function (name, value) {
            if (this.active)
                this.active.a[name] = value;
        },
        //add a text node to the active node
        writeString: function (text) {
            if (this.active)
                this.active.c.push(text);
        },
        //shortcut, open an element, write the text and close
        writeElementString: function (name, text, ns) {
            this.writeStartElement(name, ns);
            this.writeString(text);
            this.writeEndElement();
        },
        //add a text node wrapped with CDATA
        writeCDATA: function (text) {
            this.writeString('<![CDATA[' + text + ']]>');
        },
        //add a text node wrapped in a comment
        writeComment: function (text) {
            this.writeString('<!-- ' + text + ' -->');
        },
        //generate the xml string, you can skip closing the last nodes
        flush: function () {
            if (this.stack && this.stack[0])//ensure it's closed
                this.writeEndDocument();
            var
                    chr = '', indent = '', num = this.indentation,
                    formatting = this.formatting.toLowerCase() == 'indented',
                    buffer = '<?xml version="' + this.version + '" encoding="' + this.encoding + '"';
            if (this.standalone !== undefined)
                buffer += ' standalone="' + !!this.standalone + '"';
            buffer += ' ?>';
            buffer = [buffer];
            if (this.doctype && this.root)
                buffer.push('<!DOCTYPE ' + this.root.n + ' ' + this.doctype + '>');
            if (formatting) {
                while (num--)
                    chr += this.indentChar;
            }
            if (this.root)//skip if no element was added
                format(this.root, indent, chr, buffer);
            return buffer.join(formatting ? this.newLine : '');
        },
        //cleanup, don't use again without calling startDocument
        close: function () {
            if (this.root)
                clean(this.root);
            this.active = this.root = this.stack = null;
        },
        getDocument: window.ActiveXObject
                ? function () { //MSIE
                    var doc = new ActiveXObject('Microsoft.XMLDOM');
                    doc.async = false;
                    doc.loadXML(this.flush());
                    return doc;
                }
        : function () {// Mozilla, Firefox, Opera, etc.
            return (new DOMParser()).parseFromString(this.flush(), 'text/xml');
        }
    };
})();
function KML() {
    this.options = {
        name: null,
        desc: null,
        url: null,
        position: null,
        draggable: false,
        visible: false,
        stroke: {color: '#0000ff', weight: 3, opacity: 0.5},
        path: []
    };
    this.kml = null;
    this.file = null;
}
(function ($) {
    KML.prototype.writer = function (file) {
        var line_styles = [];
        var icon_styles = [];
        var segment_list = file.listSegments();
        var placemark_list = file.listPlacemarks();
        function setLineStyle(style) {
            for (var i = 0; i < line_styles.length; i++) {
                if (style.color === line_styles[i].color && style.width === line_styles[i].width) {
                    return '#' + line_styles[i].id;
                }
            }
            style.id = 'LineStyle-' + padLeftStr(line_styles.length + 1, 3, '0');
            line_styles.push(style);
            return '#' + style.id;
        }
        function setIconStyle(style) {
            for (var i = 0; i < icon_styles.length; i++) {
                if (style.icon === icon_styles[i].icon) {
                    return '#' + icon_styles[i].id;
                }
            }
            style.id = 'IconStyle-' + padLeftStr(icon_styles.length + 1, 3, '0');
            icon_styles.push(style);
            return '#' + style.id;
        }
        for (var sid in file.segments) {
            var sg = file.segments[sid];
            var color = colorKML(sg.options.stroke.opacity, sg.options.stroke.color);
            sg.options.style = setLineStyle({'color': color, 'width': sg.options.stroke.weight.toString()});
        }
        for (var pid in file.placemarks) {
            var pm = file.placemarks[pid];
            pm.options.style = setIconStyle({'icon': pm.marker.icon.url});
        }
        var xml = new XMLWriter('UTF-8', '1.0');
        xml.writeStartDocument();
        xml.writeStartElement('kml');
        xml.writeAttributeString('xmlns', 'http://www.opengis.net/kml/2.2');
        xml.writeStartElement('Document');
        xml.writeStartElement('name');
        xml.writeCDATA(file.options.name);
        xml.writeEndElement();
        xml.writeElementString('open', '1');
        xml.writeStartElement('description');
        xml.writeCDATA(file.options.desc);
        xml.writeEndElement();
        for (var i = 0; i < icon_styles.length; i++) {
            xml.writeStartElement('Style');
            xml.writeAttributeString('id', icon_styles[i].id);
            xml.writeStartElement('IconStyle');
            xml.writeStartElement('Icon');
            xml.writeElementString('href', icon_styles[i].icon);
            xml.writeEndElement();//icon
            xml.writeEndElement();//icon style
            xml.writeEndElement();//style
        }
        for (var i = 0; i < line_styles.length; i++) {
            xml.writeStartElement('Style');
            xml.writeAttributeString('id', line_styles[i].id);
            xml.writeStartElement('LineStyle');
            xml.writeElementString('color', line_styles[i].color);
            xml.writeElementString('width', line_styles[i].width);
            xml.writeEndElement();//line style
            xml.writeStartElement('PolyStyle');
            xml.writeElementString('color', line_styles[i].color);
            xml.writeEndElement();//polystyle
            xml.writeEndElement();//style
        }
        xml.writeStartElement('Folder');
        xml.writeElementString('name', 'Placemarks');
        xml.writeElementString('description', 'placemarks');
        for (var i = 0; i < placemark_list.length; i++) {
            var pm = file.placemarks[placemark_list[i]];
            var lat = pm.options.position.lat().toString();
            var lng = pm.options.position.lng().toString();
            xml.writeStartElement('Placemark');
            xml.writeStartElement('name');
            xml.writeCDATA(pm.options.name);
            xml.writeEndElement();
            xml.writeStartElement('description');
            xml.writeCDATA(pm.options.desc);
            xml.writeEndElement();
            xml.writeElementString('styleUrl', pm.options.style);
            xml.writeStartElement('Point');
            xml.writeElementString('coordinates', lng + ',' + lat + ',0');
            //xml.writeElementString('styleUrl', pm.options.style);
            xml.writeEndElement();//point
            xml.writeEndElement(); //placemark
        }
        xml.writeEndElement(); //folder

        xml.writeStartElement('Folder');
        xml.writeElementString('name', 'Segments');
        xml.writeElementString('description', 'segment lines');
        for (i = 0; i < segment_list.length; i++) {
            var sg = file.segments[segment_list[i]];
            var coordinates = '';
            sg.line.getPath().forEach(function (latlng) {
                coordinates += latlng.lng().toString() + ',' + latlng.lat().toString() + ',0.00000 \n';
            });
            xml.writeStartElement('Placemark');
            xml.writeStartElement('name');
            xml.writeCDATA(sg.options.name);
            xml.writeEndElement();
            xml.writeStartElement('description');
            xml.writeCDATA(sg.options.desc);
            xml.writeEndElement();
            xml.writeElementString('styleUrl', sg.options.style);
            xml.writeStartElement('LineString');
            xml.writeElementString('altitudeMode', 'clampToGround');
            xml.writeElementString('coordinates', coordinates);
            xml.writeEndElement(); //linestring
            xml.writeEndElement();//placemark
        }
        xml.writeEndElement(); //folder
        xml.writeEndElement(); //documennt
        xml.writeEndElement(); //kml
        xml.writeEndDocument();
        return xml.flush();
    };
    KML.prototype.getLineStyle = function (lineStyle) {
        var color = $(lineStyle).find('color').text();
        var width = $(lineStyle).find('width').text();
        var aa = color.substr(0, 2);
        var bb = color.substr(2, 2);
        var gg = color.substr(4, 2);
        var rr = color.substr(6, 2);
        this.options.stroke.color = "#" + rr + gg + bb;
        this.options.stroke.opacity = parseInt(aa, 16) / 256;
        this.options.stroke.weight = parseInt(width);
    };
    KML.prototype.getStyle = function (placemark) {
        $(placemark).find('styleUrl').each($.proxy(function (n, styleUrl) {
            var styleId = $(styleUrl).text().substr(1);
            $(this.kml).find('Style[id=' + styleId + ']').each($.proxy(function (n, style) {
                $(style).find('LineStyle').each($.proxy(function (n, lineStyle) {
                    this.getLineStyle(lineStyle);
                }, this));
                $(style).find('IconStyle').each($.proxy(function (n, iconStyle) {
                    this.options.url = $(iconStyle).find('href:first').text();
                }, this));
            }, this));
        }, this));
        $(placemark).children('Style').each($.proxy(function (n, style) {
            $(style).children('LineStyle').each($.proxy(function (n, lineStyle) {
                this.getLineStyle(lineStyle);
            }, this));
            $(style).children('IconStyle').each($.proxy(function (n, iconStyle) {
                this.options.url = $(iconStyle).find('href:first').text();
            }, this));
        }, this));

    };
    KML.prototype.getLineString = function (placemark) {
        $(placemark).children('LineString').each($.proxy(function (n, lineString) {
            this.options.path = [];
            var coordinates = $(lineString).children('coordinates').text();
            coordinates = coordinates.replace(/\n/g, ' ');
            coordinates = $.trim(coordinates);
            while (coordinates.indexOf('  ') > 0) {
                coordinates = coordinates.replace(/  /g, ' ');
            }
            var coordinatesArray = coordinates.split(' ');
            for (var i = 0; i < coordinatesArray.length; i++) {
                var strArray = coordinatesArray[i].split(',');
                var lng = parseFloat(strArray[0]);
                var lat = parseFloat(strArray[1]);
                this.options.path.push(new google.maps.LatLng(lat, lng));
            }
            if (this.options.path.length > 0)
                this.file._addSegment(this.options);
        }, this));
    };
    KML.prototype.getPoint = function (placemark) {
        $(placemark).children('Point').each($.proxy(function (n, point) {
            var coordinates = $(point).children('coordinates').text();
            coordinates = $.trim(coordinates);
            var strArray = coordinates.split(',');
            var lng = parseFloat(strArray[0]);
            var lat = parseFloat(strArray[1]);
            this.options.position = new google.maps.LatLng(lat, lng);
            if (this.options.name)
                this.file._addPlacemark(this.options);
        }, this));
    };

    KML.prototype.getDocument = function (document) {
        if (getCDATA($(document).contents('name').text()) === 'Track Points')
            return; //bypass Garmin track points
        if (!this.file.options.name) {
            this.file.options.name = getCDATA($(document).contents('name').text());
        }
        if (!this.file.options.desc) {
            this.file.options.desc = getCDATA($(document).contents('description').text());
        }
        $(document).children('Placemark').each($.proxy(function (n, placemark) {
            this.options.name = getCDATA($(placemark).children('name').text());
            this.options.desc = getCDATA($(placemark).children('description').text());
            this.getStyle(placemark);
            this.getLineString(placemark);
            this.getPoint(placemark);
        }, this));
        $(document).children('Folder').each($.proxy(function (n, folder) {
            this.getDocument(folder); //recursive drill down on folders
        }, this));
    };
    KML.prototype.reader = function (xml, file) {
        this.file = file;
        $(xml).children('kml').each($.proxy(function (n, kml) {
            this.kml = kml;
            $(this.kml).children('Document').each($.proxy(function (n, document) {
                this.getDocument(document);
            }, this));
            $(this.kml).children('Folder').each($.proxy(function (n, folder) {
                this.getDocument(folder);
            }, this));
        }, this));
    };
    KML.prototype.kmlWindow = function (kml) {
        var newWindow = window.open('',
                'KML Export ' + (new Date()).getTime(), "width=800,height=1000");
        newWindow.document.write('<textarea id="kml" style="width: 100%; height: 100%">' + kml + '</textarea>');

    };
})(jQuery);
function GPX() {
    this.init();
}
(function ($) {
    GPX.prototype.init = function () {
        var gpxColors = [
            {x: 0, y: 0, z: 0, label: 'Black'},
            {x: 140, y: 0, z: 26, label: 'DarkRed'},
            {x: 37, y: 65, z: 23, label: 'DarkGreen'},
            {x: 255, y: 243, z: 128, label: 'DarkYellow'}, //#FFf380 aka Corn Yellow
            {x: 21, y: 27, z: 84, label: 'DarkBlue'},
            {x: 227, y: 49, z: 157, label: 'DarkMagenta'},
            {x: 207, y: 236, z: 236, label: 'DarkCyan'},
            {x: 188, y: 198, z: 204, label: 'LightGray'},
            {x: 80, y: 74, z: 75, label: 'DarkGray'},
            {x: 255, y: 0, z: 0, label: 'Red'},
            {x: 0, y: 128, z: 0, label: 'Green'},
            {x: 255, y: 255, z: 0, label: 'Yellow'},
            {x: 0, y: 0, z: 255, label: 'Blue'},
            {x: 255, y: 0, z: 255, label: 'Magenta'},
            {x: 0, y: 255, z: 255, label: 'Cyan'},
            {x: 255, y: 255, z: 255, label: 'White'}
        ];
        color_to_hex = function (color) {
            for (var i in gpxColors) {
                if (gpxColors[i].label.toLowerCase() === color.toLowerCase()) {
                    return "#" + hex(gpxColors[i].x) + hex(gpxColors[i].y) + hex(gpxColors[i].z);
                }
            }
            return color_to_hex('Red');
        }
        function gpx_rgb2hex(color) {
            var rgb = color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
            if (rgb) {
                return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
            } else {
                return color;
            }
        }
        gpxColor = function (color) {
            function fdist(a, b) {
                var x = Math.abs(a.x - b.x);
                var y = Math.abs(a.y - b.y);
                var z = Math.abs(a.z - b.z);
                return Math.sqrt(x * x + y * y + z * z);
            }
            color = gpx_rgb2hex($('<div>').css('color', color).css('color'));
            color = color.replace("#", "");
            var value = parseInt(color, 16);
            var b = Math.floor(value % 256);
            var g = Math.floor((value / 256) % 256);
            var r = Math.floor((value / (256 * 256)) % 256);
            var point = {'x': r, 'y': g, 'z': b};
            var min = Infinity;
            var colorIndex = -1;
            var dist = 0;
            for (var i = 0; i < gpxColors.length; ++i)
            {
                dist = fdist(gpxColors[i], point);
                if (dist < min)
                {
                    min = dist;
                    colorIndex = i;
                }
            }
            if (colorIndex < 0 || colorIndex > gpxColors.length - 1) {
                colorIndex = 0;
            }
            var p = gpxColors[colorIndex];
            var val = p.x * (256 * 256) + p.y * 256 + p.z;
            var hexstr = '#' + padLeftStr(val.toString(16), 6, '0');
            return {
                name: gpxColors[colorIndex].label,
                value: hexstr
            };
        };

    };
    GPX.prototype.writer = function (file) {
        var placemark_list = file.listPlacemarks();
        var segment_list = file.listSegments();
        var bounds = new google.maps.LatLngBounds();
        file.getBounds(bounds);
        var ne = bounds.getNorthEast();
        var sw = bounds.getSouthWest();
        var time = new Date().toISOString();
        var xml = new XMLWriter('UTF-8', '1.0');
        xml.writeStartDocument();
        xml.writeStartElement('gpx');
        xml.writeAttributeString('xmlns', 'http://www.topografix.com/GPX/1/1');
        xml.writeAttributeString('creator', 'Indian Bend Solutions LLC');
        xml.writeAttributeString('version', "1.0");
        xml.writeAttributeString('xmlns:xsi', "http://www.w3.org/2001/XMLSchema-instance");
        xml.writeAttributeString('xsi:schemaLocation', "http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd");
        xml.writeStartElement('metadata');
        xml.writeStartElement('link');
        xml.writeAttributeString('href', 'http://www.garmin.com');
        xml.writeElementString('text', 'Garmin International');
        xml.writeEndElement(); //link
        xml.writeElementString('time', time);
        xml.writeStartElement('bounds');
        xml.writeAttributeString('maxlat', sw.lat().toString());
        xml.writeAttributeString('maxlon', sw.lng().toString());
        xml.writeAttributeString('minlat', ne.lat().toString());
        xml.writeAttributeString('minlon', ne.lng().toString());
        xml.writeEndElement(); //bounds
        xml.writeEndElement(); //metadata
        if (file.options.gpx.waypoints) {
            /* waypoints */
            for (var i = 0; i < placemark_list.length; i++) {
                var pm = file.placemarks[placemark_list[i]];
                if (pm.options.symbol === 'Waypoint') {
                    xml.writeStartElement('wpt');
                    xml.writeAttributeString('lat', pm.options.position.lat().toString());
                    xml.writeAttributeString('lon', pm.options.position.lng().toString());
                    xml.writeElementString('time', time);
                    xml.writeStartElement('name');
                    xml.writeCDATA(pm.options.name);
                    xml.writeEndElement(); //name
                    xml.writeStartElement('cmt');
                    xml.writeCDATA(pm.options.desc);
                    xml.writeEndElement(); //cmt
                    xml.writeStartElement('desc');
                    xml.writeCDATA(pm.options.desc);
                    xml.writeEndElement(); //desc
                    xml.writeElementString('sym', pm.options.symbol);
                    xml.writeStartElement('extensions');
                    xml.writeStartElement('gpxx:WaypointExtension');
                    xml.writeAttributeString('xmlns:gpxx', 'http://www.garmin.com/xmlschemas/GpxExtensions/v3');
                    xml.writeElementString('gpxx:DisplayMode', 'SymbolAndName');
                    xml.writeEndElement(); //WaypointExtension
                    xml.writeEndElement(); //extensions
                    xml.writeEndElement(); //wpt
                }
            }
        }
        if (file.options.gpx.placemarks) {
            /* placemarks */
            for (var i = 0; i < placemark_list.length; i++) {
                var pm = file.placemarks[placemark_list[i]];
                if (pm.options.symbol !== 'Waypoint') {
                    xml.writeStartElement('wpt');
                    xml.writeAttributeString('lat', pm.options.position.lat().toString());
                    xml.writeAttributeString('lon', pm.options.position.lng().toString());
                    xml.writeElementString('time', time);
                    xml.writeStartElement('name');
                    xml.writeCDATA(pm.options.name);
                    xml.writeEndElement(); //name
                    xml.writeStartElement('cmt');
                    xml.writeCDATA(pm.options.desc);
                    xml.writeEndElement(); //cmt
                    xml.writeStartElement('desc');
                    xml.writeCDATA(pm.options.desc);
                    xml.writeEndElement(); //desc
                    xml.writeElementString('sym', pm.options.symbol);
                    xml.writeStartElement('extensions');
                    xml.writeStartElement('gpxx:WaypointExtension');
                    xml.writeAttributeString('xmlns:gpxx', 'http://www.garmin.com/xmlschemas/GpxExtensions/v3');
                    xml.writeElementString('gpxx:DisplayMode', 'SymbolAndName');
                    xml.writeEndElement(); //WaypointExtension
                    xml.writeEndElement(); //extensions
                    xml.writeEndElement(); //wpt
                }
            }
        }
        /* segments do routes*/
        if (file.options.gpx.routes) {
            for (i = 0; i < segment_list.length; i++) {
                var sg = file.segments[segment_list[i]];
                xml.writeStartElement('rte');
                xml.writeStartElement('name');
                xml.writeCDATA(sg.options.name);
                xml.writeEndElement(); //name
                xml.writeStartElement('desc');
                xml.writeCDATA(sg.options.desc);
                xml.writeEndElement(); //desc
                xml.writeStartElement('extensions');
                xml.writeStartElement('gpxx:RouteExtension');
                xml.writeAttributeString('xmlns:gpxx', 'http://www.garmin.com/xmlschemas/GpxExtensions/v3');
                xml.writeElementString('gpxx:IsAutoNamed', 'false');
                xml.writeElementString('gpxx:DisplayColor', gpxColor(sg.options.stroke.color).name);
                xml.writeEndElement(); //extensions
                xml.writeEndElement(); //gpxx:RouteExtension
                var points = sg.line.getPath().getArray();
                var waypoints = sg.findWaypoints();
                if ((waypoints.length === 0 || waypoints[0].index !== 0) && points.length > 0) {
                    sg.waypoint(0);
                    waypoints = sg.findWaypoints();
                }
                for (var j = 0; j < waypoints.length; j++) {
                    var pm = file.placemarks[waypoints[j].pid];
                    xml.writeStartElement('rtept');
                    xml.writeAttributeString('lat', waypoints[j].latlng.lat().toString());
                    xml.writeAttributeString('lon', waypoints[j].latlng.lng().toString());
                    xml.writeStartElement('name');
                    xml.writeCDATA(pm.options.name);
                    xml.writeEndElement();
                    xml.writeStartElement('cmt');
                    xml.writeCDATA(pm.options.desc);
                    xml.writeEndElement();
                    xml.writeStartElement('desc');
                    xml.writeCDATA(pm.options.desc);
                    xml.writeEndElement();
                    xml.writeElementString('sym', 'Waypoint');
                    xml.writeStartElement('extensions');
                    xml.writeStartElement('gpxx:RoutePointExtension');
                    xml.writeAttributeString('xmlns:gpxx', 'http://www.garmin.com/xmlschemas/GpxExtensions/v3');
                    xml.writeElementString('gpxx:Subclass', '000000000000FFFFFFFFFFFFFFFFFFFFFFFF');
                    var hh = j < waypoints.length - 1 ? waypoints[j + 1].index : points.length - 1;
                    for (var gg = waypoints[j].index + 1; gg < hh; gg++) {
                        xml.writeStartElement('gpxx:rpt');
                        xml.writeAttributeString('lat', points[gg].lat().toString());
                        xml.writeAttributeString('lon', points[gg].lng().toString());
                        xml.writeEndElement();
                    }
                    xml.writeEndElement(); //RoutePointExtension
                    xml.writeEndElement(); //extensions
                    xml.writeEndElement(); //rtept
                }
                xml.writeEndElement(); //rte 
            }
        }
        /* segments do tracks */
        if (file.options.gpx.waypoints) {
            xml.writeStartElement('trk');
            for (var sid in file.segments) {
                var sg = file.segments[sid];
                xml.writeStartElement('trkseg');
                xml.writeStartElement('extensions');
                xml.writeStartElement('gpxx:TrackExtension');
                xml.writeAttributeString('xmlns:gpxx', 'http://www.garmin.com/xmlschemas/GpxExtensions/v3');
                xml.writeElementString('gpxx:DisplayColor', gpxColor(sg.options.stroke.color).name);
                xml.writeEndElement(); //extensions
                xml.writeEndElement(); //gpxx:TrackExtension
                xml.writeStartElement('name');
                xml.writeCDATA(sg.options.name);
                xml.writeEndElement(); //name
                xml.writeStartElement('desc');
                xml.writeCDATA(sg.options.desc);
                xml.writeEndElement(); //desc
                sg.line.getPath().forEach(function (latlng) {
                    xml.writeStartElement('trkpt');
                    xml.writeAttributeString('lat', latlng.lat().toString());
                    xml.writeAttributeString('lon', latlng.lng().toString());
                    //xml.writeElementString('ele', '0.0');
                    xml.writeEndElement(); //trkpt
                });
                xml.writeEndElement()//trkseg
            }
            ;
            xml.writeEndElement(); //trk
        }
        xml.writeEndElement(); //gpx
        xml.writeEndDocument();
        return xml.flush();
    };
    GPX.prototype.reader = function (xml, file) {
        $(xml).children('gpx').each($.proxy(function (n, gpx) {
            file.options.desc = $(gpx).attr('creator');
            $(gpx).children('wpt').each($.proxy(function (n, wpt) {
                var marker_options = {
                    url: '',
                    symbol: null,
                    name: null,
                    desc: null,
                    position: null,
                    daraggable: false,
                    visible: false
                };
                marker_options.name = getCDATA($(wpt).find('name').text());
                marker_options.cmt = getCDATA($(wpt).find('cmt').text());
                marker_options.desc = getCDATA($(wpt).find('desc').text());
                marker_options.symbol = $(wpt).find('sym').text();
                marker_options.position = new google.maps.LatLng(parseFloat($(wpt).attr('lat')), parseFloat($(wpt).attr('lon')));
                file._addPlacemark(marker_options);
            }, this));
            $(gpx).children('rte').each(function (n, rte) {
                var segment_options = {
                    path: [],
                    stroke: {color: '#0000ff', opacity: 0.7, weight: 5},
                    name: '',
                    desc: ''
                };
                segment_options.name = getCDATA($(rte).find('name:first').text());
                segment_options.cmt = getCDATA($(rte).find('cmt:first').text());
                segment_options.desc = getCDATA($(rte).find('desc:first').text());
                $(rte).children('extensions').each(function (n, extension) {
                    $(extension).children().each(function (n, x) {
                        if (x.nodeName === 'gpxx:RouteExtension') {
                            $(x).children().each(function (n, xx) {
                                if (xx.nodeName === 'gpxx:DisplayColor') {
                                    segment_options.stroke.color = color_to_hex($(xx).text());
                                }
                            });
                        }
                    });
                });
                $(rte).children('rtept').each(function (n, rtept) {
                    var latlng = new google.maps.LatLng(parseFloat($(rtept).attr('lat')), parseFloat($(rtept).attr('lon')));
                    segment_options.path.push(latlng);
                    $(rtept).children('extensions').each(function (n, extension) {
                        $(extension).children().each(function (n, routeptextension) {
                            if (routeptextension.nodeName === 'gpxx:RoutePointExtension') {
                                $(routeptextension).children().each(function (n, rpt) {
                                    if (rpt.nodeName === 'gpxx:rpt') {
                                        segment_options.path.push(new google.maps.LatLng(parseFloat($(rpt).attr('lat')), parseFloat($(rpt).attr('lon'))));
                                    }
                                });
                            }
                        });
                    });
                });
                if (segment_options.path.length > 1) {
                    file._addSegment(segment_options);
                }
            });
            $(gpx).children('trk').each(function (n, trk) {
                $(trk).children('trkseg').each(function (n, trkseg) {
                    var track_options = {
                        path: [],
                        stroke: {color: '#0000ff', opacity: 0.7, weight: 5},
                        name: 'track' + n,
                        desc: ''
                    };
                    var a = $(trkseg).find('name:first').text();
                    track_options.name = typeof (a) === 'undefined' || a === '' ? 'track-' + (n + 1) : a;
                    track_options.cmt = getCDATA($(trkseg).find('cmt:first').text());
                    track_options.desc = getCDATA($(trkseg).find('desc:first').text());
                    $(trkseg).children('extensions').each(function (n, extension) {
                        $(extension).children().each(function (n, x) {
                            if (x.nodeName === 'gpxx:TrackExtension') {
                                $(x).children().each(function (n, xx) {
                                    if (xx.nodeName === 'gpxx:DisplayColor') {
                                        track_options.stroke.color = color_to_hex($(xx).text());
                                    }
                                });
                            }
                        });
                    });
                    $(trkseg).children('trkpt').each(function (n, trkpt) {
                        var latlng = new google.maps.LatLng(parseFloat($(trkpt).attr('lat')), parseFloat($(trkpt).attr('lon')));
                        track_options.path.push(latlng);
                    });
                    file._addSegment(track_options);
                });
            });
        }, this));
    };
}
)(jQuery);