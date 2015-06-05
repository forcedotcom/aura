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
        //handler for closeOnEsc and closeOnTabOut
        cmp._windowKeyHandler = this.lib.panelLibCore.getKeyEventListener(cmp, {closeOnEsc: true, closeOnTabOut:true});
        cmp._mouseEventHandler = this.lib.panelLibCore.getMouseEventListener(cmp, {closeOnClickOut: true});
    },

    show: function (cmp, callback) {
        var autoFocus = cmp.get('v.autoFocus');
        var panelEl = cmp.getElement();
        //move the dialog to the right position
        var referenceEl = cmp.get("v.referenceElement");
        var referenceElementSelector = cmp.get("v.referenceElementSelector");
        
        if (referenceEl || referenceElementSelector) {
            panelEl.style.visibility = 'hidden';
            
        }

        var self = this;

        this.lib.panelLibCore.show(cmp, {
            useTransition: cmp.get('v.useTransition'),
            animationName: 'movefrom' + cmp.get('v.animation'),
            autoFocus: false,
            onFinish: function() {
                $A.util.on(panelEl, 'keydown', cmp._windowKeyHandler);
                if (cmp.get('v.closeOnClickOut')) {
                    //Need to attach event in setTimeout in case the same click event that fires the show panel event
                    //bubbles up to the document, and if the closeOnClickOut is true, it causes the panel to close right away
                    //if the click is outside of the panel
                    window.setTimeout(function () {
                        $A.util.on(document, 'click', cmp._mouseEventHandler);
                    }, 0);
                }
                
                if (referenceEl || referenceElementSelector) {
                    if(referenceElementSelector) {
                        referenceEl = document.querySelector(referenceElementSelector);
                    }
                    if(referenceEl) {
                        self.position(cmp, referenceEl);
                        requestAnimationFrame(function() {
                            panelEl.style.visibility = 'visible';
                            //need to set focus after animation frame
                            if (autoFocus) {
                                self.lib.panelLibCore.setFocus(cmp);
                            }
                        });
                    } else {
                        panelEl.style.visibility = 'visible';
                        if (autoFocus) {
                            self.lib.panelLibCore.setFocus(cmp);
                        }
                        $A.warn('Target element for panel not found.');
                    }
                }

                callback && callback();
            }
        });
    },

    hide: function (cmp, callback) {
        var panelEl = cmp.getElement();
        this.lib.panelLibCore.hide(cmp, {
            useTransition: cmp.get('v.useTransition'),
            animationName: 'moveto' + cmp.get('v.animation'),
            onFinish: function() {
                $A.util.removeOn(panelEl, 'keydown', cmp._windowKeyHandler);
                $A.util.removeOn(document, 'click', cmp._mouseEventHandler);
                callback && callback();
            }
        });
    },

    close: function (cmp, callback) {
        cmp.hide(function () {
            if (!cmp.isValid()) {
                return;
            }
            if(cmp.constraints) {
                cmp.constraints.forEach(function(constraint) {
                    constraint.destroy();
                });
            }
            cmp.getEvent('notify').setParams({
                action: 'destroyPanel',
                typeOf: 'ui:destroyPanel',
                payload: {panelInstance: cmp.getGlobalId()}
            }).fire();
        });
    },

    position: function(cmp, referenceEl) {

        var direction = cmp.get('v.direction'), 
            align, 
            targetAlign, 
            pointer,
            bbDirections,
            pointerPad;
        
        cmp.getElement().classList.add('positioned');
        cmp.getElement().classList.add(direction);
        pointer = cmp.find('pointer').getElement();

        switch (direction) {
            case 'north':
                align = 'center bottom';
                targetAlign = 'center top';
                bbDirections = {
                    left:true,
                    right:true
                };
                break;
            case 'south':
                align = 'center top';
                targetAlign = 'center bottom';
                bbDirections = {
                    left:true,
                    right:true
                };
                break;
            case 'west':
                align = 'right center';
                targetAlign = 'left center';
                pointerPad = -15;
                bbDirections = {
                    top:true,
                    bottom:true
                };
                break;
            case 'east':
                align = 'left center';
                targetAlign = 'right center';
                pointerPad = -15;
                bbDirections = {
                    top:true,
                    bottom:true
                };
                break;
        }

        if(!cmp.constraints) {
            cmp.constraints = [];
            cmp.constraints.push(this.positioningLib.panelPositioning.createRelationship({
                element:cmp.getElement(),
                target:referenceEl,
                align:align,
                targetAlign: targetAlign,
                enable: true,
                pad: 15
            }));
            cmp.constraints.push(this.positioningLib.panelPositioning.createRelationship({
                element:cmp.getElement(),
                target:window,
                type: 'bounding box',
                enable: true,
                pad: 5
            }));

            cmp.constraints.push(this.positioningLib.panelPositioning.createRelationship({
                element:pointer,
                target:referenceEl,
                align: align,
                targetAlign: targetAlign,
                enable: true,
                pad: pointerPad
            }));

            if(direction === 'east') {
                cmp.constraints.push(this.positioningLib.panelPositioning.createRelationship({
                    element:pointer,
                    target:cmp.getElement(),
                    align: 'right center',
                    targetAlign: 'left center',
                    enable: true,
                    pad: pointerPad
                }));
            }

            if(direction === 'west') {
                cmp.constraints.push(this.positioningLib.panelPositioning.createRelationship({
                    element:pointer,
                    target:cmp.getElement(),
                    align: 'left center',
                    targetAlign: 'right center',
                    enable: true,
                    pad: pointerPad
                }));
            }
            
            cmp.constraints.push(this.positioningLib.panelPositioning.createRelationship({
                element:pointer,
                target:cmp.getElement(),
                type:'bounding box',
                enable: true,
                boxDirections: bbDirections,
                pad: 5
            }));

            this.positioningLib.panelPositioning.reposition();
        } else {
            this.positioningLib.panelPositioning.reposition();
        }
    }
})
