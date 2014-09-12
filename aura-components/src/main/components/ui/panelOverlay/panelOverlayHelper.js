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
     * header position: 
     * 		'fixed' when the panel or non-input has focus
     *      'absolute' when an input/textarea has focus
     */
    setHeaderPosition: function (cmp, evt, inputIsFocused) {
		var panel = cmp.find('panel').getElement(),
			header = panel.querySelector('header');
		
    	if (header) {
    		header.style.position = inputIsFocused ? 'absolute' : 'fixed';
    	}
    },
    
    _bindListeners: function (cmp) {
        var self = this,
        	panel = cmp.find("panel").getElement(),
        	header = panel.querySelector('header');

        // attach event handlers for managing the position of the header;
        // when an input on the panel has focus, the header is not displayed
        // in fixed position
        cmp._blur = function (e) {
            self.setHeaderPosition(cmp, e, false);
        }
        cmp._focus = function (e) {
        	var inHeader = false;
        	if (header && e.target) {
        		inHeader = $A.util.contains(header, e.target);
        	}
        	self.setHeaderPosition(cmp, e, !inHeader);
        	
        	// track the last focused element so that it can be 
        	// reset (by panelManager) when a stacked panel is closed
        	// (stacked panel == panel displayed over another panel)
        	if ( ! $A.get('$Browser.isIOS') || ! $A.util.hasClass(e.target, 'forceInputLookupTrigger') ) {
        		// setting the focus to an input trigger causes more problems than it solves on iOS;
        		// 1)  their is no visual indication that the input has focus
        		// 2)  it exposes an apparent rendering quirk as noted in this bug:
        		//        https://gus.my.salesforce.com/apex/adm_bugdetail?id=a07B00000010UV2IAM
        		cmp.set('v.lastFocusedInput', e.target);
        	}
        }
        
        $A.util.on(panel, 'focus', cmp._focus, true);
        $A.util.on(panel, 'blur', cmp._blur, true);
    },
    
    _unbindListeners: function (cmp) {
        var panel = cmp.find("panel").getElement();
        
        $A.util.removeOn(panel, 'focus', cmp._focus, true);
        $A.util.removeOn(panel, 'blur', cmp._blur, true);
    },

    hide: function (cmp, event) {
        var self = this,
            panel = cmp.find("panel").getElement(),
            //css animations & transitions
            removeAnim = event.removeAnim || cmp.get('v.animation') === 'none',
            animName = 'moveto' + cmp.get('v.animation'),
            animEnd = this.getAnimationEndEventName(),

            //endAnimationCallback
            finishHandler = function (e) {
        		panel.removeEventListener(animEnd, finishHandler);
                $A.util.removeClass(panel, 'sliding');
                $A.util.removeClass(panel, animName);

                panel.style.cssText = 'display:none';
                cmp.getElement().style.display = 'none';

                self._unbindListeners(cmp);
                
                $A.get('e.ui:panelTransitionEnd').setParams({
                    action: 'hide', 
                    panelId: cmp.getGlobalId(),
                	isTransient: cmp.get('v.isTransient')
                }).fire();

//                self.destroy(cmp, event);
            };

        // when panel is hidden, reset the lastFocusedInput so that focus will
        // be placed on the first focusable if it is reshown 
    	cmp.set('v.lastFocusedInput', null);
            
        $A.get('e.ui:panelTransitionBegin').setParams({ panel: cmp, isOpening: false }).fire();

        //trigger animation
        panel.addEventListener(animEnd, finishHandler, false);
        $A.util.addClass(panel, 'sliding');
        panel.setAttribute("aria-hidden", 'true');
        panel.offsetWidth; //force the browser to apply the styles and send the composite layer (thanks to .sliding) to the GPU before moving it

        if (removeAnim) {
            finishHandler({});
        } else {
            $A.util.addClass(panel, animName);
        }
    },

    show: function (cmp) {
        var self = this,
            panel = cmp.find("panel").getElement(),
            //css animations & transitions
            removeAnim = cmp.get('v.animation') === 'none',
            animName = 'movefrom' + cmp.get('v.animation'),
            animEnd = this.getAnimationEndEventName(),

            //endAnimationHandler: cleanup all classes and events
            finishHandler = function (e) {
            	panel.removeEventListener(animEnd, finishHandler);
                $A.util.removeClass(panel, 'sliding');
                $A.util.removeClass(panel, animName);

                $A.get('e.ui:updateSize').fire();
                $A.get('e.ui:panelTransitionEnd').setParams({
                    action: 'show', 
                    panelId: cmp.getGlobalId(),
                	isTransient: cmp.get('v.isTransient')
                }).fire();

                window.scrollTo(0,1);

                // This is use by the WebDriver test to detect that the sliding animation is done.
                $A.util.addClass(panel, 'panelReady');
            };

        $A.get('e.ui:panelTransitionBegin').setParams({ panel: cmp, isOpening: true }).fire();

        //init events handlers
        this._bindListeners(cmp)
        panel.addEventListener(animEnd, finishHandler, false);

        $A.util.addClass(panel, 'sliding');
        panel.style.visibility = 'hidden';
        panel.style.display = 'block';
        panel.offsetWidth; // make the browser repaint with the new .sliding and inline css style attribrutes
        panel.style.visibility = 'visible';
        panel.setAttribute("aria-hidden", 'false');

        this.setHeaderPosition(cmp, null, true); // less jagged if header if fixed before sliding instead of after
        
        if (removeAnim) {
            finishHandler({});
        } else {
            $A.util.addClass(panel, animName);
        }
        
        // Fire the toggleModalSpinner in case there are any global spinners that were popped up
        // The specific use case this has been added for is showing a spinner for edit, and this will turn off
        // the spinner. The timeout is needed to queue the event or else for some reason it never gets executed
        // in time and no spinner shows up on webview.
//        setTimeout(function () {
//        	$A.run(function() {
//	            $A.get("e.force:toggleModalSpinner").setParams({
//	                "isVisible": false
//	            }).fire();
//        	});
//        }, 0);
    },

    // called from panelManagerHelper when the content is to be updated
    update: function(cmp, payload) {
    	if (payload.body) {
    		cmp.set('v.body', payload.body);
    	}
    	// there needs to be at least one header button so user can cancel/save
    	if (payload.headerButtons && payload.headerButtons.length) {
    		cmp.set('v.headerButtons', payload.headerButtons);
    	}
      
    	// fade in the new content 
    	$A.util.addClass(cmp.getElement().querySelector('div.body'), 'fadeIn');
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
        } else {
            closeAction.run();
        }
    },
    
    /**
     *	Destroy the content of the panel.
     */
    destroy: function (cmp, options) {
        // This option should be only used by the panelManager
        // which knows how to manage the lifecycle of the panels
        if (!options.lazyDestroy) {
            cmp.destroy(true, "v.body");
        }
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
