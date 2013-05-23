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
var ComponentPriv = (function(){ // Scoping priv

    var nextClientCreatedComponentId = 0;

    var ComponentPriv = function ComponentPriv(config, cmp, localCreation){
        cmp.priv = this;

        // setup some basic things
        this.concreteComponentId = config["concreteComponentId"];
        this.rendered = false;
        this.inUnrender = false;
        this.localId = config["localId"];

        // create the globally unique id for this component
        this.setupGlobalId(config["globalId"], localCreation);

        // get any partial configuration that was serialized by the server
        var partialConfig = $A.getContext().getComponentConfig(this.globalId);
        if (partialConfig) {
            this.partialConfig = partialConfig;
        }

        // get server rendering if there was one
        if (config["rendering"]){
            this.rendering = config["rendering"];
        } else if (partialConfig && partialConfig["rendering"]){
            this.rendering = this.partialConfig["rendering"];
        }

        // add this component to the global index
        componentService.index(cmp);

        // sets this components definition, preferring the one in partialconfig if it exists
        this.setupComponentDef(config["componentDef"]);

        // for components inside of a foreach, sets up the value provider they will delegate all m/v/c values to
        this.setupDelegateValueProvider(config["delegateValueProvider"], localCreation);

        // join attributes from partial config and config, preferring partial when overlapping
        var configAttributes = config["attributes"];
        if (partialConfig && partialConfig["attributes"]){
            if (!config["attributes"]){
                configAttributes = partialConfig["attributes"];
            } else{
                configAttributes = {};
                var atCfg = config["attributes"];
                for(var key in atCfg){
                    configAttributes[key] = atCfg[key];
                }

                atCfg = partialConfig["attributes"];
                for(key in atCfg){
                    if(key !== "valueProvider"){
                        configAttributes[key] = atCfg[key];
                    }
                }

                atCfg = config["attributes"]["values"];
                for(key in atCfg){
                    if(!configAttributes["values"][key]){
                        configAttributes["values"][key] = atCfg[key];
                    }
                }
            }
        }

        // creates the attributeset with that weirdass mush of attributes
        this.setupAttributes(configAttributes, cmp, localCreation);

        // runs component provider and replaces this component with the provided one
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
        this.setupComponentEvents(configAttributes?configAttributes["events"]:null, configAttributes?configAttributes["values"]:null, cmp);

        // for application type events
        this.setupApplicationEventHandlers(cmp);

        // index this component with its value provider (if it has a localid)
        this.doIndex();

        // instantiate the renderer for this component
        this.setupRenderer(cmp);

        //starting watching all values for events
        this.setupValueEventHandlers(cmp);

        // clean up refs to partial config
        delete this.partialConfig;
    };

    ComponentPriv.prototype.nextGlobalId = function(localCreation){
        if (!localCreation) {
            var context = $A.getContext();
            var currentAction = context.getCurrentAction();

            var id;
            var suffix;
            if (currentAction){
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
    ComponentPriv.prototype.setupGlobalId = function(globalId, localCreation){
        if (!globalId || !localCreation) {
            globalId = this.nextGlobalId(localCreation);
        }

        var old = componentService.get(globalId);
        if (old) {
            aura.log("makeGlobalId collision detected.", globalId);
        }

        this.globalId = globalId;
    };

    ComponentPriv.prototype.getValueProvider = function(key, cmp){
        // Try the most commonly accessed non-map based provider keys first
        if (key === "v") {
            return !this.delegateValueProvider ? this.attributes : undefined;
        } else if (key === "m") {
            return !this.delegateValueProvider ? this.model : undefined;
        } else {
            // Try map based providers followed by the rarely accessed keys (globalId, def, ...)
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
    ComponentPriv.prototype.setupValueProviders = function(config, cmp){
        if (!this.delegateValueProvider) {
            var actionProvider = this.createActionValueProvider(cmp);
            if (actionProvider) {
                this.getValueProviders()["c"] = actionProvider;
            }
        }

        var extraValueProviders = config;
        for (var key in extraValueProviders) {
            var value = extraValueProviders[key];
            if (key !== "m" && key !== "v" && key !== "c") {
                this.getValueProviders()[key] = valueFactory.create(value);
            }
        }
    };

    ComponentPriv.prototype.getValueProviders = function(){
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
                getValue : function(key){
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

                get : function(key){
                    return $A.expressionService.get(this, key);
                },

                setValue : function(key, value){
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
    ComponentPriv.prototype.setupComponentDef = function(config){
        var componentDef;
        if(this.partialConfig){
            var fromServer = this.partialConfig["componentDef"];
            if(fromServer){
        		componentService.addDef(fromServer);
                componentDef = componentService.getDef(fromServer["descriptor"]);
            }
        }else {
            componentDef = componentService.getDef(config["descriptor"] || config);
        }
        
        aura.assert(componentDef, "componentDef is required");
        this.componentDef = componentDef;
    };

    ComponentPriv.prototype.setupDelegateValueProvider = function(config, localCreation){
        if (config) {
            if(config["globalId"]){
                this.delegateValueProvider = componentService.get(config["globalId"]);
            }else{
                this.delegateValueProvider = config;
            }
            if (!this.delegateValueProvider) {
                this.delegateValueProvider = componentService.newComponent(config, null, localCreation, true);
            }
        }
    };

    ComponentPriv.prototype.setupAttributes = function(config, cmp, localCreation){
        var configAttributes = config || {};
        this.attributes = this.componentDef.getAttributeDefs().createInstances(configAttributes, cmp, true, localCreation);
    };

    ComponentPriv.prototype.validateAttributes = function(cmp, config){
        var attributeDefSet = this.componentDef.attributeDefs;
        if (attributeDefSet && attributeDefSet.each){
            var compPriv = this;
            if (compPriv.attributes && compPriv.attributes.getValue && attributeDefSet.each){
                attributeDefSet.each(function(attrDef) {
                    if (attrDef.isRequired && attrDef.isRequired()){
                        var name = attrDef.getDescriptor().getQualifiedName();
                        var zuper = cmp;
                        if (zuper){
                            if(!zuper.findValue(name)){
                                var descr = compPriv.componentDef.getDescriptor();
                                throw new Error ("Missing required attribute " + descr.getNamespace() + ":" + descr.getName() + "." + name);
                            }
                        }
                    }
                });
            }
        }
    };

    ComponentPriv.prototype.setupSuper = function(attributeValueProvider, configAttributes, localCreation){
        var superDef = this.componentDef.getSuperDef();
        if (superDef) {
            var attributeValues = {};
            var key;
            var valuesAlreadySet = {};

            if (configAttributes) {
                var values = configAttributes["values"];
                valuesAlreadySet = configAttributes["valuesAlreadySet"]?configAttributes["valuesAlreadySet"]:{};
                for (key in values) {
                    attributeValues[key] = new PropertyReferenceValue(["v", key]);
                }
            }

            var facets = this.componentDef.getFacets();
            var attributeDefs = this.componentDef.getAttributeDefs();
            if (facets) {
                for (var j = 0; j < facets.length; j++) {
                    var facet = facets[j];
                    if(!valuesAlreadySet[facet["descriptor"]]){
                        if(attributeDefs){
                             var attributeDef = attributeDefs.getDef(facet["descriptor"]);
                             if(attributeDef && attributeDef.getTypeDefDescriptor() !== 'aura://Aura.Component[]'){
                                 valuesAlreadySet[facet["descriptor"]] = true;
                             }
                        }
                        attributeValues[facet["descriptor"]] = facet["value"];
                    }
                }
            }

            var concreteComponentId = this.concreteComponentId;
            var superConfig = {};
            var superDefConfig = {};
            superDefConfig["descriptor"] = superDef.getDescriptor();
            superConfig["componentDef"] = superDefConfig;
            superConfig["concreteComponentId"] =  concreteComponentId ? concreteComponentId : this.globalId;

            var superAttributes = {};
            superAttributes["values"] = attributeValues;
            superAttributes["valuesAlreadySet"] = valuesAlreadySet;
            superAttributes["events"] = configAttributes ? configAttributes["events"] : {};
            superAttributes["valueProvider"] = attributeValueProvider;
            superConfig["attributes"] = superAttributes;

            this.superComponent = componentService.newComponent(superConfig, null, localCreation, true);
        }

        if (this.superComponent) {
            var valueProviders = this.getValueProviders();
            if (!valueProviders["super"]) {
                valueProviders["super"] = this.superComponent;
            }
        }
    };

    ComponentPriv.prototype.getActionCaller = function(valueProvider, actionExpression){
        if (aura.util.isString(actionExpression)){
            actionExpression = valueFactory.parsePropertyReference(actionExpression);
        }

        var actionRef = valueFactory.create(actionExpression);

        return function(event){
            if (valueProvider.isValid && !valueProvider.isValid()) {
                return;
            }

            var clientAction = expressionService.getValue(valueProvider, actionRef);
            if (clientAction) {
                if(clientAction.unwrap){
                    clientAction = clientAction.unwrap();
                }
                clientAction.run(event);
            } else {
                aura.assert(false, "no client action by name " + actionRef.getValue());
            }
        };
    };

    ComponentPriv.prototype.getEventDispatcher = function(cmp) {
        if (!this.eventDispatcher && cmp) {
            dispatcher = {};

            dispatcher.getValue = function(key){
                return cmp.getEvent(key);
            };

            dispatcher.get = function(key){
                return this.getValue(key);
            };

            this.eventDispatcher = dispatcher;
            this.getValueProviders()["e"] = dispatcher;
        }

        return this.eventDispatcher;
    };

    ComponentPriv.prototype.setupComponentEvents = function(config, values, cmp){
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

            if(values && !config){
                config = values;
            }

            if (config) {
                var valueProvider = this.attributes.getComponentValueProvider();
                for (var j = 0; j < keys.length; j++) {
                    var key = keys[j];
                    var eventValue = config[key];
                    if (eventValue) {
                        aura.assert(!this.concreteComponentId, "Event handler for " + key + " defined on super component " + this.globalId);
                        cmp.addHandler(key, valueProvider, eventValue["value"]);
                    }
                }
            }
        }

        var cmpHandlers = this.componentDef.getCmpHandlerDefs();
        if (cmpHandlers){
            for (var k = 0;k < cmpHandlers.length;k++){
                var cmpHandler = cmpHandlers[k];
                cmp.addHandler(cmpHandler["name"], cmp, cmpHandler["action"]);
            }
        }
    };

    function getHandler(cmp, actionExpression){
        var actionRef = valueFactory.create(actionExpression);
        return function(event){
            if (cmp.isValid && !cmp.isValid()) {
                return;
            }

            var clientAction = expressionService.get(cmp, actionRef);
            if (clientAction) {
                clientAction.run(event);
            } else {
                aura.assert(false, "no client action by name " + actionRef.getValue());
            }
        };
    }

    ComponentPriv.prototype.setupApplicationEventHandlers = function(cmp){
        //Handle application-level events
        var handlerDefs = this.componentDef.getAppHandlerDefs();
        if(handlerDefs){
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

    ComponentPriv.prototype.setupValueEventHandlers = function(cmp){
        //Handle value-level events
        var handlerDefs = this.componentDef.getValueHandlerDefs();
        if (handlerDefs){
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

    ComponentPriv.prototype.setupModel = function(config, cmp){
        var def = this.componentDef.getModelDef();
        if (def) {
            if(!config && this.partialConfig){
                config = this.partialConfig["model"];
            }

            this.model = def.newInstance(config || {}, cmp);
        }
    };

    ComponentPriv.prototype.doIndex = function(){
        var localId = this.localId;

        if (localId) {
            var attributeValueProvider = this.attributes.getComponentValueProvider();
            attributeValueProvider.index(localId, this.globalId);
        }
    };

    ComponentPriv.prototype.deIndex = function(){
        var localId = this.localId;

        if (localId) {
            var attributeValueProvider = this.attributes.getComponentValueProvider();
            attributeValueProvider.deIndex(localId, this.globalId);
        }
    };

    ComponentPriv.prototype.injectComponent = function(config, cmp, localCreation){
        var componentDef = this.componentDef;
        if ((componentDef.isAbstract() || componentDef.getProviderDef()) && !this.concreteComponentId){
            var providerDef = componentDef.getProviderDef();
            var realComponentDef;
            var attributes;
            if (providerDef) {
                // use it
                var provided = providerDef.provide(cmp, localCreation);
                realComponentDef = provided["componentDef"];
                attributes = provided["attributes"];
            } else {
                var partialConfig = this.partialConfig;
                aura.assert(partialConfig, "Abstract component without provider def cannot be instantiated : " + componentDef);
                realComponentDef = componentService.getDef(partialConfig["componentDef"]);
            }

            aura.assert(realComponentDef && realComponentDef.auraType === "ComponentDef" && !realComponentDef.isAbstract(), "No concrete implementation provided");

            this.componentDef = realComponentDef;
            if (attributes) {
                for (var k in attributes) {
                    var value = cmp.getAttributes().getValue(k, true);
                    if (!value) {
                        aura.assert(value, "No attribute named " + k + " found but was returned by provider");
                    }

                    value.setValue(attributes[k]);
                    value.commit();
                }
            }
        }
    };

    ComponentPriv.prototype.setupRenderer = function(cmp) {
        var rd = this.componentDef.getRenderingDetails();
        var renderable = cmp;
        for (var i = 0; i < rd.distance; i++) {
            renderable = renderable.getSuper();
        }

        var renderer = {
            def: rd.rendererDef,
            renderable: renderable
        };

        var zuper = renderable.getSuper();
        if (zuper) {
            var superRenderer = zuper.getRenderer();
            renderer["superRender"] = function(){
                return superRenderer.def.render(superRenderer.renderable);
            };

            renderer["superRerender"] = function(){
                superRenderer.def.rerender(superRenderer.renderable);
            };

            renderer["superAfterRender"] = function(){
                superRenderer.def.afterRender(superRenderer.renderable);
            };

            renderer["superUnrender"] = function(){
                superRenderer.def.unrender(superRenderer.renderable);
            };
        }
        this.renderer = renderer;
    };

    ComponentPriv.prototype.associateRenderedBy = function(cmp, element) {
        // attach a way to get back to the rendering component, the first time we call associate on an element
        var u = $A.util;
        if (!u.hasDataAttribute(element, $A.componentService.renderedBy)) {
            u.setDataAttribute(element, $A.componentService.renderedBy, cmp.getGlobalId());
        }
    };

    ComponentPriv.prototype.output = function(value, avp, serialized, depth) {
        if (serialized === undefined){
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
            } else if(valueType === "SimpleValue") {
              return this.output(value.unwrap(), avp, serialized, depth);
            }
          } else if (type === "Component") {
            return this.outputComponent(value, serialized, depth);
          }else if (type === "Action") {
            return "Action";
          }
        }
        return value?value.toString():value;
      };

      ComponentPriv.prototype.outputMapValue = function(value, avp, serialized, depth) {
        var ret = {};
        var that = this;
        value.each(function(key, val) {
          try {
            ret[key] = that.output(val ? val.unwrap() : null, avp, serialized, depth);
          } catch (e) {
            try {
              ret[key] = that.output(val.getValue(avp), avp, serialized, depth);
            } catch (e2) {
              ret[key] = that.output(val, avp, serialized, depth);
            }
          }
        });
        ret["__proto__"] = null;
        return ret;
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
        if (cmp) {
          var ret = {
            __proto__: null
          };
          ret._descriptor = cmp.getDef().getDescriptor().toString();
          ret.globalId = cmp.getGlobalId();
          ret.localId = cmp.getLocalId();
          ret.rendered = cmp.isRendered();
          ret.valid = cmp.isValid();
          ret.attributes = {};
          var attributes = cmp.getAttributes();
          var model = cmp.getModel();
          if(model){
            ret.model = this.output(model, attributes.getValueProvider(), serialized, depth);
          }
          ret.attributeValueProvider = this.output(attributes.getValueProvider(), attributes.getValueProvider(), serialized, depth);

          var zuper = cmp.getSuper();
          if(zuper && depth < 10){
              ret["super"] = this.output(zuper, cmp, serialized, depth);
          }else if(zuper){
              ret["super"] = {LAZY : zuper.getGlobalId()};
          }
          var attributeDefs = cmp.getDef().getAttributeDefs();
          var that = this;
          attributeDefs.each(function(attributeDef) {
            var key = attributeDef.getDescriptor().toString();
            try{
                var val = attributes.getRawValue(key);
            }catch(e){}
            ret.attributes[key] = that.output(val, attributes.getValueProvider(), serialized, depth);
          });


          ret.attributes["__proto__"] = null;

          return ret;
        }
        return null;
      };

    return ComponentPriv;

}());
