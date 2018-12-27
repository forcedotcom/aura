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
 * A registry of Component classes.
 * @constructor
 */
function ComponentClassRegistry () {
    // We delay the creation of the definition of a class till it's requested.
    // The object used to create the component class is a classLiteral object.
    this.classLiterals = {};

    // Collection of all the component classes we generate for
    // proper stack traces and proper use of prototypical inheritance
    this.classConstructors = {};
}

/**
 * By default all components will use Aura.Component.Component as the constructor.
 * This wires up all the features a component might need.
 * Some rootComponents are moving into the framework with custom Component extensions.
 * This map defines the constructor they use in buildConstructor
 */
ComponentClassRegistry.prototype.customConstructorMap = {
    /*eslint-disable no-undef*/
    "aura$text":TextComponent,
    "aura$html":HtmlComponent,
    "aura$expression": ExpressionComponent,
    "aura$if":IfComponent,
    "aura$iteration":IterationComponent,
    "aura$component":BaseComponent
};

/**
 * Detects if the component class exists without actually defining it.
 * @param {String} descriptor The qualified name of the component in the form markup://namespace:component
 */
ComponentClassRegistry.prototype.hasComponentClass = function(descriptor) {
    return descriptor in this.classLiterals || descriptor in this.classConstructors;
};

/**
 * The function that handles definitions of component classes.
 * @param {String} descriptor in the form markup://namespace:component
 * @param {Object} classLiteral The pre-built component literal.
 * @export
 */
ComponentClassRegistry.prototype.addComponentClass = function(descriptor, classLiteral){
    $A.assert($A.util.isString(descriptor), "Component class descriptor is invalid: " + descriptor);
    $A.assert($A.util.isObject(classLiteral), "Component class literal is invalid: " + descriptor);
    if (!this.hasComponentClass(descriptor)) {
        this.classLiterals[descriptor] = classLiteral;
    }
};

/**
 * Get or build the class constructor for the specified component.
 * @param {String} descriptor in the form markup://namespace:component
 * @returns Either the class that defines the component you are requesting, or undefined if not found.
 * @export
 */
ComponentClassRegistry.prototype.getComponentClass = function(descriptor, def) {
    var storedConstructor = this.classConstructors[descriptor];
    if (!storedConstructor) {
        var classLiteral = this.classLiterals[descriptor];
        if (classLiteral) {
            storedConstructor = this.buildComponentClass(classLiteral);
            this.classConstructors[descriptor] = storedConstructor;
            // No need to keep the classLiteral in memory.
            this.classLiterals[descriptor] = null;
        } else if (def && def.interop) {
            return this.buildInteropComponentClass(descriptor, def);
        }
    }

    return storedConstructor;
};

ComponentClassRegistry.prototype.buildInteropComponentClass = function(descriptor, def) {
    var interopClass = Aura.Component.InteropModule;

    if (def.hasElementConstructor()) {
        // module library is object. component is function
        interopClass = Aura.Component.InteropComponent;
    }

    var interopCmpClass = this.buildConstructor({ "interopClass" : def.interopClass, "interopCtor": def.interopCtor }, def.interopClassName, interopClass);
    this.classConstructors[descriptor] = interopCmpClass;
    return interopCmpClass;
};

/**
 * Build the class for the specified component.
 * This process is broken into subroutines for clarity and maintainabiity,
 * and those are all combined into one single scope by the compiler.
 * @param {Object} classLiteral The pre-built component properties.
 * @returns {Function} The component class.
 */
ComponentClassRegistry.prototype.buildComponentClass = function(classLiteral) {

    this.buildInheritance(classLiteral);
    this.buildLibraries(classLiteral);
    var componentConstructor = this.buildConstructor(classLiteral);

    return componentConstructor;
};


/**
 * Augment the component class properties with their respective inheritance. The
 * inner classes are "static" classes. Currently, only the helper is inherited.
 * @param {Object} classLiteral The pre-built component properties.
 */
ComponentClassRegistry.prototype.buildInheritance = function(classLiteral) {

    var superDescriptor = classLiteral["meta"]["extends"];
    var superConstructor = this.getComponentClass(superDescriptor);

    classLiteral["controller"] = classLiteral["controller"] || {};
    var superController = superConstructor && superConstructor.prototype["controller"];

    if (superController) {
        classLiteral["controller"] = Object.assign(
            Object.create(superController),
            classLiteral["controller"]
        );
    }

    classLiteral["helper"] = classLiteral["helper"] || {};
    var superHelper = superConstructor && superConstructor.prototype["helper"];

    if (superHelper) {
        classLiteral["helper"] = Object.assign(
            Object.create(superHelper),
            classLiteral["helper"]
        );
    }
};

/**
 * Augment the component class properties with the component libraries. This method
 * attached the component imports (a.k.a. "libraries") on the properties.
 * @param {Object} classLiteral The pre-built component properties.
 */
ComponentClassRegistry.prototype.buildLibraries = function(classLiteral) {

    var componentImports = classLiteral["meta"]["imports"];
    if (componentImports) {
        var helper = classLiteral["helper"];
        for (var property in componentImports) {
            var descriptor = componentImports[property];
            var library = $A.componentService.getLibrary(descriptor);
            if (!library) {
                try {
                    library = $A.componentService.evaluateModuleDef(descriptor);
                } catch (e) {
                    // ignore module not found
                }
            }
            helper[property] = library;
        }
        classLiteral["helper"] = helper;
    }
};

/**
 * Build the class constructor for the specified component.
 * @param {Object} classLiteral The pre-built component properties.
 * @returns {Function} The component class.
 */

ComponentClassRegistry.prototype.buildConstructor = function(classLiteral, name, Ctor) {
    // Create a named function dynamically to use as a constructor.
    // TODO: Update to the following line when all browsers have support for dynamic function names.
    // (only supported in IE11+).
    // var componentConstructor = function [className](){ Component.apply(this, arguments); };
    var componentConstructor;
    var className = name || classLiteral["meta"]["name"];
    Ctor = Ctor || this.customConstructorMap[className] || Component;

    //#if {"modes" : ["PRODUCTION", "PRODUCTIONDEBUG", "PERFORMANCEDEBUG"]}
    componentConstructor = function(config) {
        Ctor.call(this, config);
    };
    //#end

    //#if {"excludeModes" : ["PRODUCTION", "PRODUCTIONDEBUG", "PERFORMANCEDEBUG"]}
    var createConstructor = $A.util.globalEval("function(Ctor) {return function " + className + "(config) { Ctor.call(this, config); }}");
    componentConstructor = createConstructor(Ctor);
    //#end

    // Extends from Component (and restore constructor).
    componentConstructor.prototype = Object.create(Ctor.prototype);
    componentConstructor.prototype.constructor = componentConstructor;

    // Mixin inner classes (controller, helper, renderer, provider) and meta properties.
    // Some components will already have this defined in their Component class, so don't overwrite if it is already defined.
    var constructorPrototype = componentConstructor.prototype;
    for(var key in classLiteral) {
        if(constructorPrototype[key] === undefined){
            constructorPrototype[key] = classLiteral[key];
        }
    }

    return componentConstructor;
};

Aura.Component.ComponentClassRegistry = ComponentClassRegistry;
