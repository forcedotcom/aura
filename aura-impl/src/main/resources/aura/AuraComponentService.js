/*
 * Copyright (C) 2012 salesforce.com, inc.
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
 * @namespace The Aura Component Service.  Creates and Manages Components.
 * @constructor
 */
var AuraComponentService = function(){
    //#include aura.AuraComponentService_private

    var componentService = {
        renderedBy: "auraRenderedBy",

        get: function(globalId){
            var ret = priv.indexes.globalId[globalId];
            return ret;
        },

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

        getAttributeProviderForElement: function(element) {
            return this.getRenderingComponentForElement(element).getAttributes().getValueProvider();
        },

        newComponentArray : function(config, attributeValueProvider, localCreation, doForce){
            var ret = [];

            var that = $A.services.component;
            for(var i=0;i<config.length;i++){
                ret.push(that.newComponent(config[i], attributeValueProvider, localCreation, doForce));
            }

            return ret;
        },

        newComponent: function(config, attributeValueProvider, localCreation, doForce){
            aura.assert(config, "config is required in ComponentService.newComponent(config)");

            var that = $A.services.component;
            if(config && $A.util.isString(config)){
                config = {"componentDef": config};
            }

            if ($A.util.isArray(config)){
                return that.newComponentArray(config, attributeValueProvider, localCreation, doForce);
            }

            if (attributeValueProvider) {
                if(!config["attributes"]){
                    config["attributes"] = {};
                }

                config["attributes"]["valueProvider"] = attributeValueProvider;
            }

            var def;
            var desc;
            var load;


            def = that.getDef(config["componentDef"], true);


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

            if(def){
                desc = def.getDescriptor().toString();
            }else{
                desc = config["componentDef"]["descriptor"]?config["componentDef"]["descriptor"]:config["componentDef"];
            }

            if(desc === "markup://aura:placeholder"){
                load = null;
            }

            if(load === "LAZY" || load === "EXCLUSIVE"){
                localCreation = true;
                var oldConfig = config;
                config = {
                         "componentDef": {
                             "descriptor": "markup://aura:placeholder"
                         },
                         "localId" : oldConfig["localId"],

                         "attributes": {
                             "values": {
                                 "refDescriptor" : desc,
                                 "attributes" : oldConfig["attributes"]?oldConfig["attributes"]["values"]:null,
                                 "exclusive" : (oldConfig["load"] === "EXCLUSIVE")
                             }
                         }
                     };
            }

            var ret = new Component(config, localCreation);
            ret.fire("init");
            return ret;
        },

        /**
         * @deprecated use newComponent
         */
        newLocalComponent: function(config, attributeValueProvider) {
            return $A.services.component.newComponent(config, attributeValueProvider);
        },

        index: function(component){
            priv.indexes.globalId[component.getGlobalId()] = component;
        },

        getDef: function(config, noInit){
            return priv.registry.getDef(config, noInit);
        },

        getControllerDef : function(config){
            return priv.controllerDefRegistry.getDef(config);
        },

        getModelDef : function(config){
            return priv.modelDefRegistry.getDef(config);
        },

        getProviderDef : function(providerDefDescriptor, config){
            return priv.providerDefRegistry.getDef(providerDefDescriptor, config);
        },

        getRendererDef : function(componentDefDescriptor, config){
            return priv.rendererDefRegistry.getDef(componentDefDescriptor, config);
        },

        getHelperDef : function(componentDefDescriptor, config, componentDef){
            return priv.helperDefRegistry.getDef(componentDefDescriptor, config, componentDef);
        },

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

        deIndex: function(component){
            delete priv.indexes.globalId[component.getGlobalId()];
        },

        /**
         * Return the descriptors of all components known to the registry.
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
