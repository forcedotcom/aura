/*
 * Copyright (c) 2012, salesforce.com, inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided
 * that the following conditions are met:
 *
 * Redistributions of source code must retain the above copyright notice, this list of conditions and the
 * following disclaimer.
 *
 * Redistributions in binary form must reproduce the above copyright notice, this list of conditions and
 * the following disclaimer in the documentation and/or other materials provided with the distribution.
 *
 * Neither the name of salesforce.com, inc. nor the names of its contributors may be used to endorse or
 * promote products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
 * PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 * TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * Mock Cordova: mocks just enough cordova functions to allow testing of plugins outside a container
 *
 */
(function(window) {
    var require,
    define;

    (function () {
        var modules = {};

        function build(module) {
            var factory = module.factory;
            module.exports = {};
            delete module.factory;
            factory(require, module.exports, module);
            return module.exports;
        }

        require = function (id) {
            if (!modules[id]) {
                throw "module " + id + " not found";
            }
            return modules[id].factory ? build(modules[id]) : modules[id].exports;
        };

        define = function (id, factory) {
            if (modules[id]) {
                throw "module " + id + " already defined";
            }

            modules[id] = {
                id: id,
                factory: factory
            };
        };

        define.remove = function (id) {
            delete modules[id];
        };

    })();

    define("cordova", function(require, exports, module) {
        var interceptors = {};

        // Method to provide an mock implementation for an container service/action
        // func should take three arguments: successCB, errorCB, args
        var interceptExec = function(service, action, func) {
            interceptors[service + ":" + action] = func;
        };

        // Mocking cordova's exec method by calling the functions registered with interceptExec
        var exec = function(successCB, errorCB, service, action, args) {
            var version = (args.length > 0 && typeof args[0] == "string" && args[0].indexOf("pluginSDKVersion:") == 0 ? args[0].substring("pluginSDKVersion:".length) : null);
            if (version != null) { args.shift(); }
            console.log("cordova.exec " + service + ":" + action + (version != null ? ":" + version : ""));
            var found = false;
            var req = service + ":" + action;
            for (var key in interceptors) {
                if (key === req) {
                    setTimeout(function() {
                        try { interceptors[key](successCB, errorCB, args); } catch (err) { errorCB(err); }
                    }, 0);
                    found = true;
                    break;
                }
            }

            if (!found) {
                console.log("No mock for " + service + ":" + action);
                return;
            }
        };

        module.exports = {
            exec: exec,
            define: define,
            require: require,

            // Only in mock
            interceptExec: interceptExec,
        };
    });

    window.cordova = require("cordova");

})(window);

