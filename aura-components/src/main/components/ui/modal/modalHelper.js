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
    init: function(cmp) {
        //handler for tab key to trap the focus within the modal
        cmp._windowKeyHandler = this.lib.panelLibCore.getKeyEventListener(cmp, {closeOnEsc: true, trapFocus: true});
    },

    validateAnimationName: function(name) {
        return name.match(/top|left|right|bottom|center|pop/) ? true : false;
    },

    show: function(cmp, callback) {
        var containerEl = cmp.getElement(),
            autoFocus = $A.util.getBooleanValue(cmp.get('v.autoFocus')),
            useTransition = $A.util.getBooleanValue(cmp.get('v.useTransition')),
            panel = cmp.find('panel').getElement();

        if(useTransition) {
            useTransition = this.validateAnimationName(cmp.get('v.animation'));
        }
        this.mask(cmp);
        if(useTransition) {
            panel.style.opacity = 0;
            containerEl.style.display = 'block';
        }

        var config = {
            useTransition: useTransition,
            animationName: 'movefrom' + cmp.get('v.animation'),
            animationEl: panel,
            autoFocus: autoFocus,
            onFinish: function() {
                $A.util.on(containerEl, 'keydown', cmp._windowKeyHandler);

                // For modal panels if autofocus is false the close button
                // should be focused.
                // 
                // 
                if(!autoFocus) {
                    var closeButton = containerEl.querySelector('.closeBtn');
                    if(closeButton) {
                        closeButton.focus();
                    }
                }
                callback && callback();
            }
        };

        var self = this;
        if(useTransition) {
            setTimeout(function() {
                panel.style.opacity = 1;
                self.lib.panelLibCore.show(cmp, config);
            }, 50);
        } else {
            self.lib.panelLibCore.show(cmp, config);
        }
        
        
    },

    close: function (cmp, callback) {
        cmp.hide(function () {
            if (cmp.isValid()) {
                cmp.getEvent('notify').setParams({
                    action: 'destroyPanel',
                    typeOf: 'ui:destroyPanel',
                    payload: {panelInstance: cmp.getGlobalId()}
                }).fire();
            }
        });
    },

    hide: function (cmp, callback) {
        var containerEl = cmp.getElement(),
            panel = cmp.find('panel').getElement(),
            animationName = cmp.get('v.animation'),
            useTransition = $A.util.getBooleanValue(cmp.get('v.useTransition')),
            closeAnimation = cmp.get('v.closeAnimation'),
            mask = cmp.find('modal-glass').getElement();

        
        if(useTransition) {
            panel.style.opacity = '0';
            setTimeout(function() {
                 mask.style.opacity = '0';
            }, 50);
        }
        
        // mask.classList.remove('fadein');
        if(closeAnimation) {
            animationName = closeAnimation;
        }


        var config = {
            useTransition: useTransition,
            animationName: 'moveto' + animationName,
            animationEl: panel,
            onFinish: function() {
                $A.util.removeOn(containerEl, 'keydown', cmp._windowKeyHandler);
                if(callback) { //give time for all transitions to complete
                    setTimeout(callback, 2);
                }
            }
        };

        if(closeAnimation) {
            config.animationName = 'moveto' + closeAnimation;
        }

        this.lib.panelLibCore.hide(cmp, config);
    },

    mask: function(cmp) {
        var useTransition = $A.util.getBooleanValue(cmp.get('v.useTransition'));
        var mask = cmp.find('modal-glass').getElement();

        $A.util.removeClass(mask, 'hidden');
        $A.util.addClass(mask, 'fadein');
        if(useTransition) {
            setTimeout(function() {
                mask.style.opacity = 0.8;
            },10);
        } else {
            mask.style.opacity = 1;
        }
        
        
        
    }
})