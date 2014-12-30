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

function (w) {
    'use strict';
    w || (w = window);
    
	var SCROLLER = w.__S || (w.__S = {}),
        HELPERS = {
            simpleMerge: function (obj1, obj2) {
                var obj3 = {}, attrname;
                for (attrname in obj1) {
                    if (obj1.hasOwnProperty(attrname)) {
                        obj3[attrname] = obj1[attrname];
                    }
                }
                for (attrname in obj2) {
                    if (obj2.hasOwnProperty(attrname)) {
                        obj3[attrname] = obj2[attrname];
                    }
                }
                return obj3;
            },
            parseDOM: function (data) {
                var div;
                if (data && data.length) {
                    if (typeof data === 'string') {
                        div = w.document.createElement('div');
                        div.innerHTML = data;
                        return Array.prototype.slice.call(div.children, 0);
                    } else {
                        return Array.prototype.slice.call(data, 0);
                    }
                }
            },
            bind: function (el, type, fn, capture) {
                el.addEventListener(type, fn, !!capture);
            },
            unbind: function (el, type, fn, capture) {
                el.removeEventListener(type, fn, !!capture);
            }
        };
    SCROLLER.helpers = HELPERS;
}