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
 * @description The Aura Component Service, accessible using $A.service.component.  Creates and Manages Components.
 * @constructor
 * @export
 */
function AuraComponentService () {
    // Def registries
    this.componentDefRegistry  = {};
    this.controllerDefRegistry = {};
    this.actionDefRegistry     = {};
    this.modelDefRegistry      = {};
    this.providerDefRegistry   = {};
    this.rendererDefRegistry   = {};
    this.helperDefRegistry     = {};
    this.libraryDefRegistry    = new Aura.Library.LibraryDefRegistry(); // To abstract lib logic
    this.componentDefStorage   = new Aura.Component.ComponentDefStorage();

    // holds ComponentDef configs to be created
    this.savedComponentConfigs = {};

    // references ControllerDef descriptor to its ComponentDef descriptor
    this.controllerDefRelationship = {};

    // references ActionDef descriptor to its ComponentDef descriptor
    this.actionDefRelationship = {};

    // Global registry for cmp instances
    this.indexes = { globalId : {} };

    this.dynamicNamespaces = []; // TODO: @dval: delete after createComponent refactor

    // Static attr names
    this.flavorable    = "auraFlavorable";
    this.renderedBy    = "auraRenderedBy";
    this["renderedBy"] = this.renderedBy;   // originally exposed using exp()

    // We delay the creation of the definition of a class till it's requested.
    // The function that creates the component class is a classConstructorExporter
    this.classConstructorExporter = {};

    // Collection of all the component classes we generate for
    // proper stack traces and proper use of prototypical inheritance
    this.classConstructors = {};
}

/**
 * Gets an instance of a component.
 * @param {String} globalId The generated globally unique Id of the component that changes across pageloads.
 *
 * @public
 * @deprecated use getComponent instead
 * @export
 */
AuraComponentService.prototype.get = function(globalId) {
    return this.indexes.globalId[globalId];
};

/**
 * Gets an instance of a component from either a GlobalId or a DOM element that was created via a Component Render.
 * @param {Object} identifier that is either a globalId or an element.
 *
 * @public
 * @platform
 * @export
 */
AuraComponentService.prototype.getComponent = function(identifier) {
    return this.get(identifier) || this.getRenderingComponentForElement(identifier);
};

/**
 * Gets descriptor from the config object (for normalization)
 * @param {Object} Controller descriptor config
 * @returns {String} Descriptor
 * @private
 */
AuraComponentService.prototype.getDescriptorFromConfig = function(descriptorConfig) {
    var descriptor = descriptorConfig && descriptorConfig["descriptor"];
    $A.assert(descriptor, "Descriptor for Config required for registration");
    return descriptor;
};

/**
 * Gets descriptor from the config object (for normalization)
 * @param {Object} Controller descriptor config
 * @returns {String} Descriptor
 * @private
 */
AuraComponentService.prototype.createDescriptorConfig = function(descriptor) {
    descriptor = typeof descriptor === 'string' ? descriptor : descriptor["descriptor"].toString();
    descriptor = descriptor.indexOf("://") < 0 ? "markup://" + descriptor : descriptor;
    return { "descriptor" : descriptor };
};


/**
 * Counts all the components currently created in the application.
 * @example
 * var count = $A.componentService.countComponents();
 *
 * @public
 * @platform
 * @export
 */
AuraComponentService.prototype.countComponents = function() {
    return Object.keys(this.indexes.globalId).length;
};

/**
 * Gets the rendering component for the provided element recursively.
 * @param {Object} element The element that is used to find the rendering component
 * @memberOf AuraComponentService
 * @public
 * @export
 */
AuraComponentService.prototype.getRenderingComponentForElement = function(element) {
    var ret;

    if ($A.util.isUndefinedOrNull(element)) {
        return null;
    }

    if ($A.util.hasDataAttribute(element, this.renderedBy)) {
        var id = $A.util.getDataAttribute(element, this.renderedBy);
        ret = this.get(id);

    } else if(element.parentNode) {
        ret = this.getRenderingComponentForElement(element.parentNode);
    }

    return ret;
};

/**
 * Gets the attribute provider for the provided element.
 * @param {Object} element The element whose attribute provider is to be returned
 * @memberOf AuraComponentService
 * @public
 * @export
 */
AuraComponentService.prototype.getAttributeProviderForElement = function(element) {
    return this.getRenderingComponentForElement(element).getAttributeValueProvider();
};

/**
 * Create a new component array.
 * @private
 */
AuraComponentService.prototype.newComponentArray = function(config, attributeValueProvider, localCreation, doForce){
    var ret = [];
    for (var i = 0; i < config.length; i++) {
        ret.push(this["newComponentDeprecated"](config[i], attributeValueProvider, localCreation, doForce));
    }
    return ret;
};

/**
 * Create a component from a type and a set of attributes.
 * It accepts the name of a type of component, a map of attributes,
 * and a callback to notify callers.
 *
 * @param {String} type The type of component to create, e.g. "ui:button".
 * @param {Object} attributes A map of attributes to send to the component. These take the same form as on the markup,
 * including events <code>{"press":component.getReference("c.handlePress")}</code>, and id <code>{"aura:id":"myComponentId"}</code>.
 * @param {Function} callback The method to call, to which it returns the newly created component.
 *
 * @example
 * $A.createComponent("aura:text",{value:'Hello World'}, function(auraTextComponent, status, statusMessagesList){
 *      // auraTextComponent is an instance of aura:text containing the value Hello World
 * });
 *
 * @public
 * @platform
 * @function
 * @export
 */
