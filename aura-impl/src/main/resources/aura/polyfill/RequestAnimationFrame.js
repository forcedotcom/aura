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

Date.now = (Date.now || function () {  // thanks IE8
    return new Date().getTime();
});

var lastTime = 0,
    caf      = 'CancelAnimationFrame',
    vendors  = ['ms', 'moz', 'webkit', 'o'];

for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = w[vendors[x] + 'RequestAnimationFrame'];
    window.cancelAnimationFrame  = w[vendors[x] + caf] || w[vendors[x] + caf];
}

if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback, element) {
        var currTime   = new Date().getTime(),
            timeToCall = Math.max(0, 16 - (currTime - lastTime)),
            id         = window.setTimeout(function() {callback(currTime + timeToCall);}, timeToCall);

        lastTime = currTime + timeToCall;
        return id;
    };
}

if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function(id) {
        window.clearTimeout(id);
    };
}
