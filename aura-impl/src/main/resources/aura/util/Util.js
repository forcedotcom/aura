/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/*jslint evil:true, sub: true */
/**
 * @description The top-level namespace/object for all SFDC Util code.
 * Util methods provide utility functions for browsers in addition to
 * functions for retrieving, manipulating, or checking DOM elements.
 * @constructor
 */
$A.ns.Util = function() {
    this.trashcan = document.createDocumentFragment();
    this.trash = [];
    this.json = new Json();
    this["json"] = this.json;
    this.transport = new Transport();
    this["transport"] = this.transport;
    this.style = new Style();
    this["style"] = this.style;
    this["Bitset"] = Bitset;
    this["NumberFormat"] = NumberFormat;
    this.objToString = Object.prototype.toString;
    this.trashedComponentQueue = [];
    this.dataAttributeCache = {};
    this.debugToolWindow = undefined;
    this.sizeEstimator = new SizeEstimator();
};

/**
 * Browser check for all supported versions of Internet Explorer, does the validation using the userAgent.
 *
 * @returns {Boolean} true if Internet Explorer detected
 */
$A.ns.Util.prototype.isIE = (navigator.userAgent.indexOf("MSIE") != -1) || (navigator.userAgent.indexOf("Trident/") != -1);

/**
 * Whether IOS7 UIWebView
 * @returns {boolean} true if IOS UIWebView
 */
$A.ns.Util.prototype.isIOSWebView = function() {
    if (this._isIOSWebView === undefined) {
        var ua = window.navigator.userAgent;
        this._isIOSWebView = /(iPad|iPhone|iPod);.*CPU.*OS 7_\d.*AppleWebKit/i.test(ua) && ua.indexOf("Safari") == -1;
    }
    return this._isIOSWebView;
};

/**
 * evals code globally, without enclosing the current scope
 *
 * @private
 */
$A.ns.Util.prototype.globalEval = $A.ns.Util.prototype.isIE ? function(src) {
    // use assignment to variable so that the newlines in src are not actually treated as the end of the line
    return new Function("var a = " + src + "; return a;")();
} : function(src) {
    // normal indirect eval call
    return window.eval("false||" + src);
};

/**
 * Checks whether the specified object is an array.
 *
 * @param {Object} obj The object to check for.
 * @returns {Boolean} True if the object is an array, or false otherwise.
 */
$A.ns.Util.prototype.isArray = typeof Array.isArray === "function" ? Array.isArray : function(obj) {
    return obj instanceof Array;
};

/**
 * Checks whether the specified object is a valid object.
 * A valid object: Is not a DOM element, is not a native browser class (XMLHttpRequest)
 * is not falsey, and is not an array, error, function string or number.
 *
 * @param {Object} obj The object to check for.
 * @returns {Boolean} True if the object is a valid object, or false otherwise.
 */
$A.ns.Util.prototype.isObject = function(obj){
    return typeof obj === "object" && obj !== null && !this.isArray(obj);
};

/**
 * Checks whether the specified object is a valid error.
 * A valid error: Is not a DOM element, native browser class (XMLHttpRequest), falsey,
 * array, function string or number.
 *
 * @param {Object} obj The object to check for.
 * @returns {Boolean} True if the object is a valid error, or false otherwise.
 */
$A.ns.Util.prototype.isError = function(obj){
    return !!obj && this.objToString.apply(obj) === '[object Error]';
};

/**
 * Checks whether the specified object is a valid function.
 * A valid function: Is not a DOM element, native browser class (XMLHttpRequest), falsey,
 * array, error, or number.
 *
 * @param {Object} obj The object to check for.
 * @returns {Boolean} True if the object is a valid function, or false otherwise.
 */
$A.ns.Util.prototype.isFunction = function(obj){
    return !!obj && this.objToString.apply(obj) === '[object Function]';
};

/**
 * Checks if the object is of type string.
 *
 * @param {Object} obj The object to check for.
 * @returns {Boolean} True if the object is of type string, or false otherwise.
 */
$A.ns.Util.prototype.isString = function(obj){
    return typeof obj === 'string';
};

/**
 * Checks if the object is of type number.
 *
 * @param {Object} obj The object to check for.
 * @returns {Boolean} True if the object is of type number, or false otherwise.
 */
$A.ns.Util.prototype.isNumber = function(obj){
    return typeof obj === 'number';
};

/**
 * Checks if the object is a finite number (not NaN or Infinity or -Infinity)
 *
 * @param {Object} obj The object to check for.
 * @returns {Boolean} True if the object is a finite number, or false otherwise.
 */
$A.ns.Util.prototype.isFiniteNumber = function(obj){
    return this.isNumber(obj) && isFinite(obj);
};

/**
 * Checks if the object is of type boolean.
 *
 * @param {Object} obj The object to check for.
 * @returns {Boolean} True if the object is of type boolean, or false otherwise.
 */
$A.ns.Util.prototype.isBoolean = function(obj){
    return typeof obj === 'boolean';
};

/**
 * Checks if the object is undefined.
 *
 * @param {Object} obj The object to check for.
 * @returns {Boolean} True if the object type is undefined, or false otherwise.
 */
$A.ns.Util.prototype.isUndefined = function(obj){
    return obj === undefined;
};

/**
 * Checks if the object is undefined or null.
 *
 * @param {Object} obj The object to check for.
 * @returns {Boolean} True if the object type is undefined or null, or return false otherwise.
 */
$A.ns.Util.prototype.isUndefinedOrNull = function(obj){
    return obj === undefined || obj === null;
};

/**
 * Checks if the object is empty.
 * An empty object's value is undefined, null, an empty array, or empty string. An object with no native
 * properties is not considered empty at this time.
 *
 * @param {Object} obj The object to check for.
 * @returns {Boolean} True if the object is empty, or false otherwise.
 */
$A.ns.Util.prototype.isEmpty = function(obj){
    return this.isUndefinedOrNull(obj) || (this.isArray(obj) && obj.length === 0) || obj === '';
};

/**
 * Coerces truthy and falsy values into native booleans
 *
 * @param {Object} val The object to check.
 * @returns {Boolean} True if the object is truthy, or false otherwise.
 */
$A.ns.Util.prototype.getBooleanValue = function (val) {
    return val !== undefined && val !== null && val !== false && val !== 0 && val !== "false" && val !== "" && val !== "f";
};

/**
 * Gets a DOM element by its id without any leading characters (e.g. #) unless the ID contains them.
 *
 * @param {String} id The corresponding id of the DOM element.
 * @returns {Object} The element with the matching id, or null if none is found.
 */
$A.ns.Util.prototype.getElement = function(id){
    return document.getElementById(id);
};

/**
 * Gets a copy of an object. In the case of an Array or Object, returns a shallow copy. In the case of a literal,
 * returns the literal value.
 *
 * @param {Object} value The value for which to return a comparable copy.
 * @returns {Object} The comparable copy of the value supplied.
 */
$A.ns.Util.prototype.copy = function(value){
    if(this.isArray(value)){
        return value.slice();
    }
    if(this.isObject(value)){
        var copy={};
        this.apply(copy,value,true);
        return copy;
    }
    return value;
};

/**
 * Compares values. In the case of an Array or Object, compares first level references only.
 * In the case of a literal, directly compares value and type equality.
 *
 * @param {Object} expected The source value to compare.
 * @param {Object} actual The target value to compare.
 * @returns {Object} The result of the comparison, with reasons.
 */
