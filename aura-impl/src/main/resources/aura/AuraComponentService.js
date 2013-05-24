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
/**
 * @namespace The Aura Component Service, accessible using $A.componentService.  Creates and Manages Components.
 * @constructor
 */
var AuraComponentService = function(){
    //#include aura.AuraComponentService_private

    var componentService = {
        renderedBy: "auraRenderedBy",

        /**
         * Gets an instance of a component.
         * @param {String} globalId
         * 				The generated globally unique Id of the component that changes across pageloads.
         * @memberOf AuraComponentService
         * @public
         */
        get: function(globalId){
            var ret = priv.indexes.globalId[globalId];
            return ret;
        },

        /**
         * Gets the rendering component for the provided element recursively.
         * @param {Object} element
         * 				The element that is used to find the rendering component
         * @memberOf AuraComponentService
         * @private
         */
        getRenderingComponentForElement: function(element) {
            if ($A.util.isUndefinedOrNull(element)) { return null;}

            var ret;
            var that = $A.services.component;
            if ($A.util.hasDataAttribute(element, that.renderedBy)) {
                var id = $A.util.getDataAttribute(element, that.renderedBy);
                ret = that.get(id);
                $A.assert(!$A.util.isUndefinedOrNull(ret), "No component found for element with id : " + id);
            } else if(element.parentNode){
                ret = that.getRenderingComponentForElement(element.parentNode);
            }

            return ret;
        },

        /**
         * Gets the attribute provider for the provided element.
         * @param {Object} element
         * 				The element whose attribute provider is to be returned
         * @memberOf AuraComponentService
         * @private
         */
        getAttributeProviderForElement: function(element) {
            return this.getRenderingComponentForElement(element).getAttributes().getValueProvider();
        },

        /**
         * Create a new component array.
         * @private
         */
        newComponentArray : function(config, attributeValueProvider, localCreation, doForce){
            var ret = [];

            var that = $A.services.component;
            for(var i=0;i<config.length;i++){
                ret.push(that.newComponent(config[i], attributeValueProvider, localCreation, doForce));
            }

            return ret;
        },

        /**
         * Creates a new component on the client or server and initializes it. For example <code>$A.services.component.newComponent("ui:inputText")</code>
         * creates a <code>ui:inputText</code> component.
         * <p>See Also: <a href="#help?topic=dynamicCmp">Dynamically Creating Components</a></p>
         * @param {Object} config
         * 				Use config to pass in your component definition and attributes. Supports lazy or exclusive loading by passing in "load": "LAZY" or "load": "EXCLUSIVE"
         * @param {Object} attributeValueProvider
         * 				The value provider for the attributes
         * @memberOf AuraComponentService
         * @public
         */
        newComponent: function(config, attributeValueProvider, localCreation, doForce){
            aura.assert(config, "config is required in ComponentService.newComponent(config)");

            var that = $A.services.component;
            if ($A.util.isArray(config)){
                return that.newComponentArray(config, attributeValueProvider, localCreation, doForce);
            }

            var configObj = that.getComponentConfigs(config, attributeValueProvider);

            var def = configObj["definition"],
                desc = configObj["descriptor"],
                load;

            config = configObj["configuration"];

            if(doForce !== true && !config["globalId"]){
                if(def && !def.hasRemoteDependencies() ){
                    localCreation = true;
                    delete config["load"];
                }else if(!config["load"]){
                    load = "LAZY";
                }else{
                    load = config["load"];
                }
            }

            if(desc === "markup://aura:placeholder"){
                load = null;
            }

            if (load === "LAZY" || load === "EXCLUSIVE") {
                localCreation = true;
                var oldConfig = config;
                config = {
                    "componentDef": {
                        "descriptor": "markup://aura:placeholder"
                    },
                    "localId": oldConfig["localId"],

                    "attributes": {
                        "values": {
                            "refDescriptor": desc,
                            "attributes": oldConfig["attributes"] ? oldConfig["attributes"]["values"] : null,
                            "exclusive": (oldConfig["load"] === "EXCLUSIVE")
                        }
                    }
                };
            }

            var ret = new Component(config, localCreation);
            ret.fire("init");
            return ret;
        },

        /**
         * Async version of newComponent. Returns a component from newComponent if component def
         * is already known. Otherwise, we request component from server and call provided callback.
         *
         * @param config
         * @param [attributeValueProvider]
         * @param [localCreation]
         * @param [doForce]
         * @param callback
         * @return {*}
         */
        newAsyncComponent: function(config, attributeValueProvider, localCreation, doForce, callback){
            aura.assert(config, "config is required in ComponentService.newComponent(config)");

            var that = $A.services.component;
            if ($A.util.isArray(config)){
                return that.newComponentArray(config, attributeValueProvider, localCreation, doForce);
            }

            var configObj = that.getComponentConfigs(config, attributeValueProvider);

            var def = configObj["definition"],
                desc = configObj["descriptor"];

            config = configObj["configuration"];

            config["componentDef"] = {
                "descriptor": desc
            };

            if ( !def || (def && def.hasRemoteDependencies()) ) {
                this.requestComponent(config, callback);
            } else {
                return this.newComponent(config, attributeValueProvider, localCreation, doForce);
            }

        },

        /**
         * Request component from server.
         *
         * @param config
         * @param callback
         */
        requestComponent: function(config, callback) {

            var action = $A.get("c.aura://ComponentController.getComponent");

            action.setParams({
                "name" : config["componentDef"]["descriptor"],
                "attributes" : config["attributes"]
            });

            action.setCallback(this, function(a){
                var newComp;
                if(a.getState() === "ERROR"){
                    newComp = $A.newCmp("markup://aura:text");
                    newComp.getValue("v.value").setValue(a.getError()[0].message);
                }else{
                    newComp = $A.newCmp(a.getReturnValue());
                }

                if ( $A.util.isFunction(callback) ) {
                    callback.call(null, newComp);
                }
            });

            if (config.load === "EXCLUSIVE") {
                action.setExclusive();
            }

            action.runAfter(action);
        },

        /**
         * Provides processed component config, definition, and descriptor.
         *
         * @param config
         * @param attributeValueProvider
         * @return {{configuration: {}, definition: ComponentDef, descriptor: String}}
         */
        getComponentConfigs: function(config, attributeValueProvider) {

            var componentService = $A.services.component;
            if(config && $A.util.isString(config)){
                config = {"componentDef": config};
            }

            if (attributeValueProvider) {
                if(!config["attributes"]){
                    config["attributes"] = {};
                }

                config["attributes"]["valueProvider"] = attributeValueProvider;
            }

            var def;
            var desc;

            def = componentService.getDef(config["componentDef"], true);

            if(def){
                desc = def.getDescriptor().toString();
            }else{
                desc = config["componentDef"]["descriptor"]? config["componentDef"]["descriptor"] : config["componentDef"];
            }

            return {
                "configuration": config,
                "definition": def,
                "descriptor": desc
            };
        },

        /**
         * Indexes the component using its global Id, which is uniquely generated across pageloads.
         * @private
         */
        index: function(component){
            priv.indexes.globalId[component.getGlobalId()] = component;
        },

        /**
         * Gets the component definition from the registry.
         * @param {Object} config
         * @param {Object} noInit
         * @returns {ComponentDef}  The metadata of the component
         * @memberOf AuraComponentService
         * @public
         */
        getDef: function(config, noInit){
            return priv.registry.getDef(config, noInit);
        },

        /**
         * Gets the component's controller definition from the registry.
         * @private
         */
        getControllerDef : function(config){
            return priv.controllerDefRegistry.getDef(config);
        },

        /**
         * Gets the action definition from the registry.
         * @private
         */
        getActionDef : function(config){
            return priv.actionDefRegistry.getDef(config);
        },

        /**
         * Gets the model definition from the registry.
         * @private
         */       
        getModelDef : function(config){
            return priv.modelDefRegistry.getDef(config);
        },

        /**
         * Gets the provider definition from the registry. A provider enables an abstract component definition to be used directly in markup.
         * @private
         */
        getProviderDef : function(providerDefDescriptor, config){
            return priv.providerDefRegistry.getDef(providerDefDescriptor, config);
        },

        /**
         * Gets the renderer definition from the registry.
         * @private
         */
        getRendererDef : function(componentDefDescriptor, config){
            return priv.rendererDefRegistry.getDef(componentDefDescriptor, config);
        },

        /**
         * Gets the helper definition from the registry.
         * @private
         */
        getHelperDef : function(componentDefDescriptor, config, componentDef){
            return priv.helperDefRegistry.getDef(componentDefDescriptor, config, componentDef);
        },

        /**
         * Destroys the components.
         * @private
         */
        destroy: function(components){
            if (!aura.util.isArray(components)) {
                components = [components];
            }

            for (var i = 0; i < components.length; i++) {
                var cmp = components[i];
                if (cmp && cmp.destroy) {
                    cmp.destroy();
                }
            }
        },

        /**
         * Removes the index of the component.
         * @private
         */
        deIndex: function(component){
            delete priv.indexes.globalId[component.getGlobalId()];
        },

        /**
         * Returns the descriptors of all components known to the registry.
         * @memberOf AuraComponentService
         * @private
         */
        getRegisteredComponentDescriptors : function(){
            var ret = [];

            var componentDefs = priv.registry.componentDefs;
            for (var name in componentDefs) {
                ret.push(name);
            }

            // Union in any locally cached component defs
            var catalog = priv.registry.getLocalCacheCatalog();
            for (name in catalog) {
                if (!componentDefs[name]) {
                    ret.push(name);
                }
            }

            return ret;
        }

        //#if {"excludeModes" : ["PRODUCTION"]}
        ,priv : priv,
        /**
         * @memberOf AuraComponentService
         * @private
         */
        getIndex: function(){
            var ret = "";
            var index = priv.indexes.globalId;
            for (var globalId in index) {
                if(globalId.indexOf(":1") > -1){
                    var cmp = index[globalId];
                    var par = "";
                    var vp = cmp.getAttributes().getComponentValueProvider();
                    if (vp) {
                        par = vp.getGlobalId() + " : " + vp.getDef().toString();
                    }
                    ret = ret + globalId + " : ";
                    ret = ret + cmp.getDef().toString();
                    ret = ret + " [ " + par + " ] ";
                    ret = ret + "\n";
                }
            }
            return ret;
        }

        //#end
    };

    componentService.getValue = componentService.get;

    //#include aura.AuraComponentService_export

    return componentService;
};