AuraComponentService.prototype.createComponent = function(type, attributes, callback){
    $A.assert($A.util.isString(type), "ComponentService.createComponent(): 'type' must be a valid String.");
    $A.assert(!attributes||$A.util.isObject(attributes),"ComponentService.createComponent(): 'attributes' must be a valid Object.");
    $A.assert($A.util.isFunction(callback),"ComponentService.createComponent(): 'callback' must be a Function pointer.");

    var configItem = {
        "componentDef" : type.toString(),
        "attributes"   : { "values" : attributes || null },
        "localId"      : (attributes && attributes["aura:id"]) || null,
        "flavor"       : (attributes && attributes["aura:flavor"]) || null
    };

    var configObj = this.getComponentConfigs(configItem);
    var def = configObj["definition"];
    var desc = configObj["descriptor"];
    configItem = configObj["configuration"];

    configItem["componentDef"] = { "descriptor": desc };

    if (!def && desc.indexOf("layout://") === 0) {
        // clear dynamic namespaces so that the server can send it back.
        this.dynamicNamespaces = [];
        // throw error instead of trying to requestComponent from server which is prohibited
        throw new Error("Missing definition: " + desc);
    }


    if (!def || def.hasRemoteDependencies()) {
        var action = this.requestComponent(null, callback, configItem, null, 0, true);
        // Abortable by default, but return the action so that customers can manipulate other settings.
        action.setAbortable(true);
        $A.enqueueAction(action);
        return action;
    } else {
		var component=null;
        var status="";
        var message="";
        try {
			if($A.clientService.allowAccess(def)) {
    	        component=this.createComponentInstance(configItem, true);
				status="SUCCESS";
        	}else{
            	// #if {"excludeModes" : ["PRODUCTION","AUTOTESTING"]}
	            $A.warning("Access Check Failed! AuraComponentService.createComponent(): '"+(def&&def.getDescriptor().getQualifiedName())+"' is not visible to '"+$A.getContext().getCurrentAccess()+"'.");
    	        // #end
           		status="ERROR";
				message="Unknown component '"+type+"'.";
			}
        } catch(e) {
            status = "ERROR";
            message = e.message;
        }
        callback(component, status, message);

    }
    return null;
};

/**
 * Create an array of components from a list of types and attributes.
 * It accepts a list of component names and attribute maps, and a callback
 * to notify callers.
 *
 * @param {Array} components The list of components to create, e.g. <code>["ui:button",{"press":component.getReference("c.handlePress")}]</code>
 * @param {Function} callback The method to call, to which it returns the newly created components.
 *
 * @example $A.createComponents([
 *      ["aura:text",{value:'Hello'}],
 *      ["ui:button",{label:'Button'}],
 *      ["aura:text",{value:'World'}]
 *  ],function(components,status,statusMessagesList){
 *      // Components is an array of 3 components
 *      // 0 - Text Component containing Hello
 *      // 1 - Button Component with label Button
 *      // 2 - Text component containing World
 *  });
 *
 * @public
 * @platform
 * @function
 * @export
 */
AuraComponentService.prototype.createComponents = function(components, callback) {
    $A.assert($A.util.isArray(components), "ComponentService.createComponents(): 'components' must be a valid Array.");
    $A.assert($A.util.isFunction(callback),"ComponentService.createComponents(): 'callback' must be a Function pointer.");

    var created=[];
    var overallStatus="SUCCESS";
    var statusList=[];
    var collected=0;

    function getCollector(index){
        return function(component, status, statusMessage) {
            created[index] = component;
            statusList[index] = {"status":status,"message":statusMessage};
            if(status==="ERROR"||(status==="INCOMPLETE"&&overallStatus!=="ERROR")) {
                overallStatus = status;
            }
            if (++collected === components.length) {
                callback(created,overallStatus,statusList);
            }
        };
    }

    for(var i=0;i<components.length;i++){
        this.createComponent(components[i][0],components[i][1],getCollector(i));
    }
};

/**
 * newComponent() calls newComponentDeprecated().
 * @param {Object} config Use config to pass in your component definition and attributes. Supports lazy or exclusive loading by passing in "load": "LAZY" or "load": "EXCLUSIVE"
 * @param {Object} attributeValueProvider The value provider for the attributes
 *
 * @public
 * @deprecated use createComponent instead
 * @export
 */
AuraComponentService.prototype.newComponent = function(config, attributeValueProvider, localCreation, doForce){
    return this["newComponentDeprecated"](config, attributeValueProvider, localCreation, doForce);
};


/**
 * Creates a new component on the client or server and initializes it. For example <code>$A.services.component.newComponentDeprecated("ui:inputText")</code>
 * creates a <code>ui:inputText</code> component.
 * @param {Object} config Use config to pass in your component definition and attributes. Supports lazy or exclusive loading by passing in "load": "LAZY" or "load": "EXCLUSIVE"
 * @param {Object} attributeValueProvider The value provider for the attributes
 *
 * @platform
 * @function
 * @deprecated use createComponent instead
 * @export
 */