$A.ns.Util.prototype.compareValues = function(expected, actual){
    var result={
        match:true,
        reasons:[]
    };
    if(this.isArray(expected)){
        if(!this.isArray(actual)){
            result.reasons.push({index:-1,reason:"Actual was not an Array."});
            result.match=false;
        }else {
            var length = Math.max(expected.length, actual.length);
            for (var i = 0; i < length; i++) {
                if (expected[i] !== actual[i]) {
                    result.reasons.push({index: i, reason: "Mismatch at position " + i + "."});
                    result.match = false;
                }
            }
        }
    }else if(this.isObject(expected)){
        if(!this.isObject(actual)){
            result.reasons.push({index:-1,reason:"Actual was not an Object."});
            result.match=false;
        }
        var keyMap={};
        for(var expectedKey in expected){
            keyMap[expectedKey]=true;
            if(expected[expectedKey]!==actual[expectedKey]){
                result.reasons.push({index: expectedKey, reason: "Mismatch at key " + expectedKey + "."});
                result.match = false;
            }
        }
        for(var actualKey in actual){
            if(keyMap[actualKey]){
                continue;
            }
            result.reasons.push({index: actualKey, reason: "Found new key " + actualKey + "."});
            result.match = false;
        }
    }else{
        if(expected!==actual){
            result.reasons.push({index:-1,reason:"Literal value mismatch."});
            result.match=false;
        }
    }
    return result;
};


/**
 * Checks whether the element has the specified class.
 *
 * @param {Object} element The element to check for.
 * @param {String} className The CSS class name to check for.
 * @returns {Boolean} True if the specified class is found for the element, or false otherwise.
 */
$A.ns.Util.prototype.hasClass = function(element, className){
    var oldClass='';
    if(this.isComponent(element)){
        if(element.isInstanceOf("ui:elementInterface") || element.isInstanceOf("ui:visible")) {
            oldClass=element.get("v.class");
        }else if(element.isInstanceOf("aura:html")){
            oldClass=element.get("v.HTMLAttributes.class");
        }else{
            element=element.getElement();
        }
    }
    if(element && element.tagName){
        oldClass=element["className"];
    }
    return (' '+oldClass+' ').indexOf(' '+className+' ')>-1;
};

/**
 * Adds the specified class to the element, depending on whether it already existed on that element.
 *
 * @param {Object} element The element to apply the class on.
 * @param {String} clz The CSS class to be applied on the element.
 *
 */
$A.ns.Util.prototype.addClass = function(element, newClass){
    this.setClass(element,newClass,false);
};

/**
 * Removes the class from an element.
 *
 * @param {Object} element The element to remove the class from.
 * @param {String} newClass The CSS class to be removed from the element.
 */
$A.ns.Util.prototype.removeClass = function(element, newClass){
    this.setClass(element,newClass,true);
};

/**
 * Adds a class or removes it from an element.
 *
 * @param {Object} element The element to add or remove the class from.
 * @param {String} className The CSS class to be added or removed from the class.
 */
$A.ns.Util.prototype.toggleClass = function(element, className, condition){
    if(condition===undefined){
        condition=!this.hasClass(element, className);
    }
    if(condition){
        this.addClass(element,className);
        return true;
    }else{
        this.removeClass(element, className);
        return false;
    }
};

/**
 * Swaps an element's class by removing the selected class and adding another in its place.
 *
 * @param {Object} element The element to be processed.
 * @param {String} oldClass The class to remove from the element.
 * @param {String} newClass The class to add to the element.
 */
$A.ns.Util.prototype.swapClass = function(element, oldClass, newClass){
    oldClass = this.isArray(oldClass)?oldClass:[oldClass];
    newClass = this.isArray(newClass)?newClass:[newClass];
    for(var i=0;i<oldClass.length;i++){
        this.removeClass(element, oldClass[i]);
    }
    for(i=0;i<newClass.length;i++){
        this.addClass(element, newClass[i]);
    }
};

$A.ns.Util.prototype.setClass=function(element,newClass,remove){
    var constructedClass='';
    if(this.isComponent(element)){
        var attribute=null;
        if(element.isInstanceOf("ui:elementInterface") || element.isInstanceOf("ui:visible")) {
            attribute="v.class";
        }else if(element.isInstanceOf("aura:html")){
            attribute="v.HTMLAttributes.class";
        }else{
            element=element.getElement();
        }
        if(attribute){
            var useShadowClass=false;
            var oldClass=element.getShadowAttribute(attribute);
            if(oldClass!=undefined){
                useShadowClass=true;
            }else{
                oldClass=element.get(attribute)||'';
            }
            constructedClass=this.buildClass(oldClass,newClass,remove);
            if(oldClass!==constructedClass){
                if(useShadowClass){
                    element.setShadowAttribute(attribute,constructedClass?' '+constructedClass:'');
                }else{
                    element.set(attribute,constructedClass);
                }
            }
        }
    }
    if(element && element.tagName){
        constructedClass=this.buildClass(element["className"]||"",newClass,remove);
        if(element["className"]!=constructedClass) {
            element["className"]=constructedClass;
        }
    }
};

$A.ns.Util.prototype.buildClass=function(oldClass, newClass, remove){
    if(this.isUndefinedOrNull(oldClass)) {
        oldClass='';
    }
    if(this.isUndefinedOrNull(newClass)){
        return oldClass;
    }
    newClass = this.trim(newClass);
    oldClass = this.trim(oldClass);
    var found=(' '+oldClass+' ').indexOf(' '+newClass+' ')>-1;
    if(remove){
        if(!found){
            return oldClass;
        }
        return this.trim((' '+oldClass+' ').split(' '+newClass+' ').join(' '));
    }else{
        if(oldClass){
            if(!found){
                return  oldClass + ' ' + newClass;
            } else {
                return oldClass;
            }
        }else{
            return newClass;
        }
    }
};

/**
 * Generates dom nodes from string markup
 *
 * @param {String} markup The markup from which to generate dom nodes
 * @returns {Array} An array of the elements that were generated.
 */
$A.ns.Util.prototype.createElementsFromMarkup=function(markup){
    if(!this.isUndefinedOrNull(markup)) {
        var tmpNode = document.createElement("span");
        tmpNode.innerHTML = markup;
        return this.toArray(tmpNode.childNodes);
    }
    return [];
};

/**
 * Inserts element(s) as the first child of the parent element.
 *
 * @param {Object} newE1 The new element to insert.
 * @param {Object} referenceE1 The reference element
 * @returns {Object} The element that was inserted.
 */
 $A.ns.Util.prototype.insertFirst = function(newEl, referenceEl){
    if (this.isArray(newEl)) {
        var frag = document.createDocumentFragment();
        this.appendChild(newEl, frag);
        this.insertFirst(frag, referenceEl);
        return;
    }
    var firstChild = referenceEl.firstChild;
    if (firstChild) {
        referenceEl.insertBefore(newEl, firstChild);
    }
    else {
        referenceEl.appendChild(newEl);
    }
};

/**
 * Inserts a new element, newEl, directly before the reference element, referenceEl.
 * If the reference element is a parent node, insert the new element directly before the parent node.
 *
 * @param {Object} newE1 The new element to insert.
 * @param {Object} referenceE1 The reference element
 * @returns {Object} The element that was inserted.
 */
$A.ns.Util.prototype.insertBefore = function(newEl, referenceEl) {
    if (this.isArray(newEl)) {
        var frag = document.createDocumentFragment();
        this.appendChild(newEl, frag);
        this.insertBefore(frag, referenceEl);
        return;
    }

    var parent = referenceEl.parentNode;
    if (parent) {
        parent.insertBefore(newEl, referenceEl);
    }
};

/**
 * Inserts a new element, newEl, directly after the reference element, referenceEl.
 * If the reference element is a parent node, insert the new element directly after the parent node.
 *
 * @param {Object} newE1 The new element to insert.
 * @param {Object} referenceE1 The reference element
 * @returns {Object} The element that was inserted.
 */
$A.ns.Util.prototype.insertAfter = function(newEl, referenceEl) {
    if (this.isArray(newEl)) {
        var frag = document.createDocumentFragment();
        this.appendChild(newEl, frag);
        this.insertAfter(frag, referenceEl);
        return;
    }

    var parent = referenceEl.parentNode;
    if (parent) {
        // if the parents lastchild is the targetElement...
        if (parent.lastChild === referenceEl) {
            //add the newElement after the target element.
            parent.appendChild(newEl);
        } else {
            // else the target has siblings, insert the new element between the target and it's next sibling.
            parent.insertBefore(newEl, referenceEl.nextSibling);
        }
    }
};

