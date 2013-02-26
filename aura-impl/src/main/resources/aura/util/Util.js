/*
 * Copyright (C) 2012 salesforce.com, inc.
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
 * @namespace The top-level namespace/object for all SFDC Util code.
 * Util methods provide utility functions for browsers in addition to
 * functions for retrieving, manipulating, or checking DOM elements.
 * @constructor
 */
function Util(){
    this.trashcan = document.createDocumentFragment();
    this.trash = [];
    this.json = new Json();
    this["json"] = this.json;
    this.transport = new Transport();
    this["transport"] = this.transport;
    this.transport["request"] = this.transport.request;
    this.style = new Style();
    this["style"] = this.style;
    this["Bitset"] = Bitset;
    this.objToString = Object.prototype.toString;
    this.trashedComponentQueue = [];
}

/**
 * Browser check, does the validation using the userAgent.
 */
Util.prototype.isIE = navigator.userAgent.indexOf("MSIE") != -1;

/**
 * evals code globally, without enclosing the current scope
 */
Util.prototype.globalEval = Util.prototype.isIE ? function(src) {
    // use assignment to variable so that the newlines in src are not actually treated as the end of the line
    return new Function("var a = " + src + "; return a;")();
} : function(src) {
    // normal indirect eval call
    return window.eval("false||" + src);
};

/**
 * Checks whether the specified object is an array.
 * @param {Object} obj The object to check for.
 * @returns {Boolean} True if the object is an array, or false otherwise.
 */
Util.prototype.isArray = typeof Array.isArray === "function" ? Array.isArray : function(obj) {
    return !!obj && this.objToString.apply(obj) === '[object Array]';
};

/**
 * Checks whether the specified object is a valid object.
 * A valid object: Is not a DOM element, is not a native browser class (XMLHttpRequest)
 * is not falsey, and is not an array, error, function string or number.
 * @param {Object} obj The object to check for.
 * @returns {Boolean} True if the object is a valid object, or false otherwise.
 */
Util.prototype.isObject = function(obj){
    return typeof obj === "object" && obj !== null && !this.isArray(obj);
};

/**
 * Checks whether the specified object is a valid error.
 * A valid error: Is not a DOM element, native browser class (XMLHttpRequest), falsey,
 * array, function string or number.
 * @param {Object} obj The object to check for.
 * @returns {Boolean} True if the object is a valid error, or false otherwise.
 */
Util.prototype.isError = function(obj){
    return !!obj && this.objToString.apply(obj) === '[object Error]';
};

/**
 * Checks whether the specified object is a valid function.
 * A valid function: Is not a DOM element, native browser class (XMLHttpRequest), falsey,
 * array, error, or number.
 * @param {Object} obj The object to check for.
 * @returns {Boolean} True if the object is a valid function, or false otherwise.
 */
Util.prototype.isFunction = function(obj){
    return !!obj && this.objToString.apply(obj) === '[object Function]';
};

/**
 * Checks if the object is of type string.
 * @param {Object} obj The object to check for.
 * @returns {Boolean} True if the object is of type string, or false otherwise.
 */
Util.prototype.isString = function(obj){
    return typeof obj === 'string';
};

/**
 * Checks if the object is of type number.
 * @param {Object} obj The object to check for.
 * @returns {Boolean} True if the object is of type number, or false otherwise.
 */
Util.prototype.isNumber = function(obj){
    return typeof obj === 'number';
};

/**
 * Checks if the object is of type boolean.
 * @param {Object} obj The object to check for.
 * @returns {Boolean} True if the object is of type boolean, or false otherwise.
 */
Util.prototype.isBoolean = function(obj){
    return typeof obj === 'boolean';
};

/**
 * Checks if the object is undefined.
 * @param {Object} obj The object to check for.
 * @returns {Boolean} True if the object type is undefined, or false otherwise.
 */
Util.prototype.isUndefined = function(obj){
    return obj === undefined;
};