AuraComponentService.prototype.newComponentDeprecated = function(config, attributeValueProvider, localCreation, doForce){
    $A.assert(config, "config is required in ComponentService.newComponentDeprecated(config)");

    if ($A.util.isArray(config)){
        return this.newComponentArray(config, attributeValueProvider, localCreation, doForce);
    }

    var configObj = this.getComponentConfigs(config, attributeValueProvider);

    var def = configObj["definition"],
        desc = configObj["descriptor"],
        load;

    config = configObj["configuration"];

    if (doForce !== true && !config["creationPath"]) {
        if (def && !def.hasRemoteDependencies()) {
            localCreation = true;
            delete config["load"];
        } else if (!config["load"]) {
            load = "LAZY";
        } else {
            load = config["load"];
        }
    }

    if (desc === "markup://aura:placeholder") {
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
                },
                "valueProvider":oldConfig["valueProvider"]
            }
        };
    } else {
        // var currentAccess = $A.getContext().getCurrentAccess();
        // Server should handle the case of an unknown def fetched "lazily"
        if(!$A.clientService.allowAccess(def) /* && currentAccess  */) {
            // #if {"excludeModes" : ["PRODUCTION","AUTOTESTING"]}
            $A.warning("Access Check Failed! AuraComponentService.newComponentDeprecated(): '" +
                (def&&def.getDescriptor().getQualifiedName()) + "' is not visible to '" +
                $A.getContext().getCurrentAccess() + "'.");
            // #end
            return null;
        }
    }

    return this.createComponentInstance(config, localCreation);
};

/**
 * Takes a config for a component, and creates an instance of the component using the component class of that component.
 * @param {Object} config Config is the same object you would pass to the constructor $A.Component to create a component. This method will use that information to further configure the component class that is created.
 * @param {Boolean} localCreation See documentation on Component.js constructor for documentation on the localCreation property.
 */
AuraComponentService.prototype.createComponentInstance = function(config, localCreation) {
    if (!config["skipCreationPath"]) {
        var context = $A.getContext();
        var creationPath;
        var action;
        // allows components to skip creation path checks if it's doing something weird
        // such as wrapping server created components in client created one
        action = context.getCurrentAction();
        if (action) {
            var newConfig;
            var currentPath = action.topPath();

            if (config["creationPath"]) {
                //
                // This is a server side config, so we need to sync ourselves with it.
                // The use case here is that the caller has gotten a returned array of
                // components, and is instantiating them independently. We can warn the
                // user when they do the wrong thing, but we'd actually like it to work
                // for most cases.
                //
                creationPath = action.forceCreationPath(config["creationPath"]);
                action.releaseCreationPath(creationPath);
            } else if (!context.containsComponentConfig(currentPath) && !!localCreation) {
                // skip creation path if the current top path is not in server returned
                // componentConfigs and localCreation
                // KRIS: Not necessary to set this to anything, since if it's null we don't use it.
                //creationPath = "client created";
            } else {
                creationPath = action.getCurrentPath();
            }

            if (creationPath) {
                newConfig = context.getComponentConfig(creationPath);
                if(newConfig) {
                    config["componentDef"] = newConfig["componentDef"];
                }
            }
        }
    }

    // See if there is a component specific class
    var def = config["componentDef"];
    var desc = def["descriptor"] || def;
    // Not sure why you would pass in the ComponentDef as the descriptor, but it's being done.
    if(desc.getDescriptor) {
        desc = desc.getDescriptor().getQualifiedName();
    } else if (desc.getQualifiedName) {
        desc = desc.getQualifiedName();
    } else if (desc.indexOf("://") === -1) {
        desc = "markup://" + desc;
    }

    // KRIS:
    // config["componentClass"] - Result of a getComponent() action
    // config["componentDef"]["componentClass"] - Result of sending component defs back from the server.
    // Always comes back as a function to execute, which defines the component classes.
    var componentClassDef = config["componentClass"] || config["componentDef"]["componentClass"];
    if(componentClassDef && !this.hasComponentClass(desc)) {
        componentClassDef = $A.util.json.decode(componentClassDef);
        componentClassDef();
    }

    // create ComponentDef from saved component config if component class has not yet been processed
    if (!this.hasComponentClass(desc)) {
        this.createFromSavedComponentConfigs(desc);
    }

    var classConstructor = this.getComponentClass(desc);
    if (!classConstructor) {
        throw new Error("Component class not found: " + desc);
    }
    return new classConstructor(config, localCreation);
};

/**
 * Use the specified constructor as the definition of the class descriptor.
 * We store them for execution later so we do not load definitions into memory unless they are utilized in getComponentClass.
 * @param {String} descriptor Uses the pattern of namespace:componentName.
 * @param {Function} classConstructor A function that when executed will define the class constructor for the specified class.
 * @export
 */
AuraComponentService.prototype.addComponentClass = function(descriptor, classConstructor){
    if (descriptor in this.classConstructorExporter || descriptor in this.classConstructors) {
        return;
    }

    this.classConstructorExporter[descriptor] = classConstructor;
};