/**
 * Adds a new element to the end of the reference element. Does not work if the canHaveChildren property on the reference element is false.
 *
 * @param {Object} newE1 The element to append as a child of the reference element.
 * @param {Object} referenceE1 The existing element
 * @returns {Object} The new element that was added
 */
$A.ns.Util.prototype.appendChild = function(newEl, referenceEl) {
    if (referenceEl.canHaveChildren===false){
        return;
    }
    if (this.isArray(newEl)) {
        var frag = document.createDocumentFragment();
        var len = newEl.length;
        for(var i=0;i<len;i++){
            if(newEl[i]) {
                frag.appendChild(newEl[i]);
            }
        }
        newEl = frag;

    }

    referenceEl.appendChild(newEl);
};

/**
 * Removes the specified element from the DOM.
 *
 * Use this method with caution. Since we hijack the normal delete
 * functionality, we need to be careful of odd event processing. Specifically
 * we end up sending off some events that would not otherwise be sent.
 *
 * Also note that we currently remove nodes children first, which means we
 * deconstruct our tree from the bottom up. If we reverse this, we might be
 * able to add optimizations.
 *
 * @param {Object} element The element to be removed.
 */
$A.ns.Util.prototype.removeElement = function(element) {
    if (element && !(element.parentNode === this.trashcan)) {
        if (element.parentNode) {
            //
            // We do a check to ensure that we don't try to add the element
            // to the trashcan more than once. Though the check above _should_
            // catch all cases, there are odd boundary conditions where people
            // holding references could re-re-parent elements. That is very
            // bad, so we yell early here. Note that long lived references
            // might get past this as well, but they are likely to blow up
            // on use. Not having this code allows things to break much later
            // in an inobvious way. See W-1462733
            //
            // Note that we carefully protect aura_deleted from the compiler, so
            // that we don't accidentally conflict with the element namespace,
            // the property should never live longer than the delay between this
            // reparenting and the gc below.
            //
            if (element.nodeType !== 3 && element.nodeType !== 8) {
                $A.assert(this.isUndefined(element["aura_deleted"]), "Element was reused after delete");
                element["aura_deleted"] = true;
            }

            this.trashcan.appendChild(element);
        } else{
            this.trash.push(element);
        }

        if (!this.gcPending) {
            this.gcPending = true;
            var that = this;
            setTimeout(function() {
                var trashcan = that.trashcan;
                while (trashcan.hasChildNodes()) {
                    var node = trashcan.lastChild;

                    if (node.nodeType !== 3 && node.nodeType !== 8) {
                    	try{
                    		delete node["aura_deleted"];
                    	}
                    	catch(e){
                    		//IE7 having issue with delete
                    		node.removeAttribute("aura_deleted");
                    	}
                    }

                    trashcan.removeChild(node);
                }

                for (var i = 0, len = that.trash.length; i < len; i++){
                    that.trash[i] = null;
                }

                that.trash = [];
                that.gcPending = false;
            }, 1000);
        }
    }
};

/**
 * Decodes the URL by replacing the encoded text with the character that it represents.
 *
 * @param {String} url The URL string to be decoded.
 * @returns {Object} The decoded URL.
 */
$A.ns.Util.prototype.urlDecode = function(url){
    var ret = {};
    var pairs = url.split("&");
    for (var i = 0; i < pairs.length; i++) {
        var split = pairs[i].split("=");
        ret[split[0]] = decodeURIComponent(split[1]);
    }
    return ret;
};

/**
 * Trims a string by removing newlines, spaces, and tabs from the beginning and end of the string.
 *
 * @param {String} st The string to be trimmed.
 * @returns {String}
 */
$A.ns.Util.prototype.trim = function(st){
    return (st || "").replace(/^\s+|\s+$/g, '');
};

/**
 * Truncates a string to the given length.
 *
 * @param {String} st The string to be truncated.
 * @param {Number} len The length of characters. Includes the ellipsis if ellipsis is set to true.
 * @param {Boolean} ellipsis If set to true, an ellipsis is added to the truncated string.
 * @param {Boolean} truncateByWord If set to true, checks that no truncation occurs in the middle of a word.
 * @returns {String} The truncated string.
 */
$A.ns.Util.prototype.truncate = function(st, len, ellipsis, truncateByWord){
    ellipsis = !!ellipsis;
    truncateByWord = !!truncateByWord;

    if (!st || !len) {
        return "";
    }

    st=st.toString();

    if (len > 0 && st.length > len) {
        if (ellipsis) {
            len = (len - 3) < 1 ? 1 : len - 3;
        }

        if (truncateByWord === false) {
            return (this.trim(st.substring(0, len)) + (ellipsis ? '...' : ''));
        } else {
            /* Truncate the content of the string, then go back to the end of the
               previous word to ensure that we don't truncate in the middle of
               a word */
            st = st.substring(0, len + 1);
            var st2 = st.replace(/\w+$/, '');
            if ((st2.length === 0) || (st2.length > len)){
                st2 = st.substring(0, len);
            }

            return (this.trim(st2) + (ellipsis ? '...' : ''));
        }
    } else {
        return st;
    }
};

/**
 * Create a function that invokes the given callback after the tolerance period
 * has passed since the last invocation of the function.
 *
 * This is useful to defer responding to a stream of repetetive events until the
 * end of the stream.
 *
 * @param {Function} callback
 *          The function to be run once the tolerance period has passed.
 * @param {Number} toleranceMillis
 *          The tolerance duration in milliseconds.
 * @returns {Function} The function to invoke in order to trigger a start/reset
 *          of the tolerance period.
 */
$A.ns.Util.prototype.createTimeoutCallback = function(callback, toleranceMillis) {
    $A.assert(!$A.util.isUndefinedOrNull(callback) && $A.util.isFunction(callback), "Invalid callback");
    $A.assert(toleranceMillis > 0, "Must use a positive tolerance period.");

    // The last time the returned function was invoked.
    var rtime = null;
    // True if a timeoutCallback invocation is scheduled.
    var timeout = false;

    /**
     * See if the tolerance period has passed and schedule another check or invoke the callback accordingly.
     */
    function timeoutCallback() {
        var currentDuration = new Date() - rtime;
        $A.assert(currentDuration >= 0);
        if (currentDuration < toleranceMillis) {
            // An invocation occurred after this timeout was scheduled. Recheck
            // when the period starting from the last invocation finishes.
            setTimeout(timeoutCallback, toleranceMillis - currentDuration);
        } else {
            // The tolerance period has completed without any invocations. Fire the user callback.
            timeout = false;
            rtime = null;
            callback();
        }
    }

    /**
     * The function to return starts/resets the tolernace period on every invocation.
     */
    return function() {
        // Update rtime for this invocation.
        rtime = new Date();

        // If we haven't already scheduled a timeout for this period, then set one.
        if (timeout === false) {
            timeout = true;
            setTimeout(timeoutCallback, toleranceMillis);
        }
    };
};

/**
 * Adds an event listener to a DOM element.
 *
 * @param {HTMLElement} element The DOM element to which to apply the listener.
 * @param {String} eventName The name of the DOM event, minus the "on" prefix (e.g. "click", "focus", "blur", etc.).
 * @param {Object} handler The JS handler to add.
 * @param {Boolean} useCapture Whether to use event capturing.
 * @param {Number} timeout Optional timeout (in milliseconds) that will delay the handler execution.
 * @returns {Object} Either a function (success) or null (fail)
 */
