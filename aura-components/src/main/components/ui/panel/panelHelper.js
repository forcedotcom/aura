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
    DIRECTION_MAP : {
        'left top': 'east',
        'left center': 'east',
        'right top': 'west',
        'right center': 'west',
        'center top': 'south',
        'center center': 'north',
        'left bottom': 'north',
        'right bottom': 'north',
        'center bottom':  'north'
    },

    DIRECTION_CFG_HANDLER: {
        'north': function (config) {
            config.align = 'center bottom';
            config.targetAlign = 'center top';
            config.bbDirections = {
                left:true,
                right:true
            };
        },
        'south': function (config) {
            config.align = 'center top';
            config.targetAlign = 'center bottom';
            config.bbDirections = {
                left:true,
                right:true
            };
        },
        'west':  function (config) {
            config.align = 'right center';
            config.targetAlign = 'left center';
            config.pointerPad = -15;
            config.bbDirections = {
                top:true,
                bottom:true
            };
        },
        'east': function (config) {
            config.align = 'left center';
            config.targetAlign = 'right center';
            config.pointerPad = -15;
            config.bbDirections = {
                top:true,
                bottom:true
            };
        },
        'southeast': function (config) {
            config.align = 'left top';
            config.targetAlign = 'right bottom';
            config.bbDirections = {
                top:true,
                bottom:true
            };
        },
        'southwest': function (config) {
            config.align = 'right top';
            config.targetAlign = 'left bottom';
            config.bbDirections = {
                top:true,
                bottom:true
            };
        },
        'northwest': function (config) {
            config.align = 'right bottom';
            config.targetAlign = 'left top';
            config.bbDirections = {
                top:true,
                bottom:true
            };
        },
        'northeast': function (config) {
            config.align = 'left bottom';
            config.targetAlign = 'right top';
            config.bbDirections = {
                top: true,
                bottom: true
            };
        }
    },

    init: function(cmp) {
        var closeAction = cmp.get("v.closeAction");
        //handler for tab key to trap the focus within the modal
        var trapFocus = $A.util.getBooleanValue(cmp.get('v.trapFocus'));
        cmp._windowKeyHandler = this.lib.panelLibCore.getKeyEventListener(cmp, {
            closeOnEsc: true,
            trapFocus: trapFocus
        }, closeAction);
        this._initCloseBtn(cmp);
    },

    _initCloseBtn: function (cmp) {
        //create default close button
        if ($A.util.isEmpty(cmp.get('v.closeButton')) && cmp.get('v.showCloseButton')) {
            $A.componentService.createComponent('markup://ui:button', {
                'body': $A.createComponentFromConfig({
                    descriptor: 'markup://aura:unescapedHtml',
                    attributes: {
                        value: '&times;'
                    }
                }),
                'class': "closeBtn",
                'press': cmp.getReference("c.onCloseBtnPressed"),
                'label': cmp.get('v.closeDialogLabel'),
                'buttonTitle': cmp.get('v.closeDialogLabel'),
                'labelDisplay': "false"
            }, function(button, status){
                if (status === "SUCCESS") {
                    cmp.set('v.closeButton', button);
                }
            });
        }

        var direction = cmp.get("v.direction");
        if(direction && direction.match(/(north|south)(east|west)/)) {
            cmp.set('v.showPointer', false);
        }
    },

    _getKeyHandler: function(cmp) {
        if (!cmp._keyHandler && cmp.isValid()) {
            var closeAction = cmp.get("v.closeAction");
            var trapFocus = $A.util.getBooleanValue(cmp.get('v.trapFocus'));
            cmp._keyHandler = this.lib.panelLibCore.getKeyEventListener(cmp, {
                closeOnEsc: true,
                closeOnTabOut:true,
                shouldReturnFocus:true,
                trapFocus: trapFocus
            }, closeAction);
        }
        return cmp._keyHandler;
    },

    _getMouseHandler: function (cmp) {
        if (!cmp._mouseHandler && cmp.isValid()) {
            var closeAction = cmp.get("v.closeAction");
            cmp._mouseHandler = this.lib.panelLibCore.getMouseEventListener(cmp, {closeOnClickOut: cmp.get('v.closeOnClickOut')}, closeAction);
        }
        return cmp._mouseHandler;
    },

    _getReferenceElement: function (cmp) {
        var referenceElementSelector = cmp.get("v.referenceElementSelector");
        var referenceEl = cmp.get('v.referenceElement');

        if(!referenceEl) {
            referenceEl = referenceElementSelector ? document.querySelector(referenceElementSelector) : null;
        }

        // refereceElement is an array or NodeList, grabbing first element
        if (referenceEl && !this.positioningLib.positioningUtils.isWindow(referenceEl) && ($A.util.isArray(referenceEl) || referenceEl.hasOwnProperty('length') ||
            typeof referenceEl.length === 'number')) {
            referenceEl = referenceEl.length > 0 ? referenceEl[0] : null;
        }

        return referenceEl;
    },

    _getRootPanelCmp: function(cmp) {
        if ($A.util.isUndefinedOrNull(cmp) || !cmp.isValid()) {
            return undefined;
        }

        if (cmp.getDef().getDescriptor().getQualifiedName() === 'markup://ui:panel') {
            return cmp;
        } else {
            return this._getRootPanelCmp(cmp.getSuper());
        }
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
                var keyHandler = self._getKeyHandler(cmp);
                if ($A.util.isFunction(keyHandler)) {
                    $A.util.on(panelEl, 'keydown', keyHandler);
                }
                if (cmp.get('v.closeOnClickOut')) {
                    //Need to attach event in setTimeout in case the same click event that fires the show panel event
                    //bubbles up to the document, and if the closeOnClickOut is true, it causes the panel to close right away
                    //if the click is outside of the panel
                    var mouseHandler = self._getMouseHandler(cmp);
                    if ($A.util.isFunction(mouseHandler)) {
                        window.setTimeout(function () {
                            $A.util.on(document, 'click', mouseHandler);
                        }, 0);
                    }
                }

                if(referenceEl) {
                    panelEl.style.visibility = 'hidden';

                    requestAnimationFrame($A.getCallback(function() {
                        panelEl.style.visibility = 'visible';
                        //need to set focus after animation frame
                        if (autoFocus) {
                            self.lib.panelLibCore.setFocus(cmp);
                        }
                    }));
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
            this.position(cmp, referenceEl, $A.getCallback(function() {
                self.positioningLib.panelPositioning.reposition();
                cmp.positioned = true;
                requestAnimationFrame($A.getCallback(function() {
                    panelEl.style.opacity = '1';
                    self.lib.panelLibCore.show(cmp, conf);
                }));

            }));
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
        var self = this;
        this.lib.panelLibCore.hide(cmp, {
            useTransition: cmp.get('v.useTransition'),
            animationName: 'moveto' + cmp.get('v.animation'),
            onFinish: function() {
                if(cmp.isValid()) {
                    if(cmp.positioned) {
                        panelEl.style.display = 'none';
                    }
                    var keyHandler = self._getKeyHandler(cmp);
                    if ($A.util.isFunction(keyHandler)) {
                        $A.util.removeOn(panelEl, 'keydown', keyHandler);
                    }
                    var mouseHandler = self._getMouseHandler(cmp);
                    if ($A.util.isFunction(mouseHandler)) {
                        $A.util.removeOn(document, 'click', mouseHandler);
                    }
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

    close: function (cmp, callback, shouldReturnFocus) {
        if (!cmp.isValid()) {
            return;
        }
        // shouldReturnFocus defaults to true if it is not explicitly passed in.
        if ($A.util.isUndefinedOrNull(shouldReturnFocus) || shouldReturnFocus) {
            this.focusLib.stackUtil.unstackFocus(cmp);
        }

        var self = this;

        cmp.getConcreteComponent().hide(function () {
            if (!cmp.isValid()) {
                return;
            }

            self.cleanPositioning(cmp);

            cmp.getEvent('notify').setParams({
                action: 'destroyPanel',
                typeOf: 'ui:destroyPanel',
                payload: {panelInstance: cmp.getGlobalId(), shouldReturnFocus: shouldReturnFocus }
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
        var config = this._buildConfig(cmp, referenceEl);

        this._buildClassList(cmp, config);

        if(!cmp.constraints) {
            this._createConstraints(cmp, config);
        }

        this.positioningLib.panelPositioning.reposition(callback);
    },

    _buildConfig: function (cmp, referenceEl) {
        var config = {
            direction: cmp.get('v.direction'),
            align: "",
            pad: cmp.get('v.pad'),
            padTop:  cmp.get('v.pad'),
            advancedConfig: cmp.get('v.advancedConfig'),
            targetAlign: "",
            pointer: cmp.get('v.showPointer') ? this._getRootPanelCmp(cmp).find('pointer').getElement() : null,
            bbDirections: {},
            boundingElement: cmp.get('v.boundingElement') || window,
            pointerPad: cmp.get("v.pointerPad"),
            boundingBoxPad: cmp.get("v.boundingBoxPad"),
            boxDirectionPad: cmp.get("v.boxDirectionPad"),
            referenceEl: referenceEl
        };

        if (!config.advancedConfig) {
            if (this.DIRECTION_CFG_HANDLER[config.direction]) {
                this.DIRECTION_CFG_HANDLER[config.direction].apply(this, [config]);
            } else {
                if(config.direction) {
                    $A.assert(config.direction.match(/(south|north)(west|east)$|^(east|west|north|south)$/), 'Invalid direction');
                }
            }
        } else {
            config.align = config.advancedConfig.align;
            config.targetAlign = config.advancedConfig.targetAlign;
            config.padTop = config.advancedConfig.vertPad;

            // insane rules to figure out where to put the arrow
            config.direction = this._mapRelativeToCardinal(config);
        }
        config.align = cmp.get('v.inside')? config.targetAlign : config.align;

        return config;
    },

    _buildClassList: function(cmp, config) {
        var classList = cmp.getElement().classList;
        classList.add('positioned');
        classList.add(config.direction);

        var extras = cmp.get("v.classNames").split(',');

        for(var i = 0; i < extras.length; i++) {
            if(!$A.util.isEmpty(extras[i])) {
                classList.add(extras[i]);
            }
        }
    },

    _mapRelativeToCardinal: function(config) {
        if(config.align.match(/(^left|right)\stop$/) &&
            config.targetAlign.match(/(^left|right|center)\sbottom$/)) {
            return this.DIRECTION_MAP['center top']; // aka south.
        }
        return this.DIRECTION_MAP[config.align];
    },

    _createRelationship: function(config) {
        return this.positioningLib.panelPositioning.createRelationship(config);
    },

    _createConstraints: function (cmp, config) {
        cmp.constraints = [];

        cmp.constraints.push(this._createRelationship({
            element:        cmp.getElement(),
            target:         config.referenceEl,
            align:          config.align,
            targetAlign:    config.targetAlign,
            enable:         true,
            pad:            config.pad,
            padTop:         config.padTop
        }));

        cmp.constraints.push(this._createRelationship({
            element:    cmp.getElement(),
            target:     config.boundingElement,
            type:       'bounding box',
            enable:     true,
            pad:        config.boundingBoxPad
        }));

        if(config.pointer) {
            cmp.constraints.push(this._createRelationship({
                element: config.pointer,
                target: config.referenceEl,
                align: config.align,
                targetAlign: config.targetAlign,
                enable: true,
                pad: config.pointerPad
            }));

            if(config.direction === 'east') {
                cmp.constraints.push(this._createRelationship({
                    element: config.pointer,
                    target:cmp.getElement(),
                    align: 'right center',
                    targetAlign: 'left center',
                    enable: true,
                    pad: config.pointerPad
                }));
            }

            if(config.direction === 'west') {
                cmp.constraints.push(this._createRelationship({
                    element: config.pointer,
                    target: cmp.getElement(),
                    align: 'left center',
                    targetAlign: 'right center',
                    enable: true,
                    pad: config.pointerPad
                }));
            }

            cmp.constraints.push(this._createRelationship({
                element: config.pointer,
                target: cmp.getElement(),
                type:'bounding box',
                enable: true,
                boxDirections: config.bbDirections,
                pad: config.boxDirectionPad
            }));
        }

        // The following constraints are there
        // to keep east and west panels inside the viewport where possible
        // but still allow them to leave the viewport cleanly on scroll and
        // never open with a panel top outside the viewport
        // W-2678291 & W-2701440
        if(config.direction === 'east' || config.direction === 'west') {
            // keep the panel above the bottom of the viewport...
            cmp.constraints.push(this._createRelationship({
                element: cmp.getElement(),
                target: window,
                type: 'bounding box',
                enable: true,
                boxDirections: {
                    top: false,
                    bottom: true
                },
                pad: config.boxDirectionPad
            }));

            cmp.constraints.push(this._createRelationship({
                element: cmp.getElement(),
                target: window,
                type:'bounding box',
                enable: true,
                boxDirections: {
                    top: true,
                    bottom: false
                },
                pad: config.boxDirectionPad
            }));
        }

        if (config.pointer) {
            // this constraint will keep the pointer attached to the panel,
            // so if the target is scrolled out of the viewport the whole panel will go with it
            if (config.direction === 'east' || config.direction === 'west') {
                cmp.constraints.push(this._createRelationship({
                    element:cmp.getElement(),
                    target: config.pointer,
                    type:'inverse bounding box',
                    enable: true,
                    boxDirections: {
                        top: true,
                        bottom: true
                    },
                    pad: config.boxDirectionPad
                }));
            }

            var relationShip = {
                element:    config.pointer,
                target:     cmp.getElement(),
                enable:     true,
                pad:        config.pointerPad
            };
            switch (config.direction) {
                case 'north':
                    relationShip.type = 'top';
                    relationShip.targetAlign =  'center bottom';
                    break;
                case 'south':
                    relationShip.type = "bottom";
                    relationShip.targetAlign =  'center top';
                    break;
                case 'east':
                    relationShip.type = 'right';
                    relationShip.targetAlign = 'left bottom';
                    break;
                default:
                    relationShip = null;
            }
            if (relationShip) {
                cmp.constraints.push(this._createRelationship(relationShip));
            }
        }
    },

    scopeScrollables: function (cmp) {
        this.lib.panelLibCore.scopeScrollables(cmp);
    },

    startY : 0,
    iNoBounceEnabled : false,
    iNoBounce : function (el) {
        this.startY = 0;
        if (this.isScrollSupported()) {
            this.enableINoBounce(el);
        }
    },
    enableINoBounce : function (el) {
        el.addEventListener('touchstart', this.handleTouchstart, false);
        el.addEventListener('touchmove', this.handleTouchmove, false);
        this.iNoBounceEnabled = true;
    },
    handleTouchstart : function (evt) {
        // Store the first Y position of the touch
        this.startY = evt.touches ? evt.touches[0].screenY : evt.screenY;
    },
    handleTouchmove : function (evt) {
        // Get the element that was scrolled upon
        var el = evt.target;

        // Check all parent elements for scrollability
        while (el !== document.body) {
            // Get some style properties
            var style = window.getComputedStyle(el);

            if (!style) {
                // If we've encountered an element we can't compute the style for, get out
                evt.preventBounce = false;
                break;
            }

            var scrolling = style.getPropertyValue('-webkit-overflow-scrolling');
            var overflowY = style.getPropertyValue('overflow-y');
            var height = parseInt(style.getPropertyValue('height'), 10);

            // Determine if the element should scroll
            var isScrollable = scrolling === 'touch' && (overflowY === 'auto' || overflowY === 'scroll');
            var canScroll = el.scrollHeight > el.offsetHeight;

            if (isScrollable && canScroll) {
                // Get the current Y position of the touch
                var curY = evt.touches ? evt.touches[0].screenY : evt.screenY;

                // Determine if the user is trying to scroll past the top or bottom
                // In this case, the window will bounce, so we have to prevent scrolling completely
                var isAtTop = (this.startY <= curY && el.scrollTop === 0);
                var isAtBottom = (this.startY >= curY && el.scrollHeight - el.scrollTop === height);

                // Stop a bounce bug when at the bottom or top of the scrollable element
                if (isAtTop || isAtBottom) {
                    evt.preventDefault();
                }

                // No need to continue up the DOM, we've done our job
                evt.preventBounce = false;
                return;
            }

            // Test the next parent
            el = el.parentNode;
        }

        // Stop the bouncing -- no parents are scrollable
        evt.preventDefault();
    },
    isScrollSupported : function () {
        var scrollSupport,
            testDiv = document.createElement('div');

        document.documentElement.appendChild(testDiv);
        testDiv.style.WebkitOverflowScrolling = 'touch';
        scrollSupport = 'getComputedStyle' in window && window.getComputedStyle(testDiv)['-webkit-overflow-scrolling'] === 'touch';
        document.documentElement.removeChild(testDiv);
        return scrollSupport;
    }
})// eslint-disable-line semi
