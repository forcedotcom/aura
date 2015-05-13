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
 * Create and send XHRs to the server.
 * @constructor
 */
function Transport() {}

/**
 * @returns {Object} An XHR based on what is available on the current browser, null if no valid options found
 * @private
 */
Transport.prototype.createHttpRequest = function() {
    if (window.XMLHttpRequest) {
        return new XMLHttpRequest();
    } else if (window.ActiveXObject) {
        try {
            return new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e) {
            try {
                return new ActiveXObject("Microsoft.XMLHTTP");
            } catch (ignore) {
            }
        }
    }
    return null;
};

/**
 * Create an encoded string of parameters.
 * 
 * @param {Map} map A map of parameter names and values
 * @returns {String} The encoded parameters
 * @private
 */
Transport.prototype.buildParams = function(map) {
    var arr = [];
    var first = true;
    for (var key in map) {
        if (!first) {
            arr.push("&");
        }
        first = false;
        if ($A.util.isArray(map[key])) {
            var valueArray = map[key];
            if (valueArray.length === 0) {
                arr.push(key);
                arr.push("=");
            } else {
                for ( var i = 0; i < valueArray.length; i++) {
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
};

/**
 * Create and send an XHR request based on the config.
 * 
 * @param {Object} config The config for the request containing url, method, callback, scope, and params.
 */
Transport.prototype.request = function(config) {
    var request = this.createHttpRequest();
    var method = config["method"] || "GET";
    var qs;
    var processed = false;
    if (config["params"]) {
        qs = this.buildParams(config["params"]);
    }

    var url = config["url"];
    if (qs && method !== "POST") {
        url = url + "?" + qs;
    }
    request["open"](method, url, true);
    request["onreadystatechange"] = function() {
        if (request["readyState"] == 4 && processed === false) {
            processed = true;
            var aura_num = config["params"]["aura.num"];
            $A.Perf.endMark("Received Response - XHR " + aura_num + (config["markDescription"] || ""));
            config["callback"].call(config["scope"] || window, request);
            $A.Perf.endMark("Callback Complete - XHR " + aura_num);
        }
    };
    var aura_num = config["params"]["aura.num"];
    $A.Perf.mark("Received Response - XHR " + aura_num + (config["markDescription"] || ""));
    $A.Perf.mark("Completed Action Callback - XHR " + aura_num);
    $A.Perf.mark("Callback Complete - XHR " + aura_num);
    if (qs && method === "POST") {
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=ISO-8859-13');
        request.send(qs);
    } else {
        request.send();
    }
};

Aura.Utils.Transport = Transport;

//#include aura.util.Transport_export
