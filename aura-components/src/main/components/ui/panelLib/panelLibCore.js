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
function () {
    'use strict';

    var lib = {

        /**
         * returns the initial, first and last focusable in the given panel
         * @param containerEl
         * @returns {{initial: *, first: *, last: *}}
         */
        getFocusables: function(containerEl) {
            var els = containerEl.querySelectorAll('input,button,a,textarea,select'),
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
         * @param config {closeOnEsc, trapFocus, closeOnTabOut}
         * @returns {Function}
         */
        getKeyEventListener: function(cmp, config) {
            var me = this, config = config || {};

            return function(e) {
                if (!cmp.isValid()) {
                    return;
                }
                var event = e || window.event,
                    keyCode = event.keyCode;

                if (keyCode == 27 && config.closeOnEsc) {
                    //escape to close
                    $A.util.squash(e);
                    cmp.close(cmp);
                } else if (keyCode == 9) {
                    //close on tab out
                    var shiftPressed = event.shiftKey,
                        current = document.activeElement,
                        focusables = me.getFocusables(cmp.getElement());

                    if (config.trapFocus) {
                        if (current === focusables.last && !shiftPressed) {
                            $A.util.squash(event, true);
                            focusables.first.focus();
                        } else if (current === focusables.first && shiftPressed) {
                            $A.util.squash(event, true);
                            focusables.last.focus();
                        }
                    } else if (config.closeOnTabOut) {
                        if (current === focusables.last && !shiftPressed) {
                            $A.util.squash(event, true);
                            cmp.close(cmp);
                        }
                    }
                }
            };
        },

        /**
         * returns the mouse event handler function that do things base on the config
         * @param panelCmp
         * @param config {closeOnClickOut}
         * @returns {Function}
         */
        getMouseEventListener: function(panelCmp, config) {
            return function(e) {
                if (!panelCmp.isValid()) {
                    return;
                }
                var event = e || window.event,
                    panelEl = panelCmp.getElement(),
                    target = event.target || event.srcElement;
                if (config.closeOnClickOut) {
                    var clickedInside = $A.util.contains(panelEl, target);
                    if (panelEl && !clickedInside) {
                        panelCmp.close();
                    }
                }
            }
        },

        /**
         * show panel based on the config
         * @param cmp
         * @param config
         */
        show: function(cmp, config) {
            var me = this,
                animEnd    = this.getAnimationEndEventName(),
                animName   = config.animationName,
                panel = cmp.getElement(),
                animEl = config.animationEl || panel;

            //need to notify panel manager to de-activate other panels;
            cmp.getEvent('notify').setParams({
                action: 'deActivatePanels',
                typeOf: 'ui:showPanel',
                payload: { panelInstance: cmp.getGlobalId() }
            }).fire();

            //endAnimationHandler: cleanup all classes and events
            var finishHandler = function (e) {
                if (animEl) {
                    $A.util.removeClass(animEl, 'transitioning ' + animName);
                    animEl.removeEventListener(animEnd, finishHandler);
                }
                // This is use by the WebDriver test to detect that the sliding animation is done.
                $A.util.addClass(panel, 'active panelReady');

                if (config.autoFocus) {
                    me.setFocus(cmp);
                }
                config.onFinish && config.onFinish();
            };

            panel.setAttribute("aria-hidden", 'false');
            if (config.useTransition) {
                animEl.addEventListener(animEnd, finishHandler, false);
                $A.util.addClass(animEl, 'transitioning ' + animName);
                $A.util.addClass(panel, 'open');
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
                animEl = config.animationEl || panel;
            //endAnimationHandler: cleanup all classes and events
            var finishHandler = function (e) {
                if (config.useTransition) {
                    panel.removeEventListener(animEl, finishHandler);
                    $A.util.removeClass(animEl, 'transitioning ' + animName);
                }
                $A.util.removeClass(panel, 'open active panelReady');
                config.onFinish && config.onFinish();
            };

            panel.setAttribute("aria-hidden", 'true');
            if (config.useTransition) {
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
        updatePanel: function(cmp, body, callback) {
            cmp.set('v.body', body);
            callback && callback();
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
                $A.util.removeClass(panel, 'active');
                panel.setAttribute('aria-hidden', 'true');
            }
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
                if (window.getComputedStyle(el).display == 'none') {
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
            return el && !el.disabled && !/hidden/i.test(el.type) && this.isVisible(el);
        },

        /**
         * Set to first focusable element
         * @private
         */
        setFocus: function(cmp) {
            var focusables = this.getFocusables(cmp.getElement());
            focusables.initial && focusables.initial.focus();
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