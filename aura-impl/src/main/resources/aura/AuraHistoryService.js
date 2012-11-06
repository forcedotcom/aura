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
 * @namespace The Aura History Service.  Manages Browser History
 * @constructor
 */
var AuraHistoryService = function(){

    //#include aura.AuraHistoryService_private

    var historyService = {
        set : function(token){
            location.hash = '#' + token;
        },
        get : function(){
            return priv.parseLocation(location.hash);
        },
        back : function(){
            //history -> Standard javascript object
            history.go(-1);
        },
        setTitle : function(title){
              document.title = title;
        },
        forward : function(){
            //history -> Standard javascript object
            history.go(1);
        },

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