/**
 * Checks if the object is undefined or null.
 * @param {Object} obj The object to check for.
 * @returns {Boolean} True if the object type is undefined or null, or return false otherwise.
 */
Util.prototype.isUndefinedOrNull = function(obj){
    return obj === undefined || obj === null;
};

/**
 * Checks if the object is empty.
 * An empty object's value is undefined, null, an empty array, or empty string. An object with no native
 * properties is not considered empty at this time.
 * @param {Object} obj The object to check for.
 * @returns {Boolean} True if the object is empty, or false otherwise.
 */
Util.prototype.isEmpty = function(obj){
    return this.isUndefinedOrNull(obj) || (this.isArray(obj) && obj.length === 0) || obj === '';
};

/**
 * Gets a DOM element by its id without any leading characters (e.g. #) unless the ID contains them.
 * @param {String} id The corresponding id of the DOM element.
 * @returns {Object} The element with the matching id, or null if none is found.
 */
Util.prototype.getElement = function(id){
    return document.getElementById(id);
};


/**
 * Checks whether the element has the specified class.
 * @param {Object} element The element to check for.
 * @param {String} clz The CSS class name to check for.
 * @returns {Boolean} True if the specified class is found for the element, or false otherwise.
 */
Util.prototype.hasClass = function(element, clz){
    if(element){
        var cn = element["className"] || '';
        var split = cn.split(' ');
        for (var i = 0; i < split.length; i++) {
            if (split[i] === clz) {
                return true;
            }
        }
    }
    return false;
};

/**
 * Adds the specified class to the element, depending on whether it already existed on that element.
 * @param {Object} element The element to apply the class on.
 * @param {String} clz The CSS class to be applied on the element.
 *
 */
Util.prototype.addClass = function(element, clz){
    if(element && element.tagName){
        if (clz) {
            clz = this.trim(clz);
            var oldClz = element["className"] || "";
            oldClz = this.trim(oldClz);
            if (oldClz) {
                if ((' ' + oldClz + ' ').indexOf(' ' + clz + ' ') == -1) {
                    element["className"] = oldClz + ' ' + clz;
                }
            } else {

                    element["className"] = clz;

            }
        }
    }
};

/**
 * Removes the class from an element.
 * @param {Object} element The element to remove the class from.
 * @param {String} clz The CSS class to be removed from the element.
 */
Util.prototype.removeClass = function(element, clz){
    if(!element){
        return;
    }
    var cn = element["className"] || '';
    var split = cn.split(' ');
    var newClass = [];
    var found = false;
    for (var i = 0; i < split.length; i++) {
        var c = split[i];
        if (c === clz) {
            found = true;
        } else {
            newClass.push(c);
        }
    }
    if (found) {
        element["className"] = newClass.join(' ');
    }
};

/**
 * Adds a class or removes it from an element.
 * @param {Object} element The element to add or remove the class from.
 * @param {String} clz The CSS class to be added or removed from the class.
 */
Util.prototype.toggleClass = function(element, clz){
    if(this.hasClass(element, clz)){
        this.removeClass(element, clz);
        return false;
    }else{
        this.addClass(element,clz);
        return true;
    }
};

/**
 * Swaps an element's class by removing the selected class and adding another in its place.
 * @param {Object} element The element to be processed.
 * @param {String} clz1 The class to remove from the element.
 * @param {String} clz2 The class to add to the element.
 */
Util.prototype.swapClass = function(element, clz1, clz2){
    clz1 = this.isArray(clz1)?clz1:[clz1];
    clz2 = this.isArray(clz2)?clz2:[clz2];
    for(var i=0;i<clz1.length;i++){
        this.removeClass(element, clz1[i]);
    }
    for(i=0;i<clz2.length;i++){
        this.addClass(element, clz2[i]);
    }
};

/**
 * Inserts element(s) as the first child of the parent element.
 * @param {Object} parent The parent element
 * @param {Array|Object} child The child element to insert as the first child in the parent element.
 */
