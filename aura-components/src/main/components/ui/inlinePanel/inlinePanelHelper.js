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
     * @param  {Component} component
     * @param  {String} type of handler, key or mouse
     * @return {Function}
     *
     * In panel.cmp this is two funcitons that were identical,
     * so this combines them into one. There is some ugly string wrangling
     * that might be worse than just having a switch
     * but I really didn't like having the same logic in two places
     */
    _getHandler: function(cmp, type) {
        if(!cmp.isValid()) {
            return undefined; // undefined if the component is not valid
        }
        
        var handleName = "_" + type + "Handler";
        var libMethod = "get" + type.charAt(0).toUpperCase() + type.slice(1) + "EventListener";
        var conf = {};
        var closeAction = cmp.get("v.closeAction");
        var trapFocus = $A.util.getBooleanValue(cmp.get('v.trapFocus'));

        if(type === 'key') {
            conf = {closeOnEsc: true, closeOnTabOut: true, trapFocus: trapFocus};
        } else if (type === 'mouse') {
            conf = {closeOnClickOut: true};
            closeAction = function(panelCmp, action) {
                if (panelCmp.get('v.closeOnClickOut')) {
                    var callback = panelCmp.get("v.closeAction");
                    if ($A.util.isFunction(callback)) {
                        callback(panelCmp, action);
                    } else {
                        panelCmp.getConcreteComponent().close();
                    }
                }
            };
        }
        
        if(!cmp[handleName]) {
            cmp[handleName] = this.lib.panelLibCore[libMethod](cmp, conf, closeAction);
        }
        return cmp[handleName];
    },

    hide: function(cmp, callback) {
        var handler = this._getHandler(cmp, 'mouse');
        if ($A.util.isFunction(handler)) {
            document.removeEventListener('click', handler);
        }

        var el = cmp.getElement();
        el.classList.remove('open');

        this.lib.panelLibCore.hide(cmp, {
            onFinish: function() {
                cmp.set('v.visible', false);
                callback && callback();
            }
        });
    },

    show: function(cmp, callback) {

        var refEl = cmp.get('v.referenceElement');
        var el = cmp.getElement();
        var self = this;
        var closeOnClickOut = cmp.get('v.closeOnClickOut');
        var mouseHandler;
        var keyhandler;
        var vis = cmp.get('v.visible');
        if(vis) {
            return;
        }

        cmp.set('v.visible', true);
        refEl.appendChild(el);


        if (closeOnClickOut) {
            mouseHandler = this._getHandler(cmp, 'mouse');
        }

        keyhandler = this._getHandler(cmp, 'key');
        el.addEventListener('keydown', keyhandler);

        setTimeout($A.getCallback(function(){
            document.addEventListener('click', mouseHandler);
            self.lib.panelLibCore.setFocus(cmp);
        }), 10);
        el.classList.add('open');
        callback && callback();
    },

    close: function(cmp, callback) {

        var refEl = cmp.get('v.referenceElement');
        var el = cmp.getElement();
        var handler = this._getHandler(cmp, 'mouse');
        if ($A.util.isFunction(handler)) {
            document.removeEventListener('click', handler);
        }

        cmp.hide(function () {
            if (!cmp.isValid()) {
                return;
            }

            cmp.getEvent('notify').setParams({
                action: 'destroyPanel',
                typeOf: 'ui:destroyPanel',
                payload: {panelInstance: cmp.getGlobalId()}
            }).fire();

            try {
                refEl.removeChild(el);
            } catch (e) {
                /*
                We could check if the element was a child
                of the parent, but that takes time
                and this works just as well, because usually it
                will be
                */
            }
            callback && callback();
        });
    }

})// eslint-disable-line semi