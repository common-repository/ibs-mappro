//*globals window, navigator, document, FormData, File, HTMLInputElement, XMLHttpRequest, Blob, Storage*/
var qq = function(element) {
    "use strict";

    return {
        hide: function() {
            element.style.display = 'none';
            return this;
        },

        /** Returns the function which detaches attached event */
        attach: function(type, fn) {
            if (element.addEventListener){
                element.addEventListener(type, fn, false);
            } else if (element.attachEvent){
                element.attachEvent('on' + type, fn);
            }
            return function() {
                qq(element).detach(type, fn);
            };
        },

        detach: function(type, fn) {
            if (element.removeEventListener){
                element.removeEventListener(type, fn, false);
            } else if (element.attachEvent){
                element.detachEvent('on' + type, fn);
            }
            return this;
        },

        contains: function(descendant) {
            // The [W3C spec](http://www.w3.org/TR/domcore/#dom-node-contains)
            // says a `null` (or ostensibly `undefined`) parameter
            // passed into `Node.contains` should result in a false return value.
            // IE7 throws an exception if the parameter is `undefined` though.
            if (!descendant) {
                return false;
            }

            // compareposition returns false in this case
            if (element === descendant) {
                return true;
            }

            if (element.contains){
                return element.contains(descendant);
            } else {
                /*jslint bitwise: true*/
                return !!(descendant.compareDocumentPosition(element) & 8);
            }
        },

        /**
         * Insert this element before elementB.
         */
        insertBefore: function(elementB) {
            elementB.parentNode.insertBefore(element, elementB);
            return this;
        },

        remove: function() {
            element.parentNode.removeChild(element);
            return this;
        },

        /**
         * Sets styles for an element.
         * Fixes opacity in IE6-8.
         */
        css: function(styles) {
            if (styles.opacity != null){
                if (typeof element.style.opacity !== 'string' && typeof(element.filters) !== 'undefined'){
                    styles.filter = 'alpha(opacity=' + Math.round(100 * styles.opacity) + ')';
                }
            }
            qq.extend(element.style, styles);

            return this;
        },

        hasClass: function(name) {
            var re = new RegExp('(^| )' + name + '( |$)');
            return re.test(element.className);
        },

        addClass: function(name) {
            if (!qq(element).hasClass(name)){
                element.className += ' ' + name;
            }
            return this;
        },

        removeClass: function(name) {
            var re = new RegExp('(^| )' + name + '( |$)');
            element.className = element.className.replace(re, ' ').replace(/^\s+|\s+$/g, "");
            return this;
        },

        getByClass: function(className) {
            var candidates,
                result = [];

            if (element.querySelectorAll){
                return element.querySelectorAll('.' + className);
            }

            candidates = element.getElementsByTagName("*");

            qq.each(candidates, function(idx, val) {
                if (qq(val).hasClass(className)){
                    result.push(val);
                }
            });
            return result;
        },

        children: function() {
            var children = [],
                child = element.firstChild;

            while (child){
                if (child.nodeType === 1){
                    children.push(child);
                }
                child = child.nextSibling;
            }

            return children;
        },

        setText: function(text) {
            element.innerText = text;
            element.textContent = text;
            return this;
        },

        clearText: function() {
            return qq(element).setText("");
        }
    };
};

qq.log = function(message, level) {
    "use strict";

    if (window.console) {
        if (!level || level === 'info') {
            window.console.log(message);
        }
        else
        {
            if (window.console[level]) {
                window.console[level](message);
            }
            else {
                window.console.log('<' + level + '> ' + message);
            }
        }
    }
};

qq.isObject = function(variable) {
    "use strict";
    return variable && !variable.nodeType && Object.prototype.toString.call(variable) === '[object Object]';
};

qq.isFunction = function(variable) {
    "use strict";
    return typeof(variable) === "function";
};

qq.isArray = function(variable) {
    "use strict";
    return Object.prototype.toString.call(variable) === "[object Array]";
};

// Looks for an object on a `DataTransfer` object that is associated with drop events when utilizing the Filesystem API.
qq.isItemList = function(maybeItemList) {
    "use strict";
    return Object.prototype.toString.call(maybeItemList) === "[object DataTransferItemList]";
};

// Looks for an object on a `NodeList` or an `HTMLCollection`|`HTMLFormElement`|`HTMLSelectElement`
// object that is associated with collections of Nodes.
qq.isNodeList = function(maybeNodeList) {
    "use strict";
    return Object.prototype.toString.call(maybeNodeList) === "[object NodeList]" ||
        // If `HTMLCollection` is the actual type of the object, we must determine this
        // by checking for expected properties/methods on the object
        (maybeNodeList.item && maybeNodeList.namedItem);
};

qq.isString = function(maybeString) {
    "use strict";
    return Object.prototype.toString.call(maybeString) === '[object String]';
};

qq.trimStr = function(string) {
    if (String.prototype.trim) {
        return string.trim();
    }

    return string.replace(/^\s+|\s+$/g,'');
};


/**
 * @param str String to format.
 * @returns {string} A string, swapping argument values with the associated occurrence of {} in the passed string.
 */
qq.format = function(str) {
    "use strict";

    var args =  Array.prototype.slice.call(arguments, 1),
        newStr = str;

    qq.each(args, function(idx, val) {
        newStr = newStr.replace(/{}/, val);
    });

    return newStr;
};

qq.isFile = function(maybeFile) {
    "use strict";

    return window.File && Object.prototype.toString.call(maybeFile) === '[object File]'
};

qq.isFileList = function(maybeFileList) {
    return window.FileList && Object.prototype.toString.call(maybeFileList) === '[object FileList]'
};

qq.isFileOrInput = function(maybeFileOrInput) {
    "use strict";

    return qq.isFile(maybeFileOrInput) || qq.isInput(maybeFileOrInput);
};

qq.isInput = function(maybeInput) {
    if (window.HTMLInputElement) {
        if (Object.prototype.toString.call(maybeInput) === '[object HTMLInputElement]') {
            if (maybeInput.type && maybeInput.type.toLowerCase() === 'file') {
                return true;
            }
        }
    }
    if (maybeInput.tagName) {
        if (maybeInput.tagName.toLowerCase() === 'input') {
            if (maybeInput.type && maybeInput.type.toLowerCase() === 'file') {
                return true;
            }
        }
    }

    return false;
};

qq.isBlob = function(maybeBlob) {
    "use strict";
    return window.Blob && Object.prototype.toString.call(maybeBlob) === '[object Blob]';
};

qq.isXhrUploadSupported = function() {
    "use strict";
    var input = document.createElement('input');
    input.type = 'file';

    return (
        input.multiple !== undefined &&
            typeof File !== "undefined" &&
            typeof FormData !== "undefined" &&
            typeof (qq.createXhrInstance()).upload !== "undefined" );
};

// Fall back to ActiveX is native XHR is disabled (possible in any version of IE).
qq.createXhrInstance = function() {
    if (window.XMLHttpRequest) {
        return new XMLHttpRequest();
    }

    try {
        return new ActiveXObject("MSXML2.XMLHTTP.3.0");
    }
    catch(error) {
        qq.log("Neither XHR or ActiveX are supported!", "error");
        return null;
    }
};

qq.isFolderDropSupported = function(dataTransfer) {
    "use strict";
    return (dataTransfer.items && dataTransfer.items[0].webkitGetAsEntry);
};

qq.isFileChunkingSupported = function() {
    "use strict";
    return !qq.android() && //android's impl of Blob.slice is broken
        qq.isXhrUploadSupported() &&
        (File.prototype.slice !== undefined || File.prototype.webkitSlice !== undefined || File.prototype.mozSlice !== undefined);
};

qq.extend = function(first, second, extendNested) {
    "use strict";

    qq.each(second, function(prop, val) {
        if (extendNested && qq.isObject(val)) {
            if (first[prop] === undefined) {
                first[prop] = {};
            }
            qq.extend(first[prop], val, true);
        }
        else {
            first[prop] = val;
        }
    });

    return first;
};

/**
 * Allow properties in one object to override properties in another,
 * keeping track of the original values from the target object.
 *
 * Note that the pre-overriden properties to be overriden by the source will be passed into the `sourceFn` when it is invoked.
 *
 * @param target Update properties in this object from some source
 * @param sourceFn A function that, when invoked, will return properties that will replace properties with the same name in the target.
 * @returns {object} The target object
 */
qq.override = function(target, sourceFn) {
    var super_ = {},
        source = sourceFn(super_);

    qq.each(source, function(srcPropName, srcPropVal) {
        if (target[srcPropName] !== undefined) {
            super_[srcPropName] = target[srcPropName];
        }

        target[srcPropName] = srcPropVal;
    });

    return target;
};

/**
 * Searches for a given element in the array, returns -1 if it is not present.
 * @param {Number} [from] The index at which to begin the search
 */
qq.indexOf = function(arr, elt, from){
    "use strict";

    if (arr.indexOf) {
        return arr.indexOf(elt, from);
    }

    from = from || 0;
    var len = arr.length;

    if (from < 0) {
        from += len;
    }

    for (; from < len; from+=1){
        if (arr.hasOwnProperty(from) && arr[from] === elt){
            return from;
        }
    }
    return -1;
};

//this is a version 4 UUID
qq.getUniqueId = function(){
    "use strict";

    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        /*jslint eqeq: true, bitwise: true*/
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
};

//
// Browsers and platforms detection

qq.ie       = function(){
    "use strict";
    return navigator.userAgent.indexOf('MSIE') !== -1;
};
qq.ie7      = function(){
    "use strict";
    return navigator.userAgent.indexOf('MSIE 7') !== -1;
};
qq.ie10     = function(){
    "use strict";
    return navigator.userAgent.indexOf('MSIE 10') !== -1;
};
qq.safari   = function(){
    "use strict";
    return navigator.vendor !== undefined && navigator.vendor.indexOf("Apple") !== -1;
};
qq.chrome   = function(){
    "use strict";
    return navigator.vendor !== undefined && navigator.vendor.indexOf('Google') !== -1;
};
qq.firefox  = function(){
    "use strict";
    return (navigator.userAgent.indexOf('Mozilla') !== -1 && navigator.vendor !== undefined && navigator.vendor === '');
};
qq.windows  = function(){
    "use strict";
    return navigator.platform === "Win32";
};
qq.android = function(){
    "use strict";
    return navigator.userAgent.toLowerCase().indexOf('android') !== -1;
};
qq.ios7 = function() {
    "use strict";
    return qq.ios() && navigator.userAgent.indexOf(" OS 7_") !== -1;
};
qq.ios = function() {
    "use strict";
    return navigator.userAgent.indexOf("iPad") !== -1
        || navigator.userAgent.indexOf("iPod") !== -1
        || navigator.userAgent.indexOf("iPhone") !== -1;
};

//
// Events

qq.preventDefault = function(e){
    "use strict";
    if (e.preventDefault){
        e.preventDefault();
    } else{
        e.returnValue = false;
    }
};

/**
 * Creates and returns element from html string
 * Uses innerHTML to create an element
 */
qq.toElement = (function(){
    "use strict";
    var div = document.createElement('div');
    return function(html){
        div.innerHTML = html;
        var element = div.firstChild;
        div.removeChild(element);
        return element;
    };
}());

//key and value are passed to callback for each entry in the iterable item
qq.each = function(iterableItem, callback) {
    "use strict";
    var keyOrIndex, retVal;

    if (iterableItem) {
        // Iterate through [`Storage`](http://www.w3.org/TR/webstorage/#the-storage-interface) items
        if (window.Storage && iterableItem.constructor === window.Storage) {
            for (keyOrIndex = 0; keyOrIndex < iterableItem.length; keyOrIndex++) {
                retVal = callback(iterableItem.key(keyOrIndex), iterableItem.getItem(iterableItem.key(keyOrIndex)));
                if (retVal === false) {
                    break;
                }
            }
        }
        // `DataTransferItemList` & `NodeList` objects are array-like and should be treated as arrays
        // when iterating over items inside the object.
        else if (qq.isArray(iterableItem) || qq.isItemList(iterableItem) || qq.isNodeList(iterableItem)) {
            for (keyOrIndex = 0; keyOrIndex < iterableItem.length; keyOrIndex++) {
                retVal = callback(keyOrIndex, iterableItem[keyOrIndex]);
                if (retVal === false) {
                    break;
                }
            }
        }
        else if (qq.isString(iterableItem)) {
            for (keyOrIndex = 0; keyOrIndex < iterableItem.length; keyOrIndex++) {
                retVal = callback(keyOrIndex, iterableItem.charAt(keyOrIndex));
                if (retVal === false) {
                    break;
                }
            }
        }
        else {
            for (keyOrIndex in iterableItem) {
                if (Object.prototype.hasOwnProperty.call(iterableItem, keyOrIndex)) {
                    retVal = callback(keyOrIndex, iterableItem[keyOrIndex]);
                    if (retVal === false) {
                        break;
                    }
                }
            }
        }
    }
};

//include any args that should be passed to the new function after the context arg
qq.bind = function(oldFunc, context) {
    if (qq.isFunction(oldFunc)) {
        var args =  Array.prototype.slice.call(arguments, 2);

        return function() {
            var newArgs = qq.extend([], args);
            if (arguments.length) {
                newArgs = newArgs.concat(Array.prototype.slice.call(arguments))
            }
            return oldFunc.apply(context, newArgs);
        };
    }

    throw new Error("first parameter must be a function!");
};

/**
 * obj2url() takes a json-object as argument and generates
 * a querystring. pretty much like jQuery.param()
 *
 * how to use:
 *
 *    `qq.obj2url({a:'b',c:'d'},'http://any.url/upload?otherParam=value');`
 *
 * will result in:
 *
 *    `http://any.url/upload?otherParam=value&a=b&c=d`
 *
 * @param  Object JSON-Object
 * @param  String current querystring-part
 * @return String encoded querystring
 */
qq.obj2url = function(obj, temp, prefixDone){
    "use strict";
    /*jshint laxbreak: true*/
     var uristrings = [],
         prefix = '&',
         add = function(nextObj, i){
            var nextTemp = temp
                ? (/\[\]$/.test(temp)) // prevent double-encoding
                ? temp
                : temp+'['+i+']'
                : i;
            if ((nextTemp !== 'undefined') && (i !== 'undefined')) {
                uristrings.push(
                    (typeof nextObj === 'object')
                        ? qq.obj2url(nextObj, nextTemp, true)
                        : (Object.prototype.toString.call(nextObj) === '[object Function]')
                        ? encodeURIComponent(nextTemp) + '=' + encodeURIComponent(nextObj())
                        : encodeURIComponent(nextTemp) + '=' + encodeURIComponent(nextObj)
                );
            }
        };

    if (!prefixDone && temp) {
        prefix = (/\?/.test(temp)) ? (/\?$/.test(temp)) ? '' : '&' : '?';
        uristrings.push(temp);
        uristrings.push(qq.obj2url(obj));
    } else if ((Object.prototype.toString.call(obj) === '[object Array]') && (typeof obj !== 'undefined') ) {
        qq.each(obj, function(idx, val) {
            add(val, idx);
        });
    } else if ((typeof obj !== 'undefined') && (obj !== null) && (typeof obj === "object")){
        qq.each(obj, function(prop, val) {
            add(val, prop);
        });
    } else {
        uristrings.push(encodeURIComponent(temp) + '=' + encodeURIComponent(obj));
    }

    if (temp) {
        return uristrings.join(prefix);
    } else {
        return uristrings.join(prefix)
            .replace(/^&/, '')
            .replace(/%20/g, '+');
    }
};

qq.obj2FormData = function(obj, formData, arrayKeyName) {
    "use strict";
    if (!formData) {
        formData = new FormData();
    }

    qq.each(obj, function(key, val) {
        key = arrayKeyName ? arrayKeyName + '[' + key + ']' : key;

        if (qq.isObject(val)) {
            qq.obj2FormData(val, formData, key);
        }
        else if (qq.isFunction(val)) {
            formData.append(key, val());
        }
        else {
            formData.append(key, val);
        }
    });

    return formData;
};

qq.obj2Inputs = function(obj, form) {
    "use strict";
    var input;

    if (!form) {
        form = document.createElement('form');
    }

    qq.obj2FormData(obj, {
        append: function(key, val) {
            input = document.createElement('input');
            input.setAttribute('name', key);
            input.setAttribute('value', val);
            form.appendChild(input);
        }
    });

    return form;
};

qq.setCookie = function(name, value, days) {
    var date = new Date(),
        expires = "";

	if (days) {
		date.setTime(date.getTime()+(days*24*60*60*1000));
		expires = "; expires="+date.toGMTString();
	}

	document.cookie = name+"="+value+expires+"; path=/";
};

qq.getCookie = function(name) {
	var nameEQ = name + "=",
        ca = document.cookie.split(';'),
        cookie;

    qq.each(ca, function(idx, part) {
        var cookiePart = part;
        while (cookiePart.charAt(0)==' ') {
            cookiePart = cookiePart.substring(1, cookiePart.length);
        }

        if (cookiePart.indexOf(nameEQ) === 0) {
            cookie = cookiePart.substring(nameEQ.length, cookiePart.length);
            return false;
        }
    });

    return cookie;
};

qq.getCookieNames = function(regexp) {
    var cookies = document.cookie.split(';'),
        cookieNames = [];

    qq.each(cookies, function(idx, cookie) {
        cookie = qq.trimStr(cookie);

        var equalsIdx = cookie.indexOf("=");

        if (cookie.match(regexp)) {
            cookieNames.push(cookie.substr(0, equalsIdx));
        }
    });

    return cookieNames;
};

qq.deleteCookie = function(name) {
	qq.setCookie(name, "", -1);
};

qq.areCookiesEnabled = function() {
    var randNum = Math.random() * 100000,
        name = "qqCookieTest:" + randNum;
    qq.setCookie(name, 1);

    if (qq.getCookie(name)) {
        qq.deleteCookie(name);
        return true;
    }
    return false;
};

/**
 * Not recommended for use outside of Fine Uploader since this falls back to an unchecked eval if JSON.parse is not
 * implemented.  For a more secure JSON.parse polyfill, use Douglas Crockford's json2.js.
 */
qq.parseJson = function(json) {
    /*jshint evil: true*/
    if (window.JSON && qq.isFunction(JSON.parse)) {
        return JSON.parse(json);
    } else {
        return eval("(" + json + ")");
    }
};

/**
 * Retrieve the extension of a file, if it exists.
 *
 * @param filename
 * @returns {string || undefined}
 */
qq.getExtension = function(filename) {
    var extIdx = filename.lastIndexOf('.') + 1;

    if (extIdx > 0) {
        return filename.substr(extIdx, filename.length - extIdx);
    }
};

/**
 * A generic module which supports object disposing in dispose() method.
 * */
qq.DisposeSupport = function() {
    "use strict";
    var disposers = [];

    return {
        /** Run all registered disposers */
        dispose: function() {
            var disposer;
            do {
                disposer = disposers.shift();
                if (disposer) {
                    disposer();
                }
            }
            while (disposer);
        },

        /** Attach event handler and register de-attacher as a disposer */
        attach: function() {
            var args = arguments;
            /*jslint undef:true*/
            this.addDisposer(qq(args[0]).attach.apply(this, Array.prototype.slice.call(arguments, 1)));
        },

        /** Add disposer to the collection */
        addDisposer: function(disposeFunction) {
            disposers.push(disposeFunction);
        }
    };
};
/**
 * Defines the public API for FineUploaderBasic mode.
 */
