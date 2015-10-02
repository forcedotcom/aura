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
    	var closeAction = cmp.get("v.closeAction");
        //handler for closeOnEsc and closeOnTabOut
        cmp._windowKeyHandler = this.lib.panelLibCore.getKeyEventListener(cmp, {closeOnEsc: true, closeOnTabOut:true}, closeAction);
        //handler for closeOnClickOut
        cmp._mouseEventHandler = this.lib.panelLibCore.getMouseEventListener(cmp, {closeOnClickOut: cmp.get('v.closeOnClickOut')}, closeAction);
      //create default close button
        if ($A.util.isEmpty(cmp.get('v.closeButton')) && cmp.get('v.showCloseButton')) {
            $A.componentService.createComponent('ui:button', {
                'body': $A.newCmp({componentDef: 'aura:unescapedHtml', attributes: {values: {value: '&times;'}}}),
                'class': "closeBtn",
                'press': cmp.getReference("c.onCloseBtnPressed"),
                'label': cmp.get('v.closeDialogLabel'),
                'buttonTitle': cmp.get('v.closeDialogLabel'),
                'labelDisplay': "false"
            }, function(button){
                cmp.set('v.closeButton', button);
            });
        }
    },

    _getReferenceElement: function(cmp) {

        var referenceElementSelector = cmp.get("v.referenceElementSelector");
        var referenceEl = cmp.get('v.referenceElement');
        
        if(!referenceEl) {
            referenceEl = referenceElementSelector ? document.querySelector(referenceElementSelector) : null;
        }
        
        // refereceElement is an array or NodeList, grabbing first element 
        if (referenceEl && ($A.util.isArray(referenceEl) || referenceEl.hasOwnProperty('length') || 
        		typeof referenceEl.length === 'number')) {
        	referenceEl = referenceEl.length > 0 ? referenceEl[0] : null;
        }

        return referenceEl;
    },


    show: function (cmp, callback) {
        var autoFocus = cmp.get('v.autoFocus');
        var panelEl = cmp.getElement();
        var referenceEl = this._getReferenceElement(cmp);
        
        cmp.set('v.visible', true);

        var self = this;

        var conf = {
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
                
                if(referenceEl) {
                    panelEl.style.visibility = 'hidden';
                    
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
                    $A.warning('Target element for panel not found.');
                }
            
                callback && callback();
            }
        };

        if (referenceEl) {
            panelEl.style.opacity = '0';
            panelEl.style.display = 'block';
            this.position(cmp, referenceEl, function() {
                self.positioningLib.panelPositioning.reposition();
                cmp.positioned = true;
                requestAnimationFrame(function() {
                    panelEl.style.opacity = '1';
                    self.lib.panelLibCore.show(cmp, conf);
                });
                
            });
        } else {
            this.lib.panelLibCore.show(cmp, conf);
        }
        
    },

    reposition: function(cmp, callback) {
        if(cmp.positioned) { // reposition will blow up
                             // if you call it before positioning
            var referenceEl = this._getReferenceElement(cmp);
            this.cleanPositioning(cmp);
            if(referenceEl) {
                this.position(cmp, referenceEl, callback);
            }
        }
    },

    hide: function (cmp, callback) {
        var panelEl = cmp.getElement();
        panelEl.style.opacity = 0;
        this.lib.panelLibCore.hide(cmp, {
            useTransition: cmp.get('v.useTransition'),
            animationName: 'moveto' + cmp.get('v.animation'),
            onFinish: function() {
                if(cmp.isValid()) {
                    if(cmp.positioned) {
                        panelEl.style.display = 'none';
                    }
                    $A.util.removeOn(panelEl, 'keydown', cmp._windowKeyHandler);
                    $A.util.removeOn(document, 'click', cmp._mouseEventHandler);
                    cmp.set('v.visible', false);
                    callback && callback();
                } else {
                    // The panel has already been destroyed, 
                    // possibly by someobody else. Call the callback.
                    callback && callback();
                }
            }
        });
    },

    close: function (cmp, callback) {
        var self = this;
        cmp.hide(function () {
            if (!cmp.isValid()) {
                return;
            }

            self.cleanPositioning(cmp);

            cmp.getEvent('notify').setParams({
                action: 'destroyPanel',
                typeOf: 'ui:destroyPanel',
                payload: {panelInstance: cmp.getGlobalId()}
            }).fire();
            if ($A.util.isFunction(callback)) {
            	callback();
            }
        });
    },

    cleanPositioning: function(cmp) {
        if(cmp.constraints) {
            cmp.constraints.forEach(function(constraint) {
                constraint.destroy();
            });

            cmp.constraints = null;
        }
    },

    position: function(cmp, referenceEl, callback) {

        var direction = cmp.get('v.direction'), 
            showPointer = cmp.get('v.showPointer'),
            align, 
            targetAlign, 
            pointer,
            bbDirections,
            pointerPad;
        
        cmp.getElement().classList.add('positioned');
        cmp.getElement().classList.add(direction);
        if(showPointer) {
            pointer = cmp.find('pointer').getElement();
        }

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
                pad: 20
            }));

            if(pointer) {
                cmp.constraints.push(this.positioningLib.panelPositioning.createRelationship({
                    element:pointer,
                    target:referenceEl,
                    align: align,
                    targetAlign: targetAlign,
                    enable: true,
                    pad: pointerPad
                }));
            }

            if(pointer && direction === 'east') {
                cmp.constraints.push(this.positioningLib.panelPositioning.createRelationship({
                    element:pointer,
                    target:cmp.getElement(),
                    align: 'right center',
                    targetAlign: 'left center',
                    enable: true,
                    pad: pointerPad
                }));
            }

            if(pointer && direction === 'west') {
                cmp.constraints.push(this.positioningLib.panelPositioning.createRelationship({
                    element:pointer,
                    target:cmp.getElement(),
                    align: 'left center',
                    targetAlign: 'right center',
                    enable: true,
                    pad: pointerPad
                }));
            }
            
            if(pointer) {
                cmp.constraints.push(this.positioningLib.panelPositioning.createRelationship({
                    element:pointer,
                    target:cmp.getElement(),
                    type:'bounding box',
                    enable: true,
                    boxDirections: bbDirections,
                    pad: 5
                }));
            }

            // The following constraints are there
            // to keep east and west panels inside the viewport where possible
            // but still allow them to leave the viewport cleanly on scroll and 
            // never open with a panel top outside the viewport
            // W-2678291 & W-2701440
            if(direction === 'east' || direction === 'west') {

                // keep the panel above the bottom of the viewport...
                cmp.constraints.push(this.positioningLib.panelPositioning.createRelationship({
                        element:cmp.getElement(),
                        target:window,
                        type:'bounding box',
                        enable: true,
                        boxDirections: {
                            top: false,
                            bottom: true
                        },
                        pad: 5
                }));

                // unless it would go off screen to the top
                cmp.constraints.push(this.positioningLib.panelPositioning.createRelationship({
                        element:cmp.getElement(),
                        target:window,
                        type:'bounding box',
                        enable: true,
                        boxDirections: {
                            top: true,
                            bottom: false
                        },
                        pad: 5
                }));
            }

            // this constraint will keep the pointer attached to the panel,
            // so if the target is scrolled out of the viewport the whole panel will go with it
            if(pointer && (direction === 'east' || direction === 'west')) {
                cmp.constraints.push(this.positioningLib.panelPositioning.createRelationship({
                    element:cmp.getElement(),
                    target:pointer,
                    type:'inverse bounding box',
                    enable: true,
                    boxDirections: {
                        top: true,
                        bottom: true
                    },
                    pad: 5
                }));
            }
            
            this.positioningLib.panelPositioning.reposition(callback);
        } else {
            this.positioningLib.panelPositioning.reposition(callback);
        }
    }
})// eslint-disable-line semi
