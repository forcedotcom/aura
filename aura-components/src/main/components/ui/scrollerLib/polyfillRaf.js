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

function(w) {
    'use strict';
    w || (w = window);
    
    var lastTime = 0,
        caf      = 'CancelAnimationFrame',
        vendors  = ['ms', 'moz', 'webkit', 'o'];

    for(var x = 0; x < vendors.length && !w.requestAnimationFrame; ++x) {
        w.requestAnimationFrame = w[vendors[x] + 'RequestAnimationFrame'];
        w.cancelAnimationFrame  = w[vendors[x] + caf] || w[vendors[x] + caf];
    }

    if (!w.requestAnimationFrame) {
        w.requestAnimationFrame = function(callback, element) {
            var currTime   = new Date().getTime(),
                timeToCall = Math.max(0, 16 - (currTime - lastTime)),
                id         = w.setTimeout(function() {callback(currTime + timeToCall);}, timeToCall);

            lastTime = currTime + timeToCall;
            return id;
        };
    }

    if (!w.cancelAnimationFrame) {
        w.cancelAnimationFrame = function(id) {
            w.clearTimeout(id);
        };
    }

}