qq.basePublicApi = {
    log: function(str, level) {
        if (this._options.debug && (!level || level === 'info')) {
            qq.log('[FineUploader ' + qq.version + '] ' + str);
        }
        else if (level && level !== 'info') {
            qq.log('[FineUploader ' + qq.version + '] ' + str, level);

        }
    },

    setParams: function(params, id) {
        /*jshint eqeqeq: true, eqnull: true*/
        if (id == null) {
            this._options.request.params = params;
        }
        else {
            this._paramsStore.setParams(params, id);
        }
    },

    setDeleteFileParams: function(params, id) {
        /*jshint eqeqeq: true, eqnull: true*/
        if (id == null) {
            this._options.deleteFile.params = params;
        }
        else {
            this._deleteFileParamsStore.setParams(params, id);
        }
    },

    // Re-sets the default endpoint, an endpoint for a specific file, or an endpoint for a specific button
    setEndpoint: function(endpoint, id) {
        /*jshint eqeqeq: true, eqnull: true*/
        if (id == null) {
            this._options.request.endpoint = endpoint;
        }
        else {
            this._endpointStore.setEndpoint(endpoint, id);
        }
    },

    getInProgress: function() {
        return this._filesInProgress.length;
    },

    getNetUploads: function() {
        return this._netUploaded;
    },

    uploadStoredFiles: function() {
        var idToUpload;

        if (this._storedIds.length === 0) {
            this._itemError('noFilesError');
        }
        else {
            while (this._storedIds.length) {
                idToUpload = this._storedIds.shift();
                this._filesInProgress.push(idToUpload);
                this._handler.upload(idToUpload);
            }
        }
    },

    clearStoredFiles: function(){
        this._storedIds = [];
    },

    retry: function(id) {
        return this._manualRetry(id);
    },

    cancel: function(id) {
        this._handler.cancel(id);
    },

    cancelAll: function() {
        var storedIdsCopy = [],
            self = this;

        qq.extend(storedIdsCopy, this._storedIds);
        qq.each(storedIdsCopy, function(idx, storedFileId) {
            self.cancel(storedFileId);
        });

        this._handler.cancelAll();
    },

    reset: function() {
        this.log("Resetting uploader...");

        this._handler.reset();
        this._filesInProgress = [];
        this._storedIds = [];
        this._autoRetries = [];
        this._retryTimeouts = [];
        this._preventRetries = [];

        qq.each(this._buttons, function(idx, button) {
            button.reset();
        });

        this._paramsStore.reset();
        this._endpointStore.reset();
        this._netUploadedOrQueued = 0;
        this._netUploaded = 0;
        this._uploadData.reset();
        this._buttonIdsForFileIds = [];

        if (this._pasteHandler) {
            this._pasteHandler.reset();
        }
    },

    addFiles: function(filesOrInputs, params, endpoint) {
        var self = this,
            verifiedFilesOrInputs = [],
            fileOrInputIndex, fileOrInput, fileIndex;

        if (filesOrInputs) {
            if (!qq.isFileList(filesOrInputs)) {
                filesOrInputs = [].concat(filesOrInputs);
            }

            for (fileOrInputIndex = 0; fileOrInputIndex < filesOrInputs.length; fileOrInputIndex+=1) {
                fileOrInput = filesOrInputs[fileOrInputIndex];

                if (qq.isFileOrInput(fileOrInput)) {
                    if (qq.isInput(fileOrInput) && qq.supportedFeatures.ajaxUploading) {
                        for (fileIndex = 0; fileIndex < fileOrInput.files.length; fileIndex++) {
                            verifiedFilesOrInputs.push(fileOrInput.files[fileIndex]);
                        }
                    }
                    else {
                        verifiedFilesOrInputs.push(fileOrInput);
                    }
                }
                else {
                    self.log(fileOrInput + ' is not a File or INPUT element!  Ignoring!', 'warn');
                }
            }

            this.log('Received ' + verifiedFilesOrInputs.length + ' files or inputs.');
            this._prepareItemsForUpload(verifiedFilesOrInputs, params, endpoint);
        }
    },

    addBlobs: function(blobDataOrArray, params, endpoint) {
        if (blobDataOrArray) {
            var blobDataArray = [].concat(blobDataOrArray),
                verifiedBlobDataList = [],
                self = this;

            qq.each(blobDataArray, function(idx, blobData) {
                if (qq.isBlob(blobData) && !qq.isFileOrInput(blobData)) {
                    verifiedBlobDataList.push({
                        blob: blobData,
                        name: self._options.blobs.defaultName
                    });
                }
                else if (qq.isObject(blobData) && blobData.blob && blobData.name) {
                    verifiedBlobDataList.push(blobData);
                }
                else {
                    self.log("addBlobs: entry at index " + idx + " is not a Blob or a BlobData object", "error");
                }
            });

            this._prepareItemsForUpload(verifiedBlobDataList, params, endpoint);
        }
        else {
            this.log("undefined or non-array parameter passed into addBlobs", "error");
        }
    },

    getUuid: function(id) {
        return this._handler.getUuid(id);
    },

    setUuid: function(id, newUuid) {
        return this._handler.setUuid(id, newUuid);
    },

    getResumableFilesData: function() {
        return this._handler.getResumableFilesData();
    },

    getSize: function(id) {
        return this._handler.getSize(id);
    },

    getName: function(id) {
        return this._handler.getName(id);
    },

    setName: function(id, newName) {
        this._handler.setName(id, newName);
        this._uploadData.nameChanged(id, newName);
    },

    getFile: function(fileOrBlobId) {
        return this._handler.getFile(fileOrBlobId);
    },

    deleteFile: function(id) {
        this._onSubmitDelete(id);
    },

    setDeleteFileEndpoint: function(endpoint, id) {
        /*jshint eqeqeq: true, eqnull: true*/
        if (id == null) {
            this._options.deleteFile.endpoint = endpoint;
        }
        else {
            this._deleteFileEndpointStore.setEndpoint(endpoint, id);
        }
    },

    doesExist: function(fileOrBlobId) {
        return this._handler.isValid(fileOrBlobId);
    },

    getUploads: function(optionalFilter) {
        return this._uploadData.retrieve(optionalFilter);
    },

    getButton: function(fileId) {
        return this._getButton(this._buttonIdsForFileIds[fileId]);
    }
};




/**
 * Defines the private (internal) API for FineUploaderBasic mode.
 */