/**
 * Get the class constructor for the specified component.
 * @param {String} descriptor use either the fqn markup://prefix:name or just prefix:name of the component to get a constructor for.
 * @returns Either the class that defines the component you are requesting, or null if not found.
 * @export
 */
AuraComponentService.prototype.getComponentClass = function(descriptor) {
    var storedConstructor = this.classConstructors[descriptor];

    if (!storedConstructor) {
        var exporter = this.classConstructorExporter[descriptor];
        if (exporter) {
            storedConstructor = exporter();
            this.classConstructors[descriptor] = storedConstructor;
            // No need to keep all these extra functions.
            delete this.classConstructorExporter[descriptor];
        }
    }

    return storedConstructor;
};

/**
 * Detects of the component class has been already defined without actually defining it.
 * hasComponentClass is more performant that running getComponentClass() since if the class
 * hasn't been built yet, we don't want it to be forcably built if not requested.
 *
 * @param {String} descriptor The qualified name of the component to check in the form prefix:componentname or protocol://prefix:componentname
 */
AuraComponentService.prototype.hasComponentClass = function(descriptor) {
    //descriptor = descriptor.replace(/^\w+:\/\//, "").replace(/\.|:/g, "$").replace(/-/g, "_");
    return !!(descriptor in this.classConstructorExporter || descriptor in this.classConstructors);
};

/**
 * Asynchronous version of newComponent(). Creates a new component and
 * calls your provided callback with the completed component regardless of any server-side dependencies.
 *
 * @param {Object} callbackScope The "this" context for the callback (null for global)
 * @param {Function} callback The callback to use once the component is successfully created
 * @param {Object} config The componentDef descriptor and attributes for the new component
 * @param {Object} attributeValueProvider The value provider for the attributes
 * @param {Boolean} [localCreation] Whether created client side (passed to Component)
 * @param {Boolean} [doForce] Whether to force client side creation
 * @param {Boolean} [forceServer] Whether to force server side creation
 *
 * @deprecated Use <code>$A.createComponent(String type, Object attributes, function callback)</code> instead.
 * @platform
 * @export
 */
AuraComponentService.prototype.newComponentAsync = function(callbackScope, callback, config, attributeValueProvider, localCreation, doForce, forceServer) {
    $A.assert(config, "ComponentService.newComponentAsync(): 'config' must be a valid Object.");
    $A.assert($A.util.isFunction(callback),"ComponentService.newComponentAsync(): 'callback' must be a Function pointer.");

    var isSingle=!$A.util.isArray(config);
    if(isSingle){
        config=[config];
    }
    var components=[];
    var overallStatus="SUCCESS";
    var statusList=[];
    var collected=0;

    function collectComponent(newComponent,status,statusMessage,index){
        components[index]=newComponent;
        statusList[index] = status;
        if(status==="ERROR"||(status==="INCOMPLETE"&&overallStatus!=="ERROR")) {
            overallStatus = status;
        }
        if(++collected===config.length){
            callback.call(callbackScope, isSingle?components[0]:components, overallStatus, statusList);
        }
    }

    for(var i=0;i<config.length;i++){
        var configItem=config[i];
        if(configItem){
            var configObj = this.getComponentConfigs(configItem, attributeValueProvider);
            var def = configObj["definition"],
                desc = configObj["descriptor"]["descriptor"] || configObj["descriptor"];
            var forceClient = false;

            configItem = configObj["configuration"];

            //
            // Short circuit our check for remote dependencies, since we've
            // been handed a partial config. This feels distinctly like a hack
            // and will hopefully disappear with ComponentCreationContexts.
            //
            if (configItem["creationPath"] && !forceServer) {
                forceClient = true;
            }

            configItem["componentDef"] = {
                "descriptor": desc
            };

            if (!def && desc.indexOf("layout://") === 0) {
                // clear dynamic namespaces so that the server can send it back.
                $A.componentService.dynamicNamespaces = [];
                // throw error instead of trying to requestComponent from server which is prohibited
                throw new Error("Missing definition: " + desc);
            }

            if ( !forceClient && (!def || (def && def.hasRemoteDependencies()) || forceServer )) {
                var action=this.requestComponent(callbackScope, collectComponent, configItem, attributeValueProvider, i);
                $A.enqueueAction(action);
            } else {
                if($A.clientService.allowAccess(def)) {
                    collectComponent(this["newComponentDeprecated"](configItem, attributeValueProvider, localCreation, doForce),"SUCCESS","",i);
                }else{
                    // #if {"excludeModes" : ["PRODUCTION","AUTOTESTING"]}
                    $A.warning("Access Check Failed! AuraComponentService.newComponentAsync(): '"+def.getDescriptor().getQualifiedName()+"' is not visible to '"+$A.getContext().getCurrentAccess()+"'.");
                    // #end
                    collectComponent(null,"ERROR","Unknown component '"+desc+"'.",i);
                }
            }
        }
    }
 };

/**
 * Request component from server.
 *
 * @param config
 * @param callback
 * @private
 */
