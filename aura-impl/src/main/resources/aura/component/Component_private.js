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
/*jslint sub: true */
var ComponentPriv = (function() { // Scoping priv

    var nextClientCreatedComponentId = 0;

    var ComponentPriv = function ComponentPriv(config, cmp, localCreation) {
        cmp.priv = this;

        // setup some basic things
        this.concreteComponentId = config["concreteComponentId"];
        this.rendered = false;
        this.inUnrender = false;
        this.localId = config["localId"];
        this.valueProviders = undefined;
        this.actionRefs = undefined;
        this.eventDispatcher = undefined;
        this.docLevelHandlers = undefined;

        // Reference to "this" component's container, used to keep rendered elements
        // right as they are conditionally changed.  But this is not EVER to be
        // exposed to be referenced externally!
        this.container = undefined;

        var context = $A.getContext();

        // allows components to skip creation path checks if it's doing something weird
        // such as wrapping server created components in client created one

        var act = config["skipCreationPath"] ? null : context.getCurrentAction();
        var forcedPath = false;

        try {
            if (act) {
                var currentPath = act.topPath();

                if (config["creationPath"]) {
                    //
                    // This is a server side config, so we need to sync ourselves with it.
                    // The use case here is that the caller has gotten a returned array of
                    // components, and is instantiating them independently. We can warn the
                    // user when they do the wrong thing, but we'd actually like it to work
                    // for most cases.
                    //
                    this.creationPath = act.forceCreationPath(config["creationPath"]);
                    forcedPath = true;
                } else if (!context.containsComponentConfig(currentPath) && !!localCreation) {

                    // skip creation path if the current top path is not in server returned
                    // componentConfigs and localCreation

                    this.creationPath = "client created";
                } else {
                    this.creationPath = act.getCurrentPath();
                }
                //$A.log("l: [" + this.creationPath + "]");
            }

            // create the globally unique id for this component
            this.setupGlobalId(config["globalId"], localCreation);

            var partialConfig = undefined;
            if (this.creationPath && this.creationPath !== "client created") {
                partialConfig = context.getComponentConfig(this.creationPath);
            }
            if (partialConfig) {
                this.partialConfig = partialConfig;

                var partialConfigO = partialConfig["original"];
                var partialConfigCD;
                var configCD = config["componentDef"]["descriptor"];
                if (!configCD) {
                    configCD = config["componentDef"];
                } else if (configCD.getQualifiedName) {
                    configCD = configCD.getQualifiedName();
                }
                if (partialConfig["componentDef"]) {
                    if (partialConfig["componentDef"]["descriptor"]) {
                        partialConfigCD = partialConfig["componentDef"]["descriptor"];
                    } else {
                        partialConfigCD = partialConfig["componentDef"];
                    }
                }
                if (partialConfigO !== undefined && partialConfigCD !== configCD) {
                    if (partialConfigO !== configCD) {
                        $A.log("Configs at error");
                        $A.log(config);
                        $A.log(partialConfig);
                        $A.error("Mismatch at " + this.globalId
                                + " client expected " + configCD
                                + " but got original " + partialConfigO
                                + " providing " + partialConfigCD + " from server "
                                + " for creationPath = "+this.creationPath);
                    }
                } else if (partialConfigCD) {
                    if (partialConfigCD !== configCD) {
                        $A.log("Configs at error");
                        $A.log(config);
                        $A.log(partialConfig);
                        $A.error("Mismatch at " + this.globalId
                                + " client expected " + configCD + " but got "
                                + partialConfigCD + " from server "
                                +" for creationPath = "+this.creationPath);
                    }
                }
            }

            // get server rendering if there was one
            if (config["rendering"]) {
                this.rendering = config["rendering"];
            } else if (partialConfig && partialConfig["rendering"]) {
                this.rendering = this.partialConfig["rendering"];
            }

            // add this component to the global index
            componentService.index(cmp);

            // sets this components definition, preferring the one in partialconfig if it exists
            this.setupComponentDef(config["componentDef"]);

            // for components inside of a foreach, sets up the value provider
            // they will delegate all m/v/c values to
            this.setupDelegateValueProvider(config["delegateValueProvider"], localCreation);

            // join attributes from partial config and config, preferring
            // partial when overlapping
            var configAttributes = config["attributes"];
            if (partialConfig && partialConfig["attributes"]) {
                if (!config["attributes"]) {
                    configAttributes = partialConfig["attributes"];
                } else {
                    configAttributes = {};
                    var atCfg = config["attributes"];
                    for (var key in atCfg) {
                    	if (atCfg.hasOwnProperty(key)) {
                    		configAttributes[key] = atCfg[key];
                    	}
                    }

                    atCfg = partialConfig["attributes"];
                    for (key in atCfg) {
                        if (atCfg.hasOwnProperty(key) && key !== "valueProvider") {
                            configAttributes[key] = atCfg[key];
                        }
                    }

                    atCfg = config["attributes"]["values"];
                    for (key in atCfg) {
                        if (atCfg.hasOwnProperty(key) && !configAttributes["values"][key]) {
                            configAttributes["values"][key] = atCfg[key];
                        }
                    }
                }
            }

            // creates the attributeset with that weirdass mush of attributes
            this.setupAttributes(configAttributes, cmp, localCreation);

            // runs component provider and replaces this component with the
            // provided one
            this.injectComponent(config, cmp, localCreation);

            // instantiates this components model
            this.setupModel(config["model"], cmp);

            // create all value providers for this component m/v/c etc.
            this.setupValueProviders(config["valueProviders"], cmp);

            // instantiate super component(s)
            this.setupSuper(cmp, configAttributes, localCreation);

            // does some extra attribute validation for requiredness
            this.validateAttributes(cmp, configAttributes);

            // sets up component level events
            this.setupComponentEvents(configAttributes ? configAttributes["events"] : null,
                configAttributes ? configAttributes["values"] : null, cmp);

            // for application type events
            this.setupApplicationEventHandlers(cmp);

            // index this component with its value provider (if it has a
            // localid)
            this.doIndex(cmp);

            // instantiate the renderer for this component
            this.setupRenderer(cmp);

            // starting watching all values for events
            this.setupValueEventHandlers(cmp);

            // clean up refs to partial config
            this.partialConfig = undefined;
        } finally {
            if (forcedPath && act) {
                act.releaseCreationPath(this.creationPath);
            }
        }
    };

    ComponentPriv.prototype.nextGlobalId = function(localCreation) {
        if (!localCreation) {
            var context = $A.getContext();
            var currentAction = context.getCurrentAction();

            var id;
            var suffix;
            if (currentAction) {
                id = currentAction.getNextGlobalId();
                suffix = currentAction.getId();
            } else {
                id = context.getNextGlobalId();
                var num = context.getNum();
                if (num > 0) {
                    suffix = num;
                }
            }

            return suffix ? (id + ":" + suffix) : id;
        } else {
            return (nextClientCreatedComponentId++) + ":c";
        }
    };

    /**
     * The globally unique id of this component
     */
    ComponentPriv.prototype.setupGlobalId = function(globalId, localCreation) {
        if (!globalId || !localCreation) {
            globalId = this.nextGlobalId(localCreation);
        }

        var old = componentService.get(globalId);
        if (old) {
            aura.log("makeGlobalId collision detected.", globalId);
        }

        this.globalId = globalId;
    };

    ComponentPriv.prototype.getValueProvider = function(key, cmp) {
        // Try the most commonly accessed non-map based provider keys first
        if (key === "v") {
            return !this.delegateValueProvider ? this.attributes : undefined;
        } else if (key === "m") {
            return !this.delegateValueProvider ? this.model : undefined;
        } else {
            // Try map based providers followed by the rarely accessed keys
            // (globalId, def, ...)
            var provider = this.valueProviders ? this.valueProviders[key] : undefined;
            if (provider) {
                return provider;
            } else if (key === "globalId") {
                return valueFactory.create(this.globalId);
            } else if (key === "def") {
                return valueFactory.create(this.componentDef);
            } else if (key === "this") {
                return cmp;
            } else {
                return undefined;
            }
        }
    };

    /**
     * Create the value providers
     */
    ComponentPriv.prototype.setupValueProviders = function(config, cmp) {
        if (!this.delegateValueProvider) {
            var actionProvider = this.createActionValueProvider(cmp);
            if (actionProvider) {
                this.getValueProviders()["c"] = actionProvider;
            }
        }

        var extraValueProviders = config;
        for ( var key in extraValueProviders) {
            var value = extraValueProviders[key];
            if (key !== "m" && key !== "v" && key !== "c") {
                this.getValueProviders()[key] = valueFactory.create(value);
            }
        }
    };

    ComponentPriv.prototype.getValueProviders = function() {
        if (!this.valueProviders) {
            this.valueProviders = {};
        }

        return this.valueProviders;
    };

    ComponentPriv.prototype.createActionValueProvider = function(cmp) {
        var controllerDef = this.componentDef.getControllerDef();
        if (controllerDef) {
            this.actionRefs = {};
            var ar = this.actionRefs;
            return {
                getValue : function(key) {
                    var ret = ar[key];
                    if (!ret) {
                        var actionDef = controllerDef.getActionDef(key);
                        if (actionDef) {
                            ret = valueFactory.create(actionDef, null, cmp);
                            ar[key] = ret;
                        }
                    }
                    return ret;
                },

                get : function(key) {
                    return $A.expressionService.get(this, key);
                },

                setValue : function(key, value) {
                    aura.assert(false, "ControllerDef.setValue not Implemented.");
                }
            };
        } else {
            return undefined;
        }
    };

    /**
     * A reference to the ComponentDefinition for this instance
     */
    ComponentPriv.prototype.setupComponentDef = function(config) {
        var componentDef;
        if (this.partialConfig) {
            var fromServer = this.partialConfig["componentDef"];
            if (fromServer) {
                componentDef = componentService.getDef(fromServer);
            }
        } else {
            componentDef = componentService.getDef(config);
        }
        aura.assert(componentDef, "componentDef is required");
        this.componentDef = componentDef;
    };

    ComponentPriv.prototype.setupDelegateValueProvider = function(config, localCreation) {
        if (config) {
            if (config["globalId"]) {
                this.delegateValueProvider = componentService.get(config["globalId"]);
            } else {
                this.delegateValueProvider = config;
            }
            if (!this.delegateValueProvider) {
                this.delegateValueProvider = componentService.newComponentDeprecated(config, null, localCreation, true);
            }
        }
    };

    ComponentPriv.prototype.setupAttributes = function(config, cmp, localCreation) {
        var configAttributes = config || {};
        this.attributes = new AttributeSet(configAttributes, configAttributes["valueProvider"],
            this.componentDef.getAttributeDefs(), cmp, localCreation);
    };

    ComponentPriv.prototype.validateAttributes = function(cmp) {
        var attributeDefSet = this.componentDef.attributeDefs;
        if (attributeDefSet && attributeDefSet.each) {
            var compPriv = this;
            if (compPriv.attributes && compPriv.attributes.getValue && attributeDefSet.each) {
                attributeDefSet.each(function(attrDef) {
                    if (attrDef.isRequired && attrDef.isRequired()) {
                        var name = attrDef.getDescriptor().getQualifiedName();
                        var zuper = cmp;
                        if (zuper) {
                            if (!zuper.findValue(name)) {
                                var descr = compPriv.componentDef.getDescriptor();
                                throw new Error("Missing required attribute "
                                                + descr.getNamespace() + ":"
                                                + descr.getName() + "." + name);
                            }
                        }
                    }
                });
            }
        }
    };

    ComponentPriv.prototype.setupSuper = function(attributeValueProvider,
                    configAttributes, localCreation) {
        var superDef = this.componentDef.getSuperDef();
        if (superDef) {
            var attributeValues = {};
            var key;
            var valuesAlreadySet = {};

            if (configAttributes) {
                var values = configAttributes["values"];
                valuesAlreadySet = configAttributes["valuesAlreadySet"] ? configAttributes["valuesAlreadySet"]
                                : {};
                for (key in values) {
                    attributeValues[key] = new PropertyChain([ "v", key ]);
                }
            }

            var facets = this.componentDef.getFacets();
            var attributeDefs = this.componentDef.getAttributeDefs();
            if (facets) {
                for (var j = 0; j < facets.length; j++) {
                    var facet = facets[j];
                    var facetName = facet["descriptor"];
                    if (!valuesAlreadySet[facetName]) {
                        if (attributeDefs) {
                            var attributeDef = attributeDefs.getDef(facetName);
                            if (attributeDef && attributeDef.getTypeDefDescriptor() !== "aura://Aura.Component[]") {
                                valuesAlreadySet[facetName] = true;
                            }
                        }
                        
                        attributeValues[facetName] = facet["value"];
                    }
                }
            }

            var concreteComponentId = this.concreteComponentId;
            var superConfig = {};
            var superDefConfig = {};
            superDefConfig["descriptor"] = superDef.getDescriptor();
            superConfig["componentDef"] = superDefConfig;
            superConfig["concreteComponentId"] = concreteComponentId ? concreteComponentId
                            : this.globalId;

            var superAttributes = {};
            superAttributes["values"] = attributeValues;
            superAttributes["valuesAlreadySet"] = valuesAlreadySet;
            superAttributes["events"] = configAttributes ? configAttributes["events"] : {};
            superAttributes["valueProvider"] = attributeValueProvider;
            superConfig["attributes"] = superAttributes;

            var self = this;
            var setSuperComponent = function(component) {
                self.superComponent = component;
                if (component) {
                    var valueProviders = self.getValueProviders();
                    if (!valueProviders["super"]) {
                        valueProviders["super"] = component;
                    }
                }
            };

            $A.pushCreationPath("super");

            try {
                setSuperComponent(componentService.newComponentDeprecated(superConfig, null, localCreation, true));
            } finally {
                $A.popCreationPath("super");
            }
        }
    };

    ComponentPriv.prototype.getActionCaller = function(valueProvider, actionExpression) {
        if (aura.util.isString(actionExpression)) {
            actionExpression = valueFactory.parsePropertyReference(actionExpression);
        }

        var actionRef = valueFactory.create(actionExpression);

        return function(event) {
            if (valueProvider.isValid && !valueProvider.isValid()) {
                return;
            }

            var clientAction = expressionService.getValue(valueProvider, actionRef);
            if (clientAction) {
                if (clientAction.unwrap) {
                    clientAction = clientAction.unwrap();
                }
                clientAction.runDeprecated(event);
            } else {
                aura.assert(false, "no client action by name " + actionRef.getValue());
            }
        };
    };

    ComponentPriv.prototype.getEventDispatcher = function(cmp) {
        if (!this.eventDispatcher && cmp) {
            var dispatcher = {};

            dispatcher.getValue = function(key) {
                return cmp.getEvent(key);
            };

            dispatcher.get = function(key) {
                return this.getValue(key);
            };

            this.eventDispatcher = dispatcher;
            this.getValueProviders()["e"] = dispatcher;
        }

        return this.eventDispatcher;
    };

    ComponentPriv.prototype.setupComponentEvents = function(config, values, cmp) {
        var dispatcher;
        if (!this.concreteComponentId) {
            var events = this.componentDef.getAllEvents();

            var len = events.length;
            if (len > 0) {
                dispatcher = this.getEventDispatcher(cmp);
                for (var i = 0; i < events.length; i++) {
                    dispatcher[events[i]] = [];
                }
            }

            var def = this.componentDef;
            var keys = def.getAllEvents();

            if (values && !config) {
                config = values;
            }

            if (config) {
                var valueProvider = this.attributes.getComponentValueProvider();
                for (var j = 0; j < keys.length; j++) {
                    var key = keys[j];
                    var eventValue = config[key];
                    if (eventValue) {
                        aura.assert(!this.concreteComponentId,
                                    "Event handler for " + key
                                    + " defined on super component "
                                    + this.globalId);
                        cmp.addHandler(key, valueProvider, eventValue["value"]);
                    }
                }
            }
        }

        var cmpHandlers = this.componentDef.getCmpHandlerDefs();
        if (cmpHandlers) {
            for (var k = 0; k < cmpHandlers.length; k++) {
                var cmpHandler = cmpHandlers[k];
                cmp.addHandler(cmpHandler["name"], cmp, cmpHandler["action"]);
            }
        }
    };

    function getHandler(cmp, actionExpression) {
        var actionRef = valueFactory.create(actionExpression);
        return function(event) {
            if (cmp.isValid && !cmp.isValid()) {
                return;
            }

            var clientAction = expressionService.get(cmp, actionRef);
            if (clientAction) {
                clientAction.runDeprecated(event);
            } else {
                aura.assert(false, "no client action by name " + actionRef.getValue());
            }
        };
    }

    ComponentPriv.prototype.setupApplicationEventHandlers = function(cmp) {
        // Handle application-level events
        var handlerDefs = this.componentDef.getAppHandlerDefs();
        if (handlerDefs) {
            for (var i = 0; i < handlerDefs.length; i++) {
                var handlerDef = handlerDefs[i];
                var handlerConfig = {};
                handlerConfig["globalId"] = cmp.getGlobalId();
                handlerConfig["handler"] = getHandler(cmp, handlerDef["action"]);
                handlerConfig["event"] = handlerDef["eventDef"].getDescriptor().getQualifiedName();
                eventService.addHandler(handlerConfig);
            }
        }
    };

    ComponentPriv.prototype.setupValueEventHandlers = function(cmp) {
        // Handle value-level events
        var handlerDefs = this.componentDef.getValueHandlerDefs();
        if (handlerDefs) {
            for (var i = 0; i < handlerDefs.length; i++) {
                var handlerDef = handlerDefs[i];
                var handlerConfig = {};
                handlerConfig["action"] = valueFactory.create(handlerDef["action"]);
                handlerConfig["value"] = valueFactory.create(handlerDef["value"]);
                handlerConfig["event"] = handlerDef["name"];
                cmp.addValueHandler(handlerConfig);
            }
        }
    };

    ComponentPriv.prototype.setupModel = function(config, cmp) {
        var def = this.componentDef.getModelDef();
        if (def) {
            if (!config && this.partialConfig) {
                config = this.partialConfig["model"];
            }
            this.model = def.newInstance(config || {}, cmp);
        }
    };

    ComponentPriv.prototype.doIndex = function(cmp) {
        var localId = this.localId;

        if (localId) {
            var attributeValueProvider = this.attributes.getComponentValueProvider();
            if (!attributeValueProvider) {
                attributeValueProvider = cmp;
            }
            attributeValueProvider.index(localId, this.globalId);
        }
    };

    ComponentPriv.prototype.deIndex = function() {
        var localId = this.localId;

        if (localId) {
            var attributeValueProvider = this.attributes.getComponentValueProvider();
                attributeValueProvider.deIndex(localId, this.globalId);
        }
    };

    ComponentPriv.prototype.injectComponent = function(config, cmp, localCreation) {

        var self = this,
            setProvided = function(realComponentDef, attributes) {
                // Provide better error messaging with each assertion
                $A.assert(realComponentDef && realComponentDef.auraType === "ComponentDef",
                    "No definition for provided component");
                $A.assert(!realComponentDef.isAbstract(), "No concrete implementation provided");
                // client provider and current config wasn't from the server
                $A.assert(!realComponentDef.hasRemoteDependencies() || (realComponentDef.hasRemoteDependencies() && self.partialConfig),
                    "Client provided component cannot have server dependencies.");

                self.componentDef = realComponentDef;
                self.attributes.recreate(realComponentDef.getAttributeDefs(), attributes);
            };


        var componentDef = this.componentDef;
        if ((componentDef.isAbstract() || componentDef.getProviderDef()) && !this.concreteComponentId) {
            var providerDef = componentDef.getProviderDef();
            var act = $A.getContext().getCurrentAction();

            if (act) {
                // allow the provider to re-use the path of the current component without complaint
                act.reactivatePath();
            }
            if (providerDef) {
                // use it
                providerDef.provide(cmp, localCreation, setProvided);
            } else {
                var partialConfig = this.partialConfig;
                $A.assert(partialConfig,
                            "Abstract component without provider def cannot be instantiated : "
                            + componentDef);
                setProvided(componentService.getDef(partialConfig["componentDef"]), null);
            }
        }
    };

    ComponentPriv.prototype.setupRenderer = function(cmp) {
        var rd = this.componentDef.getRenderingDetails();
        $A.assert(rd !== undefined, "Instantiating " + this.componentDef.getDescriptor() + " which has no renderer");
        var renderable = cmp;
        for (var i = 0; i < rd.distance; i++) {
            renderable = renderable.getSuper();
        }

        var renderer = {
            def : rd.rendererDef,
            renderable : renderable
        };

        var zuper = renderable.getSuper();
        if (zuper) {
            var superRenderer = zuper.getRenderer();
            renderer["superRender"] = function() {
                return superRenderer.def.render(superRenderer.renderable);
            };

            renderer["superRerender"] = function() {
                return superRenderer.def.rerender(superRenderer.renderable);
            };

            renderer["superAfterRender"] = function() {
                superRenderer.def.afterRender(superRenderer.renderable);
            };

            renderer["superUnrender"] = function() {
                superRenderer.def.unrender(superRenderer.renderable);
            };
        }
        
        this.renderer = renderer;
    };

    ComponentPriv.prototype.associateRenderedBy = function(cmp, element) {
        // attach a way to get back to the rendering component, the first time
        // we call associate on an element
        var u = $A.util;
        if (!u.hasDataAttribute(element, $A.componentService.renderedBy)) {
            u.setDataAttribute(element, $A.componentService.renderedBy, cmp.getGlobalId());
        }
    };

    ComponentPriv.prototype.output = function(value, avp, serialized, depth) {
        if (serialized === undefined) {
            serialized = [];
            depth = 0;
        } else {
            depth++;
        }

        serialized.push(value);

        if (value && value.auraType) {
            var type = value.auraType;
            if (type === "Value") {
                var valueType = value.toString();
                if (valueType === "ArrayValue") {
                    return this.outputArrayValue(value, avp, serialized, depth);
                } else if (valueType === "MapValue") {
                    return this.outputMapValue(value, avp, serialized, depth);
                } else if (valueType === "SimpleValue") {
                    return this.output(value.unwrap(), avp, serialized, depth);
                }
            } else if (type === "Component") {
                return this.outputComponent(value, serialized, depth);
            } else if (type === "Action") {
                return "Action";
            }
        }
        return value ? value.toString() : value;
    };

    ComponentPriv.prototype.outputMapValue = function(value, avp, serialized, depth) {
        var ret = {};
        var that = this;
        value.each(function(key, val) {
            var str = (val && val.auraType) ? val.toString() : null;

            try {
                if (str === "PropertyChain" || (str === "FunctionCallValue" && avp)) {
                    ret[key] = that.output(val.getValue(avp), avp, serialized, depth);
                } else if (val && val.auraType && val.auraType === "Value") {
                    ret[key] = that.output(val.unwrap(), avp, serialized, depth);
                } else {
                    ret[key] = that.output(val, avp, serialized, depth);
                }
            } catch (e) {
                ret[key] = "Error";
                $A.warning("Error in chrome plugin support", e);
            }
        });
        ret["__proto__"] = null;
        return ret;
    };

    /** @private@
     * Used during render to be able to walk up, correcting rendered elements.
     *
     * Like getRenderContainer(), this cannot become public API, both because
     * it would mess with encapsulation and because the (internal) renderer is
     * what, by definition, "knows" the container.
     *
     * We actually store only the global ID for parent and sibling, because
     * otherwise we get components with large and even cyclic structures, and
     * that does bad things to debug tools, json, etc.
     *
     * @param {Component} parent the parent component
     * @param {Component} priorSibling the earlier child of parent, or undefined
     */
    Component.prototype.setRenderContainer = function(parent, priorSibling) {
        $A.assert(parent !== this);
        $A.assert(priorSibling !== this);

//#if {"excludeModes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
        // This should be a needless loop cost, so let's leave it out in production.
        // But I've found enough screwiness in nesting combinations of (re/un)render
        // that in debug it might be worthwhile.  If a cycle IS created, you get a
        // fun-to-debug infinite loop in AuraRenderingService_private.reorderForContainment,
        // or an even more fun error about "Object has too long reference chain(must not
        // be longer than 1000)" when something internal tries serializing the cycle. 
        var cyclic = {};
        cyclic[this.getGlobalId()] = this;
        var dad = parent;
        while (dad) {
            $A.assert(!cyclic[dad.getGlobalId()], "cyclic parentage");
            cyclic[dad.getGlobalId()] = dad;
            dad = dad.getRenderContainer();
        }
//#end

        this.priv.container = parent ? parent.getGlobalId() : undefined;
        this.priv.priorSibling = priorSibling ? priorSibling.getGlobalId() : undefined;
    };

    /** @private@
     * Used during rerender to be able to walk up, correcting rendered elements.
     *
     * This cannot become public API of components without breaking encapsulation,
     * tempting though it seems... a component cannot be aware of, or sensitive to,
     * the context inside which it is used.
     */
    Component.prototype.getRenderContainer = function() {
        var id = this.priv.container;
        return id ? $A.componentService.get(id) : undefined;
    };

    /** @private@
     * Used during rerender to be able to walk laterally, to find where to add new
     * elements if the component doesn't know where to insert itself.
     *
     * This cannot become public API of components without breaking encapsulation,
     * tempting though it seems... a component cannot be aware of, or sensitive to,
     * the context inside which it is used.
     */
    Component.prototype.getRenderPriorSibling = function() {
        var id = this.priv.priorSibling;
        return id ? $A.componentService.get(id) : undefined;
    };

    /** @private@
     * Updates the elements for a contained component's re-render.
     * Replaces in this components' elements, the "oldElems" list with "newElems,"
     * assuming oldElems is found.  Sometimes oldElems has already been unrendered
     * and destroyed, in which case newElems is spliced in to create a two-step
     * replacement rather than a simple single-step one, but with the same net
     * effect.
     *
     * @param prevElem {Element} undefined if there are no prior siblings, else
     *                  the last DOM element *before* oldElems
     * @param oldElems {Object} our funky almost-an-array cmp.priv.elements list
     *                  of what should be (or perhaps has been) removed
     * @param newElems {Object} a replacement for oldElems
     *
     * @returns true if a change was made, false if not found (which implies the
     *    contained child's elements are not part of this component or its ancestors'
     *    elements).
     */
    Component.prototype.updateElements = function(prevElem, oldElems, newElems) {
        var start = 0;
        var elems = this.getElements();
        var i;

        if (prevElem) {
            // I really wish we used an Array for elements, not the Object-almost-an-array
            // that we do use.  Anyway, this code is really just looking for prevElem in
            // this.getElements(), returning false if not found, and otherwise splicing to
            // replace oldElems with newElems and returning true.
            for (start = 0; elems[start]; ++start) {
                if (elems[start] === prevElem) {
                    break;
                }
            }
            if (!elems[start]) {  // Didn't find it
                $A.error("Rerender couldn't find prior element to use when updating container");
            }
            start++;  // Move start to be an insertion point, after priorElem
        }

        // Check that, if any, ALL of oldElems are found.  It'd be weird to have a
        // partial subset rather than all-of-nothing.
        if (elems[start] === oldElems[0]) {
            for (i = 1; oldElems[i]; ++i) {
                $A.assert(oldElems[i] === elems[start + i],
                        "Found too few stale elements (only " + i + ")");
            }
        } else {
            // just pretend we're splicing from an empty oldElems
            oldElems = {};
        }
        // And our splice... we need to know the new and old lengths, first
        var newLen;
        for (newLen = 0; newElems[newLen]; ++newLen) {
            // count items in newElems
        }
        var oldLen;
        for (oldLen = 0; oldElems[oldLen]; ++oldLen) {
            // count items in oldElems
        }
        // Now, splice.
        if (newLen <= oldLen) {
            // Copy new onto old (it fits), then any extras fold down
            for (i = 0; i < newLen; ++i) {
                elems[start + i] = newElems[i];
            }
            for (elems; elems[i]; ++i) {
                if (elems[start + oldLen + i]) {
                    elems[start + i] = elems[start + oldLen + i];
                } else {
                    delete elems[start + i];
                }
            }
        } else {
            // New doesn't fit into old.  We need to move extra stuff up, top first, then copy.
            for (i = 0; elems[i + 1]; ++i) {
                // count i up to index of last *present* value
            }
            var delta = newLen - oldLen;
            for (i; i >= start + oldLen; --i) {
                // from end backwards, copy post-oldElems items up by delta, stopping at end of oldElems sequence
                elems[i + delta] = elems[i];
            }
            // Now we've made room, copy new into elems
            for (i = 0; i < newLen; ++i) {
                elems[start + i] = newElems[i];
            }
        }
        // Splicing done.  elems[start] to elems[newLen] are now a match to newElems, replacing
        // elems[start] to elems[oldLen] which WAS a match to oldElems.

        // If elems.element happens to be one end or the other of the oldElems, replace it from
        // the newElems, or if that's empty, from other bits of elems (or delete it).
        if (elems.element === oldElems[0]) {
            if (newLen > 0) {
                elems.element = newElems[0];
            } else if (start > 0) {
                elems.element = elems[start - 1];
            } else {
                delete elems.element;
            }
        } else if (elems.element === oldElems[oldLen - 1]) {
            if (newLen > 0) {
                elems.element = newElems[newLen - 1];
            } else if (elems[start]) {
                elems.element = elems[start];
            } else {
                delete elems.element;
            }
        }

        return true;
    };

    ComponentPriv.prototype.outputArrayValue = function(value, avp, serialized, depth) {
        var ary = value.getArray();
        var ret = [];
        for (var i = 0; i < ary.length; i++) {
            ret.push(this.output(ary[i], avp, serialized, depth));
        }

        ret["__proto__"] = null;
        return ret;
    };

    ComponentPriv.prototype.outputComponent = function(cmp, serialized, depth) {
        /*jslint reserved: true */
        if (cmp) {
            var ret = {
                __proto__ : null
            };
            ret._descriptor = cmp.getDef().getDescriptor().toString();
            ret.globalId = cmp.getGlobalId();
            ret.localId = cmp.getLocalId();
            ret.rendered = cmp.isRendered();
            ret.valid = cmp.isValid();
            ret.attributes = {};
            var attributes = cmp.getAttributes();
            var model = cmp.getModel();
            if (model) {
                ret.model = this.output(model, attributes.getValueProvider(), serialized, depth);
            }
            ret.attributeValueProvider = this.output(attributes.getValueProvider(),
                attributes.getValueProvider(), serialized, depth);

            var zuper = cmp.getSuper();
            if (zuper && depth < 10) {
                ret["super"] = this.output(zuper, cmp, serialized, depth);
            } else if (zuper) {
                ret["super"] = {
                        LAZY : zuper.getGlobalId()
                };
            }
            var attributeDefs = cmp.getDef().getAttributeDefs();
            var that = this;
            attributeDefs.each(function(attributeDef) {
                var key = attributeDef.getDescriptor().toString();
                var val;
                try {
                    val = attributes.getRawValue(key);
                } catch (ignore) {
                }
                ret.attributes[key] = that.output(val, attributes
                                .getValueProvider(), serialized, depth);
            });

            ret.attributes["__proto__"] = null;

            return ret;
        }
        return null;
    };

    return ComponentPriv;

}());