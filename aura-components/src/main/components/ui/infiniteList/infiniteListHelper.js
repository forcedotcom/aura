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
	SWIPE_THRESHOLD: 30,
	
	/**
	 * Creates the handlers needed for listening to touch/pointer events.
	 */
	initializeHandlers: function (cmp) {
		var self = this;
    	
		cmp._ontouchstart = function (e) {
			self.ontouchstart(cmp, e);
		};

    	cmp._ontouchmove = function (e) {
    		self.ontouchmove(cmp, e);
    	};
    	
    	cmp._ontouchend = function (e) {
    		self.ontouchend(cmp, e);
    	};
	},
	
	/**
	 * Concats the new items to the list of existing items.
	 */
    handleDataChange: function(cmp, evt) {
        if ($A.getContext().getMode() === 'PTEST') {
            $A.mark("infiniteList handleDataChange " + component.getGlobalId());
        }
        
    	var newData = evt.getParam("data"),
    		items = cmp.getConcreteComponent().getValue("v.items"),
    		actualItems = items.unwrap();
        
        for (var i = 0, len = newData.length; i < len; i++) {
            actualItems.push(newData[i]);
        }
        
        items.setValue(actualItems);
        
        if ($A.getContext().getMode() === 'PTEST') {
            $A.endMark("infiniteList handleDataChange " + component.getGlobalId());
        }
    },
    
    /**
     * Attaches event listeners to their handlers.
     */
    attachListeners: function (cmp) {
    	var ul = cmp.getElement();
    
    	ul.addEventListener(this.getEventNames().move, cmp._ontouchmove, false);
        ul.addEventListener(this.getEventNames().end, cmp._ontouchend, false);
    },
   
    /**
     * Detaches event listeners to their handlers.
     */
    detachListeners: function (cmp) {
    	var ul = cmp.getElement();
    	
    	ul.removeEventListener(this.getEventNames().move, cmp._ontouchmove);
    	ul.removeEventListener(this.getEventNames().end, cmp._ontouchend);
    },
    
    /**
     * 'start' handler. 
     *  Attempts to resolve the actionable row and  
     *  attaches 'move' and 'end' listeners if a valid row was found.
     */
    ontouchstart: function (cmp, e) {  
    	var touch, rootClassName, ul, row;
    	
    	if ((e.touches && e.touches.length == 1) || (e.pageX !== undefined)) {
    		touch = (e.touches && e.touches[0]) || e;
    		rootClassName = cmp.getElement().className || 'uiInfiniteList';
    		row = this.getRow(e.target, 'uiInfiniteListRow', rootClassName)
    		
    		// Only proceed if a valid row was found.
    		if (row) {
    			this.attachListeners(cmp);
	    		
		    	// Begin tracking the swipe gesture.
		    	cmp._swipe = {
					row    : row,
					startX : touch.pageX,
					startY : touch.pageY
		    	};
    		}
    	}
    },
    
    /**
     * 'move' handler. 
     * Records the touch/pointer interaction. 
     */
    ontouchmove: function (cmp, e) {   
    	var point = null;
    	
    	// Continue tracking the swipe if the an associated row was found.
    	if (cmp._swipe && cmp._swipe.row && (point = this.getPoint(e)) !== null) {
	    	var swipe = cmp._swipe;
	    	
	    	// Records the most recent point in the movement.
	    	// Calculates the diffs in horizontal (X) and vertical (Y) position.
	    	swipe.x 	= point.x;
	    	swipe.y 	= point.y;
	    	swipe.diffX = (swipe.startX - point.x);
	    	swipe.diffY = (swipe.startY - point.y),
	    	swipe.absX 	= Math.abs(swipe.diffX);
	    	swipe.absY 	= Math.abs(swipe.diffY);

	    	// If a horizontal close swipe and the row is closed, ignore.
	    	// Ignoring allows with event to continue bubbling (stageLeft swipe for example). 
	    	if (swipe.diffX < 0 && swipe.row.className.indexOf('open') === -1) {
	    		return; 
	    	}
	    	
	    	// If a greater gesture occurred horizontally than vertically, 
	    	// then prevent event bubbling to keep the scroller from moving.
	    	if (swipe.absX > this.SWIPE_THRESHOLD && swipe.absX > swipe.absY) {
	    		e.stopPropagation();
	        	e.preventDefault();
	    	}
    	}
    },
    
    /**
     * 'end' handler. 
     * Determines if the movements is considered a swipe. 
     * Detaches event listeners.
     */
    ontouchend: function (cmp, e) {
    	var swipe = cmp._swipe;
    	
    	if (swipe.absX > this.SWIPE_THRESHOLD) {
    		// If the end position was less than the start, open the row.
    		// Else the end position was greater than the start, so close the row.
    		if (swipe.diffX > 0) {
    			if (cmp._openRow) {
    				$A.util.removeClass(cmp._openRow, 'open');
    			}
    			
    			cmp._openRow = cmp._swipe.row;
    			$A.util.addClass(cmp._swipe.row, 'open');
    		}
    		else {
    			$A.util.removeClass(cmp._swipe.row, 'open');
    		}
    	}
    	
    	this.detachListeners(cmp);
    },
    
    /**
     * Resolve event names due to device variance.
     */
    getEventNames: function () {
		var eventNames;
    	
    	if (this._eventNames) {
    		return this._eventNames;
    	}
    	
		if (navigator.pointerEnabled) {
		    eventNames = {
		        start : 'pointerdown',
		        move  : 'pointermove',
		        end   : 'pointerup' 
		    };
		
		} 
		else if (navigator.msPointerEnabled) {
		    eventNames = {
		        start : 'MSPointerDown',
		        move  : 'MSPointerMove',
		        end   : 'MSPointerUp' 
		    };
		     
		} 
		else {
		    eventNames = {
		        start : 'touchstart',
		        move  : 'touchmove',
		        end   : 'touchend'
		    };
		}
		 
		// Cache the event names on the helper.	
		this._eventNames = eventNames;
		return eventNames;
    },
    
    /**
     * Normalize 'touch' and 'pointer' events.
     */
    getPoint: function (e) {
    	var point = {};

        if (e.targetTouches) {
    		point.x = e.targetTouches[0].clientX;
    		point.y = e.targetTouches[0].clientY;
        } 
        else {
			point.x = e.clientX;
			point.y = e.clientY;
        }

        return point;
    },
    
    /**
     * Attempts to find a row given the current touch target.
     * @return {HTMLElement} If a row is found or null if otherwise.
     */
    getRow: function (el, targetClassName, rootClassName) {
    	// Count prevents an infinite loop from occurring due to algorithm breakage.
    	// God save you if you have 100 nested elements in your component.
    	var count = 0,
    		current = el,
    		row = null;

    	// Walk the tree until the closest target is found.
    	// Escape if 100 nodes are traversed or the root is hit.
    	while (count < 100 && current.className !== rootClassName) {
    		if (current.className.indexOf(targetClassName) !== -1) {
	    		row = current;
	    		break;
	    	}
	    	
	    	current = current.parentNode;
	    	++count;
    	}
    	
    	return row;
    }
})