AuraComponentService.prototype.requestComponent = function(callbackScope, callback, config, avp, index, returnNullOnError) {
    var action = $A.get("c.aura://ComponentController.getComponent");

    // JBUCH: HALO: TODO: WHERE IS THIS COMING FROM IN MIXED FORM? WHY DO WE ALLOW THIS?
    var attributes = config["attributes"] ?
            (config["attributes"]["values"] ? config["attributes"]["values"] : config["attributes"])
            : null;
    var atts = {};

    //
    // Note to self, these attributes are _not_ Aura Values. They are instead either
    // a literal string or a (generic object) map.
    //
    for (var key in attributes) {
        var value = attributes[key];
        if (value && value.hasOwnProperty("value")) {
            value = value["value"];
        }
        // if we have an avp, use it here
        var auraValue = valueFactory.create(value, null, avp);
        atts[key] = this.computeValue(auraValue, avp);
    }

    action.setCallback(this, function(a){
        // because this is an async callback, we need to make sure value provider is still valid
        if (avp && avp.isValid && !avp.isValid()) {
            return;
        }

        var newComp = null;
        var status= a.getState();
        var statusMessage='';
        if(status === "SUCCESS"){
            var returnedConfig = a.getReturnValue();
            if (!returnedConfig["attributes"]) {
                returnedConfig["attributes"] = {};
            }
            var merging = returnedConfig["attributes"];
            if (merging.hasOwnProperty("values")) {
                merging = merging["values"];
            }
            for (var mkey in attributes) {
                merging[mkey] = attributes[mkey];
            }
            returnedConfig["localId"] = config["localId"];
            returnedConfig["flavor"] = config["flavor"];

            try {
                newComp = $A.newCmpDeprecated(returnedConfig, avp, false);
            } catch(e) {
                status = "ERROR";
                statusMessage = e.message;
            }
        }else{
            var errors = a.getError();
            statusMessage=errors?errors[0].message:"Unknown Error.";
            if(!returnNullOnError) {
                newComp = $A.newCmpDeprecated("markup://aura:text");
                newComp.set("v.value", statusMessage);
            }
        }
        if ( $A.util.isFunction(callback) ) {
            callback.call(callbackScope, newComp, status, statusMessage, index);
        }
    });
    action.setParams({
        "name" : config["componentDef"]["descriptor"],
        "attributes" : atts
    });
    return action;
};

/**
 * Evaluates value object into their literal values. Typically used to pass configs to server.
 *
 * @param {Object} valueObj Value Object
 * @param {Object} valueProvider value provider
 *
 * @returns {*}
 * @export
 */
AuraComponentService.prototype.computeValue = function(valueObj, valueProvider) {
    return $A.util.isExpression(valueObj) ? valueObj.evaluate(valueProvider) : valueObj;
};

/**
 * Provides processed component config, definition, and descriptor.
 *
 * @param {Object} config
 * @param {Object} attributeValueProvider
 * @return {Object} {{configuration: {}, definition: ComponentDef, descriptor: String}}
 */
AuraComponentService.prototype.getComponentConfigs = function(config, attributeValueProvider) {
    var configuration, configAttributes, def, desc, configKey, attributeKey;

    // Given a string input, expand the config to be an object.
    if (config && $A.util.isString(config)) {
        config = { "componentDef" : config };
    }

    // When a valueProvider is specified, perform a shallow
    // clone of the config to preserve the original attributes.
    if (attributeValueProvider) {
        configuration = {};

        // Copy top-level keys to new config.
        for (configKey in config) {
            if (config.hasOwnProperty(configKey)) {
                configuration[configKey] = config[configKey];
            }
        }

        // Prepare new 'attributes' object.
        configAttributes = config['attributes'];
        configuration['attributes'] = {};

        // Copy attributes to prevent 'valueProvider' from mutating the original config.
        if (configAttributes) {
            for (attributeKey in configAttributes) {
                if (configAttributes.hasOwnProperty(attributeKey)) {
                    configuration['attributes'][attributeKey] = configAttributes[attributeKey];
                }
            }
        }

        // Safe to attach valueProvider reference onto new object.
        configuration['attributes']['valueProvider'] = attributeValueProvider;
    } else {
        configuration = config;
    }

    // Resolve the definition and descriptor.
    var componentDef = configuration["componentDef"];
    def = this.getDef(componentDef);

    if (!def && componentDef["attributeDefs"]) {
        // create definition if it doesn't current exist and component definition config provided
        def = this.createComponentDef(componentDef);
    }

    if (def) {
        desc = def.getDescriptor().toString();
    } else {
        desc = componentDef["descriptor"] ? componentDef["descriptor"] : componentDef;
    }

    return {
        "configuration" : configuration,
        "definition"    : def,
        "descriptor"    : desc
    };
};

/**
 * Indexes the component using its global Id, which is uniquely generated across pageloads.
 * @private
 */
AuraComponentService.prototype.index = function(component){
    this.indexes.globalId[component.globalId] = component;
};

/**
 * Checks to see if the definition for the component currently reside on the client and the context has access to it.
 * Could still exist on the server, we won't know that till we use a getDefinition call to try to retrieve it.
 *
 * This method is private, to use it, use $A.hasDefinition("prefix:name");
 *
 * @private
 * @param  {String}  descriptor Component descriptor in the pattern prefix:name or markup://prefix:name.
 * @return {Boolean}            True if the definition is present on the client.
 */
