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
    
    // jshint ignore: start

    // FOREACH polyfill
    // From: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
    if (!Array.prototype.forEach) {
        Array.prototype.forEach = function(fun /*, thisArg */) {
            if (this === void 0 || this === null) {
                throw new TypeError();
            }
            var t = Object(this), len = t.length >>> 0;
            if (typeof fun !== 'function') {
                throw new TypeError();
            }

            var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
            for (var i = 0; i < len; i++) {
                if (i in t) {
                    fun.call(thisArg, t[i], i, t);
                }
            }
        };
    }
    // jshint ignore: end

    var SCROLLER = w.__S || (w.__S = {}),
        DOCUMENT_STYLE = w.document.documentElement.style,
        VENDORS  = ['webkit', 'Moz', 'ms'],
        NAV      = w.navigator, // For testing, we dont want to mock navigator for all tests
        UA       = NAV && NAV.userAgent,

        // Trivial UserAgent detection
        // NOTE: This is for small scroller behaviour changes, 
        // Use this scarcely since this will only detect a subset of devices
        // For an accurate updated list of regex go to:
        // https://github.com/ua-parser/uap-core/blob/master/regexes.yaml
        WP             = UA && UA.match(/Windows Phone (?:OS[ /])?(\d+)\.(\d+)/),
        IOS            = UA && UA.match(/iP(?:hone|ad;(?: U;)? CPU) OS (\d+)/),
        ANDROID        = UA && UA.match(/Android/),
        IS_WP          = !!WP,
        IS_IOS         = !IS_WP && !!IOS,
        IS_ANDROID     = !IS_WP && !!ANDROID,
        IOS_SCROLL     = IOS && IOS[1] >= 8,

        supportTransition = false,
        supportTransform  = false,
        property, prefix, i;

    // TRANSITION SUPPORT
    if ('transition' in DOCUMENT_STYLE) {
        supportTransition = true;
        prefix = '';
    } else {
        for (i = 0; i < VENDORS.length; i++) {
            property = VENDORS[i] + 'Transition';
            if (DOCUMENT_STYLE[property] !== 'undefined') {
                supportTransition = true;
                prefix = VENDORS[i];
            }
        }
    }
    
    // TRANSFORM SUPPORT
    if (typeof DOCUMENT_STYLE.transform !== 'undefined') {
        supportTransform = true;
    } else {
        for (i = 0; i < VENDORS.length; i++) {
            property = VENDORS[i] + 'Transform';
            if (typeof DOCUMENT_STYLE[property] !== 'undefined') {
                supportTransform = true;
                prefix = VENDORS[i];
            }
        }
    }

    SCROLLER.support = {
        prefix      : prefix,
        transition  : supportTransition,
        transform   : supportTransform,
        matrix      : !!(w.WebKitCSSMatrix || w.MSCSSMatrix),
        touch       : 'ontouchstart' in w,
        pointers    : w.navigator.pointerEnabled,
        msPointers  : w.navigator.msPointerEnabled,
        touchScroll : IOS_SCROLL,
        isWP        : IS_WP, // (See note above about accuracy)
        isIOS       : IS_IOS, // (See note above about accuracy)
        isAndroid   : IS_ANDROID // (See note above about accuracy)
    };

}