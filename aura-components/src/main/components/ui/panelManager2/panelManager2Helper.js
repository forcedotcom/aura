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
	PANELS_OWNER    : {},            // Owner relationship who creates the panel (key) owned by -> value
    PANELS_STACK    : [],            // The Panel Stack ordering
    PANELS_INSTANCE : {},            // Registered instances
    containerManager: null,          // a reference to containerManager
    hasLocationChangeHandler: false, // Indicate if we already attach a locationChange handler

	initialize: function(cmp) {
        var containerManager = this.cmLib.containerManager;
        var sharedContainer  = cmp.get('v.useSharedContainer');

        this.containerManager = sharedContainer ? containerManager.getSharedInstance() : containerManager.createInstance(cmp.find('container'));
        this.initializeRegisteredPanels(cmp);
    },

    /*
    * Store internal defs
    * @private
    */
    initializeRegisteredPanels: function (cmp, newPanels) {
        this.containerManager.registerContainers(newPanels || cmp.get('v.registeredPanels') || []);
    },
    
    /*
     * Dynamically register panels. Used to register feature specific panels.
     * @private
     */
    registerPanels: function(cmp, params) {
    	var panels = params.panels;
    	if (panels) {
    		this.containerManager.registerContainers(panels);
    		if ($A.util.isFunction(params.callback)) {
    			params.callback();
            }
    	}
    },

    /*
    * Create panel
    * @public
    */
    createPanel: function (cmp, config) {
        var panelConfig      = config.panelConfig || {};
        var referenceElement = panelConfig.referenceElement;

        panelConfig.referenceElement = null;

        // Create panel instance
        var panel = this.createPanelInstance(cmp, config);

        if (referenceElement) {
            panel.set('v.referenceElement', referenceElement);
        }

        
        // Save instance config
        this.PANELS_INSTANCE[panel.getGlobalId()] = {
            panel           : panel,
            destroyCallback : config.onDestroy,
            closeOnLocationChange: this.getLocationChangeFlag(cmp, config)
        };

        // Set owner
        this.setPanelOwner(panel, config.owner);

        // onInit
        if (config.onInit) {
            config.onInit(panel);
        }

        // Render
        this.renderPanelInstance(cmp, panel, config);

        // Stack panel
        this.stackPanel(panel);

        // onCreate
        if (config.onCreate) {
            config.onCreate(panel);
        }
    },
    /*
    * Get Active panel
    * @public
    */
    getActivePanel: function (cmp, callback) {
        // TODO: Instead of assuming is the last one (which doesnt guarantee that is "active")
        // Change the logic on active to make sure we save that state internally
        var stack = this.PANELS_STACK;
        var panel = stack[stack.length - 1];
        if (panel && $A.util.isFunction(callback)) {
            callback(panel);
        } else if($A.util.isFunction(callback)) {
            callback(null);
        }
    },
    /*
    * Sets the context in which the panel is created
    * This is mostly to figure out the the relationship between two panels
    * This function should be called before stacking a new panel
    */
    setPanelOwner: function (panel, givenOwner) {
        var owner = givenOwner;
        if (!owner) {
            var previousBody = null;
        	if (this.PANELS_STACK.length > 0) {
                var previousPanel = this.PANELS_STACK[this.PANELS_STACK.length - 1];
                previousBody = previousPanel.isValid() ? previousPanel.get('v.body') : previousBody;
        	}
            owner = $A.util.isEmpty(previousBody) ? panel.getGlobalId() : previousBody[0].getGlobalId();
        }

        this.PANELS_OWNER[panel.getGlobalId()] = owner;
    },

    /*
    * Stack a panel in our internal structures
    */
    stackPanel: function (panel) {
        var stackManager = this.smLib.stackManager;

        this.PANELS_ZINDEX++;
        this.PANELS_STACK.push(panel);
        stackManager.bringToFront(panel);
    },

    /* 
     * stack an element as if it was a panel
     */
    stackElement: function (cb) {
        this.PANELS_ZINDEX++;
        cb(this.PANELS_ZOFFSET + this.PANELS_ZINDEX);
    },

    /*
    * Create panel instance
    * @private
    */
    createPanelInstance: function (cmp, config) {
        var panel = this.containerManager.createContainer({
                containerType          : config.panelType,
                containerConfig        : config.panelConfig,
                containerValueProvider : cmp
        });

        var header  = panel.get('v.header'),
            body    = panel.get('v.body'),
            footer  = panel.get('v.footer'),
            avp, i, length;

        if (!$A.util.isEmpty(body)) {
            body[0].setAttributeValueProvider(panel);
            avp = body[0];
        } else {
            avp = panel;
        }

        if (!$A.util.isEmpty(header)) {
            for (i = 0, length = header.length; i < length; i++) {
                header[i].setAttributeValueProvider(avp);
            }
        }
        if (!$A.util.isEmpty(footer)) {
            for (i = 0, length = footer.length; i < length; i++) {
                footer[i].setAttributeValueProvider(avp);
            }
        }
        
        return panel;
    },

    beforeShow: function(cmp, config) {
        var panelParam = config.panelInstance,
            panelId    = $A.util.isComponent(panelParam) ? panelParam.getGlobalId() : panelParam,
            panelObj   = this.PANELS_INSTANCE[panelId],
            panel      = panelObj.panel;

        this.setReturnFocusElement(panel);
                
        $A.assert(panelObj, 'Couldnt find instance to show');

        // de-active all other panels except the one currently shown
        this.deactivateAllPanelInstances(cmp, panel);
    },

     /*
    * Destroy panel instance
    * @private
    */
    destroyPanel: function (cmp, config, doActivateNext) {
        var stack             = this.PANELS_STACK,
            shouldReturnFocus = config.shouldReturnFocus,
            panelParam        = config.panelInstance,
            panelId           = $A.util.isComponent(panelParam) ? panelParam.getGlobalId() : panelParam,
            panelObj          = this.PANELS_INSTANCE[panelId],
            panel             = panelObj.panel,
            index             = stack.indexOf(panel);

        // shouldReturnFocus should default to true if it is not explicitly passed in.
        if ($A.util.isUndefinedOrNull(shouldReturnFocus)) {
            shouldReturnFocus = true;
        }

        $A.assert(panelObj, 'Couldnt find instance to destroy');
        $A.assert(index > -1, 'Couldnt find the reference in the stack');

        stack.splice(index, 1);

        // Update the return focus element if the panel has a selector specified.
        var returnFocusElementSelector = panel.get("v.returnFocusElementSelector");
        if (returnFocusElementSelector) {
            cmp.returnFocus = document.querySelector(returnFocusElementSelector);
        }

        this.containerManager.destroyContainer(panel);

        delete this.PANELS_OWNER[panelId];
        delete this.PANELS_INSTANCE[panelId];

        // Notify the destroy
        config.onDestroy && config.onDestroy();
        if (panelObj.destroyCallback) {
            panelObj.destroyCallback(panelId);
        }

        if (doActivateNext !== false) {
            this.activateNextPanel(cmp);
        }
        
        // Set the return focus. This has to happen after activating the next panel (above), otherwise activate will steal the focus.
        if (panel.closedBy !== "closeOnClickOut" &&
            shouldReturnFocus === true && cmp.returnFocus) {
            cmp.returnFocus.focus();
            cmp.returnFocus = null;
        }

        // this will happen if a panel is destroyed
        // without being closed first

        if(!panelObj.panel._transitionEndFired) {
            // listeners still need to know the panel is gone
            $A.getEvt("markup://ui:panelTransitionEnd").setParams({
                action: 'hide', 
                panelId: panelId
            }).fire();
        }

    },

    /**
     * Activate the candidate panel
     * @param cmp
     * @private
     */
    activateNextPanel: function() {
        //find the panel to active
        for (var panel, i = this.PANELS_STACK.length - 1; i >= 0; i--) {
            panel = this.PANELS_STACK[i];
            if (panel && panel.isValid() && panel.get('v.visible') && !panel.destroyPending) {
                panel.setActive(true);
                break;
            }
        }
    },

    /**
     * De-activate all the panels except the active one
     * @param cmp
     */
    deactivateAllPanelInstances: function(cmp, activePanel) {
        for (var panel, i = this.PANELS_STACK.length - 1; i >= 0; i--) {
            panel = this.PANELS_STACK[i];
            if (panel && panel.isValid() && panel !== activePanel) {
                panel.setActive(false);
            }
        }
    },

    /*
    * Rendering the panel
    * We call $A.render because we want to render the component immediately
    * so we can send it back synchronously to the user
    * @private
    */
    renderPanelInstance: function (cmp, panel, config) {
        this.containerManager.renderContainer(panel, config);
    },
    notifyPanelContent: function (content, config) {
        var validInterface = config.typeOf ? content.isInstanceOf(config.typeOf) : true,
            validMethod    = content[config.action];

        if (validInterface && validMethod) {
            content[config.action](config.payload); // dispatch the method
        }
    },
    broadcastNotify: function (cmp, source, config) {
        var scope         = config.scope,
            currentTarget = config.currentTarget || this.getContainerPanelId(source),
            stack         = this.PANELS_STACK,
            owner         = this.PANELS_OWNER[currentTarget],
            panel, content, i;

        $A.assert(!scope || (scope !== 'all' || scope !== 'owner' || scope !== "self"), 'Invalid target (all || owner)');

        if (scope === 'all') {
            for (i = stack.length - 1; i >= 0; --i) {
                panel = stack[i];
                if (currentTarget !== panel.getGlobalId()) { // Dont notify itself
                	content = panel.get('v.body')[0];
                    this.notifyPanelContent(content, config);
                }
            }
        } else if (scope === 'self') {
        	if (currentTarget) {
                currentTarget = $A.getComponent(currentTarget);
                this.notifyPanelContent(currentTarget.get('v.body')[0], config);
        	}
        } else if (owner) {
            var ownerCmp = $A.getComponent(owner);
            if (ownerCmp && ownerCmp.isValid()) {
            	this.notifyPanelContent(ownerCmp, config);
            }
        }
    },
    getContainerPanelId: function (source) {
        var provider = source;
        while (provider) {
            if (provider.isInstanceOf("ui:panelType")) {
                return provider.getGlobalId();
            }
            source = provider.getAttributeValueProvider();
            provider = source !== provider ? source : null;
        }
    },
    /**
     * Get a flag to indicate if we should close the panel when locationChange event is fired.
     */
    getLocationChangeFlag: function (cmp, config) {
        var closeOnLocationChange = config.closeOnLocationChange;
        if ($A.util.isEmpty(closeOnLocationChange)) { // not set, get it from panel manager
            closeOnLocationChange = $A.util.getBooleanValue(cmp.get('v.closeOnLocationChange'));
        } else {
            closeOnLocationChange = $A.util.getBooleanValue(closeOnLocationChange);
        }

        // add a handler if needed
        if (closeOnLocationChange === true && this.hasLocationChangeHandler === false) {
            var that = this;
            $A.eventService.addHandler({
                "event": "aura:locationChange",
                "globalId": cmp.getGlobalId(),
                "handler": function() {
                    for (var panel, panelObj, i = that.PANELS_STACK.length - 1; i >= 0; i--) {
                        panel = that.PANELS_STACK[i];
                        panelObj = that.PANELS_INSTANCE[panel.getGlobalId()];
                        if (panel && panel.isValid() && panelObj && panelObj.closeOnLocationChange === true) {
                            panel.close();
                        }
                    }
                }
            });
            this.hasLocationChangeHandler = true;
        }

        return closeOnLocationChange;
    },

    /**
     * returns the element to be focused when the panel is destroyed.
     * @param panelComponent
     * @private
     */
    setReturnFocusElement: function(panelComponent) {
        var returnFocusElement = panelComponent.get('v.returnFocusElement');

        if ($A.util.isUndefinedOrNull(returnFocusElement)) {
        	returnFocusElement = document.activeElement;
        }

        this.focusLib.stackUtil.stackFocus(returnFocusElement);
    }
})// eslint-disable-line semi
