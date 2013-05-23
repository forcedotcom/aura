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
 * @class Constructs a new ComponentDef. A ComponentDef instance is created as part of Aura initialization.
 * @constructor
 * @protected
 */
function ComponentDef(config){
    var descriptor = new DefDescriptor(config["descriptor"]);
    this.descriptor = descriptor;
    if(config["hasServerDeps"]){
        this.hasRemoteDeps = true;
    }
    this.superDef = this.initSuperDef(config["superDef"]);
    this.styleDef = config["styleDef"] ? new StyleDef(config["styleDef"]) : undefined;

    this.controllerDef = config["controllerDef"] ? componentService.getControllerDef(config["controllerDef"]) : undefined;
    this.modelDef = config["modelDef"] ? componentService.getModelDef(config["modelDef"]) : undefined;

    this.interfaces = {};
    var intfConfig = config["interfaces"];
    if (intfConfig) {
        for(var m=0;m<intfConfig.length;m++){
            var intf = new DefDescriptor(intfConfig[m]);
            var intfName = intf.getNamespace() + ":" + intf.getName();
            this.interfaces[intfName] = true;
        }
    }

    var appHandlerDefs;
    var cmpHandlerDefs;
    var valueHandlerDefs;

    this.facets = config["facets"];
    this.isAbs = !!config["isAbstract"];
    if (config["layouts"]) {
        this.layouts = new LayoutsDef(config["layouts"]);
    }

    if (config["locationChangeEventDef"]) {
        this.locationChangeEventDef = eventService.getEventDef(config["locationChangeEventDef"]);
    }

    var registerEventDefs = {};
    this.registerEventDefs = registerEventDefs;
    var allEvents = [];
    this.allEvents = allEvents;
    var cred = config["registerEventDefs"];
    if (cred) {
        for (var i = 0; i < cred.length; i++) {
            var regConfig = cred[i];
            var name = regConfig["attributeName"];
            allEvents.push(name);
            registerEventDefs[name] = eventService.getEventDef(regConfig["eventDef"]);
        }
    }
    var handlerDefConfigs = config["handlerDefs"];
    if (handlerDefConfigs) {
        for (var j = 0; j < handlerDefConfigs.length; j++) {
            var handlerConfig = handlerDefConfigs[j];
            if(handlerConfig["eventDef"]){
                handlerConfig["eventDef"] = eventService.getEventDef(handlerConfig["eventDef"]);
                if(!appHandlerDefs){
                    appHandlerDefs = [];
                }
                appHandlerDefs.push(handlerConfig);
            }else if(handlerConfig["value"]){
                if(!valueHandlerDefs){
                    valueHandlerDefs = [];
                }
                valueHandlerDefs.push(handlerConfig);
            }else{
                if(!cmpHandlerDefs){
                    cmpHandlerDefs = [];
                }
                cmpHandlerDefs.push(handlerConfig);
            }

        }
    }
    var subDefs = config["subDefs"];
    if (subDefs) {
        for(var k=0;k<subDefs.length;k++){
            componentService.addDef(subDefs[k]);
        }
    }

    this.attributeDefs = new AttributeDefSet(this, config["attributeDefs"]);
    this.rendererDef = componentService.getRendererDef(descriptor, config["rendererDef"]);
    this.initRenderer();
    this.helperDef = componentService.getHelperDef(descriptor, config["helperDef"], this);

    var providerDef = config["providerDef"];
    if (providerDef) {
        this.providerDef = componentService.getProviderDef(descriptor, providerDef);
    }

    if (appHandlerDefs){
        this.appHandlerDefs = appHandlerDefs;
    }

    if (cmpHandlerDefs){
        this.cmpHandlerDefs = cmpHandlerDefs;
    }

    if (valueHandlerDefs){
        this.valueHandlerDefs = valueHandlerDefs;
    }
}

ComponentDef.prototype.auraType = "ComponentDef";

/**
 * Gets the Component Descriptor. Returns a DefDescriptor object.
 * A DefDescriptor object contains a prefix, namespace, and name.
 * @returns {DefDescriptor}
 */
