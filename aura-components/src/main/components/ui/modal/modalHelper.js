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

    show: function(cmp, callback) {
        var containerEl = cmp.getElement(),
            panel = cmp.find('panel').getElement();

        this.mask(cmp);

        this.lib.panelLibCore.show(cmp, {
            useTransition: $A.util.getBooleanValue(cmp.get('v.useTransition')),
            animationName: 'movefrom' + cmp.get('v.animation'),
            animationEl: panel,
            autoFocus: $A.util.getBooleanValue(cmp.get('v.autoFocus')),
            onFinish: function() {
                $A.util.on(containerEl, 'keydown', cmp._windowKeyHandler);
                callback && callback();
            }
        });
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
            mask = cmp.find('modal-glass').getElement();

        mask.style.opacity = '0';
        panel.style.opacity = '0';

        this.lib.panelLibCore.hide(cmp, {
            useTransition: $A.util.getBooleanValue(cmp.get('v.useTransition')),
            animationName: 'moveto' + cmp.get('v.animation'),
            animationEl: panel,
            onFinish: function() {
                $A.util.removeOn(containerEl, 'keydown', cmp._windowKeyHandler);
                callback && callback();
            }
        });
    },

    update: function(cmp, content, callback) {
        //TODO: need more work
        cmp.set('v.body', content);
        callback && callback();
    },

    mask: function(cmp) {
        var mask = cmp.find('modal-glass').getElement();
        $A.util.addClass(mask, 'fadeIn');
        $A.util.removeClass(mask, 'hidden');
    }
})