$A.ns.Util.prototype.on = (function() {
    if (window["addEventListener"]) {
        return function(element, eventName, handler, useCapture, timeout) {
        	var originalHandler = handler;

            if (timeout) {
                handler = this.createTimeoutCallback(handler, timeout);
            }

            if(element){
                originalHandler.registeredAuraHandler = handler;

                element["addEventListener"](eventName, handler, useCapture);
            }
        };
    } else {
        var preventDefault = function(){
            this.returnValue = false;
        };

        var stopPropagation = function(){
            this.cancelBubble = true;
        };

        return function(element, eventName, handler, useCapture, timeout) {
            if (!element){
            	return;
            }

        	var originalHandler = handler;

            // Eliminate registration of duplicate handlers on older browsers
            var handlerCache = element["handlerCache"];
            if (!handlerCache) {
            	element["handlerCache"] = handlerCache = {};
            }

            var handlers = handlerCache[eventName];
            if (handlers) {
                for (var n = 0; n < handlers.length; n++) {
                    if (handlers[n] === handler) {
                        // Do not wire up duplicate handlers
                        return;
                    }
                }

                handlers.push(handler);
            } else {
                handlerCache[eventName] = [handler];
            }

            if (timeout) {
                handler = $A.util.createTimeoutCallback(handler, timeout);
            }

            // Correct the context of the events (this) pointer to the element its attached to.
            // Add standard interaction methods
            var newHandler = function (event) {
                event.currentTarget = element;
                event.target = event.srcElement;
                event.which = event.keyCode;
                event.preventDefault = preventDefault;
                event.stopPropagation = stopPropagation;
                handler.call(element, event || window.event);
                event.currentTarget = event.target = event.which = event.preventDefault = event.stopPropagation = null;
            };

            originalHandler.registeredAuraHandler = newHandler;

            element["attachEvent"]('on' + eventName, newHandler, false);
        };
    }
})();

/**
 * Removes an event listener from a DOM element. See also Util.on() a.k.a. $A.util.on()
 *
 * @param {HTMLElement} element The DOM element from which to remove the listener.
 * @param {String} eventName The name of the DOM event, minus the "on" prefix (e.g. "click", "focus", "blur", etc.).
 * @param {Function} listener The JS listener function to remove.
 * @param {Boolean} useCapture Whether to use event capturing.
 */
$A.ns.Util.prototype.removeOn = function(element, eventName, listener, useCapture) {
	if (listener.registeredAuraHandler) {
		listener = listener.registeredAuraHandler;
	}

	if (window["removeEventListener"]) {
        element.removeEventListener(eventName, listener, useCapture);
    } else if (window["detachEvent"]) {
        element.detachEvent("on" + eventName, listener);
    } else {
        $A.assert(false, "user agent must support either removeEventListener or detachEvent to remove an event handler.");
    }
};

/**
 * Stores the values of a form to a Map object. Values from a checkbox, radio, drop-down list, and textarea
 * are stored in the Map.
 *
 * @param {Object} form
 * @returns {Object} The map containing the values from the form input.
 */
$A.ns.Util.prototype.formToMap = function(form) {
    var map = {};

    for (var i=0; i<form.length; i++) {
        var element = form[i];
        var name = element.name;
        var value = null;

        if(name){
            if (element.tagName === "INPUT") {

                var type = element.type;
                if(type === "button" || type === "submit"){
                    //do nothing;
                }else if(type === "checkbox") {
                    if(element.checked){
                        value = element.value;
                    }
                }else if(type === "radio") {
                    if(element.checked && element.value && element.value !== ""){
                        value = element.value;
                    }
                }else{
                    value = element.value;
                }
            } else if (element.tagName === "SELECT") {
                value = this.getSelectValue(element);
            } else if (element.tagName === "TEXTAREA") {
                value = element.value;
            }
            if(value !== null && value !== undefined){
                this.addValueToMap(map, name, value);
            }
        }
    }
    return map;
};

/**
 * Gets the selected values from a list of options.
 * Returns a single value if only a single option is selected.
 *
 * @param {Object} select
 * @returns {Object} A list of selected options.
 */
$A.ns.Util.prototype.getSelectValue = function(select) {

    if (select.options.length === 0) {
        return null;
    }
    if (!select.multiple) {
        return select.options[select.selectedIndex].value;
    }
    else {
        var list = [];
        var options = select.options;
        for (var i=0; i<options.length; i++) {
            var option = options[i];
            if (option.selected) {
                list[list.length] = option.value;
            }
        }
        return list;
    }
};

/**
 * Adds a value to a map with a given key.  If the key already exists, the values are turned into a list.
 * If the value has a dot in it - e.g. "properties.4" - it will be turned into an inner map, with
 * the second part as the inner key.
 *
 * @param {Object} inputMap The input map to be processed.
 * @param {String} key The data key whose value is to be added to the input map.
 * @param {Object} value The value of the data to add to the input map.
 */
$A.ns.Util.prototype.addValueToMap = function(inputMap, key, value) {
    if (key.indexOf(".") > 0) {
        var inputName = key.substring(0, key.indexOf("."));
        var subMapKey = key.substring(key.indexOf(".") + 1, key.length);
        this.addMapValueToMap(inputMap, inputName, value, subMapKey);
        return;
    }
    else {
        var ix = key.indexOf("00N");
        if(ix === 0 || ix === 2) { // CF00N
            this.addMapValueToMap(inputMap, "properties", value, key);
            return;
        }
    }
    var oldVal = inputMap[key];
    if(!oldVal){
        inputMap[key] = value;
    }else if (oldVal.constructor !== Array){
        var valArray = [];
        valArray[0] = oldVal;
        valArray[1] = value;
        inputMap[key] = valArray;
    }else{
        oldVal.push(value);
    }
};

/**
 * Generates a map of values inside the main input map.  This is used, for example,
 * When input fields have a "." operator, so
 * input name="def.def1"
 * input name="def.def2"
 * get put in the input map under "def", as a map with "def1" and "def2" mapped to their values.
 *
 * @param {Object} inputMap The input map to be processed.
 * @param {String} key The data key whose value is to be added to the input map.
 * @param {Object} value The value of the data to add to the input map.
 * @param {String} subMapKey
 */
$A.ns.Util.prototype.addMapValueToMap = function(inputMap, key, value, subMapKey) {
    var subMap = inputMap[key];
    if (!subMap) {
        subMap = {};
        inputMap[key] = subMap;
    }
    subMap[subMapKey] = value;
};

/**
 * Walks up a definition hierarchy to search for a sub definition by qualified name.
 *
 * @param {Object} def
 *          The definition to search
 * @param {String} qname
 *          The qualified name to search for
 * @returns {Boolean} true if qualified name is found in defs hierarchy
 */
$A.ns.Util.prototype.isSubDef = function(def, qname) {
    while (def) {
        if (def.getDescriptor().getQualifiedName() === qname) {
            return true;
        }

        // Now walk the hierarchy
        def = def.getSuperDef();
    }

    return false;
};

/**
 * 
 * @description Takes the methods, and properties from one object and assigns them to another.
 * Returns the base object with the members from the child object.
 * This is commonly used to apply a set of configurations to a default set, to get a single set of configuration properties.
 * @example
 * <ul>
 *  <li><code>util.apply(Child.prototype, Parent); // Returns a new object inheriting all the methods and properties from Parent.</code></li>
 *  <li><code>util.apply(Child.prototype, { isCool: true }); // Parent would then have a property of child.</code></li>
 *  <li><code>util.apply({ foo: 'bar', diameter: 10}, { diameter: 20, bat: 'man' }, true); //== {foo:'bar', diameter: 20, bat: 'man'}</code></li>
 *  <li><code>util.apply({ foo: 'bar', diameter: 10}, { diameter: 20, bat: 'man' }, false); //== {foo:'bar', diameter: 10, bat: 'man'}</code></li>
 *  </ul>
 * @param {Object|Function} baseObject The object that will receive the methods, and properties.
 * @param {Object|Function} members The methods and properties to assign to the baseObject.
 * @param {Boolean} [forceCopy] If the property already exists, should we still copy the member? false by default
 * @param {Boolean} [deepCopy] Should we continue to navigate child objects if we don't overwrite them? false by default
 */
