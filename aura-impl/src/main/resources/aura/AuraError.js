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

/**
 * @description Creates an AuraError instance.
 * @constructor
 * @param {String} message - the detail message about the error.
 * @param {Object} innerError - an Error object whose properties are to be placed into AuraError.
 * @param {String} severity - the severity of the error. Aura built-in values are defined in $A.severity.
 */
function AuraError() {
    this.name       = "AuraError";
    this.message    = "";
    this.stackTrace = "";
    this.severity   = "";

    // the component that throws the error
    this.component = "";

    // the action that errors out
    this.action = null;

    /* port murmur32 from guava */
    var MurmurHash3 = {
        mul32: function(m, n) {
            var nlo = n & 0xffff;
            var nhi = n - nlo;
            return ((nhi * m | 0) + (nlo * m | 0)) | 0;
        },

        hashString: function(data) {
            var c1 = 0xcc9e2d51, c2 = 0x1b873593;
            var h1 = 0;
            var len = data.length;
            for (var i = 1; i < len; i += 2) {
                var k1 = data.charCodeAt(i - 1) | (data.charCodeAt(i) << 16);
                k1 = this.mul32(k1, c1);
                k1 = ((k1 & 0x1ffff) << 15) | (k1 >>> 17);  // ROTL32(k1,15);
                k1 = this.mul32(k1, c2);

                h1 ^= k1;
                h1 = ((h1 & 0x7ffff) << 13) | (h1 >>> 19);  // ROTL32(h1,13);
                h1 = (h1 * 5 + 0xe6546b64) | 0;
            }

            if((len % 2) === 1) {
                k1 = data.charCodeAt(len - 1);
                k1 = this.mul32(k1, c1);
                k1 = ((k1 & 0x1ffff) << 15) | (k1 >>> 17);  // ROTL32(k1,15);
                k1 = this.mul32(k1, c2);
                h1 ^= k1;
            }

            // finalization
            h1 ^= (len << 1);

            // fmix(h1);
            h1 ^= h1 >>> 16;
            h1  = this.mul32(h1, 0x85ebca6b);
            h1 ^= h1 >>> 13;
            h1  = this.mul32(h1, 0xc2b2ae35);
            h1 ^= h1 >>> 16;

            return h1;
        }
    };

    function AuraErrorInternal(message, innerError, severity) {
        function getStackTrace(e) {
            var stack;
            var remove = 0;
            if (!e || !e.stack) {
                try {
                    throw new Error("foo");
                } catch (f) {
                    e = f;
                    remove += 3;
                }
            }
            if (e) {
                stack = e.stack;
            }

            // Chrome adds the error message to the beginning of the stacktrace. Strip that we only want the the actual stack.
            var chromeStart = e.name + ": " + e.message;
            if (stack && stack.indexOf(chromeStart) === 0) {
                stack = stack.substring(chromeStart.length + 1);
            }
            if (stack) {
                var ret = stack.replace(/(?:\n@:0)?\s+$/m, '');
                ret = ret.replace(new RegExp('^\\(', 'gm'), '{anonymous}(');
                ret = ret.split("\n");
                if (remove !== 0) {
                    ret.splice(0,remove);
                }
                return ret.join('\n');
            }
            return null;
        }

        if (message == null) {
            message = '';
        }

        this.name = innerError ? innerError.name : this.name;
        this.message = message + (innerError ? " [" + (innerError.message || innerError.toString()) + "]" : "");
        this.stackTrace = getStackTrace(innerError);
        this.id = MurmurHash3.hashString(this.stackTrace.replace(/https?:\/\/[^\/]*\//gi, ""));
        this.severity = innerError ? (innerError.severity || severity) : severity;
    }

    AuraErrorInternal.apply(this,arguments);

    this["name"] = this.name;
    this["message"] = this.message;
    this["stackTrace"] = this.stackTrace;
    this["severity"] = this.severity;
    this["handled"] = false;
    this["reported"] = false;
    this["data"] = null;
    this["id"] = this.id;
}

AuraError.prototype = new Error();
AuraError.prototype.constructor = AuraError;
AuraError.prototype.toString = function() {
    return this.message || Error.prototype.toString();
};

Aura.Errors.AuraError = AuraError;
