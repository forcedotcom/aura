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
 * @description A registry for libraryDefs.
 * @constructor
 */
function LibraryDefRegistry() {
    this.libraryDefs = {};
}

/**
 * Returns a library from registry
 * @param {String} descriptor name of a library.
 * @returns {Object} library from registry
 */
LibraryDefRegistry.prototype.getDef = function(descriptor) {
    $A.assert(descriptor, "No libraries descriptor specified");
    return this.libraryDefs[descriptor];
};

/**
 * Returns library after creating and adding to the registry.
 * @param {Object} config config of a library.
 * @returns {Object} library from registry
 */
LibraryDefRegistry.prototype.createDef = function(config) {
    $A.assert(config && config["descriptor"], "Library config required for registration");
    var descriptor = config["descriptor"];

    this.libraryDefs[descriptor] = this.libraryDefs[descriptor] || {};
    var registered = this.libraryDefs[descriptor];

    $A.util.forEach(Object.keys(config["includes"]), function(libName) {
        if (!(libName in registered)) {
            config["includes"][libName]($A.util.bind(this.define, this)); // adds to the registry
        }
    }, this);

    return this.libraryDefs[descriptor];
};

LibraryDefRegistry.prototype.define = function(/*var args*/) {
    var args = Array.prototype.slice.call(arguments);
    var identifier = LibraryDefRegistry.parseLocator(args.shift());
    var module = args.pop();
    var imports = $A.util.map(args, function(arg) {
        // Externally located definitions are already fully qualified:
        if (LibraryDefRegistry.isLocator(arg)) {
            return this.require(arg);
        }

        return this.require(identifier.library + ":" + arg);
    }, this);
    this.libraryDefs[identifier.library] = this.libraryDefs[identifier.library] || {};
    this.libraryDefs[identifier.library][identifier.name] = module.apply({}, imports);
};

LibraryDefRegistry.prototype.require = function(locator) {
    var identifier = LibraryDefRegistry.parseLocator(locator);
    if (this.libraryDefs[identifier.library] && Object.prototype.hasOwnProperty.call(this.libraryDefs[identifier.library],identifier.name)) {
        return this.libraryDefs[identifier.library][identifier.name];
    } else {
        throw "Library with locator: " + locator + " is not registered";
    }
};

LibraryDefRegistry.isLocator = function(locator) {
    return (locator.split(":").length === 3);
};

LibraryDefRegistry.parseLocator = function(locator) {
    var tokens = locator.split(":");
    if (tokens.length !== 3) {
        throw "Library locator must be in the form: 'namespace:libraryName:fileName'";
    }
    return {
        library: tokens[0] + ":" + tokens[1],
        name: tokens[2]
    };
};

Aura.Library.LibraryDefRegistry = LibraryDefRegistry;