ComponentDef.prototype.getDescriptor = function(){
    return this.descriptor;
};

/**
 * Checks whether the Component is abstract. Returns true if the component is abstract.
 * @returns {Boolean} True if component is abstract, or false otherwise.
 */
ComponentDef.prototype.isAbstract = function(){
    return this.isAbs;
};

/**
 * @return the ComponentDef for the immediate super type,
 * or null if none exists (should only be null for aura:component)
 */
ComponentDef.prototype.getSuperDef = function() {
    return this.superDef;
};

/**
 * Returns a HelperDef object.
 * @returns {HelperDef}
 */
ComponentDef.prototype.getHelperDef = function() {
    return this.helperDef;
};

/**
 * Gets the Helper instance
 * @returns {Helper}
 */
ComponentDef.prototype.getHelper = function() {
    var def = this.getHelperDef();
    if(def){
        return def.getFunctions();
    }
    return def;
};

/**
 * Returns a RendererDef object.
 * @returns {RendererDef}
 */
ComponentDef.prototype.getRendererDef = function(){
    return this.rendererDef;
};

/**
 * Checks whether the component has remote dependencies. Returns true if remote dependencies are found.
 * @returns {Boolean} True if remote dependencies exist, or false otherwise.
 */
ComponentDef.prototype.hasRemoteDependencies = function(){
    return this.hasRemoteDeps;
};

/**
 * @private
 */
ComponentDef.prototype.getRenderingDetails = function() {
    return this.renderingDetails;
};

/**
 * Returns a ProviderDef object associated with this ComponentDef.
 * @returns {ProviderDef}
 */
ComponentDef.prototype.getProviderDef = function(){
    return this.providerDef;
};

/**
 * Gets all the StyleDef objects, including inherited ones, for this ComponentDef.
 * @returns {StyleDef}
 */
ComponentDef.prototype.getAllStyleDefs = function() {
    return this.allStyleDefs;
};

/**
 * Gets the CSS class name to use for Components of this type.
 * Includes the class names from all StyleDefs, including inherited ones, associated with this ComponentDef.
 * If multiple class names are found, the return value is a space-separated list of class names.
 * This string can be applied directly to DOM elements rendered by Components of this type.
 * @returns {String} The style class name
 */
ComponentDef.prototype.getStyleClassName = function(){
    var className = this.styleClassName;
    if(className === undefined){
        className = "";
        var styleDefs = this.getAllStyleDefs();
        if(styleDefs){
            var styleDefLen = styleDefs.length;
            for ( var t = 0; t < styleDefLen; t++) {
                var styleDef = styleDefs[t];
                className = className + styleDef.getClassName() + " ";
                styleDef.apply();
            }

        }
        this.styleClassName = className;
    }
    return className;
};

/**
 * Gets the style definition. Returns a StyleDef object.
 * @returns {StyleDef}
 */
ComponentDef.prototype.getStyleDef = function(){
    return this.styleDef;
};

/**
 * Gets all the attribute definitions. Returns an AttributeDef object.
 * @returns {AttributeDef}
 */
ComponentDef.prototype.getAttributeDefs = function() {
    return this.attributeDefs;
};

/**
 * Gets the component facets. A facet is any attribute of type Aura.Component[].
 * @returns {Object}
 */
ComponentDef.prototype.getFacets = function() {
    return this.facets;
};

/**
 * Gets the controller definition. Returns a ControllerDef object.
 * @returns {ControllerDef}
 */
ComponentDef.prototype.getControllerDef = function() {
    return this.controllerDef;
};

/**
 * Gets the model definition. Returns a ModelDef object.
 * @returns {ModelDef}
 */
ComponentDef.prototype.getModelDef = function() {
    return this.modelDef;
};

/**
 * Gets the event definitions.
 * @param {String} The name of the event definition.
 * @returns{Object}
 */
