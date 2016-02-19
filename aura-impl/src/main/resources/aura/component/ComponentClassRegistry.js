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

function ComponentClassRegistry () {
    // We delay the creation of the definition of a class till it's requested.
    // The function that creates the component class is a classConstructorExporter
    this.classConstructorExporter = {};

    // Collection of all the component classes we generate for
    // proper stack traces and proper use of prototypical inheritance
    this.classConstructors = {};
}

/**
 * Load the initial map of class constructors.
 * @param {Object} classConstructorExporter A map of descriptor:exporter. See addComponentClass().
 * @export
 */
ComponentClassRegistry.prototype.initClasses = function(classConstructorExporter){
    if (!this.classConstructorExporter) {
        this.classConstructorExporter = classConstructorExporter;
    }
};

/**
 * Detects of the component class has been already defined without actually defining it.
 * hasComponentClass is more performant that running getComponentClass() since if the class
 * hasn't been built yet, we don't want it to be forcably built if not requested.
 *
 * @param {String} descriptor The qualified name of the component to check in the form prefix:componentname or protocol://prefix:componentname
 */
ComponentClassRegistry.prototype.hasComponentClass = function(descriptor) {
    return !!(descriptor in this.classConstructorExporter || descriptor in this.classConstructors);
};

/**
 * Use the specified constructor as the definition of the class descriptor.
 * We store them for execution later so we do not load definitions into memory unless they are utilized in getComponentClass.
 * @param {String} descriptor Uses the pattern of namespace:componentName.
 * @param {Function} exporter A function that when executed will return the component object litteral.
 * @export
 */
ComponentClassRegistry.prototype.addComponentClass = function(descriptor, exporter){
    if (!this.hasComponentClass(descriptor)) {
        this.classConstructorExporter[descriptor] = exporter;
    }
};

/**
 * Get the class constructor for the specified component.
 * @param {String} descriptor use either the fqn markup://prefix:name or just prefix:name of the component to get a constructor for.
 * @returns Either the class that defines the component you are requesting, or undefined if not found.
 * @export
 */
ComponentClassRegistry.prototype.getComponentClass = function(descriptor) {
    var storedConstructor = this.classConstructors[descriptor];

    if (!storedConstructor) {
        var exporter = this.classConstructorExporter[descriptor];
        if (exporter) {
            var componentProperties = exporter();
            storedConstructor = this.buildComponentClass(componentProperties);
            this.classConstructors[descriptor] = storedConstructor;
            // No need to keep all these extra functions.
            delete this.classConstructorExporter[descriptor];
        }
    }

    return storedConstructor;
};

/**
 * Build the class for the specified component.
 * This process is broken into subroutines for clarity and maintainabiity,
 * and those are all combined into one single scope by the compiler.
 * @param {Object} componentProperties The pre-built component properties.
 * @returns {Function} The component class.
 */
ComponentClassRegistry.prototype.buildComponentClass = function(componentProperties) {

    this.buildInheritance(componentProperties);
    this.buildLibraries(componentProperties);
    var componentConstructor = this.buildConstructor(componentProperties);

    return componentConstructor;
};


/**
 * Augment the component class properties with their respective inheritance. The
 * inner classes are "static" classes, and currenltly, only the helper is inherited.
 * @param {Object} componentProperties The pre-built component properties.
 */
ComponentClassRegistry.prototype.buildInheritance = function(componentProperties) {

    var superDescriptor = componentProperties["meta"]["extends"];
    var superConstructor = this.getComponentClass(superDescriptor);

    // Apply inheritance
    for (var name in {"controller":true, "helper":true}) {

        componentProperties[name] = componentProperties[name] || {};

        // Currently, controller and helper are inherited.
        var superInnerClass = superConstructor && superConstructor.prototype[name];
        if (superInnerClass) {
            // TODO: Update to the following line once all browsers have support for writeable __proto__
            // (requires IE11+, supported elsewhere).
            // componentProperties["controller"]['__proto__'] = superController;
            // componentProperties["helper"]['__proto__'] = superHelper;
            var innerClass = Object.create(superInnerClass);
            var instanceProperties = componentProperties[name];
            if (instanceProperties) {
                for (var property in instanceProperties) {
                    innerClass[property] = instanceProperties[property];
                }
            }
            componentProperties[name] = innerClass;
        }
    }
};

/**
 * Augment the component class properties with the component libraries. This method
 * attached the component imports (a.k.a. "libraries") on the properties.
 * @param {Object} componentProperties The pre-built component properties.
 */
ComponentClassRegistry.prototype.buildLibraries = function(componentProperties) {

    var componentImports = componentProperties["meta"]["imports"];
    if (componentImports) {
        var helper = componentProperties["helper"];
        for (var property in componentImports) {
            helper[property] = $A.componentService.getLibraryDef(componentImports[property]);
        }
        componentProperties["helper"] = helper;
    }
};

/**
 * Build the class constructor for the specified component.
 * @param {Object} componentProperties The pre-built component properties.
 * @returns {Function} The component class.
 */
ComponentClassRegistry.prototype.buildConstructor = function(componentProperties) {

    // Create a named function dynamically to use as a constructor.
    // TODO: Update to the following line when all browsers have support for dynamic function names.
    // (only supported in IE11+).
    // var componentConstructor = function [className](){ Component.apply(this, arguments); };

    //#if {"modes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
    var componentConstructor = function() {
        Component.apply(this, arguments);
    };
    //#end

    //#if {"excludeModes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
    var className = componentProperties["meta"]["name"];

    /*eslint-disable no-redeclare*/
    var componentConstructor = $A.util.globalEval("(function " + className + "() { Component.apply(this, arguments); });", {
        "Component": Component
    });
    /*eslint-enable no-redeclare*/
    //#end

    // Extends from Component (and restore constructor).
    componentConstructor.prototype = Object.create(Component.prototype);
    componentConstructor.prototype.constructor = componentConstructor;

    // Mixin inner classes (controller, helper, renderer, provider) and meta properties.
    for (var property in componentProperties) {
        if (componentProperties.hasOwnProperty(property)) {
            componentConstructor.prototype[property] = componentProperties[property];
        }
    }

    return componentConstructor;
};

Aura.Component.ComponentClassRegistry = ComponentClassRegistry;
