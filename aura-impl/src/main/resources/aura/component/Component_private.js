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
        this.autoDestroy=true;
        this.rendered = false;
        this.inUnrender = false;
        this.localId = config["localId"];
        this.valueProviders = {};
        this.actionRefs = undefined;
        this.eventDispatcher = undefined;
        this.docLevelHandlers = undefined;
        this.references={};
        this.handlers = {};

        var context = $A.getContext();

        // allows components to skip creation path checks if it's doing something weird
        // such as wrapping server created components in client created one

        var act = config["skipCreationPath"] ? null : context.getCurrentAction();
        var forcedPath = false;

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
            this.validatePartialConfig(config,partialConfig);
            this.partialConfig = partialConfig;
        }

        // get server rendering if there was one
        if (config["rendering"]) {
            this.rendering = config["rendering"];
        } else if (partialConfig && partialConfig["rendering"]) {
            this.rendering = this.partialConfig["rendering"];
        }

        // add this component to the global index
        componentService.index(cmp);

        // sets this components definition, preferring partialconfig if it exists
        this.setupComponentDef(this.partialConfig || config);

        // join attributes from partial config and config, preferring
        // partial when overlapping
        var configAttributes = {"values":{}};
        if (config["attributes"]) {
            $A.util.apply(configAttributes["values"], config["attributes"]["values"],true);
            configAttributes["valueProvider"] = config["attributes"]["valueProvider"] || config["valueProvider"];
        }
        if (partialConfig && partialConfig["attributes"]) {
            $A.util.apply(configAttributes["values"],partialConfig["attributes"]["values"],true);
            // NOTE: IT USED TO BE SOME LOGIC HERE TO OVERRIDE THE VALUE PROVIDER BECAUSE OF PARTIAL CONFIGS
            // IF WE RUN INTO ISSUES AT SOME POINT AFTER HALO, LOOK HERE FIRST!
        }
        if(!configAttributes["values"]){
            configAttributes["values"] = {};
        }
        if(!configAttributes["facetValueProvider"]){
            configAttributes["facetValueProvider"] = cmp;
        }

        //JBUCH: HALO: FIXME: THIS IS A DIRTY FILTHY HACK AND I HAVE BROUGHT SHAME ON MY FAMILY
        this.attributeValueProvider = configAttributes["valueProvider"];
        this.facetValueProvider = configAttributes["facetValueProvider"];

        // initialize attributes
        this.setupAttributes(cmp, configAttributes, localCreation);

        // runs component provider and replaces this component with the
        // provided one
        this.injectComponent(config, cmp, localCreation, cmp.ccc);

        // instantiates this components model
        this.setupModel(config["model"], cmp);

        // create all value providers for this component m/v/c etc.
        this.setupValueProviders(config["valueProviders"], cmp);

        // sets up component level events
        this.setupComponentEvents(cmp, configAttributes);

        // instantiate super component(s)
        this.setupSuper(cmp, configAttributes, localCreation, cmp.ccc);

        // for application type events
        this.setupApplicationEventHandlers(cmp);

        // index this component with its value provider (if it has a localid)
        this.doIndex(cmp);

        // instantiate the renderer for this component
        this.setupRenderer(cmp);

        // starting watching all values for events
        this.setupValueEventHandlers(cmp);

        // clean up refs to partial config
        this.partialConfig = undefined;

        if (forcedPath && act) {
            act.releaseCreationPath(this.creationPath);
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
            $A.log("ComponentPriv.setupGlobalId: globalId already in use: '"+globalId+"'.");
        }

        this.globalId = globalId;
    };

    ComponentPriv.prototype.getValueProvider = function(key, cmp) {
        if(!$A.util.isString(key)){
            $A.error("ComponentPriv.getValueProvider: 'key' must be a valid String.");
        }
        key=key.toLowerCase();
        // Try the most commonly accessed non-map based provider keys first
        if (key === "v") {
            return this.attributes;
        } else if (key === "m") {
            return this.model;
        } else {
            // Try map based providers followed by the rarely accessed keys
            // (globalId, def, ...)
            var provider = this.valueProviders[key];
            if (provider) {
                return provider;
            } else{
                switch(key){
                    case "globalid":
                        return this.globalId;
                    case "def":
                        return valueFactory.create(this.componentDef);
                    case "this":
                        return cmp;
                    case "null":
                        return null;
                    default:
                        // JBUCH: HALO: TODO: TRACK DOWN WHY/IF THIS IS NECESSARY. SEE uitest/carousel_Test.cmp
                        if(cmp!=cmp.getConcreteComponent()){
                            return cmp.getConcreteComponent().get(key);
                        }
                        return undefined;
                }
            }
        }
    };

    /**
     * Create the value providers
     */
    ComponentPriv.prototype.setupValueProviders = function(config, cmp) {
        var actionProvider = this.createActionValueProvider(cmp);
        if (actionProvider) {
            this.valueProviders["c"] = actionProvider;
        }

        var extraValueProviders = config;
        for ( var key in extraValueProviders) {
            var value = extraValueProviders[key];
            if (key !== "m" && key !== "v" && key !== "c") {
                this.getValueProviders()[key.toLowerCase()] = valueFactory.create(value);
            }
        }
    };

    ComponentPriv.prototype.getValueProviders = function() {
        return this.valueProviders;
    };

    ComponentPriv.prototype.createActionValueProvider = function(cmp) {
        var controllerDef = this.componentDef.getControllerDef();
        if (controllerDef) {
            this.actionRefs = {};
            var ar = this.actionRefs;
            return {
                get : function(key) {
                    var ret = ar[key];
                    if (!ret) {
                        var actionDef = controllerDef.getActionDef(key);
                        $A.assert(actionDef,"Unknown controller action '"+key+"'");
                        if (actionDef) {
                            ret = valueFactory.create(actionDef, null, cmp);
                            ar[key] = ret;
                        }
                    }
                    return ret.getAction();
                }
            };
        }
    };

    /**
     * A reference to the ComponentDefinition for this instance
     */
    ComponentPriv.prototype.setupComponentDef = function(config) {
        var componentDef = componentService.getDef(config["componentDef"]);
        $A.assert(componentDef, "componentDef is required");
        this.componentDef = componentDef;
    };

    ComponentPriv.prototype.createComponentStack = function(facets,valueProvider,localCreation){
        var facetStack={};
        for (var i = 0; i < facets.length; i++) {
            var facet = facets[i];
            var facetName = facet["descriptor"];

            var facetConfig = facet["value"];
            if (!$A.util.isArray(facetConfig)) {
                facetConfig = [facetConfig];
            }
            var action = $A.getContext().getCurrentAction();
            if (action) {
                action.pushCreationPath(facetName);
            }
            var components=[];
            for (var index = 0; index < facetConfig.length; index++) {
                var config = facetConfig[index];
                if(config&&config["componentDef"]) {
                    if (action) {
                        action.setCreationPathIndex(index);
                    }
                    var component=$A.componentService.newComponentDeprecated(config, valueProvider, localCreation, true);
                    components.push(component);
                } else if(config&&config.auraType === "Component") {
                    // Was just an instance of a component, add to collection and move on.
                    components.push(config);
                } else {
                	// KRIS: HALO: 
                	// This is hit, when you create a newComponentDeprecated and use raw values, vs configs on the attribute values.
                	// newComponentDeprecated("ui:button", {label: "Foo"});
                	
                    // JBUCH: HALO: TODO: VERIFY THIS IS NEVER HIT
                    $A.error("Component.createComponentStack: invalid config. Expected component definition, found '"+config+"'.");
                }
            }
            if (action) {
                action.popCreationPath(facetName);
            }
            facetStack[facetName]=components;
        }
        return facetStack;
    };


    ComponentPriv.prototype.setupSuper = function(cmp, configAttributes, localCreation, ccc) {
        var superDef = this.componentDef.getSuperDef();
        if (superDef) {
            var superConfig = {};
            var superDefConfig = {};
            superDefConfig["descriptor"] = superDef.getDescriptor();
            superConfig["componentDef"] = superDefConfig;
            superConfig["concreteComponentId"] = this.concreteComponentId || this.globalId;

            var superAttributes = {};
            if(configAttributes) {
                superAttributes["values"]={}; // configAttributes["values"]||{};
                var facets=this.componentDef.getFacets();
                if(facets) {
                    for (var i = 0; i < facets.length; i++) {
                        superAttributes["values"][facets[i]["descriptor"]] = facets[i]["value"];
                    }
                }
                superAttributes["events"] = configAttributes["events"];
                superAttributes["valueProvider"] = configAttributes["facetValueProvider"];
            }
            superConfig["attributes"] = superAttributes;
            $A.pushCreationPath("super");
            if (ccc) {
                ccc.loadComponent(superConfig, null, localCreation, this.setSuperComponent.bind(this), false, false, true);
            } else {
                this.setSuperComponent(componentService.newComponentDeprecated(superConfig, null, localCreation, true));
            }
            $A.popCreationPath("super");
        }
    };

    ComponentPriv.prototype.setSuperComponent = function(component) {
        if(component){
            this.superComponent = this.valueProviders["super"] = component;
        }
    };

    ComponentPriv.prototype.setupAttributes = function(cmp, config, localCreation) {
        //JBUCH: HALO: TODO: NOTE TO SELF: I THINK THERE IS SOMETHING STILL WRONG HERE.
        // I THINK THAT THE ORDER OF THE VALUES IS INCORRECT NOW
        // THIS MIGHT ALSO BE WHERE WE NEED TO DEREFERENCE CONFIG COPIES
        // SEE HTMLRENDERER.JS
        var configValues=(config&&config["values"])||{};
        if(!configValues.hasOwnProperty("body")){
            configValues["body"]=[];
        }
        var attributes={};
        var attributeDefs = this.componentDef.attributeDefs;

        var attributeNames=attributeDefs.getNames();

//JBUCH: HALO: TODO: EXTRACT THIS HACK; NEED TO GENERATE DEFAULT FACETS AS WELL
if(!this.concreteComponentId) {
    for (var x = 0; x < attributeNames.length; x++) {
        var name = attributeNames[x];
        if (!configValues.hasOwnProperty(name)) {
            var defaultDef = attributeDefs.getDef(name);
            var defaultValue = defaultDef.getDefault();
            if (defaultValue && defaultValue.length) {
                if (defaultDef.getTypeDefDescriptor() === "aura://Aura.Component[]" || defaultDef.getTypeDefDescriptor() === "aura://Aura.ComponentDefRef[]") {
                    configValues[defaultDef.getDescriptor().getQualifiedName()] = defaultValue;
                }else{
                    //JBUCH: HALO: FIXME: FIND A BETTER WAY TO HANDLE DEFAULT EXPRESSIONS
                    configValues[defaultDef.getDescriptor().getQualifiedName()]=valueFactory.create(defaultValue,null,cmp);
                }
            }
        }
    }
}
        for(var attribute in configValues) {
            var value = configValues[attribute];
            var attributeDef = attributeDefs.getDef(attribute);
            if (!attributeDef) {
                //JBUCH: HALO: TODO: DOES THIS MEAN CASE-MISMATCH OR UNKNOWN? ALSO, EVENTS!?!?
                continue;
            }
            var isFacet = attributeDef.getTypeDefDescriptor() === "aura://Aura.Component[]";
            var isDefRef = attributeDef.getTypeDefDescriptor() === "aura://Aura.ComponentDefRef[]";

// JBUCH: HALO: TODO: WHY DO WE NEED/ALLOW THIS?
            if ($A.componentService.isConfigDescriptor(value)) {
                value = value["value"];
            }

            if (isFacet) {
                if($A.util.isUndefinedOrNull(value)) {
                    continue;
                }
            	// If we don't setup the attributesValueProvider on the config, use the components.
            	var attributeValueProvider = (config&&config["valueProvider"])||cmp.getAttributeValueProvider();

                // JBUCH: HALO: DIEGO: TODO: Revisit to code is a bit ugly
                value = valueFactory.create(value, attributeDef, config["valueProvider"]);
                if($A.util.isExpression(value)){
                    value.addChangeHandler(cmp,"v."+attribute);
                    value = value.evaluate();
                }
                if($A.util.isString(value)){
                    value=[$A.newCmp({"componentDef":"aura:text", "attributes":{"values":{"value":value}}})];
                }
                var facetStack = this.createComponentStack([{"descriptor": attribute, value: value}], attributeValueProvider, localCreation);
                // JBUCH: HALO: TODO: DEDUPE THIS AGAINST lines 462 - 467 AFTER CONFIRMING IT WORKS
                if (attribute === "body") {
                    attributes[attribute]=(this.concreteComponentId&&cmp.getConcreteComponent().priv.attributes.get("body"))||{};
                    attributes[attribute][cmp.getGlobalId()] = facetStack["body"] || [];
                } else {
                    attributes[attribute] = facetStack[attribute];
                }
            }

            // JBUCH: HALO: TODO: CAN WE CHANGE/FIX/MOVE THIS?
            else if (isDefRef) {
                if ($A.util.isUndefinedOrNull(value)) {
                    continue;
                }
                if(!$A.util.isArray(value)){
                    // JBUCH: HALO: FIXME, THIS IS UGLY TOO
                	// It's not an Array, is it an expression that points to a CDR?
                	// Something like body="{!v.attribute}" on a facet should reference v.attribute
                	// which could and should be a ComponentDefRef[]
                	var reference = valueFactory.create(value, attributeDef, config["valueProvider"]);
                	if($A.util.isExpression(reference)) {
                        reference.addChangeHandler(cmp,"v."+attribute);
                        value = reference.evaluate();
                	}
                	// KRIS
                	// So I'm not quite sure when or why we would want to go in here.
                	// Hopefully I can find the reason the tests try to do this and document that here.
                	else {
	                    //JBUCH: HALO: TODO: SHOULD ALWAYS BE AN ARRAY BUT THIS FAILS TESTS
	                    // FILE STORY TO REMOVE/FAIL LATER
	                    value=[value];
	                    $A.warning("Component_private.setupAttributes: CDR[] WAS NOT AN ARRAY");
                	}
                }
                var cdrs=[];
                for(var i=0;i<value.length;i++){
                    // make a shallow clone of the cdr with the proper value provider set
                    var cdr = {};
                    cdr["componentDef"] = value[i]["componentDef"];
                    cdr["localId"] = value[i]["localId"];
                    cdr["attributes"] = value[i]["attributes"];
                    cdr["valueProvider"] = value[i]["valueProvider"] || config["valueProvider"];
//JBUCH: HALO: TODO: SOMETHING LIKE THIS TO FIX DEFERRED COMPDEFREFS?
//                    for(var x in cdr["attributes"]["values"]){
//                        cdr["attributes"]["values"][x] = valueFactory.create(cdr["attributes"]["values"][x], null, config["valueProvider"]);
//                    }
                    cdrs.push(cdr);
                }
                if (attribute === "body") {
                    attributes[attribute]=(this.concreteComponentId&&cmp.getConcreteComponent().priv.attributes.get("body"))||{};
                    attributes[attribute][cmp.getGlobalId()] = cdrs;
                } else {
                    attributes[attribute] = cdrs;
                }
            } else {
                attributes[attribute] = valueFactory.create(value, attributeDef, config["valueProvider"] || cmp);
                if($A.util.isExpression(attributes[attribute])){
                    attributes[attribute].addChangeHandler(cmp,"v."+attribute);
                }
            }
        }

        if(this.concreteComponentId) {
            var concreteComponent=cmp.getConcreteComponent();
            concreteComponent.priv.attributes.merge(attributes);
            this.attributes=concreteComponent.priv.attributes;
        }else{
            this.attributes = new AttributeSet(attributes, this.componentDef.attributeDefs, cmp);
        }
    };


    ComponentPriv.prototype.validatePartialConfig=function(config, partialConfig){
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
    };

    ComponentPriv.prototype.getActionCaller = function(valueProvider, actionExpression) {
        return function Component$getActionCaller(event) {
            if (valueProvider.isValid && !valueProvider.isValid()) {
                return;
            }
            var clientAction;
            // JBUCH: HALO: HACK: FIXME?
            actionExpression=valueFactory.create(actionExpression, null, valueProvider);

            if($A.util.isExpression(actionExpression)){
                 clientAction=actionExpression.evaluate();
            }else{
                 clientAction=valueProvider.get(actionExpression);
            }
            if (clientAction) {
                // JBUCH: HALO: HACK: FIXME?
                if($A.util.isString(clientAction)){
                    clientAction=valueProvider.getConcreteComponent().get(clientAction);
                }

                clientAction.runDeprecated(event);
            } else {
                $A.assert(false, "no client action by name " + actionExpression);
            }
        };
    };

    ComponentPriv.prototype.getEventDispatcher = function(cmp) {
        if (!this.eventDispatcher && cmp) {
            var dispatcher = {
                "get": function(key) {
                    return cmp.getEvent(key);
                }
            };
            this.eventDispatcher = dispatcher;
            this.valueProviders["e"] = dispatcher;
        }

        return this.eventDispatcher;
    };

    ComponentPriv.prototype.setupComponentEvents = function(cmp, config) {
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

            var values=config["events"]||config["values"];

            if (values) {
                var valueProvider = config["valueProvider"];
                for (var j = 0; j < keys.length; j++) {
                    var key = keys[j];
                    var eventValue = values[key];
                    if (eventValue) {
                        $A.assert(!this.concreteComponentId,
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
        return function ComponentPriv$getActionHandler(event) {
            if (cmp.isValid && !cmp.isValid()) {
                return;
            }

            var clientAction = cmp.get(actionExpression);
            if (clientAction) {
                clientAction.runDeprecated(event);
            } else {
                $A.assert(false, "no client action by name " + actionExpression);
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
                handlerConfig["action"] = valueFactory.create(handlerDef["action"],null,cmp);
                handlerConfig["value"] = valueFactory.create(handlerDef["value"],null,cmp);
                handlerConfig["event"] = handlerDef["name"];
                cmp.addValueHandler(handlerConfig);
            }
        }
    };

    /**
     * Adds a handler for the specified type of event. Currently only supports
     * 'change'.
     */
    ComponentPriv.prototype.addValueHandler = function(cmp,config) {
        var component=this.concreteComponentId?cmp.getConcreteComponent().priv:this;
        var event = config["event"];
        var handlers = component.handlers[event];
        if (!handlers) {
            handlers = component.handlers[event] = {};
        }

        var expression = config["value"];
        if($A.util.isExpression(expression)) {
            expression = expression.getExpression();
        }
        if (!handlers[expression]) {
            handlers[expression] = [];
        }

        for(var i=0;i<handlers[expression].length;i++){
            if (handlers[expression][i]===config["method"] || (config["id"] && config["key"] && handlers[expression][i]["id"] === config["id"] && handlers[expression][i]["key"] === config["key"])) {
                return;
            }
        }
        handlers[expression].push(config["method"]);
    };

    /**
     * Removes a handler for the specified type of event. Currently only supports
     * 'change'.
     */
    ComponentPriv.prototype.removeValueHandler = function(cmp,config) {
        var component = this.concreteComponentId ? cmp.getConcreteComponent().priv : this;
        var event = config["event"];
        var handlers = component.handlers[event];
        if (handlers) {
            var expression = config["value"];
            if ($A.util.isExpression(expression)) {
                expression = expression.getExpression();
            }
            if (handlers[expression]) {
                for (var i = 0; i < handlers[expression].length; i++) {
                    var method = handlers[expression][i];
                    if (method===config["method"] || (config["id"] && config["key"] && method["id"] === config["id"] && method["key"] === config["key"])) {
                        handlers[expression].splice(i--, 1);
                    }
                }
            }
        }
    };

     /**
     * Fires handlers registered for the specified key when the value changes
     */
    ComponentPriv.prototype.fireChangeEvent = function(cmp, key, oldValue, value, index) {
        var component=this.concreteComponentId?cmp.getConcreteComponent().priv:this;
        var handlers = component.handlers["change"];
        var observers=[];
        var keypath = key+".";
        for(var handler in handlers){
            if(handler == key || handler.indexOf(keypath)===0 || key.indexOf(handler+".")===0){
                observers=observers.concat(handlers[handler]);
            }
        }
        if (observers.length) {
            var eventDef = $A.get("e").getEventDef("aura:valueChange");
            var dispatcher = {};
            dispatcher[eventDef.getDescriptor().getQualifiedName()] = observers;
            var changeEvent = new Event({
                "eventDef" : eventDef,
                "eventDispatcher" : dispatcher
            });

            changeEvent.setParams({
                "expression" : key,
                "value" : value,
                "oldValue" : oldValue,
                "index" : index
            });
            changeEvent.fire();
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
            // JBUCH: HALO: TODO: MOVE THIS INTO PASSTHROUGHVALUE.
            var valueProvider=cmp.getAttributeValueProvider();
            if(valueProvider instanceof PassthroughValue){
                valueProvider=valueProvider.getComponent();
            }

            if(!valueProvider){
                $A.error("No attribute value provider defined for component " + cmp);
            }

            valueProvider.index(localId, this.globalId);
        }
    };

    ComponentPriv.prototype.deIndex = function(cmp) {
        var localId = this.localId;
        if (localId) {
            var valueProvider=cmp.getAttributeValueProvider();
            if(valueProvider instanceof PassthroughValue){
                valueProvider=valueProvider.getComponent();
            }
            valueProvider.deIndex(localId, this.globalId);
        }
    };

    ComponentPriv.prototype.injectComponent = function(config, cmp, localCreation, ccc) {

        var componentDef = this.componentDef;
        if ((componentDef.isAbstract() || componentDef.getProviderDef()) && !this.concreteComponentId) {

            var act = $A.getContext().getCurrentAction();
            if (act) {
                // allow the provider to re-use the path of the current component without complaint
                act.reactivatePath();
            }

            var self = this;
            var setProvided = function(realComponentDef, attributes) {

                $A.assert(realComponentDef && realComponentDef.auraType === "ComponentDef",
                    "No definition for provided component:" + componentDef);
                $A.assert(!realComponentDef.isAbstract(),
                    "Provided component cannot be abstract: " + realComponentDef);
                $A.assert(!realComponentDef.hasRemoteDependencies() || (realComponentDef.hasRemoteDependencies() && self.partialConfig),
                    "Client provided component cannot have server dependencies: " + realComponentDef);

                self.componentDef = realComponentDef;
                self.attributes.merge(attributes, realComponentDef.getAttributeDefs());
                // Re attaching values providers when injecting components
                // self.setupValueProviders(config["valueProviders"], cmp);
                // FIXME: @dval this is a BAD HACK, we need to understand rendering distance
                // on injected components...
                // self.componentDef.getRenderingDetails().distance-=1;
            };

            var providerDef = componentDef.getProviderDef();
            if (providerDef) {
                // use it
                providerDef.provide(cmp, localCreation, setProvided, ccc);
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

        var superComponent = renderable.getSuper();
        if (superComponent) {
            var superRenderer = superComponent.getRenderer();
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
        if (!$A.util.hasDataAttribute(element, $A.componentService.renderedBy)) {
            $A.util.setDataAttribute(element, $A.componentService.renderedBy, cmp.getGlobalId());
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

        if (value){
            if(value.auraType) {
                var type = value.auraType;
                if (type === "Component") {
                    return this.outputComponent(value, serialized, depth);
                } else if (type === "Action") {
                    return "Action";
                }
            }else{
                if($A.util.isArray(value)){
                    return this.outputArrayValue(value, avp, serialized, depth);
                }else if($A.util.isObject(value)){
                    return this.outputMapValue(value, avp, serialized, depth);
                }
            }
        }

        return value ? value.toString() : value;
    };

    ComponentPriv.prototype.outputMapValue = function(map, avp, serialized, depth) {
        var ret = {};
        var that = this;
        for(var key in map){
            var value=map[key];
            try {
                if($A.util.isExpression(value)){
                    ret[key]=that.output(value.evaluate(), avp, serialized, depth);
                }else{
                    ret[key] = that.output(value, avp, serialized, depth);
                }
            } catch (e) {
                ret[key] = "Error";
                $A.warning("Error in chrome plugin support", e);
            }
        }
        ret["__proto__"] = null;
        return ret;
    };

    ComponentPriv.prototype.outputArrayValue = function(array, avp, serialized, depth) {
        var ret = [];
        for (var i = 0; i < array.length; i++) {
            ret.push(this.output(array[i], avp, serialized, depth));
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
            var model = cmp.getModel();
            if (model) {
                ret.model = this.output(model, cmp.getAttributeValueProvider(), serialized, depth);
            }
            ret.attributeValueProvider = this.output(cmp.getAttributeValueProvider(),
                cmp.getAttributeValueProvider(), serialized, depth);

            var superComponent = cmp.getSuper();
            if (superComponent && depth < 10) {
                ret["super"] = this.output(superComponent, cmp, serialized, depth);
            } else if (superComponent) {
                ret["super"] = {
                        LAZY : superComponent.getGlobalId()
                };
            }
            var attributeDefs = cmp.getDef().getAttributeDefs();
            var that = this;
            attributeDefs.each(function(attributeDef) {
                var key = attributeDef.getDescriptor().toString();
                var val;
                try {
                    val = cmp.get("v."+key);
                } catch (e) {
                    val = undefined;
                }
                ret.attributes[key] = that.output(val, cmp.getAttributeValueProvider(), serialized, depth);
            });

            ret.attributes["__proto__"] = null;

            return ret;
        }
        return null;
    };

    return ComponentPriv;

}());