qq.basePrivateApi = {
    // Creates an internal object that tracks various properties of each extra button,
    // and then actually creates the extra button.
    _generateExtraButtonSpecs: function() {
        var self = this;

        this._extraButtonSpecs = {};

        qq.each(this._options.extraButtons, function(idx, extraButtonOptionEntry) {
            var multiple = extraButtonOptionEntry.multiple,
                validation = qq.extend({}, self._options.validation, true),
                extraButtonSpec = qq.extend({}, extraButtonOptionEntry);

            if (multiple === undefined) {
                multiple = self._options.multiple;
            }

            if (extraButtonSpec.validation) {
                qq.extend(validation, extraButtonOptionEntry.validation, true);
            }

            qq.extend(extraButtonSpec, {
                multiple: multiple,
                validation: validation
            }, true);

            self._initExtraButton(extraButtonSpec);
        });
    },

    // Creates an extra button element
    _initExtraButton: function(spec) {
        var button = this._createUploadButton({
            element: spec.element,
            multiple: spec.multiple,
            accept: spec.validation.acceptFiles,
            folders: spec.folders
        });

        this._extraButtonSpecs[button.getButtonId()] = spec;
    },

    /**
     * Gets the internally used tracking ID for a button.
     *
     * @param buttonOrFileInputOrFile `File`, `<input type="file">`, or a button container element
     * @returns {*} The button's ID, or undefined if no ID is recoverable
     * @private
     */
    _getButtonId: function(buttonOrFileInputOrFile) {
        var inputs, fileInput;

        // If the item is a `Blob` it will never be associated with a button or drop zone.
        if (buttonOrFileInputOrFile && !buttonOrFileInputOrFile.blob && !qq.isBlob(buttonOrFileInputOrFile)) {
            if (qq.isFile(buttonOrFileInputOrFile)) {
                return buttonOrFileInputOrFile.qqButtonId;
            }
            else if (buttonOrFileInputOrFile.tagName.toLowerCase() === "input" &&
                buttonOrFileInputOrFile.type.toLowerCase() === "file") {

                return buttonOrFileInputOrFile.getAttribute(qq.UploadButton.BUTTON_ID_ATTR_NAME);
            }

            inputs = buttonOrFileInputOrFile.getElementsByTagName("input");

            qq.each(inputs, function(idx, input) {
                if (input.getAttribute("type") === "file") {
                    fileInput = input;
                    return false;
                }
            });

            if (fileInput) {
                return fileInput.getAttribute(qq.UploadButton.BUTTON_ID_ATTR_NAME);
            }
        }
    },

    _annotateWithButtonId: function(file, associatedInput) {
        if (qq.isFile(file)) {
            file.qqButtonId = this._getButtonId(associatedInput);
        }
    },

    _getButton: function(buttonId) {
        var extraButtonsSpec = this._extraButtonSpecs[buttonId];

        if (extraButtonsSpec) {
            return extraButtonsSpec.element;
        }
        else if (buttonId === this._defaultButtonId) {
            return this._options.button;
        }
    },

    _handleCheckedCallback: function(details) {
        var self = this,
            callbackRetVal = details.callback();

        if (qq.isPromise(callbackRetVal)) {
            this.log(details.name + " - waiting for " + details.name + " promise to be fulfilled for " + details.identifier);
            return callbackRetVal.then(
                function(successParam) {
                    self.log(details.name + " promise success for " + details.identifier);
                    details.onSuccess(successParam);
                },
                function() {
                    if (details.onFailure) {
                        self.log(details.name + " promise failure for " + details.identifier);
                        details.onFailure();
                    }
                    else {
                        self.log(details.name + " promise failure for " + details.identifier);
                    }
                });
        }

        if (callbackRetVal !== false) {
            details.onSuccess(callbackRetVal);
        }
        else {
            if (details.onFailure) {
                this.log(details.name + " - return value was 'false' for " + details.identifier + ".  Invoking failure callback.")
                details.onFailure();
            }
            else {
                this.log(details.name + " - return value was 'false' for " + details.identifier + ".  Will not proceed.")
            }
        }

        return callbackRetVal;
    },

    /**
     * Generate a tracked upload button.
     *
     * @param spec Object containing a required `element` property
     * along with optional `multiple`, `accept`, and `folders`.
     * @returns {qq.UploadButton}
     * @private
     */
    _createUploadButton: function(spec) {
        var self = this,
            isMultiple = spec.multiple === undefined ? this._options.multiple : spec.multiple,
            acceptFiles = spec.accept || this._options.validation.acceptFiles;

        var button = new qq.UploadButton({
            element: spec.element,
            folders: spec.folders,
            name: this._options.request.inputName,
            multiple: isMultiple && qq.supportedFeatures.ajaxUploading,
            acceptFiles: acceptFiles,
            onChange: function(input) {
                self._onInputChange(input);
            },
            hoverClass: this._options.classes.buttonHover,
            focusClass: this._options.classes.buttonFocus
        });

        this._disposeSupport.addDisposer(function() {
            button.dispose();
        });

        self._buttons.push(button);

        return button;
    },

    _createUploadHandler: function(additionalOptions, namespace) {
        var self = this,
            options = {
                debug: this._options.debug,
                maxConnections: this._options.maxConnections,
                inputName: this._options.request.inputName,
                cors: this._options.cors,
                demoMode: this._options.demoMode,
                paramsStore: this._paramsStore,
                endpointStore: this._endpointStore,
                chunking: this._options.chunking,
                resume: this._options.resume,
                blobs: this._options.blobs,
                log: function(str, level) {
                    self.log(str, level);
                },
                onProgress: function(id, name, loaded, total){
                    self._onProgress(id, name, loaded, total);
                    self._options.callbacks.onProgress(id, name, loaded, total);
                },
                onComplete: function(id, name, result, xhr){
                    var retVal = self._onComplete(id, name, result, xhr);

                    // If the internal `_onComplete` handler returns a promise, don't invoke the `onComplete` callback
                    // until the promise has been fulfilled.
                    if (qq.isPromise(retVal)) {
                        retVal.done(function() {
                            self._options.callbacks.onComplete(id, name, result, xhr);
                        });
                    }
                    else {
                        self._options.callbacks.onComplete(id, name, result, xhr);
                    }
                },
                onCancel: function(id, name) {
                    return self._handleCheckedCallback({
                        name: "onCancel",
                        callback: qq.bind(self._options.callbacks.onCancel, self, id, name),
                        onSuccess: qq.bind(self._onCancel, self, id, name),
                        identifier: id
                    });
                },
                onUpload: function(id, name) {
                    self._onUpload(id, name);
                    self._options.callbacks.onUpload(id, name);
                },
                onUploadChunk: function(id, name, chunkData){
                    self._options.callbacks.onUploadChunk(id, name, chunkData);
                },
                onResume: function(id, name, chunkData) {
                    return self._options.callbacks.onResume(id, name, chunkData);
                },
                onAutoRetry: function(id, name, responseJSON, xhr) {
                    return self._onAutoRetry.apply(self, arguments);
                },
                onUuidChanged: function(id, newUuid) {
                    self._uploadData.uuidChanged(id, newUuid);
                }
            };

        qq.each(this._options.request, function(prop, val) {
            options[prop] = val;
        });

        if (additionalOptions) {
            qq.each(additionalOptions, function(key, val) {
                options[key] = val;
            });
        }

        return new qq.UploadHandler(options, namespace);
    },

    _createDeleteHandler: function() {
        var self = this;

        return new qq.DeleteFileAjaxRequestor({
            method: this._options.deleteFile.method,
            maxConnections: this._options.maxConnections,
            uuidParamName: this._options.request.uuidName,
            customHeaders: this._options.deleteFile.customHeaders,
            paramsStore: this._deleteFileParamsStore,
            endpointStore: this._deleteFileEndpointStore,
            demoMode: this._options.demoMode,
            cors: this._options.cors,
            log: function(str, level) {
                self.log(str, level);
            },
            onDelete: function(id) {
                self._onDelete(id);
                self._options.callbacks.onDelete(id);
            },
            onDeleteComplete: function(id, xhrOrXdr, isError) {
                self._onDeleteComplete(id, xhrOrXdr, isError);
                self._options.callbacks.onDeleteComplete(id, xhrOrXdr, isError);
            }

        });
    },

    _createPasteHandler: function() {
        var self = this;

        return new qq.PasteSupport({
            targetElement: this._options.paste.targetElement,
            callbacks: {
                log: function(str, level) {
                    self.log(str, level);
                },
                pasteReceived: function(blob) {
                    self._handleCheckedCallback({
                        name: "onPasteReceived",
                        callback: qq.bind(self._options.callbacks.onPasteReceived, self, blob),
                        onSuccess: qq.bind(self._handlePasteSuccess, self, blob),
                        identifier: "pasted image"
                    });
                }
            }
        });
    },

    _createUploadDataTracker: function() {
        var self = this;

        return new qq.UploadData({
            getName: function(id) {
                return self.getName(id);
            },
            getUuid: function(id) {
                return self.getUuid(id);
            },
            getSize: function(id) {
                return self.getSize(id);
            },
            onStatusChange: function(id, oldStatus, newStatus) {
                self._onUploadStatusChange(id, oldStatus, newStatus);
                self._options.callbacks.onStatusChange(id, oldStatus, newStatus);
            }
        });
    },

    _onUploadStatusChange: function(id, oldStatus, newStatus) {
        //nothing to do in the basic uploader
    },

    _handlePasteSuccess: function(blob, extSuppliedName) {
        var extension = blob.type.split("/")[1],
            name = extSuppliedName;

        /*jshint eqeqeq: true, eqnull: true*/
        if (name == null) {
            name = this._options.paste.defaultName;
        }

        name += '.' + extension;

        this.addBlobs({
            name: name,
            blob: blob
        });
    },

    _preventLeaveInProgress: function(){
        var self = this;

        this._disposeSupport.attach(window, 'beforeunload', function(e){
            if (!self._filesInProgress.length){return;}

            var e = e || window.event;
            // for ie, ff
            e.returnValue = self._options.messages.onLeave;
            // for webkit
            return self._options.messages.onLeave;
        });
    },

    _onSubmit: function(id, name) {
        this._netUploadedOrQueued++;

        if (this._options.autoUpload) {
            this._filesInProgress.push(id);
        }
    },

    _onProgress: function(id, name, loaded, total) {
        //nothing to do yet in core uploader
    },

    _onComplete: function(id, name, result, xhr) {
        if (!result.success) {
            this._netUploadedOrQueued--;
            this._uploadData.setStatus(id, qq.status.UPLOAD_FAILED);
        }
        else {
            this._netUploaded++;
            this._uploadData.setStatus(id, qq.status.UPLOAD_SUCCESSFUL);
        }

        this._removeFromFilesInProgress(id);
        this._maybeParseAndSendUploadError(id, name, result, xhr);

        return result.success ? true : false;
    },

    _onCancel: function(id, name) {
        this._netUploadedOrQueued--;

        this._removeFromFilesInProgress(id);

        clearTimeout(this._retryTimeouts[id]);

        var storedItemIndex = qq.indexOf(this._storedIds, id);
        if (!this._options.autoUpload && storedItemIndex >= 0) {
            this._storedIds.splice(storedItemIndex, 1);
        }

        this._uploadData.setStatus(id, qq.status.CANCELED);
    },

    _isDeletePossible: function() {
        if (!this._options.deleteFile.enabled) {
            return false;
        }

        if (this._options.cors.expected) {
            if (qq.supportedFeatures.deleteFileCorsXhr) {
                return true;
            }

            if (qq.supportedFeatures.deleteFileCorsXdr && this._options.cors.allowXdr) {
                return true;
            }

            return false;
        }

        return true;
    },

    _onSubmitDelete: function(id, onSuccessCallback, additionalMandatedParams) {
        var uuid = this.getUuid(id),
            adjustedOnSuccessCallback;

        if (onSuccessCallback) {
            adjustedOnSuccessCallback = qq.bind(onSuccessCallback, this, id, uuid, additionalMandatedParams);
        }

        if (this._isDeletePossible()) {
            return this._handleCheckedCallback({
                name: "onSubmitDelete",
                callback: qq.bind(this._options.callbacks.onSubmitDelete, this, id),
                onSuccess: adjustedOnSuccessCallback ||
                    qq.bind(this._deleteHandler.sendDelete, this, id, uuid, additionalMandatedParams),
                identifier: id
            });
        }
        else {
            this.log("Delete request ignored for ID " + id + ", delete feature is disabled or request not possible " +
                "due to CORS on a user agent that does not support pre-flighting.", "warn");
            return false;
        }
    },

    _onDelete: function(id) {
        this._uploadData.setStatus(id, qq.status.DELETING);
    },

    _onDeleteComplete: function(id, xhrOrXdr, isError) {
        var name = this._handler.getName(id);

        if (isError) {
            this._uploadData.setStatus(id, qq.status.DELETE_FAILED);
            this.log("Delete request for '" + name + "' has failed.", "error");

            // For error reporing, we only have accesss to the response status if this is not
            // an `XDomainRequest`.
            if (xhrOrXdr.withCredentials === undefined) {
                this._options.callbacks.onError(id, name, "Delete request failed", xhrOrXdr);
            }
            else {
                this._options.callbacks.onError(id, name, "Delete request failed with response code " + xhrOrXdr.status, xhrOrXdr);
            }
        }
        else {
            this._netUploadedOrQueued--;
            this._netUploaded--;
            this._handler.expunge(id);
            this._uploadData.setStatus(id, qq.status.DELETED);
            this.log("Delete request for '" + name + "' has succeeded.");
        }
    },

    _removeFromFilesInProgress: function(id) {
        var index = qq.indexOf(this._filesInProgress, id);
        if (index >= 0) {
            this._filesInProgress.splice(index, 1);
        }
    },

    _onUpload: function(id, name) {
        this._uploadData.setStatus(id, qq.status.UPLOADING);
    },

    _onInputChange: function(input) {
        var fileIndex;

        if (qq.supportedFeatures.ajaxUploading) {
            for (fileIndex = 0; fileIndex < input.files.length; fileIndex++) {
                this._annotateWithButtonId(input.files[fileIndex], input);
            }

            this.addFiles(input.files);
        }
        else {
            this.addFiles(input);
        }

        qq.each(this._buttons, function(idx, button) {
            button.reset();
        });
    },

    _onBeforeAutoRetry: function(id, name) {
        this.log("Waiting " + this._options.retry.autoAttemptDelay + " seconds before retrying " + name + "...");
    },

    /**
     * Attempt to automatically retry a failed upload.
     *
     * @param id The file ID of the failed upload
     * @param name The name of the file associated with the failed upload
     * @param responseJSON Response from the server, parsed into a javascript object
     * @param xhr Ajax transport used to send the failed request
     * @param callback Optional callback to be invoked if a retry is prudent.
     * Invoked in lieu of asking the upload handler to retry.
     * @returns {boolean} true if an auto-retry will occur
     * @private
     */
    _onAutoRetry: function(id, name, responseJSON, xhr, callback) {
        var self = this;

        self._preventRetries[id] = responseJSON[self._options.retry.preventRetryResponseProperty];

        if (self._shouldAutoRetry(id, name, responseJSON)) {
            self._maybeParseAndSendUploadError.apply(self, arguments);
            self._options.callbacks.onAutoRetry(id, name, self._autoRetries[id] + 1);
            self._onBeforeAutoRetry(id, name);

            self._retryTimeouts[id] = setTimeout(function() {
                self.log("Retrying " + name + "...");
                self._autoRetries[id]++;
                self._uploadData.setStatus(id, qq.status.UPLOAD_RETRYING);

                if (callback) {
                    callback(id);
                }
                else {
                    self._handler.retry(id);
                }
            }, self._options.retry.autoAttemptDelay * 1000);

            return true;
        }
    },

    _shouldAutoRetry: function(id, name, responseJSON) {
        if (!this._preventRetries[id] && this._options.retry.enableAuto) {
            if (this._autoRetries[id] === undefined) {
                this._autoRetries[id] = 0;
            }

            return this._autoRetries[id] < this._options.retry.maxAutoAttempts;
        }

        return false;
    },

    //return false if we should not attempt the requested retry
    _onBeforeManualRetry: function(id) {
        var itemLimit = this._options.validation.itemLimit;

        if (this._preventRetries[id]) {
            this.log("Retries are forbidden for id " + id, 'warn');
            return false;
        }
        else if (this._handler.isValid(id)) {
            var fileName = this._handler.getName(id);

            if (this._options.callbacks.onManualRetry(id, fileName) === false) {
                return false;
            }

            if (itemLimit > 0 && this._netUploadedOrQueued+1 > itemLimit) {
                this._itemError("retryFailTooManyItems");
                return false;
            }

            this.log("Retrying upload for '" + fileName + "' (id: " + id + ")...");
            this._filesInProgress.push(id);
            return true;
        }
        else {
            this.log("'" + id + "' is not a valid file ID", 'error');
            return false;
        }
    },

    /**
     * Conditionally orders a manual retry of a failed upload.
     *
     * @param id File ID of the failed upload
     * @param callback Optional callback to invoke if a retry is prudent.
     * In lieu of asking the upload handler to retry.
     * @returns {boolean} true if a manual retry will occur
     * @private
     */
    _manualRetry: function(id, callback) {
        if (this._onBeforeManualRetry(id)) {
            this._netUploadedOrQueued++;
            this._uploadData.setStatus(id, qq.status.UPLOAD_RETRYING);

            if (callback) {
                callback(id);
            }
            else {
                this._handler.retry(id);
            }

            return true;
        }
    },

    _maybeParseAndSendUploadError: function(id, name, response, xhr) {
        // Assuming no one will actually set the response code to something other than 200
        // and still set 'success' to true...
        if (!response.success){
            if (xhr && xhr.status !== 200 && !response.error) {
                this._options.callbacks.onError(id, name, "XHR returned response code " + xhr.status, xhr);
            }
            else {
                var errorReason = response.error ? response.error : this._options.text.defaultResponseError;
                this._options.callbacks.onError(id, name, errorReason, xhr);
            }
        }
    },

    _prepareItemsForUpload: function(items, params, endpoint) {
        var validationDescriptors = this._getValidationDescriptors(items),
            buttonId = this._getButtonId(items[0]),
            button = this._getButton(buttonId);

        this._handleCheckedCallback({
            name: "onValidateBatch",
            callback: qq.bind(this._options.callbacks.onValidateBatch, this, validationDescriptors, button),
            onSuccess: qq.bind(this._onValidateBatchCallbackSuccess, this, validationDescriptors, items, params, endpoint, button),
            identifier: "batch validation"
        });
    },

    _upload: function(blobOrFileContainer, params, endpoint) {
        var id = this._handler.add(blobOrFileContainer),
            name = this._handler.getName(id);

        this._uploadData.added(id);

        if (params) {
            this.setParams(params, id);
        }

        if (endpoint) {
            this.setEndpoint(endpoint, id);
        }

        this._handleCheckedCallback({
            name: "onSubmit",
            callback: qq.bind(this._options.callbacks.onSubmit, this, id, name),
            onSuccess: qq.bind(this._onSubmitCallbackSuccess, this, id, name),
            onFailure: qq.bind(this._fileOrBlobRejected, this, id, name),
            identifier: id
        });
    },

    _onSubmitCallbackSuccess: function(id, name) {
        var buttonId;

        this._uploadData.setStatus(id, qq.status.SUBMITTED);

        if (qq.supportedFeatures.ajaxUploading) {
            buttonId = this._handler.getFile(id).qqButtonId;
        }
        else {
            buttonId = this._getButtonId(this._handler.getInput(id));
        }

        if (buttonId) {
            this._buttonIdsForFileIds[id] = buttonId;
        }

        this._onSubmit.apply(this, arguments);
        this._onSubmitted.apply(this, arguments);
        this._options.callbacks.onSubmitted.apply(this, arguments);

        if (this._options.autoUpload) {
            if (!this._handler.upload(id)) {
                this._uploadData.setStatus(id, qq.status.QUEUED);
            }
        }
        else {
            this._storeForLater(id);
        }
    },

    _onSubmitted: function(id) {
        //nothing to do in the base uploader
    },

    _storeForLater: function(id) {
        this._storedIds.push(id);
    },

    _onValidateBatchCallbackSuccess: function(validationDescriptors, items, params, endpoint, button) {
        var errorMessage,
            itemLimit = this._options.validation.itemLimit,
            proposedNetFilesUploadedOrQueued = this._netUploadedOrQueued + validationDescriptors.length;

        if (itemLimit === 0 || proposedNetFilesUploadedOrQueued <= itemLimit) {
            if (items.length > 0) {
                this._handleCheckedCallback({
                    name: "onValidate",
                    callback: qq.bind(this._options.callbacks.onValidate, this, validationDescriptors[0], button),
                    onSuccess: qq.bind(this._onValidateCallbackSuccess, this, items, 0, params, endpoint),
                    onFailure: qq.bind(this._onValidateCallbackFailure, this, items, 0, params, endpoint),
                    identifier: "Item '" + items[0].name + "', size: " + items[0].size
                });
            }
            else {
                this._itemError("noFilesError");
            }
        }
        else {
            errorMessage = this._options.messages.tooManyItemsError
                .replace(/\{netItems\}/g, proposedNetFilesUploadedOrQueued)
                .replace(/\{itemLimit\}/g, itemLimit);
            this._batchError(errorMessage);
        }
    },

    _onValidateCallbackSuccess: function(items, index, params, endpoint) {
        var nextIndex = index+1,
            validationDescriptor = this._getValidationDescriptor(items[index]),
            validItem = false;

        if (this._validateFileOrBlobData(items[index], validationDescriptor)) {
            validItem = true;
            this._upload(items[index], params, endpoint);
        }

        this._maybeProcessNextItemAfterOnValidateCallback(validItem, items, nextIndex, params, endpoint);
    },

    _onValidateCallbackFailure: function(items, index, params, endpoint) {
        var nextIndex = index+ 1;

        this._fileOrBlobRejected(undefined, items[0].name);

        this._maybeProcessNextItemAfterOnValidateCallback(false, items, nextIndex, params, endpoint);
    },

    _maybeProcessNextItemAfterOnValidateCallback: function(validItem, items, index, params, endpoint) {
        var self = this;

        if (items.length > index) {
            if (validItem || !this._options.validation.stopOnFirstInvalidFile) {
                //use setTimeout to prevent a stack overflow with a large number of files in the batch & non-promissory callbacks
                setTimeout(function() {
                    var validationDescriptor = self._getValidationDescriptor(items[index]);

                    self._handleCheckedCallback({
                        name: "onValidate",
                        callback: qq.bind(self._options.callbacks.onValidate, self, items[index]),
                        onSuccess: qq.bind(self._onValidateCallbackSuccess, self, items, index, params, endpoint),
                        onFailure: qq.bind(self._onValidateCallbackFailure, self, items, index, params, endpoint),
                        identifier: "Item '" + validationDescriptor.name + "', size: " + validationDescriptor.size
                    });
                }, 0);
            }
        }
    },

    /**
     * Performs some internal validation checks on an item, defined in the `validation` option.
     *
     * @param item `File`, `Blob`, or `<input type="file">`
     * @param validationDescriptor Normalized information about the item (`size`, `name`).
     * @returns {boolean} true if the item is valid
     * @private
     */
    _validateFileOrBlobData: function(item, validationDescriptor) {
        var name = validationDescriptor.name,
            size = validationDescriptor.size,
            buttonId = this._getButtonId(item),
            extraButtonSpec = this._extraButtonSpecs[buttonId],
            validationBase = extraButtonSpec ? extraButtonSpec.validation : this._options.validation,

            valid = true;

        if (qq.isFileOrInput(item) && !this._isAllowedExtension(validationBase.allowedExtensions, name)) {
            this._itemError('typeError', name, item);
            valid = false;

        }
        else if (size === 0) {
            this._itemError('emptyError', name, item);
            valid = false;

        }
        else if (size && validationBase.sizeLimit && size > validationBase.sizeLimit) {
            this._itemError('sizeError', name, item);
            valid = false;

        }
        else if (size && size < validationBase.minSizeLimit) {
            this._itemError('minSizeError', name, item);
            valid = false;
        }

        if (!valid) {
            this._fileOrBlobRejected(undefined, name);
        }

        return valid;
    },

    _fileOrBlobRejected: function(id) {
        if (id !== undefined) {
            this._uploadData.setStatus(id, qq.status.REJECTED);
        }
    },

    /**
     * Constructs and returns a message that describes an item/file error.  Also calls `onError` callback.
     *
     * @param code REQUIRED - a code that corresponds to a stock message describing this type of error
     * @param maybeNameOrNames names of the items that have failed, if applicable
     * @param item `File`, `Blob`, or `<input type="file">`
     * @private
     */
    _itemError: function(code, maybeNameOrNames, item) {
        var message = this._options.messages[code],
            allowedExtensions = [],
            names = [].concat(maybeNameOrNames),
            name = names[0],
            buttonId = this._getButtonId(item),
            extraButtonSpec = this._extraButtonSpecs[buttonId],
            validationBase = extraButtonSpec ? extraButtonSpec.validation : this._options.validation,
            extensionsForMessage, placeholderMatch;

        function r(name, replacement){ message = message.replace(name, replacement); }

        qq.each(validationBase.allowedExtensions, function(idx, allowedExtension) {
                /**
                 * If an argument is not a string, ignore it.  Added when a possible issue with MooTools hijacking the
                 * `allowedExtensions` array was discovered.  See case #735 in the issue tracker for more details.
                 */
                if (qq.isString(allowedExtension)) {
                    allowedExtensions.push(allowedExtension);
                }
        });

        extensionsForMessage = allowedExtensions.join(', ').toLowerCase();

        r('{file}', this._options.formatFileName(name));
        r('{extensions}', extensionsForMessage);
        r('{sizeLimit}', this._formatSize(validationBase.sizeLimit));
        r('{minSizeLimit}', this._formatSize(validationBase.minSizeLimit));

        placeholderMatch = message.match(/(\{\w+\})/g);
        if (placeholderMatch !== null) {
            qq.each(placeholderMatch, function(idx, placeholder) {
                r(placeholder, names[idx]);
            });
        }

        this._options.callbacks.onError(null, name, message, undefined);

        return message;
    },

    _batchError: function(message) {
        this._options.callbacks.onError(null, null, message, undefined);
    },

    _isAllowedExtension: function(allowed, fileName) {
        var valid = false;

        if (!allowed.length) {
            return true;
        }

        qq.each(allowed, function(idx, allowedExt) {
            /**
             * If an argument is not a string, ignore it.  Added when a possible issue with MooTools hijacking the
             * `allowedExtensions` array was discovered.  See case #735 in the issue tracker for more details.
             */
            if (qq.isString(allowedExt)) {
                /*jshint eqeqeq: true, eqnull: true*/
                var extRegex = new RegExp('\\.' + allowedExt + "$", 'i');

                if (fileName.match(extRegex) != null) {
                    valid = true;
                    return false;
                }
            }
        });

        return valid;
    },

    _formatSize: function(bytes){
        var i = -1;
        do {
            bytes = bytes / 1000;
            i++;
        } while (bytes > 999);

        return Math.max(bytes, 0.1).toFixed(1) + this._options.text.sizeSymbols[i];
    },

    _wrapCallbacks: function() {
        var self, safeCallback;

        self = this;

        safeCallback = function(name, callback, args) {
            try {
                return callback.apply(self, args);
            }
            catch (exception) {
                self.log("Caught exception in '" + name + "' callback - " + exception.message, 'error');
            }
        };

        for (var prop in this._options.callbacks) {
            (function() {
                var callbackName, callbackFunc;
                callbackName = prop;
                callbackFunc = self._options.callbacks[callbackName];
                self._options.callbacks[callbackName] = function() {
                    return safeCallback(callbackName, callbackFunc, arguments);
                };
            }());
        }
    },

    _parseFileOrBlobDataName: function(fileOrBlobData) {
        var name;

        if (qq.isFileOrInput(fileOrBlobData)) {
            if (fileOrBlobData.value) {
                // it is a file input
                // get input value and remove path to normalize
                name = fileOrBlobData.value.replace(/.*(\/|\\)/, "");
            } else {
                // fix missing properties in Safari 4 and firefox 11.0a2
                name = (fileOrBlobData.fileName !== null && fileOrBlobData.fileName !== undefined) ? fileOrBlobData.fileName : fileOrBlobData.name;
            }
        }
        else {
            name = fileOrBlobData.name;
        }

        return name;
    },

    _parseFileOrBlobDataSize: function(fileOrBlobData) {
        var size;

        if (qq.isFileOrInput(fileOrBlobData)) {
            if (!fileOrBlobData.value){
                // fix missing properties in Safari 4 and firefox 11.0a2
                size = (fileOrBlobData.fileSize !== null && fileOrBlobData.fileSize !== undefined) ? fileOrBlobData.fileSize : fileOrBlobData.size;
            }
        }
        else {
            size = fileOrBlobData.blob.size;
        }

        return size;
    },

    _getValidationDescriptor: function(fileOrBlobData) {
        var fileDescriptor = {},
            name = this._parseFileOrBlobDataName(fileOrBlobData),
            size = this._parseFileOrBlobDataSize(fileOrBlobData);

        fileDescriptor.name = name;
        if (size !== undefined) {
            fileDescriptor.size = size;
        }

        return fileDescriptor;
    },

    _getValidationDescriptors: function(files) {
        var self = this,
            fileDescriptors = [];

        qq.each(files, function(idx, file) {
            fileDescriptors.push(self._getValidationDescriptor(file));
        });

        return fileDescriptors;
    },

    _createParamsStore: function(type) {
        var paramsStore = {},
            self = this;

        return {
            setParams: function(params, id) {
                var paramsCopy = {};
                qq.extend(paramsCopy, params);
                paramsStore[id] = paramsCopy;
            },

            getParams: function(id) {
                /*jshint eqeqeq: true, eqnull: true*/
                var paramsCopy = {};

                if (id != null && paramsStore[id]) {
                    qq.extend(paramsCopy, paramsStore[id]);
                }
                else {
                    qq.extend(paramsCopy, self._options[type].params);
                }

                return paramsCopy;
            },

            remove: function(fileId) {
                return delete paramsStore[fileId];
            },

            reset: function() {
                paramsStore = {};
            }
        };
    },

    _createEndpointStore: function(type) {
        var endpointStore = {},
        self = this;

        return {
            setEndpoint: function(endpoint, id) {
                endpointStore[id] = endpoint;
            },

            getEndpoint: function(id) {
                /*jshint eqeqeq: true, eqnull: true*/
                if (id != null && endpointStore[id]) {
                    return endpointStore[id];
                }

                return self._options[type].endpoint;
            },

            remove: function(fileId) {
                return delete endpointStore[fileId];
            },

            reset: function() {
                endpointStore = {};
            }
        };
    },

    // Allows camera access on either the default or an extra button for iOS devices.
    _handleCameraAccess: function() {
        if (this._options.camera.ios && qq.ios()) {
            var acceptIosCamera = "image/*;capture=camera",
                button = this._options.camera.button,
                buttonId = button ? this._getButtonId(button) : this._defaultButtonId,
                optionRoot = buttonId ? this._extraButtonSpecs[buttonId] : this._options;

            // Camera access won't work in iOS if the `multiple` attribute is present on the file input
            optionRoot.multiple = false;

            // update the options
            if (optionRoot.validation.acceptFiles === null) {
                optionRoot.validation.acceptFiles = acceptIosCamera;
            }
            else {
                optionRoot.validation.acceptFiles += "," + acceptIosCamera;
            }

            // update the already-created button
            qq.each(this._buttons, function(idx, button) {
                if (button.getButtonId() === buttonId) {
                    button.setMultiple(optionRoot.multiple);
                    button.setAcceptFiles(optionRoot.acceptFiles);

                    return false;
                }
            });
        }
    }
};
qq.FineUploaderBasic = function(o) {
    // These options define FineUploaderBasic mode.
    this._options = {
        debug: false,
        button: null,
        multiple: true,
        maxConnections: 3,
        disableCancelForFormUploads: false,
        autoUpload: true,
        request: {
            endpoint: '/server/upload',
            params: {},
            paramsInBody: true,
            customHeaders: {},
            forceMultipart: true,
            inputName: 'qqfile',
            uuidName: 'qquuid',
            totalFileSizeName: 'qqtotalfilesize',
            filenameParam: 'qqfilename'
        },
        validation: {
            allowedExtensions: [],
            sizeLimit: 0,
            minSizeLimit: 0,
            itemLimit: 0,
            stopOnFirstInvalidFile: true,
            acceptFiles: null
        },
        callbacks: {
            onSubmit: function(id, name){},
            onSubmitted: function(id, name){},
            onComplete: function(id, name, responseJSON, maybeXhr){},
            onCancel: function(id, name){},
            onUpload: function(id, name){},
            onUploadChunk: function(id, name, chunkData){},
            onResume: function(id, fileName, chunkData){},
            onProgress: function(id, name, loaded, total){},
            onError: function(id, name, reason, maybeXhrOrXdr) {},
            onAutoRetry: function(id, name, attemptNumber) {},
            onManualRetry: function(id, name) {},
            onValidateBatch: function(fileOrBlobData) {},
            onValidate: function(fileOrBlobData) {},
            onSubmitDelete: function(id) {},
            onDelete: function(id){},
            onDeleteComplete: function(id, xhrOrXdr, isError){},
            onPasteReceived: function(blob) {},
            onStatusChange: function(id, oldStatus, newStatus) {}
        },
        messages: {
            typeError: "{file} has an invalid extension. Valid extension(s): {extensions}.",
            sizeError: "{file} is too large, maximum file size is {sizeLimit}.",
            minSizeError: "{file} is too small, minimum file size is {minSizeLimit}.",
            emptyError: "{file} is empty, please select files again without it.",
            noFilesError: "No files to upload.",
            tooManyItemsError: "Too many items ({netItems}) would be uploaded.  Item limit is {itemLimit}.",
            retryFailTooManyItems: "Retry failed - you have reached your file limit.",
            onLeave: "The files are being uploaded, if you leave now the upload will be cancelled."
        },
        retry: {
            enableAuto: false,
            maxAutoAttempts: 3,
            autoAttemptDelay: 5,
            preventRetryResponseProperty: 'preventRetry'
        },
        classes: {
            buttonHover: 'qq-upload-button-hover',
            buttonFocus: 'qq-upload-button-focus'
        },
        chunking: {
            enabled: false,
            partSize: 2000000,
            paramNames: {
                partIndex: 'qqpartindex',
                partByteOffset: 'qqpartbyteoffset',
                chunkSize: 'qqchunksize',
                totalFileSize: 'qqtotalfilesize',
                totalParts: 'qqtotalparts'
            }
        },
        resume: {
            enabled: false,
            id: null,
            cookiesExpireIn: 7, //days
            paramNames: {
                resuming: "qqresume"
            }
        },
        formatFileName: function(fileOrBlobName) {
            if (fileOrBlobName !== undefined && fileOrBlobName.length > 33) {
                fileOrBlobName = fileOrBlobName.slice(0, 19) + '...' + fileOrBlobName.slice(-14);
            }
            return fileOrBlobName;
        },
        text: {
            defaultResponseError: "Upload failure reason unknown",
            sizeSymbols: ['kB', 'MB', 'GB', 'TB', 'PB', 'EB']
        },
        deleteFile : {
            enabled: false,
            method: "DELETE",
            endpoint: '/server/upload',
            customHeaders: {},
            params: {}
        },
        cors: {
            expected: false,
            sendCredentials: false,
            allowXdr: false
        },
        blobs: {
            defaultName: 'misc_data'
        },
        paste: {
            targetElement: null,
            defaultName: 'pasted_image'
        },
        camera: {
            ios: false,

            // if ios is true: button is null means target the default button, otherwise target the button specified
            button: null
        },

        // This refers to additional upload buttons to be handled by Fine Uploader.
        // Each element is an object, containing `element` as the only required
        // property.  The `element` must be a container that will ultimately
        // contain an invisible `<input type="file">` created by Fine Uploader.
        // Optional properties of each object include `multiple`, `validation`,
        // and `folders`.
        extraButtons: []
    };

    // Replace any default options with user defined ones
    qq.extend(this._options, o, true);

    this._buttons = [];
    this._extraButtonSpecs = {};
    this._buttonIdsForFileIds = [];

    this._wrapCallbacks();
    this._disposeSupport =  new qq.DisposeSupport();

    this._filesInProgress = [];
    this._storedIds = [];
    this._autoRetries = [];
    this._retryTimeouts = [];
    this._preventRetries = [];

    this._netUploadedOrQueued = 0;
    this._netUploaded = 0;
    this._uploadData = this._createUploadDataTracker();

    this._paramsStore = this._createParamsStore("request");
    this._deleteFileParamsStore = this._createParamsStore("deleteFile");

    this._endpointStore = this._createEndpointStore("request");
    this._deleteFileEndpointStore = this._createEndpointStore("deleteFile");

    this._handler = this._createUploadHandler();
    this._deleteHandler = this._createDeleteHandler();

    if (this._options.button) {
        this._defaultButtonId = this._createUploadButton({element: this._options.button}).getButtonId();
    }

    this._generateExtraButtonSpecs();

    this._handleCameraAccess();

    if (this._options.paste.targetElement) {
        this._pasteHandler = this._createPasteHandler();
    }

    this._preventLeaveInProgress();
};

// Define the private & public API methods.
qq.FineUploaderBasic.prototype = qq.basePublicApi;
qq.extend(qq.FineUploaderBasic.prototype, qq.basePrivateApi);
/**
 * Defines the public API for FineUploader mode.
 */
qq.uiPublicApi = {
    clearStoredFiles: function() {
        this._parent.prototype.clearStoredFiles.apply(this, arguments);
        this._listElement.innerHTML = "";
    },

    addExtraDropzone: function(element){
        this._dnd.setupExtraDropzone(element);
    },

    removeExtraDropzone: function(element){
        return this._dnd.removeDropzone(element);
    },

    getItemByFileId: function(id){
        var item = this._listElement.firstChild;

        // there can't be txt nodes in dynamically created list
        // and we can  use nextSibling
        while (item){
            if (item.qqFileId == id) return item;
            item = item.nextSibling;
        }
    },

    reset: function() {
        this._parent.prototype.reset.apply(this, arguments);
        this._element.innerHTML = this._options.template;
        this._listElement = this._options.listElement || this._find(this._element, 'list');

        if (!this._options.button) {
            this._defaultButtonId = this._createUploadButton({element: this._find(this._element, 'button')}).getButtonId();
        }

        this._dnd.dispose();
        this._dnd = this._setupDragAndDrop();

        this._totalFilesInBatch = 0;
        this._filesInBatchAddedToUi = 0;

        this._setupClickAndEditEventHandlers();
    }
};




/**
 * Defines the private (internal) API for FineUploader mode.
 */
