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
/*jslint sub: true */
/**
 * @namespace The Aura History Service, accessible using $A.services.history.  Manages Browser History.
 * @constructor
 */
var AuraHistoryService = function(){

    //#include aura.AuraHistoryService_private

    var historyService = {
		/**
	     * Set the new location. For example, <code>$A.services.history.set(location)</code> or <code>$A.services.history.set("search")</code>
	     * sets the location to <code>#location</code> and <code>#search</code>. Otherwise, use <code>$A.services.layout.changeLocation()</code> to override existing URL parameters.
	     * @param {Object} token The provided token set to the current location hash
	     * @memberOf AuraHistoryService
	     * @public
	     */
        set : function(token){
            location.hash = '#' + token;
        },
        
        /**
         * Parse the location. A token can be used here.
         * <p>Example:</p> 
         * <code>token == "newLayout";<br /> $A.historyService.get().token;</code>
         * @memberOf AuraHistoryService
         * @public
         */
        get : function(){
            return priv.parseLocation(location.hash);
        },
        
        /**
         * Loads the previous URL in the history list. Standard JavaScript <code>history.go()</code> method.
         * @memberOf AuraHistoryService
         * @public
         */
        back : function(){
            //history -> Standard javascript object
            history.go(-1);
        },
        
        /**
         * Set the title of the document.
         * @param {String} title The new title
         * @memberOf AuraHistoryService
         * @public
         */
        setTitle : function(title){
              document.title = title;
        },
        
        /**
         * Loads the next URL in the history list. Standard JavaScript <code>history.go()</code> method.
         * @memberOf AuraHistoryService
         * @public
         */
        forward : function(){
            //history -> Standard javascript object
            history.go(1);
        },

        /**
         * @private
         */
        init : function(){
            //Checks for existence of event, and also ie8 in ie7 mode (misreports existence)
            var docMode = document["documentMode"];
            var hasEvent = 'onhashchange' in window && ( docMode === undefined || docMode > 7 );

            if (hasEvent) {
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
                            priv.changeHandler(hash);
                        }
                        watch();
                    }, 50);
                };
                watch();
            }
            priv.changeHandler(location["hash"]);
            delete this.init;
        }
    };
  //#include aura.AuraHistoryService_export
    return historyService;
};
