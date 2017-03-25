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

/**
 * @class ComponentDef
 *
 * Constructs a new ComponentDef object, which is a component definition.
 * A ComponentDef instance is created as part of Aura initialization.
 *
 * @constructor
 * @protected
 * @export
 */
function InteropComponentDef(config) {
    this.interop = true;
    this.access = 'G';
    this.descriptor       = new DefDescriptor(config.descriptor);
    this.dependencies     = config.dependencies;
    this.definition       = config.definition;
    this.moduleName       = config.moduleName;
    this.interopClass     = config.interopClass;
    this.elementName      = this.moduleName.replace(':', '-');
    this.interopClassName = this.moduleName.replace(':', '$');
}

InteropComponentDef.prototype.hasInit = function() {
   
};

/**
 * Returns a DefDescriptor object.
 *
 * @returns {DefDescriptor} A DefDescriptor object contains a prefix, namespace,
 *          and name.
 * @export
 */
InteropComponentDef.prototype.getDescriptor = function() {
    return this.descriptor;
};

/**
 * Checks whether the Component is abstract. Returns true if the component is
 * abstract.
 *
 * @returns {Boolean} True if component is abstract, or false otherwise.
 * @export
 */
InteropComponentDef.prototype.isAbstract = function() {
    return this.isAbs;
};

/**
 * Returns the component definition for the immediate super type or null if none
 * exists (should only be null for aura:component).
 *
 * @return {ComponentDef} The ComponentDef for the immediate super type
 * @export
 */
InteropComponentDef.prototype.getSuperDef = function() {
    return this.superDef;
};

/**
 * Gets the Helper instance. This method is for backward compatibility,
 * the helper is now an integral part of the component class.
 *
 * @returns {Helper}
 * @export
 */
InteropComponentDef.prototype.getHelper = function() {
    var name = this.getDescriptor().getQualifiedName();
    var componentClass = $A.componentService.getComponentClass(name);
    return componentClass ? componentClass.prototype["helper"] : undefined;
};

/**
 * Returns RequiredVersionDef objects.
 *
 * @returns {RequiredVersionDefs}
 */
InteropComponentDef.prototype.getRequiredVersionDefs = function() {
    return this.requiredVersionDefs;
};

/**
 * Checks whether the component has remote dependencies. Returns true if remote
 * dependencies are found.
 *
 * @returns {Boolean} True if remote dependencies exist, or false otherwise.
 */
InteropComponentDef.prototype.hasRemoteDependencies = function() {
    return this.hasRemoteDeps;
};

/**
 * Gets all the StyleDef objects, including inherited ones, for this
 * ComponentDef.
 *
 * @returns {StyleDef}
 */
InteropComponentDef.prototype.getAllStyleDefs = function() {
    return this.allStyleDefs;
};

/**
 * Gets all the FlavoredStyleDef objects, including inherited ones, for this
 * ComponentDef.
 *
 * @returns {StyleDef}
 */
InteropComponentDef.prototype.getAllFlavoredStyleDefs = function() {
    return this.allFlavoredStyleDefs;
};

/**
 * Gets the CSS class name to use for Components of this type. Includes the
 * class names from all StyleDefs, including inherited ones, associated with
 * this ComponentDef. If multiple class names are found, the return value is a
 * space-separated list of class names. This string can be applied directly to
 * DOM elements rendered by Components of this type.
 *
 * @returns {String} The style class name
 * @export
 */
InteropComponentDef.prototype.getStyleClassName = function() {
    var className = this.styleClassName;
    if (!className) {
        className = "";
        var styleDefs = this.getAllStyleDefs();
        if (styleDefs) {
            var styleDefLen = styleDefs.length;
            for (var t = 0; t < styleDefLen; t++) {
                var styleDef = styleDefs[t];
                className = className + styleDef.getClassName() + " ";
                // Preloaded CSS should already be included in app.css
                if (!this.isCSSPreloaded) {
                    styleDef.apply();
                }
            }

        }
        this.styleClassName = className;

        // also load flavored styles if necessary
        if (!this.isCSSPreloaded) {
            var flavoredStyleDefs = this.getAllFlavoredStyleDefs();
            if (flavoredStyleDefs) {
                for (var i = 0, len = flavoredStyleDefs.length; i < len; i++) {
                    flavoredStyleDefs[i].apply();
                }
            }
        }
    }
    return className;
};

/**
 * Gets the style definition. Returns a StyleDef object.
 *
 * @returns {StyleDef}
 * @export
 */
InteropComponentDef.prototype.getStyleDef = function() {
    return this.styleDef;
};

/**
 * Gets the default flavor name, either from app-specified overrides or the
 * default specified on the component def.
 *
 * @returns {String} The flavor, e.g., "default" or "xyz.flavors.default", etc...
 * @export
 */