AuraComponentService.prototype.hasDefinition = function(descriptor) {
    return !!this.getDef(descriptor);
};


/**
 * Get the component definition. If it is not available will go to the server to retrieve it.
 *
 * This method is private, to utilize it, you should use $A.getDefinition("prefix:markup");
 *
 * @private
 *
 * @param  {String}   descriptor Component descriptor in the pattern prefix:name or markup://prefix:name.
 * @param  {Function} callback   Function that is passed the definition. The definition may be NULL if either the definition does not exist, or you do not have access to it.
 * @return undefined             Always use the callback to access the returned definition.
 */
AuraComponentService.prototype.getDefinition = function(descriptor, callback) {
    var def = this.getComponentDef(this.createDescriptorConfig(descriptor));

    if (def) {
        if(!$A.clientService.allowAccess(def)) {
            // #if {"excludeModes" : ["PRODUCTION","AUTOTESTING"]}
            $A.warning("Access Check Failed! ComponentService.getDef():'" + def.getDescriptor().toString() + "' is not visible to '" + ($A.getContext()&&$A.getContext().getCurrentAccess()) + "'.");
            // #end
            callback(null);
            return;
        }
        callback(def);
        return;
    }

    var action = $A.get("c.aura://ComponentController.getComponentDef");
    action.setParams({ "name": descriptor });

    action.setCallback(this, function (actionResponse) {
        if(actionResponse.getState() === 'SUCCESS') {
            // We use getDef at the moment so we do the access check.
            callback(this.getDef(descriptor));
        } else {
            callback(null);
        }

    });

    $A.enqueueAction(action);
};

/**
 * Gets the component definition from the registry for internal use, without access checks.
 *
 * @param {Object} descriptor The descriptor object.
 * @returns {ComponentDef} The metadata of the component
 *
 * @private
 */
AuraComponentService.prototype.getComponentDef = function(config) {
    var descriptor = this.getDescriptorFromConfig(config);
    var definition = this.componentDefRegistry[descriptor];

    if (!definition && this.savedComponentConfigs[descriptor]) {
        definition = this.createComponentDef(config);
    }

    return definition;
};

/**
 * Gets the component definition from the registry.
 *
 * @param {String|Object} descriptor The descriptor (<code>markup://ui:scroller</code>) or other component attributes that are provided during its initialization.
 * @returns {ComponentDef} The metadata of the component
 *
 * @public
 * @export
 * @deprecated use getDefinition(descriptor, callback) instead, it will go to the server if the definition is not present on the client.
 */
AuraComponentService.prototype.getDef = function(descriptor) {
    $A.assert(descriptor, "No ComponentDef descriptor specified");
    var def = this.getComponentDef(this.createDescriptorConfig(descriptor));

    if (def && !$A.clientService.allowAccess(def)) {
        // #if {"excludeModes" : ["PRODUCTION","AUTOTESTING"]}
        $A.warning("Access Check Failed! ComponentService.getDef():'" + def.getDescriptor().toString() + "' is not visible to '" + ($A.getContext()&&$A.getContext().getCurrentAccess()) + "'.");
        // #end

        return null;
    }
    return def;
};

/**
 * Checks for saved component config, creates if available, and deletes the config
 *
 * @param {String} descriptor component descriptor to check and create
 * @return {ComponentDef} component definition if config available
 * @private
 */
AuraComponentService.prototype.createFromSavedComponentConfigs = function(config) {
    var descriptor = this.getDescriptorFromConfig(config);
    var def = new ComponentDef(this.savedComponentConfigs[descriptor]);
    this.componentDefRegistry[descriptor] = def;
    delete this.savedComponentConfigs[descriptor];

    if (this.componentDefStorage.shouldStore(descriptor)) {
        this.componentDefStorage.storeDef(descriptor, config);
    }

    return def;
};

/**
 * Creates ComponentDef from provided config
 * @param {Object} config component definition config
 * @return {ComponentDef}
 * @private
 */
AuraComponentService.prototype.createComponentDef = function(config) {
    var descriptor = this.getDescriptorFromConfig(config);
    var definition = this.componentDefRegistry[descriptor];

    if (!definition) {
        if (this.savedComponentConfigs[descriptor]) {
            definition = this.createFromSavedComponentConfigs(config);
        } else {
            definition = new ComponentDef(config);
            this.componentDefRegistry[descriptor] = definition;
            if (this.componentDefStorage.shouldStore(descriptor)) {
                this.componentDefStorage.storeDef(descriptor, config);
            }
        }
    }

    return definition;
};

/**
 * Gets the component's controller definition from the registry.
 * @param {String} descriptor controller descriptor
 * @returns {ControllerDef} ControllerDef from registry
 * @private
 */
AuraComponentService.prototype.getControllerDef = function(descriptor) {
    return this.getDefFromRelationship(descriptor, this.controllerDefRelationship, this.controllerDefRegistry);
};

/**
 * ControllerDef and ActionDef are within ComponentDef. ComponentDef(s) are only created when used so
 * we need to create the component def if ControllerDef or ActionDef is requested directly
 *
 * @param {String} descriptor descriptor for definition
 * @param {Object} relationshipMap relationship map referencing ComponentDef descriptor
 * @param {Object} registry registry that hold definition type
 * @return {*} Def definition
 */