$A.ns.Util.prototype.apply = function(/* Object|Function */ baseObject, /* Object|Function*/ members, /* bool */ forceCopy, /* bool */ deepCopy) {
    // Probably cheaper to have two loops with only one getting run then doing the if check each time.
    var prop;
    if(forceCopy) {
        for(prop in members) {
            baseObject[prop] = members[prop];
        }
    } else {
        for(prop in members) {
            if(!baseObject.hasOwnProperty(prop)) {
                baseObject[prop] = members[prop];
            }
            if(deepCopy){
                this.apply(baseObject[prop],members[prop]);
            }
        }
    }
    return baseObject;
};

$A.ns.Util.prototype.CAMEL_CASE_TO_HYPHENS_REGEX = /([A-Z])/g;

/**
 * Converts camelCase to hyphens.
 *
 * @param {String} str The string to be converted.
 * @returns {String} The string containing hyphens that replaces the camelCase.
 */
$A.ns.Util.prototype.camelCaseToHyphens = function(str) {
    return str.replace(this.CAMEL_CASE_TO_HYPHENS_REGEX, "-$1").toLowerCase();
};

/**
 * Converts hyphens to camelCase.
 *
 * @param {String} str The string to be converted.
 * @returns {String} The string in camelCase.
 */
$A.ns.Util.prototype.hyphensToCamelCase = function(str) {
    function hyphensToCamelCaseHelper(s, group) {
        return group.toUpperCase();
    }

    return str.replace(/-([a-z])/gi, hyphensToCamelCaseHelper);
};

/**
 * 
 * @description A map of nodeNames that cannot accept custom data attributes.
 * @private
 */
$A.ns.Util.prototype.noData = {
    "embed": true,
    "object": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000", // flash
    "applet": true,
    "#text": true
};

/**
 * 
 * @description Returns whether a given DOM element can accept custom data attributes.
 *
 * @param {HTMLElement} element The element to check for custom data attribute support.
 * @returns {Boolean} Whether element accepts custom data attributes.
 */
$A.ns.Util.prototype.acceptsData = function(element) {
    if (!this.isElement(element)) {
        return false;
    }

    if (element.nodeName) {
        var match = this.noData[ element.nodeName.toLowerCase() ];

        if (match) {
            return !(match === true || element.getAttribute("classid") !== match);
        }
    }
    return true;
};

/**
 * Return attributeValue of an element
 *
 * @param {HTMLElement} element The element from which to retrieve data.
 * @param {String} attributeName The name of attribute to look up on element.
 */
$A.ns.Util.prototype.getElementAttributeValue = function(element,attributeName){
    var attrValue = element.getAttribute(attributeName);
    //For browser Compatibility - getAttribute doesn't always work in IE
    if($A.util.isUndefinedOrNull(attrValue)){
        //Gets list of attributes as they are written on the Element. The return value of this is going to be undefined
        attrValue = element.attributes[attributeName];

        //If the element does exist, then get its nodeValue.
        //If it doesn't exist, we will return null per Mozzilla Standards and how the getAttribute method works normally
        if(!$A.util.isUndefinedOrNull(attrValue)){
            attrValue = attrValue.nodeValue;
        } else if(!$A.util.isUndefinedOrNull(element[attributeName])) {
            attrValue = element[attributeName];
        } else{
            attrValue = null;
        }
    }
    return attrValue;
};

/**
 * 
 * @description Returns a custom data attribute value from a DOM element.
 * For more information on custom data attributes, see http://html5doctor.com/html5-custom-data-attributes/
 * @param {HTMLElement} element The element from which to retrieve data.
 * @param {String} key The data key to look up on element.
 */
$A.ns.Util.prototype.getDataAttribute = function(element, key) {
	if (!this.acceptsData(element) || this.isUndefined(key)) {
        return null;
    }

    key = this.getDataAttributeName(key);
    return element.getAttribute(key);
};

/**
 * 
 * @description Sets a custom data attribute value from a DOM element.
 * For more information on custom data attributes, see http://html5doctor.com/html5-custom-data-attributes/
 * @param {HTMLElement} element The element from which to retrieve data.
 * @param {String} key The data key to add to element.
 * @param {String} value The value of the data to add to an element. If value is undefined, the key data attribute will be removed from element.
 */
$A.ns.Util.prototype.setDataAttribute = function(element, key, value) {
    if (!this.acceptsData(element) || this.isUndefined(key)) {
        return null;
    }

    key = this.getDataAttributeName(key);

    if (!this.isUndefined(value)) {
        return element.setAttribute(key, value);
    }
    return element.removeAttribute(key);

};

/**
 * @private
 */
$A.ns.Util.prototype.getDataAttributeName = function(key) {
	var name = this.dataAttributeCache[key];
	if (!name) {
		name = "data-" + this.camelCaseToHyphens(key);
		this.dataAttributeCache[key] = name;
	}

	return name;
};

/**
 * Checks whether a custom data attribute value already exists.
 * @param {HTMLElement} element The element from which to retrieve data.
 * @param {String} key The data key to look up on element.
 * @returns {Boolean} true if element has data attribute
 */
$A.ns.Util.prototype.hasDataAttribute = function(element, key) {
	return !this.isUndefinedOrNull(this.getDataAttribute(element, key));
};

/**
 * Checks if the object is an HTML element.
 * @param {Object} obj
 * @returns {Boolean} True if the object is an HTMLElement object, or false otherwise.
 */
$A.ns.Util.prototype.isElement = function(obj) {
    if (typeof HTMLElement === "object") {
        return obj instanceof HTMLElement;
    } else {
        return typeof obj === "object" && obj.nodeType === 1 && typeof obj.nodeName==="string";
    }
};

/**
 * Attach the element to the HTML body
 * @param {DOMElement} element
 */
$A.ns.Util.prototype.attachToDocumentBody = function(element) {
	if (element) {
        var body = document.getElementsByTagName("body")[0];
        body.appendChild(element);
	}
};

$A.ns.Util.prototype.stringEndsWith = function(fullstr, substr) {
	var lastIndex = fullstr.lastIndexOf(substr);
    return (lastIndex !== -1) && (lastIndex + substr.length === fullstr.length);
};

/**
 * Define util.arrayIndexOf based on the availability of array.indexOf.
 *
 * array.indexOf is only available in Javascript 1.6+ (it is missing in IE8 and below).
 *
 * Rather than install our own version and pollute the Array.prototype, we define util.arrayIndexOf
 * here to simply pass through to the native implementation on all but IE8 and below.
 */
if (!!Array.prototype.indexOf) {
    // If we have a native indexOf, then use that.
	$A.ns.Util.prototype.arrayIndexOf = function(array, searchElement /*, fromIndex */) {
        // Grab the relevant arguments.
        var args = Array.prototype.slice.apply(arguments, [1]);
        return Array.prototype.indexOf.apply(array, args);
    };
} else {
    /**
     * Otherwise, we have to implement it ourselves.
     *
     * Adds the indexOf method for JS engines that don't support it, for
     * example, IE. More information on this method can be found at the <a
     * href="https://developer.mozilla.org/index.php?title=en/JavaScript/Reference/Global_Objects/Array/indexOf&revision=33"
     * target="_blank">Mozilla Developer Network</a>.
     *
     * @param {Object}
     *            searchElement The element to locate in the array.
     */
	$A.ns.Util.prototype.arrayIndexOf = function(array, searchElement /*, fromIndex */) {
        /*jslint bitwise: true, useStrict: true */
        "use strict";
        if (array === null) {
            throw new TypeError();
        }
        var t = array;

        // ECMAScript specifies that array indices are 32 bits. This verifies that if we take an
        // array like object, it still behaves according to the spec by truncating the length to a
        // 32 bit integer.
        var len = t.length >>> 0;

        // Grab the relevant arguments.
        var args = Array.prototype.slice.apply(arguments, [ 1 ]);

        if (len === 0) {
            return -1;
        }
        var n = 0;
        if (args.length > 0) {
            n = Number(args[1]);
            if (n != n) { // shortcut for verifying if it's NaN
                n = 0;
            } else if (n !== 0 && n != Infinity && n != -Infinity) {
                n = (n > 0 || -1) * Math.floor(Math.abs(n));
            }
        }
        if (n >= len) {
            return -1;
        }
        for (var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0); k < len; k++) {
            if (k in t && t[k] === searchElement) {
                return k;
            }
        }
        return -1;
    };
}