qq.uiPrivateApi = {
    _getButton: function(buttonId) {
        var button = this._parent.prototype._getButton.apply(this, arguments);

        if (!button) {
            if (buttonId === this._defaultButtonId) {
                button = this._find(this._element, "button");
            }
        }

        return button;
    },

    _removeFileItem: function(fileId) {
        var item = this.getItemByFileId(fileId);
        qq(item).remove();
    },

    _setupClickAndEditEventHandlers: function() {
        this._deleteRetryOrCancelClickHandler = this._bindDeleteRetryOrCancelClickEvent();

        // A better approach would be to check specifically for focusin event support by querying the DOM API,
        // but the DOMFocusIn event is not exposed as a property, so we have to resort to UA string sniffing.
        this._focusinEventSupported = !qq.firefox();

        if (this._isEditFilenameEnabled()) {
            this._filenameClickHandler = this._bindFilenameClickEvent();
            this._filenameInputFocusInHandler = this._bindFilenameInputFocusInEvent();
            this._filenameInputFocusHandler = this._bindFilenameInputFocusEvent();
        }
    },

    _setupDragAndDrop: function() {
        var self = this,
            dropProcessingEl = this._find(this._element, 'dropProcessing'),
            dropZoneElements = this._options.dragAndDrop.extraDropzones,
            preventSelectFiles;

        preventSelectFiles = function(event) {
            event.preventDefault();
        };

        if (!this._options.dragAndDrop.disableDefaultDropzone) {
            dropZoneElements.push(this._find(this._options.element, 'drop'));
        }

        return new qq.DragAndDrop({
            dropZoneElements: dropZoneElements,
            hideDropZonesBeforeEnter: this._options.dragAndDrop.hideDropzones,
            allowMultipleItems: this._options.multiple,
            classes: {
                dropActive: this._options.classes.dropActive
            },
            callbacks: {
                processingDroppedFiles: function() {
                    qq(dropProcessingEl).css({display: 'block'});
                },
                processingDroppedFilesComplete: function(files) {
                    qq(dropProcessingEl).hide();

                    if (files) {
                        self.addFiles(files);
                    }
                },
                dropError: function(code, errorData) {
                    self._itemError(code, errorData);
                },
                dropLog: function(message, level) {
                    self.log(message, level);
                }
            }
        });
    },

    _bindDeleteRetryOrCancelClickEvent: function() {
        var self = this;

        return new qq.DeleteRetryOrCancelClickHandler({
            listElement: this._listElement,
            classes: this._classes,
            log: function(message, lvl) {
                self.log(message, lvl);
            },
            onDeleteFile: function(fileId) {
                self.deleteFile(fileId);
            },
            onCancel: function(fileId) {
                self.cancel(fileId);
            },
            onRetry: function(fileId) {
                var item = self.getItemByFileId(fileId);

                qq(item).removeClass(self._classes.retryable);
                self.retry(fileId);
            },
            onGetName: function(fileId) {
                return self.getName(fileId);
            }
        });
    },

    _isEditFilenameEnabled: function() {
        return this._options.editFilename.enabled && !this._options.autoUpload;
    },

    _filenameEditHandler: function() {
        var self = this;

        return {
            listElement: this._listElement,
            classes: this._classes,
            log: function(message, lvl) {
                self.log(message, lvl);
            },
            onGetUploadStatus: function(fileId) {
                return self.getUploads({id: fileId}).status;
            },
            onGetName: function(fileId) {
                return self.getName(fileId);
            },
            onSetName: function(fileId, newName) {
                var item = self.getItemByFileId(fileId),
                    qqFilenameDisplay = qq(self._find(item, 'file')),
                    formattedFilename = self._options.formatFileName(newName);

                qqFilenameDisplay.setText(formattedFilename);
                self.setName(fileId, newName);
            },
            onGetInput: function(item) {
                return self._find(item, 'editFilenameInput');
            },
            onEditingStatusChange: function(fileId, isEditing) {
                var item = self.getItemByFileId(fileId),
                    qqInput = qq(self._find(item, 'editFilenameInput')),
                    qqFilenameDisplay = qq(self._find(item, 'file')),
                    qqEditFilenameIcon = qq(self._find(item, 'editNameIcon')),
                    editableClass = self._classes.editable;

                if (isEditing) {
                    qqInput.addClass('qq-editing');

                    qqFilenameDisplay.hide();
                    qqEditFilenameIcon.removeClass(editableClass);
                }
                else {
                    qqInput.removeClass('qq-editing');
                    qqFilenameDisplay.css({display: ''});
                    qqEditFilenameIcon.addClass(editableClass);
                }

                // Force IE8 and older to repaint
                qq(item).addClass('qq-temp').removeClass('qq-temp');
            }
        };
    },

    _onUploadStatusChange: function(id, oldStatus, newStatus) {
        if (this._isEditFilenameEnabled()) {
            var item = this.getItemByFileId(id),
                editableClass = this._classes.editable,
                qqFilenameDisplay, qqEditFilenameIcon;

            // Status for a file exists before it has been added to the DOM, so we must be careful here.
            if (item && newStatus !== qq.status.SUBMITTED) {
                qqFilenameDisplay = qq(this._find(item, 'file'));
                qqEditFilenameIcon = qq(this._find(item, 'editNameIcon'));

                qqFilenameDisplay.removeClass(editableClass);
                qqEditFilenameIcon.removeClass(editableClass);
            }
        }
    },

    _bindFilenameInputFocusInEvent: function() {
        var spec = qq.extend({}, this._filenameEditHandler());

        return new qq.FilenameInputFocusInHandler(spec);
    },

    _bindFilenameInputFocusEvent: function() {
        var spec = qq.extend({}, this._filenameEditHandler());

        return new qq.FilenameInputFocusHandler(spec);
    },

    _bindFilenameClickEvent: function() {
        var spec = qq.extend({}, this._filenameEditHandler());

        return new qq.FilenameClickHandler(spec);
    },

    _leaving_document_out: function(e){
        return ((qq.chrome() || (qq.safari() && qq.windows())) && e.clientX == 0 && e.clientY == 0) // null coords for Chrome and Safari Windows
            || (qq.firefox() && !e.relatedTarget); // null e.relatedTarget for Firefox
    },

    _storeForLater: function(id) {
        this._parent.prototype._storeForLater.apply(this, arguments);
        var item = this.getItemByFileId(id);
        qq(this._find(item, 'spinner')).hide();
    },

    /**
     * Gets one of the elements listed in this._options.classes
     **/
    _find: function(parent, type) {
        var element = qq(parent).getByClass(this._options.classes[type])[0];
        if (!element){
            throw new Error('element not found ' + type);
        }

        return element;
    },

    _onSubmit: function(id, name) {
        this._parent.prototype._onSubmit.apply(this, arguments);
        this._addToList(id, name);
    },

    // The file item has been added to the DOM.
    _onSubmitted: function(id) {
        // If the edit filename feature is enabled, mark the filename element as "editable" and the associated edit icon
        if (this._isEditFilenameEnabled()) {
            var item = this.getItemByFileId(id),
                qqFilenameDisplay = qq(this._find(item, 'file')),
                qqEditFilenameIcon = qq(this._find(item, 'editNameIcon')),
                editableClass = this._classes.editable;

            qqFilenameDisplay.addClass(editableClass);
            qqEditFilenameIcon.addClass(editableClass);

            // If the focusin event is not supported, we must add a focus handler to the newly create edit filename text input
            if (!this._focusinEventSupported) {
                this._filenameInputFocusHandler.addHandler(this._find(item, 'editFilenameInput'));
            }
        }
    },

    // Update the progress bar & percentage as the file is uploaded
    _onProgress: function(id, name, loaded, total){
        this._parent.prototype._onProgress.apply(this, arguments);

        var item, progressBar, percent, cancelLink;

        item = this.getItemByFileId(id);
        progressBar = this._find(item, 'progressBar');
        percent = Math.round(loaded / total * 100);

        if (loaded === total) {
            cancelLink = this._find(item, 'cancel');
            qq(cancelLink).hide();

            qq(progressBar).hide();
            qq(this._find(item, 'statusText')).setText(this._options.text.waitingForResponse);

            // If last byte was sent, display total file size
            this._displayFileSize(id);
        }
        else {
            // If still uploading, display percentage - total size is actually the total request(s) size
            this._displayFileSize(id, loaded, total);

            qq(progressBar).css({display: 'block'});
        }

        // Update progress bar element
        qq(progressBar).css({width: percent + '%'});
    },

    _onComplete: function(id, name, result, xhr) {
        var parentRetVal = this._parent.prototype._onComplete.apply(this, arguments),
            self = this;

        function completeUpload(result) {
            var item = self.getItemByFileId(id);

            qq(self._find(item, 'statusText')).clearText();

            qq(item).removeClass(self._classes.retrying);
            qq(self._find(item, 'progressBar')).hide();

            if (!self._options.disableCancelForFormUploads || qq.supportedFeatures.ajaxUploading) {
                qq(self._find(item, 'cancel')).hide();
            }
            qq(self._find(item, 'spinner')).hide();

            if (result.success) {
                if (self._isDeletePossible()) {
                    self._showDeleteLink(id);
                }

                qq(item).addClass(self._classes.success);
                if (self._classes.successIcon) {
                    self._find(item, 'finished').style.display = "inline-block";
                    qq(item).addClass(self._classes.successIcon);
                }
            }
            else {
                qq(item).addClass(self._classes.fail);
                if (self._classes.failIcon) {
                    self._find(item, 'finished').style.display = "inline-block";
                    qq(item).addClass(self._classes.failIcon);
                }
                if (self._options.retry.showButton && !self._preventRetries[id]) {
                    qq(item).addClass(self._classes.retryable);
                }
                self._controlFailureTextDisplay(item, result);
            }
        }

        // The parent may need to perform some async operation before we can accurately determine the status of the upload.
        if (qq.isPromise(parentRetVal)) {
            parentRetVal.done(function(newResult) {
                completeUpload(newResult);
            });

        }
        else {
            completeUpload(result);
        }

        return parentRetVal;
    },

    _onUpload: function(id, name){
        var parentRetVal = this._parent.prototype._onUpload.apply(this, arguments);

        this._showSpinner(id);

        return parentRetVal;
    },

    _onCancel: function(id, name) {
        this._parent.prototype._onCancel.apply(this, arguments);
        this._removeFileItem(id);
    },

    _onBeforeAutoRetry: function(id) {
        var item, progressBar, failTextEl, retryNumForDisplay, maxAuto, retryNote;

        this._parent.prototype._onBeforeAutoRetry.apply(this, arguments);

        item = this.getItemByFileId(id);
        progressBar = this._find(item, 'progressBar');

        this._showCancelLink(item);
        progressBar.style.width = 0;
        qq(progressBar).hide();

        if (this._options.retry.showAutoRetryNote) {
            failTextEl = this._find(item, 'statusText');
            retryNumForDisplay = this._autoRetries[id] + 1;
            maxAuto = this._options.retry.maxAutoAttempts;

            retryNote = this._options.retry.autoRetryNote.replace(/\{retryNum\}/g, retryNumForDisplay);
            retryNote = retryNote.replace(/\{maxAuto\}/g, maxAuto);

            qq(failTextEl).setText(retryNote);
            if (retryNumForDisplay === 1) {
                qq(item).addClass(this._classes.retrying);
            }
        }
    },

    //return false if we should not attempt the requested retry
    _onBeforeManualRetry: function(id) {
        var item = this.getItemByFileId(id);

        if (this._parent.prototype._onBeforeManualRetry.apply(this, arguments)) {
            this._find(item, 'progressBar').style.width = 0;
            qq(item).removeClass(this._classes.fail);
            qq(this._find(item, 'statusText')).clearText();
            this._showSpinner(id);
            this._showCancelLink(item);
            return true;
        }
        else {
            qq(item).addClass(this._classes.retryable);
            return false;
        }
    },

    _onSubmitDelete: function(id) {
        var onSuccessCallback = qq.bind(this._onSubmitDeleteSuccess, this);

        this._parent.prototype._onSubmitDelete.call(this, id, onSuccessCallback);
    },

    _onSubmitDeleteSuccess: function(id, uuid, additionalMandatedParams) {
        if (this._options.deleteFile.forceConfirm) {
            this._showDeleteConfirm.apply(this, arguments);
        }
        else {
            this._sendDeleteRequest.apply(this, arguments);
        }
    },

    _onDeleteComplete: function(id, xhr, isError) {
        this._parent.prototype._onDeleteComplete.apply(this, arguments);

        var item = this.getItemByFileId(id),
            spinnerEl = this._find(item, 'spinner'),
            statusTextEl = this._find(item, 'statusText');

        qq(spinnerEl).hide();

        if (isError) {
            qq(statusTextEl).setText(this._options.deleteFile.deletingFailedText);
            this._showDeleteLink(id);
        }
        else {
            this._removeFileItem(id);
        }
    },

    _sendDeleteRequest: function(id, uuid, additionalMandatedParams) {
        var item = this.getItemByFileId(id),
            deleteLink = this._find(item, 'deleteButton'),
            statusTextEl = this._find(item, 'statusText');

        qq(deleteLink).hide();
        this._showSpinner(id);
        qq(statusTextEl).setText(this._options.deleteFile.deletingStatusText);
        this._deleteHandler.sendDelete.apply(this, arguments);
    },

    _showDeleteConfirm: function(id, uuid, mandatedParams) {
        var fileName = this._handler.getName(id),
            confirmMessage = this._options.deleteFile.confirmMessage.replace(/\{filename\}/g, fileName),
            uuid = this.getUuid(id),
            deleteRequestArgs = arguments,
            self = this,
            retVal;

        retVal = this._options.showConfirm(confirmMessage);

        if (qq.isPromise(retVal)) {
            retVal.then(function () {
                self._sendDeleteRequest.apply(self, deleteRequestArgs);
            });
        }
        else if (retVal !== false) {
            self._sendDeleteRequest.apply(self, deleteRequestArgs);
        }
    },

    _addToList: function(id, name){
        var item = qq.toElement(this._options.fileTemplate);
        if (this._options.disableCancelForFormUploads && !qq.supportedFeatures.ajaxUploading) {
            var cancelLink = this._find(item, 'cancel');
            qq(cancelLink).remove();
        }

        item.qqFileId = id;

        var fileElement = this._find(item, 'file');
        qq(fileElement).setText(this._options.formatFileName(name));
        qq(this._find(item, 'size')).hide();
        if (!this._options.multiple) {
            this._handler.cancelAll();
            this._clearList();
        }

        if (this._options.display.prependFiles) {
            this._prependItem(item);
        }
        else {
            this._listElement.appendChild(item);
        }
        this._filesInBatchAddedToUi += 1;

        if (this._options.display.fileSizeOnSubmit && qq.supportedFeatures.ajaxUploading) {
            this._displayFileSize(id);
        }
    },

    _prependItem: function(item) {
        var parentEl = this._listElement,
            beforeEl = parentEl.firstChild;

        if (this._totalFilesInBatch > 1 && this._filesInBatchAddedToUi > 0) {
            beforeEl = qq(parentEl).children()[this._filesInBatchAddedToUi - 1].nextSibling;

        }

        parentEl.insertBefore(item, beforeEl);
    },

    _clearList: function(){
        this._listElement.innerHTML = '';
        this.clearStoredFiles();
    },

    _displayFileSize: function(id, loadedSize, totalSize) {
        var item = this.getItemByFileId(id),
            size = this.getSize(id),
            sizeForDisplay = this._formatSize(size),
            sizeEl = this._find(item, 'size');

        if (loadedSize !== undefined && totalSize !== undefined) {
            sizeForDisplay = this._formatProgress(loadedSize, totalSize);
        }

        qq(sizeEl).css({display: 'inline'});
        qq(sizeEl).setText(sizeForDisplay);
    },

    _formatProgress: function (uploadedSize, totalSize) {
        var message = this._options.text.formatProgress;
        function r(name, replacement) { message = message.replace(name, replacement); }

        r('{percent}', Math.round(uploadedSize / totalSize * 100));
        r('{total_size}', this._formatSize(totalSize));
        return message;
    },

    _controlFailureTextDisplay: function(item, response) {
        var mode, maxChars, responseProperty, failureReason, shortFailureReason;

        mode = this._options.failedUploadTextDisplay.mode;
        maxChars = this._options.failedUploadTextDisplay.maxChars;
        responseProperty = this._options.failedUploadTextDisplay.responseProperty;

        if (mode === 'custom') {
            failureReason = response[responseProperty];
            if (failureReason) {
                if (failureReason.length > maxChars) {
                    shortFailureReason = failureReason.substring(0, maxChars) + '...';
                }
            }
            else {
                failureReason = this._options.text.failUpload;
                this.log("'" + responseProperty + "' is not a valid property on the server response.", 'warn');
            }

            qq(this._find(item, 'statusText')).setText(shortFailureReason || failureReason);

            if (this._options.failedUploadTextDisplay.enableTooltip) {
                this._showTooltip(item, failureReason);
            }
        }
        else if (mode === 'default') {
            qq(this._find(item, 'statusText')).setText(this._options.text.failUpload);
        }
        else if (mode !== 'none') {
            this.log("failedUploadTextDisplay.mode value of '" + mode + "' is not valid", 'warn');
        }
    },

    _showTooltip: function(item, text) {
        item.title = text;
    },

    _showSpinner: function(id) {
        var item = this.getItemByFileId(id),
            spinnerEl = this._find(item, 'spinner');

        spinnerEl.style.display = "inline-block";
    },

    _showCancelLink: function(item) {
        if (!this._options.disableCancelForFormUploads || qq.supportedFeatures.ajaxUploading) {
            var cancelLink = this._find(item, 'cancel');

            qq(cancelLink).css({display: 'inline'});
        }
    },

    _showDeleteLink: function(id) {
        var item = this.getItemByFileId(id),
            deleteLink = this._find(item, 'deleteButton');

        qq(deleteLink).css({display: 'inline'});
    },

    _itemError: function(code, name, item) {
        var message = this._parent.prototype._itemError.apply(this, arguments);
        this._options.showMessage(message);
    },

    _batchError: function(message) {
        this._parent.prototype._batchError.apply(this, arguments);
        this._options.showMessage(message);
    },

    _setupPastePrompt: function() {
        var self = this;

        this._options.callbacks.onPasteReceived = function() {
            var message = self._options.paste.namePromptMessage,
                defaultVal = self._options.paste.defaultName;

            return self._options.showPrompt(message, defaultVal);
        };
    },

    _fileOrBlobRejected: function(id, name) {
        this._totalFilesInBatch -= 1;
        this._parent.prototype._fileOrBlobRejected.apply(this, arguments);
    },

    _prepareItemsForUpload: function(items, params, endpoint) {
        this._totalFilesInBatch = items.length;
        this._filesInBatchAddedToUi = 0;
        this._parent.prototype._prepareItemsForUpload.apply(this, arguments);
    }
};
/**
 * This defines FineUploader mode, which is a default UI w/ drag & drop uploading.
 */