AuraComponentService.prototype.getDefFromRelationship = function(descriptor, relationshipMap, registry) {
    var def = registry[descriptor];
    if (!def && relationshipMap[descriptor]) {
        var componentDefDescriptor = relationshipMap[descriptor];
        if (this.savedComponentConfigs[componentDefDescriptor]) {
            def = this.getDef(componentDefDescriptor);
        }
    }
    return def;

};

/**
 * Creates and returns ControllerDef
 * @param {Object} config Configuration for ControllerDef
 * @returns {ControllerDef} ControllerDef from registry
 * @private
 */
AuraComponentService.prototype.createControllerDef = function(config) {
    var descriptor = this.getDescriptorFromConfig(config);
    var def = this.controllerDefRegistry[descriptor];
    if (!def) {
        def = new ControllerDef(config);
        delete this.controllerDefRelationship[descriptor];
        this.controllerDefRegistry[descriptor] = def;
    }
    return def;
};

/**
 * Gets the action definition from the registry.
 * @param {String} descriptor actionDef descriptor
 * @returns {ActionDef} ActionDef from registry
 * @private
 */
AuraComponentService.prototype.getActionDef = function(descriptor) {
    return this.getDefFromRelationship(descriptor, this.actionDefRelationship, this.actionDefRegistry);
};

/**
 * Creates and returns ActionDef
 * @param {Object} config Configuration for ActionDef
 * @returns {ActionDef} ControllerDef from registry
 * @private
 */
AuraComponentService.prototype.createActionDef = function(config) {
    var descriptor = this.getDescriptorFromConfig(config);
    var def = this.actionDefRegistry[descriptor];
    if (!def) {
        def = new ActionDef(config);
        delete this.actionDefRelationship[descriptor];
        this.actionDefRegistry[descriptor] = def;
    }

    return def;
};

/**
 * Gets the model definition from the registry.
 * @param {String} descriptor ModelDef descriptor
 * @returns {ModelDef} ModelDef from registry
 * @private
 */
AuraComponentService.prototype.getModelDef = function(descriptor) {
    return this.modelDefRegistry[descriptor];
};

/**
 * Creates and returns ModelDef
 * @param {Object} config Configuration for ModelDef
 * @returns {ModelDef} ModelDef from registry
 * @private
 */
AuraComponentService.prototype.createModelDef = function(config) {
    var descriptor = this.getDescriptorFromConfig(config);
    var def = this.modelDefRegistry[descriptor];
    if (!def) {
        def = new ModelDef(config);
        this.modelDefRegistry[descriptor] = def;
    }

    return def;
};

/**
 * Gets the provider definition from the registry. A provider enables an abstract component definition to be used directly in markup.
 * @param {String} descriptor component descriptor for ProviderDef
 * @returns {ProviderDef} ProviderDef of component
 * @private
 */
AuraComponentService.prototype.getProviderDef = function(descriptor) {
    return this.providerDefRegistry[descriptor];
};

/**
 * Creates and returns ProviderDef
 * @param {String} componentDescriptor descriptor of component
 * @param {Object} config Configuration for ProviderDef
 * @returns {ProviderDef} ProviderDef from registry
 * @private
 */
AuraComponentService.prototype.createProviderDef = function(componentDescriptor, config) {
     var def = this.providerDefRegistry[componentDescriptor];
    if (!def) {
        def = new ProviderDef(config);
        this.providerDefRegistry[componentDescriptor] = def;
    }
    return def;
};

/**
 * Gets the renderer definition from the registry.
 * @param {String} componentDefDescriptor component descriptor for ProviderDef
 * @returns {RendererDef} RendererDef of component
 * @private
 */
AuraComponentService.prototype.getRendererDef = function(componentDefDescriptor) {
    return this.rendererDefRegistry[componentDefDescriptor];
};

/**
 * Creates and returns RendererDef
 * @param {String} descriptor component descriptor for RendererDef
 * @private
 */
AuraComponentService.prototype.createRendererDef = function(descriptor) {
    var def = this.rendererDefRegistry[descriptor];
    if (!def) {
        def = new RendererDef(descriptor);
        this.rendererDefRegistry[descriptor] = def;
    }
    return def;
};

/**
 * Gets the helper definition from the registry.
 * @param {String} componentDescriptor component descriptor for ProviderDef
 * @returns {HelperDef} RendererDef of component
 * @private
 */
AuraComponentService.prototype.getHelperDef = function(componentDescriptor) {
    return this.helperDefRegistry[componentDescriptor];
};

/**
 * Creates and returns HelperDef
 * @param {ComponentDef} componentDef component definition
 * @param {Object} libraries library defs map
 * @returns {HelperDef}
 * @private
 */
AuraComponentService.prototype.createHelperDef = function(componentDef, libraries) {
    $A.assert(componentDef, "Component definition is required to create ProviderDef");
    var componentDescriptor = componentDef.getDescriptor().getQualifiedName();
    var def = this.helperDefRegistry[componentDescriptor];
    if (!def) {
        def = new HelperDef(componentDef, libraries);
        this.helperDefRegistry[componentDescriptor] = def;
    }

    return def;
};

/**
 * Gets library from the registry.
 * @param {String} descriptor library descriptor
 * @returns {Object} library from registry
 * @private
 */