/**
 * Creates a new function whith bound arguments.
 * @param {Function} method to bind.
 * @param {Any} bound 'this' instance for the new function's scope.
 * @param {Any} var-args of bound parameters.
 * @returns {Function} a new function that invokes the provided function instance with bound arguments.
 */
if (!!Function.prototype.bind) {
    $A.ns.Util.prototype.bind = function(method /*, this, bind arguments*/) {
        var args = Array.prototype.slice.call(arguments, 1);
        return Function.prototype.bind.apply(method, args);
    };
} else {
    $A.ns.Util.prototype.bind = function(method /*, this, bind arguments*/) {
        var args = Array.prototype.slice.call(arguments, 1),
            that = args.shift(),
            util = this instanceof $A.ns.Util ? this : new $A.ns.Util();

        if (!util.isFunction(method)) {
            throw new TypeError("$A.util.bind called on non-function.");
        }

        if (arguments.length === 1) {
            return method;
        }

        return function(/*remaining arguments*/) {
            var remainingArgs = Array.prototype.slice.call(arguments);
            var combined = util.merge([], args, remainingArgs);
            return method.apply(that, combined);
        };
    };
}

/**
 * Returns the map's keys as an array.
 * @param {Object} map to extract keys from.
 * @returns {Array} of key {String}s.
 */
if (!!(Object && Object.keys)) {
    $A.ns.Util.prototype.keys = function(object, excludeFunctions) {
    	var allKeys = Object.keys(object);
    	var keys = [];
    	for (var n = 0; n < allKeys.length; n++) {
    		var key = allKeys[n];
    		if (!excludeFunctions || typeof (object[key]) !== "function") {
    			keys.push(key);
    		}
    	}
    	
    	return keys;
    };
} else {
    $A.ns.Util.prototype.keys = function(object, excludeFunctions) {
        var util = this instanceof $A.ns.Util ? this : new $A.ns.Util();

        var isAnyObjectType = !util.isObject(object)
            && !util.isFunction(object)
            && !util.isArray(object);

        if (isAnyObjectType) {
            throw new TypeError("$A.util.keys called on non-object.");
        }

        var keys = [], key;
        for (key in object) {
            if (Object.prototype.hasOwnProperty.call(object, key) && (!excludeFunctions || typeof (object[key]) !== "function")) {
                keys.push(key);
            }
        }
        return keys;
    };
}

/**
 * Performs a series of 'safe' sequential lookup of nested properies.
 * 
 * Example: a safe lookup for "VALUE" in: object: {
 *    first: {
 *       second: [
 *           "VALUE"
 *       ]
 *    }
 * }
 * 
 * Can be done via: $A.util.lookup(object, "first", "second", 0); 
 * Instead of: object && object.first && object.first.second && object.first.second[0]
 * 
 * @param {Object} root object or array to sequentially lookup properties from.
 * @param {String} var-args of string property names. 
 * @return {Any} the looked-up property or undefined if any properties along the way were not found.
 */
$A.ns.Util.prototype.lookup = function(object /*, var-args of arrays*/) {
    var properties = Array.prototype.slice.call(arguments, 1),
        util = this instanceof $A.ns.Util ? this : new $A.ns.Util();
    
    return util.reduce(properties, function(current, property) {
        return current && current[property];
    }, object);  
};


/**
 * Does an in-place merge of any number of array into the first.
 * @param {Array} array to receive the elements of subsequent arrays.
 * @param {Array} var-args of arrays that will have their elements copied into the first.
 * @returns {Array} the first array (which has been modified in-place).
 */
$A.ns.Util.prototype.merge = function(first /*, var-args of arrays*/) {
    var arrays = Array.prototype.slice.call(arguments, 1),
        util = this instanceof $A.ns.Util ? this : new $A.ns.Util();

    if (!arrays) {
        return first;
    }

    if (!util.isArray(first)) {
        throw "Merge takes only arrays as arguments.";
    }

    util.forEach(arrays, function(array) {
        if (!util.isArray(array)) {
            throw "Merge takes only arrays as arguments.";
        }
    });

    util.forEach(arrays, function(array) {
        util.forEach(array, function(element) {
            first.push(element);
        });
    });

    return first;
};

/** forEach: see documentation below (attached to last definition so that it is picked up for doc generation). */
if (!!Array.prototype.forEach) {
    $A.ns.Util.prototype.forEach = function(array, method, that) {
        array.forEach(method, that);
    };
} else {
    /**
     * Runs a function over each element in an array.
     * @param {Array} array to loop over.
     * @param {Function} method to call for each element.
     * @param {Any} the 'this' instance inside the scope of provided method.
     */
    $A.ns.Util.prototype.forEach = function(array, method, that) {
        var util = this instanceof $A.ns.Util ? this : new $A.ns.Util();

        if (!util.isArray(array)) {
            throw new TypeError("$A.util.forEach called on non-array.");
        }

        if (!util.isFunction(method)) {
            throw new TypeError("$A.util.forEach called with non-function callback.");
        }

        var index;
        for (index = 0; index < array.length; index++) {
            method.call(that, array[index], index);
        }
    };
}

/** map: see documentation below (attached to last definition so that it is picked up for doc generation). */
if (!!Array.prototype.map) {
    $A.ns.Util.prototype.map = function(array, method, that) {
        return array.map(method, that);
    };
} else {
    /**
     * Returns an array containing the return value of the provided function over every element of the input array.
     * @param {Array} array to loop over.
     * @param {Function} tranforms an element from the input array to an element in the output array.
     * @param {Any} the 'this' instance inside the scope of provided transformation method.
     * @returns {Array} where every element is a result of the transformation function
     * applied to the element (at the same index) from the input array.
     */
    $A.ns.Util.prototype.map = function(array, method, that) {
        var util = this instanceof $A.ns.Util ? this : new $A.ns.Util();

        if (!util.isArray(array)) {
            throw new TypeError("$A.util.map called on non-array.");
        }

        if (!util.isFunction(method)) {
            throw new TypeError("$A.util.map called with non-function callback.");
        }

        var index, result = [];
        for (index = 0; index < array.length; index++) {
            result.push(method.call(that, array[index], index));
        }
        return result;
    };
}

/** reduce: see documentation below (attached to last definition so that it is picked up for doc generation). */
if (!!Array.prototype.reduce) {
    $A.ns.Util.prototype.reduce = function(array, method, initial) {
        return array.reduce(method, initial);
    };
} else {
    /**
     * Loops over an array, calling a function that provides the returned result of calling the function on the 
     * previous element.  
     * @param {Array} array to loop over.
     * @param {Function} reduction method that takes the resturned result from the previous call, the current element from 
     * the input array and index. 
     * @param {Any} the initial object passed to the first element in the array's reduction method.
     * @returns {Any} the final value returned from calling the reduction method on the last element.
     */
    $A.ns.Util.prototype.reduce = function(array, method, initial) {
        var util = this instanceof $A.ns.Util ? this : new $A.ns.Util();

        if (!util.isArray(array)) {
            throw new TypeError("$A.util.reduce called on non-array.");
        }

        if (!util.isFunction(method)) {
            throw new TypeError("$A.util.reduce called with non-function callback.");
        }

        var index, result = initial;
        for (index = 0; index < array.length; index++) {
            result = method.call(this, result, array[index], index);
        }
        return result;
    };
}

