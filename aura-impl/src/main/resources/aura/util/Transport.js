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
 * @namespace
 */
var Transport = function(){

    function createHttpRequest() {
        if (window.XMLHttpRequest) {
            return new XMLHttpRequest();
        } else if (window.ActiveXObject) {
            try {
                return new ActiveXObject("Msxml2.XMLHTTP");
            } catch (e) {
                try {
                    return new ActiveXObject("Microsoft.XMLHTTP");
                } catch (e2) {
                }
            }
        }
        return null;
    }

    function buildParams(map){
        var arr = [];
        var first = true;
        for (var key in map){
            if (!first){
                arr.push("&");
            }
            first = false;
            if (aura.util.isArray(map[key])) {
                var valueArray = map[key];
                if (valueArray.length === 0) {
                    arr.push(key);
                    arr.push("=");
                } else {
                    for (var i = 0; i < valueArray.length; i++) {
                        if (i > 0) {
                            arr.push("&");
                        }
                        arr.push(key);
                        arr.push("=");
                        arr.push(encodeURIComponent(valueArray[i]));
                    }
                }
            } else {
                arr.push(key);
                arr.push("=");
                arr.push(encodeURIComponent(map[key]));
            }
        }
        return arr.join("");
    }

    return {

        request : function(config){
            /**config{url,method,callback,scope,params}*/

            var request = createHttpRequest();
            var method = config["method"] || "GET";
            var qs;
            if(config["params"]){
                qs = buildParams(config["params"]);
            }

            var url = config["url"];
            if(qs && method !== "POST"){
                url = url + "?" + qs;
            }

            request["open"](method, url, true);
            request["onreadystatechange"] = function() {
                if (request["readyState"] == 4) {
                    $A.measure("Received Response", "Sending XHR " + config["params"]["aura.num"]);
                    config["callback"].call(config["scope"] || window, request);
                    $A.measure("Callback Complete", "Sending XHR " + config["params"]["aura.num"]);
                }
            };

            $A.mark("Sending XHR " + config["params"]["aura.num"]);
            if(qs && method === "POST"){
                request.setRequestHeader('Content-Type','application/x-www-form-urlencoded; charset=ISO-8859-13');
                request.send(qs);
            }else{
                request.send();
            }
        }


    };
};