InteropComponentDef.prototype.getDefaultFlavor = function() {
    if ($A.util.isUndefined(this.flavorOverride)) {
        var override = null;

        var appDesc = $A.getContext().getApp();
        if (appDesc) {
            var appDef = $A.componentService.getDef(appDesc, true);
            if (appDef) { // might be null if there's a problem loading the app
                var defaults = appDef.getFlavorOverrides();
                if (defaults) {
                    override = defaults.getFlavor(this.descriptor);
                    if (override === "{!remove}") {
                        override = "";
                    }
                }
            }
        }

        this.flavorOverride = $A.util.isUndefinedOrNull(override) ? null : override;
    }

    return !$A.util.isUndefinedOrNull(this.flavorOverride) ? this.flavorOverride : this.getExplicitDefaultFlavor();
};

/**
 * Gets the default flavor explicitly set on the component def (or one of its supers).
 *
 * @returns {String}
 */
InteropComponentDef.prototype.getExplicitDefaultFlavor = function() {
    if (!$A.util.isUndefinedOrNull(this.defaultFlavor)) {
        return this.defaultFlavor;
    }
    if (this.superDef) {
        return this.superDef.getExplicitDefaultFlavor();
    }
    return null;
};

/**
 * Gets whether this def has at least one flavorable child element.
 *
 * @returns {Boolean}
 * @export
 */
InteropComponentDef.prototype.hasFlavorableChild = function() {
    return !!this.flavorableChild;
};

/**
 * Gets the set of default flavor overrides.
 *
 * @returns {FlavorsDef}
 * @export
 */
InteropComponentDef.prototype.getFlavorOverrides = function() {
    return this.flavorOverrides;
};

/**
 * Returns true if this or a super component is dynamically flavorable.
 * Performs a faster check than #getDynamicallyFlavorable.
 * @returns {Boolean}
 * @private
 */
InteropComponentDef.prototype.isDynamicallyFlavorable = function() {
    return this.dynamicallyFlavorable || (this.superDef && this.superDef.isDynamicallyFlavorable());
};

/**
 * Returns a list of component defs from the inheritance hierarchy that are
 * marked dynamically flavorable, including this one if applicable.
 *
 * To simply perform a boolean check, use #isDynamicallyFlavorable instead.
 * @returns {Array}
 * @private
 */
InteropComponentDef.prototype.getDynamicallyFlavorable = function() {
    var ret = [];
    if (this.dynamicallyFlavorable) {
        ret.push(this);
    }
    if (this.superDef) {
        ret = ret.concat(this.superDef.getDynamicallyFlavorable());
    }
    return ret;
};

/**
 * Gets all the attribute definitions. Returns an AttributeDef object.
 *
 * @returns {AttributeDefSet}
 * @export
 */
InteropComponentDef.prototype.getAttributeDefs = function() {
    return this.attributeDefs;
};

/**
 * Gets the component facets. A facet is any attribute of type Aura.Component[].
 *
 * @returns {Object}
 * @export
 */
InteropComponentDef.prototype.getFacets = function() {
    return this.facets;
};


/**
 * Gets Facet by facet descriptor
 * @param  {String} facetName The name of the facet. If the attribute name was param1, then facetName would be "param1". Does not handle v., so v.param1 would not work.
 * @return {Object}           The facet descriptor. Is current an object with two properties, descriptor which is the facetName you specified, and value which is the contents of the facet.
 */
InteropComponentDef.prototype.getFacet = function(facetName) {
    if(!this.facetMap) {
        var facetMap = {};
        if(this.facets) {
            var facets = this.facets;
            for(var c=0,length=facets.length;c<length;c++){
                facetMap[facets[c]["descriptor"]] = facets[c];
            }
        }
        this.facetMap = facetMap;
    }

    // hasOwnProperty to prevent us returning a function when someone names their facet "toString"
    return this.facetMap.hasOwnProperty(facetName) ? this.facetMap[facetName] : undefined;
};

/**
 * Gets the controller definition. Returns a ControllerDef object.
 *
 * @returns {ControllerDef}
 * @export
 */
InteropComponentDef.prototype.getControllerDef = function() {
    return this.controllerDef;
};

/**
 * Gets the model definition. Returns a ModelDef object.
 *
 * @returns {ModelDef}
 * @export
 */
InteropComponentDef.prototype.getModelDef = function() {
    return this.modelDef;
};

/**
 * Value Event Enum
 *
 * @returns {ModelDef}
 */
ComponentDef.valueEvents = {
    "change" : "aura:valueChange",
    "destroy": "aura:valueDestroy",
    "init"   : "aura:valueInit",
    "render" : "aura:valueRender"
};

/**
 * Returns the event definitions.
 *
 * @param {String}
 *            The name of the event definition.
 * @param {Boolean}
 *            includeValueEvents Set to true to include the value events.
 * @returns{Object}
 * @export
 */