/** every: see documentation below (attached to last definition so that it is picked up for doc generation). */
if (!!Array.prototype.every) {
    $A.ns.Util.prototype.every = function(array, predicate, that) {
        return array.every(predicate, that);
    };
} else {
    /**
     * Loops over an array, calling a function that returns some boolean. Returns true if all calls return a truthy result.
     * @param {Array} array to loop over.
     * @param {Function} predicate that returns a boolean result based on the current array element.
     * @param {Any} the 'this' instance inside the scope of provided transformation method.
     * @returns {Boolean} true if all elements of the array satisfy the predicate.
     */
    $A.ns.Util.prototype.every = function(array, predicate, that) {
        var util = this instanceof $A.ns.Util ? this : new $A.ns.Util();

        if (!util.isArray(array)) {
            throw new TypeError("$A.util.every called on non-array.");
        }

        if (!util.isFunction(predicate)) {
            throw new TypeError("$A.util.every called with non-function predicate.");
        }

        var index;
        for (index = 0; index < array.length; index++) {
            if(!predicate.call(that, array[index], index)) {
                return false;
            }
        }
        return true;
    };
}

/** some: see documentation below (attached to last definition so that it is picked up for doc generation). */
if (!!Array.prototype.some) {
    $A.ns.Util.prototype.some = function(array, predicate, that) {
        return array.some(predicate, that);
    };
} else {
    /**
     * Loops over an array, calling a function that returns some boolean. Returns true if any calls return a truthy result.
     * @param {Array} array to loop over.
     * @param {Function} predicate that returns a boolean result based on the current array element.
     * @param {Any} the 'this' instance inside the scope of provided transformation method.
     * @returns {Boolean} true if any of the elements of the array satisfy the predicate.
     */
    $A.ns.Util.prototype.some = function(array, predicate, that) {
        var util = this instanceof $A.ns.Util ? this : new $A.ns.Util();

        if (!util.isArray(array)) {
            throw new TypeError("$A.util.some called on non-array.");
        }

        if (!util.isFunction(predicate)) {
            throw new TypeError("$A.util.some called with non-function predicate.");
        }

        var index;
        for (index = 0; index < array.length; index++) {
            if(predicate.call(that, array[index], index)) {
                return true;
            }
        }
        return false;
    };
}

/** filter: see documentation below (attached to last definition so that it is picked up for doc generation). */
if (!!Array.prototype.filter) {
    $A.ns.Util.prototype.filter = function(array, predicate, that) {
        return array.filter(predicate, that);
    };
} else {
    /**
     * Loops over an array, constructing a new array with the elements that pass the filter predicate.
     * @param {Function} predicate that returns a boolean result based on the current array element the result of which
     *                   indicates whether the element will be returned in the filter result array.
     * @param {Any} the 'this' instance inside the scope of provided predicate.
     * @returns {Array} ordered array of elements that pass the predicate.
     */
    $A.ns.Util.prototype.filter = function(array, predicate, that) {
        var util = this instanceof $A.ns.Util ? this : new $A.ns.Util();

        if (!util.isArray(array)) {
            throw new TypeError("$A.util.filter called on non-array.");
        }

        if (!util.isFunction(predicate)) {
            throw new TypeError("$A.util.filter called with non-function predicate.");
        }

        var index, result = [];
        for (index = 0; index < array.length; index++) {
            if(predicate.call(that, array[index], index)) {
                result.push(array[index]);
            }
        }
        return result;
    };
}
/**
 * Schedules the specified component to be asynchronously destroyed.
 * @param {Component} cmp
 *          The component to be destroyed.
 * @private
 */
$A.ns.Util.prototype.destroyAsync = function(cmp) {
    if (this.componentGCProcessing) {
        // We're in the middle of emptying the component trash and something just async to destroy another
        // component async so finish the destroy now
        if (cmp && cmp.finishDestroy) {
            cmp.finishDestroy();
        }
    } else {
        this.trashedComponentQueue.push(cmp);

        if (!this.componentGCPending) {
            this.componentGCPending = true;

            // Async when not testing to not confuse component stats verification tests
            var that = this;
            setTimeout(function() {
                try {
                   that.componentGCProcessing = true;

                    that.emptyComponentTrash();
                } finally {
                    that.componentGCProcessing = false;
                }
            }, 3000);
        }
    }
};

/**
 * Declares a "child" type to be derived from a "parent" type.  This replicates
 * the parent prototype entry into the child prototype (i.e. method
 * inheritance), and sets a "superclass" attribute used by Util.instanceOf.
 *
 * Call this after declaring the child constructor function, but before setting
 * child methods onto the prototype, so that the child methods can override the
 * inherited ones.
 *
 * @private
 */
$A.ns.Util.derivePrototype = function(child, parent) {
    for (var method in parent.prototype) {
        if (method !== "constructor") {
            child.prototype[method] = parent.prototype[method];
        }
    }
    child.prototype.superclass = parent.prototype;
};

/**
 * Returns whether "instance" is, directly or indirectly, an instance of
 * "constructor."  An object is indirectly an instance if derivePrototypeFrom was
 * used to make the child type derive from the parent type.
 *
 * JavaScript's instanceof operator is not used as it doesn't understand
 * type inheritance. Using this method would avoid the need for child.prototype to be
 * an instance of parent; we also avoid having "unbound" instances.
 *
 * @param instance The object to test
 * @param constructor  The object to test against
 * @returns {Boolean} Returns true if instance is an instance of constructor.
 */
$A.ns.Util.prototype.instanceOf = function(instance, constructor) {
    if (instance === null || instance === undefined || constructor === null || constructor === undefined) {
        return false;
    }
    if (instance instanceof constructor) {
        return true;
    }
    if (instance.superclass) {
        var superCtor = instance.superclass.constructor;
        while (superCtor) {
            if (superCtor === constructor) {
                return true;
            }
            superCtor = superCtor.superclass ? superCtor.constructor : undefined;
        }
    }
    return false;
};

/**
 * Destroys any components currently in the trashcan.
 * @private
 */
$A.ns.Util.prototype.emptyComponentTrash = function() {
    var length = this.trashedComponentQueue.length;
    if (length > 0) {
        for (var i = 0; i < length; i++){
            var cmp = this.trashedComponentQueue[i];
            if (cmp && cmp.finishDestroy) {
            	cmp.finishDestroy();
            }
        }

        this.trashedComponentQueue = [];
    }

    this.componentGCPending = false;
};

/**
 * Determines if an element is either a descendant of, or the same as, another element in the DOM tree.
 * Both arguments to this function must be of type HTMLElement.
 *
 * @param {HTMLElement} container The element you think is the outermost container.
 * @param {HTMLElement} element The element you think is buried inside the container.
 * @returns {Boolean} Returns true if 'element' is indeed inside 'container', false otherwise.
 */
$A.ns.Util.prototype.contains = function(container, element) {
    if ($A.util.isElement(container) && $A.util.isElement(element)) {
        if (container === element) {
            return true;
        }
        while(element.parentNode) {
            if (element.parentNode === container) {
                return true;
            }
            element = element.parentNode;
        }
    } else {
        $A.assert(false, "Both arguments for this function must be HTMLElement objects.");
    }
    return false;
};


/**
 * Simple event squasher.

 * @param {UIEvent} event the DOM event to squash
 * @param {Boolean} preventDefault if preventDefault() should also be called
 */
$A.ns.Util.prototype.squash = function(event, preventDefault) {
    event = event || window.event;
    if(event.stopPropagation) {
    	event.stopPropagation();
	}
    event.cancelBubble = true;

    if (preventDefault) {
        if(event.preventDefault) {
        	event.preventDefault();
		}
		event.returnValue = false;
    }
};

/**
 * Strip off html tags from html codes.

 * @param {String} input the input html codes
 * @param {Array} tags the html tag names to be removed
 * @return {String} an output string without those specified tags
 */
$A.ns.Util.prototype.stripTags = function(input, tags) {
    if (this.isUndefinedOrNull(input) || this.isEmpty(input)) {
        return;
    }
    var div = document.createElement('div');
    div.innerHTML = input;
    if (!this.isArray(tags)) {
        tags = [tags];
    }
    for (var j = 0; j < tags.length; j++) {
        var elems = div.getElementsByTagName(tags[j]);
        var i = elems.length;
        while (i--) {
            elems[i].parentNode.removeChild(elems[i]);
        }
    }
    var result = div.innerHTML;
    this.removeElement(div);
    return result;
};