AuraComponentService.prototype.getLibraryDef = function(descriptor) {
    return this.libraryDefRegistry.getDef(descriptor);
};

/**
 * Creates and returns library
 * @param {Object} config config for library
 * @returns {Object} library from registry
 * @private
 */
AuraComponentService.prototype.createLibraryDef = function(config) {
    return this.libraryDefRegistry.createDef(config);
};

/**
 * Destroys the components.
 * @private
 */
AuraComponentService.prototype.destroy = function(components){
    if (!$A.util.isArray(components)) {
        components = [components];
    }

    for (var i = 0; i < components.length; i++) {
        var cmp = components[i];
        if (cmp && cmp.destroy) {
            cmp.destroy();
        }
    }
};

/**
 * Removes the index of the component.
 * @private
 */
AuraComponentService.prototype.deIndex = function(globalId){
    delete this.indexes.globalId[globalId];
};

/**
 * Returns the descriptors of all components known to the registry.
 * @memberOf AuraComponentService
 * @public
 * @export
 */
AuraComponentService.prototype.getRegisteredComponentDescriptors = function(){
    var ret = [];
    var name;

    var componentDefs = this.componentDefRegistry;
    for (name in componentDefs) {
        ret.push(name);
    }

    return ret;
};

/**
 * Get the dynamic namespaces defined by 'layout://name'
 */
AuraComponentService.prototype.getDynamicNamespaces = function(){
    return this.dynamicNamespaces;
};

/**
 * @memberOf AuraComponentService
 * @export
 */
AuraComponentService.prototype.getIndex = function(){
    var ret = "";
    var index = this.indexes.globalId;
    for (var globalId in index) {
        if(globalId.indexOf(":1") > -1){
            var cmp = index[globalId];
            var par = "";
            var vp = cmp.getComponentValueProvider();
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
};

/**
 * @memberOf AuraComponentService
 * @private
 */
AuraComponentService.prototype.isConfigDescriptor = function(config) {
    /*
     * This check is to distinguish between a AttributeDefRef that came
     * from server which has a descriptor and value, and just a thing
     * that somebody on the client passed in. This totally breaks when
     * somebody pass a map that has a key in it called "descriptor",
     * like DefModel.java in the IDE TODO: better way to distinguish
     * real AttDefRefs from random junk
     */
    return config && config["descriptor"];
};

/**
 * Saves component config so it can be use later when component def is actually used.
 * Allows Aura to only create ComponentDef when needed
 *
 * Also save reference to componentDef for its ControllerDef and ActionDefs in cases
 * where direct access to the defs are needed
 *
 * @param {Object} config component definition config
 */
AuraComponentService.prototype.saveComponentConfig = function(config) {
    var componentDescriptor = this.getDescriptorFromConfig(config);
    if (this.savedComponentConfigs[componentDescriptor]) {
        return;
    }

    this.savedComponentConfigs[componentDescriptor] = config;

    var controllerDef = config["controllerDef"];
    if (controllerDef) {
        if (controllerDef["descriptor"]) {
            // save reference to component descriptor for ControllerDef
            this.controllerDefRelationship[controllerDef["descriptor"]] = componentDescriptor;
        }

        if (controllerDef["actionDefs"]) {
            var actionDefs = controllerDef["actionDefs"],
                len = actionDefs.length,
                i;

            for (i = 0; i < len; i++) {
                // loop and save reference to ComponentDef descriptor for each ActionDef
                var actionDef = actionDefs[i];
                if (actionDef["descriptor"]) {
                    this.actionDefRelationship[actionDef["descriptor"]] = componentDescriptor;
                }
            }
        }
    }
};

/**
 * Asynchronously retrieves all definitions in storage and adds to localStorage
 */
AuraComponentService.prototype.restoreDefsFromStorage = function () {
    this.componentDefStorage.restoreAllFromStorage();
};

/**
 * Clears storage
 * @return {Promise} Promise when storage is cleared
 */
AuraComponentService.prototype.clearDefsFromStorage = function () {
    return this.componentDefStorage.clearAllFromStorage();
};

AuraComponentService.prototype.createComponentPrivAsync = function (config, callback, forceClientCreation) {
    var descriptor = this.getDescriptorFromConfig(config["componentDef"]);
    var def = this.getComponentDef({ "descriptor" : descriptor });
    $A.assert(callback && typeof callback === 'function' , 'Callback');

    if (def && (!def.hasRemoteDependencies() || forceClientCreation)) {
        var classConstructor = this.getComponentClass(descriptor);
        if (!classConstructor) {
            throw new Error("Component class not found: " + descriptor);
        }

        callback(new classConstructor(config, forceClientCreation));
        return;
    }

    $A.enqueueAction(this.requestComponent(this, callback, config));
};

AuraComponentService.prototype.createComponentPriv = function (config) {
    var descriptor = this.getDescriptorFromConfig(config["componentDef"]);
    var def = this.getComponentDef({ "descriptor" : descriptor });
    $A.assert(def, 'Definition does not exist on the client');

    var classConstructor = this.getComponentClass(descriptor);
    return new classConstructor(config);
};

Aura.Services.AuraComponentService = AuraComponentService;