InteropComponentDef.prototype.getEventDef = function(name, includeValueEvents) {
    var ret = this.registerEventDefs[name];
    if (!ret && includeValueEvents) {
        if (ComponentDef.valueEvents.hasOwnProperty(name)) {
            name = ComponentDef.valueEvents[name];
        }
        ret=$A.get("e").getDef(name);
    }
    return ret;
};

/**
 * Get an event name by descriptor qualified name.
 *
 * This is only used in the case of an action firing a component event. It is a
 * bit of a hack, but will give back the name of the event that corresponds to
 * the descriptor.
 *
 * @param {String}
 *            descriptor a descriptor qualified name.
 * @return {String} null, or the component fired event name.
 * @protected
 */
InteropComponentDef.prototype.getEventNameByDescriptor = function(descriptor) {
    for (var name in this.registerEventDefs) {
        if (this.registerEventDefs[name] && this.registerEventDefs[name].descriptor && this.registerEventDefs[name].descriptor.qualifiedName === descriptor) {
            return name;
        }
    }
    return null;
};

/**
 * Gets all events associated with the Component.
 *
 * @returns {Object}
 * @export
 */
InteropComponentDef.prototype.getAllEvents = function() {
    return this.allEvents;
};

/**
 * Gets the application handler definitions.
 *
 * @returns {Object}
 * @export
 */
InteropComponentDef.prototype.getAppHandlerDefs = function() {
    return this.appHandlerDefs;
};

/**
 * Gets the component handler definitions.
 *
 * @returns {Object}
 * @export
 */
InteropComponentDef.prototype.getCmpHandlerDefs = function() {
    return this.cmpHandlerDefs;
};

/**
 * Gets the value of the handler definitions.
 *
 * @returns {Object}
 */
InteropComponentDef.prototype.getValueHandlerDefs = function() {
    return this.valueHandlerDefs;
};

/**
 * Converts a ComponentDef object to type String.
 *
 * @returns {String}
 * @export
 */
InteropComponentDef.prototype.toString = function() {
    return this.getDescriptor().getQualifiedName();
};

/**
 * Checks whether the Component is an instance of the given component name (or
 * interface name).
 *
 * @param {String}
 *            name The name of the component (or interface), with a format of
 *            <code>namespace:componentName</code> (e.g.,
 *            <code>ui:button</code>).
 * @returns {Boolean} True if the Component is an instance, or false otherwise.
 * @export
 */
InteropComponentDef.prototype.isInstanceOf = function(name) {
    var thisName = this.descriptor.getNamespace() + ":" + this.descriptor.getName();
    return thisName === name;
};

/**
 * Primarily used by isInstanceOf().
 *
 * @private
 */
InteropComponentDef.prototype.implementsDirectly = function(type) {
    return !$A.util.isUndefined(this.interfaces[type]);
};

/**
 * Gets the location change event. Returns the qualified name of the event in
 * the format <code>markup://aura:locationChange</code>.
 * @export
 */
InteropComponentDef.prototype.getLocationChangeEvent = function() {
    var evt = this.locationChangeEventDef;
    if (evt) {
        return evt.getDescriptor().getQualifiedName();
    }
    return "markup://aura:locationChange";
};

/**
 * @export
 */
InteropComponentDef.prototype.getLayouts = function() {
    return this.layouts;
};

/**
 * Returns the component locator definition
 *
 * @returns {Object} LocatorDef Object
 * @export
 */
InteropComponentDef.prototype.getLocatorDefs = function() {
    return this.locatorDefs;
};

/**
 * @private
 */
InteropComponentDef.prototype.initSuperDef = function(config) {
    if (config) {
        var sDef = $A.componentService.createComponentDef(config);
        $A.assert(sDef, "Super def undefined for " + this.descriptor + " value = " + config["descriptor"]);
        return sDef;
    }

    return null;
};

/**
 * Setup the style defs details.
 *
 * Note that the style defs are in reverse order so that they get applied in
 * forward order.
 *
 * @private
 */
InteropComponentDef.prototype.initStyleDefs = function() {
    this.allStyleDefs = [];
    this.allFlavoredStyleDefs = [];

    var s = this.superDef;
    if (s) {
        var superStyles = s.getAllStyleDefs();
        if (superStyles) {
            this.allStyleDefs = this.allStyleDefs.concat(superStyles);
        }
        var superFlavoredStyles = s.getAllFlavoredStyleDefs();
        if (superFlavoredStyles) {
            this.allFlavoredStyleDefs = this.allFlavoredStyleDefs.concat(superFlavoredStyles);
        }
    }
    if (this.styleDef) {
        this.allStyleDefs.push(this.styleDef);
    }
    if (this.flavoredStyleDef) {
        this.allFlavoredStyleDefs.push(this.flavoredStyleDef);
    }
};

Aura.Component.InteropComponentDef = InteropComponentDef;