/**
 * Simple function to get client viewport dimensions. If neither window.innerWidth
 * nor document.body.clientWidth is supported by the client, returns "0" for
 * both width and height.
 *
 * @return {Object} JS object with the fields "width" and "height"
 */
$A.ns.Util.prototype.getWindowSize = function() {
    return {
        width : window.innerWidth || document.body.clientWidth || 0,
        height : window.innerHeight || document.body.clientHeight || 0
    };
};

/**
 * Checks if the object is an aura component via auraType property.
 *
 * @param {Object} obj The object to check for.
 * @returns {Boolean} True if the object type is a component, or return false otherwise.
 */
$A.ns.Util.prototype.isComponent = function(obj) {
    return (obj && obj.auraType === 'Component')||false;
};

/**
 * Checks if the object is an aura value expression.
 *
 * @param {Object} obj The object to check for.
 * @returns {Boolean} True if the object type is an expression, or false otherwise.
 */
$A.ns.Util.prototype.isExpression = function (obj) {
    return obj&&this.isFunction(obj.isExpression)&&obj.isExpression();
};

/**
 * Checks if the object is an aura value object via auraType property.
 *
 * @param {Object} obj The object to check for.
 * @returns {Boolean} True if the object type is a component, or return false otherwise.
 */
$A.ns.Util.prototype.isValue = function(obj) {
    return (obj && obj.auraType === 'Value')||false;
};

/**
 * Checks if touch events are supported. Cache the result, it shouldn't change.
 *
 * @returns {Boolean} True if touch events are supported.
 */
$A.ns.Util.prototype.supportsTouchEvents = function() {

    /*
    * NOTE:
    * There is no perfect way to detect wether the browser supports touch events or not.
    * Nice summary here: http://www.stucox.com/blog/you-cant-detect-a-touchscreen
    * But we can get close to it for our use cases making some assumptions.
    */

    if ($A.util.isUndefined(this.supportsTouchEvents.cache)) {
        this.supportsTouchEvents.cache = (

            // If we are on some sort of NON-DESKTOP device, we check wether it supports 'ontouchstart'
            // We do this because Chrome, IE and firefox will give false positives when checking this properties
            (($A.get('$Browser.formFactor') !== 'DESKTOP' || $A.get('$Browser.isIOS') || $A.get('$Browser.isAndroid')) && 'ontouchstart' in window)

            // IE  will also give false positives, so we make sure that only enable pointer events when is a windowsPhone
            || ($A.get('$Browser.isWindowsPhone') && (window["navigator"]["pointerEnabled"] ||  window["navigator"]["msPointerEnabled"]))
            || window["navigator"]["msMaxTouchPoints"] > 0 
            || window["navigator"]["maxTouchPoints"] > 0)

            // Aura internal testing
            && ($A.getContext().getMode() !== 'PTEST')
            && ($A.getContext().getMode() !== 'CADENCE')
            && ($A.getContext().getMode() !== 'SELENIUM')
            && ($A.getContext().getMode() !== 'STATS')
            && ($A.getContext().getMode() !== 'SELENIUMDEBUG');
    }
    return this.supportsTouchEvents.cache;
};

/**
 * Estimate the amount of space that will be utilized by an object or primitive.
 *
 * @param {Object} item The object or primitive whose size to estimate.
 */
$A.ns.Util.prototype.estimateSize = function(obj) {
    return this.sizeEstimator.estimateSize(obj);
};


/**
 * Convert collection to a true array.
 * When dealing with a NodeList, sometimes you'll need it to actually be an array to properly deal with it.
 * Cannot always use Array.prototype.slice.call(), since it doesn't work in IE6/7/8 on NodeLists.
 * @returns An empty array if you pass a null or undefined value to collection.
 */
$A.ns.Util.prototype.toArray = function(collection) {
    if(this.isUndefinedOrNull(collection)) {
        return [];
    }

    try {
        // Done in a Try/Catch as calling this on a NodeList in IE6/7/8 throws an exception
        return Array.prototype.slice.call(collection);
    } catch(e) {
        // Try to just convert the collection to a normal array using a good ole for loop.
        var length = collection.length;
        var newCollection = new Array(length);
        for(var c=0;c<length;c++){
            newCollection[c] = collection[c];
        }
        return newCollection;
    }
};

//#if {"excludeModes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
	/**
	 * Gets the aura debug tool component whether in an iframe or not.
	 * @returns {Object} The debug tool component.
	 */
	$A.ns.Util.prototype.getDebugToolComponent = function(){
		if (!this.isUndefinedOrNull(this.debugToolWindow)) {
			var debugElem = this.debugToolWindow.document.getElementById('__aura_debug_tool');
			if (!this.isUndefinedOrNull(debugElem)) {
				return this.debugToolWindow["aura"].componentService.getAttributeProviderForElement(debugElem);
			}
		}
	};

	/**
	 * Gets the aura instance of debug tool which has been opened in a child window
	 *
	 * @returns {Object} Aura instance
	 */
	$A.ns.Util.prototype.getDebugToolsAuraInstance = function(){
		if (!this.isUndefinedOrNull(this.debugToolWindow)) {
			return this.debugToolWindow["aura"];
		} else {
			return $A;
		}
	};

	/**
	 * Set the aura debug tool handle when opened in a popup.
	 */
	$A.ns.Util.prototype.setDebugToolWindow = function(debugWindow){
		if (!this.isUndefinedOrNull(debugWindow)) {
			this.debugToolWindow = debugWindow;
		}
	};

	/**
	 * Grab windows url, if debug tool is a child window get url of parent
	 *
	 * @returns {String} URL of the window
	 */
	$A.ns.Util.prototype.getUrl = function(){
	    if (this.isUndefinedOrNull(opener)) {
			return window.location.href;
		} else {
			return opener.location.href;
		}
	};

	/**
	 * Get the text content of a DOM node. Tries <code>innerText</code> followed by
	 * <code>textContext</code>, followed by <code>nodeValue</code> to take browser differences into account.
	 * @param {Node} node
	 *             The node to get the text content from
	 * @returns {String} The text content of the DOM node
	 */
	$A.ns.Util.prototype.getText = function(node) {
	    var t;
	    //text nodes
	    if(node.nodeType === 3){
	    	t = node.nodeValue;
	    } else {
	    	// chrome, safari, IE have this
	        t = node.innerText;
	        t = this.trim(t);

			// FF & chrome with visibility set to false
	        if (node.textContent !== undefined) {
	            if(this.isEmpty(t)){
	                t = node.textContent;
	            }
	        }

	        // if its <style> innerText doesnt work so try cssText (for IE)
	        if (node.tagName === "STYLE" && this.isEmpty(t) && !this.isUndefinedOrNull(node.styleSheet)) {
	        	t = node.styleSheet.cssText;
	        }
	    }
	    return t;
	};

	$A.ns.Util.prototype.errorBasedOnMode = function(msg) {
		$A.error(msg);
	};

	$A.ns.Util.prototype.includeScript = function(url, callback) {
        if (this.isUndefined(this.includeScript.cache)) {
        	this.includeScript.cache = {};
        }

        var cache = this.includeScript.cache;

        var script = cache[url];

        if (script) {
        	if (script.state == "LOADED") {
        		callback.call();
        	} else {
        		script.queue.push(callback);
        	}
        } else {
        	cache[url] = { state: "LOADING", queue: [callback] };

			var s = document.createElement("script");
			s.src = url;
			s.onload = function() {
				cache[url].state = "LOADED";
				var queue = cache[url].queue;
				while(queue.length > 0) {
					queue.shift().call();
				}
			}

			document.head.appendChild( s ).parentNode.removeChild( s );
        }
	};
//#end

//#include aura.storage.adapters.SizeEstimator
//#include aura.util.Util_export
