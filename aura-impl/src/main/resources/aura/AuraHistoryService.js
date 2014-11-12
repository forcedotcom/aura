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
/*jslint sub: true */
/**
 * @description The Aura History Service, accessible using $A.historyService. Manages Browser History.
 * Internet Explorer 7 and 8 are not supported for this service.
 * @constructor
 */
$A.ns.AuraHistoryService = function() {
    this.history = [];       // tracks url hashes
    this.currentIndex = -1;  // pointer to current hash within history
    this.evt = null;
};

/**
 * Sets the new location. For example, <code>$A.services.history.set("search")</code> sets the location to <code>#search</code>.
 * Otherwise, use <code>$A.services.layout.changeLocation()</code> to override existing URL parameters.
 * 
 * Native Android browser doesn't completely support pushState so we force hash method for it
 * IOS7 UIWebView also has weirdness when using appcache and history so force onhashchange as well
 *
 * @param {Object} token The provided token set to the current location hash
 * @memberOf AuraHistoryService
 * @public
 */
$A.ns.AuraHistoryService.prototype.set = function(token) {
    if (token) {
        // Check for HTML5 window.history.pushState support
        if (this.usePushState()) {
            //
            // Need to pass in the token to the state as
            // windows phone doesn't persist the hash
            // after using the back button.
            //
            window.history.pushState({"hash":token}, null, '#' + token);
            this.changeHandler();
        } else {
            if ($A.util.isIOSWebView()) {
                // roll our own history for IOS UIWebView
                var historyLength = this.history.length;
                if (this.currentIndex < (historyLength - 1)) {
                    // remove forward entries if we moved back and new location is set
                    this.history.splice(this.currentIndex + 1, historyLength - this.currentIndex);
                }
                this.currentIndex++;
                this.history.push(token);
            }
            window.location.hash = "#" + token;
        }
    }
};

/**
 * Parses the location. A token can be used here.
 * <p>Example:</p> 
 * <code>token == "newLayout";<br /> $A.historyService.get().token;</code>
 * 
 * @memberOf AuraHistoryService
 * @public
 */
$A.ns.AuraHistoryService.prototype.get = function() {
    // 
    // Windows phone doesn't save the hash after navigating backwards. 
    // So get it from the history state. 
    //
    var token = location["hash"] || (window.history["state"] && window.history["state"]["hash"]) || "";
    return this.parseLocation(token);
};

/**
 * Loads the previous URL in the history list. Standard JavaScript <code>history.go()</code> method.
 *
 * @memberOf AuraHistoryService
 * @public
 */
$A.ns.AuraHistoryService.prototype.back = function() {
    if (!$A.util.isIOSWebView()) {
        //history -> Standard javascript object
        window.history.go(-1);
    } else {
        // IOS7 UIWebView has issues with appcache and history so
        // keep track of history ourselves and change hash instead
        if (this.currentIndex > 0) {
            // move pointer and get previous hash location
            var hash = this.history[--this.currentIndex];
            window.location.hash = "#" + hash;
        } else {
            // in case pointer has moved passed all history then reset to push new history
            this.reset();
            window.location.hash = "";
        }
    }
};

/**
 * Sets the title of the document.
 * 
 * @param {String} title The new title
 * @memberOf AuraHistoryService
 * @public
 */
$A.ns.AuraHistoryService.prototype.setTitle = function(title) {
    document.title = title;
};

/**
 * Loads the next URL in the history list. Standard JavaScript <code>history.go()</code> method.
 * 
 * @memberOf AuraHistoryService
 * @public
 */
$A.ns.AuraHistoryService.prototype.forward = function() {
    if (!$A.util.isIOSWebView()) {
        //history -> Standard javascript object
        window.history.go(1);
    } else {
        // IOS7 UIWebView has issues with appcache and history so
        // keep track of history ourselves and change hash instead
        var historyLength = this.history.length;
        if (this.currentIndex < (historyLength - 1)) {
            // if there's forward history, go forward one
            window.location.hash = "#" + this.history[++this.currentIndex];
        }
    }
};

