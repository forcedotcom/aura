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
 * @namespace The Aura History Service, accessible using $A.services.history.  Manages Browser History. Internet Explorer 7 and 8 are not supported for this service.
 * @constructor
 */
var AuraHistoryService = function() {

    //#include aura.AuraHistoryService_private

    var historyService = {
        // tracks url hashes
        history: [],
        // pointer to current hash within history
        currentIndex: -1,

        /**
         * Sets the new location. For example, <code>$A.services.history.set("search")</code> sets the location to <code>#search</code>.
         * Otherwise, use <code>$A.services.layout.changeLocation()</code> to override existing URL parameters.
         * 
         * Native Android browser doesn't completely support pushState so we force hash method for it
         * IOS UIWebView also has weirdness when using appcache and history so force onhashchange as well
         *
         * @param {Object} token The provided token set to the current location hash
         * @memberOf AuraHistoryService
         * @public
         */
        set: function(token) {
            if (token) {
                // Check for HTML5 window.history.pushState support
                if (this.usePushState()) {
                    window.history.pushState(null, null, "#" + token);
                    priv.changeHandler();
                } else {
                    if (this.isIOSWebView()) {
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
        },
        
        /**
         * Parses the location. A token can be used here.
         * <p>Example:</p> 
         * <code>token == "newLayout";<br /> $A.historyService.get().token;</code>
         * 
         * @memberOf AuraHistoryService
         * @public
         */
        get : function(){
        	// 
        	// Windows phone doesn't save the hash after navigating backwards. 
        	// So get it from the history state. 
        	//
        	var token = location["hash"] || (window.history["state"] && window.history["state"]["hash"]) || "";
            return priv.parseLocation(token);
        },
        
        /**
         * Loads the previous URL in the history list. Standard JavaScript <code>history.go()</code> method.
         *
         * IOS UIWebView has issues with appcache and history so
         * keep track of history ourselves and change hash instead
         * 
         * @memberOf AuraHistoryService
         * @public
         */
        back: function() {
            if (!this.isIOSWebView()) {
                //history -> Standard javascript object
                window.history.go(-1);
            } else {
                var historyCount = this.history.length;
                if (historyCount > 0 && this.currentIndex > 0) {
                    // move pointer and get previous hash location
                    var hash = this.history[--this.currentIndex];
                    window.location.hash = "#" + hash;
                } else {
                    // in case pointer has moved passed all history then just start over
                    this.currentIndex = -1;
                    window.location.hash = "";
                }
            }
        },
        
        /**
         * Sets the title of the document.
         * 
         * @param {String} title The new title
         * @memberOf AuraHistoryService
         * @public
         */
        setTitle: function(title) {
              document.title = title;
        },
        
        /**
         * Loads the next URL in the history list. Standard JavaScript <code>history.go()</code> method.
         *
         * IOS UIWebView has issues with appcache and history so
         * keep track of history ourselves and change hash instead
         * 
         * @memberOf AuraHistoryService
         * @public
         */
        forward: function() {
            if (!this.isIOSWebView()) {
                //history -> Standard javascript object
                window.history.go(1);
            } else {
                var historyLength = this.history.length;
                if (this.currentIndex < (historyLength - 1)) {
                    // there is forward history
                    window.location.hash = "#" + this.history[++this.currentIndex];
                }
            }
        },

        /**
         * Resets history
         *
         * @public
         */
        reset: function () {
            this.history = [];
            this.currentIndex = -1;
        },
        
        /**
         * Whether to use pushState.
         * Native Android browser has issues with pushState
         * IOS UIWebView has issues with pushState and history
         * @returns {boolean} true if pushState should be used
         * @private
         */
        usePushState: function() {
            if (this._usePushState === undefined) {
                var ua = window.navigator.userAgent;
                this._usePushState =
                    // browser has pushState
                    !!window.history.pushState &&
                    // NOT native Android browser
                    !(ua.indexOf("Android ") > -1 && ua.indexOf("Mozilla/5.0") > -1 && ua.indexOf("AppleWebKit") > -1 && ua.indexOf("Chrome") == -1) &&
                    // NOT IOS UIWebView (native app webview)
                    !this.isIOSWebView();
            }
            return this._usePushState;
        },

        /**
         * Whether IOS UIWebView
         * @returns {boolean} true if IOS UIWebView
         * @private
         */
        isIOSWebView: function() {
            if (this._isIOSWebView === undefined) {
                var ua = window.navigator.userAgent;
                this._isIOSWebView = /(iPad|iPhone|iPod);.*CPU.*OS 7_\d.*AppleWebKit/i.test(ua) && ua.indexOf("Safari") == -1;
            }
            return this._isIOSWebView;
        },

        /**
         * @private
         */
        init: function() {
            // Check for HTML5 window.history.pushState support
            if (this.usePushState()) {
                window.addEventListener("popstate", function(e) {
                    priv.changeHandler();
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
                        priv.changeHandler();
                    };
                } else {
                    
                    var watch = function(){
                        setTimeout(function(){
                            var newHash = location["hash"];
                            if (newHash !== hash) {
                                hash = newHash;
                                priv.changeHandler();
                            }
                            watch();
                        }, 300);
                    };

                    watch();
                }
            }

            priv.changeHandler();
            delete this.init;
        }
    };
    
    //#include aura.AuraHistoryService_export
    return historyService;
};