qq.FineUploader = function(o, namespace) {
    // By default this should inherit instance data from FineUploaderBasic, but this can be overridden
    // if the (internal) caller defines a different parent.  The parent is also used by
    // the private and public API functions that need to delegate to a parent function.
    this._parent = namespace ? qq[namespace].FineUploaderBasic : qq.FineUploaderBasic;
    this._parent.apply(this, arguments);

    // Options provided by FineUploader mode
    qq.extend(this._options, {
        element: null,
        listElement: null,
        dragAndDrop: {
            extraDropzones: [],
            hideDropzones: true,
            disableDefaultDropzone: false
        },
        text: {
            uploadButton: 'Upload a file',
            cancelButton: 'Cancel',
            retryButton: 'Retry',
            deleteButton: 'Delete',
            failUpload: 'Upload failed',
            dragZone: 'Drop files here to upload',
            dropProcessing: 'Processing dropped files...',
            formatProgress: "{percent}% of {total_size}",
            waitingForResponse: "Processing..."
        },
        template: '<div class="qq-uploader">' +
            ((!this._options.dragAndDrop || !this._options.dragAndDrop.disableDefaultDropzone) ? '<div class="qq-upload-drop-area"><span>{dragZoneText}</span></div>' : '') +
            (!this._options.button ? '<div class="qq-upload-button"><div>{uploadButtonText}</div></div>' : '') +
            '<span class="qq-drop-processing"><span>{dropProcessingText}</span><span class="qq-drop-processing-spinner"></span></span>' +
            (!this._options.listElement ? '<ul class="qq-upload-list"></ul>' : '') +
            '</div>',

        // template for one item in file list
        fileTemplate: '<li>' +
            '<div class="qq-progress-bar"></div>' +
            '<span class="qq-upload-spinner"></span>' +
            '<span class="qq-upload-finished"></span>' +
            (this._options.editFilename && this._options.editFilename.enabled ? '<span class="qq-edit-filename-icon"></span>' : '') +
            '<span class="qq-upload-file"></span>' +
            (this._options.editFilename && this._options.editFilename.enabled ? '<input class="qq-edit-filename" tabindex="0" type="text">' : '') +
            '<span class="qq-upload-size"></span>' +
            '<a class="qq-upload-cancel" href="#">{cancelButtonText}</a>' +
            '<a class="qq-upload-retry" href="#">{retryButtonText}</a>' +
            '<a class="qq-upload-delete" href="#">{deleteButtonText}</a>' +
            '<span class="qq-upload-status-text">{statusText}</span>' +
            '</li>',
        classes: {
            button: 'qq-upload-button',
            drop: 'qq-upload-drop-area',
            dropActive: 'qq-upload-drop-area-active',
            list: 'qq-upload-list',
            progressBar: 'qq-progress-bar',
            file: 'qq-upload-file',
            spinner: 'qq-upload-spinner',
            finished: 'qq-upload-finished',
            retrying: 'qq-upload-retrying',
            retryable: 'qq-upload-retryable',
            size: 'qq-upload-size',
            cancel: 'qq-upload-cancel',
            deleteButton: 'qq-upload-delete',
            retry: 'qq-upload-retry',
            statusText: 'qq-upload-status-text',
            editFilenameInput: 'qq-edit-filename',

            success: 'qq-upload-success',
            fail: 'qq-upload-fail',

            successIcon: null,
            failIcon: null,
            editNameIcon: 'qq-edit-filename-icon',
            editable: 'qq-editable',

            dropProcessing: 'qq-drop-processing',
            dropProcessingSpinner: 'qq-drop-processing-spinner'
        },
        failedUploadTextDisplay: {
            mode: 'default', //default, custom, or none
            maxChars: 50,
            responseProperty: 'error',
            enableTooltip: true
        },
        messages: {
            tooManyFilesError: "You may only drop one file",
            unsupportedBrowser: "Unrecoverable error - this browser does not permit file uploading of any kind."
        },
        retry: {
            showAutoRetryNote: true,
            autoRetryNote: "Retrying {retryNum}/{maxAuto}...",
            showButton: false
        },
        deleteFile: {
            forceConfirm: false,
            confirmMessage: "Are you sure you want to delete {filename}?",
            deletingStatusText: "Deleting...",
            deletingFailedText: "Delete failed"

        },
        display: {
            fileSizeOnSubmit: false,
            prependFiles: false
        },
        paste: {
            promptForName: false,
            namePromptMessage: "Please name this image"
        },
        editFilename: {
            enabled: false
        },
        showMessage: function(message){
            setTimeout(function() {
                window.alert(message);
            }, 0);
        },
        showConfirm: function(message) {
            return window.confirm(message);
        },
        showPrompt: function(message, defaultValue) {
            return window.prompt(message, defaultValue);
        }
    }, true);

    // Replace any default options with user defined ones
    qq.extend(this._options, o, true);

    if (!qq.supportedFeatures.uploading || (this._options.cors.expected && !qq.supportedFeatures.uploadCors)) {
        this._options.element.innerHTML = "<div>" + this._options.messages.unsupportedBrowser + "</div>"
    }
    else {
        this._wrapCallbacks();

        // overwrite the upload button text if any
        // same for the Cancel button and Fail message text
        this._options.template     = this._options.template.replace(/\{dragZoneText\}/g, this._options.text.dragZone);
        this._options.template     = this._options.template.replace(/\{uploadButtonText\}/g, this._options.text.uploadButton);
        this._options.template     = this._options.template.replace(/\{dropProcessingText\}/g, this._options.text.dropProcessing);
        this._options.fileTemplate = this._options.fileTemplate.replace(/\{cancelButtonText\}/g, this._options.text.cancelButton);
        this._options.fileTemplate = this._options.fileTemplate.replace(/\{retryButtonText\}/g, this._options.text.retryButton);
        this._options.fileTemplate = this._options.fileTemplate.replace(/\{deleteButtonText\}/g, this._options.text.deleteButton);
        this._options.fileTemplate = this._options.fileTemplate.replace(/\{statusText\}/g, "");

        this._element = this._options.element;
        this._element.innerHTML = this._options.template;
        this._listElement = this._options.listElement || this._find(this._element, 'list');

        this._classes = this._options.classes;

        if (!this._options.button) {
            this._defaultButtonId = this._createUploadButton({element: this._find(this._element, 'button')}).getButtonId();
        }

        this._setupClickAndEditEventHandlers();

        this._dnd = this._setupDragAndDrop();

        if (this._options.paste.targetElement && this._options.paste.promptForName) {
            this._setupPastePrompt();
        }

        this._totalFilesInBatch = 0;
        this._filesInBatchAddedToUi = 0;
    }
};

// Inherit the base public & private API methods
qq.extend(qq.FineUploader.prototype, qq.basePublicApi);
qq.extend(qq.FineUploader.prototype, qq.basePrivateApi);

// Add the FineUploader/default UI public & private UI methods, which may override some base methods.
qq.extend(qq.FineUploader.prototype, qq.uiPublicApi);
qq.extend(qq.FineUploader.prototype, qq.uiPrivateApi);
qq.UploadData = function(uploaderProxy) {
    var data = [],
        byId = {},
        byUuid = {},
        byStatus = {},
        api;

    function getDataByIds(ids) {
        if (qq.isArray(ids)) {
            var entries = [];

            qq.each(ids, function(idx, id) {
                entries.push(data[byId[id]]);
            });

            return entries;
        }

        return data[byId[ids]];
    }

    function getDataByUuids(uuids) {
        if (qq.isArray(uuids)) {
            var entries = [];

            qq.each(uuids, function(idx, uuid) {
                entries.push(data[byUuid[uuid]]);
            });

            return entries;
        }

        return data[byUuid[uuids]];
    }

    function getDataByStatus(status) {
        var statusResults = [],
            statuses = [].concat(status);

        qq.each(statuses, function(index, statusEnum) {
            var statusResultIndexes = byStatus[statusEnum];

            if (statusResultIndexes !== undefined) {
                qq.each(statusResultIndexes, function(i, dataIndex) {
                    statusResults.push(data[dataIndex]);
                });
            }
        });

        return statusResults;
    }

    api = {
        added: function(id) {
            var uuid = uploaderProxy.getUuid(id),
                name = uploaderProxy.getName(id),
                size = uploaderProxy.getSize(id),
                status = qq.status.SUBMITTING;

            var index = data.push({
                id: id,
                name: name,
                originalName: name,
                uuid: uuid,
                size: size,
                status: status
            }) - 1;

            byId[id] = index;

            byUuid[uuid] = index;

            if (byStatus[status] === undefined) {
                byStatus[status] = [];
            }
            byStatus[status].push(index);

            uploaderProxy.onStatusChange(id, undefined, status);
        },

        retrieve: function(optionalFilter) {
            if (qq.isObject(optionalFilter) && data.length)  {
                if (optionalFilter.id !== undefined) {
                    return getDataByIds(optionalFilter.id);
                }

                else if (optionalFilter.uuid !== undefined) {
                    return getDataByUuids(optionalFilter.uuid);
                }

                else if (optionalFilter.status) {
                    return getDataByStatus(optionalFilter.status);
                }
            }
            else {
                return qq.extend([], data, true);
            }
        },

        reset: function() {
            data = [];
            byId = {};
            byUuid = {};
            byStatus = {};
        },

        setStatus: function(id, newStatus) {
            var dataIndex = byId[id],
                oldStatus = data[dataIndex].status,
                byStatusOldStatusIndex = qq.indexOf(byStatus[oldStatus], dataIndex);

            byStatus[oldStatus].splice(byStatusOldStatusIndex, 1);

            data[dataIndex].status = newStatus;

            if (byStatus[newStatus] === undefined) {
                byStatus[newStatus] = [];
            }
            byStatus[newStatus].push(dataIndex);

            uploaderProxy.onStatusChange(id, oldStatus, newStatus);
        },

        uuidChanged: function(id, newUuid) {
            var dataIndex = byId[id],
                oldUuid = data[dataIndex].uuid;

            data[dataIndex].uuid = newUuid;
            byUuid[newUuid] = dataIndex;
            delete byUuid[oldUuid];
        },

        nameChanged: function(id, newName) {
            var dataIndex = byId[id];

            data[dataIndex].name = newName;
        }
    };

    return api;
};

qq.status = {
    SUBMITTING: "submitting",
    SUBMITTED: "submitted",
    REJECTED: "rejected",
    QUEUED: "queued",
    CANCELED: "canceled",
    UPLOADING: "uploading",
    UPLOAD_RETRYING: "retrying upload",
    UPLOAD_SUCCESSFUL: "upload successful",
    UPLOAD_FAILED: "upload failed",
    DELETE_FAILED: "delete failed",
    DELETING: "deleting",
    DELETED: "deleted"
};
/*globals qq*/
qq.Promise = function() {
    "use strict";

    var successArgs, failureArgs,
            successCallbacks = [],
            failureCallbacks = [],
            doneCallbacks = [],
            state = 0;

    return {
        then: function(onSuccess, onFailure) {
            if (state === 0) {
                if (onSuccess) {
                    successCallbacks.push(onSuccess);
                }
                if (onFailure) {
                    failureCallbacks.push(onFailure);
                }
            }
            else if (state === -1 && onFailure) {
                onFailure.apply(null, failureArgs);
            }
            else if (onSuccess) {
                onSuccess.apply(null, successArgs);
            }

            return this;
        },
        done: function(callback) {
            if (state === 0) {
                doneCallbacks.push(callback);
            }
            else {
                callback.apply(null, failureArgs === undefined ? successArgs : failureArgs);
            }

            return this;
        },
        success: function() {
            state = 1;
            successArgs = arguments;

            if (successCallbacks.length) {
                qq.each(successCallbacks, function(idx, callback) {
                    callback.apply(null, successArgs)
                })
            }

            if (doneCallbacks.length) {
                qq.each(doneCallbacks, function(idx, callback) {
                    callback.apply(null, successArgs)
                })
            }

            return this;
        },
        failure: function() {
            state = -1;
            failureArgs = arguments;

            if (failureCallbacks.length) {
                qq.each(failureCallbacks, function(idx, callback) {
                    callback.apply(null, failureArgs);
                })
            }

            if (doneCallbacks.length) {
                qq.each(doneCallbacks, function(idx, callback) {
                    callback.apply(null, failureArgs);
                })
            }

            return this;
        }
    };
};

qq.isPromise = function(maybePromise) {
    return maybePromise && maybePromise.then && maybePromise.done;
};
/**
 * Defines the public API for FineUploaderBasic mode.
 */
qq.basePublicApi = {
    log: function(str, level) {
        if (this._options.debug && (!level || level === 'info')) {
            qq.log('[FineUploader ' + qq.version + '] ' + str);
        }
        else if (level && level !== 'info') {
            qq.log('[FineUploader ' + qq.version + '] ' + str, level);

        }
    },

    setParams: function(params, id) {
        /*jshint eqeqeq: true, eqnull: true*/
        if (id == null) {
            this._options.request.params = params;
        }
        else {
            this._paramsStore.setParams(params, id);
        }
    },

    setDeleteFileParams: function(params, id) {
        /*jshint eqeqeq: true, eqnull: true*/
        if (id == null) {
            this._options.deleteFile.params = params;
        }
        else {
            this._deleteFileParamsStore.setParams(params, id);
        }
    },

    // Re-sets the default endpoint, an endpoint for a specific file, or an endpoint for a specific button
    setEndpoint: function(endpoint, id) {
        /*jshint eqeqeq: true, eqnull: true*/
        if (id == null) {
            this._options.request.endpoint = endpoint;
        }
        else {
            this._endpointStore.setEndpoint(endpoint, id);
        }
    },

    getInProgress: function() {
        return this._filesInProgress.length;
    },

    getNetUploads: function() {
        return this._netUploaded;
    },

    uploadStoredFiles: function() {
        var idToUpload;

        if (this._storedIds.length === 0) {
            this._itemError('noFilesError');
        }
        else {
            while (this._storedIds.length) {
                idToUpload = this._storedIds.shift();
                this._filesInProgress.push(idToUpload);
                this._handler.upload(idToUpload);
            }
        }
    },

    clearStoredFiles: function(){
        this._storedIds = [];
    },

    retry: function(id) {
        return this._manualRetry(id);
    },

    cancel: function(id) {
        this._handler.cancel(id);
    },

    cancelAll: function() {
        var storedIdsCopy = [],
            self = this;

        qq.extend(storedIdsCopy, this._storedIds);
        qq.each(storedIdsCopy, function(idx, storedFileId) {
            self.cancel(storedFileId);
        });

        this._handler.cancelAll();
    },

    reset: function() {
        this.log("Resetting uploader...");

        this._handler.reset();
        this._filesInProgress = [];
        this._storedIds = [];
        this._autoRetries = [];
        this._retryTimeouts = [];
        this._preventRetries = [];

        qq.each(this._buttons, function(idx, button) {
            button.reset();
        });

        this._paramsStore.reset();
        this._endpointStore.reset();
        this._netUploadedOrQueued = 0;
        this._netUploaded = 0;
        this._uploadData.reset();
        this._buttonIdsForFileIds = [];

        if (this._pasteHandler) {
            this._pasteHandler.reset();
        }
    },

    addFiles: function(filesOrInputs, params, endpoint) {
        var self = this,
            verifiedFilesOrInputs = [],
            fileOrInputIndex, fileOrInput, fileIndex;

        if (filesOrInputs) {
            if (!qq.isFileList(filesOrInputs)) {
                filesOrInputs = [].concat(filesOrInputs);
            }

            for (fileOrInputIndex = 0; fileOrInputIndex < filesOrInputs.length; fileOrInputIndex+=1) {
                fileOrInput = filesOrInputs[fileOrInputIndex];

                if (qq.isFileOrInput(fileOrInput)) {
                    if (qq.isInput(fileOrInput) && qq.supportedFeatures.ajaxUploading) {
                        for (fileIndex = 0; fileIndex < fileOrInput.files.length; fileIndex++) {
                            verifiedFilesOrInputs.push(fileOrInput.files[fileIndex]);
                        }
                    }
                    else {
                        verifiedFilesOrInputs.push(fileOrInput);
                    }
                }
                else {
                    self.log(fileOrInput + ' is not a File or INPUT element!  Ignoring!', 'warn');
                }
            }

            this.log('Received ' + verifiedFilesOrInputs.length + ' files or inputs.');
            this._prepareItemsForUpload(verifiedFilesOrInputs, params, endpoint);
        }
    },

    addBlobs: function(blobDataOrArray, params, endpoint) {
        if (blobDataOrArray) {
            var blobDataArray = [].concat(blobDataOrArray),
                verifiedBlobDataList = [],
                self = this;

            qq.each(blobDataArray, function(idx, blobData) {
                if (qq.isBlob(blobData) && !qq.isFileOrInput(blobData)) {
                    verifiedBlobDataList.push({
                        blob: blobData,
                        name: self._options.blobs.defaultName
                    });
                }
                else if (qq.isObject(blobData) && blobData.blob && blobData.name) {
                    verifiedBlobDataList.push(blobData);
                }
                else {
                    self.log("addBlobs: entry at index " + idx + " is not a Blob or a BlobData object", "error");
                }
            });

            this._prepareItemsForUpload(verifiedBlobDataList, params, endpoint);
        }
        else {
            this.log("undefined or non-array parameter passed into addBlobs", "error");
        }
    },

    getUuid: function(id) {
        return this._handler.getUuid(id);
    },

    setUuid: function(id, newUuid) {
        return this._handler.setUuid(id, newUuid);
    },

    getResumableFilesData: function() {
        return this._handler.getResumableFilesData();
    },

    getSize: function(id) {
        return this._handler.getSize(id);
    },

    getName: function(id) {
        return this._handler.getName(id);
    },

    setName: function(id, newName) {
        this._handler.setName(id, newName);
        this._uploadData.nameChanged(id, newName);
    },

    getFile: function(fileOrBlobId) {
        return this._handler.getFile(fileOrBlobId);
    },

    deleteFile: function(id) {
        this._onSubmitDelete(id);
    },

    setDeleteFileEndpoint: function(endpoint, id) {
        /*jshint eqeqeq: true, eqnull: true*/
        if (id == null) {
            this._options.deleteFile.endpoint = endpoint;
        }
        else {
            this._deleteFileEndpointStore.setEndpoint(endpoint, id);
        }
    },

    doesExist: function(fileOrBlobId) {
        return this._handler.isValid(fileOrBlobId);
    },

    getUploads: function(optionalFilter) {
        return this._uploadData.retrieve(optionalFilter);
    },

    getButton: function(fileId) {
        return this._getButton(this._buttonIdsForFileIds[fileId]);
    }
};




/**
 * Defines the private (internal) API for FineUploaderBasic mode.
 */