Util.prototype.insertFirst = function(parent, child){
    if (this.isArray(child)) {
        for (var i = child.length - 1; i >= 0; i--) {
            this.insertFirst(parent, child[i]);
        }
        return;
    }
    var firstChild = parent.firstChild;
    if (firstChild) {
        parent.insertBefore(child, firstChild);
    }
    else {
        parent.appendChild(child);
    }
};

/**
 * Inserts a new element, newEl, directly before the reference element, referenceEl.
 * If the reference element is a parent node, insert the new element directly before the parent node.
 * @param {Object} newE1 The new element to insert.
 * @param {Object} referenceE1 The reference element
 * @returns {Object} The element that was inserted.
 */
Util.prototype.insertBefore = function(newEl, referenceEl) {
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
 * @param {Object} newE1 The new element to insert.
 * @param {Object} referenceE1 The reference element
 * @returns {Object} The element that was inserted.
 */
Util.prototype.insertAfter = function(newEl, referenceEl) {
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
 * @param {Object} newE1 The element to append as a child of the reference element.
 * @param {Object} referenceE1 The existing element
 * @returns {Object} The new element that was added
 */
Util.prototype.appendChild = function(newEl, referenceEl) {
    if (referenceEl.canHaveChildren===false){
        return;
    }
    if (this.isArray(newEl)) {
        var frag = document.createDocumentFragment();
        var len = newEl.length;
        for(var i=0;i<len;i++){
            frag.appendChild(newEl[i]);
        }
        newEl = frag;

    }

    referenceEl.appendChild(newEl);
};

/**
 * Removes the specified element from the DOM.
 *
 * Careful that there be dragons here. Since we hijack the normal delete
 * functionality, we need to be careful of odd event processing. Specifically
 * we end up sending off some events that would not otherwise be sent.
 *
 * Also note that we currently remove nodes children first, which means we
 * deconstruct our tree from the bottom up. If we reverse this, we might be
 * able to add optimizations.
 *
 * @param {Object} element The element to be removed.
 */
Util.prototype.removeElement = function(element) {
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
        	if (element.nodeType !== 3) {
	            aura.assert(this.isUndefined(element["aura_deleted"]), "Element was reused after delete");
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
                    
                    if (node.nodeType !== 3) {
                    	delete node["aura_deleted"];
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
 * @param {String} url The URL string to be decoded.
 * @returns {Object} The decoded URL.
 */
Util.prototype.urlDecode = function(url){
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
 * @param {String} st The string to be trimmed.
 * @returns {String}
 */
Util.prototype.trim = function(st){
    return (st || "").replace(/^\s+|\s+$/g, '');
};

/**
 * Truncates a string to the given length.
 * @param {String} st The string to be truncated.
 * @param {Number} len The length of characters. Includes the ellipsis if ellipsis is set to true.
 * @param {Boolean} ellipsis If set to true, an ellipsis is added to the truncated string.
 * @param {Boolean} truncateByWord If set to true, checks that no truncation occurs in the middle of a word.
 * @returns {String} The truncated string.
 */
Util.prototype.truncate = function(st, len, ellipsis, truncateByWord){
    ellipsis = !!ellipsis;
    truncateByWord = !!truncateByWord;

    if (!st || !len) {
        return "";
    }

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
 * @param {Function}
 *            callback The function to be run once the tolerance period has
 *            passed.
 * @param {Number}
 *            toleranceMillis The tolerance duration in milliseconds.
 * @returns {Function} The function to invoke in order to trigger a start/reset
 *          of the tolerance period.
 */
Util.prototype.createTimeoutCallback = function(callback, toleranceMillis) {
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
 * Adds an event listener for the named type of event on the given element.
 */
Util.prototype.on = (function() {
    if (window["addEventListener"]) {
        return function(element, eventName, handler, useCapture, timeout) {
            if (timeout) {
                handler = $A.util.createTimeoutCallback(handler, timeout);
            }

            if(element){
                element["addEventListener"](eventName, handler, useCapture);
            }
        };
    }
    if(window["attachEvent"]) {
        var preventDefault=function(){
            this.returnValue=false;
        };
        var stopPropagation=function(){
            this.cancelBubble=true;
        };
        return function(element, eventName, handler, useCapture, timeout) {
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

            if(element){
                element["attachEvent"]('on' + eventName, newHandler, false);
            }
        };
    }
    return null;
})();

/**
 * Stores the values of a form to a Map object. Values from a checkbox, radio, drop-down list, and textarea
 * are stored in the Map.
 * @param {Object} form
 * @returns {Object} The map containing the values from the form input.
 */
Util.prototype.formToMap = function(form) {
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
 * @param {Object} select
 * @returns {Object} A list of selected options.
 */
Util.prototype.getSelectValue = function(select) {

    if (select.options.length === 0) {
        return null;
    }
    if (!select.multiple) {
        return select.options[select.selectedIndex].value;
    }
    else {
        var list = [];
        var first = true;
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
 * @param {Object} inputMap The input map to be processed.
 * @param {String} key The data key whose value is to be added to the input map.
 * @param {Object} value The value of the data to add to the input map.
 */
Util.prototype.addValueToMap = function(inputMap, key, value) {

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
 * @param {Object} inputMap The input map to be processed.
 * @param {String} key The data key whose value is to be added to the input map.
 * @param {Object} value The value of the data to add to the input map.
 * @param {String} subMapKey
 */

Util.prototype.addMapValueToMap = function(inputMap, key, value, subMapKey) {
    var subMap = inputMap[key];
    if (!subMap) {
        subMap = {};
        inputMap[key] = subMap;
    }
    subMap[subMapKey] = value;
};

Util.prototype.isSubDef = function(def, qname) {
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
 * @description
 * Takes the methods, and properties from one object and assigns them to another.
 * Returns the base object with the members from the child object.
 * This is commonly used to apply a set of configurations to a default set, to get a single set of configuration properties.
 * @example
 *  util.apply(Child.prototype, Parent); // Returns a new object inheriting all the methods and properties from Parent.
 *  util.apply(Child.prototype, { isCool: true }); // Parent would then have a property of child.
 *  util.apply({ foo: 'bar', diameter: 10}, { diameter: 20, bat: 'man' }, true); //== {foo:'bar', diameter: 20, bat: 'man'}
 *  util.apply({ foo: 'bar', diameter: 10}, { diameter: 20, bat: 'man' }, false); //== {foo:'bar', diameter: 10, bat: 'man'}
 * @param {Object|Function} baseObject The object that will receive the methods, and properties.
 * @param {Object|Function} members The methods and properties to assign to the baseObject.
 * @param {Boolean} [forceCopy] If the property already exists, should we still copy the member? false by default
 */
Util.prototype.apply = function(/* Object|Function */ baseObject, /* Object|Function*/ members, /* bool */ forceCopy) {
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
        }
    }
    return baseObject;
};

/**
 * Converts camelCase to hyphens.
 * @param {String} str The string to be converted.
 * @returns {String} The string containing hyphens that replaces the camelCase.
 */

Util.prototype.CAMEL_CASE_TO_HYPHENS_REGEX = /([A-Z])/g;

Util.prototype.camelCaseToHyphens = function(str) {
    return str.replace(this.CAMEL_CASE_TO_HYPHENS_REGEX, "-$1").toLowerCase();
};

/**
 * Converts hyphens to camelCase.
 * @param {String} str The string to be converted.
 * @returns {String} The string in camelCase.
 */
Util.prototype.hyphensToCamelCase = function(str) {
    function hyphensToCamelCaseHelper(s, group) {
        return group.toUpperCase();
    }

    return str.replace(/-([a-z])/gi, hyphensToCamelCaseHelper);
};


/**
 * @description
 * A map of nodeNames that cannot accept custom data attributes.
 */
Util.prototype.noData = {
    "embed": true,
    "object": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000", // flash
    "applet": true,
    "#text": true
};

/**
 * @description
 * Returns whether a given DOM element can accept custom data attributes.
 * @param {HTMLElement} element The element to check for custom data attribute support.
 * @returns {Boolean} Whether element accepts custom data attributes.
 */
Util.prototype.acceptsData = function(element) {
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
 * @description
 * Returns a custom data attribute value from a DOM element.
 * For more information on custom data attributes, see http://html5doctor.com/html5-custom-data-attributes/
 * @param {HTMLElement} element The element from which to retrieve data.
 * @param {String} key The data key to look up on element.
 */
Util.prototype.getDataAttribute = function(element, key) {
    if (!this.acceptsData(element) || this.isUndefined(key)) {
        return null;
    }

    key = "data-" + this.camelCaseToHyphens(key);

    return element.getAttribute(key);
};

/**
 * @description
 * Sets a custom data attribute value from a DOM element.
 * For more information on custom data attributes, see http://html5doctor.com/html5-custom-data-attributes/
 * @param {HTMLElement} element The element from which to retrieve data.
 * @param {String} key The data key to add to element.
 * @param {String} value The value of the data to add to an element. If value is undefined, the key data attribute will be removed from element.
 */
Util.prototype.setDataAttribute = function(element, key, value) {
    if (!this.acceptsData(element) || this.isUndefined(key)) {
        return null;
    }

    key = "data-" + this.camelCaseToHyphens(key);

    if (!this.isUndefined(value)) {
        return element.setAttribute(key, value);
    } else {
        return element.removeAttribute(key);
    }
};

/**
 * Checks whether a custom data attribute value already exists.
 * @param {HTMLElement} element The element from which to retrieve data.
 * @param {String} key The data key to look up on element.
 * @returns {Boolean}
 */
Util.prototype.hasDataAttribute = function(element, key) {
    return !this.isUndefinedOrNull(this.getDataAttribute(element, key));
};

/**
 * Checks if the object is an HTML element.
 * @param {Object} obj
 * @returns {Boolean} True if the object is an HTMLElement object, or false otherwise.
 */
Util.prototype.isElement = function(obj) {
    if (typeof HTMLElement === "object") {
        return obj instanceof HTMLElement;
    } else {
        return typeof obj === "object" && obj.nodeType === 1 && typeof obj.nodeName==="string";
    }
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
    Util.prototype.arrayIndexOf = function(array, searchElement /*, fromIndex */) {
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
    Util.prototype.arrayIndexOf = function(array, searchElement /*, fromIndex */) {
        /*jslint bitwise: false */
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
        var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
        for (; k < len; k++) {
            if (k in t && t[k] === searchElement) {
                return k;
            }
        }
        return -1;
    };
}

/**
 * Schedules the specified component to be asynchronously destroyed.
 * @param {cmp} element The component to be destroyed.
 */
Util.prototype.destroyAsync = function(cmp) {
    this.trashedComponentQueue.push(cmp);

    if (!this.componentGCPending) {
        this.componentGCPending = true;

        var mode = $A.getContext().getMode();
        if (mode !== "SELENIUM" && mode !== "SELENIUMDEBUG") {
            // Async when not testing to not confuse component stats verification tests
            var that = this;
            setTimeout(function() { that.emptyComponentTrash(); }, 3000);
        } else {
            // Synchronous when not testing
            this.emptyComponentTrash();
        }
    }
};

/**
 * Destroys any components currently in the trashcan.
 * @private
 */
Util.prototype.emptyComponentTrash = function() {
    var length = this.trashedComponentQueue.length;
    if (length > 0) {
        var reaped = [];

        for (var i = 0, len = this.trashedComponentQueue.length; i < len; i++){
            var cmp = this.trashedComponentQueue[i];
            if(cmp && cmp.destroy && cmp.isValid()){
                reaped.push(cmp.getGlobalId());
                cmp.destroy();
            }
        }

        this.trashedComponentQueue = [];
    }

    this.componentGCPending = false;
};


//#include aura.util.Util_export