/**
 * Resets history
 *
 * @public
 */
$A.ns.AuraHistoryService.prototype.reset = function () {
    this.history = [];
    this.currentIndex = -1;
};

/**
 * Whether to use pushState.
 * Native Android browser has issues with pushState
 * IOS7 UIWebView has issues with pushState and history
 * @returns {boolean} true if pushState should be used
 * @private
 */
$A.ns.AuraHistoryService.prototype.usePushState = function() {
    if (this._usePushState === undefined) {
        var ua = window.navigator.userAgent;
        this._usePushState =
            // browser has pushState
            !!window.history.pushState &&
            // NOT native Android browser
            !(ua.indexOf("Android ") > -1 && ua.indexOf("Mozilla/5.0") > -1 && ua.indexOf("AppleWebKit") > -1 && ua.indexOf("Chrome") == -1) &&
            // NOT IOS7 UIWebView (native app webview)
            !$A.util.isIOSWebView();
    }
    return this._usePushState;
};

/**
 * @private
 */
$A.ns.AuraHistoryService.prototype.init = function() {
    // Check for HTML5 window.history.pushState support
    var that = this;
    if (this.usePushState()) {
        window.addEventListener("popstate", function(e) {
            that.changeHandler();
        });
    } else {
        var hash = location["hash"];

        this.history.push(hash);
        this.currentIndex++;

        // Checks for existence of event, and also ie8 in ie7 mode (misreports existence)
        var docMode = document["documentMode"];
        var hasOnHashChangeEvent = 'onhashchange' in window && (docMode === undefined || docMode > 7);

        if (hasOnHashChangeEvent) {
            window["onhashchange"] = function(){
                that.changeHandler();
            };
        } else {
            var watch = function(){
                setTimeout(function(){
                    var newHash = location["hash"];
                    if (newHash !== hash) {
                        hash = newHash;
                        that.changeHandler();
                    }
                    watch();
                }, 300);
            };
            watch();
        }
    }
    this.changeHandler();
    delete this.init;
};

/**
 * @private
 */
$A.ns.AuraHistoryService.prototype.getEvent = function(){
    if (!this.evt){
        this.evt = $A.getRoot().getDef().getLocationChangeEvent();
    }
    return this.evt;
};

/**
 * @private
 */
$A.ns.AuraHistoryService.prototype.changeHandler = function(){
    var loc = location["hash"] || (history["state"] && history["state"]["hash"]);
    var event = eventService.newEvent(this.getEvent());

    if(!event) {
        throw new Error("The event specified on the app for the locationChange (" + this.getEvent() + ") was not found.");
    }

    if (loc) {
        //
        // Its possible that more querystring parameters where specified in the hash
        // then are defined on the event. In this case do specify them as parameters
        // of the event.
        //
        var parsedHash = this.parseLocation(loc);
        var parameters = {};
        var attributes = event.getDef().getAttributeDefs();
        for(var attribute in attributes) {
            if(attributes["hasOwnProperty"](attribute) && parsedHash["hasOwnProperty"](attribute)) {
                parameters[attribute] = parsedHash[attribute];
            }
        }
        event.setParams(parameters);
    }

    event.fire();
};

/**
 * @private
 */
$A.ns.AuraHistoryService.prototype.parseLocation = function(location) {
    if (location["indexOf"]("#") === 0) {
        location = location["substring"](1);
    }

    if (location["indexOf"]('=') > -1) {
        var split = location["split"]('?');
        if(split.length == 1){
            return { "token": split[0], "querystring": "" };
        }

        if (split.length == 2) {
            var ret = $A.util.urlDecode(split[1]);
            ret["token"] = split[0];
            ret["querystring"] = split[1];
            return ret;
        }

        throw new Error("Invalid location");
    } else {
        return {"token" : location, "querystring": "" };
    }
};

//#include aura.AuraHistoryService_export
