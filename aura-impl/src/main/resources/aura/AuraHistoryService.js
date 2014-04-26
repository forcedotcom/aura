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
var AuraHistoryService = function(){

    //#include aura.AuraHistoryService_private

    var historyService = {
        /**
         * Sets the new location. For example, <code>$A.services.history.set("search")</code> sets the location to <code>#search</code>.
         * Otherwise, use <code>$A.services.layout.changeLocation()</code> to override existing URL parameters.
         * 
         * Native Android browser doesn't completely support pushState so we force hash method for it
         *
         * @param {Object} token The provided token set to the current location hash
         * @memberOf AuraHistoryService
         * @public
         */
        set : function(token){
            // Check for HTML5 window.history.pushState support
            if ('pushState' in window.history && !this.isNativeAndroid()) {
            	//
            	// Need to pass in the token to the state as
            	// windows phone doesn't persist the hash
            	// after using the back button.
            	//
                history.pushState({"hash":token}, null, '#' + token);
            } else {
                location.hash = '#' + token;
            }

            priv.changeHandler();
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
         * @memberOf AuraHistoryService
         * @public
         */
        back : function(){
            //history -> Standard javascript object
            history.go(-1);
        },
        
        /**
         * Sets the title of the document.
         * 
         * @param {String} title The new title
         * @memberOf AuraHistoryService
         * @public
         */
        setTitle : function(title){
              document.title = title;
        },
        
        /**
         * Loads the next URL in the history list. Standard JavaScript <code>history.go()</code> method.
         * 
         * @memberOf AuraHistoryService
         * @public
         */
        forward : function(){
            //history -> Standard javascript object
            history.go(1);
        },
        
        /**
         * Checks user agent for native Android browser and stores in variable instead of checking every time
         * 
         * @private
         */
        isNativeAndroid : function() {
            
            if (this._isAndroid === undefined) {
                var ua = navigator.userAgent;
                this._isAndroid = ua.indexOf('Mozilla/5.0') > -1 && ua.indexOf('Android ') > -1 && ua.indexOf('AppleWebKit') > -1 && !(ua.indexOf('Chrome') > -1);
            }
            return this._isAndroid;
        },

        /**
         * @private
         */
        init : function(){
            // Check for HTML5 window.history.pushState support
            if ('pushState' in window.history && !this.isNativeAndroid()) {
                window.addEventListener("popstate", function(e) {
                    priv.changeHandler();
                });
            } else {
                //Checks for existence of event, and also ie8 in ie7 mode (misreports existence)
                var docMode = document["documentMode"];
                var hasOnHashChangeEvent = 'onhashchange' in window && (docMode === undefined || docMode > 7);

                if (hasOnHashChangeEvent) {
                    window["onhashchange"] = function(){
                        priv.changeHandler();
                    };
                }else{
                    var hash = location["hash"];
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
