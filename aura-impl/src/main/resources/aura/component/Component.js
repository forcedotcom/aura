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
/*jslint sub: true*/
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
        this.eventDispatcher = undefined;
        this.docLevelHandlers = undefined;
        this.references={};
        this.handlers = {};

        // flavor data
        if (config["flavorable"]) {
            this.flavorable = true;
        }

        if (config["flavor"]) {
            this.flavor = config["flavor"];
        }

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

        var partialConfig;
        if (this.creationPath && this.creationPath !== "client created") {
            partialConfig = context.getComponentConfig(this.creationPath);

            // Done with it in the context, it's now safe to remove so we don't process it again later.
            context.removeComponentConfig(this.creationPath);
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
        $A.componentService.index(cmp);

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

        // instantiates this components model
        this.setupModel(config["model"], cmp);

        // create all value providers for this component m/v/c etc.
        this.setupValueProviders(config["valueProviders"], cmp);

        // runs component provider and replaces this component with the
        // provided one
        this.injectComponent(config, cmp, localCreation);

        // instantiates this components methods
        this.setupMethods(config, cmp);

        // sets up component level events
        this.setupComponentEvents(cmp, configAttributes);

        // instantiate super component(s)
        this.setupSuper(cmp, configAttributes, localCreation);

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

        if (forcedPath && act && this.creationPath) {
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
                suffix = "g";
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

        var old = $A.componentService.get(globalId);
        if (old) {
            $A.log("ComponentPriv.setupGlobalId: globalId already in use: '"+globalId+"'.");
        }

        this.globalId = globalId;
    };

    ComponentPriv.prototype.getValueProvider = function(key, cmp) {
        if (!$A.util.isString(key)) {
            $A.error("ComponentPriv.getValueProvider(): 'key' must be a valid String.");
        }
        return this.valueProviders[key.toLowerCase()];
    };

    /**
     * Create the value providers
     */
    ComponentPriv.prototype.setupValueProviders = function(customValueProviders, cmp) {
        var vp=this.valueProviders;
        vp["v"]=this.attributes;
        vp["m"]=this.model;
        vp["c"]=this.createActionValueProvider(cmp);
        vp["e"]=this.getEventDispatcher(cmp);
        vp["this"]=cmp;
        vp["globalid"]=cmp.getGlobalId();
        vp["def"]=this.componentDef;
        vp["style"]=this.createStyleValueProvider(cmp);
        vp["super"]=this.superComponent;
        vp["null"]=null;

        for (var key in customValueProviders) {
            cmp.addValueProvider(key,customValueProviders[key]);
        }
    };

    ComponentPriv.prototype.createActionValueProvider = function(cmp) {
        var controllerDef = this.componentDef.getControllerDef();
        if (controllerDef) {
            return {
                actions:{},
                get : function(key) {
                    var ret = this.actions[key];
                    if (!ret) {
                        var actionDef = controllerDef.getActionDef(key);
                        $A.assert(actionDef,"Unknown controller action '"+key+"'");
                        if (actionDef) {
                            ret = valueFactory.create(actionDef, null, cmp);
                            this.actions[key] = ret;
                        }
                    }
                    return ret.getAction();
                }
            };
        }
    };

    ComponentPriv.prototype.createStyleValueProvider = function(cmp) {
        return {
            get: function(key) {
                if (key === "name") {
                    var styleDef = cmp.getDef().getStyleDef();
                    return !$A.util.isUndefinedOrNull(styleDef) ? styleDef.getClassName() : null;
                } else if (key === "flavor") {
                    var flavor = cmp.getFlavor();
                    // todo-- nathan: this is probably wrong
                    if (!$A.util.isUndefinedOrNull(flavor)) {
                       flavor = valueFactory.create(flavor, null, cmp.getComponentValueProvider());
                       return $A.util.buildFlavorClass(cmp, $A.util.isExpression(flavor) ? flavor.evaluate() : flavor);
                    }
                    return null;
                }
            }
        };
    };

    /**
     * A reference to the ComponentDefinition for this instance
     */
    ComponentPriv.prototype.setupComponentDef = function(config) {
        var componentDef = $A.componentService.getDef(config["componentDef"]);
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

                if (config && config.auraType === "Component") {
                    components.push(config);
                } else if (config && config["componentDef"]) {
                    if (action) {
                        action.setCreationPathIndex(index);
                    }
                    $A.getContext().setCurrentAccess(valueProvider);
                    components.push($A.componentService["newComponentDeprecated"](config, valueProvider, localCreation, true));
                    $A.getContext().releaseCurrentAccess();
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


    ComponentPriv.prototype.setupSuper = function(cmp, configAttributes, localCreation) {
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
            $A.getContext().setCurrentAccess(cmp);
            this.setSuperComponent($A.componentService["newComponentDeprecated"](superConfig, null, localCreation, true));
            $A.getContext().releaseCurrentAccess();
            $A.popCreationPath("super");
        }
    };

    ComponentPriv.prototype.setSuperComponent = function(component) {
        if(component){
            this.superComponent = component;
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
                    configValues[defaultDef.getDescriptor().getName()] = defaultValue;
                }else{
                    //JBUCH: HALO: FIXME: FIND A BETTER WAY TO HANDLE DEFAULT EXPRESSIONS
                    configValues[defaultDef.getDescriptor().getName()]=valueFactory.create(defaultValue,null,cmp);
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
                    attributes[attribute][cmp.priv.globalId] = facetStack["body"] || [];
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
                        reference.addChangeHandler(cmp,"v."+attribute,null,true);
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
                    cdr["flavor"] = value[i]["flavor"];
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
                    attributes[attribute][cmp.priv.globalId] = cdrs;
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

    ComponentPriv.prototype.getMethodHandler = function(valueProvider,name,action,attributes){
        var observer=this.getActionCaller(valueProvider,action||("c."+name));
        return function(param1,param2,paramN){
            var eventDef = $A.get("e").getEventDef("aura:methodCall");
            var dispatcher = {};
            dispatcher[eventDef.getDescriptor().getQualifiedName()] = [observer];
            var methodEvent = new Event({
                "eventDef" : eventDef,
                "eventDispatcher" : dispatcher
            });
            var params={
                "name" : name,
                "arguments": null
            };
            if(attributes) {
                params["arguments"]={};
                var counter=0;
                for (var attribute in attributes){
                    params["arguments"][attribute]=(arguments[counter] == undefined ? attributes[attribute]["default"] : arguments[counter]) ;
                    counter++;
                }
                for(var i=counter;i<arguments.length;i++){
                    params["argument_"+i]=arguments[i];
                }
            }else{
                params["arguments"]=$A.util.toArray(arguments);
            }
            methodEvent.setParams(params);
            methodEvent.setComponentEvent();
            methodEvent.fire();
        };
    };

    ComponentPriv.prototype.getActionCaller = function(valueProvider, actionExpression) {
        if(!valueProvider&&$A.util.isExpression(actionExpression)){
            valueProvider=actionExpression.valueProvider;
        }
        return function Component$getActionCaller(event) {
            if (valueProvider.isValid && !valueProvider.isValid() && event.getDef().getDescriptor().getName() !== "valueDestroy") {
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
                        cmp.addHandler(key, valueProvider, eventValue["value"]||eventValue);
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
                handlerConfig["globalId"] = cmp.priv.globalId;
                handlerConfig["handler"] = getHandler(cmp, handlerDef["action"]);
                handlerConfig["event"] = handlerDef["eventDef"].getDescriptor().getQualifiedName();
                $A.eventService.addHandler(handlerConfig);
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

    ComponentPriv.prototype.setupMethods = function(config, cmp) {
        var defs = this.componentDef.methodDefs;
        if (defs) {
            var method;
            for(var i=0;i<defs.length;i++){
                method=defs[i];
                cmp[method.name]=this.getMethodHandler(cmp,method.name,method.action,method.attributes);
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

    ComponentPriv.prototype.injectComponent = function(config, cmp, localCreation) {

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

                // JBUCH: HALO: TODO: FIND BETTER WAY TO RESET THESE AFTER PROVIDER INJECTION
                self.componentDef = realComponentDef;
                self.attributes.merge(attributes, realComponentDef.getAttributeDefs());

                 // KRIS: IN THE MIDDLE OF THIS FOR PROVIDED COMPONENTS
                var classConstructor =  $A.componentService.getComponentClass(realComponentDef.getDescriptor().getQualifiedName()) || Component;
                if (classConstructor && cmp["constructor"] != classConstructor) {
                    // Doesn't do a whole lot, but good for debugging, not sure what the stack trace looks like.
                    cmp["constructor"] = classConstructor;

                    // Reassign important members. Assign to both external reference, and internal reference.
                    cmp["helper"] = classConstructor.prototype["helper"];
                    cmp["render"] = classConstructor.prototype["render"];
                    cmp["rerender"] = classConstructor.prototype["rerender"];
                    cmp["afterRender"] = classConstructor.prototype["afterRender"];
                    cmp["unrender"] = classConstructor.prototype["unrender"];
                }

                self.setupModel(config["model"],cmp);
                self.valueProviders["m"]=self.model;
                self.valueProviders["c"]=self.createActionValueProvider(cmp);
            };

            var providerDef = componentDef.getProviderDef();
            if (providerDef) {
                // use it
                providerDef.provide(cmp, localCreation, setProvided);
            } else {
                var partialConfig = this.partialConfig;
                $A.assert(partialConfig,
                            "Abstract component without provider def cannot be instantiated : "
                            + componentDef);
                setProvided($A.componentService.getDef(partialConfig["componentDef"]), null);
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
            $A.util.setDataAttribute(element, $A.componentService.renderedBy, cmp.priv.globalId);
        }
    };

    ComponentPriv.prototype.output = function(value, avp, serialized, depth) {
        if (serialized === undefined) {
            serialized = [];
            depth = 0;
        } else {
            depth++;
        }

        if (value){
            var isArray = $A.util.isArray(value);
            // Look for value in serialized
            if(typeof value === "object" && !isArray) {
                var length = serialized.length;
                for(var c=0;c<length;c++) {
                    if(serialized[c] === value) {
                        return { "$serRefId": c };
                    }
                }

                value["$serId"] = length;
                serialized.push(value);
            }

            if(value.auraType) {
                var type = value.auraType;
                if (type === "Component") {
                    return this.outputComponent(value, serialized, depth);
                } else if (type === "Action") {
                    return "Action";
                }
            }else{
                if(isArray){
                    return this.outputArrayValue(value, avp, serialized, depth);
                } else if($A.util.isElement(value)) {
                    var domOutput = {};
                    domOutput["tagName"]  = value.tagName;
                    domOutput["id"] = value.id||"";
                    domOutput["className"] = value.className||"";
                    domOutput["$serId"] = value["$serId"];
                    domOutput["__proto__"] = null;
                    return domOutput;
                } else if($A.util.isObject(value)){
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
            if(key == "$serId"){
                ret[key] = value;
                continue;
            }
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
            ret["descriptor"] = cmp.getDef().getDescriptor().toString();
            ret["globalId"] = cmp.priv.globalId;
            ret["localId"] = cmp.getLocalId();
            ret["rendered"] = cmp.isRendered();
            ret["valid"] = cmp.isValid();
            ret["expressions"] = {};
            var model = cmp.getModel();
            if (model) {
                ret["model"] = this.output(model, cmp.getAttributeValueProvider(), serialized, depth);
            }

            var attributeDefs = cmp.getDef().getAttributeDefs();
            var that = this;
            //var values = cmp.get("v").values;
            //if(cmp.isConcrete()) {
                ret.attributes = {};
                var values = cmp.priv.attributes.values;


                attributeDefs.each(function ComponentPriv$outputComponent$forEachAttribute(attributeDef) {
                    var key = attributeDef.getDescriptor().name;
                    var val;
                    var rawValue;
                    try {
                        val = cmp.get("v."+key);
                        rawValue = values[key];
                    } catch (e) {
                        val = undefined;
                    }
                    if($A.util.isExpression(rawValue)) {
                        // KRIS: Also needs to output the value provider for the expression.

                        // KRIS: This rawValue only works in non prod mode, otherwise you get "PropertyReferenceValue"
                        ret["expressions"][key] = rawValue+"";
                    }
                    if(key != "body") {
                        ret.attributes[key] = that.output(val, cmp.getAttributeValueProvider(), serialized, depth);
                    } else {
                        ret.attributes[key] = {};
                        for(var id in rawValue) {
                            if(rawValue.hasOwnProperty(id)) {
                                ret.attributes[key][id] = that.output(rawValue[id], cmp.getAttributeValueProvider(), serialized, depth);
                            }
                        }
                    }
                });

                ret.attributes["__proto__"] = null;
            //}
            var valueProvider = cmp.getAttributeValueProvider();
            ret["attributeValueProvider"] = this.output(valueProvider,
                cmp.getAttributeValueProvider(), serialized, depth);

            var superComponent = cmp.getSuper();
            if (superComponent) {
                ret["super"] = this.output(superComponent, cmp, serialized, depth);
            }

            if("$serId" in cmp) {
                ret["$serId"] = cmp["$serId"];
            }

            return ret;
        }
        return null;
    };

    return ComponentPriv;

}());
/**
 * Construct a new Component.
 *
 * @public
 * @class
 * @constructor
 *
 * @param {Object}
 *            config - component configuration
 * @param {Boolean}
 *            [localCreation] - local creation
 * @param {Boolean} [creatingPrototype] - creating a prototype only
 * @platform
 */
function Component(config, localCreation, creatingPrototype) {
    if(creatingPrototype) {
        return;
    }

    this.priv = new ComponentPriv(config, this, localCreation);
    this._destroying = false;

    // #if {"modes" : ["TESTING","AUTOTESTING", "TESTINGDEBUG",
    // "AUTOTESTINGDEBUG"]}
    this["creationPath"] = this.priv.creationPath;
    // #end

    this.fire("init");
}

/**
 * The Component type.
 * <p>
 * Examples:
 * </p>
 * <p>
 * <code>//Checks if the component value is of this type<br />obj.auraType === "Component"</code>
 * </p>
 * <p>
 * <code>//Checks if the elements in the body is of this type<br />
 * var body = cmp.get("v.body");<br />
 * var child = body[i];<br />
 * if (child.auraType === "Component") { //do something }
 * </code>
 * </p>
 *
 * @public
 */
Component.prototype.auraType = "Component";

/**
 * Gets the ComponentDef Shorthand: <code>get("def")</code>
 *
 * @public
 */
Component.prototype.getDef = function() {
    return this.priv.componentDef;
};

/**
 * Indexes the given <code>globalId</code> based on the given
 * <code>localId</code>. Allows <code>cmp.find(localId)</code> to look up
 * the given <code>globalId</code>, look up the component, and return it.
 *
 * @param {String}
 *            localId The id set using the aura:id attribute.
 * @param {String}
 *            globalId The globally unique id which is generated on pageload.
 * @protected
 */
Component.prototype.index = function(localId, globalId) {
    var priv = this.priv;

    var index = priv.index;
    if (!index) {
        index = {};
        priv.index = index;
    }

    var existing = index[localId];
    if (existing) {
        if (!$A.util.isArray(existing)) {
            index[localId] = [ existing, globalId ];
        } else {
            existing.push(globalId);
        }
    } else {
        index[localId] = globalId;
    }
    return null;
};

/**
 * Removes data from the index. If both <code>globalId</code> and
 * <code>localId</code> are provided, only the given pair is removed from the
 * index. If only <code>localId</code> is provided, every mapping for that
 * <code>localId</code> is removed from the index.
 *
 * This might be called after component destroy in some corner cases, be careful
 * to check for priv before accessing.
 *
 * @param {String}
 *            localId The id set using the aura:id attribute.
 * @param {String}
 *            globalId The globally unique id which is generated on pageload.
 * @protected
 */
Component.prototype.deIndex = function(localId, globalId) {
    var priv = this.priv;

    //
    // Unfortunately, there are some bizarre loops with deIndex and destroy.
    // For the moment, we don't enforce that this is a valid component until
    // we can track down _why_ it is being called on already destroyed
    // components
    if (!this.priv) {
        return null;
    }

    if (priv.index) {
        if (globalId) {
            var index = priv.index[localId];
            if (index) {
                if ($A.util.isArray(index)) {
                    for (var i = 0; i < index.length; i++) {
                        if (index[i] === globalId) {
                            index.splice(i, 1);
                            //
                            // If we have removed an index, we need to back up
                            // our counter to process the same index.
                            //
                            i -= 1;
                        }
                    }
                    if (index.length === 0) {
                        delete priv.index[localId];
                    }
                } else {
                    if (index === globalId) {
                        delete priv.index[localId];
                    }
                }
            }
        } else {
            delete priv.index[localId];
        }
    }
    return null;
};

/**
 * Locates a component using the localId. Shorthand: <code>get("asdf")</code>,
 * where "asdf" is the <code>aura:id</code> of the component to look for. See
 * <a href="#help?topic=findById">Finding Components by ID</a> for more
 * information. Returns instances of a component using the format
 * <code>cmp.find({ instancesOf : "auradocs:sampleComponent" })</code>.
 *
 * @param {String|Object}
 *            name If name is an object, return instances of it. Otherwise,
 *            finds a component using its index.
 * @public
 * @platform
 */
Component.prototype.find = function(name) {
    //JBUCH: HALO: TODO: I WANT TO SEPARATE THESE CONCEPTS, AND EXPOSE cmp.findInstances("foo:bar","foo:baz");
    if ($A.util.isObject(name)) {
        var type = name["instancesOf"];
        var instances = [];
        this.findInstancesOf(type, instances, this);
        return instances;
    } else {
        var index = this.priv.index;
        if (index) {
            var globalId = index[name];
            if (globalId) {
                if ($A.util.isArray(globalId)) {
                    var ret = [];
                    for (var i = 0; i < globalId.length; i++) {
                        ret.push($A.componentService.get(globalId[i]));
                    }
                    return ret;
                }
                return $A.componentService.get(globalId);
            }
        }
    }

    // For non-existent objects, we return undefined so that
    // we can distinguish between not existing and null.
    return undefined;
};

/**
 * Find instances of a Component type, in this component's hierarchy, and in
 * its body, recursively.
 *
 * @param {Object}
 *            type The object type.
 * @param {Array}
 *            ret The array of instances to add the located Components to.
 * @param {Object}
 *            cmp The component to search for.
 * @private
 */
Component.prototype.findInstancesOf = function(type, ret, cmp) {
    // JBUCH: HALO: TODO: CAN WE MAKE THIS PUBLIC, INSTEAD OF THE cmp.find({instancesOf:"ui:something"}) DANCE?
    cmp = cmp || this.getSuperest();

    var body = cmp.get("v.body");
    if (body) {
        for (var i = 0; i < body.length; i++) {
            cmp = body[i];
            if (cmp.findInstanceOf) {
                var inst = cmp.findInstanceOf(type);
                if (inst) {
                    ret.push(inst);
                } else {
                    cmp.findInstancesOf(type, ret);
                }
            }
        }
    }
};

/**
 * @private
 */
Component.prototype.getSuperest = function() {
    var superComponent = this.getSuper();
    if (superComponent) {
        return superComponent.getSuperest() || superComponent;
    } else {
        return this;
    }
};

/**
 *
 * @private
 */
Component.prototype.findInstanceOf = function(type) {
    var descriptor = this.getDef().getDescriptor();
    if ((descriptor.getNamespace() + ":" + descriptor.getName()) === type) {
        return this;
    } else {
        var superComponent = this.getSuper();
        if (superComponent) {
            return superComponent.findInstanceOf(type);
        } else {
            return null;
        }
    }
};

/**
 * Checks whether the component is an instance of the given component name (or
 * interface name).
 *
 * @param {String}
 *            name The name of the component (or interface), with a format of
 *            <code>namespace:componentName</code>.
 * @returns {Boolean} true if the component is an instance, or false otherwise.
 * @platform
 */
Component.prototype.isInstanceOf = function(name) {
    return this.getDef().isInstanceOf(name);
};

/**
 * @param {Object}
 *            type Applies the type to its definition.
 * @private
 */
Component.prototype.implementsDirectly = function(type) {
    return this.getDef().implementsDirectly(type);
};

/**
 * Adds an event handler. Resolving the handler Action happens at Event-handling
 * time, so the Action reference may be altered at runtime, and that change is
 * reflected in the handler. See <a
 * href="#help?topic=dynamicHandler">Dynamically Adding Event Handlers</a> for
 * more information.
 *
 * @param {String}
 *            eventName The event name
 * @param {Object}
 *            valueProvider The value provider to use for resolving the
 *            actionExpression.
 * @param {Object}
 *            actionExpression The expression to use for resolving the handler
 *            Action against the given valueProvider.
 * @param {boolean}
 *            insert The flag to indicate if we should put the handler at the
 *            beginning instead of the end of handlers array.
 * @public
 * @platform
 */
Component.prototype.addHandler = function(eventName, valueProvider, actionExpression, insert) {
    var dispatcher = this.priv.getEventDispatcher(this);

    var handlers = dispatcher[eventName];
    if (!handlers) {
        handlers = [];
        dispatcher[eventName] = handlers;
    }

    if (insert === true) {
        handlers.unshift(this.priv.getActionCaller(valueProvider, actionExpression));
    } else {
        handlers.push(this.priv.getActionCaller(valueProvider, actionExpression));
    }
};

/**
 * Adds handlers to Values owned by the Component.
 *
 * @param {Object}
 *            config Passes in the value, event (e.g. "change"), and action
 *            (e.g. "c.myAction").
 * @public
 */
Component.prototype.addValueHandler = function(config) {
    var value = config["value"];
    if ($A.util.isExpression(value)&&value.getExpression()==="this") {
        var eventQName = this.priv.componentDef.getEventDef(config["event"], true).getDescriptor().getQualifiedName();
        this.addHandler(eventQName, this, config["action"]);
        return;
    }
    if(config["action"]&&!config["method"]){
        config["method"]=this.priv.getActionCaller(this, config["action"].getExpression());
    }
    this.priv.addValueHandler(this,config);
};

Component.prototype.removeValueHandler = function(config) {
    this.priv.removeValueHandler(this,config);
};

/**
 * Add a document level event handler that auto-cleans.
 *
 * When called, this will create and return a handler that can be enabled and
 * disabled at will, and will be cleaned up on destroy.
 *
 * @public
 * @param {String}
 *            eventName the event name to attach.
 * @param {Function}
 *            callback the callback (only called when enabled, and component is
 *            valid & rendered)
 * @param {Boolean}
 *            autoEnable (truthy) enable the handler when created.
 * @return {Object} an object with a single visible call of setEnabled(Boolean)
 */
Component.prototype.addDocumentLevelHandler = function(eventName, callback, autoEnable) {
    var dlh = new Aura.Utils.DocLevelHandler(eventName, callback, this);
    if (!this.priv.docLevelHandlers) {
        this.priv.docLevelHandlers = {};
    }
    $A.assert(this.priv.docLevelHandlers[eventName] === undefined, "Same doc level event set twice");
    this.priv.docLevelHandlers[eventName] = dlh;
    dlh.setEnabled(autoEnable);
    return dlh;
};

/**
 * Remove a document level handler.
 *
 * You need only call this if the document level handler should be destroyed, it
 * is not generally needed.
 *
 * @public
 * @param {Object}
 *            the object returned by addDocumentHandler.
 */
Component.prototype.removeDocumentLevelHandler = function(dlh) {
    if (dlh && dlh.setEnabled) {
        dlh.setEnabled(false);
        this.priv.docLevelHandlers[dlh.eventName] = undefined;
    }
};

/**
 * Forces the final destroy of a component (after async).
 */
Component.prototype.finishDestroy = function() {
    this.destroy(false);
};

/**
 * Destroys the component and cleans up memory.
 *
 * <code>destroy()</code> destroys the component immediately while
 * <code>destroy(true)</code> destroys it asynchronously. See <a
 * href="#help?topic=dynamicCmp"/>Dynamically Creating Components</a> for more
 * information.
 * <p>
 * Note that when this is called with async = true, it makes a specific race
 * condition (i.e. calling functions after destroy) harder to trigger. this
 * means that we really would like to be able to for synchronous behaviour here,
 * or do something to make the destroy function appear much more like it is
 * doing a synchronous destroy (e.g. removing this.priv). Unfortunately, the act
 * of doing an asynchronous destroy creates false 'races' because it leaves all
 * of the events wired up.
 * </p>
 *
 * @param {Boolean}
 *            async Set to true if component should be destroyed asynchronously.
 *            The default value is true.
 * @public
 * @platform
 */
Component.prototype.destroy = function(async) {
    var concrete = this.getConcreteComponent();
    if (concrete && this !== concrete && concrete.isValid()) {
        concrete.destroy(async);
        return;
    }
    
    this.fire("destroy");

    // #if {"modes" : ["TESTING", "TESTINGDEBUG", "AUTOTESTING",
    // "AUTOTESTINGDEBUG"]}
    async = false; // Force synchronous destroy when in testing modes
    // #end

    if (this.priv && !this._destroying) {
        // DCHASMAN TODO W-1879487 Reverted in 188 because of hard to diagnose
        // rerendering weirdness in a couple of tests and one:'s mru/lists view
        // Default to async destroy
        /*
         * if (async === undefined) { async = true; }
         */

        var key;

        if (this.priv.docLevelHandlers !== undefined) {
            for (key in this.priv.docLevelHandlers) {
                var dlh = this.priv.docLevelHandlers[key];
                if (dlh && dlh.setEnabled) {
                    dlh.setEnabled(false);
                }
            }
        }

        if (async) {
            this._scheduledForAsyncDestruction = true;

            for (var i=0;i<this.priv.elements.length;i++) {
                var element = this.priv.elements[i];
                if (element && element.style) {
                    element.style.display = "none";
                }
            }

            $A.util.destroyAsync(this);

            return null;
        }

        // call unrender before setting _destroying
        // so that _destroying could be used for isValid check.
        $A.renderingService.unrender(this);
        this._destroying = true;

        var priv = this.priv;
        var componentDef = this.getDef();
        var superComponent = this.getSuper();
        var globalId = priv.globalId;

        // Track some useful debugging information for InvalidComponent's use
        // #if {"excludeModes" : ["PRODUCTION"]}
        this._globalId = globalId;
        this._componentDef = componentDef;
        if(!this._description){this.toString();}
        // #end
        if (priv.attributes) {
            var expressions=priv.attributes.destroy(async);
            for(var x in expressions){
                expressions[x].removeChangeHandler(this,"v."+x);
            }
        }

        priv.elements = undefined;

        priv.deIndex(this);
        $A.componentService.deIndex(globalId);

        var vp = priv.valueProviders;
        if(vp) {
            for ( var k in vp) {
                var v = vp[k];
                if (v&&v!=this) {
                    if ($A.util.isFunction(v.destroy)) {
                        v.destroy(async);
                    }
                    delete vp[k];
                }
            }
        }

       // Swap in InvalidComponent prototype to keep us from having to add
        // validity checks all over the place
        $A.util.apply(this, InvalidComponent.prototype, true);
        // Fix for <= IE8 DontEnum bug.
        this.toString=InvalidComponent.prototype.toString;

        if (priv.model) {
            priv.model.destroy(async);
        }

        var ar = priv.actionRefs;
        if (ar) {
            for (k in ar) {
                ar[k].destroy(async);
            }
        }

        if (componentDef) {
            var handlerDefs = componentDef.getAppHandlerDefs();
            if (handlerDefs) {
                for (i = 0; i < handlerDefs.length; i++) {
                    var handlerDef = handlerDefs[i];
                    var handlerConfig = {};
                    handlerConfig["globalId"] = globalId;
                    handlerConfig["event"] = handlerDef["eventDef"].getDescriptor().getQualifiedName();
                    $A.eventService.removeHandler(handlerConfig);
                }
            }
        }

        if (superComponent) {
            superComponent.destroy(async);
        }

// JBUCH: HALO: TODO: FIXME
//        var references=priv.references;
//        if(references){
//            for(var reference in references){
//                references[reference].destroy();
//            }
//        }

        var eventDispatcher = priv.getEventDispatcher();
        if (eventDispatcher) {
            for (key in eventDispatcher) {
                var vals = eventDispatcher[key];
                if (vals) {
                    for (var j = 0; j < vals.length; j++) {
                        delete vals[j];
                    }

                    delete eventDispatcher[key];
                }
            }
        }

        this._marker=null;
        priv.superComponent = null;
        priv.model = null;
        priv.attributes = null;
        priv.valueProviders = null;
        priv.renderer = null;
        priv.actionRefs = null;
        priv.handlers=null;
        priv.eventDispatcher = null;
        priv.index = null;
        priv.componentDef = null;
        this.priv = null;

        this._destroying = false;

        return globalId;
    }

    return null;
};

/**
 * Returns true if this component has been rendered and valid.
 *
 * @protected
 */
Component.prototype.isRenderedAndValid = function() {
    return this.priv && !this._destroying && this.priv.rendered;
};


/**
 * Execute the super components render method.
 * @protected
 */
Component.prototype.superRender = function() {
    return this.getSuper()["render"]();
};

/**
 * Execute the super components rerender method.
 * @protected
 */
Component.prototype.superRerender = function() {
    return this.getSuper()["rerender"]();
};

/**
 * Execute the super components afterRender method.
 * @protected
 */
Component.prototype.superAfterRender = function() {
    return this.getSuper()["afterRender"]();
};

/**
 * Execute the super components superUnrender method.
 * @protected
 */
Component.prototype.superUnrender = function() {
    return this.getSuper()["unrender"]();
};

/**
 * Returns true if this component has been rendered but not unrendered (does not
 * necessarily mean component is in the dom tree).
 *
 * @protected
 * @platform
 */
Component.prototype.isRendered = function() {
    return this.priv.rendered;
};

/**
 * Returns true if this component has been rendered but not unrendered (does not
 * necessarily mean component is in the dom tree).
 *
 * @private
 */
Component.prototype.setUnrendering = function(unrendering) {
    this.priv.inUnrender = unrendering;
};

/**
 * Returns true if this component has been rendered but not unrendered (does not
 * necessarily mean component is in the dom tree).
 *
 * @private
 */
Component.prototype.isUnrendering = function() {
    return this.priv.inUnrender;
};

/**
 * Sets the rendered flag.
 *
 * @param {Boolean}
 *            rendered Set to true if component is rendered, or false otherwise.
 * @protected
 */
Component.prototype.setRendered = function(rendered) {
    this.priv.rendered = rendered;
};

/**
 * Returns the renderer instance for this component.
 *
 * @protected
 */
Component.prototype.getRenderer = function() {
    return this.priv.renderer;
};

/**
 * Returns the renderable instance for this component.
 * @protected
 */
Component.prototype.getRenderable = function() {
    return this.priv.renderer.renderable;
};

/**
 * Gets the globalId. This is the generated globally unique id of the component.
 * It can be used to locate the instance later, but will change across
 * pageloads.
 *
 * @public
 * @platform
 */
Component.prototype.getGlobalId = function() {
    return this.priv.concreteComponentId || this.priv.globalId;
};

/**
 * Get the id set using the <code>aura:id</code> attribute. Can be passed into
 * <code>find()</code> on the parent to locate this child.
 *
 * @public
 * @platform
 */
Component.prototype.getLocalId = function() {
    return this.priv.localId;
};

/**
 * If the server provided a rendering of this component, return it.
 *
 * @public
 */
Component.prototype.getRendering = function() {
    var concrete = this.getConcreteComponent();

    if (this !== concrete) {
        return concrete.getRendering();
    } else {
        return this.priv.rendering;
    }
};

/**
 * Returns the super component.
 *
 * @protected
 * @platform
 */
Component.prototype.getSuper = function() {
    return this.priv.superComponent;
};

/* jslint sub: true */
/**
 * Associates a rendered element with the component that rendered it for later
 * lookup. Also adds the rendering component's global Id as an attribute to the
 * rendered element. Primarily called by RenderingService.
 *
 * @param {Object}
 *            config
 * @protected
 */
Component.prototype.associateElement = function(element) {
    if (!this.isConcrete()) {
        var concrete = this.getConcreteComponent();
        concrete.associateElement(element);
    } else {
        var priv = this.priv;
        if (!priv.elements) {
            priv.elements = [];
        }

        priv.elements.push(element);
        priv.associateRenderedBy(this, element);
    }
};

/**
 * Disassociates a rendered element with the component that rendered it for later
 * lookup.
 *
 * @param {Object}
 *            config
 * @protected
 */
Component.prototype.disassociateElements = function() {
    if (!this.isConcrete()) {
        var concrete = this.getConcreteComponent();
        concrete.disassociateElements();
    } else {
        if(this.priv.elements){
            this.priv.elements.length=0;
        }
    }
};

/**
 * Returns a map of the elements previously rendered by this component.
 *
 * @public
 * @platform
 */
Component.prototype.getElements = function() {
    if (!this.isConcrete()) {
        var concrete = this.getConcreteComponent();
        return concrete.getElements();
    } else {
        return (this.priv.elements && this.priv.elements.slice(0)) || [];
    }
};

/**
 * If the component only rendered a single element, return it. Otherwise, you
 * should use <code>getElements()</code>.
 *
 * @public
 * @platform
 */
Component.prototype.getElement = function() {
    var elements = this.getElements();
    if (elements) {
        for (var i = 0; i<elements.length; i++) {
            if (elements[i]){
                return elements[i];
            }
        }
    }
    return null;
};

/**
 * Returns a live reference to the value indicated using property syntax.
 *
 * @param {String}
 *            key The data key for which to return a reference.
 * @return {PropertyReferenceValue}
 * @public
 * @platform
 */
Component.prototype.getReference = function(key) {
    key = $A.expressionService.normalize(key);
    if(!this.priv.references.hasOwnProperty(key)){
        this.priv.references[key]=new PropertyReferenceValue(key, this);
    }
    return this.priv.references[key];
};

/**
 * Clears a live reference to the value indicated using property syntax.
 *
 * @param {String}
 *            key The data key for which to clear the reference.
 * @public
 * @platform
 */
Component.prototype.clearReference = function(key) {
    key = $A.expressionService.normalize(key);
    $A.assert(key.indexOf('.') > -1, "Unable to clear reference for key '" + key + "'. No value provider was specified. Did you mean 'v." + key + "'?");
    var path = key.split('.');
    var valueProvider = this.priv.getValueProvider(path.shift(), this);
    $A.assert(valueProvider, "Unknown value provider for key '" + key + "'.");
    $A.assert(valueProvider.clearReference, "Value provider does not implement clearReference() method.");
    var subPath=path.join('.');
    var value=valueProvider.clearReference(subPath);
    if($A.util.isExpression(value)){
        value.removeChangeHandler(this,key);
    }
};

/**
 * Returns the value referenced using property syntax.
 *
 * @param {String}
 *            key The data key to look up on the Component.
 * @public
 * @platform
 */
Component.prototype.get = function(key) {
    key = $A.expressionService.normalize(key).replace(/^v\.body\b/g,"v.body."+this.priv.globalId);
    var path = key.split('.');
    var root = path.shift();
    var valueProvider = this.priv.getValueProvider(root, this);
    if (path.length) {
        if(!valueProvider){
            $A.assert(false, "Unable to get value for key '" + key + "'. No value provider was found for '" + root + "'.");
        }
        if($A.util.isFunction(valueProvider.get)){
            return valueProvider.get(path.join('.'),this);
        }else{
            return $A.expressionService.resolve(path,valueProvider);
        }
    } else {
        return valueProvider;
    }
};

/**
 * Returns a shadow value. Used for programmatically adding values after FCVs.
 * THIS IS NOT FOR YOU. DO NOT USE.
 *
 * @param {String}
 *            key The data key to look up on the Component.
 * @private
 */
Component.prototype.getShadowAttribute = function(key) {
    if(key.indexOf('v.')!==0){
        return null;
    }
    return this.priv.attributes.getShadowValue(key.substr(2));
};

/**
 * Sets the value referenced using property syntax.
 *
 * @param {String}
 *            key The data key to set on the Component. E.g.
 *            <code>cmp.set("v.key","value")</code>
 * @param {Object}
 *            value The value to set
 *
 * @public
 * @platform
 */
Component.prototype.set = function(key, value, ignoreChanges) {
    key = $A.expressionService.normalize(key).replace(/^v\.body\b/g,"v.body."+this.priv.globalId);
    $A.assert(key.indexOf('.') > -1, "Unable to set value for key '" + key + "'. No value provider was specified. Did you mean 'v." + key + "'?");

    var path = key.split('.');
    var root = path.shift();
    var valueProvider = this.priv.getValueProvider(root, this);

    if(!valueProvider){
        $A.assert(false, "Unable to set value for key '" + key + "'. No value provider was found for '" + root + "'.");
    }
    if(!valueProvider.set){
        $A.assert(false, "Unable to set value for key '" + key + "'. Value provider does not implement 'set(key, value)'.");
    }
    var subPath=path.join('.');

    var oldValue=valueProvider.get(subPath,this);

    var returnValue=valueProvider.set(subPath, value, this);
    if($A.util.isExpression(value)){
        value.addChangeHandler(this,key);
        if(!ignoreChanges){
            value=value.evaluate();
        }
    }

    var changed=$A.util.isArray(value)||$A.util.isObject(value)||oldValue!==value;
    if(changed&&!ignoreChanges) {
        $A.renderingService.addDirtyValue(key, this);
        var index=path.length>1?path[path.length-1]:undefined;
        this.priv.fireChangeEvent(this,key,oldValue,value,index);
    }
    return returnValue;
};

/**
 * Sets a shadow attribute. Used for programmatically adding values after FCVs.
 * THIS IS NOT FOR YOU. DO NOT USE.
 *
 * @param {String}
 *            key The data key to set on the Component.
 * @private
 */
Component.prototype.setShadowAttribute = function(key,value) {
    if(key.indexOf('v.')===0) {
        var oldValue = this.get(key);
        var attribute = key.substr(2);
        this.priv.attributes.setShadowValue(attribute, value);
        var newValue=this.get(key);
        if(oldValue!==newValue) {
            $A.renderingService.addDirtyValue(key, this);
            this.priv.fireChangeEvent(this, key, oldValue, newValue);
        }
    }
};


Component.prototype.markDirty=function(reason){
    $A.renderingService.addDirtyValue(reason||"Component.markDirty()",this);
};

Component.prototype.markClean=function(value) {
    $A.renderingService.removeDirtyValue(value, this);
};

Component.prototype.fireChangeEvent=function(key,oldValue,newValue,index){
    // JBUCH: HALO: FIXME: CAT 5: WE SEEM TO BE LEAKING VALUE CHANGE EVENTHANDLERS;
    // FIND THE REAL REASON AND REMOVE THE EVENT HANDLER, AS WELL AS THIS SHORTSTOP NPE FIX
    if(this.priv){
        this.priv.fireChangeEvent(this,key,oldValue,newValue,index);
    }
};

/**
 * Sets a flag to tell the rendering service whether or not to destroy this component when it is removed
 * from it's rendering facet. Set to false if you plan to keep a reference to a component after it has
 * been unrendered or removed from a parent facet. Default is true: destroy once orphaned.
 * @param {Boolean} destroy The flag to specify whether or not to destroy this component automatically.
 *
 * @public
 * @platform
 */
Component.prototype.autoDestroy = function(destroy) {
    if(!$A.util.isUndefinedOrNull(destroy)) {
        this.priv.autoDestroy = !!destroy;
    }else{
        return this.priv.autoDestroy;
    }
};

/**
 * Gets the concrete implementation of a component. If the component is
 * concrete, the method returns the component itself. For example, call this
 * method to get the concrete component of a super component.
 *
 * @public
 * @platform
 */
Component.prototype.getConcreteComponent = function() {
    var priv = this.priv;
    return priv.concreteComponentId ? $A.componentService.get(priv.concreteComponentId) : this;
};

/**
 * Returns true if the component is concrete, or false otherwise.
 *
 * @public
 * @platform
 */
Component.prototype.isConcrete = function() {
    return !this.priv.concreteComponentId;
};

/**
 * Returns the value provider.
 *
 * @return {Object} value provider
 * @public
 */
Component.prototype.getAttributeValueProvider = function() {
    return this.priv.attributeValueProvider||this;
};

/**
 * Returns the value provider of the component.
 *
 * @return {Object} component or value provider
 * @public
 */
Component.prototype.getComponentValueProvider = function() {
    var valueProvider = this.priv.attributeValueProvider||this.priv.facetValueProvider;
    if (!valueProvider) {
        return undefined;
    }

    return valueProvider.auraType !== Component.prototype.auraType && $A.util.isFunction(valueProvider.getComponent) ?
        valueProvider.getComponent() : valueProvider;
};

/**
 * Adds Custom ValueProviders to a component
 * @param {String} key string by which to identify the valueProvider. Used in expressions in markup, etc.
 * @param {Object} valueProvider the object to request data from. Must implement .get(expression), can implement .set(key,value).
 * @public
 * @platform
 */
Component.prototype.addValueProvider=function(key,valueProvider){
    $A.assert($A.util.isString(key),"Component.addValueProvider(): 'key' must be a valid String.");
    $A.assert(",v,m,c,e,this,globalid,def,super,null,".indexOf(","+key.toLowerCase()+",")==-1,"Component.addValueProvider(): '"+key+"' is a reserved valueProvider.");
    $A.assert(!$A.util.isUndefinedOrNull(valueProvider),"Component.addValueProvider(): 'valueProvider' is required.");
    this.priv.valueProviders[key]=valueProvider;
};

/**
 * Removes a custom value provider from a component
 * @param {String} key string by which to identify the valueProvider to remove.
 * @public
 */
Component.prototype.removeValueProvider=function(key){
    $A.assert($A.util.isString(key),"Component.removeValueProvider(): 'key' must be a valid String.");
    $A.assert(",v,m,c,e,this,globalid,def,super,null,".indexOf(","+key.toLowerCase()+",")==-1,"Component.removeValueProvider(): '"+key+"' is a reserved valueProvider and can not be removed.");
    delete this.priv.valueProviders[key];
};

/**
 * Gets the event dispatcher.
 *
 * @public
 */
Component.prototype.getEventDispatcher = function() {
    return this.priv.getEventDispatcher();
};

/**
 * Returns the model for this instance, if one exists. Shorthand :
 * <code>get("m")</code>
 *
 * @public
 */
Component.prototype.getModel = function() {
    return this.priv.model;
};

/**
 * Return a new Event instance of the named component event. Shorthand:
 * <code>get("e.foo")</code>, where e is the name of the event.
 *
 * @param {String}
 *            name The name of the Event.
 * @public
 * @platform
 */
Component.prototype.getEvent = function(name) {
    var eventDef = this.getDef().getEventDef(name);
    if(!eventDef){
        return null;
    }
    if (!$A.clientService.allowAccess(eventDef,this)) {
        // #if {"modes" : ["DEVELOPMENT"]}
        $A.warning("Access Check Failed! Component.getEvent():'" + name + "' of component '" + this + "' is not visible to '" + $A.getContext().getCurrentAccess() + "'.");
        // #end

        // JBUCH: TODO: ACCESS CHECKS: TEMPORARY REPRIEVE
        // return null;
    }
    return new Event({
        "name" : name,
        "eventDef" : eventDef,
        "component" : this.getConcreteComponent()
    });
};

/**
 * Get an event by descriptor qualified name.
 *
 * This is only used by action for firing of component events. It is a bit of a
 * hack (reversing the map).
 *
 * @param {String}
 *            descriptor a descriptor qualified name.
 * @return {String} null, or the component event.
 * @protected
 */
Component.prototype.getEventByDescriptor = function(descriptor) {
    var name = this.getDef().getEventNameByDescriptor(descriptor);
    if (name === null) {
        return null;
    }
    return this.getEvent(name);
};

/**
 * @private
 */
Component.prototype.fire = function(name) {
    var dispatcher=this.priv.getEventDispatcher();
    if(!dispatcher){
        return;
    }
    var eventDef = this.priv.componentDef.getEventDef(name,true);
    var eventQName = eventDef.getDescriptor().getQualifiedName();
    var handlers = dispatcher[eventQName];
    if(handlers){
        var event = new Event({
            "eventDef" : eventDef,
            "eventDispatcher" : dispatcher
        });
        event.setParams({
            value : this
        });
        event.fire();
    }
};

/**
 * Looks up the specified value and checks if it is currently dirty.
 *
 * @returns true if the value is dirty, and false if it is clean or does not
 *          exist.
 * @public
 * @deprecated TEMPORARY WORKAROUND
 */
Component.prototype.isDirty = function(expression) {
    if(!expression){
        return $A.renderingService.hasDirtyValue(this);
    }
    return $A.renderingService.isDirtyValue(expression, this);
};

/**
 * Returns true if the component has not been destroyed.
 *
 * @public
 * @platform
 */
Component.prototype.isValid = function(expression) {
    if (!expression) {
        return !this._scheduledForAsyncDestruction && !this._destroying && this.priv !== undefined
            && (!this.priv.attributeValueProvider || !this.priv.attributeValueProvider.isValid
                || this.priv.attributeValueProvider.isValid());
    }
    return this.callOnExpression(Component.prototype.isValidCallback, expression);
};

/**
 * Looks up the specified value and sets it to valid or invalid.
 *
 * @public
 * @deprecated TEMPORARY WORKAROUND
 */
Component.prototype.setValid = function(expression, valid) {
    if(valid != this.callOnExpression(Component.prototype.isValidCallback, expression)) {
        $A.renderingService.addDirtyValue(expression, this);
    }
    this.callOnExpression(Component.prototype.setValidCallback, expression, valid);
};

/**
 * Looks up the specified value and adds errors to it.
 *
 * @public
 * @deprecated TEMPORARY WORKAROUND
 */
Component.prototype.addErrors = function(expression, errors) {
    if($A.util.isUndefinedOrNull(errors)){
        return;
    }
    $A.renderingService.addDirtyValue(expression, this);
    this.callOnExpression(Component.prototype.addErrorsCallback, expression, errors);
    $A.renderingService.addDirtyValue(expression, this);
    this.priv.fireChangeEvent(this,expression,undefined,undefined,undefined);
};

/**
 * Looks up the specified value and clears errors on it.
 *
 * @public
 * @deprecated TEMPORARY WORKAROUND
 */
Component.prototype.clearErrors = function(expression) {
    this.setValid(expression,true);
    $A.renderingService.addDirtyValue(expression, this);
    this.priv.fireChangeEvent(this,expression,undefined,undefined,undefined);
};

/**
 * Looks up the specified value and gets errors on it.
 *
 * @public
 * @deprecated TEMPORARY WORKAROUND
 */
Component.prototype.getErrors = function(expression) {
    return this.callOnExpression(Component.prototype.getErrorsCallback, expression);
};

Component.prototype.callOnExpression = function(callback, expression, option) {
    expression = $A.expressionService.normalize(expression);

    var path = expression.split('.');
    var root = path.shift();
    var valueProvider = this.priv.getValueProvider(root, this);

    $A.assert(valueProvider, "Unable to get value for expression '" + expression + "'. No value provider was found for '" + root + "'.");

    var subPath = path.join('.');
    return callback.call(this, valueProvider, root, subPath, option);
};

Component.prototype.isValidCallback = function(valueProvider, root, subPath) {
    $A.assert(valueProvider.isValid, "Value provider '" + root + "' doesn't implement isValid().");
    return valueProvider.isValid(subPath);
};

Component.prototype.setValidCallback = function(valueProvider, root, path, subPath) {
    $A.assert(valueProvider.setValid, "Value provider '" + root + "' doesn't implement setValid().");
    valueProvider.setValid(path, subPath);
};

Component.prototype.addErrorsCallback = function(valueProvider, root, subPath, errors) {
    $A.assert(valueProvider.addErrors, "Value provider '" + root + "' doesn't implement addErrors().");
    valueProvider.addErrors(subPath, errors);
};

Component.prototype.getErrorsCallback = function(valueProvider, root, subPath) {
    $A.assert(valueProvider.getErrors, "Value provider '" + root + "' doesn't implement getErrors().");
    return valueProvider.getErrors(subPath);
};

/**
 * Returns a string representation of the component for logging.
 *
 * @public
 */
Component.prototype.toString = function() {
    if(!this._description){
        this._description=this.getDef() + ' {' + this.priv.globalId + '}' + (this.getLocalId() ? ' {' + this.getLocalId() + '}' : '');
    }
    var attributesOutput = [];
    // Debug Info
    //#if {"excludeModes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
    var attributes = this.get("v");
    if(attributes){
        for(var key in attributes.values) {
            attributesOutput.push(" "+ key + " = \"" + attributes.values[key] +"\"");
        }
    }
    //#end
    return this._description + attributesOutput.join(",");
};

/**
 * Returns component serialized as Json string
 *
 * @private
 */
Component.prototype.toJSON = function() {
	return $A.util.json.encode(this.priv.output(this));
};

/**
 * Returns an object whose keys are the lower-case names of Aura events for
 * which this component currently has handlers.
 */
Component.prototype.getHandledEvents = function() {
    var ret = {};
    var concrete = this.getConcreteComponent();
    var eventDispatcher = concrete.getEventDispatcher();
    if (eventDispatcher) {
        for ( var name in eventDispatcher) {
            if (eventDispatcher.hasOwnProperty(name) && eventDispatcher[name].length) {
                ret[name.toLowerCase()] = true;
            }
        }
    }

    return ret;
};

/**
 * Check if we have an event handler attached.
 *
 * @param {String}
 *            eventName The event name associated with this component.
 */
Component.prototype.hasEventHandler = function(eventName) {
    if (eventName) {
        var handledEvents = this.getHandledEvents();
        return handledEvents[eventName.toLowerCase()];
    }
    return false;
};

/**
 * Returns an array of this component's facets, i.e., attributes of type
 * <code>aura://Aura.Component[]</code>
 */
Component.prototype.getFacets = function() {
    if (!this.getFacets.cachedFacetNames) {
        // grab the names of each of the facets from the ComponentDef
        var facetNames = [];
        var attributeDefs = this.getDef().getAttributeDefs();

        //JBUCH: HALO: TODO: UNNECESSARY PERF HIT WITH .each() USING NEW STACKFRAME ON *EVERY* COMPONENT THAT HAS ATTRIBUTES (MOST COMPONENTS)
        attributeDefs.each(function(attrDef) {
            if (attrDef.getTypeDefDescriptor() === "aura://Aura.Component[]") {
                facetNames.push(attrDef.getDescriptor().getName());
            }
        });

        // cache the names--they're not going to change
        this.getFacets.cachedFacetNames = facetNames;
    }

    // then grab each of the facets themselves
    var names = this.getFacets.cachedFacetNames;
    var facets = [];

    for (var i = 0, len = names.length; i < len; i++) {
        facets.push(this.get("v." + names[i]));
    }

    return facets;
};


/**
 * Returns true if this is a flavorable html element.
 */
Component.prototype.isFlavorable = function() {
	return this.priv.flavorable;
};

/**
 * Gets the flavor reference. This is either the flavor explicitly set on the
 * component instance (component def ref) or it is the default flavor of the
 * component, if a default (or app override) exists.
 *
 * @returns {String} The flavor, e.g., "default" or "xyz.flavors.default", etc...
 */
Component.prototype.getFlavor = function() {
	return this.priv.flavor || this.getDef().getDefaultFlavor();
};

/**
 * Render logic is output as part of the component class.
 * This method is used when no render method was specified, thus bubbling up
 * to the super to do the logic till it reaches aura:component which does the heavy lifting.
 */
Component.prototype.render = function() {
    var superComponent = this.getSuper();
    return superComponent ? superComponent["render"]() : undefined;
};

/**
 * Render logic is output as part of the component class.
 * This method is used when no rerender method was specified, thus bubbling up
 * to the super to do the logic till it reaches aura:component which does the heavy lifting.
 */
Component.prototype.rerender = function() {
    var superComponent = this.getSuper();
    return superComponent ? superComponent["rerender"]() : undefined;
};

/**
 * Render logic is output as part of the component class.
 * This method is used when no afterRender method was specified, thus bubbling up
 * to the super to do the logic till it reaches aura:component which does the heavy lifting.
 */
Component.prototype.afterRender = function() {
    var superComponent = this.getSuper();
    return superComponent ? superComponent["afterRender"]() : undefined;
};

/**
 * Render logic is output as part of the component class.
 * This method is used when no unrender method was specified, thus bubbling up
 * to the super to do the logic till it reaches aura:component which does the heavy lifting.
 */
Component.prototype.unrender = function() {
    var superComponent = this.getSuper();
    return superComponent ? superComponent["unrender"]() : undefined;
};

Aura.Component.ComponentPriv = ComponentPriv;
Aura.Component.Component = Component;

// #include aura.component.Component_export