qq.basePrivateApi = {
    // Creates an internal object that tracks various properties of each extra button,
    // and then actually creates the extra button.
    _generateExtraButtonSpecs: function() {
        var self = this;

        this._extraButtonSpecs = {};

        qq.each(this._options.extraButtons, function(idx, extraButtonOptionEntry) {
            var multiple = extraButtonOptionEntry.multiple,
                validation = qq.extend({}, self._options.validation, true),
                extraButtonSpec = qq.extend({}, extraButtonOptionEntry);

            if (multiple === undefined) {
                multiple = self._options.multiple;
            }

            if (extraButtonSpec.validation) {
                qq.extend(validation, extraButtonOptionEntry.validation, true);
            }

            qq.extend(extraButtonSpec, {
                multiple: multiple,
                validation: validation
            }, true);

            self._initExtraButton(extraButtonSpec);
        });
    },

    // Creates an extra button element
    _initExtraButton: function(spec) {
        var button = this._createUploadButton({
            element: spec.element,
            multiple: spec.multiple,
            accept: spec.validation.acceptFiles,
            folders: spec.folders
        });

        this._extraButtonSpecs[button.getButtonId()] = spec;
    },

    /**
     * Gets the internally used tracking ID for a button.
     *
     * @param buttonOrFileInputOrFile `File`, `<input type="file">`, or a button container element
     * @returns {*} The button's ID, or undefined if no ID is recoverable
     * @private
     */
    _getButtonId: function(buttonOrFileInputOrFile) {
        var inputs, fileInput;

        // If the item is a `Blob` it will never be associated with a button or drop zone.
        if (buttonOrFileInputOrFile && !buttonOrFileInputOrFile.blob && !qq.isBlob(buttonOrFileInputOrFile)) {
            if (qq.isFile(buttonOrFileInputOrFile)) {
                return buttonOrFileInputOrFile.qqButtonId;
            }
            else if (buttonOrFileInputOrFile.tagName.toLowerCase() === "input" &&
                buttonOrFileInputOrFile.type.toLowerCase() === "file") {

                return buttonOrFileInputOrFile.getAttribute(qq.UploadButton.BUTTON_ID_ATTR_NAME);
            }

            inputs = buttonOrFileInputOrFile.getElementsByTagName("input");

            qq.each(inputs, function(idx, input) {
                if (input.getAttribute("type") === "file") {
                    fileInput = input;
                    return false;
                }
            });

            if (fileInput) {
                return fileInput.getAttribute(qq.UploadButton.BUTTON_ID_ATTR_NAME);
            }
        }
    },

    _annotateWithButtonId: function(file, associatedInput) {
        if (qq.isFile(file)) {
            file.qqButtonId = this._getButtonId(associatedInput);
        }
    },

    _getButton: function(buttonId) {
        var extraButtonsSpec = this._extraButtonSpecs[buttonId];

        if (extraButtonsSpec) {
            return extraButtonsSpec.element;
        }
        else if (buttonId === this._defaultButtonId) {
            return this._options.button;
        }
    },

    _handleCheckedCallback: function(details) {
        var self = this,
            callbackRetVal = details.callback();

        if (qq.isPromise(callbackRetVal)) {
            this.log(details.name + " - waiting for " + details.name + " promise to be fulfilled for " + details.identifier);
            return callbackRetVal.then(
                function(successParam) {
                    self.log(details.name + " promise success for " + details.identifier);
                    details.onSuccess(successParam);
                },
                function() {
                    if (details.onFailure) {
                        self.log(details.name + " promise failure for " + details.identifier);
                        details.onFailure();
                    }
                    else {
                        self.log(details.name + " promise failure for " + details.identifier);
                    }
                });
        }

        if (callbackRetVal !== false) {
            details.onSuccess(callbackRetVal);
        }
        else {
            if (details.onFailure) {
                this.log(details.name + " - return value was 'false' for " + details.identifier + ".  Invoking failure callback.")
                details.onFailure();
            }
            else {
                this.log(details.name + " - return value was 'false' for " + details.identifier + ".  Will not proceed.")
            }
        }

        return callbackRetVal;
    },

    /**
     * Generate a tracked upload button.
     *
     * @param spec Object containing a required `element` property
     * along with optional `multiple`, `accept`, and `folders`.
     * @returns {qq.UploadButton}
     * @private
     */
    _createUploadButton: function(spec) {
        var self = this,
            isMultiple = spec.multiple === undefined ? this._options.multiple : spec.multiple,
            acceptFiles = spec.accept || this._options.validation.acceptFiles;

        var button = new qq.UploadButton({
            element: spec.element,
            folders: spec.folders,
            name: this._options.request.inputName,
            multiple: isMultiple && qq.supportedFeatures.ajaxUploading,
            acceptFiles: acceptFiles,
            onChange: function(input) {
                self._onInputChange(input);
            },
            hoverClass: this._options.classes.buttonHover,
            focusClass: this._options.classes.buttonFocus
        });

        this._disposeSupport.addDisposer(function() {
            button.dispose();
        });

        self._buttons.push(button);

        return button;
    },

    _createUploadHandler: function(additionalOptions, namespace) {
        var self = this,
            options = {
                debug: this._options.debug,
                maxConnections: this._options.maxConnections,
                inputName: this._options.request.inputName,
                cors: this._options.cors,
                demoMode: this._options.demoMode,
                paramsStore: this._paramsStore,
                endpointStore: this._endpointStore,
                chunking: this._options.chunking,
                resume: this._options.resume,
                blobs: this._options.blobs,
                log: function(str, level) {
                    self.log(str, level);
                },
                onProgress: function(id, name, loaded, total){
                    self._onProgress(id, name, loaded, total);
                    self._options.callbacks.onProgress(id, name, loaded, total);
                },
                onComplete: function(id, name, result, xhr){
                    var retVal = self._onComplete(id, name, result, xhr);

                    // If the internal `_onComplete` handler returns a promise, don't invoke the `onComplete` callback
                    // until the promise has been fulfilled.
                    if (qq.isPromise(retVal)) {
                        retVal.done(function() {
                            self._options.callbacks.onComplete(id, name, result, xhr);
                        });
                    }
                    else {
                        self._options.callbacks.onComplete(id, name, result, xhr);
                    }
                },
                onCancel: function(id, name) {
                    return self._handleCheckedCallback({
                        name: "onCancel",
                        callback: qq.bind(self._options.callbacks.onCancel, self, id, name),
                        onSuccess: qq.bind(self._onCancel, self, id, name),
                        identifier: id
                    });
                },
                onUpload: function(id, name) {
                    self._onUpload(id, name);
                    self._options.callbacks.onUpload(id, name);
                },
                onUploadChunk: function(id, name, chunkData){
                    self._options.callbacks.onUploadChunk(id, name, chunkData);
                },
                onResume: function(id, name, chunkData) {
                    return self._options.callbacks.onResume(id, name, chunkData);
                },
                onAutoRetry: function(id, name, responseJSON, xhr) {
                    return self._onAutoRetry.apply(self, arguments);
                },
                onUuidChanged: function(id, newUuid) {
                    self._uploadData.uuidChanged(id, newUuid);
                }
            };

        qq.each(this._options.request, function(prop, val) {
            options[prop] = val;
        });

        if (additionalOptions) {
            qq.each(additionalOptions, function(key, val) {
                options[key] = val;
            });
        }

        return new qq.UploadHandler(options, namespace);
    },

    _createDeleteHandler: function() {
        var self = this;

        return new qq.DeleteFileAjaxRequestor({
            method: this._options.deleteFile.method,
            maxConnections: this._options.maxConnections,
            uuidParamName: this._options.request.uuidName,
            customHeaders: this._options.deleteFile.customHeaders,
            paramsStore: this._deleteFileParamsStore,
            endpointStore: this._deleteFileEndpointStore,
            demoMode: this._options.demoMode,
            cors: this._options.cors,
            log: function(str, level) {
                self.log(str, level);
            },
            onDelete: function(id) {
                self._onDelete(id);
                self._options.callbacks.onDelete(id);
            },
            onDeleteComplete: function(id, xhrOrXdr, isError) {
                self._onDeleteComplete(id, xhrOrXdr, isError);
                self._options.callbacks.onDeleteComplete(id, xhrOrXdr, isError);
            }

        });
    },

    _createPasteHandler: function() {
        var self = this;

        return new qq.PasteSupport({
            targetElement: this._options.paste.targetElement,
            callbacks: {
                log: function(str, level) {
                    self.log(str, level);
                },
                pasteReceived: function(blob) {
                    self._handleCheckedCallback({
                        name: "onPasteReceived",
                        callback: qq.bind(self._options.callbacks.onPasteReceived, self, blob),
                        onSuccess: qq.bind(self._handlePasteSuccess, self, blob),
                        identifier: "pasted image"
                    });
                }
            }
        });
    },

    _createUploadDataTracker: function() {
        var self = this;

        return new qq.UploadData({
            getName: function(id) {
                return self.getName(id);
            },
            getUuid: function(id) {
                return self.getUuid(id);
            },
            getSize: function(id) {
                return self.getSize(id);
            },
            onStatusChange: function(id, oldStatus, newStatus) {
                self._onUploadStatusChange(id, oldStatus, newStatus);
                self._options.callbacks.onStatusChange(id, oldStatus, newStatus);
            }
        });
    },

    _onUploadStatusChange: function(id, oldStatus, newStatus) {
        //nothing to do in the basic uploader
    },

    _handlePasteSuccess: function(blob, extSuppliedName) {
        var extension = blob.type.split("/")[1],
            name = extSuppliedName;

        /*jshint eqeqeq: true, eqnull: true*/
        if (name == null) {
            name = this._options.paste.defaultName;
        }

        name += '.' + extension;

        this.addBlobs({
            name: name,
            blob: blob
        });
    },

    _preventLeaveInProgress: function(){
        var self = this;

        this._disposeSupport.attach(window, 'beforeunload', function(e){
            if (!self._filesInProgress.length){return;}

            var e = e || window.event;
            // for ie, ff
            e.returnValue = self._options.messages.onLeave;
            // for webkit
            return self._options.messages.onLeave;
        });
    },

    _onSubmit: function(id, name) {
        this._netUploadedOrQueued++;

        if (this._options.autoUpload) {
            this._filesInProgress.push(id);
        }
    },

    _onProgress: function(id, name, loaded, total) {
        //nothing to do yet in core uploader
    },

    _onComplete: function(id, name, result, xhr) {
        if (!result.success) {
            this._netUploadedOrQueued--;
            this._uploadData.setStatus(id, qq.status.UPLOAD_FAILED);
        }
        else {
            this._netUploaded++;
            this._uploadData.setStatus(id, qq.status.UPLOAD_SUCCESSFUL);
        }

        this._removeFromFilesInProgress(id);
        this._maybeParseAndSendUploadError(id, name, result, xhr);

        return result.success ? true : false;
    },

    _onCancel: function(id, name) {
        this._netUploadedOrQueued--;

        this._removeFromFilesInProgress(id);

        clearTimeout(this._retryTimeouts[id]);

        var storedItemIndex = qq.indexOf(this._storedIds, id);
        if (!this._options.autoUpload && storedItemIndex >= 0) {
            this._storedIds.splice(storedItemIndex, 1);
        }

        this._uploadData.setStatus(id, qq.status.CANCELED);
    },

    _isDeletePossible: function() {
        if (!this._options.deleteFile.enabled) {
            return false;
        }

        if (this._options.cors.expected) {
            if (qq.supportedFeatures.deleteFileCorsXhr) {
                return true;
            }

            if (qq.supportedFeatures.deleteFileCorsXdr && this._options.cors.allowXdr) {
                return true;
            }

            return false;
        }

        return true;
    },

    _onSubmitDelete: function(id, onSuccessCallback, additionalMandatedParams) {
        var uuid = this.getUuid(id),
            adjustedOnSuccessCallback;

        if (onSuccessCallback) {
            adjustedOnSuccessCallback = qq.bind(onSuccessCallback, this, id, uuid, additionalMandatedParams);
        }

        if (this._isDeletePossible()) {
            return this._handleCheckedCallback({
                name: "onSubmitDelete",
                callback: qq.bind(this._options.callbacks.onSubmitDelete, this, id),
                onSuccess: adjustedOnSuccessCallback ||
                    qq.bind(this._deleteHandler.sendDelete, this, id, uuid, additionalMandatedParams),
                identifier: id
            });
        }
        else {
            this.log("Delete request ignored for ID " + id + ", delete feature is disabled or request not possible " +
                "due to CORS on a user agent that does not support pre-flighting.", "warn");
            return false;
        }
    },

    _onDelete: function(id) {
        this._uploadData.setStatus(id, qq.status.DELETING);
    },

    _onDeleteComplete: function(id, xhrOrXdr, isError) {
        var name = this._handler.getName(id);

        if (isError) {
            this._uploadData.setStatus(id, qq.status.DELETE_FAILED);
            this.log("Delete request for '" + name + "' has failed.", "error");

            // For error reporing, we only have accesss to the response status if this is not
            // an `XDomainRequest`.
            if (xhrOrXdr.withCredentials === undefined) {
                this._options.callbacks.onError(id, name, "Delete request failed", xhrOrXdr);
            }
            else {
                this._options.callbacks.onError(id, name, "Delete request failed with response code " + xhrOrXdr.status, xhrOrXdr);
            }
        }
        else {
            this._netUploadedOrQueued--;
            this._netUploaded--;
            this._handler.expunge(id);
            this._uploadData.setStatus(id, qq.status.DELETED);
            this.log("Delete request for '" + name + "' has succeeded.");
        }
    },

    _removeFromFilesInProgress: function(id) {
        var index = qq.indexOf(this._filesInProgress, id);
        if (index >= 0) {
            this._filesInProgress.splice(index, 1);
        }
    },

    _onUpload: function(id, name) {
        this._uploadData.setStatus(id, qq.status.UPLOADING);
    },

    _onInputChange: function(input) {
        var fileIndex;

        if (qq.supportedFeatures.ajaxUploading) {
            for (fileIndex = 0; fileIndex < input.files.length; fileIndex++) {
                this._annotateWithButtonId(input.files[fileIndex], input);
            }

            this.addFiles(input.files);
        }
        else {
            this.addFiles(input);
        }

        qq.each(this._buttons, function(idx, button) {
            button.reset();
        });
    },

    _onBeforeAutoRetry: function(id, name) {
        this.log("Waiting " + this._options.retry.autoAttemptDelay + " seconds before retrying " + name + "...");
    },

    /**
     * Attempt to automatically retry a failed upload.
     *
     * @param id The file ID of the failed upload
     * @param name The name of the file associated with the failed upload
     * @param responseJSON Response from the server, parsed into a javascript object
     * @param xhr Ajax transport used to send the failed request
     * @param callback Optional callback to be invoked if a retry is prudent.
     * Invoked in lieu of asking the upload handler to retry.
     * @returns {boolean} true if an auto-retry will occur
     * @private
     */
    _onAutoRetry: function(id, name, responseJSON, xhr, callback) {
        var self = this;

        self._preventRetries[id] = responseJSON[self._options.retry.preventRetryResponseProperty];

        if (self._shouldAutoRetry(id, name, responseJSON)) {
            self._maybeParseAndSendUploadError.apply(self, arguments);
            self._options.callbacks.onAutoRetry(id, name, self._autoRetries[id] + 1);
            self._onBeforeAutoRetry(id, name);

            self._retryTimeouts[id] = setTimeout(function() {
                self.log("Retrying " + name + "...");
                self._autoRetries[id]++;
                self._uploadData.setStatus(id, qq.status.UPLOAD_RETRYING);

                if (callback) {
                    callback(id);
                }
                else {
                    self._handler.retry(id);
                }
            }, self._options.retry.autoAttemptDelay * 1000);

            return true;
        }
    },

    _shouldAutoRetry: function(id, name, responseJSON) {
        if (!this._preventRetries[id] && this._options.retry.enableAuto) {
            if (this._autoRetries[id] === undefined) {
                this._autoRetries[id] = 0;
            }

            return this._autoRetries[id] < this._options.retry.maxAutoAttempts;
        }

        return false;
    },

    //return false if we should not attempt the requested retry
    _onBeforeManualRetry: function(id) {
        var itemLimit = this._options.validation.itemLimit;

        if (this._preventRetries[id]) {
            this.log("Retries are forbidden for id " + id, 'warn');
            return false;
        }
        else if (this._handler.isValid(id)) {
            var fileName = this._handler.getName(id);

            if (this._options.callbacks.onManualRetry(id, fileName) === false) {
                return false;
            }

            if (itemLimit > 0 && this._netUploadedOrQueued+1 > itemLimit) {
                this._itemError("retryFailTooManyItems");
                return false;
            }

            this.log("Retrying upload for '" + fileName + "' (id: " + id + ")...");
            this._filesInProgress.push(id);
            return true;
        }
        else {
            this.log("'" + id + "' is not a valid file ID", 'error');
            return false;
        }
    },

    /**
     * Conditionally orders a manual retry of a failed upload.
     *
     * @param id File ID of the failed upload
     * @param callback Optional callback to invoke if a retry is prudent.
     * In lieu of asking the upload handler to retry.
     * @returns {boolean} true if a manual retry will occur
     * @private
     */
    _manualRetry: function(id, callback) {
        if (this._onBeforeManualRetry(id)) {
            this._netUploadedOrQueued++;
            this._uploadData.setStatus(id, qq.status.UPLOAD_RETRYING);

            if (callback) {
                callback(id);
            }
            else {
                this._handler.retry(id);
            }

            return true;
        }
    },

    _maybeParseAndSendUploadError: function(id, name, response, xhr) {
        // Assuming no one will actually set the response code to something other than 200
        // and still set 'success' to true...
        if (!response.success){
            if (xhr && xhr.status !== 200 && !response.error) {
                this._options.callbacks.onError(id, name, "XHR returned response code " + xhr.status, xhr);
            }
            else {
                var errorReason = response.error ? response.error : this._options.text.defaultResponseError;
                this._options.callbacks.onError(id, name, errorReason, xhr);
            }
        }
    },

    _prepareItemsForUpload: function(items, params, endpoint) {
        var validationDescriptors = this._getValidationDescriptors(items),
            buttonId = this._getButtonId(items[0]),
            button = this._getButton(buttonId);

        this._handleCheckedCallback({
            name: "onValidateBatch",
            callback: qq.bind(this._options.callbacks.onValidateBatch, this, validationDescriptors, button),
            onSuccess: qq.bind(this._onValidateBatchCallbackSuccess, this, validationDescriptors, items, params, endpoint, button),
            identifier: "batch validation"
        });
    },

    _upload: function(blobOrFileContainer, params, endpoint) {
        var id = this._handler.add(blobOrFileContainer),
            name = this._handler.getName(id);

        this._uploadData.added(id);

        if (params) {
            this.setParams(params, id);
        }

        if (endpoint) {
            this.setEndpoint(endpoint, id);
        }

        this._handleCheckedCallback({
            name: "onSubmit",
            callback: qq.bind(this._options.callbacks.onSubmit, this, id, name),
            onSuccess: qq.bind(this._onSubmitCallbackSuccess, this, id, name),
            onFailure: qq.bind(this._fileOrBlobRejected, this, id, name),
            identifier: id
        });
    },

    _onSubmitCallbackSuccess: function(id, name) {
        var buttonId;

        this._uploadData.setStatus(id, qq.status.SUBMITTED);

        if (qq.supportedFeatures.ajaxUploading) {
            buttonId = this._handler.getFile(id).qqButtonId;
        }
        else {
            buttonId = this._getButtonId(this._handler.getInput(id));
        }

        if (buttonId) {
            this._buttonIdsForFileIds[id] = buttonId;
        }

        this._onSubmit.apply(this, arguments);
        this._onSubmitted.apply(this, arguments);
        this._options.callbacks.onSubmitted.apply(this, arguments);

        if (this._options.autoUpload) {
            if (!this._handler.upload(id)) {
                this._uploadData.setStatus(id, qq.status.QUEUED);
            }
        }
        else {
            this._storeForLater(id);
        }
    },

    _onSubmitted: function(id) {
        //nothing to do in the base uploader
    },

    _storeForLater: function(id) {
        this._storedIds.push(id);
    },

    _onValidateBatchCallbackSuccess: function(validationDescriptors, items, params, endpoint, button) {
        var errorMessage,
            itemLimit = this._options.validation.itemLimit,
            proposedNetFilesUploadedOrQueued = this._netUploadedOrQueued + validationDescriptors.length;

        if (itemLimit === 0 || proposedNetFilesUploadedOrQueued <= itemLimit) {
            if (items.length > 0) {
                this._handleCheckedCallback({
                    name: "onValidate",
                    callback: qq.bind(this._options.callbacks.onValidate, this, validationDescriptors[0], button),
                    onSuccess: qq.bind(this._onValidateCallbackSuccess, this, items, 0, params, endpoint),
                    onFailure: qq.bind(this._onValidateCallbackFailure, this, items, 0, params, endpoint),
                    identifier: "Item '" + items[0].name + "', size: " + items[0].size
                });
            }
            else {
                this._itemError("noFilesError");
            }
        }
        else {
            errorMessage = this._options.messages.tooManyItemsError
                .replace(/\{netItems\}/g, proposedNetFilesUploadedOrQueued)
                .replace(/\{itemLimit\}/g, itemLimit);
            this._batchError(errorMessage);
        }
    },

    _onValidateCallbackSuccess: function(items, index, params, endpoint) {
        var nextIndex = index+1,
            validationDescriptor = this._getValidationDescriptor(items[index]),
            validItem = false;

        if (this._validateFileOrBlobData(items[index], validationDescriptor)) {
            validItem = true;
            this._upload(items[index], params, endpoint);
        }

        this._maybeProcessNextItemAfterOnValidateCallback(validItem, items, nextIndex, params, endpoint);
    },

    _onValidateCallbackFailure: function(items, index, params, endpoint) {
        var nextIndex = index+ 1;

        this._fileOrBlobRejected(undefined, items[0].name);

        this._maybeProcessNextItemAfterOnValidateCallback(false, items, nextIndex, params, endpoint);
    },

    _maybeProcessNextItemAfterOnValidateCallback: function(validItem, items, index, params, endpoint) {
        var self = this;

        if (items.length > index) {
            if (validItem || !this._options.validation.stopOnFirstInvalidFile) {
                //use setTimeout to prevent a stack overflow with a large number of files in the batch & non-promissory callbacks
                setTimeout(function() {
                    var validationDescriptor = self._getValidationDescriptor(items[index]);

                    self._handleCheckedCallback({
                        name: "onValidate",
                        callback: qq.bind(self._options.callbacks.onValidate, self, items[index]),
                        onSuccess: qq.bind(self._onValidateCallbackSuccess, self, items, index, params, endpoint),
                        onFailure: qq.bind(self._onValidateCallbackFailure, self, items, index, params, endpoint),
                        identifier: "Item '" + validationDescriptor.name + "', size: " + validationDescriptor.size
                    });
                }, 0);
            }
        }
    },

    /**
     * Performs some internal validation checks on an item, defined in the `validation` option.
     *
     * @param item `File`, `Blob`, or `<input type="file">`
     * @param validationDescriptor Normalized information about the item (`size`, `name`).
     * @returns {boolean} true if the item is valid
     * @private
     */
    _validateFileOrBlobData: function(item, validationDescriptor) {
        var name = validationDescriptor.name,
            size = validationDescriptor.size,
            buttonId = this._getButtonId(item),
            extraButtonSpec = this._extraButtonSpecs[buttonId],
            validationBase = extraButtonSpec ? extraButtonSpec.validation : this._options.validation,

            valid = true;

        if (qq.isFileOrInput(item) && !this._isAllowedExtension(validationBase.allowedExtensions, name)) {
            this._itemError('typeError', name, item);
            valid = false;

        }
        else if (size === 0) {
            this._itemError('emptyError', name, item);
            valid = false;

        }
        else if (size && validationBase.sizeLimit && size > validationBase.sizeLimit) {
            this._itemError('sizeError', name, item);
            valid = false;

        }
        else if (size && size < validationBase.minSizeLimit) {
            this._itemError('minSizeError', name, item);
            valid = false;
        }

        if (!valid) {
            this._fileOrBlobRejected(undefined, name);
        }

        return valid;
    },

    _fileOrBlobRejected: function(id) {
        if (id !== undefined) {
            this._uploadData.setStatus(id, qq.status.REJECTED);
        }
    },

    /**
     * Constructs and returns a message that describes an item/file error.  Also calls `onError` callback.
     *
     * @param code REQUIRED - a code that corresponds to a stock message describing this type of error
     * @param maybeNameOrNames names of the items that have failed, if applicable
     * @param item `File`, `Blob`, or `<input type="file">`
     * @private
     */
    _itemError: function(code, maybeNameOrNames, item) {
        var message = this._options.messages[code],
            allowedExtensions = [],
            names = [].concat(maybeNameOrNames),
            name = names[0],
            buttonId = this._getButtonId(item),
            extraButtonSpec = this._extraButtonSpecs[buttonId],
            validationBase = extraButtonSpec ? extraButtonSpec.validation : this._options.validation,
            extensionsForMessage, placeholderMatch;

        function r(name, replacement){ message = message.replace(name, replacement); }

        qq.each(validationBase.allowedExtensions, function(idx, allowedExtension) {
                /**
                 * If an argument is not a string, ignore it.  Added when a possible issue with MooTools hijacking the
                 * `allowedExtensions` array was discovered.  See case #735 in the issue tracker for more details.
                 */
                if (qq.isString(allowedExtension)) {
                    allowedExtensions.push(allowedExtension);
                }
        });

        extensionsForMessage = allowedExtensions.join(', ').toLowerCase();

        r('{file}', this._options.formatFileName(name));
        r('{extensions}', extensionsForMessage);
        r('{sizeLimit}', this._formatSize(validationBase.sizeLimit));
        r('{minSizeLimit}', this._formatSize(validationBase.minSizeLimit));

        placeholderMatch = message.match(/(\{\w+\})/g);
        if (placeholderMatch !== null) {
            qq.each(placeholderMatch, function(idx, placeholder) {
                r(placeholder, names[idx]);
            });
        }

        this._options.callbacks.onError(null, name, message, undefined);

        return message;
    },

    _batchError: function(message) {
        this._options.callbacks.onError(null, null, message, undefined);
    },

    _isAllowedExtension: function(allowed, fileName) {
        var valid = false;

        if (!allowed.length) {
            return true;
        }

        qq.each(allowed, function(idx, allowedExt) {
            /**
             * If an argument is not a string, ignore it.  Added when a possible issue with MooTools hijacking the
             * `allowedExtensions` array was discovered.  See case #735 in the issue tracker for more details.
             */
            if (qq.isString(allowedExt)) {
                /*jshint eqeqeq: true, eqnull: true*/
                var extRegex = new RegExp('\\.' + allowedExt + "$", 'i');

                if (fileName.match(extRegex) != null) {
                    valid = true;
                    return false;
                }
            }
        });

        return valid;
    },

    _formatSize: function(bytes){
        var i = -1;
        do {
            bytes = bytes / 1000;
            i++;
        } while (bytes > 999);

        return Math.max(bytes, 0.1).toFixed(1) + this._options.text.sizeSymbols[i];
    },

    _wrapCallbacks: function() {
        var self, safeCallback;

        self = this;

        safeCallback = function(name, callback, args) {
            try {
                return callback.apply(self, args);
            }
            catch (exception) {
                self.log("Caught exception in '" + name + "' callback - " + exception.message, 'error');
            }
        };

        for (var prop in this._options.callbacks) {
            (function() {
                var callbackName, callbackFunc;
                callbackName = prop;
                callbackFunc = self._options.callbacks[callbackName];
                self._options.callbacks[callbackName] = function() {
                    return safeCallback(callbackName, callbackFunc, arguments);
                };
            }());
        }
    },

    _parseFileOrBlobDataName: function(fileOrBlobData) {
        var name;

        if (qq.isFileOrInput(fileOrBlobData)) {
            if (fileOrBlobData.value) {
                // it is a file input
                // get input value and remove path to normalize
                name = fileOrBlobData.value.replace(/.*(\/|\\)/, "");
            } else {
                // fix missing properties in Safari 4 and firefox 11.0a2
                name = (fileOrBlobData.fileName !== null && fileOrBlobData.fileName !== undefined) ? fileOrBlobData.fileName : fileOrBlobData.name;
            }
        }
        else {
            name = fileOrBlobData.name;
        }

        return name;
    },

    _parseFileOrBlobDataSize: function(fileOrBlobData) {
        var size;

        if (qq.isFileOrInput(fileOrBlobData)) {
            if (!fileOrBlobData.value){
                // fix missing properties in Safari 4 and firefox 11.0a2
                size = (fileOrBlobData.fileSize !== null && fileOrBlobData.fileSize !== undefined) ? fileOrBlobData.fileSize : fileOrBlobData.size;
            }
        }
        else {
            size = fileOrBlobData.blob.size;
        }

        return size;
    },

    _getValidationDescriptor: function(fileOrBlobData) {
        var fileDescriptor = {},
            name = this._parseFileOrBlobDataName(fileOrBlobData),
            size = this._parseFileOrBlobDataSize(fileOrBlobData);

        fileDescriptor.name = name;
        if (size !== undefined) {
            fileDescriptor.size = size;
        }

        return fileDescriptor;
    },

    _getValidationDescriptors: function(files) {
        var self = this,
            fileDescriptors = [];

        qq.each(files, function(idx, file) {
            fileDescriptors.push(self._getValidationDescriptor(file));
        });

        return fileDescriptors;
    },

    _createParamsStore: function(type) {
        var paramsStore = {},
            self = this;

        return {
            setParams: function(params, id) {
                var paramsCopy = {};
                qq.extend(paramsCopy, params);
                paramsStore[id] = paramsCopy;
            },

            getParams: function(id) {
                /*jshint eqeqeq: true, eqnull: true*/
                var paramsCopy = {};

                if (id != null && paramsStore[id]) {
                    qq.extend(paramsCopy, paramsStore[id]);
                }
                else {
                    qq.extend(paramsCopy, self._options[type].params);
                }

                return paramsCopy;
            },

            remove: function(fileId) {
                return delete paramsStore[fileId];
            },

            reset: function() {
                paramsStore = {};
            }
        };
    },

    _createEndpointStore: function(type) {
        var endpointStore = {},
        self = this;

        return {
            setEndpoint: function(endpoint, id) {
                endpointStore[id] = endpoint;
            },

            getEndpoint: function(id) {
                /*jshint eqeqeq: true, eqnull: true*/
                if (id != null && endpointStore[id]) {
                    return endpointStore[id];
                }

                return self._options[type].endpoint;
            },

            remove: function(fileId) {
                return delete endpointStore[fileId];
            },

            reset: function() {
                endpointStore = {};
            }
        };
    },

    // Allows camera access on either the default or an extra button for iOS devices.
    _handleCameraAccess: function() {
        if (this._options.camera.ios && qq.ios()) {
            var acceptIosCamera = "image/*;capture=camera",
                button = this._options.camera.button,
                buttonId = button ? this._getButtonId(button) : this._defaultButtonId,
                optionRoot = buttonId ? this._extraButtonSpecs[buttonId] : this._options;

            // Camera access won't work in iOS if the `multiple` attribute is present on the file input
            optionRoot.multiple = false;

            // update the options
            if (optionRoot.validation.acceptFiles === null) {
                optionRoot.validation.acceptFiles = acceptIosCamera;
            }
            else {
                optionRoot.validation.acceptFiles += "," + acceptIosCamera;
            }

            // update the already-created button
            qq.each(this._buttons, function(idx, button) {
                if (button.getButtonId() === buttonId) {
                    button.setMultiple(optionRoot.multiple);
                    button.setAcceptFiles(optionRoot.acceptFiles);

                    return false;
                }
            });
        }
    }
};
qq.FineUploaderBasic = function(o) {
    // These options define FineUploaderBasic mode.
    this._options = {
        debug: false,
        button: null,
        multiple: true,
        maxConnections: 3,
        disableCancelForFormUploads: false,
        autoUpload: true,
        request: {
            endpoint: '/server/upload',
            params: {},
            paramsInBody: true,
            customHeaders: {},
            forceMultipart: true,
            inputName: 'qqfile',
            uuidName: 'qquuid',
            totalFileSizeName: 'qqtotalfilesize',
            filenameParam: 'qqfilename'
        },
        validation: {
            allowedExtensions: [],
            sizeLimit: 0,
            minSizeLimit: 0,
            itemLimit: 0,
            stopOnFirstInvalidFile: true,
            acceptFiles: null
        },
        callbacks: {
            onSubmit: function(id, name){},
            onSubmitted: function(id, name){},
            onComplete: function(id, name, responseJSON, maybeXhr){},
            onCancel: function(id, name){},
            onUpload: function(id, name){},
            onUploadChunk: function(id, name, chunkData){},
            onResume: function(id, fileName, chunkData){},
            onProgress: function(id, name, loaded, total){},
            onError: function(id, name, reason, maybeXhrOrXdr) {},
            onAutoRetry: function(id, name, attemptNumber) {},
            onManualRetry: function(id, name) {},
            onValidateBatch: function(fileOrBlobData) {},
            onValidate: function(fileOrBlobData) {},
            onSubmitDelete: function(id) {},
            onDelete: function(id){},
            onDeleteComplete: function(id, xhrOrXdr, isError){},
            onPasteReceived: function(blob) {},
            onStatusChange: function(id, oldStatus, newStatus) {}
        },
        messages: {
            typeError: "{file} has an invalid extension. Valid extension(s): {extensions}.",
            sizeError: "{file} is too large, maximum file size is {sizeLimit}.",
            minSizeError: "{file} is too small, minimum file size is {minSizeLimit}.",
            emptyError: "{file} is empty, please select files again without it.",
            noFilesError: "No files to upload.",
            tooManyItemsError: "Too many items ({netItems}) would be uploaded.  Item limit is {itemLimit}.",
            retryFailTooManyItems: "Retry failed - you have reached your file limit.",
            onLeave: "The files are being uploaded, if you leave now the upload will be cancelled."
        },
        retry: {
            enableAuto: false,
            maxAutoAttempts: 3,
            autoAttemptDelay: 5,
            preventRetryResponseProperty: 'preventRetry'
        },
        classes: {
            buttonHover: 'qq-upload-button-hover',
            buttonFocus: 'qq-upload-button-focus'
        },
        chunking: {
            enabled: false,
            partSize: 2000000,
            paramNames: {
                partIndex: 'qqpartindex',
                partByteOffset: 'qqpartbyteoffset',
                chunkSize: 'qqchunksize',
                totalFileSize: 'qqtotalfilesize',
                totalParts: 'qqtotalparts'
            }
        },
        resume: {
            enabled: false,
            id: null,
            cookiesExpireIn: 7, //days
            paramNames: {
                resuming: "qqresume"
            }
        },
        formatFileName: function(fileOrBlobName) {
            if (fileOrBlobName !== undefined && fileOrBlobName.length > 33) {
                fileOrBlobName = fileOrBlobName.slice(0, 19) + '...' + fileOrBlobName.slice(-14);
            }
            return fileOrBlobName;
        },
        text: {
            defaultResponseError: "Upload failure reason unknown",
            sizeSymbols: ['kB', 'MB', 'GB', 'TB', 'PB', 'EB']
        },
        deleteFile : {
            enabled: false,
            method: "DELETE",
            endpoint: '/server/upload',
            customHeaders: {},
            params: {}
        },
        cors: {
            expected: false,
            sendCredentials: false,
            allowXdr: false
        },
        blobs: {
            defaultName: 'misc_data'
        },
        paste: {
            targetElement: null,
            defaultName: 'pasted_image'
        },
        camera: {
            ios: false,

            // if ios is true: button is null means target the default button, otherwise target the button specified
            button: null
        },

        // This refers to additional upload buttons to be handled by Fine Uploader.
        // Each element is an object, containing `element` as the only required
        // property.  The `element` must be a container that will ultimately
        // contain an invisible `<input type="file">` created by Fine Uploader.
        // Optional properties of each object include `multiple`, `validation`,
        // and `folders`.
        extraButtons: []
    };

    // Replace any default options with user defined ones
    qq.extend(this._options, o, true);

    this._buttons = [];
    this._extraButtonSpecs = {};
    this._buttonIdsForFileIds = [];

    this._wrapCallbacks();
    this._disposeSupport =  new qq.DisposeSupport();

    this._filesInProgress = [];
    this._storedIds = [];
    this._autoRetries = [];
    this._retryTimeouts = [];
    this._preventRetries = [];

    this._netUploadedOrQueued = 0;
    this._netUploaded = 0;
    this._uploadData = this._createUploadDataTracker();

    this._paramsStore = this._createParamsStore("request");
    this._deleteFileParamsStore = this._createParamsStore("deleteFile");

    this._endpointStore = this._createEndpointStore("request");
    this._deleteFileEndpointStore = this._createEndpointStore("deleteFile");

    this._handler = this._createUploadHandler();
    this._deleteHandler = this._createDeleteHandler();

    if (this._options.button) {
        this._defaultButtonId = this._createUploadButton({element: this._options.button}).getButtonId();
    }

    this._generateExtraButtonSpecs();

    this._handleCameraAccess();

    if (this._options.paste.targetElement) {
        this._pasteHandler = this._createPasteHandler();
    }

    this._preventLeaveInProgress();
};

