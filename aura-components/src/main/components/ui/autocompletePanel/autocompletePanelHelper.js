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
({

	 /**
     * If any parent element is scrollable with the wheel
     * (overflow-y), return that
     * 
     * @param  {HTMLElement} elem The element to check
     * @return {Mixed}      Returns an HTMLElement if one is found, otherwise null
     */
    _getScrollableParent: function(elem) {
        // TODO this is copypasta from datePickerHelper W-2727472
        if(!elem || elem === window || (elem.tagName && elem.tagName.toUpperCase() === 'BODY')) {
            return null;
        }

        // memoize
        if(this._scrollableParent) {
            return this._scrollableParent;
        }

        // if overflow is auto overflow-y is also auto, 
        // however in firefox the opposite is not true
        try { 
            // getComputedStyle throws an exception
            // if elem is not an element
            // (can happen during unrender)
            var computedStyle = getComputedStyle(elem);
        } catch (e) {
            return null;
        }

        if(!computedStyle) {
            return;
        }

        var overflow = computedStyle['overflow-y'];

        //
        if(overflow === 'auto') {
            this._scrollableParent = elem;
            return elem;
        }

        if(elem === document.body) {
            this._scrollableParent = null;
            return null;
        }

        return this._getScrollableParent(elem.parentNode);

    },

    cleanEvents: function (cmp) {
        var elem = cmp.getElement();
    	var scrollableParent = this._getScrollableParent(cmp.get('v.referenceElement'));

        if(scrollableParent) {
            scrollableParent.removeEventListener('scroll', this._handleScroll);
            elem.removeEventListener('wheel', this._handleWheel);
            this._scrollableParent = null;
        }
    },

	handleReferenceElement: function (cmp) {
		var elem = cmp.getElement();
		var referenceBox;
		var referenceElem = cmp.get('v.referenceElement');

		//hide while it is positioned
		elem.style.opacity = 0;
		if(!referenceElem) {
			return;
		} else {
			referenceBox = referenceElem.getBoundingClientRect();
		}

		if(referenceBox) {
			elem.style.width = referenceBox.width + 'px';
		}
		
		if(!cmp.positionConstraint) {
			cmp.positionConstraint = this.lib.panelPositioning.createRelationship({
	            element:elem,
	            target:referenceElem,
	            appendToBody: true,
	            align: 'left top',
	            targetAlign: 'left bottom'
        	});
		}

        var scrollableParent = this._getScrollableParent(referenceElem);
        var self = this;
        this._handleScroll = function(e) {
            self.lib.panelPositioning.reposition(); 
        };

        this._handleWheel = function(e) {
            var scrollableParent = self._getScrollableParent(referenceElem);
            if(scrollableParent && typeof scrollableParent.scrollTop !== 'undefined') {
                scrollableParent.scrollTop += e.deltaY;
            }
            
        };
        
        // if the target element is inside a 
        // scrollable element, we need to make sure
        // scroll events move that element,
        // not the parent, also we need to reposition on scroll
        if(scrollableParent) {
            scrollableParent.addEventListener('scroll', this._handleScroll);
            elem.addEventListener('wheel', this._handleWheel);
        }

		
		this.lib.panelPositioning.reposition(function() {
			elem.style.opacity = 1;
		});
	}
})