ComponentDef.prototype.getEventDef = function(name, includeValueEvents) {
    var ret = this.registerEventDefs[name];
    if(!ret && includeValueEvents){
        ret = BaseValue.getEventDef(name);
    }
    return ret;
};

/**
 * Get an event name by descriptor qualified name.
 *
 * This is only used in the case of an action firing a component event.
 * It is a bit of a hack, but will give back the name of the event that
 * corresponds to the descriptor.
 *
 * @param {String} descriptor a descriptor qualified name.
 * @return {String} null, or the component fired event name.
 * @protected
 */
ComponentDef.prototype.getEventNameByDescriptor = function(descriptor) {
    for (var name in this.registerEventDefs) {
        if (this.registerEventDefs[name] && this.registerEventDefs[name].descriptor
                && this.registerEventDefs[name].descriptor.qualifiedName === descriptor) {
            return name;
        }
    }
    return null;
};

/**
 * Gets all events associated with the Component.
 * @returns {Object}
 */
ComponentDef.prototype.getAllEvents = function() {
    return this.allEvents;
};

/**
 * Gets the application handler definitions.
 * @returns {Object}
 */
ComponentDef.prototype.getAppHandlerDefs = function(){
    return this.appHandlerDefs;
};

/**
 * Gets the component handler definitions.
 * @returns {Object}
 */
ComponentDef.prototype.getCmpHandlerDefs = function(){
    return this.cmpHandlerDefs;
};

/**
 * Gets the value of the handler definitions.
 * @returns {Object}
 */
ComponentDef.prototype.getValueHandlerDefs = function(){
    return this.valueHandlerDefs;
};

/**
 *Converts a ComponentDef to type String.
 *@returns {String}
 */
ComponentDef.prototype.toString = function(){
    return this.getDescriptor().getQualifiedName();
};

/**
 * Checks whether the Component is an instance of the given component name (or interface name).
 * @param {String} name The name of the component (or interface), with a format of <namespace>:<componentName> (e.g., ui:button).
 * @returns {Boolean} True if the Component is an instance, or false otherwise.
 */
ComponentDef.prototype.isInstanceOf = function(name){
    var thisName = this.descriptor.getNamespace() +":"+this.descriptor.getName();
    if(thisName === name || this.implementsDirectly(name)){
        return true;
    }
    if(this.superDef){
        return this.superDef.isInstanceOf(name);
    }
    return false;
};

ComponentDef.prototype.implementsDirectly = function(type){
    return !$A.util.isUndefined(this.interfaces[type]);
};

/**
 * Gets the location change event. Returns the qualified name of the event. E.g. "markup://aura:locationChange"
 */
ComponentDef.prototype.getLocationChangeEvent = function() {
    var evt = this.locationChangeEventDef;
    if (evt) {
        return evt.getDescriptor().getQualifiedName();
    }
    return "markup://aura:locationChange";
};

ComponentDef.prototype.getLayouts = function(){
    return this.layouts;
};

/**
 * @private
 */
ComponentDef.prototype.initSuperDef = function(config){
    if (config) {
    	$A.componentService.addDef(config);
    	return $A.componentService.getDef(config["descriptor"]);
    } else {
    	return null;
    }
};

/**
 * Setup the style defs and renderer details.
 * @private
 */
ComponentDef.prototype.initRenderer = function() {
    var rd = {
        distance: 0,
        rendererDef: this.rendererDef
    };
    if (this.styleDef) {
        this.allStyleDefs = [this.styleDef];
    }
    var s = this.superDef;
    if (s) {
        if (!this.rendererDef) {
            // no rendererdef, get the superdefs
            var superStuff = s.getRenderingDetails();
            rd.rendererDef = superStuff.rendererDef;
            rd.distance = superStuff.distance + 1;
        }
        var superStyles = s.getAllStyleDefs();
        if (superStyles) {
            if (this.allStyleDefs) {
                this.allStyleDefs = this.allStyleDefs.concat(superStyles);
            } else {
                this.allStyleDefs = superStyles;
            }
        }
    }
    this.renderingDetails = rd;
};
//#include aura.component.ComponentDef_export