// Define the private & public API methods.
qq.FineUploaderBasic.prototype = qq.basePublicApi;
qq.extend(qq.FineUploaderBasic.prototype, qq.basePrivateApi);
/**
 * Defines the public API for FineUploader mode.
 */
qq.uiPublicApi = {
    clearStoredFiles: function() {
        this._parent.prototype.clearStoredFiles.apply(this, arguments);
        this._listElement.innerHTML = "";
    },

    addExtraDropzone: function(element){
        this._dnd.setupExtraDropzone(element);
    },

    removeExtraDropzone: function(element){
        return this._dnd.removeDropzone(element);
    },

    getItemByFileId: function(id){
        var item = this._listElement.firstChild;

        // there can't be txt nodes in dynamically created list
        // and we can  use nextSibling
        while (item){
            if (item.qqFileId == id) return item;
            item = item.nextSibling;
        }
    },

    reset: function() {
        this._parent.prototype.reset.apply(this, arguments);
        this._element.innerHTML = this._options.template;
        this._listElement = this._options.listElement || this._find(this._element, 'list');

        if (!this._options.button) {
            this._defaultButtonId = this._createUploadButton({element: this._find(this._element, 'button')}).getButtonId();
        }

        this._dnd.dispose();
        this._dnd = this._setupDragAndDrop();

        this._totalFilesInBatch = 0;
        this._filesInBatchAddedToUi = 0;

        this._setupClickAndEditEventHandlers();
    }
};




/**
 * Defines the private (internal) API for FineUploader mode.
 */
qq.uiPrivateApi = {
    _getButton: function(buttonId) {
        var button = this._parent.prototype._getButton.apply(this, arguments);

        if (!button) {
            if (buttonId === this._defaultButtonId) {
                button = this._find(this._element, "button");
            }
        }

        return button;
    },

    _removeFileItem: function(fileId) {
        var item = this.getItemByFileId(fileId);
        qq(item).remove();
    },

    _setupClickAndEditEventHandlers: function() {
        this._deleteRetryOrCancelClickHandler = this._bindDeleteRetryOrCancelClickEvent();

        // A better approach would be to check specifically for focusin event support by querying the DOM API,
        // but the DOMFocusIn event is not exposed as a property, so we have to resort to UA string sniffing.
        this._focusinEventSupported = !qq.firefox();

        if (this._isEditFilenameEnabled()) {
            this._filenameClickHandler = this._bindFilenameClickEvent();
            this._filenameInputFocusInHandler = this._bindFilenameInputFocusInEvent();
            this._filenameInputFocusHandler = this._bindFilenameInputFocusEvent();
        }
    },

    _setupDragAndDrop: function() {
        var self = this,
            dropProcessingEl = this._find(this._element, 'dropProcessing'),
            dropZoneElements = this._options.dragAndDrop.extraDropzones,
            preventSelectFiles;

        preventSelectFiles = function(event) {
            event.preventDefault();
        };

        if (!this._options.dragAndDrop.disableDefaultDropzone) {
            dropZoneElements.push(this._find(this._options.element, 'drop'));
        }

        return new qq.DragAndDrop({
            dropZoneElements: dropZoneElements,
            hideDropZonesBeforeEnter: this._options.dragAndDrop.hideDropzones,
            allowMultipleItems: this._options.multiple,
            classes: {
                dropActive: this._options.classes.dropActive
            },
            callbacks: {
                processingDroppedFiles: function() {
                    qq(dropProcessingEl).css({display: 'block'});
                },
                processingDroppedFilesComplete: function(files) {
                    qq(dropProcessingEl).hide();

                    if (files) {
                        self.addFiles(files);
                    }
                },
                dropError: function(code, errorData) {
                    self._itemError(code, errorData);
                },
                dropLog: function(message, level) {
                    self.log(message, level);
                }
            }
        });
    },

    _bindDeleteRetryOrCancelClickEvent: function() {
        var self = this;

        return new qq.DeleteRetryOrCancelClickHandler({
            listElement: this._listElement,
            classes: this._classes,
            log: function(message, lvl) {
                self.log(message, lvl);
            },
            onDeleteFile: function(fileId) {
                self.deleteFile(fileId);
            },
            onCancel: function(fileId) {
                self.cancel(fileId);
            },
            onRetry: function(fileId) {
                var item = self.getItemByFileId(fileId);

                qq(item).removeClass(self._classes.retryable);
                self.retry(fileId);
            },
            onGetName: function(fileId) {
                return self.getName(fileId);
            }
        });
    },

    _isEditFilenameEnabled: function() {
        return this._options.editFilename.enabled && !this._options.autoUpload;
    },

    _filenameEditHandler: function() {
        var self = this;

        return {
            listElement: this._listElement,
            classes: this._classes,
            log: function(message, lvl) {
                self.log(message, lvl);
            },
            onGetUploadStatus: function(fileId) {
                return self.getUploads({id: fileId}).status;
            },
            onGetName: function(fileId) {
                return self.getName(fileId);
            },
            onSetName: function(fileId, newName) {
                var item = self.getItemByFileId(fileId),
                    qqFilenameDisplay = qq(self._find(item, 'file')),
                    formattedFilename = self._options.formatFileName(newName);

                qqFilenameDisplay.setText(formattedFilename);
                self.setName(fileId, newName);
            },
            onGetInput: function(item) {
                return self._find(item, 'editFilenameInput');
            },
            onEditingStatusChange: function(fileId, isEditing) {
                var item = self.getItemByFileId(fileId),
                    qqInput = qq(self._find(item, 'editFilenameInput')),
                    qqFilenameDisplay = qq(self._find(item, 'file')),
                    qqEditFilenameIcon = qq(self._find(item, 'editNameIcon')),
                    editableClass = self._classes.editable;

                if (isEditing) {
                    qqInput.addClass('qq-editing');

                    qqFilenameDisplay.hide();
                    qqEditFilenameIcon.removeClass(editableClass);
                }
                else {
                    qqInput.removeClass('qq-editing');
                    qqFilenameDisplay.css({display: ''});
                    qqEditFilenameIcon.addClass(editableClass);
                }

                // Force IE8 and older to repaint
                qq(item).addClass('qq-temp').removeClass('qq-temp');
            }
        };
    },

    _onUploadStatusChange: function(id, oldStatus, newStatus) {
        if (this._isEditFilenameEnabled()) {
            var item = this.getItemByFileId(id),
                editableClass = this._classes.editable,
                qqFilenameDisplay, qqEditFilenameIcon;

            // Status for a file exists before it has been added to the DOM, so we must be careful here.
            if (item && newStatus !== qq.status.SUBMITTED) {
                qqFilenameDisplay = qq(this._find(item, 'file'));
                qqEditFilenameIcon = qq(this._find(item, 'editNameIcon'));

                qqFilenameDisplay.removeClass(editableClass);
                qqEditFilenameIcon.removeClass(editableClass);
            }
        }
    },

    _bindFilenameInputFocusInEvent: function() {
        var spec = qq.extend({}, this._filenameEditHandler());

        return new qq.FilenameInputFocusInHandler(spec);
    },

    _bindFilenameInputFocusEvent: function() {
        var spec = qq.extend({}, this._filenameEditHandler());

        return new qq.FilenameInputFocusHandler(spec);
    },

    _bindFilenameClickEvent: function() {
        var spec = qq.extend({}, this._filenameEditHandler());

        return new qq.FilenameClickHandler(spec);
    },

    _leaving_document_out: function(e){
        return ((qq.chrome() || (qq.safari() && qq.windows())) && e.clientX == 0 && e.clientY == 0) // null coords for Chrome and Safari Windows
            || (qq.firefox() && !e.relatedTarget); // null e.relatedTarget for Firefox
    },

    _storeForLater: function(id) {
        this._parent.prototype._storeForLater.apply(this, arguments);
        var item = this.getItemByFileId(id);
        qq(this._find(item, 'spinner')).hide();
    },

    /**
     * Gets one of the elements listed in this._options.classes
     **/
    _find: function(parent, type) {
        var element = qq(parent).getByClass(this._options.classes[type])[0];
        if (!element){
            throw new Error('element not found ' + type);
        }

        return element;
    },

    _onSubmit: function(id, name) {
        this._parent.prototype._onSubmit.apply(this, arguments);
        this._addToList(id, name);
    },

    // The file item has been added to the DOM.
    _onSubmitted: function(id) {
        // If the edit filename feature is enabled, mark the filename element as "editable" and the associated edit icon
        if (this._isEditFilenameEnabled()) {
            var item = this.getItemByFileId(id),
                qqFilenameDisplay = qq(this._find(item, 'file')),
                qqEditFilenameIcon = qq(this._find(item, 'editNameIcon')),
                editableClass = this._classes.editable;

            qqFilenameDisplay.addClass(editableClass);
            qqEditFilenameIcon.addClass(editableClass);

            // If the focusin event is not supported, we must add a focus handler to the newly create edit filename text input
            if (!this._focusinEventSupported) {
                this._filenameInputFocusHandler.addHandler(this._find(item, 'editFilenameInput'));
            }
        }
    },

    // Update the progress bar & percentage as the file is uploaded
    _onProgress: function(id, name, loaded, total){
        this._parent.prototype._onProgress.apply(this, arguments);

        var item, progressBar, percent, cancelLink;

        item = this.getItemByFileId(id);
        progressBar = this._find(item, 'progressBar');
        percent = Math.round(loaded / total * 100);

        if (loaded === total) {
            cancelLink = this._find(item, 'cancel');
            qq(cancelLink).hide();

            qq(progressBar).hide();
            qq(this._find(item, 'statusText')).setText(this._options.text.waitingForResponse);

            // If last byte was sent, display total file size
            this._displayFileSize(id);
        }
        else {
            // If still uploading, display percentage - total size is actually the total request(s) size
            this._displayFileSize(id, loaded, total);

            qq(progressBar).css({display: 'block'});
        }

        // Update progress bar element
        qq(progressBar).css({width: percent + '%'});
    },

    _onComplete: function(id, name, result, xhr) {
        var parentRetVal = this._parent.prototype._onComplete.apply(this, arguments),
            self = this;

        function completeUpload(result) {
            var item = self.getItemByFileId(id);

            qq(self._find(item, 'statusText')).clearText();

            qq(item).removeClass(self._classes.retrying);
            qq(self._find(item, 'progressBar')).hide();

            if (!self._options.disableCancelForFormUploads || qq.supportedFeatures.ajaxUploading) {
                qq(self._find(item, 'cancel')).hide();
            }
            qq(self._find(item, 'spinner')).hide();

            if (result.success) {
                if (self._isDeletePossible()) {
                    self._showDeleteLink(id);
                }

                qq(item).addClass(self._classes.success);
                if (self._classes.successIcon) {
                    self._find(item, 'finished').style.display = "inline-block";
                    qq(item).addClass(self._classes.successIcon);
                }
            }
            else {
                qq(item).addClass(self._classes.fail);
                if (self._classes.failIcon) {
                    self._find(item, 'finished').style.display = "inline-block";
                    qq(item).addClass(self._classes.failIcon);
                }
                if (self._options.retry.showButton && !self._preventRetries[id]) {
                    qq(item).addClass(self._classes.retryable);
                }
                self._controlFailureTextDisplay(item, result);
            }
        }

        // The parent may need to perform some async operation before we can accurately determine the status of the upload.
        if (qq.isPromise(parentRetVal)) {
            parentRetVal.done(function(newResult) {
                completeUpload(newResult);
            });

        }
        else {
            completeUpload(result);
        }

        return parentRetVal;
    },

    _onUpload: function(id, name){
        var parentRetVal = this._parent.prototype._onUpload.apply(this, arguments);

        this._showSpinner(id);

        return parentRetVal;
    },

    _onCancel: function(id, name) {
        this._parent.prototype._onCancel.apply(this, arguments);
        this._removeFileItem(id);
    },

    _onBeforeAutoRetry: function(id) {
        var item, progressBar, failTextEl, retryNumForDisplay, maxAuto, retryNote;

        this._parent.prototype._onBeforeAutoRetry.apply(this, arguments);

        item = this.getItemByFileId(id);
        progressBar = this._find(item, 'progressBar');

        this._showCancelLink(item);
        progressBar.style.width = 0;
        qq(progressBar).hide();

        if (this._options.retry.showAutoRetryNote) {
            failTextEl = this._find(item, 'statusText');
            retryNumForDisplay = this._autoRetries[id] + 1;
            maxAuto = this._options.retry.maxAutoAttempts;

            retryNote = this._options.retry.autoRetryNote.replace(/\{retryNum\}/g, retryNumForDisplay);
            retryNote = retryNote.replace(/\{maxAuto\}/g, maxAuto);

            qq(failTextEl).setText(retryNote);
            if (retryNumForDisplay === 1) {
                qq(item).addClass(this._classes.retrying);
            }
        }
    },

    //return false if we should not attempt the requested retry
    _onBeforeManualRetry: function(id) {
        var item = this.getItemByFileId(id);

        if (this._parent.prototype._onBeforeManualRetry.apply(this, arguments)) {
            this._find(item, 'progressBar').style.width = 0;
            qq(item).removeClass(this._classes.fail);
            qq(this._find(item, 'statusText')).clearText();
            this._showSpinner(id);
            this._showCancelLink(item);
            return true;
        }
        else {
            qq(item).addClass(this._classes.retryable);
            return false;
        }
    },

    _onSubmitDelete: function(id) {
        var onSuccessCallback = qq.bind(this._onSubmitDeleteSuccess, this);

        this._parent.prototype._onSubmitDelete.call(this, id, onSuccessCallback);
    },

    _onSubmitDeleteSuccess: function(id, uuid, additionalMandatedParams) {
        if (this._options.deleteFile.forceConfirm) {
            this._showDeleteConfirm.apply(this, arguments);
        }
        else {
            this._sendDeleteRequest.apply(this, arguments);
        }
    },

    _onDeleteComplete: function(id, xhr, isError) {
        this._parent.prototype._onDeleteComplete.apply(this, arguments);

        var item = this.getItemByFileId(id),
            spinnerEl = this._find(item, 'spinner'),
            statusTextEl = this._find(item, 'statusText');

        qq(spinnerEl).hide();

        if (isError) {
            qq(statusTextEl).setText(this._options.deleteFile.deletingFailedText);
            this._showDeleteLink(id);
        }
        else {
            this._removeFileItem(id);
        }
    },

    _sendDeleteRequest: function(id, uuid, additionalMandatedParams) {
        var item = this.getItemByFileId(id),
            deleteLink = this._find(item, 'deleteButton'),
            statusTextEl = this._find(item, 'statusText');

        qq(deleteLink).hide();
        this._showSpinner(id);
        qq(statusTextEl).setText(this._options.deleteFile.deletingStatusText);
        this._deleteHandler.sendDelete.apply(this, arguments);
    },

    _showDeleteConfirm: function(id, uuid, mandatedParams) {
        var fileName = this._handler.getName(id),
            confirmMessage = this._options.deleteFile.confirmMessage.replace(/\{filename\}/g, fileName),
            uuid = this.getUuid(id),
            deleteRequestArgs = arguments,
            self = this,
            retVal;

        retVal = this._options.showConfirm(confirmMessage);

        if (qq.isPromise(retVal)) {
            retVal.then(function () {
                self._sendDeleteRequest.apply(self, deleteRequestArgs);
            });
        }
        else if (retVal !== false) {
            self._sendDeleteRequest.apply(self, deleteRequestArgs);
        }
    },

    _addToList: function(id, name){
        var item = qq.toElement(this._options.fileTemplate);
        if (this._options.disableCancelForFormUploads && !qq.supportedFeatures.ajaxUploading) {
            var cancelLink = this._find(item, 'cancel');
            qq(cancelLink).remove();
        }

        item.qqFileId = id;

        var fileElement = this._find(item, 'file');
        qq(fileElement).setText(this._options.formatFileName(name));
        qq(this._find(item, 'size')).hide();
        if (!this._options.multiple) {
            this._handler.cancelAll();
            this._clearList();
        }

        if (this._options.display.prependFiles) {
            this._prependItem(item);
        }
        else {
            this._listElement.appendChild(item);
        }
        this._filesInBatchAddedToUi += 1;

        if (this._options.display.fileSizeOnSubmit && qq.supportedFeatures.ajaxUploading) {
            this._displayFileSize(id);
        }
    },

    _prependItem: function(item) {
        var parentEl = this._listElement,
            beforeEl = parentEl.firstChild;

        if (this._totalFilesInBatch > 1 && this._filesInBatchAddedToUi > 0) {
            beforeEl = qq(parentEl).children()[this._filesInBatchAddedToUi - 1].nextSibling;

        }

        parentEl.insertBefore(item, beforeEl);
    },

    _clearList: function(){
        this._listElement.innerHTML = '';
        this.clearStoredFiles();
    },

    _displayFileSize: function(id, loadedSize, totalSize) {
        var item = this.getItemByFileId(id),
            size = this.getSize(id),
            sizeForDisplay = this._formatSize(size),
            sizeEl = this._find(item, 'size');

        if (loadedSize !== undefined && totalSize !== undefined) {
            sizeForDisplay = this._formatProgress(loadedSize, totalSize);
        }

        qq(sizeEl).css({display: 'inline'});
        qq(sizeEl).setText(sizeForDisplay);
    },

    _formatProgress: function (uploadedSize, totalSize) {
        var message = this._options.text.formatProgress;
        function r(name, replacement) { message = message.replace(name, replacement); }

        r('{percent}', Math.round(uploadedSize / totalSize * 100));
        r('{total_size}', this._formatSize(totalSize));
        return message;
    },

    _controlFailureTextDisplay: function(item, response) {
        var mode, maxChars, responseProperty, failureReason, shortFailureReason;

        mode = this._options.failedUploadTextDisplay.mode;
        maxChars = this._options.failedUploadTextDisplay.maxChars;
        responseProperty = this._options.failedUploadTextDisplay.responseProperty;

        if (mode === 'custom') {
            failureReason = response[responseProperty];
            if (failureReason) {
                if (failureReason.length > maxChars) {
                    shortFailureReason = failureReason.substring(0, maxChars) + '...';
                }
            }
            else {
                failureReason = this._options.text.failUpload;
                this.log("'" + responseProperty + "' is not a valid property on the server response.", 'warn');
            }

            qq(this._find(item, 'statusText')).setText(shortFailureReason || failureReason);

            if (this._options.failedUploadTextDisplay.enableTooltip) {
                this._showTooltip(item, failureReason);
            }
        }
        else if (mode === 'default') {
            qq(this._find(item, 'statusText')).setText(this._options.text.failUpload);
        }
        else if (mode !== 'none') {
            this.log("failedUploadTextDisplay.mode value of '" + mode + "' is not valid", 'warn');
        }
    },

    _showTooltip: function(item, text) {
        item.title = text;
    },

    _showSpinner: function(id) {
        var item = this.getItemByFileId(id),
            spinnerEl = this._find(item, 'spinner');

        spinnerEl.style.display = "inline-block";
    },

    _showCancelLink: function(item) {
        if (!this._options.disableCancelForFormUploads || qq.supportedFeatures.ajaxUploading) {
            var cancelLink = this._find(item, 'cancel');

            qq(cancelLink).css({display: 'inline'});
        }
    },

    _showDeleteLink: function(id) {
        var item = this.getItemByFileId(id),
            deleteLink = this._find(item, 'deleteButton');

        qq(deleteLink).css({display: 'inline'});
    },

    _itemError: function(code, name, item) {
        var message = this._parent.prototype._itemError.apply(this, arguments);
        this._options.showMessage(message);
    },

    _batchError: function(message) {
        this._parent.prototype._batchError.apply(this, arguments);
        this._options.showMessage(message);
    },

    _setupPastePrompt: function() {
        var self = this;

        this._options.callbacks.onPasteReceived = function() {
            var message = self._options.paste.namePromptMessage,
                defaultVal = self._options.paste.defaultName;

            return self._options.showPrompt(message, defaultVal);
        };
    },

    _fileOrBlobRejected: function(id, name) {
        this._totalFilesInBatch -= 1;
        this._parent.prototype._fileOrBlobRejected.apply(this, arguments);
    },

    _prepareItemsForUpload: function(items, params, endpoint) {
        this._totalFilesInBatch = items.length;
        this._filesInBatchAddedToUi = 0;
        this._parent.prototype._prepareItemsForUpload.apply(this, arguments);
    }
};
/**
 * This defines FineUploader mode, which is a default UI w/ drag & drop uploading.
 */
