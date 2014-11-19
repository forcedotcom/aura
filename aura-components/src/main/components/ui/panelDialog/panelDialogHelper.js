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
	init: function(cmp, event) {
		var self = this;
		cmp._windowKeyHandler = function(e) {
			if ((e || window.event).keyCode == 27) {
				if (cmp.isValid() && cmp.get('v.isVisible')) {
					$A.util.squash(e);
					self.hide(cmp, event);
				}
			}
		};
	},
	
	hide: function (cmp, event) {
        var self       = this,
            panel      = this._findContainedComponent(cmp, "panel").getElement(),
            panelBody  = panel.querySelector('.body'),
            isModal    = cmp.get("v.isModal"),
            modalGlass = isModal ? this._findContainedComponent(cmp, "modal-glass").getElement(): null,
            removeAnim = event.removeAnim || cmp.get('v.animation') === 'none',

            //css animations & transitions
            animName   = 'moveto' + cmp.get('v.animation'),
            animEnd    = this.getAnimationEndEventName(),

            //endAnimationCallback
            finishHandler = function (e) {
                $A.util.removeClass(panel, 'sliding');
                $A.util.removeClass(panel, animName);

                panel.style.cssText = 'display:none';
                panel.removeEventListener(animEnd, finishHandler);

                if (modalGlass !== null) {
                    $A.util.removeClass(modalGlass, 'fadeIn');
                    modalGlass.style.cssText = 'display:none';
                }
                panelBody.style.cssText = '';
                // hide root element of component also
                cmp.getElement().style.display = 'none';

                $A.get('e.ui:panelTransitionEnd').setParams({
                	action: 'hide', 
                	panelId: cmp.getGlobalId(),
                	isTransient: cmp.get('v.isTransient')
                }).fire();
            };

        // remove key event listener when modal is hidden
		$A.util.removeOn(document, "keydown", cmp._windowKeyHandler);
        $A.get('e.ui:panelTransitionBegin').setParams({ panel: cmp, isOpening: false }).fire();

        //trigger animation
        panel.addEventListener(animEnd, finishHandler, false);
        $A.util.addClass(panel, 'sliding');
        panel.setAttribute("aria-hidden", 'true');
        panel.offsetWidth; //force the browser to apply the styles and send the composite layer (thanks to .sliding) to the GPU before moving it

        // remove the glass panel and transition opacity while hidding on modals
        if (modalGlass !== null) {
            modalGlass.style.opacity = '0';
        }
        panel.style.opacity = '0';

        if (removeAnim) {
            finishHandler({});
        } else {
            $A.util.addClass(panel, animName);
        }
    },
    
    show: function (cmp) {
        var self       = this,
            panel      = this._findContainedComponent(cmp, "panel").getElement(),
            panelBody  = panel.querySelector('.body'),
            panelTitle = panel.querySelector('.titleBar'),
            isModal    = cmp.get("v.isModal"),
            modalGlass = isModal ? this._findContainedComponent(cmp, "modal-glass").getElement(): null,
            removeAnim = cmp.get('v.animation') === 'none',

            //custom animation
            animEnd    = this.getAnimationEndEventName(),
            animName   = 'movefrom' + cmp.get('v.animation'),

            calculateScrollerHeight = function () {
                //move this eventually to somewhere global
                var margin = 10,
                    modalHeightPercentage = 0.7,
                    panelScrollContent = panel.querySelector('.panelScrollContent'),

                    //calculate all needed heights to see if the scroller is taking too much room
                    windowHeight    = window.innerHeight,
                    maxModalHeight  = windowHeight * modalHeightPercentage,
                    titleHeight     = panelTitle ? panelTitle.offsetHeight: 0,
                    panelHeight     = panelScrollContent.offsetHeight + titleHeight,
                    availableHeight = maxModalHeight - titleHeight,
                    scrollerHeight  = panelScrollContent.offsetHeight;

                if (scrollerHeight > availableHeight) {
                    panelBody.style.height = availableHeight - margin + 'px';
                } else {
                    $A.util.removeClass(panelBody, 'scrollbox');
                    self._findContainedComponent(cmp, "scroller").set('v.enabled',  false);
                }
            },
            //endAnimationHandler: cleanup all classes and events
            finishHandler = function (e) {
                panel.style.display = 'block';
                $A.util.removeClass(panel, 'sliding');
                $A.util.removeClass(panel, 'movefrombottom');
                panel.removeEventListener(animEnd, finishHandler);

                $A.get("e.ui:updateSize").fire();
                $A.get('e.ui:panelTransitionEnd').setParams({
                	action: 'show', 
                	panelId: cmp.getGlobalId(),
                	// panelManager auto destroys transient modals
                	isTransient: cmp.get('v.isTransient')
            	}).fire();

                window.scrollTo(0,1);

                // This is use by the WebDriver test to detect that the sliding animation is done.
                $A.util.addClass(panel, 'panelReady');
                cmp.set('v.isVisible', true);
                
                // add key event listener when modal is shown
        		$A.util.on(document, "keydown", cmp._windowKeyHandler);		
            };
        //move the dialog to the right position
        if (!isModal) {
            this.position(cmp);
        }

        $A.get('e.ui:panelTransitionBegin').setParams({ panel: cmp, isOpening: true }).fire();

        panel.addEventListener(animEnd, finishHandler, false);
        $A.util.addClass(panel, 'sliding');
        panel.style.visibility = 'hidden';
        panel.style.display = 'block';

        //glass
        if (modalGlass !== null) {
            modalGlass.style['display'] = 'block';
            modalGlass.offsetWidth; //force the browser to paint it.
            $A.util.addClass(modalGlass, 'fadeIn');
        }

        calculateScrollerHeight();

        panel.offsetWidth;// make the browser repaint with the new .sliding and inline css style attribrutes
        panel.style.visibility = 'visible';
        panel.setAttribute("aria-hidden", 'false');
        if (removeAnim) {
            finishHandler({});
        } else {
            $A.util.addClass(panel, animName);
        }
    },

    position: function(cmp) {
        var referenceElem = cmp.get('v.referenceElement');
        if (!$A.util.isUndefinedOrNull(referenceElem)) {
            var elem = cmp.getElement();
            var panelElem = this._findContainedComponent(cmp, "panel").getElement();
            var panelElemRect = panelElem.getBoundingClientRect();
            var referenceElemRect = referenceElem.getBoundingClientRect();
            var viewPort = $A.util.getWindowSize();

            // Vertical alignment
            // getBoundingClientRect method does not return height and width in IE7 and Ie8
            var height = typeof panelElemRect.height != 'undefined' ? panelElemRect.height : panelElemRect.bottom - panelElemRect.top;
            var scrollY = document.documentElement.scrollTop;
            if ((viewPort.height - referenceElemRect.bottom) < height) { // no enough space below
                if (referenceElemRect.top < height) { // no enough space above either. Put it in the middle then
                    elem.style.top = scrollY + "px";
                } else { // put it above
                    elem.style.top = (referenceElemRect.top - height) + scrollY + "px";
                }
            } else { // put it below
                elem.style.top = referenceElemRect.bottom + scrollY + "px";
            }

            // Horizontal alignment
            // getBoundingClientRect method does not return height and width in IE7 and Ie8
            var width = typeof panelElemRect.width != 'undefined' ? panelElemRect.width : panelElemRect.right - panelElemRect.left;
            var scrollX = document.documentElement.scrollLeft;
            if (viewPort.width - referenceElemRect.left < width) {
                elem.style.left = referenceElemRect.right - width + scrollX +"px";
            } else {
                elem.style.left = referenceElemRect.left - width + scrollX + "px";
            }
        }
    },
    
    /**
     * Returns the modal glass element to panel manager to stack the zIndex
     */
    getModalGlassElement: function(cmp) {
    	var el = null,
    		modalGlass = this._findContainedComponent(cmp, "modal-glass");
    	if (modalGlass && modalGlass.isRendered()) {
    		el = modalGlass.getElement();
    	}
    	return el;
    },
    
    /**
     * Returns the panel element to panel manager to stack the zIndex
     */
    getPanelElement: function(cmp) {
    	var el = null,
			panel = this._findContainedComponent(cmp, "panel");
		if (panel) {
			el = panel.getElement();
		}
		return el;
    },

    /*
	 * This indirection is because there are two different ways to close the panel:
	 * By default the panel can close itself calling directly closeAction
	 * When invoked by the panelManager, it needs to perform some specific manager logic, before it can be closed.
	 * We need to pass a function instead of a regular Aura action because otherwise, when destroying the panel, 
	 * Aura will remove the original Action as well.
	*/
    close: function (cmp, event) {
    	var closeAction = cmp.get('v.closeAction'),
    	    callbacks = cmp.get("v.callbacks");

    	if (callbacks && $A.util.isFunction(callbacks.onClose)) {
    	    callbacks.onClose();
    	}
    	
    	if (typeof closeAction === 'function') {
    		// A regular function passed my the manager to avoid original action destruction
    		closeAction();
    	} else if (closeAction && closeAction.run) {
    		closeAction.run();
    	} else {
    		this.hide(cmp);
    	}
    },
    
    _findContainedComponent: function(cmp, localId) {
    	var p = cmp;
    	var containedCmp = cmp.find(localId);
    	while (!containedCmp && p.isInstanceOf("ui:panelDialog")) {
    		p = p.getSuper();
    		containedCmp = p.find(localId);
    	}
    	return containedCmp;
    },
    
    getPrefix : function () {
    	if (!this._prefix) {
	        var styles = window.getComputedStyle(document.documentElement, ''),
	            pre = (Array.prototype.slice.call(styles).join('').match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o']))[1],
	            up = $A.util.isIE;
	        
	        this._prefix = up ? pre.toUpperCase() : pre;
    	}
        return this._prefix;
	},
	
	getAnimationEndEventName: function () {
        var eventName = this.ANIMATION_END_EVENT_NAMES[this.getPrefix()];
        return eventName ? eventName : 'animationend';
    },
    
    ANIMATION_END_EVENT_NAMES : {
	    webkit : 'webkitAnimationEnd',
	    o : 'oAnimationEnd',
	    moz : 'animationend',
	    ms : 'animationend' // IE 10 or above 
	}

})
