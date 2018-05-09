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

function lib() { //eslint-disable-line no-unused-vars
	'use strict';

	function getScrollableParent(elem, stopEl) {
        // document.body is not necessarily a body tag, because of the (very rare) 
        // case of a frameset. 
        if(!elem || elem === stopEl || elem === document.body) {
            return null;
        }

        // if overflow is auto overflow-y is also auto, 
        // however in firefox the opposite is not true
        try { 
            // getComputedStyle throws an exception
            // if elem is not an element
            // (can happen during unrender)
            var computedStyle = getComputedStyle(elem) || elem.style;
        } catch (e) {
            return null;
        }

        if(!computedStyle) {
            return null;
        }

        var overflow = computedStyle['overflow-y'];

        if(overflow === 'auto' || overflow === 'scroll') {
            return elem;
        }

        return getScrollableParent(elem.parentNode);
	}

    function isWindow(elem) {
        return elem.toString() === '[object Window]';
    }

	return {
		getScrollableParent: getScrollableParent,
        isWindow: isWindow
	};
}