qq.FineUploader = function(o, namespace) {
    // By default this should inherit instance data from FineUploaderBasic, but this can be overridden
    // if the (internal) caller defines a different parent.  The parent is also used by
    // the private and public API functions that need to delegate to a parent function.
    this._parent = namespace ? qq[namespace].FineUploaderBasic : qq.FineUploaderBasic;
    this._parent.apply(this, arguments);

    // Options provided by FineUploader mode
    qq.extend(this._options, {
        element: null,
        listElement: null,
        dragAndDrop: {
            extraDropzones: [],
            hideDropzones: true,
            disableDefaultDropzone: false
        },
        text: {
            uploadButton: 'Upload a file',
            cancelButton: 'Cancel',
            retryButton: 'Retry',
            deleteButton: 'Delete',
            failUpload: 'Upload failed',
            dragZone: 'Drop files here to upload',
            dropProcessing: 'Processing dropped files...',
            formatProgress: "{percent}% of {total_size}",
            waitingForResponse: "Processing..."
        },
        template: '<div class="qq-uploader">' +
            ((!this._options.dragAndDrop || !this._options.dragAndDrop.disableDefaultDropzone) ? '<div class="qq-upload-drop-area"><span>{dragZoneText}</span></div>' : '') +
            (!this._options.button ? '<div class="qq-upload-button"><div>{uploadButtonText}</div></div>' : '') +
            '<span class="qq-drop-processing"><span>{dropProcessingText}</span><span class="qq-drop-processing-spinner"></span></span>' +
            (!this._options.listElement ? '<ul class="qq-upload-list"></ul>' : '') +
            '</div>',

        // template for one item in file list
        fileTemplate: '<li>' +
            '<div class="qq-progress-bar"></div>' +
            '<span class="qq-upload-spinner"></span>' +
            '<span class="qq-upload-finished"></span>' +
            (this._options.editFilename && this._options.editFilename.enabled ? '<span class="qq-edit-filename-icon"></span>' : '') +
            '<span class="qq-upload-file"></span>' +
            (this._options.editFilename && this._options.editFilename.enabled ? '<input class="qq-edit-filename" tabindex="0" type="text">' : '') +
            '<span class="qq-upload-size"></span>' +
            '<a class="qq-upload-cancel" href="#">{cancelButtonText}</a>' +
            '<a class="qq-upload-retry" href="#">{retryButtonText}</a>' +
            '<a class="qq-upload-delete" href="#">{deleteButtonText}</a>' +
            '<span class="qq-upload-status-text">{statusText}</span>' +
            '</li>',
        classes: {
            button: 'qq-upload-button',
            drop: 'qq-upload-drop-area',
            dropActive: 'qq-upload-drop-area-active',
            list: 'qq-upload-list',
            progressBar: 'qq-progress-bar',
            file: 'qq-upload-file',
            spinner: 'qq-upload-spinner',
            finished: 'qq-upload-finished',
            retrying: 'qq-upload-retrying',
            retryable: 'qq-upload-retryable',
            size: 'qq-upload-size',
            cancel: 'qq-upload-cancel',
            deleteButton: 'qq-upload-delete',
            retry: 'qq-upload-retry',
            statusText: 'qq-upload-status-text',
            editFilenameInput: 'qq-edit-filename',

            success: 'qq-upload-success',
            fail: 'qq-upload-fail',

            successIcon: null,
            failIcon: null,
            editNameIcon: 'qq-edit-filename-icon',
            editable: 'qq-editable',

            dropProcessing: 'qq-drop-processing',
            dropProcessingSpinner: 'qq-drop-processing-spinner'
        },
        failedUploadTextDisplay: {
            mode: 'default', //default, custom, or none
            maxChars: 50,
            responseProperty: 'error',
            enableTooltip: true
        },
        messages: {
            tooManyFilesError: "You may only drop one file",
            unsupportedBrowser: "Unrecoverable error - this browser does not permit file uploading of any kind."
        },
        retry: {
            showAutoRetryNote: true,
            autoRetryNote: "Retrying {retryNum}/{maxAuto}...",
            showButton: false
        },
        deleteFile: {
            forceConfirm: false,
            confirmMessage: "Are you sure you want to delete {filename}?",
            deletingStatusText: "Deleting...",
            deletingFailedText: "Delete failed"

        },
        display: {
            fileSizeOnSubmit: false,
            prependFiles: false
        },
        paste: {
            promptForName: false,
            namePromptMessage: "Please name this image"
        },
        editFilename: {
            enabled: false
        },
        showMessage: function(message){
            setTimeout(function() {
                window.alert(message);
            }, 0);
        },
        showConfirm: function(message) {
            return window.confirm(message);
        },
        showPrompt: function(message, defaultValue) {
            return window.prompt(message, defaultValue);
        }
    }, true);

    // Replace any default options with user defined ones
    qq.extend(this._options, o, true);

    if (!qq.supportedFeatures.uploading || (this._options.cors.expected && !qq.supportedFeatures.uploadCors)) {
        this._options.element.innerHTML = "<div>" + this._options.messages.unsupportedBrowser + "</div>"
    }
    else {
        this._wrapCallbacks();

        // overwrite the upload button text if any
        // same for the Cancel button and Fail message text
        this._options.template     = this._options.template.replace(/\{dragZoneText\}/g, this._options.text.dragZone);
        this._options.template     = this._options.template.replace(/\{uploadButtonText\}/g, this._options.text.uploadButton);
        this._options.template     = this._options.template.replace(/\{dropProcessingText\}/g, this._options.text.dropProcessing);
        this._options.fileTemplate = this._options.fileTemplate.replace(/\{cancelButtonText\}/g, this._options.text.cancelButton);
        this._options.fileTemplate = this._options.fileTemplate.replace(/\{retryButtonText\}/g, this._options.text.retryButton);
        this._options.fileTemplate = this._options.fileTemplate.replace(/\{deleteButtonText\}/g, this._options.text.deleteButton);
        this._options.fileTemplate = this._options.fileTemplate.replace(/\{statusText\}/g, "");

        this._element = this._options.element;
        this._element.innerHTML = this._options.template;
        this._listElement = this._options.listElement || this._find(this._element, 'list');

        this._classes = this._options.classes;

        if (!this._options.button) {
            this._defaultButtonId = this._createUploadButton({element: this._find(this._element, 'button')}).getButtonId();
        }

        this._setupClickAndEditEventHandlers();

        this._dnd = this._setupDragAndDrop();

        if (this._options.paste.targetElement && this._options.paste.promptForName) {
            this._setupPastePrompt();
        }

        this._totalFilesInBatch = 0;
        this._filesInBatchAddedToUi = 0;
    }
};

// Inherit the base public & private API methods
qq.extend(qq.FineUploader.prototype, qq.basePublicApi);
qq.extend(qq.FineUploader.prototype, qq.basePrivateApi);

// Add the FineUploader/default UI public & private UI methods, which may override some base methods.
qq.extend(qq.FineUploader.prototype, qq.uiPublicApi);
qq.extend(qq.FineUploader.prototype, qq.uiPrivateApi);
qq.UploadData = function(uploaderProxy) {
    var data = [],
        byId = {},
        byUuid = {},
        byStatus = {},
        api;

    function getDataByIds(ids) {
        if (qq.isArray(ids)) {
            var entries = [];

            qq.each(ids, function(idx, id) {
                entries.push(data[byId[id]]);
            });

            return entries;
        }

        return data[byId[ids]];
    }

    function getDataByUuids(uuids) {
        if (qq.isArray(uuids)) {
            var entries = [];

            qq.each(uuids, function(idx, uuid) {
                entries.push(data[byUuid[uuid]]);
            });

            return entries;
        }

        return data[byUuid[uuids]];
    }

    function getDataByStatus(status) {
        var statusResults = [],
            statuses = [].concat(status);

        qq.each(statuses, function(index, statusEnum) {
            var statusResultIndexes = byStatus[statusEnum];

            if (statusResultIndexes !== undefined) {
                qq.each(statusResultIndexes, function(i, dataIndex) {
                    statusResults.push(data[dataIndex]);
                });
            }
        });

        return statusResults;
    }

    api = {
        added: function(id) {
            var uuid = uploaderProxy.getUuid(id),
                name = uploaderProxy.getName(id),
                size = uploaderProxy.getSize(id),
                status = qq.status.SUBMITTING;

            var index = data.push({
                id: id,
                name: name,
                originalName: name,
                uuid: uuid,
                size: size,
                status: status
            }) - 1;

            byId[id] = index;

            byUuid[uuid] = index;

            if (byStatus[status] === undefined) {
                byStatus[status] = [];
            }
            byStatus[status].push(index);

            uploaderProxy.onStatusChange(id, undefined, status);
        },

        retrieve: function(optionalFilter) {
            if (qq.isObject(optionalFilter) && data.length)  {
                if (optionalFilter.id !== undefined) {
                    return getDataByIds(optionalFilter.id);
                }

                else if (optionalFilter.uuid !== undefined) {
                    return getDataByUuids(optionalFilter.uuid);
                }

                else if (optionalFilter.status) {
                    return getDataByStatus(optionalFilter.status);
                }
            }
            else {
                return qq.extend([], data, true);
            }
        },

        reset: function() {
            data = [];
            byId = {};
            byUuid = {};
            byStatus = {};
        },

        setStatus: function(id, newStatus) {
            var dataIndex = byId[id],
                oldStatus = data[dataIndex].status,
                byStatusOldStatusIndex = qq.indexOf(byStatus[oldStatus], dataIndex);

            byStatus[oldStatus].splice(byStatusOldStatusIndex, 1);

            data[dataIndex].status = newStatus;

            if (byStatus[newStatus] === undefined) {
                byStatus[newStatus] = [];
            }
            byStatus[newStatus].push(dataIndex);

            uploaderProxy.onStatusChange(id, oldStatus, newStatus);
        },

        uuidChanged: function(id, newUuid) {
            var dataIndex = byId[id],
                oldUuid = data[dataIndex].uuid;

            data[dataIndex].uuid = newUuid;
            byUuid[newUuid] = dataIndex;
            delete byUuid[oldUuid];
        },

        nameChanged: function(id, newName) {
            var dataIndex = byId[id];

            data[dataIndex].name = newName;
        }
    };

    return api;
};

qq.status = {
    SUBMITTING: "submitting",
    SUBMITTED: "submitted",
    REJECTED: "rejected",
    QUEUED: "queued",
    CANCELED: "canceled",
    UPLOADING: "uploading",
    UPLOAD_RETRYING: "retrying upload",
    UPLOAD_SUCCESSFUL: "upload successful",
    UPLOAD_FAILED: "upload failed",
    DELETE_FAILED: "delete failed",
    DELETING: "deleting",
    DELETED: "deleted"
};
/*globals qq*/
qq.Promise = function() {
    "use strict";

    var successArgs, failureArgs,
            successCallbacks = [],
            failureCallbacks = [],
            doneCallbacks = [],
            state = 0;

    return {
        then: function(onSuccess, onFailure) {
            if (state === 0) {
                if (onSuccess) {
                    successCallbacks.push(onSuccess);
                }
                if (onFailure) {
                    failureCallbacks.push(onFailure);
                }
            }
            else if (state === -1 && onFailure) {
                onFailure.apply(null, failureArgs);
            }
            else if (onSuccess) {
                onSuccess.apply(null, successArgs);
            }

            return this;
        },
        done: function(callback) {
            if (state === 0) {
                doneCallbacks.push(callback);
            }
            else {
                callback.apply(null, failureArgs === undefined ? successArgs : failureArgs);
            }

            return this;
        },
        success: function() {
            state = 1;
            successArgs = arguments;

            if (successCallbacks.length) {
                qq.each(successCallbacks, function(idx, callback) {
                    callback.apply(null, successArgs)
                })
            }

            if (doneCallbacks.length) {
                qq.each(doneCallbacks, function(idx, callback) {
                    callback.apply(null, successArgs)
                })
            }

            return this;
        },
        failure: function() {
            state = -1;
            failureArgs = arguments;

            if (failureCallbacks.length) {
                qq.each(failureCallbacks, function(idx, callback) {
                    callback.apply(null, failureArgs);
                })
            }

            if (doneCallbacks.length) {
                qq.each(doneCallbacks, function(idx, callback) {
                    callback.apply(null, failureArgs);
                })
            }

            return this;
        }
    };
};

qq.isPromise = function(maybePromise) {
    return maybePromise && maybePromise.then && maybePromise.done;
};