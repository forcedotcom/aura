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
function lib(scrollUtil) { //eslint-disable-line no-unused-vars
    'use strict';

    var lib = { //eslint-disable-line no-shadow, no-unused-vars

        validateAnimationName: function(animName) {
        	if(animName && animName.match(/^move(to|from)(bottom|top|left|right|center|pop)$/)) {
                return true;
            }
            return false;
        },

        /**
         * returns the initial, first and last focusable in the given panel
         * @param containerEl
         * @returns {{initial: *, first: *, last: *}}
         */
        getFocusables: function(containerEl) {
            if(!containerEl) {
                return {
                    initial: null,
                    first: null,
                    last: null
                };
            }
            var els = containerEl.querySelectorAll('input,button,a,textarea,select,[tabindex]'),
                len = els.length,
                i, el;

            // The 'initial' element is the first non-button focusable element (see W-2512261)
            // whereas the 'first' element is the first (button or non-button) focusable element
            var initial, first, last;

            for (i = 0; i < len; i++) {
                el = els[i];
                if (this.focusAllowed(el)) {
                    if (!first) {
                        first = el;
                    }
                    if (!/button/i.test(el.type)) {
                        initial = el;
                        break;
                    }
                }
            }

            for (i = len - 1; i >= 0; i--) {
                el = els[i];
                if (this.focusAllowed(el)) {
                    last = el;
                    break;
                }
            }

            return {
                // security restriction on iOS doesn't allow focus without user gesture, and focusing an input
                // inside a timeout causes weird behaviours (See W-2564192)
                // we can't completely ignore focus in iOS because the header is positioned on focus. Therefore
                // allowing iOS to focus the header buttons as before.
                initial: initial && !$A.get('$Browser.isIOS') ? initial : first,
                first: first,
                last: last
            };
        },

        /**
         * returns the key event handler function that do things based on the config
         * @param cmp
         * @param config {closeOnEsc, trapFocus, closeOnTabOut, shouldReturnFocus}
         * @param closeAction the caller defined close action
         * @returns {Function}
         */
        getKeyEventListener: function(cmp, conf, closeAction) {
            var me = this, config = conf || {};

            return function(e) {
                var el;
                
                if (!cmp.isValid()) {
                    return;
                }
                var event = e || window.event,
                    keyCode = event.keyCode;
                if (keyCode === 27 && config.closeOnEsc) {
                    //escape to close
                    $A.util.squash(e);
                    if ($A.util.isFunction(closeAction)) {
                    	closeAction(cmp, "closeOnEsc");
                    } else {
                        cmp.getConcreteComponent().close(null, config.shouldReturnFocus);
                    }
                } else if (keyCode === 9) {
                    //close on tab out
                    var shiftPressed = event.shiftKey,
                        current = document.activeElement,
                        focusables;

                    el = cmp.getElement();
                    if(el) {
                        focusables = me.getFocusables(cmp.getElement());
                    }
                        
                    if (focusables && config.trapFocus) {
                        if (me.isSameTabstop(current, focusables.last) && !shiftPressed) {
                            $A.util.squash(event, true);
                            focusables.first.focus();
                        } else if (me.isSameTabstop(current, focusables.first) && shiftPressed) {
                            $A.util.squash(event, true);
                            focusables.last.focus();
                        }
                    } else if (focusables && config.closeOnTabOut) {
                        if ((me.isSameTabstop(current, focusables.last) && !shiftPressed)
                            || ((me.isSameTabstop(current, focusables.first) || current === cmp.getElement()) && shiftPressed)) {
                            $A.util.squash(event, true);
                            cmp.closedBy = "closeOnTabOut";
                            if ($A.util.isFunction(closeAction)) {
                            	closeAction(cmp, "closeOnTabOut");
                            } else {
                                cmp.getConcreteComponent().close(null, config.shouldReturnFocus);
                            }
                        }
                    }
                }
            };
        },

        /**
         * returns the mouse event handler function that do things base on the config
         * @param panelCmp
         * @param config {closeOnClickOut}
         * @param closeAction the caller defined close action
         * @returns {Function}
         */
        getMouseEventListener: function(panelCmp, config, closeAction) {
            return function(e) {
                if (!panelCmp.isValid()) {
                    return;
                }

                var isVisible = $A.util.getBooleanValue(panelCmp.get('v.visible'));
                
                var event = e || window.event,
                    panelEl = panelCmp.getElement(),
                    target = event.target || event.srcElement;
                if (config.closeOnClickOut && isVisible) {
                    var clickedInside = $A.util.contains(panelEl, target);
                    if (panelEl && !clickedInside) {
                        panelCmp.closedBy = "closeOnClickOut";
                    	if ($A.util.isFunction(closeAction)) {
                        	closeAction(panelCmp, "closeOnClickOut");
                        } else {
                    	    panelCmp.getConcreteComponent().close();
                        }
                    }
                }
            };
        },

        /**
         * show panel based on the config
         * @param cmp
         * @param config
         */
        show: function(cmp, config) {
            if(!cmp.isValid()) {
                return;
            }
            var me = this,
                animEnd    = this.getAnimationEndEventName(),
                animName   = config.animationName,
                panel = cmp.getElement(),
                useTransition = config.useTransition,
                closeButton,
                endEvent = $A.getEvt("markup://ui:panelTransitionEnd"),
                animEl = config.animationEl || panel;

            //make sure animation name is valid 
            if(useTransition) {
            	useTransition = this.validateAnimationName(animName);
            }
            //need to notify panel manager to de-activate other panels;
            cmp.getEvent('notify').setParams({
                action: 'beforeShow',
                typeOf: 'ui:panel',
                payload: { panelInstance: cmp.getGlobalId() }
            }).fire();

            $A.getEvt("markup://ui:panelTransitionBegin").setParams(
                { 
                    panel: cmp, 
                    isOpening: true
                }
            ).fire();


            //endAnimationHandler: cleanup all classes and events
            var finishHandler = $A.getCallback(function () {
                if(!cmp.isValid()) {
                    return;
                }
                
                if (animEl) {
                    $A.util.removeClass(animEl, 'transitioning ' + animName);
                    animEl.removeEventListener(animEnd, finishHandler);
                }
                $A.util.addClass(panel, 'active');
                
                cmp.set('v.visible', true);

                if (config.autoFocus) {
                    me.setFocus(cmp);
                } else {

                    // If auto focus is false attempt to focus
                    // on the close button.
                    closeButton = cmp.getElement().querySelector('.closeBtn');

                    if(closeButton && closeButton.focus) {
                        closeButton.focus();
                    }
                }

                endEvent.setParams({
                    action: 'show', 
                    panelId: cmp.getGlobalId()
                }).fire();

                config.onFinish && config.onFinish();
            });

            if (!$A.util.isUndefinedOrNull(panel)) {
                panel.setAttribute("aria-hidden", 'false');
            }

            if (useTransition) {
                animEl.addEventListener(animEnd, finishHandler, false);

                setTimeout(function() {
                     $A.util.addClass(panel, 'open');
                 },10);
                $A.util.addClass(animEl, 'transitioning ' + animName);

            } else {
                $A.util.addClass(panel, 'open');
                finishHandler();
            }
            
        },

        /**
         * hide panel
         * @param cmp
         * @param config
         */
        hide: function(cmp, config) {
            var animEnd    = this.getAnimationEndEventName(),
                animName   = config.animationName,
                panel = cmp.getElement(),
                panelId = cmp.getGlobalId(),
                useTransition = config.useTransition,
                endEvent = $A.getEvt("markup://ui:panelTransitionEnd"),
                animEl = config.animationEl || panel;

            //make sure animation name is valid 
            if(useTransition) {
                useTransition = this.validateAnimationName(animName);
            }
            
            cmp.set('v.visible', false);
            $A.getEvt("markup://ui:panelTransitionBegin").setParams({ panel: cmp, isOpening: false }).fire();


            //endAnimationHandler: cleanup all classes and events
            var finishHandler = $A.getCallback(function () {

                // make sure the compoment is valid befdore  
                // doining anything with it, because
                // this is asynchronous
                if(cmp.isValid()) {

                    if (config.useTransition) {
                        animEl.removeEventListener(animEnd, finishHandler);
                    }


                    endEvent.setParams({
                        action: 'hide', 
                        panelId: panelId
                    }).fire();
                    cmp._transitionEndFired = true;


                    
                    config.onFinish && config.onFinish();
                    setTimeout(function() {
                        $A.util.removeClass(panel, 'open');
                        $A.util.removeClass(panel, 'active');
                        $A.util.removeClass(animEl, 'transitioning ' + animName);
                    }, 1000); //make sure all transitions are finished

                } else {
                    config.onFinish && config.onFinish();
                }

                
            });

            if (!$A.util.isUndefinedOrNull(panel)) {
                panel.setAttribute("aria-hidden", 'true');
            }

            if (useTransition) {
                animEl.addEventListener(animEnd, finishHandler, false);
                $A.util.addClass(animEl,  'transitioning ' + animName);
            } else {
                finishHandler();
            }
        },

        /**
         * Update panel body
         * @param cmp
         * @param body
         * @param callback
         */
        updatePanel: function(panel, facets, callback) {
            if ($A.util.isObject(facets)) {
                var facet, 
                    currentHeader = panel.get('v.header'),
                    currentFooter = panel.get('v.footer'),
                    body = facets.body || panel.get('v.body');
                for (var key in facets) {
                    facet = facets[key];
                    if (facets.hasOwnProperty(key) && ($A.util.isComponent(facet) || $A.util.isArray(facet))) {
                        panel.set('v.' + key, facet);
                    }
                }
                if (!$A.util.isEmpty(body)) {
                    //set body as value provider to route the events to the body
                    //presume only one root body component
                    var avp = $A.util.isComponent(body) ? body : body[0],
                        header = facets.header,
                        footer = facets.footer;
                    
                    if ($A.util.isComponent(avp)) {
                        avp.setAttributeValueProvider(panel);
                        this._updateAVP(currentHeader, avp);
                        this._updateAVP(currentFooter, avp);
                        this._updateAVP(header, avp);
                        this._updateAVP(footer, avp);
                    }
                }
            }
            callback && callback(panel);
        },

        _updateAVP: function(cmps, avp) {
            if ($A.util.isComponent(cmps)) {
                cmps.setAttributeValueProvider(avp);
            } else if ($A.util.isArray(cmps)) {
                for (var i = 0; i < cmps.length; i++) {
                    cmps[i].setAttributeValueProvider(avp);
                }
            }
        },

        handleNotify: function(cmp, event, helper) {
        	var params = event.getParams();
	        if (!params) {
	            return;
	        }
	        switch (params.action) {
	            case 'destroyPanel':
	                //contained component tries to close the panel but doesn't have access to this panelInstance
	                //attach this id to the event and let it bubble up
	                if (params.typeOf === 'ui:destroyPanel' && !params.payload) {
	                    params.payload = {
	                        panelInstance: cmp.getGlobalId()
	                    };
	                }
	                break;
	            case 'closePanel':
	                event.stopPropagation();
	                helper.close(cmp, params.payload ? params.payload.callback : null, params.payload ? params.payload.shouldReturnFocus : null);
	                break;
	            case 'setFocus':
	                if (cmp.get('v.autoFocus')) {
	                    this.setFocus(cmp);
	                }
	                break;
	        }
        },
        /**
         * Activate or de-activate the panel
         * @param cmp
         * @param active
         */
        setActive: function(cmp, active) {
            if (!cmp.isValid() && !cmp.isRendered()) {
                return;
            }
            var panel = cmp.getElement();
            if (active) {
                $A.util.addClass(panel, 'active');
                panel.setAttribute('aria-hidden', 'false');
                if (cmp.get('v.autoFocus')) {
                    this.setFocus(cmp);
                }
            } else if ($A.util.hasClass(panel, 'active')) {
                cmp.returnFocus = this.getReturnFocusElement(cmp);
                $A.util.removeClass(panel, 'active');
                panel.setAttribute('aria-hidden', 'true');
            }
        },
        
        /**
         * returns the element to be focused when the panel is destroyed.
         * @param cmp
         * @private 
         */
        getReturnFocusElement: function(cmp) {
        	var returnFocusElement = cmp.get('v.returnFocusElement');
            
            if ($A.util.isUndefinedOrNull(returnFocusElement)) {
            	returnFocusElement = document.activeElement;
            }
            
            return returnFocusElement;
        },

        /**
         * returns the vendor prefix
         * @private
         */
        getPrefix : function () {
            if (!this._prefix) {
                var styles = window.getComputedStyle(document.documentElement, ''),
                    pre = (Array.prototype.slice.call(styles).join('').match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o']))[1],
                    up = $A.util.isIE;

                this._prefix = up ? pre.toUpperCase() : pre;
            }
            return this._prefix;
        },

        /**
         * returns the animationEnd event name
         * @private
         */
        getAnimationEndEventName: function () {
            var eventName = this.ANIMATION_END_EVENT_NAMES[this.getPrefix()];
            return eventName ? eventName : 'animationend';
        },

        /**
         * determines the element is visible or not
         * @private
         */
        isVisible: function(el) {
            while (el && el.style) {
                var computedStyle = window.getComputedStyle(el);
                if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden') {
                    return false;
                }
                el = el.parentNode;
            }
            return true;
        },

        /**
         * determines the element is focusable or not
         * @private
         */
        focusAllowed: function(el) {
            return el && !el.disabled && !/hidden/i.test(el.type) && this.isVisible(el) && el.getAttribute("tabindex") !== "-1";
        },

        /**
         * Determines whether two elements are the same tab stop (accounting for radio buttons)
         * @private
         */
        isSameTabstop: function(el1, el2) {
            return el1 === el2 || (/radio/i.test(el1.type) && /radio/i.test(el2.type) && el1.name === el2.name);
        },

        /**
         * Set to first focusable element
         * @private
         */
        setFocus: function(cmp) {
            if(cmp.isValid()) {
                var el;
                el = cmp.getElement();
                // TODO: commented out to work around bug
                // in the app, return when that is fixed: W-2942958
                // if(cmp.returnFocus) {
                //     cmp.returnFocus.focus();
                // } else 
                if(el && el.querySelectorAll) {
                    var focusables = this.getFocusables(el);
                    focusables.initial && focusables.initial.focus();
                }
            }
        },

        scopeScrollables: function (cmp) {
            var self = this;
            var dom = cmp.getElement();
            var scrollables = dom.querySelectorAll('.scrollable');
            var observerConfig = { attributes: true, childList: true, characterData: true, subtree: true };

            for (var i = 0; i < scrollables.length; i++) {
                this.scopeScroll(scrollables[i]);
            }

            // watch for changes to the subtree so that scroll can
            // be re-scoped
            if(!cmp._observer && !$A.util.isUndefinedOrNull(window.MutationObserver)) { //phantomjs check
                cmp._observer = new MutationObserver($A.getCallback(function() {
                    if(cmp.isValid()) {
                        self.scopeScrollables(cmp);
                    } 
                }));
                cmp._observer.observe(dom, observerConfig);
            }
        },
        
        scopeScroll: function (dom) {
            scrollUtil.scope(dom);
        },
        unscopeScroll: function (dom) {
            scrollUtil.unscope(dom);
        },
        ANIMATION_END_EVENT_NAMES : {
            webkit : 'webkitAnimationEnd',
            o : 'oAnimationEnd',
            moz : 'animationend',
            ms : 'animationend' // IE 10 or above
        }
    };
    return lib;
}
